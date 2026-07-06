import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { adminClient } from '@/lib/ip';

// Statistik bisnis ringkas untuk panel admin: website per status, jumlah user,
// generate (hari ini + total), dan pendapatan dari payments berstatus paid.
// Hanya admin. Proxy TIDAK menjaga /api, jadi requireAdminApi() wajib dipanggil.
export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const admin = adminClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [sitesRes, usersRes, genTodayRes, genTotalRes, paymentsRes] = await Promise.all([
    admin.from('websites').select('id, subdomain, nama_usaha, user_id, status, expires_at'),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin
      .from('generate_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString()),
    admin.from('generate_logs').select('*', { count: 'exact', head: true }),
    admin.from('payments').select('website_id, harga, status, paid_at'),
  ]);

  interface SiteRow {
    id: string;
    subdomain: string | null;
    nama_usaha: string | null;
    user_id: string;
    status: string;
    expires_at: string | null;
  }
  interface PaymentRow {
    website_id: string | null;
    harga: number | string;
    status: string;
    paid_at: string | null;
  }

  const websites = { total: 0, active: 0, draft: 0, preview: 0, expired: 0 };
  for (const row of (sitesRes.data ?? []) as SiteRow[]) {
    websites.total += 1;
    if (row.status in websites) websites[row.status as keyof typeof websites] += 1;
  }

  let paidCount = 0;
  let revenue = 0;
  const paidByWebsite = new Map<string, { harga: number; paidAt: string | null }>();
  for (const p of (paymentsRes.data ?? []) as PaymentRow[]) {
    if (p.status !== 'paid') continue;
    paidCount += 1;
    revenue += Number(p.harga) || 0;
    if (p.website_id) {
      paidByWebsite.set(p.website_id, { harga: Number(p.harga) || 0, paidAt: p.paid_at });
    }
  }

  // Peta user untuk melampirkan nama + email di daftar website aktif.
  const userById = new Map<string, { email: string; name: string }>();
  if (!usersRes.error) {
    for (const u of usersRes.data.users) {
      userById.set(u.id, {
        email: u.email ?? '',
        name: u.user_metadata?.full_name || u.user_metadata?.name || '',
      });
    }
  }

  // Daftar website berstatus active + info pembayarannya (paid_at = tanggal aktif).
  const activeSites = ((sitesRes.data ?? []) as SiteRow[])
    .filter((s) => s.status === 'active')
    .map((s) => {
      const paid = paidByWebsite.get(s.id);
      const user = userById.get(s.user_id);
      return {
        id: s.id,
        subdomain: s.subdomain,
        namaUsaha: s.nama_usaha,
        userEmail: user?.email ?? '',
        userName: user?.name ?? '',
        harga: paid?.harga ?? null,
        activeAt: paid?.paidAt ?? null,
        expiresAt: s.expires_at,
      };
    })
    .sort((a, b) => ((a.activeAt ?? '') < (b.activeAt ?? '') ? 1 : -1));

  return NextResponse.json({
    websites,
    users: usersRes.error ? null : usersRes.data.users.length,
    generate: {
      today: genTodayRes.count ?? 0,
      total: genTotalRes.count ?? 0,
    },
    payments: { paidCount, revenue },
    activeSites,
  });
}
