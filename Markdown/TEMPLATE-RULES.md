# TEMPLATE-RULES.md
# Aturan Teknis Template Website BuatkanWeb.id
# Dokumen ini TIDAK BOLEH diubah — berlaku untuk SEMUA template
# Terakhir direvisi: 2026-05-24 (diselaraskan dengan kode aktual)

---

## 1. TEKNOLOGI

```
Framework      : Next.js App Router (TypeScript)
Styling        : Tailwind CSS + inline style untuk warna dinamis
Komponen       : React Functional Component ("use client")
State          : React hooks (useState, useEffect, useCallback, useRef)
Ikon           : lucide-react (sudah terinstall, BOLEH dipakai)
Gambar         : <img> tag biasa (bukan next/image)
Font           : Diatur GLOBAL di layout.tsx — template TIDAK perlu import font
```

---

## 2. STRUKTUR FILE

```
Setiap template adalah SATU file React component:

components/templates/[kategori]/[NamaTemplate].tsx

Contoh:
  components/templates/jasa/TemplateSatu.tsx
  components/templates/jasa/TemplateFotografer.tsx
  components/templates/fnb/TemplateCafe.tsx
  components/templates/kreatif/TemplateEleganWedding.tsx

SATU FILE SAJA — semua section (navbar, hero, about, layanan, 
portofolio, testimonial, footer) ada di dalam satu file.
Sub-komponen boleh dibuat di dalam file yang sama sebagai 
function terpisah, BUKAN file terpisah.

File harus dimulai dengan "use client" di baris pertama.
```

---

## 3. PROPS & INTERFACE

Setiap template menerima props yang SPREAD dari `TemplateData`, 
BUKAN dibungkus di dalam satu objek `data`.

```typescript
import type { TemplateData, AILayananItem, AICaraKerjaItem } from "@/types";

interface Props extends Partial<TemplateData> {
  forceMobile?: boolean;        // true = paksa tampilan mobile (preview HP)
                                // false = paksa tampilan desktop (preview desktop)
                                // undefined = responsive normal (di subdomain)
  isEditable?: boolean;         // true = di halaman /buat (preview mode)
  isEditMode?: boolean;         // true = user sedang aktif mengedit teks
  onContentUpdate?: (newContent: Partial<TemplateData>) => void;  // callback sinkronisasi ke parent
  websiteId?: string;           // ID website di database (untuk save langsung ke DB)
}

export default function NamaTemplate(props: Props) {
  const {
    hero = { headline: "Judul Website", subheadline: "Deskripsi singkat.", ctaText: "Hubungi Kami" },
    about = { judul: "Tentang Kami", deskripsi: "Penjelasan bisnis.", keunggulan: ["Profesional"] },
    layanan = [],
    testimonialPlaceholder = [],
    footer = { tagline: "Layanan profesional.", ctaText: "Hubungi Kami" },
    namaBisnis = "Bisnis Anda",
    kontak = { wa: "", telepon: "", email: "" },
    sosmed = { instagram: "", tiktok: "", twitter: "" },
    warna = { primary: "#4f46e5", tema: "light" },
    paketHarga = [],
    logo = "",
    fotoBisnis = [],
    portofolio = [],
    targetPelanggan,
    caraKerja = [],
    caraKerjaTitle = "Cara Kerja Kami",
    forceMobile,
    isEditable = false,
    isEditMode = false,
    onContentUpdate,
    websiteId,
  } = props;

  // ... template code
}
```

### TemplateData Interface (dari `types.ts`)

