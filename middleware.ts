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
            // Rewrite to internal /s/[subdomain] route
            const url = request.nextUrl.clone()
            const path = request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname
            url.pathname = `/s/${subdomain}${path}`
            return NextResponse.rewrite(url)
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
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (images, etc.)
         * Note: /api routes ARE included so subdomain detection works for all paths
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
