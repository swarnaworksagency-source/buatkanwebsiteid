import type { Metadata } from 'next'
import { NOINDEX_ROBOTS } from '@/lib/seo'

// Area ber-login. Tidak boleh masuk indeks Google.
// Diwariskan ke seluruh /dashboard/** termasuk galeri template.
export const metadata: Metadata = {
    robots: NOINDEX_ROBOTS,
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return children
}
