import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const hostnameFull = request.headers.get('host') || ''
    const hostname = hostnameFull.split(':')[0] // remove port for accurate matching
    const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'buatkanweb.id'

    // ─── Subdomain Detection ───
    // Determine if this request is for the main domain or a subdomain
    const isMainDomain =
        hostname === mainDomain ||
        hostname === `www.${mainDomain}` ||
        hostname.includes('localhost') ||
        hostname.includes('127.0.0.1') ||
        hostname.includes('vercel.app')

    console.log('hostname:', hostname)
    console.log('isMainDomain:', isMainDomain)

    if (!isMainDomain && hostname.endsWith(`.${mainDomain}`)) {
        // Extract subdomain (e.g., "swarnaworks" from "swarnaworks.buatkanweb.id")
        const subdomain = hostname.replace(`.${mainDomain}`, '')
        console.log('subdomain detected:', subdomain)

        if (subdomain) {
            // Rewrite to internal /s/[subdomain] route using native URL object
            const path = request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname
            return NextResponse.rewrite(new URL(`/s/${subdomain}${path}`, request.url))
        }
    }

    // ─── Main Domain: Supabase Auth Session Refresh ───
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session - important for Server Components
    await supabase.auth.getUser()

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api/ routes
         * 2. /_next/ (Next.js internals)
         * 3. /_static (inside /public)
         * 4. /_vercel (Vercel internals)
         * 5. all files with extensions (e.g. .ico, .png, .txt)
         */
        '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
    ],
}
