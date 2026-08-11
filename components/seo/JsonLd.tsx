import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from '@/lib/seo'

/**
 * Structured data (JSON-LD schema.org).
 *
 * Ini yang bikin Google paham "BuatkanWeb.id itu apa" — bukan sekadar
 * mencocokkan kata. Hasilnya: rich result (sitelink, harga, FAQ dropdown)
 * dan knowledge panel untuk pencarian brand "buatkanweb".
 *
 * Server component — tidak ada JS yang dikirim ke browser.
 */

/** Render satu blok <script type="application/ld+json">. */
function JsonLdScript({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            // Aman: `data` selalu objek literal milik kita (bukan input user),
            // dan JSON.stringify meng-escape isinya.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    )
}

/** ID node supaya antar-schema bisa saling referensi (praktik terbaik schema.org). */
const ORG_ID = `${SITE_URL}/#organization`
const SITE_ID = `${SITE_URL}/#website`

/**
 * Organization + WebSite. Dipasang di root layout → ikut ke semua halaman.
 * WebSite.potentialAction memberi Google kandidat sitelinks searchbox.
 */
export function OrganizationJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': ORG_ID,
                name: SITE_NAME,
                alternateName: ['BuatkanWeb', 'Buatkan Web', 'buatkanweb.id'],
                url: SITE_URL,
                logo: {
                    '@type': 'ImageObject',
                    url: absoluteUrl('/Logo buatkanweb.webp'),
                },
                description: SITE_DESCRIPTION,
                foundingDate: '2025',
                founder: {
                    '@type': 'Organization',
                    name: 'SwarnaWorks Creative Agency',
                },
                areaServed: {
                    '@type': 'Country',
                    name: 'Indonesia',
                },
                knowsLanguage: 'id-ID',
                sameAs: ['https://instagram.com/buatkanweb.id'],
                contactPoint: [
                    {
                        '@type': 'ContactPoint',
                        telephone: '+6282136111625',
                        contactType: 'customer support',
                        areaServed: 'ID',
                        availableLanguage: ['Indonesian'],
                    },
                ],
            },
            {
                '@type': 'WebSite',
                '@id': SITE_ID,
                url: SITE_URL,
                name: SITE_NAME,
                description: SITE_DESCRIPTION,
                inLanguage: 'id-ID',
                publisher: { '@id': ORG_ID },
            },
        ],
    }

    return <JsonLdScript data={data} />
}

/**
 * SoftwareApplication + daftar harga.
 * Hanya untuk halaman utama — jangan duplikat di halaman lain.
 */
export function ProductJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Website Builder',
        operatingSystem: 'Web',
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: 'id-ID',
        publisher: { '@id': ORG_ID },
        featureList: [
            'Pembuatan website otomatis dengan AI',
            'Tanpa coding dan tanpa prompt',
            'Edit konten langsung di halaman',
            'Subdomain gratis namausaha.buatkanweb.id',
            'Terhubung WhatsApp',
            'Optimasi SEO bawaan',
        ],
        offers: [
            {
                '@type': 'Offer',
                name: 'Gratis',
                price: '0',
                priceCurrency: 'IDR',
                description: 'Preview website 14 hari, 3x generate per hari, tanpa kartu kredit.',
                availability: 'https://schema.org/InStock',
            },
            {
                '@type': 'Offer',
                name: 'Subdomain',
                price: '99000',
                priceCurrency: 'IDR',
                description:
                    'Website langsung online di namausaha.buatkanweb.id. Harga early adopter untuk 75 website pertama, selanjutnya Rp199.000. Perpanjangan Rp50.000/bulan.',
                availability: 'https://schema.org/InStock',
                url: absoluteUrl('/#harga'),
            },
            {
                '@type': 'Offer',
                name: 'Custom',
                price: '249000',
                priceCurrency: 'IDR',
                description: 'Website custom sesuai identitas usaha, dikerjakan tim SwarnaWorks.',
                availability: 'https://schema.org/InStock',
            },
        ],
    }

    return <JsonLdScript data={data} />
}

export interface FaqItem {
    pertanyaan: string
    jawaban: string
}

/**
 * FAQPage. Jawaban WAJIB sama persis dengan teks yang terlihat di halaman —
 * kalau beda, Google menganggapnya cloaking dan rich result-nya dicabut.
 */
export function FaqJsonLd({ items }: { items: readonly FaqItem[] }) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.pertanyaan,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.jawaban,
            },
        })),
    }

    return <JsonLdScript data={data} />
}

/** Breadcrumb untuk halaman selain root. `items` urut dari beranda ke halaman aktif. */
export function BreadcrumbJsonLd({ items }: { items: readonly { name: string; path: string }[] }) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: absoluteUrl(item.path),
        })),
    }

    return <JsonLdScript data={data} />
}
