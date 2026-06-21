import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { adminClient } from '@/lib/ip';
import { websiteIdSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const parsed = websiteIdSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'websiteId tidak valid.' }, { status: 400 });
    }
    const { websiteId } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Service role untuk bypass FK/RLS saat hard-delete (payment di-detach dulu di bawah).
    const adminSupabase = adminClient();

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

    // 1. Soft-delete payment terkait: data transaksi DISIMPAN untuk audit/sengketa,
    //    tapi FK dilepas (website_id = null) supaya hard-delete website di bawah
    //    tidak kena error 409 Conflict Foreign Key.
    await adminSupabase
      .from('payments')
      .update({ deleted_at: new Date().toISOString(), website_id: null })
      .eq('website_id', websiteId);

    // 2. Hapus website
    const { error: deleteError } = await adminSupabase
      .from('websites')
      .delete()
      .eq('id', websiteId);

    if (deleteError) {
      console.error('Website delete error:', deleteError);
      return NextResponse.json({ error: 'Gagal menghapus website.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Website delete error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
