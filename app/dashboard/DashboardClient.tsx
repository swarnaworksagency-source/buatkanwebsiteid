'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Eye, RefreshCw, Clock, Globe, Trash2, Loader2, Edit2, Check, X, Rocket, ExternalLink, AlertCircle, CheckCircle2, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: object) => void
    }
  }
}

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'buatkanweb.id'

const RESERVED_SUBDOMAINS = [
    'www', 'api', 'admin', 'dashboard',
    'app', 'mail', 'smtp', 'ftp', 'blog',
    'dev', 'staging', 'test', 'demo',
    'support', 'help', 'docs', 'status',
    'buat', 'preview', 'auth', 'harga',
    'portofolio', 'tentang', 'beranda', 's'
]

interface Website {
    id: string
    nama_bisnis: string
    kategori_jasa: string
    status: 'preview' | 'active' | 'expired'
    created_at: string
    expires_at: string | null
    subdomain: string | null
}

interface DashboardClientProps {
    userName: string
    userEmail: string
    userAvatar: string | null
    websites: Website[]
    generatedToday: number
    totalWebsites: number
    activeWebsites: number
}

const MAX_DAILY = 3

function getDaysLeft(expiresAt: string | null): number {
    if (!expiresAt) return 0
    const now = new Date()
    const exp = new Date(expiresAt.replace(' ', 'T'))
    const diff = exp.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'active':
            return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">● Aktif</span>
        case 'preview':
            return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">● Preview</span>
        case 'expired':
            return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">● Expired</span>
        default:
            return null
    }
}

function getCategoryBadge(kategori: string) {
    const colorMap: Record<string, string> = {
        'Servis AC': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        'Fotografer': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'Bengkel': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        'Katering': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        'Cleaning Service': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        'Klinik': 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    const cls = colorMap[kategori] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    return <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}>{kategori}</span>
}

