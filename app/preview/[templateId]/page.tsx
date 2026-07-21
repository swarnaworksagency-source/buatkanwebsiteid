import { createServerSupabaseClient } from '@/lib/supabase-server'
import PreviewClient from './PreviewClient'
import { AVAILABLE_TEMPLATES } from '@/lib/templates'
import type { TemplateData } from '@/types'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const DUMMY_DATA: TemplateData = {
    hero: { headline: "Buatkanweb.id", subheadline: "Solusi Servis Terpercaya untuk Rumah & Kantor Anda. Buatkanweb.id hadir sebagai mitra terpercaya untuk semua kebutuhan servis.", ctaText: "Hubungi Kami" },
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
    namaBisnis: 'Buatkanweb.id',
    kategori: 'Servis',
    lokasi: 'Jabodetabek',
    kontak: {
        wa: '6281234567890',
        telepon: '021-1234567',
        email: 'hello@buatkanweb.id'
    },
    sosmed: {
        instagram: 'buatkanweb.id',
        tiktok: 'buatkanweb',
        twitter: ''
    },
    warna: {
        primary: '#4f46e5',
        tema: 'dark'
    },
    logo: '/Logo buatkanweb.webp',
    fotoBisnis: [],
    // Foto online (Unsplash) bertema jasa/servis profesional — tim kerja & teknisi.
    portofolio: [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=70',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=70',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=70',
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=70',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70',
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=70',
    ],
    portofolioJudul: ['Servis AC Rutin', 'Perbaikan Mesin Cuci', 'Instalasi Listrik Rumah', 'Perawatan Kantor', 'Bongkar Pasang AC', 'Pengecekan Panel Listrik'],
    paketHarga: [
        { namaPaket: 'Paket Hemat', harga: '150rb', fitur: ['Pengecekan standar', 'Perawatan ringan', 'Garansi 7 hari', 'Konsultasi gratis'], isPopuler: false },
        { namaPaket: 'Paket Profesional', harga: '350rb', fitur: ['Pengecekan menyeluruh', 'Perawatan lengkap', 'Garansi 30 hari', 'Prioritas antrian', 'Konsultasi gratis'], isPopuler: true },
        { namaPaket: 'Paket Premium', harga: '500rb', fitur: ['Full servis komprehensif', 'Perawatan premium', 'Garansi 60 hari', 'Layanan darurat 24/7', 'Konsultasi & laporan', 'Diskon member 10%'], isPopuler: false },
    ],
}

