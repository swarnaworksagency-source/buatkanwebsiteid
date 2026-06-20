import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getClientIp, getActiveBan } from '@/lib/ip';

const schema = z.object({
  email: z.string().email().max(160),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // IP ban
  if (await getActiveBan(ip)) {
    return NextResponse.json({ error: 'Akses dari jaringan ini diblokir.' }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  // Anti email-enumeration: input invalid pun balas success (jangan bocorkan email mana terdaftar).
  if (!parsed.success) {
    return NextResponse.json({ success: true });
  }
  const { email } = parsed.data;

  // Kirim email recovery. Template Supabase pakai {{ .Token }} → user terima kode 6 digit
  // (bukan link). Kode diverifikasi di /api/auth/reset-password (verifyOtp type 'recovery').
  const supabase = await createServerSupabaseClient();
  // Error sengaja tidak dibocorkan ke klien (hindari enumeration); cukup di-log server.
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    console.error('resetPasswordForEmail error:', error.message);
  }

  return NextResponse.json({ success: true });
}
