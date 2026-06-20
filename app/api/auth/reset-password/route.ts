import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getClientIp, getActiveBan, recordStrikeAndMaybeBan } from '@/lib/ip';

const schema = z.object({
  email: z.string().email().max(160),
  token: z.string().min(6).max(10).regex(/^\d+$/, 'Kode harus angka'),
  password: z.string().min(6).max(200),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // 1. IP ban
  if (await getActiveBan(ip)) {
    return NextResponse.json({ error: 'Akses dari jaringan ini diblokir.' }, { status: 403 });
  }

  // 2. Validasi input
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Kode atau password tidak valid.' }, { status: 400 });
  }
  const { email, token, password } = parsed.data;

  // 3. Verifikasi kode OTP recovery (set session sementara lewat cookie)
  const supabase = await createServerSupabaseClient();
  const { error: otpError } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
  if (otpError) {
    // Kode salah/kadaluarsa = 1 strike → auto-ban kalau berulang (anti brute-force OTP).
    const banned = await recordStrikeAndMaybeBan(ip, 'reset');
    if (banned) {
      return NextResponse.json({ error: 'Akses dari jaringan ini diblokir.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Kode salah atau sudah kedaluwarsa.' }, { status: 400 });
  }

  // 4. Set password baru
  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // 5. Keluar dari session recovery — paksa login ulang dengan password baru.
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