// Dummy data khusus untuk template portofolio personal (personal-001)
const DUMMY_DATA_PERSONAL: TemplateData = {
    hero: { headline: "SONI", subheadline: "UI/UX Designer & Developer", ctaText: "Kerja Sama" },
    about: { judul: "Tentang Saya", deskripsi: "Halo! Saya Soni, seorang desainer dan developer dengan 4 tahun pengalaman membangun antarmuka digital. Saya percaya bahwa desain yang baik bukan hanya soal estetika, tapi juga tentang fungsi dan pengalaman pengguna.", keunggulan: ["4+ Tahun Pengalaman", "50+ Proyek Selesai", "30+ Klien Puas", "Responsif & Aksesibel"] },
    layanan: [
        { nama: "UI/UX Design", deskripsi: "Desain antarmuka yang intuitif, estetis, dan berpusat pada pengguna dari wireframe hingga prototype siap handoff.", harga: "Mulai Rp 1.500.000" },
        { nama: "Frontend Development", deskripsi: "Pengembangan website modern menggunakan React dan Next.js dengan performa tinggi dan kode yang bersih.", harga: "Mulai Rp 2.000.000" },
        { nama: "Brand Identity", deskripsi: "Membangun identitas visual yang kuat dan konsisten untuk brand Anda, mulai dari logo hingga panduan gaya.", harga: "Mulai Rp 800.000" },
    ],
    targetPelanggan: { deskripsi: "Startup & UMKM", painPoint: "Butuh tampilan digital", solusi: "Desain & dev profesional" },
    testimonialPlaceholder: [
        { nama: "Rina Kusuma", peran: "CEO, StartupX", teks: "Soni luar biasa! Desain yang dihasilkan sangat profesional dan sesuai dengan visi brand kami. Prosesnya juga smooth dan komunikatif." },
        { nama: "Dimas Pratama", peran: "Founder, Toko Buku Digital", teks: "Sangat puas dengan hasil kerjanya. Website saya jadi jauh lebih modern dan konversi meningkat signifikan setelah redesign." },
        { nama: "Maya Sari", peran: "Marketing Manager", teks: "Responsif, tepat waktu, dan hasil kerjanya selalu melebihi ekspektasi. Definitely akan kerja sama lagi!" },
    ],
    footer: { tagline: "Mari Wujudkan Ide Anda!", ctaText: "Diskusi Sekarang" },
    namaBisnis: 'Soni',
    kategori: 'UI/UX Design & Development',
    lokasi: 'Yogyakarta (Remote Ready)',
    kontak: {
        wa: '6281234567891',
        telepon: '',
        email: 'hello@alexdesign.id'
    },
    sosmed: {
        instagram: 'alexdesigns_',
        tiktok: '',
        twitter: 'alexdesigns_'
    },
    warna: {
        primary: '#10b981',
        tema: 'dark'
    },
    logo: '',
    fotoBisnis: ['/FotoSoni.webp', '/FotoSoni2.webp', '/FotoSoni3.webp', '/FotoSoni4.webp', '/FotoSoni5.webp'],
    portofolio: [
        '/Portofolio Buatkanweb.webp',
        '/Portofolio Buatkanweb-2.webp',
        '/Portofolio Buatkanweb-3.webp',
        '/Portofolio Buatkanweb-4.webp',
        '/Portofolio Buatkanweb-5.webp',
        '/Portofolio Buatkanweb-6.webp',
    ],
    paketHarga: [
        { namaPaket: 'Starter', harga: 'Rp 1,5jt', fitur: ['1 Halaman Landing Page', 'Desain Mobile-Friendly', 'Revisi 2x', 'Serah terima dalam 5 hari'], isPopuler: false },
        { namaPaket: 'Professional', harga: 'Rp 4jt', fitur: ['Website Multi-halaman', 'UI/UX Design Penuh', 'Revisi tak terbatas', 'SEO Dasar', 'Serah terima dalam 14 hari'], isPopuler: true },
        { namaPaket: 'Enterprise', harga: 'Custom', fitur: ['Proyek Skala Besar', 'Design System Lengkap', 'Development Frontend', 'Konsultasi Produk', 'Support 3 bulan'], isPopuler: false },
    ],
}

