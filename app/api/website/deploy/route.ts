import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { adminClient } from '@/lib/ip';
import { validateSubdomain } from '@/lib/subdomain';

// Aktivasi website (status -> active) HARUS lewat server: verifikasi kepemilikan +
// pembayaran paid sebelum mengaktifkan. Jangan pernah set status 'active' dari client
// (bisa di-bypass langsung lewat supabase browser client). RLS sebaiknya juga melarang
// client meng-update kolom status/subdomain/expires_at (hanya service role).
const schema = z.object({
  websiteId: z.uuid(),
  subdomain: z.string().min(1).max(40),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Input tidak valid.' }, { status: 400 });
  }
  const { websiteId } = parsed.data;

  // Validasi subdomain authoritative (format/reserved/panjang).
  const sub = validateSubdomain(parsed.data.subdomain);
  if (!sub.ok) return NextResponse.json({ error: sub.message }, { status: 400 });
  const subdomain = sub.value;

  // Auth: wajib login.
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = adminClient();

  // Kepemilikan website.
  const { data: website, error: wErr } = await admin
    .from('websites')
    .select('id, user_id')
    .eq('id', websiteId)
    .single();
  if (wErr || !website || website.user_id !== user.id) {
    return NextResponse.json({ error: 'Website tidak ditemukan.' }, { status: 404 });
  }

  // WAJIB ada pembayaran paid (authoritative, bukan cek client).
  const { data: paid } = await admin
    .from('payments')
    .select('id')
    .eq('website_id', websiteId)
    .eq('status', 'paid')
    .is('deleted_at', null)
    .maybeSingle();
  if (!paid) {
    return NextResponse.json({ error: 'Belum ada pembayaran yang lunas untuk website ini.' }, { status: 402 });
  }

  // Subdomain belum dipakai website lain.
  const { data: taken } = await admin
    .from('websites')
    .select('id')
    .eq('subdomain', subdomain)
    .neq('id', websiteId)
    .limit(1)
    .maybeSingle();
  if (taken) {
    return NextResponse.json({ error: 'Subdomain ini sudah digunakan.' }, { status: 409 });
  }

  // Aktifkan (set subdomain + status active). expires_at sudah di-set webhook saat paid.
  const { error: updErr } = await admin
    .from('websites')
    .update({ subdomain, status: 'active' })
    .eq('id', websiteId);
  if (updErr) {
    console.error('Deploy activate error:', updErr);
    return NextResponse.json({ error: 'Gagal mengaktifkan website.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, subdomain });
}
