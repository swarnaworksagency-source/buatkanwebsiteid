import { requireAdmin } from '@/lib/auth'
import AdminClient from './AdminClient'

export const metadata = {
    title: 'Admin',
}

// Halaman admin (gated). requireAdmin() redirect non-admin ke /dashboard
// (lapis kedua selain guard di proxy.ts). Authoritative check ada di sini.
export default async function AdminPage() {
    const user = await requireAdmin()
    return <AdminClient adminEmail={user.email || ''} />
}
