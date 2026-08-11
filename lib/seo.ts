/**
 * Konstanta & helper SEO terpusat.
 *
 * Satu sumber kebenaran untuk URL kanonik. Jangan hardcode "https://buatkanweb.id"
 * di file lain — impor dari sini, supaya ganti domain cukup di satu tempat.
 *
 * Domain kanonik = APEX (tanpa www). Pastikan www.buatkanweb.id di-301 ke apex
 * di level DNS/host, kalau tidak Google akan melihat dua situs identik.
 */

export const SITE_URL = 'https://buatkanweb.id'

export const SITE_NAME = 'BuatkanWeb.id'

export const SITE_TAGLINE = 'Jasa Buat Website UMKM Otomatis dengan AI'

/** Dipakai sebagai meta description halaman utama & fallback OG. */
export const SITE_DESCRIPTION =
    'Buatkan web untuk usaha Anda dalam 5 menit. Isi form sederhana, AI langsung menyusun website profesional lengkap dengan domain. Tanpa coding, tanpa prompt. Mulai Rp99.000 untuk UMKM Indonesia.'

/**
 * Kata kunci utama yang dibidik. Urutan = prioritas.
 * Catatan: meta keywords sudah diabaikan Google sejak 2009 — ini dipertahankan
 * untuk mesin pencari lain & sebagai dokumentasi target kata kunci tim.
 */
export const SITE_KEYWORDS = [
    'buatkan web',
    'buatkanweb',
    'buatkan website',
    'jasa buat website',
    'buat website UMKM',
    'website builder Indonesia',
    'bikin website otomatis',
    'website murah UMKM',
    'jasa pembuatan website murah',
    'buat website tanpa coding',
    'AI website builder',
    'landing page UMKM',
]

/** Path yang tidak boleh masuk indeks Google (area privat / duplikat / transaksional). */
export const NOINDEX_PATHS = [
    '/api/',
    '/dashboard',
    '/admin',
    '/auth',
    '/payment',
    '/preview',
    '/preview-full',
    '/buat',
    // Website pelanggan hidup di subdomain (foo.buatkanweb.id). Path /s/foo di apex
    // menyajikan konten yang persis sama → duplicate content. Blokir yang di apex.
    '/s/',
]

/** Bangun URL absolut dari path relatif. */
export function absoluteUrl(path = '/'): string {
    return new URL(path, SITE_URL).toString()
}

/**
 * `robots` metadata untuk halaman yang tidak boleh diindeks.
 * Sebar ke semua halaman ber-auth / transaksional.
 */
export const NOINDEX_ROBOTS = {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
} as const
