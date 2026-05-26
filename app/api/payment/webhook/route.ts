import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const notification = await request.json();

    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const signatureKey = notification.signature_key;
    const transactionStatus = notification.transaction_status;

    // Verifikasi signature dari Midtrans
    const hash = crypto
      .createHash('sha512')
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest('hex');

    if (hash !== signatureKey) {
      console.error('Invalid signature for order:', orderId);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Gunakan SUPABASE_SERVICE_ROLE_KEY karena webhook tidak punya user session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      // Update payment to paid
      const { data: payment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          midtrans_status: transactionStatus,
          payment_method: notification.payment_type,
          paid_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update payment:', updateError);
      } else if (payment) {
        // Update website status to active
        const { error: websiteError } = await supabase
          .from('websites')
          .update({ status: 'active' })
          .eq('id', payment.website_id);
          
        if (websiteError) {
          console.error('Failed to activate website:', websiteError);
        } else {
          console.log(`Payment successful and website activated for order: ${orderId}`);
        }
      }
    } else if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
      // Update payment to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          midtrans_status: transactionStatus
        })
        .eq('order_id', orderId);
        
      console.log(`Payment failed/expired for order: ${orderId}`);
    } else if (transactionStatus === 'pending') {
      // Update payment midtrans_status
      await supabase
        .from('payments')
        .update({
          midtrans_status: transactionStatus
        })
        .eq('order_id', orderId);
    }

    // Return 200 OK selalu (Midtrans butuh response 200)
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
