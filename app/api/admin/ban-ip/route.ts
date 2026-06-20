import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/auth';
import { adminClient } from '@/lib/ip';

// Endpoint admin untuk kelola IP ban. Middleware/proxy TIDAK menjaga /api,
// jadi requireAdminApi() wajib dipanggil sendiri di tiap method.

const banSchema = z.object({
  ip: z.string().min(3).max(64),
  reason: z.string().max(200).optional(),
  expiresAt: z.string().datetime().optional(), // omit = permanen
});

// List semua ban
export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;
  const { data, error } = await adminClient()
    .from('banned_ips')
    .select('*')
    .order('banned_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bans: data });
}

// Tambah / perbarui ban
export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;
  const parsed = banSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Input tidak valid.' }, { status: 400 });
  }
  const { ip, reason, expiresAt } = parsed.data;
  const { error } = await adminClient()
    .from('banned_ips')
    .upsert({ ip, reason: reason ?? null, expires_at: expiresAt ?? null }, { onConflict: 'ip' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// Cabut ban: /api/admin/ban-ip?ip=1.2.3.4
export async function DELETE(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;
  const ip = new URL(request.url).searchParams.get('ip');
  if (!ip) return NextResponse.json({ error: 'Parameter ip wajib.' }, { status: 400 });
  const { error } = await adminClient().from('banned_ips').delete().eq('ip', ip);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
