import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * sitemap.xml domain utama.
 *
 * Isinya sengaja cuma beranda:
 * - Galeri template & wizard ada di balik login → Google tak bisa merayapinya.
 * - Preview template & /s/ diblokir di robots.txt (thin/duplicate content).
 * - URL ber-#anchor TIDAK boleh dimasukkan: crawler membuang fragment, jadi
 *   `/#harga` terbaca sebagai `/` dan sitemap dianggap berisi duplikat.
 *
 * Website pelanggan juga tidak masuk sini — mereka di host lain
 * (namausaha.buatkanweb.id) dan sitemap lintas-host ditolak Google kecuali
 * lewat cross-submission. Kalau nanti perlu, bikin route sitemap terpisah
 * di dalam segmen `/s/[subdomain]`.
 *
 * Tambahkan entri baru di sini setiap kali ada halaman publik baru
 * (mis. /blog, /panduan, /template).
 */
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
    ]
}
