'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface DashboardHeaderProps {
    userName: string
    userEmail: string
    userAvatar: string | null
    isAdmin?: boolean
}

// Header dashboard: logo + menu user (dropdown). Dipakai bersama oleh
// halaman Website (/dashboard) dan Agent (/dashboard/agent).
export default function DashboardHeader({
    userName,
    userEmail,
    userAvatar,
    isAdmin = false,
}: DashboardHeaderProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

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
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-zinc-300 hover:text-emerald-400 hover:bg-white/5 text-[13px] transition-colors w-full text-left"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Panel Admin
                                </Link>
                            )}
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
    )
}
