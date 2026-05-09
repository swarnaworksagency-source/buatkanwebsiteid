import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const RESERVED_SUBDOMAINS = [
    'www', 'api', 'admin', 'dashboard',
    'app', 'mail', 'smtp', 'ftp', 'blog',
    'dev', 'staging', 'test', 'demo',
    'support', 'help', 'docs', 'status',
    'buat', 'preview', 'auth', 'harga',
    'portofolio', 'tentang', 'beranda', 's'
]

const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')

    if (!subdomain) {
        return NextResponse.json(
            { available: false, message: 'Subdomain wajib diisi.' },
            { status: 400 }
        )
    }

    // Length validation
    if (subdomain.length < 3) {
        return NextResponse.json(
            { available: false, message: 'Minimal 3 karakter.' }
        )
    }

    if (subdomain.length > 30) {
        return NextResponse.json(
            { available: false, message: 'Maksimal 30 karakter.' }
        )
    }

    // Format validation
    if (!SUBDOMAIN_REGEX.test(subdomain)) {
        return NextResponse.json(
            { available: false, message: 'Hanya huruf kecil, angka, dan tanda hubung. Tidak boleh diawali/diakhiri tanda hubung.' }
        )
    }

    // Double hyphen check
    if (subdomain.includes('--')) {
        return NextResponse.json(
            { available: false, message: 'Tidak boleh menggunakan tanda hubung ganda (--).' }
        )
    }

    // Reserved check
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
        return NextResponse.json(
            { available: false, message: `"${subdomain}" adalah subdomain yang sudah dipesan sistem.` }
        )
    }

    // Database availability check
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // ignore in read-only context
                        }
                    },
                },
            }
        )

        const { data, error } = await supabase
            .from('websites')
            .select('subdomain')
            .eq('subdomain', subdomain)
            .limit(1)

        console.log('checking subdomain:', subdomain)
        console.log('result data:', data)
        console.log('error:', error)

        if (error) {
            throw error;
        }

        if (data && data.length > 0) {
            return NextResponse.json(
                { available: false, message: 'Subdomain ini sudah digunakan.' }
            )
        }

        return NextResponse.json(
            { available: true, message: 'Subdomain tersedia!' }
        )
    } catch {
        return NextResponse.json(
            { available: false, message: 'Gagal memeriksa ketersediaan. Coba lagi.' },
            { status: 500 }
        )
    }
}
