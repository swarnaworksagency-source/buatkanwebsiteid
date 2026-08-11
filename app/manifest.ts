import type { MetadataRoute } from 'next'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo'

/**
 * Web App Manifest. Bikin situs bisa di-"Add to Home Screen" di Android,
 * dan jadi salah satu sinyal PWA yang dicek Lighthouse.
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: `${SITE_NAME} — Buat Website UMKM dengan AI`,
        short_name: 'BuatkanWeb',
        description: SITE_DESCRIPTION,
        start_url: '/',
        display: 'standalone',
        background_color: '#0D0D0D',
        theme_color: '#1E466B',
        lang: 'id-ID',
        categories: ['business', 'productivity'],
        icons: [
            {
                src: '/Logo buatkanweb.webp',
                sizes: 'any',
                type: 'image/webp',
            },
        ],
    }
}
