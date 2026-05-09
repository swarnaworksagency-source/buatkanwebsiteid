'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'

function LoginContent() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const nextUrl = searchParams.get('next') || '/dashboard'
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message === 'Invalid login credentials' ? 'Email atau password salah' : error.message)
            setLoading(false)
            return
        }
        router.push(nextUrl)
        router.refresh()
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) { setError('Gagal masuk dengan Google.'); setGoogleLoading(false) }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111827] via-[#0a0a0a] to-[#0a0a0a]" />
                <div className="absolute top-[30%] left-[15%] w-[500px] h-[500px] rounded-full bg-[#1E466B]/15 blur-[150px]" />
                <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-[#67BAF4]/10 blur-[120px]" />
            </div>

            <div className="relative z-10 px-5 sm:px-8 pt-6">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[13px] font-medium group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Kembali
                </Link>
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-12">
                <div className="w-full max-w-[420px]">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                            <img src="/Logo buatkanweb.webp" alt="BuatkanWeb.id" className="w-9 h-9 rounded-lg object-contain" />
                            <span className="font-bold text-lg tracking-tight text-white">BuatkanWeb<span className="text-[#67BAF4]">.id</span></span>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Masuk ke Akun</h1>
                        <p className="text-zinc-400 text-[14px] mt-2">Selamat datang kembali! Masuk untuk melanjutkan.</p>
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

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-zinc-800" />
                        <span className="text-zinc-500 text-[12px] font-medium">atau</span>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>

                    {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] text-center">{error}</div>}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-medium mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@contoh.com" required
                                    className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-1 focus:ring-[#67BAF4]/20 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input id="login-password" type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                                    className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 pl-10 pr-12 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-1 focus:ring-[#67BAF4]/20 transition-all" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button id="login-submit" type="submit" disabled={loading}
                            className="w-full bg-gradient-to-b from-[#255580] to-[#1E466B] hover:from-[#2c6596] hover:to-[#255580] text-white font-bold text-[14px] py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#1E466B]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</span> : 'Masuk'}
                        </button>
                    </form>

                    <p className="text-center text-zinc-500 text-[13px] mt-6">
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
                <div className="text-white">Loading...</div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
