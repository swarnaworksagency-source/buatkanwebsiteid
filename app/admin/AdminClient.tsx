'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    RefreshCw, Trash2, RotateCcw, ShieldCheck, Users, AlertTriangle,
    ExternalLink, Database, Activity, ScrollText, Globe, Zap, Wallet,
    Server, HardDrive, MemoryStick, Archive, Boxes,
} from 'lucide-react'

interface AdminUser {
    id: string
    email: string
    name: string
    createdAt: string
    lastSignInAt: string | null
    role: string | null
    generatedToday: number
    totalWebsites: number
    activeWebsites: number
}

interface Stats {
    websites: { total: number; active: number; draft: number; preview: number; expired: number }
    users: number | null
    generate: { today: number; total: number }
    payments: { paidCount: number; revenue: number }
}

interface Infra {
    checkedAt: string
    pm2: { name: string; status: string; cpu: number; memoryBytes: number; restarts: number; uptimeMs: number }[] | null
    docker: { name: string; state: string; status: string }[] | null
    disk: { totalBytes: number; usedBytes: number; availBytes: number; usedPercent: number } | null
    memory: { totalBytes: number; usedBytes: number; availBytes: number; usedPercent: number } | null
    uptimeSeconds: number | null
    backup: { fileName: string; sizeBytes: number; modifiedAt: string; count: number } | null
}

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'buatkanweb.id'

// Netdata & Dozzle di-embed via proxy internal /api/ops/* (dijaga requireAdminApi,
// upstream bind 127.0.0.1 di VPS). Studio tidak bisa di-iframe (domain API +
// basic auth Kong sendiri) — tetap link eksternal.
const MONITOR_TABS = [
    { id: 'netdata', label: 'Netdata', desc: 'CPU, RAM, disk, network real-time', src: '/api/ops/netdata/v3', Icon: Activity },
    { id: 'logs', label: 'Log Container', desc: 'Log semua container Docker live', src: '/api/ops/logs', Icon: ScrollText },
] as const

type MonitorTabId = (typeof MONITOR_TABS)[number]['id']

const fmtBytes = (n: number) => {
    if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`
    if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(0)} MB`
    return `${(n / 1024).toFixed(0)} KB`
}

const fmtRupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`

const fmtDuration = (seconds: number) => {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    if (d > 0) return `${d}h ${h}j`
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}j ${m}m` : `${m}m`
}

