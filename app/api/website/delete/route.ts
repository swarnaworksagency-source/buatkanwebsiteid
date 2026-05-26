import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { websiteId } = await request.json();
    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gunakan service role untuk bypass RLS constraint dan foreign key (opsional kalau RLS belum sempurna)
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Pastikan website ini milik user yang login
    const { data: website, error: verifyError } = await supabase
      .from('websites')
      .select('id')
      .eq('id', websiteId)
      .eq('user_id', user.id)
      .single();

    if (verifyError || !website) {
      return NextResponse.json({ error: 'Website not found or not owned by user' }, { status: 404 });
    }

    // 1. Hapus payment terkait (untuk mencegah error 409 Conflict Foreign Key)
    await adminSupabase.from('payments').delete().eq('website_id', websiteId);

    // 2. Hapus website
    const { error: deleteError } = await adminSupabase
      .from('websites')
      .delete()
      .eq('id', websiteId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
