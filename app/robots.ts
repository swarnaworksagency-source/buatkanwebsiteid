import type { MetadataRoute } from 'next'
import { SITE_URL, NOINDEX_PATHS } from '@/lib/seo'

/**
 * robots.txt untuk domain utama (buatkanweb.id).
 *
 * Catatan subdomain: proxy.ts menulis ulang SEMUA path di `*.buatkanweb.id`
 * ke `/s/<sub>/...`, jadi `foo.buatkanweb.id/robots.txt` menghasilkan 404 —
 * dan 404 diperlakukan crawler sebagai "boleh crawl semua". Itu memang yang
 * kita mau: website pelanggan bebas diindeks.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                // Area privat, transaksional, dan halaman duplikat.
                // `/s/` diblokir karena buatkanweb.id/s/foo menyajikan konten
                // yang identik dengan foo.buatkanweb.id (duplicate content).
                disallow: NOINDEX_PATHS,
            },
            {
                // Perayap AI: dibiarkan masuk. Muncul di jawaban ChatGPT/Perplexity
                // saat orang tanya "bikin website UMKM" adalah kanal akuisisi nyata.
                userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'],
                allow: '/',
                disallow: NOINDEX_PATHS,
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}
