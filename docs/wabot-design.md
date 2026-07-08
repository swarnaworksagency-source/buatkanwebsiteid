# WA Reminder Bot — Desain Teknis

> Fitur BuatkanWeb.id. Bot WhatsApp untuk reminder bisnis UMKM via bahasa natural,
> plus kanal WA untuk reminder perpanjangan website.
> Status: desain — belum diimplementasi. Tanggal: 2026-07-06.

## 1. Ringkasan

- **Bentuk**: proses Node.js terpisah (PM2 `wabot`) di VPS yang sama (103.93.160.104). BUKAN bagian dari app Next.js.
- **WA layer**: [Baileys](https://github.com/WhiskeySockets/Baileys) (WhatsApp Web multi-device, unofficial). Satu nomor bot dedicated.
- **NLP**: Gemini 2.5 Flash-Lite — parse pesan Indonesia natural → JSON terstruktur (intent + waktu + isi).
- **DB**: Postgres self-host yang sudah ada, **schema baru `wabot`**. Koneksi langsung `pg` ke `127.0.0.1:5432` (bot serumah dengan DB) — tidak lewat PostgREST/Kong.
- **Akses**: gratis untuk 30 orang pertama yang mengirim kode aktivasi `buatkanweb123`. Selain itu ditolak (waitlist).
- **Integrasi BuatkanWeb**: user bisa link akun via kode 6 digit dari dashboard → reminder perpanjangan website juga dikirim via WA (selain email Resend yang sudah jalan).
- **Pintu masuk**: HANYA di dashboard setelah login. Dashboard punya 2 menu utama: **Website** (existing) + **Bot Jadwal** (baru). Tidak ada halaman publik/marketing terpisah untuk bot.

## 2b. Navigasi dashboard

Dashboard jadi dua seksi (tab/menu di header `DashboardClient`):

| Menu | Isi | Route |
|------|-----|-------|
| **Website** | Grid website existing (semua UI sekarang tak berubah) | `/dashboard` |
| **Bot Jadwal** | Panel WA reminder: status link, kode aktivasi `buatkanweb123` + nomor bot, tombol "Hubungkan WA" (kode 6 digit), daftar reminder aktif (read-only mirror dari `wabot.reminders`) | `/dashboard/bot` |

- Guard sama seperti dashboard: `page.tsx` server-side sudah `redirect('/auth/login')` bila `!user`. Route `/dashboard/bot` ikut pola sama.
- **Bot Jadwal HANYA panel akses** — bikin/hapus reminder tetap via chat WA (bahasa natural). Web hanya: tampilkan kode aktivasi + nomor, generate kode link 6 digit, tampilkan status & daftar reminder (baca-saja). Tidak ada form CRUD reminder di web (fase awal).
- Data untuk panel diambil Next.js dari endpoint internal wabot `:3100` (`GET /me?user_id=`), bukan query langsung schema `wabot`.

## 2. Arsitektur

```
                            ┌──────────────────────────── VPS ────────────────────────────┐
WhatsApp user ⇄ WA servers ⇄│ Baileys socket                                              │
                            │      │                                                      │
                            │  ┌───▼──────────── wabot (PM2, Node/TS) ────────────┐       │
                            │  │ handlers.ts   → routing pesan masuk              │       │
                            │  │ nlp.ts        → Gemini 2.5 Flash-Lite (HTTPS out)│       │
                            │  │ scheduler.ts  → loop 30s, kirim reminder due     │       │
                            │  │ http.ts       → API internal :3100 (localhost)   │       │
                            │  │ db.ts         → pg pool → 127.0.0.1:5432         │       │
                            │  └───────┬──────────────────────────▲───────────────┘       │
                            │          │ schema `wabot`           │ POST /send            │
                            │      ┌───▼────┐              ┌──────┴─────────┐             │
                            │      │Postgres│              │ Next.js app    │             │
                            │      │(docker)│◄─────────────│ :3000 (PM2)    │             │
                            │      └────────┘  public+wabot│ cron expiry dll│             │
                            │                              └────────────────┘             │
                            └─────────────────────────────────────────────────────────────┘
```

Poin desain:

- **Proses terpisah** — crash bot tidak menjatuhkan website; deploy independen. Kode di `~/Soni/wabot` (repo git sendiri).
- **Session Baileys** disimpan multi-file auth state di `~/Soni/wabot/auth/` (masuk cakupan backup cron harian? → tambah ke `backup_db.sh` tar).
- **API internal** `http://127.0.0.1:3100` (bearer `WABOT_HTTP_SECRET`), dipakai Next.js:
  - `POST /send` `{to, text}` — dipanggil cron expiry untuk reminder perpanjangan via WA.
  - `GET /status` — connected/disconnected + jumlah user aktif (untuk `/api/admin/infra`).
- **Scheduler** = polling DB tiap 30 detik, bukan in-memory timer → crash-safe, restart PM2 tidak kehilangan jadwal.
- **Gemini hanya dipanggil untuk user berstatus `active`** — orang asing dapat balasan statis (hemat biaya + anti-abuse).

## 3. Fitur

### MVP (fase 1)
| # | Fitur | Contoh input | Perilaku |
|---|-------|--------------|----------|
| 1 | Aktivasi kode | `buatkanweb123` | Cek slot (< 30) → aktif + pesan sambutan. Slot habis → pesan waitlist. |
| 2 | Buat reminder sekali | "ingetin besok jam 9 bayar supplier" | Gemini parse → konfirmasi: "✅ Reminder #3: Bayar supplier — Rabu 8 Jul 09.00" |
| 3 | Buat reminder berulang | "tiap tanggal 1 jam 8 ingetin bayar listrik" | Simpan recurrence monthly, hitung `next_run_at` |
| 4 | List | "list" / "reminder apa aja" | Daftar bernomor, urut waktu |
| 5 | Hapus | "hapus 3" / "batalin yang listrik" | Match by nomor atau fuzzy judul (Gemini) |
| 6 | Pengiriman | — | Scheduler kirim "🔔 Bayar supplier" tepat waktu, retry 3× backoff |
| 7 | Help | "help" / pesan tak dipahami | Panduan singkat + contoh |

### Fase 2
- **Link akun BuatkanWeb**: halaman `dashboard/bot (menu "Bot Jadwal")` → generate kode 6 digit (TTL 10 menit) → user kirim `LINK 482913` ke bot → `wabot.users.buatkanweb_user_id` terisi.
- **Reminder perpanjangan via WA**: cron `/api/cron/expiry` (sudah ada, H-7/H-3/H-1/expired) tambah panggilan `POST :3100/send` bila user ter-link.
- **Snooze/done**: balas "snooze 1 jam" / "done" atas pesan reminder.
- **Stats di `/admin`**: user aktif, reminder terkirim/hari, error rate.

### Non-fitur (sengaja tidak)
- Grup WA: diabaikan total (`@g.us` di-skip).
- Broadcast/promo massal: tidak — risiko ban Baileys tinggi.
- Multi-bahasa: Indonesia saja.

## 4. Flow

### 4.1 Aktivasi
```
User kirim "buatkanweb123"
→ upsert wabot.users (status pending) by wa_jid
→ atomic: UPDATE activation_codes SET used_count=used_count+1
          WHERE code=$1 AND used_count < max_uses RETURNING *
→ dapat baris  : users.status='active' → "Selamat datang! …contoh perintah…"
→ tidak dapat  : "Slot gratis penuh (30/30). Daftar tunggu: …"
```

### 4.2 Pesan masuk (user aktif)
```
Pesan masuk (bukan grup, bukan status)
→ rate limit: max 10 pesan/menit per JID (lebih → diam)
→ log ke wabot.messages_log (direction='in')
→ Gemini Flash-Lite, structured output:
   { intent: create|list|delete|snooze|done|help|smalltalk,
     title, datetime_iso, recurrence{freq,day,weekday,time}, target_index, reply }
   Konteks prompt: now() WIB, daftar reminder aktif user (untuk delete/fuzzy match)
→ switch(intent) → aksi DB → balasan konfirmasi (template, bukan LLM freeform)
→ parse gagal / ambigu → balas minta klarifikasi ("Jam berapa?")
```

### 4.3 Pengiriman (scheduler, tiap 30 detik)
```
SELECT * FROM wabot.reminders
WHERE status='scheduled' AND next_run_at <= now()
FOR UPDATE SKIP LOCKED
→ kirim via Baileys → insert wabot.deliveries
→ sukses:
   one-shot   → status='sent'
   recurring  → next_run_at = hitung berikutnya (WIB)
→ gagal: attempt+1, next_run_at += 2^attempt menit; attempt>3 → status='failed'
```

### 4.4 Link akun + reminder perpanjangan
```
dashboard/bot (menu "Bot Jadwal") → POST /api/wa/link-code (auth user) → insert wabot.link_codes (6 digit, TTL 10 mnt)
user WA: "LINK 482913" → bot cari kode valid → set users.buatkanweb_user_id, used_at=now()

cron expiry (sudah ada):
  kirim email Resend (existing)
+ jika ada wabot.users ter-link ke user_id website:
    POST 127.0.0.1:3100/send { to, text: "Website X kadaluarsa 3 hari lagi. Perpanjang: …" }
```

## 5. Data model — schema `wabot`

```sql
CREATE SCHEMA wabot;

CREATE TABLE wabot.users (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_jid              text UNIQUE NOT NULL,          -- '628xxx@s.whatsapp.net'
  phone               text NOT NULL,                 -- '628xxx' (dari jid)
  display_name        text,
  status              text NOT NULL DEFAULT 'pending',  -- pending|active|blocked
  activation_code     text REFERENCES wabot.activation_codes(code),
  buatkanweb_user_id  uuid,                          -- FK logis ke auth.users (tanpa constraint lintas schema)
  timezone            text NOT NULL DEFAULT 'Asia/Jakarta',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wabot.activation_codes (
  code        text PRIMARY KEY,
  max_uses    int  NOT NULL,
  used_count  int  NOT NULL DEFAULT 0,
  active      bool NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
-- seed: INSERT INTO wabot.activation_codes VALUES ('buatkanweb123', 30);

CREATE TABLE wabot.reminders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES wabot.users(id) ON DELETE CASCADE,
  title         text NOT NULL,                 -- 'Bayar supplier'
  recurrence    jsonb,                         -- null = sekali; {freq:'daily'|'weekly'|'monthly', time:'09:00', weekday?, day?}
  next_run_at   timestamptz NOT NULL,          -- kapan firing berikutnya (UTC)
  status        text NOT NULL DEFAULT 'scheduled', -- scheduled|sent|failed|cancelled
  attempt       int  NOT NULL DEFAULT 0,
  source_text   text,                          -- pesan asli user (debug/audit)
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reminders_due ON wabot.reminders (next_run_at) WHERE status = 'scheduled';

CREATE TABLE wabot.deliveries (
  id             bigserial PRIMARY KEY,
  reminder_id    uuid REFERENCES wabot.reminders(id) ON DELETE SET NULL,
  wa_message_id  text,
  status         text NOT NULL,                -- sent|failed
  error          text,
  sent_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wabot.link_codes (
  code                text PRIMARY KEY,        -- 6 digit
  buatkanweb_user_id  uuid NOT NULL,
  expires_at          timestamptz NOT NULL,
  used_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wabot.messages_log (
  id          bigserial PRIMARY KEY,
  wa_jid      text NOT NULL,
  direction   text NOT NULL,                   -- in|out
  body        text,
  parsed      jsonb,                           -- hasil Gemini (direction=in)
  created_at  timestamptz NOT NULL DEFAULT now()
);
-- retensi: cron DELETE messages_log > 30 hari
```

Keamanan schema:
- `wabot` **tidak** dimasukkan ke `PGRST_DB_SCHEMAS` → tidak terekspos ke Kong/PostgREST/anon key sama sekali.
- Bot pakai role Postgres sendiri (`wabot_svc`, password di `~/Soni/wabot/.env`) dengan grant hanya ke schema `wabot`.
- Next.js butuh baca `wabot` untuk stats admin & link-code → via route handler server pakai koneksi `pg` langsung? Tidak — Next di VPS sama, tapi lebih simpel: endpoint internal wabot `:3100` yang melayani (`GET /stats`, `POST /link-code`). Satu pemilik schema = proses bot.

## 6. Parsing Gemini — kontrak

Model: `gemini-2.5-flash-lite`, structured output (responseSchema), temperature 0.

```jsonc
// input konteks: teks user, now (WIB ISO), daftar reminder aktif [{index,title,next_run}]
// output:
{
  "intent": "create | list | delete | snooze | done | help | smalltalk",
  "title": "Bayar supplier",            // create
  "datetime_iso": "2026-07-08T09:00:00+07:00", // create/snooze — WAJIB timezone +07:00
  "recurrence": { "freq": "monthly", "day": 1, "time": "08:00" } | null,
  "target_index": 3,                    // delete/snooze/done
  "clarify": "Jam berapa?" | null       // jika ambigu → bot balas ini, jangan eksekusi
}
```

Aturan: waktu lampau → `clarify`; tanpa jam → default 09.00 + konfirmasi; balasan bot selalu template kode (bukan freeform LLM) supaya konsisten & aman.

## 7. Operasional & risiko

- **PM2**: `wabot` (restart on crash, max-memory 512M). Deploy: `git pull && npm i && npm run build && pm2 restart wabot`.
- **Pairing**: pairing code (bukan QR) via log PM2 saat pertama run. Session persist → tidak perlu ulang.
- **Risiko ban WA** (Baileys unofficial): mitigasi — nomor dedicated (bukan nomor pribadi), volume rendah, hanya balas yang chat duluan + reminder milik user sendiri, tidak ada broadcast. Terima risiko: kalau ke-ban, ganti nomor, session reset, user diinfo.
- **Nomor**: perlu SIM/eSIM baru khusus bot — prasyarat sebelum implementasi.
- **Biaya**: Gemini Flash-Lite ≈ gratis pada volume 30 user; infra Rp0 (VPS existing).
- **Backup**: tambah `~/Soni/wabot/auth` ke tar `backup_db.sh`; data reminder ikut pg_dumpall existing.
- **Monitoring**: `GET /status` dipanggil `/api/admin/infra` → tampil di panel `/admin`.

## 8. Struktur kode (`~/Soni/wabot`, repo terpisah)

```
wabot/
├─ src/
│  ├─ index.ts        # bootstrap: wa + scheduler + http
│  ├─ wa.ts           # Baileys connect, reconnect, send helper
│  ├─ handlers.ts     # routing pesan masuk (aktivasi → link → NLP)
│  ├─ nlp.ts          # Gemini client + schema + prompt
│  ├─ scheduler.ts    # loop 30s, due query, recurrence calc
│  ├─ recurrence.ts   # next_run_at calculator (WIB-aware)
│  ├─ http.ts         # internal API :3100 (send, status, stats, link-code)
│  ├─ db.ts           # pg pool + query helpers
│  └─ replies.ts      # semua template balasan (Indonesia)
├─ migrations/        # SQL numbered, apply manual via psql
├─ .env               # DATABASE_URL, GEMINI_API_KEY, WABOT_HTTP_SECRET, BOT_PHONE
└─ ecosystem.config.js
```

## 9. Urutan implementasi

1. Beli/siapkan nomor WA dedicated.
2. Migration schema `wabot` + role `wabot_svc` (psql via SSH).
3. Scaffold repo, Baileys connect + echo test, pairing.
4. Aktivasi kode + rate limit + messages_log.
5. Gemini parse + create/list/delete + konfirmasi.
6. Scheduler + deliveries + retry + recurrence.
7. PM2 + backup auth dir + `/status` → admin panel.
8. (Fase 2) link-code dashboard + cron expiry → WA.