export default function DashboardClient({
    userName,
    userEmail,
    userAvatar,
    websites,
    generatedToday,
    totalWebsites,
    activeWebsites,
}: DashboardClientProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    
    // Rename state
    const [renamingId, setRenamingId] = useState<string | null>(null)
    const [renameValue, setRenameValue] = useState("")
    const [isRenaming, setIsRenaming] = useState(false)
    const supabase = createClient()

    const quotaLeft = MAX_DAILY - generatedToday
    const quotaExhausted = quotaLeft <= 0
    const limitReached = totalWebsites >= 6

    const [deletingWebsite, setDeletingWebsite] = useState<Website | null>(null)
    const [deleteChecked, setDeleteChecked] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Deploy state
    const [deployingWebsite, setDeployingWebsite] = useState<Website | null>(null)
    const [subdomainInput, setSubdomainInput] = useState('')
    const [subdomainError, setSubdomainError] = useState('')
    const [subdomainAvailable, setSubdomainAvailable] = useState(false)
    const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false)
    const [isDeploying, setIsDeploying] = useState(false)
    const [deploySuccess, setDeploySuccess] = useState<{ subdomain: string; url: string } | null>(null)
    const [toast, setToast] = useState('')
    const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Payment State
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [pendingSubdomain, setPendingSubdomain] = useState('')
    const [snapToken, setSnapToken] = useState('')
    const [paymentInfo, setPaymentInfo] = useState<{harga: number, isEarlyAdopter: boolean} | null>(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    const handleDelete = async (websiteId: string) => {
        setIsDeleting(true)
        try {
            const supabase = createClient()
            
            // 1. Ambil data website dulu untuk dapat URL foto
            const { data: website } = await supabase
                .from('websites')
                .select('logo_url, foto_urls, generated_content')
                .eq('id', websiteId)
                .single()
            
            // Kumpulkan semua file path dari Storage
            const storageFiles = []
            if (website?.logo_url) {
                const path = website.logo_url.split('/website-assets/')[1]
                if (path) storageFiles.push(path)
            }
            if (website?.foto_urls?.length > 0) {
                website?.foto_urls?.forEach((url: string) => {
                    const path = url.split('/website-assets/')[1]
                    if (path) storageFiles.push(path)
                })
            }
            const portofolio = website?.generated_content?.portofolio || []
            portofolio.forEach((url: string) => {
                const path = url.split('/website-assets/')[1]
                if (path) storageFiles.push(path)
            })
            
            // Hapus dari Storage jika ada
            if (storageFiles.length > 0) {
                await supabase.storage
                    .from('website-assets')
                    .remove(storageFiles)
            }
            
            // 2. Hapus generate_logs terkait
            await supabase
                .from('generate_logs')
                .delete()
                .eq('website_id', websiteId)
            
            // 3. Hapus website dari database
            await supabase
                .from('websites')
                .delete()
                .eq('id', websiteId)
            
            // 4. Update UI
            setDeletingWebsite(null)
            router.refresh()
            
            setToast("Website berhasil dihapus.")
            setTimeout(() => setToast(""), 3000)
            
        } catch (err) {
            console.error(err)
            setToast("Gagal menghapus. Coba lagi.")
            setTimeout(() => setToast(""), 3000)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRename = async (id: string) => {
        if (!renameValue.trim()) return;
        setIsRenaming(true);
        try {
            const { error } = await supabase.from('websites').update({ nama_usaha: renameValue.trim() }).eq('id', id)
            if (error) throw error;
            setRenamingId(null)
            router.refresh()
        } catch (err) {
            console.error('Failed to rename website', err)
            alert('Gagal mengubah nama website.')
        } finally {
            setIsRenaming(false)
        }
    }

    // ─── Deploy handlers ───
    const validateSubdomainLocal = useCallback((value: string): string => {
        if (!value) return ''
        if (value.length < 3) return 'Minimal 3 karakter.'
        if (value.length > 30) return 'Maksimal 30 karakter.'
        if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) && value.length >= 2) return 'Hanya huruf kecil, angka, dan tanda hubung (-). Tidak boleh diawali/diakhiri tanda hubung.'
        if (value.length < 2 && !/^[a-z0-9]+$/.test(value)) return 'Hanya huruf kecil dan angka.'
        if (value.includes('--')) return 'Tidak boleh menggunakan tanda hubung ganda (--).' 
        if (RESERVED_SUBDOMAINS.includes(value)) return `"${value}" sudah dipesan sistem.`
        return ''
    }, [])

    const checkSubdomainAvailability = useCallback(async (value: string) => {
        if (!value || value.length < 3) return
        const localError = validateSubdomainLocal(value)
        if (localError) {
            setSubdomainError(localError)
            setSubdomainAvailable(false)
            return
        }
        setIsCheckingSubdomain(true)
        try {
            const res = await fetch(`/api/check-subdomain?subdomain=${encodeURIComponent(value)}`)
            const data = await res.json()
            setSubdomainAvailable(data.available)
            setSubdomainError(data.available ? '' : data.message)
        } catch {
            setSubdomainError('Gagal memeriksa ketersediaan.')
            setSubdomainAvailable(false)
        } finally {
            setIsCheckingSubdomain(false)
        }
    }, [validateSubdomainLocal])

    const handleSubdomainChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
        setSubdomainInput(raw)
        setSubdomainAvailable(false)
        setSubdomainError('')
        if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current)
        if (raw.length >= 3) {
            const localErr = validateSubdomainLocal(raw)
            if (localErr) {
                setSubdomainError(localErr)
                return
            }
            checkTimeoutRef.current = setTimeout(() => checkSubdomainAvailability(raw), 500)
        } else if (raw.length > 0) {
            setSubdomainError('Minimal 3 karakter.')
        }
    }, [validateSubdomainLocal, checkSubdomainAvailability])

    const deployWebsite = async (subdomain: string, websiteId: string) => {
        setIsDeploying(true)
        try {
            const { error } = await supabase
                .from('websites')
                .update({ subdomain, status: 'active' })
                .eq('id', websiteId)
            if (error) throw error
            const url = `https://${subdomain}.${MAIN_DOMAIN}`
            setDeploySuccess({ subdomain, url })
            setToast(`Website berhasil di-deploy! Akses di ${subdomain}.${MAIN_DOMAIN}`)
            setTimeout(() => setToast(''), 5000)
            router.refresh()
        } catch (err) {
            console.error('Deploy failed:', err)
            setSubdomainError('Gagal deploy. Coba lagi.')
        } finally {
            setIsDeploying(false)
        }
    }

    const startPayment = async (subdomain: string, websiteId: string) => {
        setPaymentLoading(true)
        try {
            setPendingSubdomain(subdomain)
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ websiteId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create payment')
            
            setSnapToken(data.snap_token)
            setPaymentInfo({ harga: data.harga, isEarlyAdopter: data.isEarlyAdopter })
            setShowPaymentModal(true)
        } catch (err) {
            console.error(err)
            setToast('Gagal memulai pembayaran. Coba lagi.')
            setTimeout(() => setToast(''), 3000)
        } finally {
            setPaymentLoading(false)
        }
    }

    const handleDeploy = async () => {
        if (!deployingWebsite || !subdomainInput || !subdomainAvailable) return
        setIsDeploying(true)
        try {
            const { data: existingPayment } = await supabase
                .from('payments')
                .select('id, status')
                .eq('website_id', deployingWebsite.id)
                .eq('status', 'paid')
                .maybeSingle()
            
            if (existingPayment) {
                await deployWebsite(subdomainInput, deployingWebsite.id)
            } else {
                await startPayment(subdomainInput, deployingWebsite.id)
            }
        } catch (err) {
            console.error('Check payment failed:', err)
            setSubdomainError('Gagal memeriksa pembayaran. Coba lagi.')
        } finally {
            setIsDeploying(false)
        }
    }

    const handleBayarSekarang = () => {
        const script = document.createElement('script')
        script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' 
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js'
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
        document.head.appendChild(script)

        script.onload = () => {
            window.snap.pay(snapToken, {
                onSuccess: async (result: any) => {
                    await deployWebsite(pendingSubdomain, deployingWebsite!.id)
                    setShowPaymentModal(false)
                },
                onPending: (result: any) => {
                    setToast('Pembayaran pending. Website akan aktif setelah konfirmasi.')
                    setShowPaymentModal(false)
                    closeDeployModal()
                },
                onError: (result: any) => {
                    setToast('Pembayaran gagal. Silakan coba lagi.')
                },
                onClose: () => {
                    // User tutup popup tanpa bayar
                }
            })
        }
    }

    const openDeployModal = (site: Website) => {
        setDeployingWebsite(site)
        setSubdomainInput('')
        setSubdomainError('')
        setSubdomainAvailable(false)
        setDeploySuccess(null)
    }

    const closeDeployModal = () => {
        setDeployingWebsite(null)
        setSubdomainInput('')
        setSubdomainError('')
        setSubdomainAvailable(false)
        setDeploySuccess(null)
    }

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const initials = userName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111827]/60 via-[#0a0a0a] to-[#0a0a0a]" />
                <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#1E466B]/8 blur-[150px]" />
                <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[130px]" />
                <div className="absolute top-[50%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#67BAF4]/5 blur-[120px]" />
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>
            {/* ═══ HEADER ═══ */}
            <header className="sticky top-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <img src="/Logo buatkanweb.webp" alt="BuatkanWeb.id" className="w-8 h-8 rounded-lg object-contain transition-transform group-hover:scale-105" />
                            <span className="font-bold text-[15px] tracking-tight text-white">
                                BuatkanWeb<span className="text-[#67BAF4]">.id</span>
                            </span>
                        </Link>
                        <span className="hidden sm:block text-zinc-600 text-[13px]">/</span>
                        <span className="hidden sm:block text-zinc-400 text-[13px] font-medium">Dashboard</span>
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2.5 cursor-pointer rounded-full hover:ring-2 hover:ring-white/10 transition-all p-1"
                        >
                            {userAvatar ? (
                                <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E466B] to-[#67BAF4] flex items-center justify-center text-white text-[12px] font-bold select-none">
                                    {initials}
                                </div>
                            )}
                            <span className="hidden sm:block text-white text-[13px] font-medium max-w-[120px] truncate">{userName}</span>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 top-12 w-56 bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 py-1.5 animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
                                <div className="px-4 py-3 border-b border-zinc-800">
                                    <p className="text-white text-[13px] font-semibold truncate">{userName}</p>
                                    <p className="text-zinc-500 text-[12px] truncate">{userEmail}</p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-zinc-300 hover:text-red-400 hover:bg-white/5 text-[13px] transition-colors w-full text-left cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
                {/* ═══ GREETING ═══ */}
                <div className="mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        Halo, {userName}!
                    </h1>
                    <p className="text-zinc-400 text-[14px] sm:text-[15px] mt-1.5">
                        Siap digitalisasi usahamu hari ini?
                    </p>
                </div>

                {/* ═══ STATS BAR ═══ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8 sm:mb-10">
                    {/* Quota */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#0f1a2e] to-[#162a4a] border border-[#1E466B]/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-[#1E466B]/60 shadow-[0_4px_24px_-4px_rgba(30,70,107,0.15)] hover:shadow-[0_8px_32px_-4px_rgba(30,70,107,0.25)]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#67BAF4]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <span className="text-zinc-400 text-[11px] font-semibold tracking-[0.15em] uppercase block mb-3">Generate Hari Ini</span>
                        <p className="text-white text-3xl font-extrabold tracking-tight mb-2.5">
                            {quotaLeft} <span className="text-zinc-500 text-[13px] font-medium">/ {MAX_DAILY} tersisa</span>
                        </p>
                        <div className="w-full h-1.5 bg-[#0a1020] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${quotaExhausted ? 'bg-red-500' : 'bg-gradient-to-r from-[#1E466B] to-[#67BAF4]'}`}
                                style={{ width: `${(quotaLeft / MAX_DAILY) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Total */}
                    <div className={`relative overflow-hidden bg-gradient-to-br ${limitReached ? 'from-[#2e0f0f] to-[#4a1616] border-red-500/40 hover:border-red-500/60 shadow-[0_4px_24px_-4px_rgba(239,68,68,0.15)] hover:shadow-[0_8px_32px_-4px_rgba(239,68,68,0.25)]' : 'from-[#150f2e] to-[#1f1640] border-purple-500/20 hover:border-purple-500/35 shadow-[0_4px_24px_-4px_rgba(147,51,234,0.1)] hover:shadow-[0_8px_32px_-4px_rgba(147,51,234,0.18)]'} rounded-2xl p-5 sm:p-6 transition-all duration-300`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none ${limitReached ? 'bg-red-500/10' : 'bg-purple-500/5'}`} />
                        <span className="text-zinc-400 text-[11px] font-semibold tracking-[0.15em] uppercase block mb-3">Total Website</span>
                        <p className="text-white text-3xl font-extrabold tracking-tight mb-2.5">
                            {totalWebsites} <span className="text-zinc-500 text-[13px] font-medium">/ 6 Kapasitas</span>
                        </p>
                        <div className="w-full h-1.5 bg-[#0a1020] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${limitReached ? 'bg-red-500' : 'bg-gradient-to-r from-purple-600 to-purple-400'}`}
                                style={{ width: `${(Math.min(totalWebsites, 6) / 6) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Active */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1f17] to-[#0f2e22] border border-emerald-500/20 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-emerald-500/35 shadow-[0_4px_24px_-4px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.18)]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <span className="text-zinc-400 text-[11px] font-semibold tracking-[0.15em] uppercase block mb-3">Website Aktif</span>
                        <p className="text-white text-3xl font-extrabold tracking-tight">{activeWebsites}</p>
                    </div>
                </div>

                {/* ═══ CTA BUTTON ═══ */}
                <div className="mb-10 sm:mb-12">
                    {limitReached ? (
                        <div className="inline-block w-full sm:w-auto">
                            <button
                                disabled
                                className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-[#71717a] font-bold text-[15px] px-8 py-4 rounded-2xl cursor-not-allowed border border-[#27272a]"
                            >
                                <Globe className="w-5 h-5" />
                                Batas Website Tercapai (6/6)
                            </button>
                            <p className="text-zinc-500 text-[12px] text-center sm:text-left mt-2.5 ml-2">Hapus website preview untuk membuat baru</p>
                        </div>
                    ) : quotaExhausted ? (
                        <button
                            disabled
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-zinc-800 text-zinc-500 font-bold text-[15px] px-8 py-4 rounded-2xl cursor-not-allowed border border-zinc-700"
                        >
                            <Clock className="w-5 h-5" />
                            Kuota Hari Ini Habis, Coba Lagi Besok
                        </button>
                    ) : (
                        <Link
                            href="/dashboard/template"
                            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#1E466B] via-[#255580] to-[#67BAF4] hover:from-[#255580] hover:via-[#1E466B] hover:to-[#255580] text-white font-bold text-[15px] px-8 py-4 rounded-2xl transition-all duration-300 shadow-[0_0_40px_-10px_rgba(30,70,107,0.5)] hover:shadow-[0_0_60px_-15px_rgba(103,186,244,0.4)] hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            Buat Website Baru
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    )}
                </div>

                {/* ═══ WEBSITE SAYA ═══ */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-6">Website Saya</h2>

                    {websites.length === 0 ? (
                        /* Empty State */
                        <div className="bg-[#18181b] border border-zinc-800/80 border-dashed rounded-2xl p-10 sm:p-16 text-center">
                            <div className="w-16 h-16 bg-[#1E466B]/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <Globe className="w-7 h-7 text-[#67BAF4]" />
                            </div>
                            <h3 className="text-white text-lg font-bold mb-2">Belum ada website</h3>
                            <p className="text-zinc-500 text-[14px] mb-6 max-w-sm mx-auto">
                                Yuk buat website pertamamu! Cukup isi form sederhana dan website profesionalmu siap dalam 5 menit.
                            </p>
                            <Link
                                href="/dashboard/template"
                                className="inline-flex items-center gap-2 bg-[#1E466B] hover:bg-[#255580] text-white text-[14px] font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-[#1E466B]/20"
                            >
                                <Plus className="w-4 h-4" />
                                Buat Website Pertamamu
                            </Link>
                        </div>
                    ) : (
                        /* Website Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {websites.map((site) => {
                                const daysLeft = getDaysLeft(site.expires_at)

                                return (
                                    <div
                                        key={site.id}
                                        className="bg-[#18181b] border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 group flex flex-col"
                                    >
                                        {/* Thumbnail Preview */}
                                        <div style={{
                                          position: 'relative',
                                          width: '100%',
                                          height: '200px',
                                          overflow: 'hidden',
                                          backgroundColor: '#0a0a0a',
                                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                          <iframe
                                            src={`/preview/${site.id}?embed=true`}
                                            scrolling="no"
                                            onError={() => console.log('iframe failed to load:', site.id)}
                                            style={{
                                              position: 'absolute',
                                              top: 0,
                                              left: '50%',
                                              width: '1200px',
                                              height: '800px',
                                              transform: 'scale(0.32)',
                                              transformOrigin: 'top left',
                                              pointerEvents: 'none',
                                              border: 'none',
                                              marginLeft: '-192px' /* Setengah dari width setelah di-scale (1200 * 0.32 / 2) */
                                            }}
                                          />
                                          <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: '30px',
                                            background: 'linear-gradient(to bottom, transparent, #18181b)'
                                          }} />
                                        </div>

                                        <div className="p-5 sm:p-6 flex flex-col flex-1">
                                            {/* Top */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                {renamingId === site.id ? (
                                                    <div className="flex-1 flex items-center gap-2">
                                                        <input 
                                                            autoFocus
                                                            type="text" 
                                                            value={renameValue}
                                                            onChange={(e) => setRenameValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleRename(site.id)
                                                                if (e.key === 'Escape') setRenamingId(null)
                                                            }}
                                                            disabled={isRenaming}
                                                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[14px] text-white focus:outline-none focus:border-[#67BAF4]"
                                                        />
                                                        <button 
                                                            onClick={(e) => { e.preventDefault(); handleRename(site.id) }} 
                                                            disabled={isRenaming}
                                                            className="p-1 text-green-400 hover:bg-zinc-800 rounded"
                                                        >
                                                            {isRenaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.preventDefault(); setRenamingId(null) }} 
                                                            disabled={isRenaming}
                                                            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        <h3 className="text-white font-bold text-[15px] leading-snug group-hover:text-[#67BAF4] transition-colors truncate min-w-0">
                                                            {site.nama_bisnis || "Website Baru"}
                                                        </h3>
                                                        <button 
                                                            onClick={(e) => { 
                                                                e.preventDefault(); 
                                                                setRenamingId(site.id);
                                                                setRenameValue(site.nama_bisnis || "");
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-all"
                                                            title="Ubah Nama"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                                {getStatusBadge(site.status)}
                                            </div>

                                        {/* Category */}
                                        {site.kategori_jasa && (
                                            <div className="mb-4">
                                                {getCategoryBadge(site.kategori_jasa)}
                                            </div>
                                        )}

                                        {/* Countdown for preview */}
                                        {site.status === 'preview' && site.expires_at && (
                                            <div className="flex items-center gap-1.5 mb-4 text-amber-400/80 text-[12px] font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                Sisa {daysLeft} hari preview
                                            </div>
                                        )}

                                        {/* Active subdomain link */}
                                        {site.status === 'active' && site.subdomain && (
                                            <a
                                                href={`https://${site.subdomain}.${MAIN_DOMAIN}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 mb-4 text-[#67BAF4] text-[12px] font-medium hover:underline transition-colors"
                                            >
                                                <Globe className="w-3.5 h-3.5" />
                                                {site.subdomain}.{MAIN_DOMAIN}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}

                                        {/* Spacer */}
                                        <div className="flex-1" />

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 mt-2">
                                            {site.status === 'expired' ? (
                                                <Link
                                                    href="/#harga"
                                                    className="flex items-center justify-center gap-2 bg-[#1E466B] hover:bg-[#255580] text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl transition-all"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    Perpanjang
                                                </Link>
                                            ) : site.status === 'active' ? (
                                                <Link
                                                    href={`/buat?id=${site.id}`}
                                                    className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl transition-all"
                                                >
                                                    <Settings className="w-3.5 h-3.5" />
                                                    Kelola
                                                </Link>
                                            ) : (
                                                /* Preview status: show both preview and deploy buttons */
                                                <>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); openDeployModal(site) }}
                                                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#1E466B] to-[#67BAF4] hover:from-[#255580] hover:to-[#67BAF4] text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-[#1E466B]/20 cursor-pointer"
                                                    >
                                                        <Rocket className="w-3.5 h-3.5" />
                                                        Deploy Sekarang
                                                    </button>
                                                    <Link
                                                        href={`/buat?id=${site.id}`}
                                                        className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl transition-all"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Lihat Preview
                                                    </Link>
                                                </>
                                            )}
                                            
                                            <div className="flex justify-end mt-1">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); setDeletingWebsite(site); setDeleteChecked(false); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 text-[12px] font-medium hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* ═══ DELETE MODAL ═══ */}
            {deletingWebsite && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isDeleting && setDeletingWebsite(null)} />
                    
                    <div className="relative w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden" style={{ animation: 'fadeInUp 0.2s ease-out' }}>
                        <div className="px-6 pt-8 pb-6 border-b border-zinc-800 text-center">
                            <h3 className="text-white font-bold text-[20px] mb-1">Hapus Website?</h3>
                            <p className="text-zinc-500 text-[14px]">{deletingWebsite.nama_bisnis}</p>
                        </div>

                        <div className="px-6 py-5">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5 text-[13px] text-red-200 leading-relaxed text-center">
                                {deletingWebsite.status === 'active' ? (
                                    <>
                                        Website <strong className="text-white">{deletingWebsite.nama_bisnis}</strong> yang sudah live di <strong className="text-white">{deletingWebsite.subdomain}.{MAIN_DOMAIN}</strong> akan dihapus permanen.<br/><br/>
                                        Jika kamu sudah membayar, uang tidak akan dikembalikan. Subdomain akan langsung tidak bisa diakses.
                                    </>
                                ) : (
                                    <>
                                        Website <strong className="text-white">{deletingWebsite.nama_bisnis}</strong> dalam masa preview akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
                                    </>
                                )}
                            </div>

                            <label className="flex items-center justify-center gap-3 cursor-pointer group mb-6">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        checked={deleteChecked}
                                        onChange={(e) => setDeleteChecked(e.target.checked)}
                                        disabled={isDeleting}
                                        className="w-4 h-4 rounded border border-zinc-400 bg-zinc-800 checked:bg-red-600 checked:border-red-600 focus:ring-red-500/30 focus:ring-offset-0 transition-all appearance-none cursor-pointer"
                                    />
                                    {deleteChecked && <Check className="absolute w-3 h-3 text-white pointer-events-none" strokeWidth={3} />}
                                </div>
                                <span className="text-[13px] text-zinc-400 group-hover:text-zinc-300 transition-colors select-none">
                                    Saya mengerti website ini akan dihapus permanen
                                </span>
                            </label>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setDeletingWebsite(null)}
                                    disabled={isDeleting}
                                    className="flex-1 bg-transparent hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-[14px] py-3 px-4 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    Batalkan
                                </button>
                                <button
                                    onClick={() => handleDelete(deletingWebsite.id)}
                                    disabled={!deleteChecked || isDeleting}
                                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold text-[14px] py-3 px-4 rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isDeleting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</>
                                    ) : (
                                        "Ya, Hapus Permanen"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ DEPLOY MODAL ═══ */}
            {deployingWebsite && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeDeployModal} />
                    
                    {/* Modal */}
                    <div className="relative w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden" style={{ animation: 'fadeInUp 0.2s ease-out' }}>
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E466B] to-[#67BAF4] flex items-center justify-center">
                                        <Rocket className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-[16px]">Deploy Website</h3>
                                        <p className="text-zinc-500 text-[12px]">{deployingWebsite.nama_bisnis}</p>
                                    </div>
                                </div>
                                <button onClick={closeDeployModal} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            {deploySuccess ? (
                                /* ── Success State ── */
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h4 className="text-white font-bold text-[18px] mb-2">Berhasil Di-deploy! 🎉</h4>
                                    <p className="text-zinc-400 text-[13px] mb-5">Website kamu sekarang bisa diakses di:</p>
                                    <a
                                        href={deploySuccess.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-[#1E466B]/20 hover:bg-[#1E466B]/30 border border-[#1E466B]/40 text-[#67BAF4] font-semibold text-[14px] px-5 py-3 rounded-xl transition-colors"
                                    >
                                        <Globe className="w-4 h-4" />
                                        {deploySuccess.subdomain}.{MAIN_DOMAIN}
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                        onClick={closeDeployModal}
                                        className="block w-full mt-4 text-zinc-500 hover:text-zinc-300 text-[13px] font-medium transition-colors cursor-pointer"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            ) : (
                                /* ── Input State ── */
                                <>
                                    <label className="block text-zinc-300 text-[13px] font-medium mb-2">Pilih Subdomain</label>
                                    <div className="flex items-stretch">
                                        <input
                                            type="text"
                                            value={subdomainInput}
                                            onChange={handleSubdomainChange}
                                            placeholder="nama-bisnis"
                                            maxLength={30}
                                            className={`flex-1 bg-zinc-900 border rounded-l-xl px-4 py-3 text-white text-[14px] placeholder:text-zinc-600 focus:outline-none transition-colors ${
                                                subdomainError ? 'border-red-500/50 focus:border-red-500' :
                                                subdomainAvailable ? 'border-emerald-500/50 focus:border-emerald-500' :
                                                'border-zinc-700 focus:border-[#67BAF4]'
                                            }`}
                                        />
                                        <div className="bg-zinc-800 border border-l-0 border-zinc-700 rounded-r-xl px-3 flex items-center">
                                            <span className="text-zinc-400 text-[13px] font-medium whitespace-nowrap">.{MAIN_DOMAIN}</span>
                                        </div>
                                    </div>

                                    {/* Validation feedback */}
                                    <div className="mt-2 min-h-[20px]">
                                        {isCheckingSubdomain ? (
                                            <div className="flex items-center gap-1.5 text-zinc-500 text-[12px]">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Memeriksa ketersediaan...
                                            </div>
                                        ) : subdomainError ? (
                                            <div className="flex items-center gap-1.5 text-red-400 text-[12px]">
                                                <AlertCircle className="w-3 h-3" />
                                                {subdomainError}
                                            </div>
                                        ) : subdomainAvailable ? (
                                            <div className="flex items-center gap-1.5 text-emerald-400 text-[12px]">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Subdomain tersedia!
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Info text */}
                                    <p className="text-zinc-600 text-[11px] mt-3 leading-relaxed">
                                        Setelah deploy, website kamu bisa diakses di <span className="text-zinc-400">{subdomainInput || 'nama-bisnis'}.{MAIN_DOMAIN}</span>
                                    </p>

                                    {/* Deploy button */}
                                    <button
                                        onClick={handleDeploy}
                                        disabled={!subdomainAvailable || isDeploying}
                                        className="w-full mt-5 flex items-center justify-center gap-2 bg-gradient-to-r from-[#1E466B] to-[#67BAF4] hover:from-[#255580] hover:to-[#67BAF4] disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-semibold text-[14px] py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#1E466B]/20 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {isDeploying ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Deploying...</>
                                        ) : (
                                            <><Rocket className="w-4 h-4" /> Deploy Sekarang<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ PAYMENT MODAL ═══ */}
            {showPaymentModal && deployingWebsite && paymentInfo && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
                    <div className="relative w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
                            <h3 className="text-white font-bold text-[18px]">Ringkasan Pembayaran</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                                    <span className="text-zinc-400 text-[13px]">Website</span>
                                    <span className="text-white font-medium text-[14px]">{deployingWebsite.nama_bisnis}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                                    <span className="text-zinc-400 text-[13px]">Subdomain</span>
                                    <span className="text-[#67BAF4] font-medium text-[14px]">{pendingSubdomain}.{MAIN_DOMAIN}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                                    <span className="text-zinc-400 text-[13px]">Paket</span>
                                    <span className="text-white font-medium text-[14px]">Subdomain 1 Tahun</span>
                                </div>
                                
                                <div className="pt-2">
                                    {paymentInfo.isEarlyAdopter && (
                                        <div className="mb-3 flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[12px] font-medium px-3 py-2 rounded-lg border border-emerald-500/20">
                                            <span>🎉</span> Kamu termasuk 75 early adopter!
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end">
                                        <span className="text-zinc-300 font-medium">Total Harga</span>
                                        <div className="text-right">
                                            {paymentInfo.isEarlyAdopter && (
                                                <div className="text-zinc-500 line-through text-[13px] mb-1">
                                                    Rp199.000
                                                </div>
                                            )}
                                            <div className="text-2xl font-bold text-white">
                                                Rp{paymentInfo.harga.toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleBayarSekarang}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
                                >
                                    Bayar Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ TOAST ═══ */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-[13px] font-medium shadow-2xl shadow-emerald-600/30" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <CheckCircle2 className="w-4 h-4" />
                    {toast}
                </div>
            )}

            {/* Animation keyframes */}
            <style jsx global>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
