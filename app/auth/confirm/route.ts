import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'
import { getClientIp, getActiveBan } from '@/lib/ip'

// Verifikasi link email (konfirmasi signup, reset password, dll) lewat token_hash,
// BUKAN lewat PKCE code exchange (/auth/callback). PKCE butuh code_verifier yang
// tersimpan sebagai cookie di browser tempat signUp() dipanggil — kalau link diklik
// dari device/browser lain (atau di-prefetch oleh email scanner seperti Gmail/Outlook
// Safe Links), cookie itu tidak ada/sudah tidak cocok dan exchangeCodeForSession gagal.
// verifyOtp(token_hash) tidak punya ketergantungan itu.
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null

    // next: hanya path relatif (cegah open redirect). Default /dashboard.
    const nextParam = searchParams.get('next')
    const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
        ? nextParam
        : '/dashboard'

    if (await getActiveBan(getClientIp(request))) {
        return NextResponse.redirect(`${origin}/auth/login?error=ip_banned`)
    }

    if (token_hash && type) {
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

        const { error } = await supabase.auth.verifyOtp({ type, token_hash })
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
