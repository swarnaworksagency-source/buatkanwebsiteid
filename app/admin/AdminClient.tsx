'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Trash2, RotateCcw, ShieldCheck, Users, AlertTriangle } from 'lucide-react'

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

export default function AdminClient({ adminEmail }: { adminEmail: string }) {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(null)

    const loadUsers = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/admin/users', { cache: 'no-store' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Gagal memuat user.')
            setUsers(data.users)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal memuat user.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

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
                            Masuk sebagai <span className="text-zinc-200">{adminEmail}</span>. Kelola user terdaftar.
                        </p>
                    </div>
                    <button
                        onClick={loadUsers}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Muat ulang
                    </button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                    <Users className="w-4 h-4" /> {users.length} user terdaftar
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

                <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
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
            </div>
        </main>
    )
}
