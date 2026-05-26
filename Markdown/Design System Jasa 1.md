Ganti seluruh isi `components/templates/TemplateSatu.tsx` dengan 
template baru yang mengikuti dua dokumen di bawah ini.

Jangan ubah file lain apapun selain TemplateSatu.tsx.

===============================================================
DOKUMEN 1 — ATURAN TEKNIS (WAJIB DIIKUTI)
===============================================================
Baca TEMPLATE-RULES.md

===============================================================
DOKUMEN 2 — DESIGN SYSTEM (WAJIB DIIKUTI)
===============================================================

# Design System: Jasa 1 — Editorial Calm

## Filosofi
- Editorial Calm: tipografi rapi, whitespace luas seperti majalah
- Tanpa drop shadow: gunakan hairline border 1px sebagai pemisah kedalaman
- Single Action Color: HANYA primary color untuk CTA, tidak dipakai di tempat lain

## Palet Warna

Implementasi WAJIB pakai Tailwind classes (bukan inline style) untuk 
warna statis, dan inline style untuk warna dinamis (primary):

| Token         | Light           | Dark       | Tailwind Class                              |
|---------------|-----------------|------------|---------------------------------------------|
| Canvas (bg)   | #f7f7f4         | #26251e    | bg-[#f7f7f4] / dark → conditional isDark    |
| Surface Card  | #ffffff         | #1a1914    | bg-white / bg-[#1a1914]                     |
| Text Primary  | #26251e         | #f7f7f4    | text-[#26251e] / text-[#f7f7f4]             |
| Text Muted    | #5a5852         | #a09c92    | text-[#5a5852] / text-[#a09c92]             |
| Hairline      | #e6e5e0         | #3b3a30    | border-[#e6e5e0] / border-[#3b3a30]         |
| Primary       | dari warna.primary (dinamis) | inline style |                          |
| Primary Muted | primary + "1a" (10% hex alpha) | inline style |                   |

Cara implementasi tema (BUKAN Tailwind dark: prefix):
const isDark = warna.tema === "dark"
const canvas  = isDark ? "bg-[#26251e]" : "bg-[#f7f7f4]"
const surface = isDark ? "bg-[#1a1914]" : "bg-white"
const textPrimary  = isDark ? "text-[#f7f7f4]" : "text-[#26251e]"
const textMuted    = isDark ? "text-[#a09c92]" : "text-[#5a5852]"
const hairline     = isDark ? "border-[#3b3a30]" : "border-[#e6e5e0]"

Warna dinamis (primary):
const pc = warna.primary || "#f54e00"
const pcMuted = `${pc}1a`

Wajib tambahkan di kontainer terluar:
className={`${canvas} transition-colors duration-300`}

## Tipografi

Font: font-sans (sudah global di layout.tsx, JANGAN import font baru)
Heading: SELALU font-normal (weight 400), BUKAN bold
Hero heading:    text-5xl md:text-[72px] font-normal tracking-tighter leading-[1.1]
Section heading: text-3xl md:text-[36px] font-normal tracking-tight leading-[1.2]
Body:            text-[15px] leading-relaxed
Harga/kode:      font-mono

## Spacing & Radius

Section padding: py-20 md:py-32
Container hero:  max-w-5xl mx-auto px-4 md:px-6
Container cards: max-w-7xl mx-auto px-4 md:px-6
Button CTA:      rounded-md (8px)
Card:            rounded-lg (12px) atau rounded-xl (16px)
Tag/badge:       rounded-full

## AI Timeline Colors (HANYA untuk badge cara kerja)

Step 1 (Konsultasi):  background #dfa88f (Peach)
Step 2 (Pengerjaan):  background #9fc9a2 (Mint)
Step 3 (Selesai):     background #9fbbe0 (Blue)
Warna teks badge: selalu gelap (#26251e)

## Navbar

Dinamis berdasarkan data:
const navItems = [
  { label: "Beranda", href: "#" },
  { label: "Tentang", href: "#tentang" },
  editedLayanan.length > 0 && { label: "Layanan", href: "#layanan" },
  { label: "Harga", href: "#harga" },
  editedTestimoni.length > 0 && { label: "Testimoni", href: "#testimoni" },
].filter(Boolean) as { label: string; href: string }[]

Sticky top-0, backdrop-blur, border-bottom hairline.
Transparan di atas hero, solid saat scroll.

## Aturan Visual Tambahan

- ZERO drop shadow di semua elemen — kedalaman HANYA dari hairline border 1px
- Primary color HANYA untuk tombol CTA utama dan link aktif — tidak di heading, 
  tidak di background section, tidak di icon
- Setiap section WAJIB punya visual yang berbeda dari section sebelumnya
- Portofolio adalah section yang paling menonjol secara visual

## Cara Kerja Section

Tampilkan 3 step dengan badge warna pastel (AI Timeline Colors):
- Badge: rounded-full, background dari warna pastel, teks gelap
- Nomor step di dalam badge: font-mono, kecil
- Judul step: font-normal, tracking-tight
- Deskripsi: text-muted, text-[15px]
- Layout: 3 kolom desktop, stack mobile
- Connector antar step: garis hairline horizontal (desktop only)

## Section Layout

Hero:        max-w-5xl, layout center atau split (teks kiri, foto kanan)
Tentang:     split 50/50, teks kiri, keunggulan kanan sebagai list
Layanan:     grid 1-3 kolom (tergantung jumlah), card dengan hairline border
Cara Kerja:  3 kolom dengan badge pastel (lihat di atas)
Harga:       grid card dengan hairline border, highlight card pakai primary muted bg
Portofolio:  masonry grid atau horizontal scroll, foto tanpa overlay/filter
Testimoni:   grid 3 kolom, card hairline border, quote pendek
CTA section: full-width, background primary, teks kontras
Footer:      3 kolom, hairline border top, teks muted

===============================================================
CHECKLIST SEBELUM SELESAI
===============================================================

Pastikan semua ini terpenuhi sebelum menyerahkan hasil:

□ "use client" di baris pertama
□ Props: extends Partial<TemplateData>, destructuring dengan default value
□ Import EditableText dari "@/components/ui/EditableText"
□ Import ikon dari lucide-react (bukan library lain)
□ ZERO drop shadow di seluruh template
□ Heading SEMUA font-normal (400), BUKAN bold/semibold
□ Primary color HANYA di CTA button
□ transition-colors duration-300 di kontainer terluar
□ AI Timeline Colors hanya di badge cara kerja
□ Navbar dinamis berdasarkan data
□ forceMobile pattern (isMob/isDesk) diimplementasi
□ Inline editing via EditableText di SEMUA teks dari props
□ Auto-sync useEffect ke onContentUpdate (debounce 100ms)
□ handleSave dengan dynamic import Supabase
□ Floating save button + toast notification
□ Edit mode banner (amber, sticky)
□ Click prevention saat isEditMode
□ Section kosong di-skip (null safety)
□ Semua warna statis pakai Tailwind class
□ Semua warna dinamis (primary) pakai inline style
□ Responsive: mobile-first, forceMobile pattern

===============================================================
KODE YANG PERLU KAMU BACA DULU
===============================================================

Baca dan pahami kode berikut sebelum mulai menulis:

TemplateSatu.tsx
components/ui/EditableText.tsx
types/index.ts