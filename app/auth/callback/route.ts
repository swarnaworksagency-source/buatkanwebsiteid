import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getClientIp, getActiveBan } from '@/lib/ip'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    // Origin dari header forwarded (Caddy/Vercel), bukan request.url —
    // saat self-host, request.url berbasis alamat bind server (localhost:3000),
    // sehingga redirect hasil login mengarah ke localhost.
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'www.buatkanweb.id'
    const proto = request.headers.get('x-forwarded-proto') ?? 'https'
    const origin = `${proto}://${host}`
    const code = searchParams.get('code')

    // next: hanya path relatif (cegah open redirect). Default /dashboard.
    const nextParam = searchParams.get('next')
    const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
        ? nextParam
        : '/dashboard'

    // IP ban — blokir login/daftar via Google dari jaringan terblokir.
    if (await getActiveBan(getClientIp(request))) {
        return NextResponse.redirect(`${origin}/auth/login?error=ip_banned`)
    }

    if (code) {
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
                            // cookies can only be set in Server Actions or Route Handlers
                        }
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Gunakan origin dari request — otomatis
            // localhost saat dev, production saat live
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
