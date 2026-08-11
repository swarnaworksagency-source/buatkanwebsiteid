import type { Metadata } from 'next'
import { NOINDEX_ROBOTS } from '@/lib/seo'

// Panel admin internal.
export const metadata: Metadata = {
    robots: NOINDEX_ROBOTS,
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return children
}
