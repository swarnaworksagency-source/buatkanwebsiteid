import type { Metadata } from 'next'
import { NOINDEX_ROBOTS } from '@/lib/seo'

// Wizard pembuatan website — butuh login dan isinya berubah per sesi pengguna.
export const metadata: Metadata = {
    title: 'Buat Website',
    robots: NOINDEX_ROBOTS,
}

export default function BuatLayout({ children }: { children: React.ReactNode }) {
    return children
}
