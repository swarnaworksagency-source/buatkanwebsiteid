-- ============================================================================
-- Advisor hardening (sudah diterapkan ke project fvwqpwwbgzxokkiqtbqk via MCP)
-- Menutup temuan get_advisors(security): permissive testimonials INSERT,
-- public bucket listing, DELETE storage tanpa cek owner, dan lint RLS-no-policy.
-- Idempotent.
-- ============================================================================

-- 1) testimonials: INSERT tidak lagi WITH CHECK(true).
--    Paksa approved=false (cegah injeksi testimoni auto-tayang) + website_id wajib.
alter table public.testimonials alter column approved set default false;
drop policy if exists "Anyone can submit testimonial" on public.testimonials;
create policy "Submit testimonial pending" on public.testimonials
  for insert to anon, authenticated
  with check (approved = false and website_id is not null);

-- 2) Storage bucket 'website-assets' (public=true → URL publik tetap berfungsi tanpa
--    policy SELECT). Hapus SELECT luas (matikan listing/enumerasi file),
--    dan perketat DELETE: hanya pemilik file (owner) — sebelumnya siapa pun bisa hapus.
drop policy if exists "Public can view files" on storage.objects;
drop policy if exists "Users can delete own files" on storage.objects;
create policy "Owner can delete own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'website-assets' and owner = auth.uid());

-- 3) Tabel khusus service-role: deny-all eksplisit untuk client (service role bypass RLS).
--    Menghapus lint "RLS enabled, no policy" tanpa mengubah perilaku (tetap tertutup).
drop policy if exists "No client access" on public.banned_ips;
create policy "No client access" on public.banned_ips      for all to anon, authenticated using (false) with check (false);
drop policy if exists "No client access" on public.rate_limit_hits;
create policy "No client access" on public.rate_limit_hits for all to anon, authenticated using (false) with check (false);
drop policy if exists "No client access" on public.signup_attempts;
create policy "No client access" on public.signup_attempts for all to anon, authenticated using (false) with check (false);
drop policy if exists "No client access" on public.buatkanwebid;
create policy "No client access" on public.buatkanwebid    for all to anon, authenticated using (false) with check (false);

-- CATATAN: "Leaked Password Protection" (HaveIBeenPwned) tidak bisa diatur via SQL.
-- Aktifkan manual: Dashboard → Authentication → Password/Attack Protection.
