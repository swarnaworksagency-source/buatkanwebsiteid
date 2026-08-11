import type { Metadata } from 'next'
import { NOINDEX_ROBOTS } from '@/lib/seo'

// Preview template memakai data dummy yang sama untuk semua template, dan versi
// UUID-nya menduplikasi website pelanggan. Dua-duanya thin/duplicate content —
// kalau diindeks justru menurunkan kualitas domain di mata Google.
export const metadata: Metadata = {
    robots: NOINDEX_ROBOTS,
}

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
    return children
}
