# PROJECT.md — BuatkanWeb.id
# Baca file ini sebelum melakukan perubahan apapun.
# Terakhir diperbarui: Mei 2026

---

## RINGKASAN PROYEK

**BuatkanWeb.id** adalah platform pembuatan website berbasis AI untuk pelaku UMKM Indonesia.
User mengisi form sederhana tentang bisnis mereka → AI (Claude Sonnet) generate konten website → user bisa preview, edit inline, lalu deploy ke subdomain `[nama].buatkanweb.id` dengan satu klik.

Dibuat oleh **SwarnaWorks Creative Agency** (4 mahasiswa UNY, Yogyakarta).

---

## TECH STACK

```
Frontend     : Next.js 15+ App Router, TypeScript, Tailwind CSS
Backend      : Next.js API Routes (app/api/)
Database     : Supabase (PostgreSQL + Auth + Storage)
AI           : Anthropic Claude Sonnet (claude-sonnet-4-5) via API
Email        : Resend (SMTP custom di Supabase Auth)
Deploy       : Vercel Pro (team: buatkanwebs)
DNS          : Rumahweb → Nameserver ke Vercel (ns1/ns2.vercel-dns.com)
Domain       : buatkanweb.id
Ikon         : lucide-react
```

---

## ENVIRONMENT VARIABLES

```env
NEXT_PUBLIC_SUPABASE_URL=https://fvwqpwwbgzxokkiqtbqk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]
ANTHROPIC_API_KEY=[claude api key]
NEXT_PUBLIC_MAIN_DOMAIN=buatkanweb.id
```

---

## STRUKTUR DATABASE (Supabase)

### Tabel `profiles`
```
id          uuid (FK → auth.users)
full_name   text
email       text
created_at  timestamp
```
Auto-created via trigger saat user register.

### Tabel `websites`
```
id               uuid (PK)
user_id          uuid (FK → auth.users)
nama_usaha       text
template_id      text        — contoh: "jasa-001"
status           text        — "preview" | "active"
subdomain        text        — null jika belum deploy
logo_url         text        — URL dari Supabase Storage
foto_urls        text[]      — array URL foto bisnis
generated_content jsonb      — SEMUA data website (lihat struktur di bawah)
created_at       timestamp
updated_at       timestamp
expires_at       timestamp   — untuk website preview (14 hari)
```

### Tabel `generate_logs`
```
id          uuid (PK)
user_id     uuid (FK → auth.users)
website_id  uuid (FK → websites)
created_at  timestamp
```
Dipakai untuk quota 3 generate/hari. Terpisah dari websites
agar delete website tidak refund quota.

### Tabel `payments`
```
id, user_id, website_id, amount, status, provider, created_at
```
Belum dipakai (payment belum diimplementasi).

### Struktur `generated_content` (jsonb)
```typescript
{
  // Dari AI Claude
  hero: { headline, subheadline, ctaText }
  about: { judul, deskripsi, keunggulan: string[] }
  layanan: [{ nama, deskripsi, harga }]
  caraKerja: [{ step, title, desc }]
  caraKerjaTitle: string
  targetPelanggan: { deskripsi, painPoint, solusi }
  testimonialPlaceholder: [{ nama, peran, teks, rating? }]
  footer: { tagline, ctaText, kontakTitle?, sosmedTitle? }
  seo: { metaTitle, metaDescription }

  // Dari form user
  namaBisnis, kategori, lokasi
  kontak: { wa, telepon, email }
  sosmed: { instagram, tiktok, twitter }
  warna: { primary, tema: "dark" | "light" }
  paketHarga: [{ namaPaket, harga, fitur, isPopuler }]
  logo: string (URL)
  fotoBisnis: string[] (URLs)
  portofolio: string[] (URLs)
  
  // Internal (jangan ditampilkan)
  __formData: object
}
```

### RLS Policies (websites)
```
SELECT: authenticated users bisa lihat SEMUA website (untuk cek subdomain)
        anon bisa lihat website dengan status = 'active'
INSERT: user hanya bisa insert website milik sendiri (auth.uid() = user_id)
UPDATE: user hanya bisa update website milik sendiri
DELETE: user hanya bisa delete website milik sendiri
```

### Supabase Storage
```
Bucket: website-assets (public)
Path logo    : logos/[user_id]-[timestamp]-[random].webp
Path portofolio: portofolio/[user_id]-[timestamp]-[random].webp
Path foto bisnis: fotobisnis/[user_id]-[timestamp]-[random].webp
```
Semua gambar auto-convert ke WebP sebelum upload (via Canvas API).

---

