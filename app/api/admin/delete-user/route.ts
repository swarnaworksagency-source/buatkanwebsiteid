import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi, ADMIN_EMAILS } from '@/lib/auth';
import { adminClient } from '@/lib/ip';

// Hapus user terdaftar + semua datanya (website, payment, generate_logs).
// Hanya admin. Tidak bisa menghapus diri sendiri atau sesama admin.
const schema = z.object({ userId: z.string().uuid() });

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'userId tidak valid.' }, { status: 400 });
  }
  const { userId } = parsed.data;

  if (userId === auth.user.id) {
    return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri.' }, { status: 400 });
  }

  const admin = adminClient();

  // Pastikan target bukan admin lain (cegah hapus admin via email allowlist).
  const { data: target, error: getErr } = await admin.auth.admin.getUserById(userId);
  if (getErr || !target.user) {
    return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
  }
  const targetEmail = target.user.email?.toLowerCase();
  if (
    target.user.app_metadata?.role === 'admin' ||
    (targetEmail && ADMIN_EMAILS.includes(targetEmail))
  ) {
    return NextResponse.json({ error: 'Tidak bisa menghapus user admin.' }, { status: 403 });
  }

  // Hapus data dependen dulu (hindari error FK saat deleteUser).
  // Payments disimpan untuk audit tapi dilepas dari user/website.
  await admin.from('payments').update({ website_id: null }).eq('user_id', userId);
  await admin.from('websites').delete().eq('user_id', userId);
  await admin.from('generate_logs').delete().eq('user_id', userId);

  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
