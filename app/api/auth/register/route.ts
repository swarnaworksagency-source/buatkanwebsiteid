import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getClientIp, adminClient, getActiveBan, recordStrikeAndMaybeBan } from '@/lib/ip';

// Batas pembuatan akun per IP per jendela waktu (anti-abuse / spam akun).
const SIGNUP_WINDOW_MIN = 60;
const SIGNUP_MAX_PER_WINDOW = 3;

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(160),
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
    return NextResponse.json({ error: 'Data registrasi tidak valid.' }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  // 3. Rate limit per IP (rolling window)
  const admin = adminClient();
  if (ip !== 'unknown') {
    const windowStart = new Date(Date.now() - SIGNUP_WINDOW_MIN * 60_000).toISOString();
    const { count, error: countError } = await admin
      .from('signup_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', windowStart);
    if (countError) {
      console.error('Signup rate-limit check error:', countError);
      return NextResponse.json({ error: 'Gagal memproses registrasi. Coba lagi.' }, { status: 500 });
    }
    if ((count ?? 0) >= SIGNUP_MAX_PER_WINDOW) {
      // Catat strike → auto-ban kalau berulang.
      const banned = await recordStrikeAndMaybeBan(ip, 'register');
      if (banned) {
        return NextResponse.json({ error: 'Akses dari jaringan ini diblokir.' }, { status: 403 });
      }
      return NextResponse.json(
        { error: `Terlalu banyak pembuatan akun dari jaringan ini. Coba lagi dalam ${SIGNUP_WINDOW_MIN} menit.` },
        { status: 429 }
      );
    }
  }

  // 4. Daftar (server-side; tetap memicu email konfirmasi seperti sebelumnya)
  const supabase = await createServerSupabaseClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.buatkanweb.id';
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      // Link verifikasi email harus arah domain produksi, bukan Site URL default (localhost).
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 5. Catat percobaan (untuk rate limit). Best-effort, jangan gagalkan registrasi.
  if (ip !== 'unknown') {
    await admin.from('signup_attempts').insert({ ip, email }).then(() => {}, () => {});
  }

  return NextResponse.json({ success: true });
}
