-- ============================================================================
-- Storage upload policy untuk bucket 'website-assets'.
-- Hardening sebelumnya (20260621000100) menghapus policy lama & hanya menyisakan
-- SELECT (public bucket) + DELETE (owner). INSERT/UPDATE tidak punya policy →
-- semua upload dari client ditolak RLS:
--   "new row violates row-level security policy" (StorageApiError).
-- Migration ini mengembalikan kemampuan upload untuk user login, tetap ketat:
-- hanya role authenticated, hanya bucket 'website-assets', owner = pengunggah.
-- Idempotent.
-- ============================================================================

-- INSERT: user login boleh mengunggah ke bucket ini. owner di-set otomatis oleh
-- storage = auth.uid(); cek owner mencegah menumpang nama owner orang lain.
drop policy if exists "Authenticated can upload files" on storage.objects;
create policy "Authenticated can upload files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'website-assets' and owner = auth.uid());

-- UPDATE: dibutuhkan karena client upload memakai { upsert: true } — kalau path
-- sudah ada, storage melakukan UPDATE, bukan INSERT. Batasi ke file milik sendiri.
drop policy if exists "Owner can update own files" on storage.objects;
create policy "Owner can update own files" on storage.objects
  for update to authenticated
  using (bucket_id = 'website-assets' and owner = auth.uid())
  with check (bucket_id = 'website-assets' and owner = auth.uid());
