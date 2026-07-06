import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Bandingkan signature secara constant-time (cegah timing attack pada compare string).
function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

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

    if (typeof signature !== 'string' || !timingSafeEqualStr(calculatedSignature, signature)) {
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

      // Ambil payment dulu untuk cross-check nominal + idempotensi.
      const { data: existing, error: fetchError } = await supabase
        .from('payments')
        .select('id, website_id, harga, status, months')
        .eq('order_id', merchantOrderId)
        .is('deleted_at', null)
        .single();

      if (fetchError || !existing) {
        // Order tak dikenal / sudah dihapus. Akui (200) supaya Duitku berhenti retry.
        console.error('Payment not found for order:', merchantOrderId, fetchError?.message);
        return NextResponse.json({ status: 'ignored' }, { status: 200 });
      }

      // Cross-check nominal: amount callback HARUS sama dengan harga tersimpan.
      // (Signature sudah mengikat amount; ini lapis kedua terhadap data DB kita.)
      const expectedAmount = Number(existing.harga);
      const paidAmount = Math.round(Number(amount));
      if (!Number.isFinite(paidAmount) || paidAmount !== expectedAmount) {
        console.error(`Amount mismatch order ${merchantOrderId}: callback=${amount} expected=${expectedAmount}`);
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      // Perpanjangan (months terisi) MENAMBAH expires_at secara relatif, jadi callback
      // duplikat TIDAK boleh diproses dua kali — beda dengan aktivasi yang absolut.
      if (existing.months && existing.status === 'paid') {
        return NextResponse.json({ status: 'already processed' }, { status: 200 });
      }

      // Catatan (aktivasi): tidak ada early-return idempotensi di sini. Kalau payment sudah
      // paid tapi aktivasi website sempat gagal (500 + retry Duitku), proses ulang penuh perlu
      // supaya website tetap teraktivasi. expires_at dihitung absolut (now+1thn), jadi
      // callback duplikat aman (tidak menumpuk).
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
        // Return 500 supaya Duitku retry callback (jangan kehilangan aktivasi)
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
      }

      if (payment) {
        let expiresAt: Date;
        if (payment.months) {
          // Perpanjangan: tambah N bulan dari expires_at yang tersisa (perpanjang di muka),
          // atau dari sekarang kalau sudah lewat/expired (reaktivasi).
          const { data: site } = await supabase
            .from('websites')
            .select('expires_at')
            .eq('id', payment.website_id)
            .single();
          const now = new Date();
          const currentExpiry = site?.expires_at ? new Date(site.expires_at) : now;
          expiresAt = currentExpiry > now ? new Date(currentExpiry) : now;
          expiresAt.setMonth(expiresAt.getMonth() + Number(payment.months));
        } else {
          // Aktivasi pertama: masa aktif 1 bulan. Setelah itu user perpanjang Rp50rb/bulan.
          expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Update website status to active + set expires_at
        const { error: websiteError } = await supabase
          .from('websites')
          .update({ status: 'active', expires_at: expiresAt.toISOString() })
          .eq('id', payment.website_id);

        if (websiteError) {
          console.error('Failed to activate website:', websiteError);
          // Return 500 supaya Duitku retry — pembayaran sudah paid tapi website belum aktif
          return NextResponse.json({ error: 'Failed to activate website' }, { status: 500 });
        }

        console.log(
          `Payment successful, website ${payment.months ? `extended ${payment.months} mo` : 'activated'} for order: ${merchantOrderId}`
        );
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

