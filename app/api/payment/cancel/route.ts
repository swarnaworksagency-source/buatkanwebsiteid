import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { paymentIdSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const parsed = paymentIdSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'paymentId tidak valid.' }, { status: 400 });
    }
    const { paymentId } = parsed.data;

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

    // Gunakan service role untuk bypass RLS
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Pastikan payment ini milik user yang login
    const { data: payment, error: verifyError } = await supabase
      .from('payments')
      .select('id')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single();

    if (verifyError || !payment) {
      return NextResponse.json({ error: 'Payment not found or not owned by user' }, { status: 404 });
    }

    const { error: updateError } = await adminSupabase
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Payment cancel error:', updateError);
      return NextResponse.json({ error: 'Gagal membatalkan pembayaran.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Payment cancel error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
