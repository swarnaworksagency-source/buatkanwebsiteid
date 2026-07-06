import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminClient } from '@/lib/ip';
import { buildReminderEmail, sendReminderEmail, type ReminderKind } from '@/lib/renewalEmail';

// Cron masa aktif website — dipanggil crontab VPS tiap jam:
//   curl -H "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/api/cron/expiry
// 1. Website active yang expires_at sudah lewat → status 'expired' + email pemberitahuan.
// 2. Website active dengan sisa ≤7 hari → email pengingat H-7 / H-3 / H-1.
// Anti-duplikat: tabel renewal_reminders unik per (website_id, kind, target_expires_at),
// jadi aman dipanggil berulang; siklus baru dimulai otomatis saat expires_at berubah
// setelah user perpanjang.

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'buatkanweb.id';

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

interface SiteRow {
  id: string;
  subdomain: string | null;
  nama_usaha: string | null;
  user_id: string;
  expires_at: string;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = adminClient();
  const now = new Date();
  const in7d = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
  const summary = { expired: 0, reminders: 0, emailErrors: 0 };

  // Sekali kirim per (website, kind, expires_at) — insert dulu; kalau bentrok
  // unique constraint (23505) berarti sudah pernah, lewati.
  const claimReminder = async (site: SiteRow, kind: ReminderKind): Promise<boolean> => {
    const { error } = await admin.from('renewal_reminders').insert({
      website_id: site.id,
      kind,
      target_expires_at: site.expires_at,
    });
    if (error) {
      if (error.code !== '23505') console.error('renewal_reminders insert error:', error);
      return false;
    }
    return true;
  };

  const emailOwner = async (site: SiteRow, kind: ReminderKind) => {
    const { data: userRes, error } = await admin.auth.admin.getUserById(site.user_id);
    const email = userRes?.user?.email;
    if (error || !email) {
      console.error('Cron expiry: user tanpa email untuk website', site.id);
      summary.emailErrors += 1;
      return;
    }
    const { subject, html } = buildReminderEmail({
      kind,
      domain: `${site.subdomain}.${MAIN_DOMAIN}`,
      namaUsaha: site.nama_usaha,
      expiresAt: new Date(site.expires_at),
    });
    const ok = await sendReminderEmail(email, subject, html);
    if (!ok) summary.emailErrors += 1;
  };

  // ── 1. Turunkan status yang sudah lewat masa aktif ──
  const { data: lapsed } = await admin
    .from('websites')
    .select('id, subdomain, nama_usaha, user_id, expires_at')
    .eq('status', 'active')
    .not('expires_at', 'is', null)
    .lt('expires_at', now.toISOString());

  for (const site of (lapsed ?? []) as SiteRow[]) {
    const { error } = await admin.from('websites').update({ status: 'expired' }).eq('id', site.id);
    if (error) {
      console.error('Cron expiry: gagal set expired', site.id, error);
      continue;
    }
    summary.expired += 1;
    if (site.subdomain && (await claimReminder(site, 'expired'))) {
      await emailOwner(site, 'expired');
    }
  }

  // ── 2. Pengingat H-7 / H-3 / H-1 ──
  const { data: upcoming } = await admin
    .from('websites')
    .select('id, subdomain, nama_usaha, user_id, expires_at')
    .eq('status', 'active')
    .not('expires_at', 'is', null)
    .gte('expires_at', now.toISOString())
    .lte('expires_at', in7d.toISOString());

  for (const site of (upcoming ?? []) as SiteRow[]) {
    if (!site.subdomain) continue;
    const daysLeft = Math.ceil((new Date(site.expires_at).getTime() - now.getTime()) / (24 * 3600 * 1000));
    const kind: ReminderKind = daysLeft <= 1 ? 'h1' : daysLeft <= 3 ? 'h3' : 'h7';
    if (await claimReminder(site, kind)) {
      await emailOwner(site, kind);
      summary.reminders += 1;
    }
  }

  return NextResponse.json({ ok: true, ...summary, checkedAt: now.toISOString() });
}
