// Centralized template registry — all template metadata lives here.
// Import from here instead of duplicating in multiple components.

export interface TemplateCategory {
    id: string
    name: string
    desc: string
    number: string
    comingSoon: boolean
    accent: {
        border: string
        borderSelected: string
        bg: string
        iconBg: string
        iconColor: string
        badge: string
        glow: string
    }
}

export interface TemplateItem {
    id: string
    nama: string
    kategori: string
    status: 'available' | 'coming_soon'
    badge?: string
}

export const CATEGORIES: TemplateCategory[] = [
    {
        id: 'jasa',
        name: 'Bisnis Jasa',
        desc: 'Salon, Bengkel, Laundry, Fotografi, dll',
        number: '01',
        comingSoon: false,
        accent: {
            border: 'border-[#1E466B]/30 hover:border-[#67BAF4]/60',
            borderSelected: 'border-[#67BAF4] shadow-[0_0_30px_-5px_rgba(103,186,244,0.35)]',
            bg: 'from-[#0f1a2e] to-[#162a4a]',
            iconBg: 'bg-[#1E466B]/20',
            iconColor: 'text-[#67BAF4]',
            badge: 'bg-[#1E466B]/30 text-[#67BAF4]',
            glow: 'bg-[#67BAF4]/8',
        },
    },
    {
        id: 'peternakan',
        name: 'Peternakan & Agri',
        desc: 'Ternak Ayam, Sapi, Kambing, Perikanan, dll',
        number: '02',
        comingSoon: false,
        accent: {
            border: 'border-lime-500/20 hover:border-lime-400/50',
            borderSelected: 'border-lime-400 shadow-[0_0_30px_-5px_rgba(163,230,53,0.3)]',
            bg: 'from-[#16210a] to-[#22330f]',
            iconBg: 'bg-lime-500/15',
            iconColor: 'text-lime-400',
            badge: 'bg-lime-500/20 text-lime-400',
            glow: 'bg-lime-500/6',
        },
    },
    {
        id: 'fnb',
        name: 'Bisnis Kuliner (FnB)',
        desc: 'Warung Makan, Kafe, Bakery, Catering, dll',
        number: '03',
        comingSoon: true,
        accent: {
            border: 'border-amber-500/20 hover:border-amber-400/50',
            borderSelected: 'border-amber-400 shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]',
            bg: 'from-[#1a1508] to-[#2a2010]',
            iconBg: 'bg-amber-500/15',
            iconColor: 'text-amber-400',
            badge: 'bg-amber-500/20 text-amber-400',
            glow: 'bg-amber-500/6',
        },
    },
    {
        id: 'kreatif',
        name: 'Kreatif & Kerajinan',
        desc: 'Batik, Keramik, Handmade, Desainer, dll',
        number: '04',
        comingSoon: true,
        accent: {
            border: 'border-purple-500/20 hover:border-purple-400/50',
            borderSelected: 'border-purple-400 shadow-[0_0_30px_-5px_rgba(192,132,252,0.3)]',
            bg: 'from-[#150f2e] to-[#1f1640]',
            iconBg: 'bg-purple-500/15',
            iconColor: 'text-purple-400',
            badge: 'bg-purple-500/20 text-purple-400',
            glow: 'bg-purple-500/6',
        },
    },
    {
        id: 'personal',
        name: 'Portofolio Pribadi',
        desc: 'Freelancer, Developer, Desainer, CV Online, dll',
        number: '05',
        comingSoon: false,
        accent: {
            border: 'border-emerald-500/20 hover:border-emerald-400/50',
            borderSelected: 'border-emerald-400 shadow-[0_0_30px_-5px_rgba(52,211,153,0.3)]',
            bg: 'from-[#0f2e1f] to-[#164a30]',
            iconBg: 'bg-emerald-500/15',
            iconColor: 'text-emerald-400',
            badge: 'bg-emerald-500/20 text-emerald-400',
            glow: 'bg-emerald-500/6',
        },
    },
]

