import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getClientIp, getActiveBan, recordStrikeAndMaybeBan } from '@/lib/ip';

const schema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(1).max(200),
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
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 400 });
  }
  const { email, password } = parsed.data;

  // 3. Login server-side (set cookie session lewat @supabase/ssr)
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Tiap gagal-login = 1 strike → auto-ban kalau berulang (anti brute-force).
    const banned = await recordStrikeAndMaybeBan(ip, 'login');
    if (banned) {
      return NextResponse.json({ error: 'Akses dari jaringan ini diblokir.' }, { status: 403 });
    }
    const msg = error.message === 'Invalid login credentials' ? 'Email atau password salah' : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
