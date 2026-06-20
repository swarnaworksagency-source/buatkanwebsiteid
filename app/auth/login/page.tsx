'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
})

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const nextUrl = searchParams.get('next') || '/dashboard'
    const supabase = createClient()

    const urlError = searchParams.get('error')
    const initialError = urlError === 'ip_banned' ? 'Akses dari jaringan ini diblokir.'
        : urlError === 'auth_failed' ? 'Gagal masuk. Coba lagi.'
        : ''
    const resetSuccess = searchParams.get('reset') === 'success'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState(initialError)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        // Lewat server route /api/auth/login supaya bisa cek IP ban
        // (login langsung ke Supabase dari browser tak bisa diblokir per IP).
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data?.error || 'Email atau password salah')
                setLoading(false)
                return
            }
        } catch {
            setError('Gagal terhubung ke server. Coba lagi.')
            setLoading(false)
            return
        }
        router.push(nextUrl)
        router.refresh()
    }

    const getRedirectUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/auth/callback`
        }
        return `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getRedirectUrl(),
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            },
        })
        if (error) { setError('Gagal masuk dengan Google.'); setGoogleLoading(false) }
    }

    return (
        <div className={`min-h-screen bg-[#0a0a0a] flex items-center justify-center p-3 sm:p-8 ${jakarta.className}`}>
            <div className="relative w-full max-w-[1000px] bg-[#0f1115] border border-zinc-800/80 rounded-[24px] shadow-2xl shadow-black/60 p-3 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">

                {/* LEFT: inset mesh gradient panel */}
                <div className="flex md:col-span-5 relative rounded-2xl p-5 md:p-8 flex-col justify-between min-h-[96px] md:min-h-[560px] overflow-hidden mesh-panel">
                    <style>{`
                        .mesh-panel {
                            background-color: #0d2438;
                            background-image:
                                radial-gradient(at 18% 22%, #1E466B 0px, transparent 55%),
                                radial-gradient(at 82% 8%, #255580 0px, transparent 50%),
                                radial-gradient(at 12% 85%, #67BAF4 0px, transparent 50%),
                                radial-gradient(at 88% 80%, #123047 0px, transparent 55%),
                                radial-gradient(at 55% 50%, #2c6596 0px, transparent 45%);
                        }
                        .mesh-blob {
                            position: absolute;
                            border-radius: 9999px;
                            filter: blur(52px);
                            mix-blend-mode: screen;
                            will-change: transform;
                        }
                        .mesh-blob-1 { width: 320px; height: 320px; background: #255580; top: -60px; left: -40px; opacity: .7; animation: meshFloat1 14s ease-in-out infinite; }
                        .mesh-blob-2 { width: 280px; height: 280px; background: #67BAF4; bottom: -50px; right: -30px; opacity: .55; animation: meshFloat2 18s ease-in-out infinite; }
                        .mesh-blob-3 { width: 240px; height: 240px; background: #1E466B; top: 40%; left: 30%; opacity: .6; animation: meshFloat3 16s ease-in-out infinite; }
                        @keyframes meshFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,50px) scale(1.15); } }
                        @keyframes meshFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,-40px) scale(1.2); } }
                        @keyframes meshFloat3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-50px) scale(.9); } }
                        @media (prefers-reduced-motion: reduce) { .mesh-blob { animation: none; } }
                    `}</style>
                    <div className="mesh-blob mesh-blob-1" />
                    <div className="mesh-blob mesh-blob-2" />
                    <div className="mesh-blob mesh-blob-3" />

                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-2.5">
                            <img src="/Logo buatkanweb.webp" alt="BuatkanWeb.id" className="w-9 h-9 rounded-lg object-contain" />
                            <span className="font-bold text-lg tracking-tight text-white">BuatkanWeb<span className="text-[#67BAF4]">.id</span></span>
                        </Link>
                    </div>
                    <div className="relative z-10 hidden md:block">
                        <p className="text-white/80 text-sm font-medium mb-2">Senang melihatmu lagi</p>
                        <h2 className="text-white text-xl md:text-3xl font-bold leading-tight tracking-tight">
                            Lanjutkan membangun website bisnismu, semua dalam satu tempat.
                        </h2>
                    </div>
                </div>

                {/* RIGHT: form */}
                <div className="md:col-span-7 flex flex-col justify-center px-2 py-4 sm:px-8 md:px-16 md:py-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[13px] font-medium group mb-4 sm:mb-6">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Kembali
                    </Link>

                    <div className="mb-4 sm:mb-7">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Masuk ke Akun</h1>
                        <p className="text-zinc-400 text-[14px] mt-2 leading-relaxed">Selamat datang kembali! Masuk untuk melanjutkan mengelola website-mu.</p>
                    </div>

                    {resetSuccess && !error && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] text-center">Password berhasil diubah. Silakan masuk dengan password baru.</div>}

                    {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] text-center">{error}</div>}

                    <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4" suppressHydrationWarning>
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-semibold mb-1.5">Email</label>
                            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} suppressHydrationWarning
                                placeholder="email@contoh.com" required
                                className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 px-4 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-2 focus:ring-[#67BAF4]/20 transition-all" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-zinc-300 text-[13px] font-semibold">Password</label>
                                <Link href="/auth/forgot-password" className="text-[12px] text-[#67BAF4] hover:text-[#89cff0] font-semibold transition-colors">Lupa password?</Link>
                            </div>
                            <div className="relative">
                                <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} suppressHydrationWarning
                                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                                    className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 pl-4 pr-12 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-2 focus:ring-[#67BAF4]/20 transition-all" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button id="login-submit" type="submit" disabled={loading}
                            className="w-full bg-gradient-to-b from-[#255580] to-[#1E466B] hover:from-[#2c6596] hover:to-[#255580] text-white font-bold text-[14px] py-3 px-4 rounded-xl transition-all duration-200 border border-white/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</span> : 'Masuk'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-4 sm:my-6">
                        <div className="flex-1 h-px bg-zinc-800" />
                        <span className="text-zinc-500 text-[12px] font-medium">atau lanjutkan dengan</span>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>

                    <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-800 font-semibold text-[14px] py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                        {googleLoading ? <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" /> : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Masuk dengan Google
                    </button>

                    <p className="text-center text-zinc-500 text-[13px] mt-5 sm:mt-7">
                        Belum punya akun?{' '}
                        <Link href="/auth/register" className="text-[#67BAF4] hover:text-[#89cff0] font-semibold transition-colors">Daftar</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="text-zinc-400">Loading...</div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