## STRUKTUR FOLDER

```
/
├── app/
│   ├── page.tsx                  — Landing page utama
│   ├── layout.tsx                — Root layout, font global (Montserrat)
│   ├── globals.css
│   │
│   ├── auth/
│   │   ├── login/page.tsx        — Halaman login (email + Google OAuth)
│   │   ├── register/page.tsx     — Halaman register
│   │   └── callback/route.ts     — OAuth callback handler
│   │
│   ├── dashboard/
│   │   ├── page.tsx              — Dashboard utama (list website user)
│   │   ├── template/
│   │   │   ├── page.tsx          — Pilih kategori template
│   │   │   └── [kategori]/page.tsx — Grid template per kategori
│   │   └── ...
│   │
│   ├── buat/
│   │   └── page.tsx              — Form generate website (split-screen)
│   │
│   ├── preview/
│   │   └── [templateId]/page.tsx — Preview template sebelum pilih
│   │
│   ├── preview-full/
│   │   └── page.tsx              — Preview website full (dari localStorage)
│   │
│   ├── s/
│   │   └── [subdomain]/
│   │       └── page.tsx          — Render website UMKM dari subdomain
│   │
│   └── api/
│       ├── check-subdomain/
│       │   └── route.ts          — API endpoint cek subdomain
│       └── generate/
│           └── route.ts          — API endpoint generate konten via Claude
│
├── components/
│   ├── AuthProvider.tsx          — Komponen Auth Provider
│   ├── landing/                  — Komponen landing page
│   ├── templates/
│   │   ├── jasa/
│   │   │   └── TemplateSatu.tsx  — Template utama (Jasa - Fotografer/Videografer)
│   │   ├── fnb/                  — Template F&B
│   │   └── kreatif/              — Template Kreatif & Kerajinan
│   └── ui/
│       ├── EditableText.tsx      — Komponen teks yang bisa diedit inline
│       └── ...
│
├── lib/
│   ├── supabase.ts               — Supabase client (browser)
│   ├── supabase-server.ts        — Supabase client (server)
│   ├── imageUtils.ts             — Konversi ke WebP via Canvas API
│   └── storage.ts                — safeStorage wrapper (Safari-safe localStorage)
│
├── types/
│   └── index.ts                  — Semua TypeScript interfaces (TemplateData, dll)
│
├── data/
│   └── kota-indonesia.ts         — Data kota untuk dropdown lokasi
│
├── middleware.ts                 — Subdomain routing (deteksi [sub].buatkanweb.id)
│
├── TEMPLATE-RULES.md             — Aturan teknis pembuatan template (BACA INI)
└── PROJECT.md                    — File ini
```

---

## FITUR YANG SUDAH JADI

### Auth
- [x] Register dengan email + password
- [x] Login dengan email + password
- [x] Login dengan Google OAuth
- [x] Email konfirmasi via Resend (SMTP custom, sender: noreply@buatkanweb.id)
- [x] Auto-create profil saat register (via Supabase trigger)

### Dashboard
- [x] Statistik: Generate Hari Ini (X/3), Total Website, Website Aktif
- [x] List website user (card dengan iframe thumbnail preview)
- [x] Auto-delete website preview yang expired
- [x] Tombol "Buat Website Baru" (disabled jika quota habis atau sudah 6 website)

### Pilih Template
- [x] Halaman pilih kategori (Jasa, F&B "Segera Hadir", Kreatif "Segera Hadir")
- [x] Grid template per kategori (1 available, 9 coming soon)
- [x] Preview template sebelum pilih

### Form Generate (/buat)
- [x] Split-screen: form kiri (40%), preview kanan (60%)
- [x] Multi-step accordion: Identitas, Kontak, Tentang, Harga, Tampilan
- [x] Multi-select dropdown (kategori jasa, layanan spesifik, target pelanggan)
- [x] Dropdown kota Indonesia (autocomplete)
- [x] Upload foto: logo, foto bisnis, portofolio
- [x] Preview warna real-time (color picker)
- [x] Toggle tema dark/light
- [x] Tombol Generate (quota check: 3/hari)
- [x] Loading state dengan pesan berubah tiap 3 detik
- [x] Edit Mode: toggle ON/OFF untuk edit teks langsung di preview
- [x] Tombol "Simpan Perubahan" (muncul jika ada perubahan)
- [x] Tombol "Deploy Sekarang" (muncul setelah generate berhasil)

