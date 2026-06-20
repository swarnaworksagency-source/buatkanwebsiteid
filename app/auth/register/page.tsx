'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
})

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak sama')
            return
        }
        if (password.length < 6) {
            setError('Password minimal 6 karakter')
            return
        }

        setLoading(true)
        // Lewat server route /api/auth/register supaya bisa cek IP ban + rate-limit
        // pembuatan akun per IP (registrasi langsung ke Supabase tak bisa dibatasi per IP).
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data?.error || 'Gagal membuat akun. Coba lagi.')
                setLoading(false)
                return
            }
            setSuccess(true)
        } catch {
            setError('Gagal terhubung ke server. Coba lagi.')
        }
        setLoading(false)
    }

    const getRedirectUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/auth/callback`
        }
        return `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }

    const handleGoogleRegister = async () => {
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
        if (error) { setError('Gagal daftar dengan Google.'); setGoogleLoading(false) }
    }

    if (success) {
        return (
            <div className={`min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5 ${jakarta.className}`}>
                <div className="text-center max-w-md bg-[#0f1115] border border-zinc-800/80 rounded-[24px] shadow-2xl shadow-black/60 p-10">
                    <div className="w-16 h-16 bg-[#67BAF4]/15 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Mail className="w-7 h-7 text-[#67BAF4]" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mb-3">Cek Email Kamu</h2>
                    <p className="text-zinc-400 text-[14px] leading-relaxed mb-6">
                        Kami telah mengirim link konfirmasi ke <span className="text-white font-medium">{email}</span>. Klik link tersebut untuk mengaktifkan akun.
                    </p>
                    <Link href="/auth/login" className="text-[#67BAF4] hover:text-[#89cff0] font-semibold text-[14px] transition-colors">
                        Kembali ke halaman masuk
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-[#0a0a0a] flex items-center justify-center p-3 sm:p-8 ${jakarta.className}`}>
            <div className="relative w-full max-w-[1000px] bg-[#0f1115] border border-zinc-800/80 rounded-[24px] shadow-2xl shadow-black/60 p-3 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">

                {/* LEFT: inset mesh gradient panel */}
                <div className="flex md:col-span-5 relative rounded-2xl p-5 md:p-8 flex-col justify-between min-h-[96px] md:min-h-[620px] overflow-hidden mesh-panel">
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
                        <p className="text-white/80 text-sm font-medium mb-2">Kamu bisa dengan mudah</p>
                        <h2 className="text-white text-3xl font-bold leading-tight tracking-tight">
                            Punya website bisnis profesional tanpa coding, semua dalam satu tempat.
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
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Buat Akun Baru</h1>
                        <p className="text-zinc-400 text-[14px] mt-2 leading-relaxed">Daftar gratis dan mulai buat website bisnismu dalam hitungan menit.</p>
                    </div>

                    {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] text-center">{error}</div>}

                    <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-semibold mb-1.5">Nama Lengkap</label>
                            <input id="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                                placeholder="Adam Ardiansyah" required
                                className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 px-4 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-2 focus:ring-[#67BAF4]/20 transition-all" />
                        </div>
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-semibold mb-1.5">Email</label>
                            <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@contoh.com" required
                                className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 px-4 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-2 focus:ring-[#67BAF4]/20 transition-all" />
                        </div>
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-semibold mb-1.5">Password</label>
                            <div className="relative">
                                <input id="register-password" type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" required
                                    className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 pl-4 pr-12 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-2 focus:ring-[#67BAF4]/20 transition-all" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-semibold mb-1.5">Konfirmasi Password</label>
                            <input id="register-confirm" type="password" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password" required
                                className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 px-4 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-2 focus:ring-[#67BAF4]/20 transition-all" />
                        </div>
                        <button id="register-submit" type="submit" disabled={loading}
                            className="w-full bg-gradient-to-b from-[#255580] to-[#1E466B] hover:from-[#2c6596] hover:to-[#255580] text-white font-bold text-[14px] py-3 px-4 rounded-xl transition-all duration-200 border border-white/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</span> : 'Daftar Gratis'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-4 sm:my-6">
                        <div className="flex-1 h-px bg-zinc-800" />
                        <span className="text-zinc-500 text-[12px] font-medium">atau lanjutkan dengan</span>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>

                    <button type="button" onClick={handleGoogleRegister} disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-800 font-semibold text-[14px] py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                        {googleLoading ? <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" /> : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Daftar dengan Google
                    </button>

                    <p className="text-center text-zinc-500 text-[13px] mt-5 sm:mt-7">
                        Sudah punya akun?{' '}
                        <Link href="/auth/login" className="text-[#67BAF4] hover:text-[#89cff0] font-semibold transition-colors">Masuk</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