export const TEMPLATES_BY_KATEGORI: Record<string, TemplateItem[]> = {
    jasa: [
        // jasa-001 (Klasik) & jasa-002 (Neon) bisa diakses; sisanya tetap tampil sebagai
        // kartu "coming soon" (belum bisa dipilih) karena masih perlu polish.
        { id: 'jasa-001', nama: 'Klasik', kategori: 'jasa', status: 'available', badge: 'Populer' },
        { id: 'jasa-002', nama: 'Neon', kategori: 'jasa', status: 'available', badge: 'Baru' },
        { id: 'jasa-003', nama: 'Hangat', kategori: 'jasa', status: 'coming_soon' },
        { id: 'jasa-004', nama: 'Tegas', kategori: 'jasa', status: 'coming_soon' },
        { id: 'jasa-005', nama: 'Minimalist', kategori: 'jasa', status: 'coming_soon' },
        { id: 'jasa-006', nama: 'Colorful', kategori: 'jasa', status: 'coming_soon' },
        { id: 'jasa-007', nama: 'Corporate', kategori: 'jasa', status: 'coming_soon' },
        { id: 'jasa-008', nama: 'Creative', kategori: 'jasa', status: 'coming_soon' },
        { id: 'jasa-009', nama: 'Premium', kategori: 'jasa', status: 'coming_soon' },
        { id: 'jasa-010', nama: 'Exclusive', kategori: 'jasa', status: 'coming_soon' },
    ],
    fnb: [
        { id: 'fnb-001', nama: 'Classic', kategori: 'fnb', status: 'coming_soon', badge: 'Populer' },
        { id: 'fnb-002', nama: 'Warm', kategori: 'fnb', status: 'coming_soon' },
        { id: 'fnb-003', nama: 'Minimalist', kategori: 'fnb', status: 'coming_soon' },
        { id: 'fnb-004', nama: 'Cozy', kategori: 'fnb', status: 'coming_soon' },
        { id: 'fnb-005', nama: 'Fresh', kategori: 'fnb', status: 'coming_soon' },
        { id: 'fnb-006', nama: 'Rustic', kategori: 'fnb', status: 'coming_soon' },
        { id: 'fnb-007', nama: 'Urban', kategori: 'fnb', status: 'coming_soon' },
        { id: 'fnb-008', nama: 'Elegant', kategori: 'fnb', status: 'coming_soon' },
        { id: 'fnb-009', nama: 'Premium', kategori: 'fnb', status: 'coming_soon' },
        { id: 'fnb-010', nama: 'Exclusive', kategori: 'fnb', status: 'coming_soon' },
    ],
    kreatif: [
        { id: 'kreatif-001', nama: 'Classic', kategori: 'kreatif', status: 'coming_soon', badge: 'Populer' },
        { id: 'kreatif-002', nama: 'Artsy', kategori: 'kreatif', status: 'coming_soon' },
        { id: 'kreatif-003', nama: 'Minimalist', kategori: 'kreatif', status: 'coming_soon' },
        { id: 'kreatif-004', nama: 'Bold', kategori: 'kreatif', status: 'coming_soon' },
        { id: 'kreatif-005', nama: 'Earthy', kategori: 'kreatif', status: 'coming_soon' },
        { id: 'kreatif-006', nama: 'Colorful', kategori: 'kreatif', status: 'coming_soon' },
        { id: 'kreatif-007', nama: 'Handcraft', kategori: 'kreatif', status: 'coming_soon' },
        { id: 'kreatif-008', nama: 'Studio', kategori: 'kreatif', status: 'coming_soon' },
        { id: 'kreatif-009', nama: 'Premium', kategori: 'kreatif', status: 'coming_soon' },
        { id: 'kreatif-010', nama: 'Exclusive', kategori: 'kreatif', status: 'coming_soon' },
    ],
    peternakan: [
        { id: 'peternakan-001', nama: 'Classic', kategori: 'peternakan', status: 'available', badge: 'Baru' },
        { id: 'peternakan-002', nama: 'Agri Corporate', kategori: 'peternakan', status: 'available', badge: 'Baru' },
        { id: 'peternakan-003', nama: 'Minimalist', kategori: 'peternakan', status: 'coming_soon' },
        { id: 'peternakan-004', nama: 'Modern Farm', kategori: 'peternakan', status: 'coming_soon' },
        { id: 'peternakan-005', nama: 'Fresh', kategori: 'peternakan', status: 'coming_soon' },
        { id: 'peternakan-006', nama: 'Rustic', kategori: 'peternakan', status: 'coming_soon' },
        { id: 'peternakan-007', nama: 'Organik', kategori: 'peternakan', status: 'coming_soon' },
        { id: 'peternakan-008', nama: 'Bold', kategori: 'peternakan', status: 'coming_soon' },
        { id: 'peternakan-009', nama: 'Premium', kategori: 'peternakan', status: 'coming_soon' },
        { id: 'peternakan-010', nama: 'Exclusive', kategori: 'peternakan', status: 'coming_soon' },
    ],
    toko: [
        { id: 'toko-001', nama: 'Classic', kategori: 'toko', status: 'coming_soon', badge: 'Populer' },
        { id: 'toko-002', nama: 'Grosir', kategori: 'toko', status: 'coming_soon' },
        { id: 'toko-003', nama: 'Minimalist', kategori: 'toko', status: 'coming_soon' },
        { id: 'toko-004', nama: 'Modern Store', kategori: 'toko', status: 'coming_soon' },
        { id: 'toko-005', nama: 'Fresh Market', kategori: 'toko', status: 'coming_soon' },
        { id: 'toko-006', nama: 'Urban', kategori: 'toko', status: 'coming_soon' },
        { id: 'toko-007', nama: 'Corporate', kategori: 'toko', status: 'coming_soon' },
        { id: 'toko-008', nama: 'Bold', kategori: 'toko', status: 'coming_soon' },
        { id: 'toko-009', nama: 'Premium', kategori: 'toko', status: 'coming_soon' },
        { id: 'toko-010', nama: 'Exclusive', kategori: 'toko', status: 'coming_soon' },
    ],
    personal: [
        { id: 'personal-001', nama: 'Ink and Lime', kategori: 'personal', status: 'available', badge: 'Populer' },
        { id: 'personal-002', nama: 'Elegant', kategori: 'personal', status: 'available' },
        { id: 'personal-003', nama: 'Modern', kategori: 'personal', status: 'available' },
        { id: 'personal-004', nama: 'Developer', kategori: 'personal', status: 'coming_soon' },
        { id: 'personal-005', nama: 'Designer', kategori: 'personal', status: 'coming_soon' },
        { id: 'personal-006', nama: 'Freelancer', kategori: 'personal', status: 'coming_soon' },
        { id: 'personal-007', nama: 'Modern Resume', kategori: 'personal', status: 'coming_soon' },
        { id: 'personal-008', nama: 'Dark Mode', kategori: 'personal', status: 'coming_soon' },
        { id: 'personal-009', nama: 'Premium', kategori: 'personal', status: 'coming_soon' },
        { id: 'personal-010', nama: 'Exclusive', kategori: 'personal', status: 'coming_soon' },
    ],
}