```typescript
// JANGAN definisikan ulang — IMPORT dari "@/types"

export interface PaketHarga {
  namaPaket: string;      // ⚠️ BUKAN "nama" — gunakan "namaPaket"
  harga: string;
  fitur: string[];
  isPopuler: boolean;     // ⚠️ BUKAN "highlight" — gunakan "isPopuler"
}

export interface AIHeroSection {
  headline: string;
  subheadline: string;
  ctaText: string;
}

export interface AIAboutSection {
  judul: string;
  deskripsi: string;
  keunggulan: string[];
}

export interface AILayananItem {
  nama: string;
  deskripsi: string;
  harga: string;          // format string: "Rp1.500.000" atau "Hubungi Kami"
}

export interface AITargetPelanggan {
  deskripsi: string;
  painPoint: string;
  solusi: string;
}

export interface AITestimonial {
  nama: string;
  peran: string;          // "Mahasiswa UGM", "Owner Warung", dll
  teks: string;
  rating?: number;        // 1-5, opsional
}

export interface AIFooter {
  tagline: string;
  ctaText: string;
  kontakTitle?: string;   // opsional, default: "Kontak"
  sosmedTitle?: string;   // opsional, default: "Sosial Media"
}

export interface AICaraKerjaItem {
  step: string;           // "01", "02", "03"
  title: string;
  desc: string;
}

export interface TemplateData {
  // Dari AI (Claude)
  hero: AIHeroSection;
  about: AIAboutSection;
  layanan: AILayananItem[];
  targetPelanggan: AITargetPelanggan;
  testimonialPlaceholder: AITestimonial[];
  footer: AIFooter;
  caraKerja?: AICaraKerjaItem[];
  caraKerjaTitle?: string;

  // Dari Form Data & Storage
  namaBisnis: string;
  kategori: string;
  lokasi: string;

  kontak: {
    wa: string;           // format: "6283869780959" (tanpa +)
    telepon: string;
    email: string;
  };

  sosmed: {
    instagram: string;    // "@namaakun"
    tiktok: string;
    twitter: string;
  };

  warna: {
    primary: string;      // hex color, contoh: "#10B981"
    tema: "dark" | "light";
  };

  paketHarga: PaketHarga[];
  logo: string;           // URL gambar dari Supabase Storage
  fotoBisnis: string[];   // array URL gambar tambahan
  portofolio: string[];   // array URL gambar dari Supabase Storage
}
```

---

## 4. ATURAN NULL SAFETY

Semua field bisa null atau undefined. Template TIDAK BOLEH crash.
Default value sudah di-handle di destructuring props (lihat contoh di Section 3).

```typescript
// Section yang datanya kosong = JANGAN dirender sama sekali
// Contoh: jika portofolio kosong, hide section portofolio
{portofolio.length > 0 && (
  <section>{/* portofolio section */}</section>
)}

// Contoh: kontak hanya tampil jika ada isinya
{(kontak.wa || kontak.telepon || kontak.email) && (
  <div>{/* kontak section */}</div>
)}
```

---

## 5. WARNA DINAMIS

Warna primary DATANG DARI USER (bisa apa saja).
Template harus support warna apapun.

```typescript
// Gunakan INLINE STYLE, bukan CSS Custom Properties:
const pc = warna.primary || "#4f46e5";

// Untuk warna transparan, tambahkan hex alpha di belakang:
const pcBg10 = `${pc}1a`;   // 10% opacity
const pcBg20 = `${pc}33`;   // 20% opacity

// Penggunaan di JSX:
<div style={{ backgroundColor: pc }}>Tombol</div>
<div style={{ color: pc }}>Teks berwarna</div>
<div style={{ backgroundColor: pcBg10 }}>Background transparan</div>
<div style={{ boxShadow: `0 10px 15px -3px ${pcBg20}` }}>Shadow</div>

// ⚠️ JANGAN pakai Tailwind arbitrary value untuk warna dinamis
// ❌ className="bg-[var(--primary)]"
// ✅ style={{ backgroundColor: pc }}
```

---

## 6. TEMA (DARK/LIGHT)

Template harus support dark DAN light berdasarkan `warna.tema`.

