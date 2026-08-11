import type { Metadata } from 'next'
import { NOINDEX_ROBOTS } from '@/lib/seo'

// Halaman hasil pembayaran — URL-nya membawa parameter transaksi.
export const metadata: Metadata = {
    robots: NOINDEX_ROBOTS,
}

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
    return children
}