// Templates available for preview (not coming_soon)
export const AVAILABLE_TEMPLATES: Record<string, { name: string; kategori: string }> = {
    'jasa-001': { name: 'Jasa Klasik', kategori: 'jasa' },
    'jasa-002': { name: 'Jasa Neon', kategori: 'jasa' },
    'personal-001': { name: 'Ink and Lime', kategori: 'personal' },
    'personal-002': { name: 'Elegant', kategori: 'personal' },
    'personal-003': { name: 'Modern', kategori: 'personal' },
    'peternakan-001': { name: 'Agri Classic', kategori: 'peternakan' },
    'peternakan-002': { name: 'Agri Corporate', kategori: 'peternakan' },
}

/* ─────────────────────────────────────────────────────────────
   Kebutuhan foto per template.

   `slots` = foto bernama yang mengisi posisi tetap di template,
   disimpan ke `formData.fotoBisnis[idx]` (index DIPERTAHANKAN,
   slot kosong tetap string kosong). `portofolio` = foto berulang
   (kartu produk/galeri) yang diupload lewat uploader multi.

   Form `/buat` step 3 render UI-nya dari sini, template membaca
   index yang sama — satu sumber kebenaran, jangan duplikat di JSX.
   ───────────────────────────────────────────────────────────── */
export interface TemplatePhotoSlot {
    idx: number
    title: string
    /** keterangan singkat di bawah judul slot */
    hint: string
    /** teks tooltip "?" */
    tip: string
    wajib?: boolean
}