### Inline Editing
- [x] EditableText component (contenteditable dengan styling)
- [x] StarRating editable
- [x] Auto-sync perubahan ke parent via onContentUpdate
- [x] handleSave langsung ke Supabase (merge dengan data lama)
- [x] Floating save button + toast notification
- [x] Edit mode banner (kuning, sticky)
- [x] Click prevention saat edit mode (mencegah navigasi link)

### Deploy ke Subdomain
- [x] Modal deploy dengan input subdomain
- [x] Validasi nama subdomain (lowercase, alfanumerik, tanda hubung)
- [x] Cek ketersediaan subdomain real-time (debounce 500ms)
- [x] Daftar reserved subdomain
- [x] Update status → 'active' + set subdomain di database
- [x] Success state dengan link ke subdomain

### Subdomain Routing
- [x] Middleware deteksi [nama].buatkanweb.id → rewrite ke /s/[nama]
- [x] /s/[subdomain]/page.tsx fetch data dari Supabase
- [x] Render TemplateSatu dengan data dari database
- [x] force-dynamic (tidak ada cache)
- [x] SEO metadata dinamis dari generated_content.seo

### AI Generate
- [x] API route: app/api/generate/route.ts
- [x] Model: claude-sonnet-4-5
- [x] System prompt untuk copywriting Indonesia
- [x] Output JSON terstruktur
- [x] Quota check 3/hari via generate_logs

### Gambar
- [x] Auto-convert ke WebP via Canvas API (browser-side)
- [x] Upload paralel via Promise.all
- [x] Quality: logo 90%, foto 85%
- [x] Max size: logo 400px, foto 1920px

### Safari & Cross-Browser
- [x] backdrop-filter + -webkit-backdrop-filter
- [x] safeStorage wrapper untuk localStorage
- [x] CSS vendor prefix di globals.css

---

## FITUR YANG BELUM JADI

### Priority Tinggi
- [ ] Payment gateway (Midtrans atau Xendit)
  - Bayar untuk upgrade dari preview ke subdomain
  - Harga: Rp199.000 (normal), Rp99.000 (early adopter 75 user pertama)
- [ ] Dashboard admin (lihat semua user, website, revenue)
- [ ] Halaman /privacy dan /terms (dibutuhkan untuk Google OAuth verification)
- [ ] Template kedua (kategori berbeda)

### Priority Menengah
- [ ] Kelola website yang sudah active (edit, ganti subdomain)
- [ ] Expired website notification + renewal
- [ ] Email notifikasi (welcome, website active, dll)
- [ ] Google OAuth branding verification (butuh /privacy dan /terms)

### Priority Rendah
- [ ] Template F&B
- [ ] Template Kreatif & Kerajinan
- [ ] Custom domain (pengguna pakai domain sendiri)
- [ ] Analytics per website (pageview)
- [ ] Multiple template per kategori

---

## INTEGRASI EKSTERNAL

### Supabase
- Project ID: fvwqpwwbgzxokkiqtbqk
- URL: https://fvwqpwwbgzxokkiqtbqk.supabase.co
- Plan: Pro
- Auth: Email + Google OAuth
- Storage bucket: website-assets (public)
- Custom SMTP: Resend (smtp.resend.com:465)

### Vercel
- Team: buatkanwebs
- Project: buatkanweb
- Plan: Pro (wildcard subdomain butuh Pro)
- Domain: buatkanweb.id, www.buatkanweb.id, *.buatkanweb.id
- GitHub: github.com/buatkanwebs/buatkanwebs (branch: main)

### Resend
- Domain: buatkanweb.id (verified)
- Sender: noreply@buatkanweb.id
- Dipakai: email konfirmasi akun via Supabase SMTP

### Google Cloud Console
- Project: BuatkanWeb
- OAuth Client: Web Application
- Redirect URI: https://fvwqpwwbgzxokkiqtbqk.supabase.co/auth/v1/callback
- Status: AKTIF (login pakai akun buatkanwebs@gmail.com)

### Anthropic Claude
- Model: claude-sonnet-4-5
- Dipakai: generate konten website (copywriting + struktur)
- Max tokens: 2000

---

## CARA KERJA SISTEM

### Flow Generate Website
```
1. User isi form (/buat)
2. Klik "Generate Website"
3. app/api/generate/route.ts dipanggil
4. Check quota (generate_logs, 3/hari)
5. Upload foto ke Supabase Storage (paralel, WebP)
6. Kirim prompt ke Claude API
7. Claude return JSON (hero, about, layanan, dll)
8. Simpan ke tabel websites (status: 'preview')
9. Catat di generate_logs
10. Preview tampil di panel kanan
```

