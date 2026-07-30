-- ============================================================================
-- Perketat SELECT pada public.websites.
--
-- Masalah: dua policy SELECT memakai USING (true):
--   - "Public can view websites for preview" (role anon)
--   - "Users can check subdomain availability" (role authenticated)
-- Anon key bersifat publik (dipakai di browser), jadi siapa pun bisa memanggil
-- PostgREST dan membaca SELURUH baris websites — termasuk draft/preview milik
-- user lain berikut isi `generated_content`. Terverifikasi: request anon ke
-- /rest/v1/websites mengembalikan 200 + isi tabel.
--
-- Aturan baru:
--   - anon & authenticated hanya boleh membaca situs yang sudah TERBIT
--     (status 'active') atau 'expired' — 'expired' dibutuhkan /s/[subdomain]
--     untuk merender halaman "website tidak aktif".
--   - pemilik boleh membaca semua barisnya sendiri (draft/preview dsb).
-- Efek samping yang disengaja: situs berstatus 'preview' yang subdomain-nya
-- sudah diisi saat invoice dibuat TIDAK lagi bisa diakses publik sebelum lunas.
--
-- Perubahan kode yang menyertai (kalau tidak, fitur rusak):
--   - app/api/check-subdomain      → pakai service role (cek lintas user)
--   - app/api/payment/create       → hitungan early adopter pakai service role
-- Query lain sudah ter-scope `.eq('user_id', user.id)` atau service role.
-- Idempotent.
-- ============================================================================

drop policy if exists "Public can view websites for preview" on public.websites;
drop policy if exists "Public can view active websites" on public.websites;
drop policy if exists "Users can check subdomain availability" on public.websites;
drop policy if exists "Public can view published websites" on public.websites;
drop policy if exists "Users can view their own websites" on public.websites;

-- Pengunjung situs publik (anon) + user login yang membuka situs orang lain.
create policy "Public can view published websites" on public.websites
  for select to anon, authenticated
  using (status in ('active', 'expired'));

-- Pemilik: semua barisnya sendiri, apa pun statusnya.
create policy "Users can view their own websites" on public.websites
  for select to authenticated
  using (auth.uid() = user_id);
