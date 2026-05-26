import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import midtransClient from 'midtrans-client';

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
      return NextResponse.json({ error: 'Website not found or not owned by user' }, { status: 404 });
    }

    // Cek apakah user termasuk early adopter
    const { count, error: countError } = await supabase
      .from('websites')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) {
      return NextResponse.json({ error: 'Failed to query active websites count' }, { status: 500 });
    }

    const activeCount = count || 0;
    const isEarlyAdopter = activeCount < 75;
    const harga = isEarlyAdopter ? 99000 : 199000;

    // Generate order_id unik
    const orderId = `BWI-${websiteId}-${Date.now()}`;

    // Buat transaksi Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: harga,
      },
      customer_details: {
        first_name: user.user_metadata?.full_name || 'User',
        email: user.email,
      },
      item_details: [
        {
          id: 'subdomain-1tahun',
          price: harga,
          quantity: 1,
          name: isEarlyAdopter 
            ? 'Subdomain BuatkanWeb.id - Early Adopter (1 Tahun)'
            : 'Subdomain BuatkanWeb.id (1 Tahun)',
        }
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.buatkanweb.id'}/dashboard`
      }
    });

    // Simpan ke tabel payments
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        website_id: websiteId,
        order_id: orderId,
        snap_token: transaction.token,
        gross_amount: harga,
        status: 'pending',
        midtrans_status: 'pending',
      });

    if (insertError) {
      console.error('Payment insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save payment record' }, { status: 500 });
    }

    return NextResponse.json({
      snap_token: transaction.token,
      order_id: orderId,
      client_key: process.env.MIDTRANS_CLIENT_KEY,
      harga,
      isEarlyAdopter
    });
  } catch (error: any) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