```typescript
const isDark = warna.tema === "dark";

// Definisikan palet warna berdasarkan tema:
const bg = isDark ? "bg-zinc-950" : "bg-white";
const bgSoft = isDark ? "bg-zinc-900" : "bg-zinc-50/50";
const textPrimary = isDark ? "text-zinc-100" : "text-zinc-900";
const textSecondary = isDark ? "text-zinc-400" : "text-zinc-500";
const textTertiary = isDark ? "text-zinc-500" : "text-zinc-400";
const borderColor = isDark ? "border-zinc-800" : "border-zinc-100";
const cardBg = isDark ? "bg-zinc-900" : "bg-white";
const cardBorder = isDark ? "border-zinc-800" : "border-zinc-100";
const navBg = isDark ? "bg-zinc-950/80" : "bg-white/80";

// Penggunaan:
<div className={`${bg} ${textPrimary}`}>
  <p className={textSecondary}>Teks sekunder</p>
</div>

// ⚠️ JANGAN pakai Tailwind dark: prefix — tema ditentukan oleh data, bukan system preference
```

---

## 7. EDITABLE MODE (INLINE EDITING)

Saat `isEditable={true}` dan `isEditMode={true}`, user bisa klik teks untuk mengedit.

### A. Import komponen EditableText yang sudah ada:

```typescript
// ⚠️ JANGAN buat EditableText sendiri — IMPORT dari komponen global:
import { EditableText } from "@/components/ui/EditableText";
```

### B. Properti EditableText:

```typescript
<EditableText
  value={editedHeadline}           // nilai yang ditampilkan dan bisa diedit
  onChange={(v) => {                // callback saat user selesai mengedit
    setEditedHeadline(v);
    markChanged();
  }}
  isEditMode={em}                  // ⚠️ BUKAN "isEditable" — gunakan "isEditMode"
  as="h1"                          // ⚠️ BUKAN "tag" — gunakan "as"
                                   // Pilihan: "span" | "h1" | "h2" | "h3" | "h4" | "p"
  multiline                        // opsional: true untuk textarea (deskripsi panjang)
  className="text-5xl font-bold"   // styling Tailwind biasa
/>
```

### C. Pola State untuk Inline Editing:

Setiap field editable HARUS punya state lokal sendiri.
JANGAN langsung mengubah props.

```typescript
// 1. Buat state lokal untuk setiap field:
const [editedHeadline, setEditedHeadline] = useState(hero.headline);
const [editedSubheadline, setEditedSubheadline] = useState(hero.subheadline);
const [editedCtaText, setEditedCtaText] = useState(hero.ctaText);
// ... dan seterusnya untuk semua field yang bisa diedit

// 2. Sinkronisasi props → state saat props berubah:
useEffect(() => {
  setEditedHeadline(hero.headline);
  setEditedSubheadline(hero.subheadline);
  setEditedCtaText(hero.ctaText);
}, [hero]);

// 3. Penanda perubahan:
const [hasChanges, setHasChanges] = useState(false);
const markChanged = useCallback(() => setHasChanges(true), []);
const em = isEditMode; // shorthand

// 4. Auto-sync ke parent via onContentUpdate (WAJIB):
useEffect(() => {
  if (hasChanges && onContentUpdate) {
    const handler = setTimeout(() => {
      onContentUpdate({
        namaBisnis: editedNamaBisnis,
        hero: { headline: editedHeadline, subheadline: editedSubheadline, ctaText: editedCtaText },
        about: { judul: editedAboutJudul, deskripsi: editedAboutDeskripsi, keunggulan: editedAboutKeunggulan },
        layanan: editedLayanan,
        caraKerja: editedCaraKerja,
        caraKerjaTitle: editedCaraKerjaTitle,
        testimonialPlaceholder: editedTestimonials,
        footer: { tagline: editedFooterTagline, ctaText: editedFooterCta, kontakTitle: editedFooterKontakTitle, sosmedTitle: editedFooterSosmedTitle },
        paketHarga: paketHarga.map((p, i) => ({
          ...p,
          namaPaket: editedPaketNama[i] ?? p.namaPaket,
          harga: editedPaketHarga[i] ?? p.harga,
        })),
      });
    }, 100); // debounce 100ms
    return () => clearTimeout(handler);
  }
}, [/* semua edited state + hasChanges + onContentUpdate */]);

// 5. handleSave — untuk tombol save floating di dalam template:
const handleSave = useCallback(async () => {
  const updatedContent: Partial<TemplateData> = {
    // ... kumpulkan semua edited state
  };
  setSaving(true);
  try {
    if (onContentUpdate) onContentUpdate(updatedContent);
    if (websiteId) {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("websites")
        .select("generated_content")
        .eq("id", websiteId)
        .single();
      if (existing) {
        const merged = { ...existing.generated_content, ...updatedContent };
        await supabase
          .from("websites")
          .update({ generated_content: merged, nama_usaha: editedNamaBisnis })
          .eq("id", websiteId);
      }
    }
    setHasChanges(false);
    setToast("Perubahan berhasil disimpan!");
    setTimeout(() => setToast(""), 3000);
  } catch (e) {
    setToast("Gagal menyimpan.");
    setTimeout(() => setToast(""), 3000);
  } finally {
    setSaving(false);
  }
}, [/* dependencies */]);
```

