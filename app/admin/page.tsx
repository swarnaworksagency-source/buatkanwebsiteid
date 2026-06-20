import { requireAdmin } from '@/lib/auth'

export const metadata = {
    title: 'Admin',
}

// Halaman admin (gated). requireAdmin() redirect non-admin ke /dashboard
// (lapis kedua selain guard di proxy.ts). Authoritative check ada di sini.
export default async function AdminPage() {
    const user = await requireAdmin()

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold">Panel Admin</h1>
                <p className="mt-2 text-sm text-zinc-400">
                    Masuk sebagai <span className="text-zinc-200">{user.email}</span> (role: admin).
                </p>

                {/* TODO: konten admin — mis. daftar semua website/payment lintas user,
                    total revenue, count active. Pakai service-role client utk baca lintas user. */}
                <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-500">
                    Belum ada konten. Tambahkan fitur admin di sini.
                </div>
            </div>
        </main>
    )
}
