import { createClient } from '@supabase/supabase-js'
import TemplateSatu from '@/components/templates/TemplateSatu'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface SubdomainPageProps {
    params: Promise<{ subdomain: string }>
}

export default async function SubdomainPage({ params }: SubdomainPageProps) {
    const { subdomain } = await params
    const { data: website } = await supabase
        .from('websites')
        .select('*')
        .eq('subdomain', subdomain)
        .single()

    if (!website) notFound()

    // Spread generated_content as individual props to TemplateSatu
    const content = website.generated_content || {}

    return (
        <TemplateSatu
            hero={content.hero}
            about={content.about}
            layanan={content.layanan}
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
            logo={content.logo}
            fotoBisnis={content.fotoBisnis}
            portofolio={content.portofolio}
            isEditable={false}
            isEditMode={false}
        />
    )
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: SubdomainPageProps): Promise<Metadata> {
    const { subdomain } = await params
    const { data: website } = await supabase
        .from('websites')
        .select('generated_content, nama_usaha')
        .eq('subdomain', subdomain)
        .single()

    if (!website) return {}

    const content = website.generated_content || {}

    return {
        title: content?.seo?.metaTitle || content?.namaBisnis || website.nama_usaha || 'Website',
        description: content?.seo?.metaDescription || content?.hero?.subheadline || '',
        openGraph: {
            title: content?.namaBisnis || website.nama_usaha || 'Website',
            description: content?.hero?.subheadline || '',
            images: content?.logo ? [content.logo] : [],
            type: 'website',
            locale: 'id_ID',
        },
        icons: content?.logo ? {
            icon: [{ url: content.logo, rel: 'icon' }],
            shortcut: [{ url: content.logo, rel: 'shortcut icon' }],
            apple: [{ url: content.logo, rel: 'apple-touch-icon' }],
        } : undefined,
    }
}
