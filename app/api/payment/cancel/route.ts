import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { adminClient } from '@/lib/ip';
import { paymentIdSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const parsed = paymentIdSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'paymentId tidak valid.' }, { status: 400 });
    }
    const { paymentId } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Service role untuk bypass RLS (update payment milik user yang sudah diverifikasi).
    const adminSupabase = adminClient();

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
