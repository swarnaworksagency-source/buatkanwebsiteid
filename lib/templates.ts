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
        id: 'fnb',
        name: 'Bisnis Kuliner (FnB)',
        desc: 'Warung Makan, Kafe, Bakery, Catering, dll',
        number: '02',
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
        number: '03',
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
        number: '04',
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
        { id: 'jasa-001', nama: 'Minimalist', kategori: 'jasa', status: 'available', badge: 'Populer' },
        { id: 'jasa-002', nama: 'Klasik', kategori: 'jasa', status: 'available', badge: 'Baru' },
        { id: 'jasa-003', nama: 'Hangat', kategori: 'jasa', status: 'available', badge: 'Baru' },
        { id: 'jasa-004', nama: 'Tegas', kategori: 'jasa', status: 'available', badge: 'Baru' },
        { id: 'jasa-005', nama: 'Elegant', kategori: 'jasa', status: 'coming_soon' },
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
    'jasa-001': { name: 'Jasa Minimal', kategori: 'jasa' },
    'jasa-002': { name: 'Jasa Klasik', kategori: 'jasa' },
    'jasa-003': { name: 'Jasa Hangat', kategori: 'jasa' },
    'jasa-004': { name: 'Jasa Tegas', kategori: 'jasa' },
    'personal-001': { name: 'Ink and Lime', kategori: 'personal' },
    'personal-002': { name: 'Elegant', kategori: 'personal' },
    'personal-003': { name: 'Modern', kategori: 'personal' },
}

export const KATEGORI_LABELS: Record<string, string> = {
    jasa: 'Template Jasa',
    fnb: 'Template FnB',
    kreatif: 'Template Kreatif & Kerajinan',
    personal: 'Template Portofolio Pribadi',
}