### Flow Deploy Subdomain
```
1. User klik "Deploy Sekarang"
2. Input nama subdomain
3. Cek ketersediaan ke Supabase (SELECT count)
4. Jika tersedia → update websites:
   - subdomain = input
   - status = 'active'
5. Website bisa diakses di [subdomain].buatkanweb.id
```

### Flow Akses Subdomain
```
1. Request masuk ke [nama].buatkanweb.id
2. middleware.ts deteksi subdomain dari hostname
3. Rewrite ke /s/[nama]
4. app/s/[subdomain]/page.tsx fetch dari Supabase
5. Query: SELECT * FROM websites WHERE subdomain = [nama]
6. Render TemplateSatu dengan generated_content
7. force-dynamic: tidak ada cache
```

### Flow Inline Edit
```
1. User di /buat, klik "Edit Mode ON"
2. isEditMode = true di TemplateSatu
3. Semua teks menjadi contenteditable
4. User klik teks → edit langsung
5. onChange → update local state
6. hasChanges = true → floating save button muncul
7. Auto-sync ke parent via onContentUpdate (debounce 100ms)
8. Klik "Simpan Perubahan" → handleSave → update Supabase
```

---

## ATURAN PENGEMBANGAN

### Saat Membuat/Mengedit Template
Baca `TEMPLATE-RULES.md` di root project. Aturan wajib:
- Props: `extends Partial<TemplateData>` (BUKAN wrapper `data`)
- Import `EditableText` dari `@/components/ui/EditableText`
- Warna dinamis: inline style (BUKAN CSS var atau Tailwind arbitrary)
- Tema: gunakan `isDark` conditional, BUKAN Tailwind `dark:` prefix
- Font: JANGAN import di template, sudah global di layout.tsx
- Satu file .tsx untuk semua section
- Tambah `"use client"` di baris pertama

### Saat Mengedit Database
- Jangan ubah struktur kolom `generated_content` tanpa update `types/index.ts`
- Jangan hapus RLS policy yang ada tanpa understanding penuh
- Selalu test dengan 2 user berbeda untuk validasi RLS

### Saat Mengedit Middleware
- Test subdomain routing di production setelah push
- Jangan lupa reserved subdomain list
- Strip port dari hostname untuk local dev

### Saat Mengedit API Generate
- Model selalu `claude-sonnet-4-5` (bukan opus, bukan haiku)
- Max tokens: 2000
- Output harus JSON valid (strip markdown fence jika ada)

---

## KNOWN ISSUES & CATATAN

1. **Subdomain di local dev**: Tidak bisa test `[nama].localhost:3001`.
   Test subdomain harus di production (push dulu ke Vercel).

2. **Google OAuth consent screen**: Masih menampilkan URL Supabase
   (`fvwqpwwbgzxokkiqtbqk.supabase.co`) bukan `buatkanweb.id`.
   Fix: buat halaman /privacy dan /terms, lalu submit Google verification.

3. **Vercel invoice $20**: Invoice lama dari project yang sudah dihapus
   masih pending. Hubungi Vercel support jika belum terselesaikan.

4. **Safari Private Mode**: localStorage dibungkus `safeStorage` di `lib/storage.ts`.
   Selalu import `safeStorage` bukan `localStorage` langsung.

5. **WebP conversion**: Hanya bisa di client-side (Canvas API).
   Jangan panggil `convertToWebP` dari Server Component.

---

## KONTEKS BISNIS

- **Target user**: Pelaku UMKM Indonesia, usia 25-50 tahun
- **Kategori aktif**: Jasa (Fotografer, Barber, Laundry, Bengkel, Design)
- **Kategori coming soon**: F&B, Kreatif & Kerajinan
- **Pricing**:
  - Gratis: preview 14 hari, 3 generate/hari
  - Subdomain: Rp199.000/tahun (normal), Rp99.000 (early adopter 75 user pertama)
  - Custom domain: Rp499.000/tahun (belum diimplementasi)
- **Diferensiasi**: Foto real dari sesi on-site (bukan stock photo), copywriting AI bahasa Indonesia natural

---

## QUICK REFERENCE

```bash
# Local development
npm run dev              # Jalankan di localhost:3001

# Deploy
git add .
git commit -m "..."
git push                 # Auto-deploy ke Vercel via GitHub

# Cek build error sebelum push
npx next build 2>&1 | Select-Object -First 50
```

```
# Supabase Dashboard
https://supabase.com/dashboard/project/fvwqpwwbgzxokkiqtbqk

# Vercel Dashboard
https://vercel.com/buatkanwebs/buatkanweb

# Resend Dashboard
https://resend.com/domains

# Google Cloud Console
https://console.cloud.google.com — project: BuatkanWeb
```