export interface TemplatePhotoSpec {
    slots: TemplatePhotoSlot[]
    /** foto berulang (mis. kartu produk). `min` dipakai untuk validasi step 3. */
    portofolio?: {
        label: string
        hint: string
        min?: number
        max?: number
        /** true = user diminta mengisi judul tiap foto (disimpan di formData.portofolioJudul) */
        judul?: boolean
        /** placeholder input judul */
        judulPlaceholder?: string
    }
}

export const TEMPLATE_PHOTO_SLOTS: Record<string, TemplatePhotoSpec> = {
    'jasa-001': {
        // Tidak ada slot foto bernama — hanya galeri, tiap foto punya judul
        // yang tampil sebagai label kartu di section Galeri.
        slots: [],
        portofolio: { label: 'Foto Galeri', hint: 'Tiap foto diberi judul — judulnya tampil di kartu section Galeri.', judul: true, judulPlaceholder: 'Judul foto, mis. "Renovasi Dapur Bu Sinta"', max: 8 },
    },
    'peternakan-002': {
        slots: [
            { idx: 0, title: 'Foto Hero', hint: 'layar pertama', tip: 'Foto lebar yang jadi latar layar pertama. Pilih suasana kebun/lahan atau hasil panen.', wajib: true },
            { idx: 1, title: 'Foto Tentang', hint: 'bento kiri', tip: 'Foto di kartu kiri bagian "Tentang" — misalnya Anda atau tim saat bekerja.', wajib: true },
            { idx: 2, title: 'Foto Bento', hint: 'bento kanan', tip: 'Foto di kartu kanan bagian "Tentang". Kalau kosong, dipakai foto bawaan template.' },
        ],
        portofolio: { label: 'Foto Produk', hint: 'satu foto per produk/layanan, urut sesuai daftar di step 2', min: 1, max: 6 },
    },
}

/**
 * Template dengan palet terkunci — pilihan "Nuansa Desain" (light/dark) di step 3
 * tidak berlaku dan disembunyikan, temanya dipaksa ke nilai di sini.
 */
export const TEMPLATE_TEMA_TERKUNCI: Record<string, 'dark' | 'light'> = {
    'jasa-002': 'dark', // "Neon" — dark + neon green, memang hanya punya versi gelap
}

export function getTemaTerkunci(templateId: string): 'dark' | 'light' | null {
    return TEMPLATE_TEMA_TERKUNCI[templateId] ?? null
}

export function getPhotoSlots(templateId: string): TemplatePhotoSpec | null {
    return TEMPLATE_PHOTO_SLOTS[templateId] ?? null
}

/**
 * Template yang memakai builder produk manual di formulir (tiap produk =
 * foto + nama + deskripsi + harga), bukan input layanan multi-select + AI.
 * Section produknya render persis dari isian ini (tanpa foto random).
 */
export const TEMPLATE_PRODUK_BUILDER = new Set<string>(['peternakan-001'])

export function usesProdukBuilder(templateId: string): boolean {
    return TEMPLATE_PRODUK_BUILDER.has(templateId)
}

export const KATEGORI_LABELS: Record<string, string> = {
    jasa: 'Template Jasa',
    fnb: 'Template FnB',
    kreatif: 'Template Kreatif & Kerajinan',
    personal: 'Template Portofolio Pribadi',
    peternakan: 'Template Peternakan & Agri',
    toko: 'Template Toko & Ritel',
}
