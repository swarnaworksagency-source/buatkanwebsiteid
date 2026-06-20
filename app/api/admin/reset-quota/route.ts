import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/auth';
import { adminClient } from '@/lib/ip';

// Reset token generate harian seorang user: hapus generate_logs hari ini
// sehingga kuota kembali penuh. Hanya admin.
const schema = z.object({ userId: z.string().uuid() });

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'userId tidak valid.' }, { status: 400 });
  }
  const { userId } = parsed.data;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { error, count } = await adminClient()
    .from('generate_logs')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, deleted: count ?? 0 });
}
