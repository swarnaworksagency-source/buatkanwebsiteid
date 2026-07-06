import { createClient } from '@supabase/supabase-js'
import { getTemplateComponent } from '@/lib/templateRegistry'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Disable caching — always fetch fresh data from database
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Create a fresh Supabase client per request to avoid stale data
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            db: { schema: 'public' },
            global: {
                headers: { 'Cache-Control': 'no-cache' }
            }
        }
    )
}

interface SubdomainPageProps {
    params: Promise<{ subdomain: string }>
}

export default async function SubdomainPage({ params }: SubdomainPageProps) {
    const { subdomain } = await params
    const supabase = getSupabase()

    const { data: website } = await supabase
        .from('websites')
        .select('*')
        .eq('subdomain', subdomain)
        .single()

    if (!website) notFound()

    // Masa aktif habis → jangan render website; tampilkan halaman nonaktif.
    // (Status diturunkan 'active'→'expired' oleh cron /api/cron/expiry.)
    if (website.status === 'expired') {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ maxWidth: '420px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>😴</div>
                    <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 10px' }}>
                        Website ini sedang tidak aktif
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.7, margin: '0 0 24px' }}>
                        Masa aktif <strong style={{ color: '#e2e8f0' }}>{subdomain}.{process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'buatkanweb.id'}</strong> telah
                        berakhir. Pemilik website bisa mengaktifkannya kembali lewat dashboard.
                    </p>
                    <a
                        href="https://www.buatkanweb.id/dashboard"
                        style={{ display: 'inline-block', background: '#1E466B', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none', padding: '12px 28px', borderRadius: '12px' }}
                    >
                        Saya pemiliknya — perpanjang sekarang
                    </a>
                </div>
            </main>
        )
    }

    // Pilih komponen template sesuai template_id website (jasa / personal / dst).
    // Jangan hardcode TemplateSatu — website portofolio harus render template-nya sendiri.
    const content = website.generated_content || {}
    const TemplateComponent = getTemplateComponent(website.template_id || 'jasa-001')

    return (
        <TemplateComponent
            hero={content.hero}
            about={content.about}
            layanan={content.layanan}
            keahlian={content.keahlian}
            namaPanggilan={content.namaPanggilan}
            lokasi={content.lokasi}
            targetPelanggan={content.targetPelanggan}
            testimonialPlaceholder={content.testimonialPlaceholder}
            footer={content.footer}
            caraKerja={content.caraKerja}
            caraKerjaTitle={content.caraKerjaTitle}
            namaBisnis={content.namaBisnis || website.nama_usaha || 'Bisnis'}
            kontak={content.kontak}
            sosmed={content.sosmed}
            warna={content.warna}
            paketHarga={content.paketHarga}
            logo={content.logo || website.logo_url}
            fotoBisnis={content.fotoBisnis}
            portofolio={content.portofolio || website.foto_urls}
            isEditable={false}
            isEditMode={false}
        />
    )
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: SubdomainPageProps): Promise<Metadata> {
    const { subdomain } = await params
    const supabase = getSupabase()

    const { data: website } = await supabase
        .from('websites')
        .select('generated_content, nama_usaha, kategori')
        .eq('subdomain', subdomain)
        .single()

    if (!website) return {}

    const content = website.generated_content || {}
    const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'buatkanweb.id'
    const siteUrl = `https://${subdomain}.${mainDomain}`

    const title = content?.seo?.metaTitle || content?.namaBisnis || website.nama_usaha || 'Website'
    const description = content?.seo?.metaDescription || content?.hero?.subheadline || ''

    return {
        title,
        description,
        keywords: [
            content?.namaBisnis || website.nama_usaha,
            website.kategori,
            content?.lokasi,
            ...(content?.layanan?.map((l: { nama: string }) => l.nama) || []),
        ].filter(Boolean).join(', '),
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
            },
        },
        alternates: {
            canonical: siteUrl,
        },
        openGraph: {
            title: content?.namaBisnis || website.nama_usaha || 'Website',
            description,
            url: siteUrl,
            siteName: content?.namaBisnis || website.nama_usaha || 'Website',
            images: content?.logo ? [{ url: content.logo, alt: content?.namaBisnis || website.nama_usaha }] : [],
            type: 'website',
            locale: 'id_ID',
        },
        twitter: {
            card: 'summary_large_image',
            title: content?.namaBisnis || website.nama_usaha || 'Website',
            description,
            images: content?.logo ? [content.logo] : [],
        },
        icons: content?.logo ? {
            icon: [{ url: content.logo, rel: 'icon' }],
            shortcut: [{ url: content.logo, rel: 'shortcut icon' }],
            apple: [{ url: content.logo, rel: 'apple-touch-icon' }],
        } : undefined,
    }
}