### D. Floating Save Button & Toast (WAJIB):

```typescript
{/* Floating Save Button — muncul saat ada perubahan DAN BUKAN dalam mode edit */}
{isEditable && hasChanges && !em && (
  <button
    type="button"
    onClick={handleSave}
    disabled={saving}
    className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
      text-white text-[13px] font-semibold px-5 py-3 rounded-xl shadow-2xl shadow-blue-600/30 
      transition-all cursor-pointer disabled:opacity-60"
  >
    {saving ? <Loader /> : <Check className="w-4 h-4" />}
    {saving ? "Menyimpan..." : "Simpan Perubahan"}
  </button>
)}

{/* Toast Notification */}
{toast && (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-xl 
    text-[13px] font-medium shadow-xl ${
    toast.includes("berhasil") ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
  }`}>
    {toast}
  </div>
)}
```

---

## 8. RESPONSIVE: forceMobile PATTERN

Template harus mendukung 3 mode tampilan yang dikontrol oleh `forceMobile`:

```typescript
const isMob = forceMobile === true;   // Paksa mobile (preview HP di /buat)
const isDesk = forceMobile === false;  // Paksa desktop (preview desktop di /buat)
// Jika keduanya false → responsive normal (di halaman subdomain)

// Penggunaan:
<div className={`${isMob ? "px-4 py-3" : isDesk ? "px-6 py-4" : "px-4 md:px-6 py-3 md:py-4"}`}>

// Navbar — hamburger menu hanya di mobile:
{!isMob && (
  <div className={`${isDesk ? "flex" : "hidden md:flex"} items-center gap-6`}>
    {/* Desktop nav items */}
  </div>
)}
{(isMob || forceMobile === undefined) && (
  <button className={`${isDesk ? "hidden" : isMob ? "block" : "md:hidden"}`}>
    {/* Hamburger menu */}
  </button>
)}

// Text size responsif:
className={`${isMob ? "text-3xl" : isDesk ? "text-5xl" : "text-3xl md:text-5xl"}`}
```

---

## 9. WHATSAPP CTA

Semua CTA utama mengarah ke WhatsApp:

```typescript
// Format link WhatsApp:
const waLink = `https://wa.me/${kontak.wa}?text=Halo,%20saya%20tertarik%20dengan%20layanan%20Anda...`;

// Penggunaan:
<a href={waLink} target="_blank" rel="noopener noreferrer">
  {hero.ctaText || "Hubungi Kami"}
</a>

