-- ============================================================================
-- Kembalikan trigger auto-create profil saat signup + backfill profil hilang.
--
-- Masalah: migrasi ke Supabase self-host (2026-07-05) memulihkan schema `public`
-- lewat pg_dump, tapi trigger `on_auth_user_created` hidup di schema `auth`
-- sehingga TIDAK ikut terbawa. Function public.handle_new_user() tetap ada,
-- triggernya hilang → setiap user baru punya baris di auth.users tanpa baris di
-- public.profiles. Karena generate_logs / websites / payments semuanya FK ke
-- profiles(id), user tersebut gagal generate dengan:
--   23503 "insert or update on table \"generate_logs\" violates foreign key
--   constraint \"generate_logs_user_id_fkey\"" — details: Key is not present in
--   table "profiles".
-- Di UI muncul sebagai "Gagal mencatat kuota generate. Coba lagi."
-- Terdampak: 13 dari 35 user (semua signup setelah 2026-07-05).
--
-- Idempotent.
-- ============================================================================

-- ON CONFLICT DO NOTHING: signup tidak boleh gagal total hanya karena profil
-- sudah pernah dibuat (mis. backfill jalan duluan).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public', 'pg_temp' as $$
begin
  insert into public.profiles (id, email, nama_usaha)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill user yang terlanjur tidak punya profil.
insert into public.profiles (id, email, nama_usaha)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name', u.email)
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
