/**
 * Konstanta & helper SEO terpusat.
 *
 * Satu sumber kebenaran untuk URL kanonik. Jangan hardcode "https://buatkanweb.id"
 * di file lain — impor dari sini, supaya ganti domain cukup di satu tempat.
 *
 * Domain kanonik = WWW, mengikuti kenyataan di produksi: Caddy di VPS sudah
 * me-301 apex (buatkanweb.id) ke www.buatkanweb.id. Canonical WAJIB menunjuk
 * URL yang menjawab 200 — kalau diarahkan ke apex, Google mengikuti redirect
 * dan menemukan canonical yang menunjuk ke halaman yang mengalihkannya pergi.
 *
 * Kalau suatu saat arah redirect dibalik (www → apex) di /etc/caddy/Caddyfile,
 * ubah juga konstanta ini. Keduanya harus searah.
 */

export const SITE_URL = 'https://www.buatkanweb.id'

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
