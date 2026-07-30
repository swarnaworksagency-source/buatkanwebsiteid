import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { adminClient } from '@/lib/ip';
import { validateSubdomain } from '@/lib/subdomain';

const createSchema = z.object({
  websiteId: z.uuid(),
  subdomain: z.string().min(1).max(40),
});

export async function POST(request: Request) {
  try {
    const parsed = createSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
    }
    const { websiteId } = parsed.data;

    // Validasi subdomain authoritative (jangan percaya client).
    const sub = validateSubdomain(parsed.data.subdomain);
    if (!sub.ok) return NextResponse.json({ error: sub.message }, { status: 400 });
    const subdomain = sub.value;

    const supabase = await createServerSupabaseClient();
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
      return NextResponse.json({ error: 'Website tidak ditemukan.' }, { status: 404 });
    }

    // Simpan subdomain server-side (cek unik dulu). Pakai service role supaya RLS bisa
    // dikunci melarang client menulis kolom subdomain langsung (anti-bypass).
    const admin = adminClient();
    const { data: taken } = await admin
      .from('websites')
      .select('id')
      .eq('subdomain', subdomain)
      .neq('id', websiteId)
      .limit(1)
      .maybeSingle();
    if (taken) {
      return NextResponse.json({ error: 'Subdomain ini sudah digunakan.' }, { status: 409 });
    }
    const { error: subErr } = await admin.from('websites').update({ subdomain }).eq('id', websiteId);
    if (subErr) {
      console.error('Save subdomain error:', subErr);
      return NextResponse.json({ error: 'Gagal menyimpan subdomain.' }, { status: 500 });
    }

    // Cek apakah user termasuk early adopter.
    // WAJIB service role: RLS `websites` membatasi user hanya melihat barisnya sendiri,
    // jadi hitungan lewat sesi user akan selalu ~0 dan semua orang dapat harga early adopter.
    const { count, error: countError } = await admin
      .from('websites')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) {
      console.error('Early adopter count error:', countError);
      return NextResponse.json({ error: 'Gagal memproses pembayaran. Coba lagi.' }, { status: 500 });
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
        ? 'Aktivasi Subdomain BuatkanWeb.id - Early Adopter (Bulan Pertama)'
        : 'Aktivasi Subdomain BuatkanWeb.id (Bulan Pertama)',
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
      return NextResponse.json({ error: 'Gagal membuat invoice pembayaran. Coba lagi.' }, { status: 400 });
    }

    // Simpan ke tabel payments
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        website_id: websiteId,
        order_id: orderId,
        paket: isEarlyAdopter ? 'Aktivasi (Early Adopter)' : 'Aktivasi Subdomain',
        harga: harga,
        status: 'pending',
        midtrans_status: 'pending', // tetap pakai kolom ini atau kita asumsikan sebagai duitku_status sementara
      });

    if (insertError) {
      console.error('Payment insert error:', insertError);
      return NextResponse.json({ error: 'Gagal menyimpan data pembayaran. Coba lagi.' }, { status: 500 });
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
    return NextResponse.json({ error: 'Terjadi kesalahan server. Coba lagi.' }, { status: 500 });
  }
}

