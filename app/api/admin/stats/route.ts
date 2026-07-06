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
    admin.from('websites').select('status'),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin
      .from('generate_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString()),
    admin.from('generate_logs').select('*', { count: 'exact', head: true }),
    admin.from('payments').select('harga, status'),
  ]);

  const websites = { total: 0, active: 0, draft: 0, preview: 0, expired: 0 };
  for (const row of sitesRes.data ?? []) {
    const status = (row as { status: string }).status;
    websites.total += 1;
    if (status in websites) websites[status as keyof typeof websites] += 1;
  }

  let paidCount = 0;
  let revenue = 0;
  for (const row of paymentsRes.data ?? []) {
    const p = row as { harga: number | string; status: string };
    if (p.status === 'paid') {
      paidCount += 1;
      revenue += Number(p.harga) || 0;
    }
  }

  return NextResponse.json({
    websites,
    users: usersRes.error ? null : usersRes.data.users.length,
    generate: {
      today: genTodayRes.count ?? 0,
      total: genTotalRes.count ?? 0,
    },
    payments: { paidCount, revenue },
  });
}
