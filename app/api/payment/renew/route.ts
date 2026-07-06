import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Perpanjangan masa aktif website: Rp50.000/bulan, 1-12 bulan sekali bayar.
// Membuat invoice Duitku; webhook (payment.months terisi) yang menambah
// expires_at setelah lunas. Berlaku untuk website active (perpanjang di muka)
// maupun expired (reaktivasi — perpanjangan dihitung dari sekarang).
const HARGA_PER_BULAN = 50000;

const renewSchema = z.object({
  websiteId: z.uuid(),
  months: z.number().int().min(1).max(12),
});

export async function POST(request: Request) {
  try {
    const parsed = renewSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
    }
    const { websiteId, months } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('id, subdomain, status, expires_at')
      .eq('id', websiteId)
      .eq('user_id', user.id)
      .single();

    if (websiteError || !website) {
      return NextResponse.json({ error: 'Website tidak ditemukan.' }, { status: 404 });
    }
    if (website.status !== 'active' && website.status !== 'expired') {
      return NextResponse.json(
        { error: 'Hanya website yang sudah pernah aktif yang bisa diperpanjang.' },
        { status: 400 }
      );
    }
    if (!website.subdomain) {
      return NextResponse.json({ error: 'Website belum punya subdomain.' }, { status: 400 });
    }

    const harga = HARGA_PER_BULAN * months;
    const orderId = `BWR-${websiteId.substring(0, 8)}-${Date.now()}`;

    const merchantCode = process.env.DUITKU_MERCHANT_CODE;
    const apiKey = process.env.DUITKU_API_KEY;
    const isProduction = process.env.DUITKU_ENV === 'production';
    const apiUrl = isProduction
      ? 'https://api-prod.duitku.com/api/merchant/createInvoice'
      : 'https://api-sandbox.duitku.com/api/merchant/createInvoice';

    if (!merchantCode || !apiKey) {
      return NextResponse.json({ error: 'Konfigurasi Duitku belum diset di server.' }, { status: 500 });
    }

    const timestamp = Date.now().toString();
    const signature = crypto
      .createHash('sha256')
      .update(`${merchantCode}${timestamp}${apiKey}`)
      .digest('hex');

    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.buatkanweb.id';

    const payload = {
      paymentAmount: harga,
      merchantOrderId: orderId,
      productDetails: `Perpanjangan Subdomain BuatkanWeb.id - ${months} Bulan (${website.subdomain})`,
      email: user.email,
      customerVaName: user.user_metadata?.full_name || 'User',
      callbackUrl: `${appUrl}/api/payment/webhook`,
      returnUrl: `${appUrl}/payment/result?order_id=${orderId}`,
      expiryPeriod: 1440, // 24 jam
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-duitku-merchantcode': merchantCode,
        'x-duitku-timestamp': timestamp,
        'x-duitku-signature': signature,
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (result.statusCode !== '00') {
      console.error('Duitku API Error (renew):', result);
      return NextResponse.json({ error: 'Gagal membuat invoice pembayaran. Coba lagi.' }, { status: 400 });
    }

    const { error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      website_id: websiteId,
      order_id: orderId,
      paket: `Perpanjangan ${months} Bulan`,
      harga,
      months,
      status: 'pending',
      midtrans_status: 'pending',
    });
    if (insertError) {
      console.error('Renewal payment insert error:', insertError);
      return NextResponse.json({ error: 'Gagal menyimpan data pembayaran. Coba lagi.' }, { status: 500 });
    }

    return NextResponse.json({ paymentUrl: result.paymentUrl, order_id: orderId, harga, months });
  } catch (error) {
    console.error('Payment renew error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server. Coba lagi.' }, { status: 500 });
  }
}
