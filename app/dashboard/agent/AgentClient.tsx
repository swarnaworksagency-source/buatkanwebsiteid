'use client'

import { useState, useEffect } from 'react'
import { CalendarClock, Languages, Smartphone, Workflow, Copy, Check } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardNav from '@/components/dashboard/DashboardNav'

interface AgentClientProps {
    userName: string
    userEmail: string
    userAvatar: string | null
    isAdmin?: boolean
}

// Nomor WA agent. Sementara pakai nomor ini; boleh diganti kapan saja.
const AGENT_NUMBER = '6282136111625' // 082136111625 dalam format internasional
const KODE_AKTIVASI = 'webinarBW'
// Kode aktivasi terbuka untuk publik saat Webinar: 25 Juli 2026, 19.30 WIB (UTC+7).
const REVEAL_TS = new Date('2026-07-25T19:30:00+07:00').getTime()

function pad(n: number) {
    return String(n).padStart(2, '0')
}

export default function AgentClient({
    userName,
    userEmail,
    userAvatar,
    isAdmin = false,
}: AgentClientProps) {
    // now = null sampai komponen mount (hindari mismatch hydrasi; server tak tahu jam client).
    const [now, setNow] = useState<number | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        // rAF untuk set nilai awal tanpa setState sinkron di body effect.
        const raf = requestAnimationFrame(() => setNow(Date.now()))
        const id = setInterval(() => setNow(Date.now()), 1000)
        return () => {
            cancelAnimationFrame(raf)
            clearInterval(id)
        }
    }, [])

    const revealed = now !== null && now >= REVEAL_TS
    const diff = now === null ? 0 : Math.max(0, REVEAL_TS - now)
    const hari = Math.floor(diff / 86_400_000)
    const jam = Math.floor((diff % 86_400_000) / 3_600_000)
    const menit = Math.floor((diff % 3_600_000) / 60_000)
    const detik = Math.floor((diff % 60_000) / 1_000)

    const copyKode = async () => {
        try {
            await navigator.clipboard.writeText(KODE_AKTIVASI)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            /* clipboard tidak tersedia — abaikan */
        }
    }

    const langkah = [
        { no: 1, teks: <>Simpan nomor <span className="text-white font-semibold">BuatkanWeb Agent Jadwal</span> di kontakmu.</> },
        { no: 2, teks: <>Kirim kode aktivasi ke WhatsApp agent untuk mengaktifkan.</> },
        { no: 3, teks: <>Setelah aktif, cukup chat pakai bahasa biasa, mis. <span className="text-zinc-200 italic">&quot;ingetin besok jam 9 bayar supplier&quot;</span>.</> },
        { no: 4, teks: <>Agent balas mengonfirmasi, lalu mengingatkanmu tepat waktu di WhatsApp.</> },
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111827]/60 via-[#0a0a0a] to-[#0a0a0a]" />
                <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#1E466B]/8 blur-[150px]" />
                <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[130px]" />
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <DashboardHeader
                userName={userName}
                userEmail={userEmail}
                userAvatar={userAvatar}
                isAdmin={isAdmin}
            />

            <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
                {/* ═══ GREETING ═══ */}
                <div className="mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                        Agent Jadwal
                    </h1>
                    <p className="text-zinc-400 text-[14px] sm:text-[15px]">
                        Pengingat pribadi via WhatsApp berdasarkan jadwal yang kamu tentukan sendiri.
                    </p>
                </div>

                {/* ═══ NAV: Website / Agent ═══ */}
                <DashboardNav />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                    {/* ─── Kartu utama: aktivasi ─── */}
                    <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0a1f17] to-[#0f2e22] border border-emerald-500/20 rounded-2xl p-6 sm:p-8">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="mb-6">
                            <h2 className="text-white font-bold text-[17px] tracking-tight">Aktifkan lewat WhatsApp</h2>
                            <p className="text-zinc-400 text-[13px] mt-1">Gratis untuk 30 pengguna pertama.</p>
                        </div>

                        {/* Langkah */}
                        <ol className="space-y-4 mb-7">
                            {langkah.map(({ no, teks }) => (
                                <li key={no} className="flex gap-3.5">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 text-[12px] font-bold flex items-center justify-center mt-0.5">
                                        {no}
                                    </span>
                                    <span className="text-zinc-300 text-[14px] leading-relaxed">{teks}</span>
                                </li>
                            ))}
                        </ol>

                        {/* ─── Reveal: sebelum webinar = countdown, sesudah = kode ─── */}
                        {revealed ? (
                            <div>
                                <span className="text-zinc-500 text-[11px] font-semibold tracking-[0.15em] uppercase block mb-2">Kode Aktivasi</span>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <code className="px-4 py-3 rounded-xl bg-[#0a1512] border border-emerald-500/20 font-mono text-[15px] text-[#67BAF4] font-semibold tracking-wide">
                                            {KODE_AKTIVASI}
                                        </code>
                                        <button
                                            onClick={copyKode}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/10 text-[13px] font-semibold transition-colors"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Tersalin' : 'Salin'}
                                        </button>
                                    </div>
                                    <a
                                        href={`https://wa.me/${AGENT_NUMBER}?text=${encodeURIComponent(KODE_AKTIVASI)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[14px] px-6 py-3 rounded-xl transition-colors sm:ml-1"
                                    >
                                        <Smartphone className="w-4 h-4" />
                                        Chat Agent
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-emerald-500/15 bg-[#0a1512]/60 p-5">
                                <p className="text-emerald-300/90 text-[13px] font-semibold mb-1">Segera Hadir</p>
                                <p className="text-zinc-400 text-[13px] mb-4">
                                    Kode aktivasi dibuka saat Webinar — <span className="text-white font-semibold">25 Juli 2026, 19.30 WIB</span>.
                                </p>
                                <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm">
                                    {[['Hari', hari], ['Jam', jam], ['Menit', menit], ['Detik', detik]].map(([label, val]) => (
                                        <div key={label as string} className="rounded-xl bg-[#0f1a17] border border-emerald-500/10 py-3 text-center">
                                            <div className="text-white text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight">
                                                {now === null ? '--' : pad(val as number)}
                                            </div>
                                            <div className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── Integrate Agent (di bawah Segera Hadir) ─── */}
                        {/* Buka WhatsApp ke nomor agent. Sebelum reveal, prefill netral
                            (jangan bocorkan kode); sesudah reveal, prefill kode aktivasi. */}
                        <a
                            href={`https://wa.me/${AGENT_NUMBER}?text=${encodeURIComponent(
                                revealed ? KODE_AKTIVASI : 'Halo, saya ingin integrasi Agent Jadwal BuatkanWeb.'
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#1E466B] via-[#255580] to-[#67BAF4] text-white font-bold text-[14px] px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_0_40px_-10px_rgba(30,70,107,0.5)] hover:shadow-[0_0_60px_-15px_rgba(103,186,244,0.4)] hover:-translate-y-0.5"
                        >
                            <Workflow className="w-4 h-4" />
                            Integrate Agent
                        </a>
                    </div>

                    {/* ─── Kolom kanan: fitur ringkas ─── */}
                    <div className="space-y-5">
                        <div className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-5">
                            <CalendarClock className="w-5 h-5 text-[#67BAF4] mb-3" />
                            <h3 className="text-white font-semibold text-[14px] mb-1.5">Pengingat sekali & berulang</h3>
                            <p className="text-zinc-400 text-[13px] leading-relaxed">
                                &quot;tiap tanggal 1 jam 8 ingetin bayar listrik&quot;, agent atur jadwalnya otomatis.
                            </p>
                        </div>
                        <div className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-5">
                            <Languages className="w-5 h-5 text-purple-400 mb-3" />
                            <h3 className="text-white font-semibold text-[14px] mb-1.5">Pakai bahasa sehari-hari</h3>
                            <p className="text-zinc-400 text-[13px] leading-relaxed">
                                Tak perlu format khusus. Ketik seperti chat biasa, agent yang mengerti.
                            </p>
                        </div>
                        <div className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-5">
                            <Smartphone className="w-5 h-5 text-emerald-400 mb-3" />
                            <h3 className="text-white font-semibold text-[14px] mb-1.5">Terhubung lewat WhatsApp</h3>
                            <p className="text-zinc-400 text-[13px] leading-relaxed">
                                Agent akan selalu menghubungimu tanpa melalui aplikasi lain, hanya WhatsApp.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
