import type { Metadata } from 'next'
import { NOINDEX_ROBOTS } from '@/lib/seo'

// Halaman login/daftar/reset password. Tidak ada nilai SEO dan tidak boleh
// muncul di hasil pencarian.
export const metadata: Metadata = {
    robots: NOINDEX_ROBOTS,
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return children
}
