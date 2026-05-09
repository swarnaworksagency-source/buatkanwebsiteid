'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, ArrowLeft, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { safeStorage } from '@/lib/storage'

interface TemplateClientProps {
    userName: string
    userEmail: string
    userAvatar: string | null
}

const CATEGORIES = [
    {
        id: 'jasa',
        name: 'Jasa',
        desc: 'Salon, Bengkel, Laundry, Fotografi, dll',
        number: '01',
        comingSoon: false,
        accent: {
            border: 'border-[#1E466B]/30 hover:border-[#67BAF4]/60',
            borderSelected: 'border-[#67BAF4] shadow-[0_0_30px_-5px_rgba(103,186,244,0.35)]',
            bg: 'from-[#0f1a2e] to-[#162a4a]',
            iconBg: 'bg-[#1E466B]/20',
            iconColor: 'text-[#67BAF4]',
            badge: 'bg-[#1E466B]/30 text-[#67BAF4]',
            glow: 'bg-[#67BAF4]/8',
        },
    },
    {
        id: 'fnb',
        name: 'FnB',
        desc: 'Warung Makan, Kafe, Bakery, Catering, dll',
        number: '02',
        comingSoon: true,
        accent: {
            border: 'border-amber-500/20 hover:border-amber-400/50',
            borderSelected: 'border-amber-400 shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]',
            bg: 'from-[#1a1508] to-[#2a2010]',
            iconBg: 'bg-amber-500/15',
            iconColor: 'text-amber-400',
            badge: 'bg-amber-500/20 text-amber-400',
            glow: 'bg-amber-500/6',
        },
    },
    {
        id: 'kreatif',
        name: 'Kreatif & Kerajinan',
        desc: 'Batik, Keramik, Handmade, Desainer, dll',
        number: '03',
        comingSoon: true,
        accent: {
            border: 'border-purple-500/20 hover:border-purple-400/50',
            borderSelected: 'border-purple-400 shadow-[0_0_30px_-5px_rgba(192,132,252,0.3)]',
            bg: 'from-[#150f2e] to-[#1f1640]',
            iconBg: 'bg-purple-500/15',
            iconColor: 'text-purple-400',
            badge: 'bg-purple-500/20 text-purple-400',
            glow: 'bg-purple-500/6',
        },
    },
]

export default function TemplateClient({ userName, userEmail, userAvatar }: TemplateClientProps) {
    const [selected, setSelected] = useState<string | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

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

    const handleSelect = (categoryId: string) => {
        setSelected(categoryId)
        safeStorage.set('selected_category', categoryId)
        setTimeout(() => {
            router.push(`/dashboard/template/${categoryId}`)
        }, 400)
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex flex-col">
            {/* Background Decorations */}
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
                        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[13px] font-medium group">
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

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-8 py-12 sm:py-16">
                <div className="w-full max-w-4xl">
                    {/* Heading */}
                    <div className="text-center mb-10 sm:mb-14">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
                            Pilih Kategori Usahamu
                        </h1>
                        <p className="text-zinc-400 text-[14px] sm:text-[15px] max-w-md mx-auto">
                            Kami akan buatkan website yang sesuai dengan jenis usahamu
                        </p>
                    </div>

                    {/* Category Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        {CATEGORIES.map((cat) => {
                            const isSelected = selected === cat.id
                            const isDisabled = cat.comingSoon

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => !isDisabled && handleSelect(cat.id)}
                                    disabled={isDisabled || selected !== null}
                                    className={`
                                        relative overflow-hidden bg-gradient-to-br ${cat.accent.bg}
                                        border rounded-2xl p-6 sm:p-8 text-left
                                        transition-all duration-300
                                        ${isDisabled
                                            ? 'opacity-45 cursor-not-allowed border-zinc-800/40'
                                            : `cursor-pointer ${isSelected ? cat.accent.borderSelected : cat.accent.border} ${isSelected ? 'scale-[1.02]' : 'hover:-translate-y-1 hover:shadow-lg'} ${selected !== null && !isSelected ? 'opacity-40 pointer-events-none' : ''}`
                                        }
                                    `}
                                >
                                    {/* Glow — hidden on coming soon */}
                                    {!isDisabled && (
                                        <div className={`absolute top-0 right-0 w-40 h-40 ${cat.accent.glow} rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none`} />
                                    )}

                                    {/* Selected Checkmark */}
                                    {isSelected && (
                                        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white flex items-center justify-center animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                                            <Check className="w-4 h-4 text-[#0a0a0a]" strokeWidth={3} />
                                        </div>
                                    )}

                                    {/* Number */}
                                    <div className="mb-5">
                                        <span className={`text-5xl font-extrabold select-none ${isDisabled ? 'text-zinc-600 opacity-15' : `${cat.accent.iconColor} opacity-20`}`}>
                                            {cat.number}
                                        </span>
                                    </div>

                                    {/* Name */}
                                    <h3 className={`text-lg font-bold mb-1.5 ${isDisabled ? 'text-zinc-500' : 'text-white'}`}>{cat.name}</h3>

                                    {/* Description */}
                                    <p className={`text-[13px] leading-relaxed mb-4 ${isDisabled ? 'text-zinc-700' : 'text-zinc-500'}`}>{cat.desc}</p>

                                    {/* Badge */}
                                    {isDisabled ? (
                                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-800/60 text-zinc-500 border border-zinc-700/30">
                                            Segera Hadir
                                        </span>
                                    ) : (
                                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold ${cat.accent.badge}`}>
                                            1 Template
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </main>
        </div>
    )
}
