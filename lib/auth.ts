import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Role disimpan di Supabase app_metadata (auth.users.raw_app_meta_data).
// PENTING: app_metadata TIDAK bisa diubah user sendiri (beda dgn user_metadata),
// jadi aman dipakai untuk otorisasi. Selalu baca lewat getUser() (validasi ke server),
// JANGAN getSession() (JWT bisa basi setelah role diubah).
export const ADMIN_ROLE = 'admin';

export function isAdmin(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === ADMIN_ROLE;
}

/**
 * Untuk Server Component / Server Action.
 * Redirect kalau belum login atau bukan admin. Kembalikan user kalau admin.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');
  if (!isAdmin(user)) redirect('/dashboard');

  return user;
}

/**
 * Untuk Route Handler (/api/*). Proxy (proxy.ts) TIDAK menjaga /api, jadi endpoint
 * admin WAJIB panggil ini sendiri.
 * Pakai: const auth = await requireAdminApi(); if ('error' in auth) return auth.error;
 */
export async function requireAdminApi(): Promise<{ user: User } | { error: NextResponse }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!isAdmin(user)) {
    return { error: NextResponse.json({ error: 'Forbidden: butuh akses admin.' }, { status: 403 }) };
  }
  return { user };
}
