import type { Metadata } from 'next'
import { NOINDEX_ROBOTS } from '@/lib/seo'

// Preview layar penuh — duplikat dari halaman preview.
export const metadata: Metadata = {
    robots: NOINDEX_ROBOTS,
}

export default function PreviewFullLayout({ children }: { children: React.ReactNode }) {
    return children
}
