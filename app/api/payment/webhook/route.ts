import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const text = await request.text();
    // Gunakan URLSearchParams jika content-type adalah application/x-www-form-urlencoded
    let notification: any = {};
    if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(text);
      for (const [key, value] of params.entries()) {
        notification[key] = value;
      }
    } else {
      notification = JSON.parse(text);
    }

    const merchantCode = notification.merchantCode;
    const amount = notification.amount;
    const merchantOrderId = notification.merchantOrderId;
    const signature = notification.signature;
    const resultCode = notification.resultCode;
    const reference = notification.reference;

    const apiKey = process.env.DUITKU_API_KEY!;

    // Verifikasi signature dari Duitku: MD5(merchantCode + amount + merchantOrderId + apiKey)
    const signatureStr = `${merchantCode}${amount}${merchantOrderId}${apiKey}`;
    const calculatedSignature = crypto.createHash('md5').update(signatureStr).digest('hex');

    if (calculatedSignature !== signature) {
      console.error('Invalid Duitku signature for order:', merchantOrderId);
      return NextResponse.json({ error: 'Bad Signature' }, { status: 401 });
    }

    // Gunakan SUPABASE_SERVICE_ROLE_KEY karena webhook tidak punya user session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (resultCode === '00') {
      // Pembayaran Sukses
      const { data: payment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          midtrans_status: 'success', // tetapkan 'success' agar frontend bisa baca
          paid_at: new Date().toISOString(),
          snap_token: reference // Kita bisa menyimpan reference transaksi Duitku di kolom snap_token yang tidak terpakai
        })
        .eq('order_id', merchantOrderId)
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
          console.log(`Payment successful and website activated for order: ${merchantOrderId}`);
        }
      }
    } else if (resultCode === '01') {
      // Pembayaran Gagal
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          midtrans_status: 'failed'
        })
        .eq('order_id', merchantOrderId);
        
      console.log(`Payment failed for order: ${merchantOrderId}`);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

