'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Bot } from 'lucide-react'

const TABS = [
    { href: '/dashboard', label: 'Website', icon: LayoutGrid },
    { href: '/dashboard/agent', label: 'Agent', icon: Bot },
]

// Navigasi antar seksi dashboard: Website (existing) + Agent (AI agent WhatsApp).
export default function DashboardNav() {
    const pathname = usePathname()

    return (
        <nav className="mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-[#111113] border border-white/5">
                {TABS.map(({ href, label, icon: Icon }) => {
                    // /dashboard cocok persis; /dashboard/agent cocok jika prefix.
                    const active = href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(href)
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                                active
                                    ? 'bg-gradient-to-r from-[#1E466B] to-[#255580] text-white shadow-[0_4px_16px_-6px_rgba(30,70,107,0.6)]'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