// JANGAN hardcode nomor WA — selalu ambil dari kontak.wa
```

---

## 10. SECTION ORDERING

Urutan section yang HARUS diikuti (section kosong di-skip):

```
1.  Navbar              — SELALU ada
2.  Hero                — SELALU ada (id="beranda")
3.  About/Tentang       — SELALU ada (id="tentang")
4.  Layanan + Cara Kerja — Cara Kerja sebagai sub-section dari Layanan (id="layanan")
5.  Paket Harga         — jika paketHarga.length > 0 (id="harga")
6.  Portofolio          — jika portofolio.length > 0 (id="portofolio") — OPSIONAL sebagai section sendiri
7.  Testimonial         — jika testimonialPlaceholder.length > 0 (id="testimoni")
8.  CTA Section         — SELALU ada (pre-footer, tanpa id)
9.  Footer              — SELALU ada
```

### Catatan: Portofolio

PorTofolio bisa ditampilkan dengan 2 cara, tergantung keputusan desain template:

- **Sebagai section terpisah** (id="portofolio") — grid/masonry gallery mandiri.
  Cocok untuk template yang fokus visual (fotografer, desainer, wedding).
- **Embed di dalam card testimonial** — foto portofolio menjadi header image
  di setiap card testimoni. Cocok untuk template jasa umum yang kontennya
  lebih text-heavy.

Pilih salah satu di DESIGN.md. Jangan tampilkan keduanya sekaligus.

---

## 11. NAVBAR REQUIREMENTS

```typescript
// Item navigasi — DINAMIS berdasarkan data yang tersedia:
const navItems = [
  { label: "Beranda", href: "#beranda" },
  { label: "Tentang", href: "#tentang" },
  layanan.length > 0 && { label: "Layanan", href: "#layanan" },
  paketHarga.length > 0 && { label: "Harga", href: "#harga" },
  portofolio.length > 0 && { label: "Portofolio", href: "#portofolio" },
  testimonialPlaceholder.length > 0 && { label: "Testimoni", href: "#testimoni" },
].filter(Boolean) as { label: string; href: string }[];

// Masing-masing link menggunakan anchor href:
{navItems.map((n) => (
  <a key={n.label} href={n.href} className={`text-[13px] ${textSecondary}`}>
    {n.label}
  </a>
))}

// ⚠️ CATATAN: TemplateSatu saat ini masih menggunakan list statis.
// Template BARU direkomendasikan memakai pola dinamis di atas
// agar navbar hanya menampilkan link ke section yang benar-benar ada.

// Logo di navbar:
// Jika logo ada → tampilkan <img>
// Jika tidak → tampilkan inisial (huruf pertama namaBisnis)
{logo ? (
  <img src={logo} alt={namaBisnis} className="w-8 h-8 rounded-lg object-cover" />
) : (
  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: pc }}>
    <span className="text-white font-bold text-sm">{namaBisnis.charAt(0).toUpperCase()}</span>
  </div>
)}

// CTA button di navbar → link ke WhatsApp
// Navbar harus sticky top-0 dengan backdrop-blur
```

---

## 12. IMAGE HANDLING

```typescript
// Semua gambar dari Supabase Storage, format WebP
// URL pattern: https://[project].supabase.co/storage/v1/object/public/website-assets/...

// WAJIB:
// - lazy loading untuk semua gambar di bawah fold
// - alt text deskriptif
// - object-cover untuk foto
// - object-cover untuk logo (rounded-lg)

// Logo:
<img
  src={logo}
  alt={namaBisnis}
  className="w-8 h-8 rounded-lg object-cover"
/>

// Foto portofolio:
<img
  src={url}
  alt={`Portofolio ${namaBisnis}`}
  className="w-full h-48 object-cover"
  loading="lazy"
/>
```

---

## 13. RESPONSIVE BREAKPOINTS

```
Gunakan Tailwind breakpoints:

sm: 640px
md: 768px
lg: 1024px
xl: 1280px

Mobile-first approach:
- Default = mobile
- sm: dan md: = tablet
- lg: dan xl: = desktop

Container: max-w-6xl mx-auto px-4 md:px-6

⚠️ PENTING: Jangan pakai breakpoint di mode forceMobile.
Gunakan pola isMob/isDesk (lihat Section 8).
```

---

## 14. SOCIAL MEDIA LINKS

```typescript
// Hanya tampilkan yang ada (tidak kosong):
{sosmed.instagram && (
  <a href={`https://instagram.com/${sosmed.instagram.replace(/^@/, '')}`}
     target="_blank" rel="noopener noreferrer">
    Instagram
  </a>
)}
{sosmed.tiktok && (
  <a href={`https://tiktok.com/${sosmed.tiktok.replace(/^@/, '')}`}
     target="_blank" rel="noopener noreferrer">
    TikTok
  </a>
)}
{sosmed.twitter && (
  <a href={`https://x.com/${sosmed.twitter.replace(/^@/, '')}`}
     target="_blank" rel="noopener noreferrer">
    Twitter/X
  </a>
)}
```

---

## 15. FOOTER STRUCTURE

Footer terdiri dari 3 kolom (responsive ke 1 kolom di mobile):

```
Kolom 1: Brand (logo/inisial + nama bisnis + deskripsi singkat)
Kolom 2: Kontak (WhatsApp, Telepon, Email) — hanya jika ada data
Kolom 3: Sosial Media (Instagram, TikTok, Twitter/X) — hanya jika ada data

