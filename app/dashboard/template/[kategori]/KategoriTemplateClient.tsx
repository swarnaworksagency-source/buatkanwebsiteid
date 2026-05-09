'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TemplateCard } from '@/components/TemplateCard'
import { safeStorage } from '@/lib/storage'
import { LogOut, ArrowLeft, Check, ExternalLink, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase'

// ── Template Data ──────────────────────────────────────

interface Template {
    id: string
    nama: string
    kategori: string
    status: 'available' | 'coming_soon'
    badge?: string
}

const JASA_TEMPLATES: Template[] = [
    { id: 'jasa-001', nama: 'Minimalist', kategori: 'jasa', status: 'available', badge: 'Populer' },
    { id: 'jasa-002', nama: 'Modern', kategori: 'jasa', status: 'coming_soon' },
    { id: 'jasa-003', nama: 'Clean', kategori: 'jasa', status: 'coming_soon' },
    { id: 'jasa-004', nama: 'Bold', kategori: 'jasa', status: 'coming_soon' },
    { id: 'jasa-005', nama: 'Elegant', kategori: 'jasa', status: 'coming_soon' },
    { id: 'jasa-006', nama: 'Colorful', kategori: 'jasa', status: 'coming_soon' },
    { id: 'jasa-007', nama: 'Corporate', kategori: 'jasa', status: 'coming_soon' },
    { id: 'jasa-008', nama: 'Creative', kategori: 'jasa', status: 'coming_soon' },
    { id: 'jasa-009', nama: 'Premium', kategori: 'jasa', status: 'coming_soon' },
    { id: 'jasa-010', nama: 'Exclusive', kategori: 'jasa', status: 'coming_soon' },
]

const FNB_TEMPLATES: Template[] = [
    { id: 'fnb-001', nama: 'Classic', kategori: 'fnb', status: 'available', badge: 'Populer' },
    { id: 'fnb-002', nama: 'Warm', kategori: 'fnb', status: 'coming_soon' },
    { id: 'fnb-003', nama: 'Minimalist', kategori: 'fnb', status: 'coming_soon' },
    { id: 'fnb-004', nama: 'Cozy', kategori: 'fnb', status: 'coming_soon' },
    { id: 'fnb-005', nama: 'Fresh', kategori: 'fnb', status: 'coming_soon' },
    { id: 'fnb-006', nama: 'Rustic', kategori: 'fnb', status: 'coming_soon' },
    { id: 'fnb-007', nama: 'Urban', kategori: 'fnb', status: 'coming_soon' },
    { id: 'fnb-008', nama: 'Elegant', kategori: 'fnb', status: 'coming_soon' },
    { id: 'fnb-009', nama: 'Premium', kategori: 'fnb', status: 'coming_soon' },
    { id: 'fnb-010', nama: 'Exclusive', kategori: 'fnb', status: 'coming_soon' },
]

const KREATIF_TEMPLATES: Template[] = [
    { id: 'kreatif-001', nama: 'Classic', kategori: 'kreatif', status: 'available', badge: 'Populer' },
    { id: 'kreatif-002', nama: 'Artsy', kategori: 'kreatif', status: 'coming_soon' },
    { id: 'kreatif-003', nama: 'Minimalist', kategori: 'kreatif', status: 'coming_soon' },
    { id: 'kreatif-004', nama: 'Bold', kategori: 'kreatif', status: 'coming_soon' },
    { id: 'kreatif-005', nama: 'Earthy', kategori: 'kreatif', status: 'coming_soon' },
    { id: 'kreatif-006', nama: 'Colorful', kategori: 'kreatif', status: 'coming_soon' },
    { id: 'kreatif-007', nama: 'Handcraft', kategori: 'kreatif', status: 'coming_soon' },
    { id: 'kreatif-008', nama: 'Studio', kategori: 'kreatif', status: 'coming_soon' },
    { id: 'kreatif-009', nama: 'Premium', kategori: 'kreatif', status: 'coming_soon' },
    { id: 'kreatif-010', nama: 'Exclusive', kategori: 'kreatif', status: 'coming_soon' },
]

const ALL_TEMPLATES: Record<string, Template[]> = {
    jasa: JASA_TEMPLATES,
    fnb: FNB_TEMPLATES,
    kreatif: KREATIF_TEMPLATES,
}

// ── Component ──────────────────────────────────────

interface KategoriTemplateClientProps {
    kategori: string
    kategoriLabel: string
    userName: string
    userEmail: string
    userAvatar: string | null
}

export default function KategoriTemplateClient({
    kategori,
    kategoriLabel,
    userName,
    userEmail,
    userAvatar,
}: KategoriTemplateClientProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

    const templates = ALL_TEMPLATES[kategori] || []

    const initials = userName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

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

    const handleSelectTemplate = (template: Template) => {
        setSelectedId(template.id)
        safeStorage.set('selected_kategori', kategori)
        safeStorage.set('selected_template', template.id)
        setTimeout(() => {
            router.push('/buat')
        }, 400)
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111827]/60 via-[#0a0a0a] to-[#0a0a0a]" />
                <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#1E466B]/8 blur-[150px]" />
                <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[130px]" />
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/template" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[13px] font-medium group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="hidden sm:inline">Kembali</span>
                        </Link>
                        <span className="text-zinc-700 text-[13px]">|</span>
                        <Link href="/" className="flex items-center gap-2 group">
                            <img src="/Logo buatkanweb.webp" alt="BuatkanWeb.id" className="w-7 h-7 rounded-lg object-contain" />
                            <span className="hidden sm:block font-bold text-[14px] tracking-tight text-white">
                                BuatkanWeb<span className="text-[#67BAF4]">.id</span>
                            </span>
                        </Link>
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

            {/* Main */}
            <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
                {/* Heading */}
                <div className="mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                        {kategoriLabel}
                    </h1>
                    <p className="text-zinc-400 text-[14px]">
                        Pilih template yang paling cocok untuk usahamu. <span className="text-zinc-600">1 tersedia, 9 segera hadir.</span>
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {templates.map((tpl, index) => {
                        const isAvailable = tpl.status === 'available'
                        const isSelected = selectedId === tpl.id

                        return (
                            <div
                                key={tpl.id}
                                className={`
                                    relative rounded-2xl border overflow-hidden flex flex-col
                                    transition-all duration-300
                                    ${isAvailable
                                        ? `bg-[#18181b] border-zinc-800/80 hover:border-[#67BAF4]/40 hover:shadow-[0_8px_32px_-8px_rgba(103,186,244,0.15)] hover:-translate-y-1 ${isSelected ? 'border-[#67BAF4] shadow-[0_0_30px_-5px_rgba(103,186,244,0.3)] scale-[1.01]' : ''}`
                                        : 'bg-[#131315] border-zinc-800/40 opacity-50'
                                    }
                                `}
                            >
                                {/* Thumbnail */}
                                <div className="relative bg-zinc-900 overflow-hidden" style={{ height: '220px' }}>
                                    {isAvailable ? (
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            overflow: 'hidden',
                                            borderRadius: '8px 8px 0 0',
                                        }}>
                                            <iframe
                                                src={`/preview/${tpl.id}?embed=true`}
                                                title={tpl.nama}
                                                scrolling="no"
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: '50%',
                                                    width: '1200px',
                                                    height: '800px',
                                                    transform: 'scale(0.35)',
                                                    transformOrigin: 'top left',
                                                    pointerEvents: 'none',
                                                    border: 'none',
                                                    marginLeft: '-210px', /* 1200px * 0.35 / 2 = 210px */
                                                }}
                                                tabIndex={-1}
                                                loading="lazy"
                                            />
                                            {/* Gradient fade bottom */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: '80px',
                                                background: 'linear-gradient(to bottom, transparent, #18181b)',
                                                pointerEvents: 'none',
                                            }} />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-zinc-900/80 flex items-center justify-center backdrop-blur-sm">
                                            <div className="text-center">
                                                <Lock className="w-5 h-5 text-zinc-700 mx-auto mb-1.5" />
                                                <span className="text-zinc-700 text-[11px] font-medium">Segera Hadir</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Badges — on top of iframe */}
                                    {isAvailable && tpl.badge && (
                                        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#67BAF4]/20 text-[#67BAF4] border border-[#67BAF4]/20 backdrop-blur-sm">
                                            {tpl.badge}
                                        </span>
                                    )}
                                    {!isAvailable && (
                                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-800/80 text-zinc-500 border border-zinc-700/50 backdrop-blur-sm">
                                            Segera Hadir
                                        </span>
                                    )}

                                    {/* Selected overlay */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-[#67BAF4]/10 flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                                                <Check className="w-5 h-5 text-[#0a0a0a]" strokeWidth={3} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Number watermark */}
                                    <span className="absolute bottom-2 right-3 text-[32px] font-black text-white/[0.03] select-none leading-none">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-5 flex flex-col flex-1">
                                    <h3 className={`font-bold text-[14px] mb-3 ${isAvailable ? 'text-white' : 'text-zinc-600'}`}>
                                        {tpl.nama}
                                    </h3>

                                    <div className="flex-1" />

                                    {isAvailable ? (
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/preview/${tpl.id}`}
                                                target="_blank"
                                                className="flex-1 flex items-center justify-center gap-1.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-[12px] font-medium py-2.5 rounded-xl transition-all"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Preview
                                            </Link>
                                            <button
                                                onClick={() => handleSelectTemplate(tpl)}
                                                disabled={selectedId !== null}
                                                className="flex-[2] flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#1E466B] to-[#255580] hover:from-[#255580] hover:to-[#1E466B] text-white text-[12px] font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-[#1E466B]/15 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                                            >
                                                Pilih Template Ini →
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full flex items-center justify-center gap-2 bg-zinc-800/50 text-zinc-600 text-[12px] font-medium py-2.5 rounded-xl cursor-not-allowed border border-zinc-800/50"
                                        >
                                            <Lock className="w-3 h-3" />
                                            Segera Hadir
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}
