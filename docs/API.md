# API Routes

Semua endpoint di bawah `app/api/`. Body & response **JSON** kecuali disebut lain.
Auth memakai cookie session Supabase (HttpOnly) — kirim request same-origin (browser otomatis ikut cookie).

Konvensi response error: `{ "error": string }` dengan HTTP status sesuai. Pesan error sengaja generik (detail di-log server, tidak dibocorkan ke client).

Status umum: `400` input invalid · `401` belum login · `402` belum bayar · `403` diblokir/forbidden · `404` tidak ditemukan · `409` konflik · `429` rate limit · `500` error server.

---

## Generate

### `POST /api/generate`
Generate konten website via Claude. **Streaming** (text/plain) — body respons adalah teks JSON `TemplateData` yang diakumulasi client lalu `JSON.parse`.

- **Auth:** wajib login. **Proteksi:** IP ban, kuota harian per user (3/hari; admin unlimited), validasi Zod (`generateSchema`).
- **Request** (subset `FormData`, semua opsional, dibatasi panjang):
  ```jsonc
  {
    "namaBisnis": "string", "tagline": "string", "kategoriJasa": "string",
    "lokasi": "string", "keunggulan": "string",
    "layananSpesifik": ["string"], "paketHarga": [{ "namaPaket": "...", "harga": "...", "fitur": ["..."] }],
    "proyekPortofolio": [{ "namaProyek": "...", "kategori": "...", "masalah": "...", "peran": "...", "solusi": "...", "hasil": "..." }]
    // field FormData lain ikut terkirim tapi di-strip oleh schema
  }
  ```
- **Response 200:** stream teks → JSON `TemplateData` (`hero`, `about`, `layanan`, `footer`, dst). Marker `__GENERATE_ERROR__` di stream menandai kegagalan AI.
- **Error:** `401` belum login · `403` IP diblokir · `429` kuota harian habis · `400` input invalid.

---

## Subdomain

### `GET /api/check-subdomain?subdomain=<sub>`
Cek ketersediaan subdomain (UX wizard). Tanpa auth.
- **Response 200:** `{ "available": boolean, "message": string }`
- Validasi format/reserved via `lib/subdomain` (3–30 char, `[a-z0-9-]`, tak diawali/diakhiri `-`, tanpa `--`, bukan reserved).

---

## Payment & Deploy

### `POST /api/payment/create`
Buat invoice Duitku + simpan subdomain (server-authoritative).
- **Auth:** wajib login + kepemilikan website.
- **Request:** `{ "websiteId": "uuid", "subdomain": "string" }`
- **Proses:** validasi subdomain → cek unik → simpan subdomain (service role) → harga (early adopter <75 aktif = Rp99.000, selain itu Rp199.000) → buat invoice Duitku → insert row `payments` (status `pending`).
- **Response 200:** `{ "paymentUrl": "https://...", "order_id": "BWI-...", "harga": 99000, "isEarlyAdopter": true }`
- **Error:** `401` · `404` website bukan milik user · `409` subdomain dipakai · `400` invalid · `500`.

### `POST /api/payment/webhook`
Callback Duitku (server-to-server, **tanpa** session). Dipanggil Duitku, bukan client.
- **Auth:** verifikasi signature `MD5(merchantCode + amount + merchantOrderId + apiKey)` (timing-safe compare).
- **Request:** form-urlencoded / JSON dari Duitku (`merchantCode`, `amount`, `merchantOrderId`, `signature`, `resultCode`, `reference`).
- **Proses:** signature valid → cross-check `amount` vs `payments.harga` → `resultCode '00'`: set payment `paid` + aktifkan website (`status='active'`, `expires_at = now()+1th`). `'01'`: set `failed`. Idempoten (callback ulang aman).
- **Response:** `200 {status:'success'|'ignored'}` · `401` signature salah · `400` amount mismatch · `500` (memicu retry Duitku).

### `POST /api/payment/cancel`
Batalkan payment pending milik user.
- **Auth:** login + kepemilikan payment. **Request:** `{ "paymentId": "uuid" }` → **200** `{ success: true }`.

### `POST /api/website/deploy`
Aktivasi website **setelah** pembayaran lunas (authoritative). Dipanggil saat user deploy website yang sudah paid.
- **Auth:** login + kepemilikan + **wajib ada payment `paid`**.
- **Request:** `{ "websiteId": "uuid", "subdomain": "string" }`
- **Proses:** validasi subdomain → cek unik → set `subdomain` + `status='active'` (service role).
- **Response 200:** `{ "success": true, "subdomain": "..." }` · `402` belum ada payment lunas · `409` subdomain dipakai · `401`/`404`/`400`.

### `POST /api/website/delete`
Hard-delete website milik user.
- **Auth:** login + kepemilikan. **Request:** `{ "websiteId": "uuid" }`
- **Proses:** detach `payments` (soft-delete, `website_id=null`) → hapus row `websites` (service role). → **200** `{ success: true }`.

---

## Auth

Semua dilindungi IP ban + rate limit + strike auto-ban.

### `POST /api/auth/register`
- **Request:** `{ "name": "string(1-80)", "email": "email", "password": "string(6-200)" }`
- **Limit:** max 3 akun / IP / 60 menit. → **200** `{ success: true }` (memicu email konfirmasi) · `429` · `403`.

### `POST /api/auth/login`
- **Request:** `{ "email": "email", "password": "string" }` → **200** `{ success: true }` (set cookie session).
- Gagal login = 1 strike (auto-ban berulang). Pesan generik "Email atau password salah".

### `POST /api/auth/forgot-password`
- **Request:** `{ "email": "email" }` → **selalu 200** `{ success: true }` (anti email-enumeration). Mengirim kode OTP recovery.

### `POST /api/auth/reset-password`
- **Request:** `{ "email": "email", "token": "6-10 digit", "password": "string(6-200)" }`
- Verifikasi OTP recovery → set password baru → sign out. OTP salah = strike. → **200** `{ success: true }` · `400`.

### `GET /api/auth/callback`
OAuth callback Supabase (Google). Redirect, bukan JSON.

---

## Admin

Semua endpoint admin dijaga `requireAdminApi()` (role `app_metadata.role==='admin'` **atau** email allowlist di `lib/auth`). Non-admin → `403`.

### `GET /api/admin/users`
Daftar semua user + statistik. → **200** `{ "users": [{ id, email, name, createdAt, lastSignInAt, role, generatedToday, totalWebsites, activeWebsites }] }`.

### `POST /api/admin/reset-quota`
Reset kuota generate harian user (hapus `generate_logs` hari ini).
- **Request:** `{ "userId": "uuid" }` → **200** `{ success: true, deleted: number }`.

### `POST /api/admin/delete-user`
Hapus user + semua datanya (website, generate_logs; payments di-detach). Tak bisa hapus diri sendiri / admin lain.
- **Request:** `{ "userId": "uuid" }` → **200** `{ success: true }` · `400` hapus diri sendiri · `403` target admin.

### `/api/admin/ban-ip`
- `GET` → `{ bans: [...] }` (semua ban).
- `POST` `{ ip, reason?, expiresAt? }` → upsert ban (`expiresAt` omit = permanen). → `{ success: true }`.
- `DELETE ?ip=<ip>` → cabut ban. → `{ success: true }`.
