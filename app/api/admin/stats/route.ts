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
    admin.from('websites').select('id, subdomain, nama_usaha, user_id, status, expires_at, created_at'),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin
      .from('generate_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString()),
    admin.from('generate_logs').select('*', { count: 'exact', head: true }),
    admin.from('payments').select('website_id, harga, status, paid_at').is('deleted_at', null),
  ]);

  interface SiteRow {
    id: string;
    subdomain: string | null;
    nama_usaha: string | null;
    user_id: string;
    status: string;
    expires_at: string | null;
    created_at: string | null;
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

  // Akumulasi per website: total semua pembayaran lunas (aktivasi + perpanjangan),
  // jumlah transaksi, dan paid_at paling awal (= tanggal pertama kali aktif).
  let paidCount = 0;
  let revenue = 0;
  const paidByWebsite = new Map<string, { total: number; count: number; firstPaidAt: string | null }>();
  for (const p of (paymentsRes.data ?? []) as PaymentRow[]) {
    if (p.status !== 'paid') continue;
    paidCount += 1;
    revenue += Number(p.harga) || 0;
    if (p.website_id) {
      const cur = paidByWebsite.get(p.website_id) ?? { total: 0, count: 0, firstPaidAt: null };
      cur.total += Number(p.harga) || 0;
      cur.count += 1;
      if (p.paid_at && (!cur.firstPaidAt || p.paid_at < cur.firstPaidAt)) cur.firstPaidAt = p.paid_at;
      paidByWebsite.set(p.website_id, cur);
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

  // Semua website + info pembayaran (paid_at = tanggal aktif) + pemiliknya.
  // UI memfilter per status; default menampilkan yang active.
  const sites = ((sitesRes.data ?? []) as SiteRow[])
    .map((s) => {
      const paid = paidByWebsite.get(s.id);
      const user = userById.get(s.user_id);
      return {
        id: s.id,
        subdomain: s.subdomain,
        namaUsaha: s.nama_usaha,
        status: s.status,
        userEmail: user?.email ?? '',
        userName: user?.name ?? '',
        harga: paid ? paid.total : null,
        payCount: paid?.count ?? 0,
        activeAt: paid?.firstPaidAt ?? null,
        createdAt: s.created_at,
        expiresAt: s.expires_at,
      };
    })
    .sort((a, b) =>
      ((a.activeAt ?? a.createdAt ?? '') < (b.activeAt ?? b.createdAt ?? '') ? 1 : -1)
    );

  return NextResponse.json({
    websites,
    users: usersRes.error ? null : usersRes.data.users.length,
    generate: {
      today: genTodayRes.count ?? 0,
      total: genTotalRes.count ?? 0,
    },
    payments: { paidCount, revenue },
    sites,
  });
}