export default function AdminClient({ adminEmail }: { adminEmail: string }) {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [infra, setInfra] = useState<Infra | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(null)
    const [monitorTab, setMonitorTab] = useState<MonitorTabId | null>(null)

    const loadAll = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [usersRes, statsRes, infraRes] = await Promise.all([
                fetch('/api/admin/users', { cache: 'no-store' }),
                fetch('/api/admin/stats', { cache: 'no-store' }),
                fetch('/api/admin/infra', { cache: 'no-store' }),
            ])
            const usersData = await usersRes.json()
            if (!usersRes.ok) throw new Error(usersData.error || 'Gagal memuat user.')
            setUsers(usersData.users)
            if (statsRes.ok) setStats(await statsRes.json())
            if (infraRes.ok) setInfra(await infraRes.json())
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal memuat data.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadAll()
    }, [loadAll])

    const flash = (msg: string) => {
        setNotice(msg)
        setTimeout(() => setNotice(null), 3500)
    }

    const resetQuota = async (u: AdminUser) => {
        setBusyId(u.id)
        setError(null)
        try {
            const res = await fetch('/api/admin/reset-quota', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: u.id }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Gagal reset kuota.')
            flash(`Token generate ${u.email || u.id} direset (hapus ${data.deleted} log hari ini).`)
            setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, generatedToday: 0 } : x)))
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal reset kuota.')
        } finally {
            setBusyId(null)
        }
    }

    const deleteUser = async (u: AdminUser) => {
        const ok = window.confirm(
            `Hapus user "${u.email || u.id}" beserta SEMUA website & datanya secara permanen? Tindakan ini tidak bisa dibatalkan.`
        )
        if (!ok) return
        setBusyId(u.id)
        setError(null)
        try {
            const res = await fetch('/api/admin/delete-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: u.id }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Gagal menghapus user.')
            flash(`User ${u.email || u.id} dihapus.`)
            setUsers((prev) => prev.filter((x) => x.id !== u.id))
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal menghapus user.')
        } finally {
            setBusyId(null)
        }
    }

    const fmtDate = (iso: string | null) =>
        iso ? new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 sm:px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" /> Panel Admin
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            Masuk sebagai <span className="text-zinc-200">{adminEmail}</span>. Kelola user, pantau bisnis & infra VPS.
                        </p>
                    </div>
                    <button
                        onClick={loadAll}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Muat ulang
                    </button>
                </div>

                {notice && (
                    <div className="mt-4 rounded-lg border border-emerald-700/50 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">
                        {notice}
                    </div>
                )}
                {error && (
                    <div className="mt-4 rounded-lg border border-red-700/50 bg-red-900/20 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}

                {/* Monitoring terpadu: Netdata & Dozzle embed di sini via /api/ops/* */}
                <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
                    <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-zinc-800">
                        {MONITOR_TABS.map(({ id, label, desc, Icon }) => (
                            <button
                                key={id}
                                onClick={() => setMonitorTab((cur) => (cur === id ? null : id))}
                                title={desc}
                                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                                    monitorTab === id
                                        ? 'border-emerald-600/60 bg-emerald-900/20 text-emerald-300'
                                        : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                                }`}
                            >
                                <Icon className="w-4 h-4" /> {label}
                            </button>
                        ))}
                        <a
                            href={`https://db.${MAIN_DOMAIN}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                        >
                            <Database className="w-4 h-4" /> Supabase Studio <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                        </a>
                        {monitorTab && (
                            <span className="ml-auto text-xs text-zinc-500">klik tab lagi untuk menutup</span>
                        )}
                    </div>
                    {monitorTab ? (
                        <iframe
                            key={monitorTab}
                            src={MONITOR_TABS.find((t) => t.id === monitorTab)!.src}
                            title={MONITOR_TABS.find((t) => t.id === monitorTab)!.label}
                            className="w-full h-[75vh] rounded-b-xl bg-zinc-950"
                        />
                    ) : (
                        <p className="px-4 py-3 text-xs text-zinc-600">
                            Pilih tab untuk membuka monitoring langsung di halaman ini. Semua akses lewat proxy internal yang hanya bisa dibuka admin.
                        </p>
                    )}
                </div>

                {/* Statistik bisnis */}
                {stats && (
                    <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-zinc-500"><Globe className="w-3.5 h-3.5" /> Website</div>
                            <div className="mt-1 text-2xl font-bold">{stats.websites.total}</div>
                            <div className="mt-0.5 text-xs text-zinc-500">
                                <span className="text-emerald-400">{stats.websites.active} aktif</span>
                                {' · '}{stats.websites.draft} draft
                                {stats.websites.expired > 0 && <> · <span className="text-amber-400">{stats.websites.expired} expired</span></>}
                            </div>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-zinc-500"><Users className="w-3.5 h-3.5" /> User</div>
                            <div className="mt-1 text-2xl font-bold">{stats.users ?? '—'}</div>
                            <div className="mt-0.5 text-xs text-zinc-500">terdaftar</div>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-zinc-500"><Zap className="w-3.5 h-3.5" /> Generate AI</div>
                            <div className="mt-1 text-2xl font-bold">{stats.generate.today}</div>
                            <div className="mt-0.5 text-xs text-zinc-500">hari ini · {stats.generate.total} total</div>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-zinc-500"><Wallet className="w-3.5 h-3.5" /> Pendapatan</div>
                            <div className="mt-1 text-2xl font-bold">{fmtRupiah(stats.payments.revenue)}</div>
                            <div className="mt-0.5 text-xs text-zinc-500">{stats.payments.paidCount} pembayaran lunas</div>
                        </div>
                    </div>
                )}

                {/* Infra VPS */}
                <section className="mt-8">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Server className="w-5 h-5 text-emerald-400" /> Infra VPS
                        {infra?.uptimeSeconds != null && (
                            <span className="text-xs font-normal text-zinc-500">uptime server {fmtDuration(infra.uptimeSeconds)}</span>
                        )}
                    </h2>

                    {!infra && !loading && (
                        <p className="mt-3 text-sm text-zinc-500">Data infra tidak tersedia (endpoint gagal dimuat).</p>
                    )}

                    {infra && (
                        <>
                            {/* Disk & RAM */}
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {([
                                    { label: 'Disk', Icon: HardDrive, info: infra.disk },
                                    { label: 'RAM', Icon: MemoryStick, info: infra.memory },
                                ] as const).map(({ label, Icon, info }) => (
                                    <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-zinc-300"><Icon className="w-4 h-4 text-zinc-500" /> {label}</div>
                                            {info ? (
                                                <span className="text-zinc-400 text-xs">
                                                    {fmtBytes(info.usedBytes)} / {fmtBytes(info.totalBytes)} · {info.usedPercent}%
                                                </span>
                                            ) : (
                                                <span className="text-zinc-600 text-xs">tidak tersedia</span>
                                            )}
                                        </div>
                                        {info && (
                                            <div className="mt-2 h-2 rounded-full bg-zinc-800 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${info.usedPercent > 85 ? 'bg-red-500' : info.usedPercent > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${info.usedPercent}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* PM2 + Docker + Backup */}
                            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                                    <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                                        <Zap className="w-4 h-4 text-zinc-500" /> Proses PM2
                                    </div>
                                    {infra.pm2 ? (
                                        <ul className="mt-2 space-y-1.5">
                                            {infra.pm2.map((p) => (
                                                <li key={p.name} className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${p.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                        {p.name}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {p.status === 'online' ? `up ${fmtDuration(Math.floor(p.uptimeMs / 1000))}` : p.status}
                                                        {' · '}{fmtBytes(p.memoryBytes)} · ↺{p.restarts}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-2 text-xs text-zinc-600">tidak tersedia</p>
                                    )}

                                    <div className="mt-4 flex items-center gap-2 text-sm text-zinc-300 font-medium">
                                        <Archive className="w-4 h-4 text-zinc-500" /> Backup terakhir
                                    </div>
                                    {infra.backup ? (
                                        <p className="mt-1 text-xs text-zinc-500">
                                            <span className="text-zinc-300">{infra.backup.fileName}</span>
                                            {' · '}{fmtBytes(infra.backup.sizeBytes)}
                                            {' · '}{new Date(infra.backup.modifiedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            {' · '}{infra.backup.count} file tersimpan
                                        </p>
                                    ) : (
                                        <p className="mt-1 text-xs text-zinc-600">tidak tersedia</p>
                                    )}
                                </div>

                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                                    <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                                        <Boxes className="w-4 h-4 text-zinc-500" /> Container Docker
                                    </div>
                                    {infra.docker ? (
                                        <ul className="mt-2 space-y-1.5">
                                            {infra.docker.map((c) => (
                                                <li key={c.name} className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${c.state === 'running' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                        {c.name}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">{c.status}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-2 text-xs text-zinc-600">tidak tersedia</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {/* User terdaftar */}
                <section className="mt-8">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" /> User terdaftar
                        <span className="text-xs font-normal text-zinc-500">{users.length} user</span>
                    </h2>

                    <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-800">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-900/70 text-zinc-400 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">User</th>
                                    <th className="px-4 py-3 font-medium">Generate hari ini</th>
                                    <th className="px-4 py-3 font-medium">Website</th>
                                    <th className="px-4 py-3 font-medium">Daftar</th>
                                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {loading && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                                            Memuat…
                                        </td>
                                    </tr>
                                )}
                                {!loading && users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                                            Tidak ada user.
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    users.map((u) => {
                                        const isAdminUser = u.role === 'admin'
                                        return (
                                            <tr key={u.id} className="hover:bg-zinc-900/40">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-zinc-100 flex items-center gap-2">
                                                        {u.email || '(tanpa email)'}
                                                        {isAdminUser && (
                                                            <span className="rounded bg-emerald-900/40 text-emerald-300 text-[11px] px-1.5 py-0.5">
                                                                admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    {u.name && <div className="text-zinc-500 text-xs">{u.name}</div>}
                                                </td>
                                                <td className="px-4 py-3 text-zinc-300">{u.generatedToday}</td>
                                                <td className="px-4 py-3 text-zinc-300">
                                                    {u.totalWebsites}{' '}
                                                    <span className="text-zinc-500 text-xs">({u.activeWebsites} aktif)</span>
                                                </td>
                                                <td className="px-4 py-3 text-zinc-400">{fmtDate(u.createdAt)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => resetQuota(u)}
                                                            disabled={busyId === u.id}
                                                            title="Reset token generate hari ini"
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-800 disabled:opacity-50"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" /> Reset
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUser(u)}
                                                            disabled={busyId === u.id || isAdminUser}
                                                            title={isAdminUser ? 'Tidak bisa menghapus admin' : 'Hapus user'}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-800/60 bg-red-900/20 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900/40 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-4 text-xs text-zinc-600">
                        Reset = hapus log generate hari ini (kuota kembali penuh). Hapus = hapus user + semua website &
                        datanya permanen. Admin tidak memiliki batas generate harian.
                    </p>
                </section>
            </div>
        </main>
    )
}