// Dummy data khusus template peternakan & agri (peternakan-001)
const DUMMY_DATA_PETERNAKAN: TemplateData = {
    hero: { headline: "Peternakan & Pertanian Organik Terpercaya", subheadline: "Kami membudidayakan hasil bumi dan ternak segar dengan cara organik — sehat, berkualitas, langsung dari kebun ke meja Anda.", ctaText: "Pesan Sekarang" },
    about: { judul: "Dari Kebun Kami untuk Keluarga Anda", deskripsi: "Sudah lebih dari 10 tahun kami mengelola lahan dan ternak dengan metode ramah lingkungan. Tanpa bahan kimia berlebih, hasil panen dan produk ternak kami segar, sehat, dan bisa diandalkan setiap hari.", keunggulan: ["10+|Tahun Pengalaman", "5000+|Pelanggan Puas", "100%|Organik"] },
    layanan: [
        { nama: "Sayur & Buah Organik", deskripsi: "Panen segar setiap hari tanpa pestisida kimia, langsung dari ladang kami.", harga: "Mulai Rp 15.000" },
        { nama: "Susu & Produk Ternak", deskripsi: "Susu sapi segar, telur ayam kampung, dan daging berkualitas dari ternak sehat.", harga: "Mulai Rp 25.000" },
    ],
    targetPelanggan: { deskripsi: "Keluarga & Reseller", painPoint: "Sulit cari produk segar", solusi: "Antar langsung dari kebun" },
    testimonialPlaceholder: [
        { nama: "Ibu Sri Wahyuni", peran: "Ibu Rumah Tangga", teks: "Sayurnya benar-benar segar dan tahan lama. Anak-anak jadi lebih suka makan sayur.", rating: 5 },
        { nama: "Pak Hendra", peran: "Pemilik Restoran", teks: "Pasokan susu dan telur selalu tepat waktu dan kualitasnya konsisten. Sangat terbantu.", rating: 5 },
        { nama: "Dewi Lestari", peran: "Reseller Produk Sehat", teks: "Harga bersaing dan produknya laris manis. Pelayanannya ramah dan amanah.", rating: 5 },
    ],
    footer: { tagline: "Ayo mulai hidup sehat dengan hasil tani segar!", ctaText: "Pesan Sekarang" },
    namaBisnis: 'Tani Makmur',
    kategori: 'Peternakan & Pertanian',
    lokasi: 'Sleman, Yogyakarta',
    kontak: { wa: '6281234567890', telepon: '0274-123456', email: 'halo@tanimakmur.id' },
    sosmed: { instagram: 'tanimakmur.id', tiktok: 'tanimakmur', twitter: '' },
    warna: { primary: '#3E9142', tema: 'light' },
    logo: '',
    fotoBisnis: [],
    portofolio: [
        'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=70',
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=70',
        'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=70',
        'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=70',
    ],
    paketHarga: [
        { namaPaket: 'Paket Mingguan', harga: '75rb', fitur: ['Sayur segar 3 jenis', 'Antar 1x seminggu', 'Area Yogyakarta', 'Bebas ongkir'], isPopuler: false },
        { namaPaket: 'Paket Keluarga', harga: '150rb', fitur: ['Sayur & buah 6 jenis', 'Susu & telur segar', 'Antar 2x seminggu', 'Bebas ongkir', 'Prioritas panen'], isPopuler: true },
        { namaPaket: 'Paket Reseller', harga: '350rb', fitur: ['Produk grosir lengkap', 'Harga khusus reseller', 'Antar fleksibel', 'Pendampingan bisnis', 'Bebas ongkir'], isPopuler: false },
    ],
}

// Foto khusus preview "Agri Corporate" (peternakan-002) — kebun & hasil panen, [0] jadi hero.
const PHOTOS_KEBUN = [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=2000&q=70', // hamparan kebun
    'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=70', // ladang sayur
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=70', // petani di kebun
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=70',    // bibit tumbuh
    'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=1200&q=70', // musim panen
    'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1200&q=70', // traktor di lahan
]

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

    // Pilih dummy data sesuai template
    const isPersonal = templateId.startsWith('personal')
    const isPeternakan = templateId.startsWith('peternakan')
    let finalData = isPersonal ? DUMMY_DATA_PERSONAL : isPeternakan ? DUMMY_DATA_PETERNAKAN : DUMMY_DATA
    // Agri Corporate (peternakan-002) pakai foto bernuansa kebun/lahan panen saja,
    // tanpa foto ternak — template lain di kategori ini tidak terpengaruh.
    if (!isUUID && templateId === 'peternakan-002') {
        finalData = { ...finalData, portofolio: PHOTOS_KEBUN }
    }
    // Template 2 (brutalist-bento) di galeri/preview tetap pakai palet oranye aslinya
    // (bukan warna default personal). Kosongkan primary → template fallback ke STUDIO oranye.
    if (!isUUID && templateId === 'personal-002') {
        finalData = { ...finalData, warna: { ...finalData.warna, primary: '' } }
    }
    // Template yang dipakai untuk render. Untuk UUID, ambil dari kolom template_id website.
    let resolvedTemplateId = templateId

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

        resolvedTemplateId = data.template_id || 'jasa-001'

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
            templateId={resolvedTemplateId}
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
