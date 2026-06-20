import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { adminClient } from '@/lib/ip';

// Daftar semua user terdaftar + statistik (generate hari ini, total website).
// Hanya admin. Proxy TIDAK menjaga /api, jadi requireAdminApi() wajib dipanggil.
export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const admin = adminClient();

  // Ambil semua user (auth.users). Service-role wajib untuk auth.admin.*
  const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Hitung generate hari ini per user (1 query, agregasi di JS).
  const { data: logs } = await admin
    .from('generate_logs')
    .select('user_id')
    .gte('created_at', startOfDay.toISOString());

  const generatedTodayByUser = new Map<string, number>();
  for (const row of logs ?? []) {
    const uid = (row as { user_id: string }).user_id;
    generatedTodayByUser.set(uid, (generatedTodayByUser.get(uid) ?? 0) + 1);
  }

  // Hitung total website per user.
  const { data: sites } = await admin.from('websites').select('user_id, status');
  const websitesByUser = new Map<string, { total: number; active: number }>();
  for (const row of sites ?? []) {
    const r = row as { user_id: string; status: string };
    const cur = websitesByUser.get(r.user_id) ?? { total: 0, active: 0 };
    cur.total += 1;
    if (r.status === 'active') cur.active += 1;
    websitesByUser.set(r.user_id, cur);
  }

  const users = usersData.users.map((u) => ({
    id: u.id,
    email: u.email ?? '',
    name: u.user_metadata?.full_name || u.user_metadata?.name || '',
    createdAt: u.created_at,
    lastSignInAt: u.last_sign_in_at ?? null,
    role: u.app_metadata?.role ?? null,
    generatedToday: generatedTodayByUser.get(u.id) ?? 0,
    totalWebsites: websitesByUser.get(u.id)?.total ?? 0,
    activeWebsites: websitesByUser.get(u.id)?.active ?? 0,
  }));

  // Urutkan terbaru dulu.
  users.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ users });
}