Bottom bar: Copyright (editable) + link "Hubungi Kami"
```

Judul "Kontak" dan "Sosial Media" harus menggunakan field editable:
```typescript
<EditableText value={editedFooterKontakTitle} onChange={...} isEditMode={em} as="p" />
<EditableText value={editedFooterSosmedTitle} onChange={...} isEditMode={em} as="p" />
```

---

## 16. FONT LOADING

```typescript
// Font di-load secara GLOBAL di app/layout.tsx (saat ini: Montserrat).
// Template TIDAK PERLU import font sendiri.
// Cukup pakai class Tailwind: font-sans

// ❌ JANGAN lakukan ini di dalam template:
// import { Plus_Jakarta_Sans } from 'next/font/google'

// ✅ Cukup pakai:
className="font-sans"

// Jika template butuh font khusus untuk heading, diskusikan dulu
// dengan tim agar font ditambahkan di layout.tsx secara global.
```

---

## 17. RATING STARS

```typescript
// Komponen StarRating — buat sebagai function di dalam file template:
function StarRating({ rating, onChange, isEditMode }: {
  rating: number;
  onChange: (val: number) => void;
  isEditMode: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1 mb-3">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{
            cursor: isEditMode ? 'pointer' : 'default',
            color: star <= (isEditMode ? (hovered || rating) : rating) ? '#f59e0b' : '#3f3f46',
            fontSize: '18px',
            lineHeight: 1,
            transition: 'color 0.15s'
          }}
          onMouseEnter={() => isEditMode && setHovered(star)}
          onMouseLeave={() => isEditMode && setHovered(0)}
          onClick={(e) => {
            if (isEditMode) { e.preventDefault(); e.stopPropagation(); onChange(star); }
          }}
        >★</span>
      ))}
    </div>
  );
}
```

---

## 18. EDIT MODE BANNER

Saat `isEditMode` aktif, tampilkan banner kuning di atas template:

```typescript
{em && (
  <div className="sticky top-0 z-[60] bg-amber-500 text-amber-950 text-center text-[11px] font-semibold py-1 px-3">
    MODE EDIT — Klik teks manapun untuk mengedit
  </div>
)}
```

Dan beri border kuning di wrapper utama:
```typescript
<div style={em ? { border: '2px solid #f59e0b', borderRadius: '8px' } : undefined}>
```

---

## 19. CLICK PREVENTION SAAT EDIT MODE

Saat mode edit, CEGAH navigasi link agar user bisa fokus mengedit:

```typescript
<div
  onClickCapture={(e) => {
    if (em) {
      const target = e.target as HTMLElement;
      const isEditable = target.closest('[data-editable="true"]');
      if (!isEditable) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }}
>
  {/* ... seluruh template */}
</div>
```

---

## 20. EXPORT DEFAULT

Setiap template WAJIB export default:

```typescript
export default function NamaTemplate(props: Props) {
  // ...
}
```

---

## 21. TIDAK BOLEH

```
❌ JANGAN import library UI external (shadcn, MUI, Chakra, dll)
❌ JANGAN import animation library (framer-motion, GSAP, dll)
❌ JANGAN pakai localStorage atau sessionStorage di dalam template
❌ JANGAN pakai useEffect untuk fetch data — data sudah ada di props
❌ JANGAN buat API call dari dalam template (KECUALI handleSave ke Supabase)
❌ JANGAN hardcode teks — semua teks dari props
❌ JANGAN hardcode warna — semua warna dari warna.primary
❌ JANGAN buat file terpisah untuk sub-komponen
❌ JANGAN pakai <Link> dari next/link di dalam template (pakai <a> atau button)
❌ JANGAN pakai router dari next/navigation di dalam template
❌ JANGAN import font di dalam template — font diatur global
❌ JANGAN pakai Tailwind dark: prefix — tema ditentukan oleh data
❌ JANGAN pakai CSS Custom Properties untuk warna — pakai inline style
❌ JANGAN buat komponen EditableText sendiri — import dari "@/components/ui/EditableText"
```

---

## 22. BOLEH

```
✅ BOLEH import dan pakai ikon dari lucide-react
✅ BOLEH buat sub-komponen (StarRating, dll) di DALAM file template yang sama
✅ BOLEH pakai useState dan useCallback untuk state editing
✅ BOLEH pakai useEffect untuk sinkronisasi state
✅ BOLEH pakai useRef untuk scroll behavior dan element references
✅ BOLEH pakai inline style untuk warna dinamis
✅ BOLEH pakai CSS animation via className (animate-spin, dll dari Tailwind)
✅ BOLEH akses Supabase hanya di handleSave (import dinamis)
```

---

## 23. WORKFLOW: CARA MEMBUAT TEMPLATE BARU

```
1. Buat DESIGN.md untuk template baru (keputusan visual & layout)

2. Paste ke AI:

   "Buatkan template website untuk BuatkanWeb.id.

   Ikuti aturan teknis di TEMPLATE-RULES.md:
   [PASTE TEMPLATE-RULES.md]

   Ikuti design system di DESIGN.md:
   [PASTE DESIGN.md KAMU]

   Berikut contoh data yang akan diterima:
   [PASTE CONTOH JSON generated_content]"

3. AI akan generate file .tsx yang tinggal taruh di
   components/templates/[kategori]/

4. CHECKLIST sebelum dipakai:
   □ Props menggunakan extends Partial<TemplateData> (BUKAN data wrapper)
   □ Import EditableText dari "@/components/ui/EditableText"
   □ Ada auto-sync useEffect ke onContentUpdate
   □ Ada handleSave dengan akses Supabase
   □ Ada floating save button dan toast
   □ Warna pakai inline style (bukan CSS var)
   □ forceMobile pattern (isMob/isDesk) diimplementasi
   □ Edit mode banner dan click prevention ada
   □ Semua field punya default value di destructuring
   □ Null safety — tidak ada crash jika data kosong

5. Test dengan data dummy → perbaiki jika ada yang kurang

6. Daftarkan template baru di database tabel templates
   atau di kode routing template
```

---

## 24. SEO METADATA

Metadata SEO **TIDAK di-handle di dalam template**.
Metadata di-generate di halaman server `app/s/[subdomain]/page.tsx`
melalui fungsi `generateMetadata()`.

```typescript
// Di app/s/[subdomain]/page.tsx (BUKAN di template):
export async function generateMetadata({ params }): Promise<Metadata> {
  const content = website.generated_content || {}
  return {
    title: content?.seo?.metaTitle || content?.namaBisnis || 'Website',
    description: content?.seo?.metaDescription || content?.hero?.subheadline || '',
    openGraph: {
      title: content?.namaBisnis || 'Website',
      description: content?.hero?.subheadline || '',
      images: content?.logo ? [content.logo] : [],
      type: 'website',
      locale: 'id_ID',
    },
    icons: content?.logo ? {
      icon: [{ url: content.logo }],
      apple: [{ url: content.logo }],
    } : undefined,
  }
}
```

### Field SEO di TemplateData (opsional):

```typescript
seo?: {
  metaTitle: string;        // Judul tab browser
  metaDescription: string;  // Deskripsi untuk Google/sosmed
}
```

Field `seo` diisi oleh AI saat generate konten.
Jika kosong, fallback ke `namaBisnis` dan `hero.subheadline`.

**Template TIDAK perlu peduli soal SEO** — cukup render konten visual saja.
