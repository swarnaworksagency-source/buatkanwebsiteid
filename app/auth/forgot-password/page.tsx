'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
})

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState('')
    const [token, setToken] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')

    // Langkah 1: kirim kode OTP ke email
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data?.error || 'Gagal mengirim kode. Coba lagi.')
                setLoading(false)
                return
            }
            setInfo('Kode dikirim. Cek email (termasuk folder spam).')
            setStep('code')
        } catch {
            setError('Gagal terhubung ke server. Coba lagi.')
        }
        setLoading(false)
    }

    // Langkah 2: verifikasi kode + set password baru
    const handleReset = async (e: React.FormEvent) => {
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
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: token.trim(), password }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data?.error || 'Gagal mengatur ulang password. Coba lagi.')
                setLoading(false)
                return
            }
            router.push('/auth/login?reset=success')
        } catch {
            setError('Gagal terhubung ke server. Coba lagi.')
            setLoading(false)
        }
    }

    const resendCode = async () => {
        setError('')
        setInfo('')
        try {
            await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            setInfo('Kode baru dikirim. Cek email (termasuk folder spam).')
        } catch {
            setError('Gagal mengirim ulang kode.')
        }
    }

    return (
        <div className={`min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5 ${jakarta.className}`}>
            <div className="w-full max-w-md bg-[#0f1115] border border-zinc-800/80 rounded-[24px] shadow-2xl shadow-black/60 p-7 sm:p-10">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[13px] font-medium group mb-6">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Kembali ke Masuk
                </Link>

                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Lupa Password</h1>
                    <p className="text-zinc-400 text-[14px] mt-2 leading-relaxed">
                        {step === 'email'
                            ? 'Masukkan email akunmu. Kami kirim kode 6 digit untuk mengatur ulang password.'
                            : `Masukkan kode yang dikirim ke ${email} dan password baru.`}
                    </p>
                </div>

                {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] text-center">{error}</div>}
                {info && !error && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] text-center">{info}</div>}

                {step === 'email' ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-semibold mb-1.5">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@contoh.com" required
                                className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 px-4 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-2 focus:ring-[#67BAF4]/20 transition-all" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-gradient-to-b from-[#255580] to-[#1E466B] hover:from-[#2c6596] hover:to-[#255580] text-white font-bold text-[14px] py-3 px-4 rounded-xl transition-all duration-200 border border-white/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengirim...</span> : 'Kirim Kode'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-semibold mb-1.5">Kode Verifikasi</label>
                            <input type="text" inputMode="numeric" value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456" required maxLength={10}
                                className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[18px] tracking-[0.4em] text-center py-3 px-4 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-2 focus:ring-[#67BAF4]/20 transition-all" />
                        </div>
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-semibold mb-1.5">Password Baru</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                                    className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 pl-4 pr-12 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-2 focus:ring-[#67BAF4]/20 transition-all" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-zinc-300 text-[13px] font-semibold mb-1.5">Konfirmasi Password</label>
                            <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required
                                className="w-full bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-600 text-[14px] py-3 px-4 rounded-xl focus:outline-none focus:border-[#67BAF4]/50 focus:ring-2 focus:ring-[#67BAF4]/20 transition-all" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-gradient-to-b from-[#255580] to-[#1E466B] hover:from-[#2c6596] hover:to-[#255580] text-white font-bold text-[14px] py-3 px-4 rounded-xl transition-all duration-200 border border-white/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</span> : 'Simpan Password Baru'}
                        </button>

                        <div className="flex items-center justify-between text-[13px]">
                            <button type="button" onClick={() => { setStep('email'); setError(''); setInfo('') }}
                                className="text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer">
                                Ubah email
                            </button>
                            <button type="button" onClick={resendCode}
                                className="text-[#67BAF4] hover:text-[#89cff0] font-semibold transition-colors cursor-pointer">
                                Kirim ulang kode
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
