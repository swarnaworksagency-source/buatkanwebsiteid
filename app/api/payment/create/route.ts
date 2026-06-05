import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil data website dari database (pastikan milik user ini)
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .eq('user_id', user.id)
      .single();

    if (websiteError || !website) {
      return NextResponse.json({ error: `Website tidak ditemukan: ${websiteError?.message || 'Not Found'}` }, { status: 404 });
    }

    // Cek apakah user termasuk early adopter
    const { count, error: countError } = await supabase
      .from('websites')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) {
      return NextResponse.json({ error: `Gagal cek kuota early adopter: ${countError.message}` }, { status: 500 });
    }

    const activeCount = count || 0;
    const isEarlyAdopter = activeCount < 75;
    const harga = isEarlyAdopter ? 99000 : 199000;

    // Generate order_id unik
    const orderId = `BWI-${websiteId.substring(0, 8)}-${Date.now()}`;

    // Konfigurasi Duitku
    const merchantCode = process.env.DUITKU_MERCHANT_CODE;
    const apiKey = process.env.DUITKU_API_KEY;
    const isProduction = process.env.DUITKU_ENV === 'production';
    const apiUrl = isProduction 
      ? 'https://api-prod.duitku.com/api/merchant/createInvoice'
      : 'https://api-sandbox.duitku.com/api/merchant/createInvoice';

    if (!merchantCode || !apiKey) {
      return NextResponse.json({ error: 'Konfigurasi Duitku belum diset di server.' }, { status: 500 });
    }

    // Buat Signature Duitku (SHA256: merchantCode + timestamp + apiKey)
    const crypto = require('crypto');
    const timestamp = Date.now().toString();
    const signatureStr = `${merchantCode}${timestamp}${apiKey}`;
    const signature = crypto.createHash('sha256').update(signatureStr).digest('hex');

    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.buatkanweb.id';

    const payload = {
      paymentAmount: harga,
      merchantOrderId: orderId,
      productDetails: isEarlyAdopter 
        ? 'Subdomain BuatkanWeb.id - Early Adopter (1 Tahun)'
        : 'Subdomain BuatkanWeb.id (1 Tahun)',
      email: user.email,
      customerVaName: user.user_metadata?.full_name || 'User',
      callbackUrl: `${appUrl}/api/payment/webhook`,
      returnUrl: `${appUrl}/payment/result?order_id=${orderId}`,
      expiryPeriod: 1440 // 24 jam
    };

    // Panggil API Duitku
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-duitku-merchantcode': merchantCode,
        'x-duitku-timestamp': timestamp,
        'x-duitku-signature': signature
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.statusCode !== '00') {
      console.error('Duitku API Error:', result);
      return NextResponse.json({ error: `Duitku error: ${result.statusMessage || JSON.stringify(result)}` }, { status: 400 });
    }

    // Simpan ke tabel payments
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        website_id: websiteId,
        order_id: orderId,
        paket: isEarlyAdopter ? 'Subdomain (Early Adopter)' : 'Subdomain 1 Tahun',
        harga: harga,
        status: 'pending',
        midtrans_status: 'pending', // tetap pakai kolom ini atau kita asumsikan sebagai duitku_status sementara
      });

    if (insertError) {
      console.error('Payment insert error:', insertError);
      return NextResponse.json({ error: `Gagal menyimpan ke tabel payments: ${insertError.message}` }, { status: 500 });
    }

    // Kembalikan paymentUrl dari Duitku
    return NextResponse.json({
      paymentUrl: result.paymentUrl,
      order_id: orderId,
      harga,
      isEarlyAdopter
    });
  } catch (error: any) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: `Server error: ${error.message || 'Unknown'}` }, { status: 500 });
  }
}

