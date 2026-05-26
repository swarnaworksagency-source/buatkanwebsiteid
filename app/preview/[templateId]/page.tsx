import { createServerSupabaseClient } from '@/lib/supabase-server'
import PreviewClient from './PreviewClient'
import type { TemplateData } from '@/types'
import type { Metadata } from 'next'

const AVAILABLE_TEMPLATES: Record<string, { name: string; kategori: string }> = {
    'jasa-001': { name: 'Jasa Minimal', kategori: 'jasa' },
}

const DUMMY_DATA: TemplateData = {
    hero: { headline: "TeknikPro", subheadline: "Solusi Servis Terpercaya untuk Rumah & Kantor Anda. TeknikPro hadir sebagai mitra terpercaya untuk semua kebutuhan servis.", ctaText: "Hubungi Kami" },
    about: { judul: "Mengapa Memilih Kami?", deskripsi: "Lebih dari 5 tahun pengalaman melayani ribuan pelanggan di Jabodetabek. Teknisi kami bersertifikat resmi dengan jaminan garansi di setiap pengerjaan.", keunggulan: ["Berpengalaman 5+ Tahun", "Teknisi Bersertifikat", "Jaminan Garansi"] },
    layanan: [
        { nama: "Servis AC", deskripsi: "Pengecekan dan perbaikan AC", harga: "Mulai Rp 100.000" },
        { nama: "Perbaikan Mesin Cuci", deskripsi: "Perbaikan kerusakan mesin cuci", harga: "Mulai Rp 150.000" },
        { nama: "Instalasi Listrik", deskripsi: "Pemasangan instalasi listrik", harga: "Hubungi Kami" }
    ],
    targetPelanggan: { deskripsi: "Pemilik Rumah & Kantor", painPoint: "Peralatan rusak", solusi: "Layanan perbaikan cepat" },
    testimonialPlaceholder: [
        { nama: "Budi Santoso", peran: "Pemilik Rumah", teks: "Pelayanan sangat profesional dan cepat." },
        { nama: "Siti Rahmawati", peran: "Manager Kantor", teks: "Sangat direkomendasikan untuk perawatan kantor." },
        { nama: "Ahmad Fauzi", peran: "Pemilik UMKM", teks: "Harga terjangkau dan bergaransi." }
    ],
    footer: { tagline: "Mitra Servis Anda", ctaText: "Konsultasi Gratis" },
    namaBisnis: 'TeknikPro',
    kategori: 'Servis',
    lokasi: 'Jabodetabek',
    kontak: {
        wa: '6281234567890',
        telepon: '021-1234567',
        email: 'hello@teknikpro.id'
    },
    sosmed: {
        instagram: 'teknikpro.id',
        tiktok: 'teknikpro',
        twitter: ''
    },
    warna: {
        primary: '#4f46e5',
        tema: 'dark'
    },
    logo: '',
    fotoBisnis: [],
    portofolio: [],
    paketHarga: [
        { namaPaket: 'Paket Hemat', harga: '150rb', fitur: ['Pengecekan standar', 'Perawatan ringan', 'Garansi 7 hari', 'Konsultasi gratis'], isPopuler: false },
        { namaPaket: 'Paket Profesional', harga: '350rb', fitur: ['Pengecekan menyeluruh', 'Perawatan lengkap', 'Garansi 30 hari', 'Prioritas antrian', 'Konsultasi gratis'], isPopuler: true },
        { namaPaket: 'Paket Premium', harga: '500rb', fitur: ['Full servis komprehensif', 'Perawatan premium', 'Garansi 60 hari', 'Layanan darurat 24/7', 'Konsultasi & laporan', 'Diskon member 10%'], isPopuler: false },
    ],
}

export default async function PreviewTemplatePage(props: {
    params: Promise<{ templateId: string }>
    searchParams: Promise<{ embed?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const { templateId } = params
    const isEmbed = searchParams.embed === 'true'
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateId)
    const template = !isUUID ? AVAILABLE_TEMPLATES[templateId] : null

    let finalData = DUMMY_DATA

    if (isUUID) {
        const supabase = await createServerSupabaseClient()
        const { data, error } = await supabase.from('websites').select('*').eq('id', templateId).single()

        if (!data) {
            return (
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
                    <div className="text-zinc-500 font-medium">Website preview tidak ditemukan atau sudah dihapus.</div>
                </div>
            )
        }

        if (data?.generated_content) {
            const content = data.generated_content;
            const loadedFormData = content.__formData || {};
            finalData = {
                ...content,
                namaBisnis: content.namaBisnis || loadedFormData.namaBisnis || "",
                kategori: content.kategori || loadedFormData.kategoriJasa || "",
                lokasi: content.lokasi || loadedFormData.lokasi || "",
                kontak: content.kontak || { wa: loadedFormData.nomorWhatsApp, telepon: loadedFormData.telepon, email: loadedFormData.email },
                sosmed: content.sosmed || { instagram: loadedFormData.instagram, tiktok: loadedFormData.tiktok, twitter: loadedFormData.x_twitter },
                warna: content.warna || { primary: loadedFormData.primaryColor, tema: loadedFormData.tema || "light" },
                paketHarga: content.paketHarga || loadedFormData.paketHarga || [],
                logo: data.logo_url || "",
                portofolio: data.foto_urls || [],
                fotoBisnis: content.fotoBisnis || [],
            }
        }
    } else if (!template) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <span className="text-zinc-500 text-2xl">?</span>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Template Tidak Tersedia</h1>
                </div>
            </div>
        )
    }

    return (
        <PreviewClient
            templateId={templateId}
            templateName={template?.name || null}
            isEmbed={isEmbed}
            data={finalData}
        />
    )
}

export async function generateMetadata(props: {
    params: Promise<{ templateId: string }>
}): Promise<Metadata> {
    const params = await props.params;
    const { templateId } = params

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateId)
    if (!isUUID) return {}

    const supabase = await createServerSupabaseClient()
    const { data: website } = await supabase
        .from('websites')
        .select('generated_content, nama_usaha')
        .eq('id', templateId)
        .single()

    if (!website) return {}

    const content = website.generated_content || {}

    return {
        title: content?.seo?.metaTitle || content?.namaBisnis || website.nama_usaha || 'Preview Website',
        description: content?.seo?.metaDescription || content?.hero?.subheadline || '',
        openGraph: {
            title: content?.namaBisnis || website.nama_usaha || 'Preview Website',
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
