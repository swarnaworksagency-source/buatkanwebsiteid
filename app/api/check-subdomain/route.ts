import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/ip'
import { validateSubdomain } from '@/lib/subdomain'

// Cek ketersediaan subdomain (UX di wizard). Validasi format/reserved authoritative
// ada di lib/subdomain (dipakai juga oleh /api/payment/create & /api/website/deploy).
// Query dijalankan dengan service role, BUKAN sesi user: RLS `websites` hanya
// mengizinkan user membaca barisnya sendiri, jadi cek "sudah dipakai orang lain"
// mustahil lewat sesi user. Yang dikembalikan hanya boolean — tidak ada data bocor.
export async function GET(request: Request) {
    const raw = new URL(request.url).searchParams.get('subdomain')
    if (!raw) {
        return NextResponse.json({ available: false, message: 'Subdomain wajib diisi.' }, { status: 400 })
    }

    const v = validateSubdomain(raw)
    if (!v.ok) {
        return NextResponse.json({ available: false, message: v.message })
    }

    try {
        const supabase = adminClient()
        const { data, error } = await supabase
            .from('websites')
            .select('subdomain')
            .eq('subdomain', v.value)
            .limit(1)
        if (error) throw error

        if (data && data.length > 0) {
            return NextResponse.json({ available: false, message: 'Subdomain ini sudah digunakan.' })
        }
        return NextResponse.json({ available: true, message: 'Subdomain tersedia!' })
    } catch {
        return NextResponse.json({ available: false, message: 'Gagal memeriksa ketersediaan. Coba lagi.' }, { status: 500 })
    }
}
