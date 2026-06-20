-- ============================================================================
-- Security hardening — tutup H1 (payment/authorization bypass) + M2 (dup subdomain)
-- ============================================================================
-- Konteks: aktivasi website (status -> 'active') + penetapan subdomain kini HANYA
-- lewat server (service role) di /api/website/deploy & /api/payment/create.
-- Migration ini memaksa hal itu di level DB supaya client TIDAK bisa bypass
-- (mis. lewat supabase browser client dari console).
-- Aman dijalankan ulang (idempotent).

-- ----------------------------------------------------------------------------
-- 1) Kolom dilindungi: status / subdomain / expires_at hanya boleh diubah server.
--    RLS row-level tidak bisa membatasi PER KOLOM, jadi pakai trigger BEFORE UPDATE.
--    Trigger tetap berjalan untuk service_role (bypassrls tidak melewati trigger),
--    maka service_role / postgres di-allow eksplisit; authenticated/anon diblok.
-- ----------------------------------------------------------------------------
create or replace function public.guard_websites_protected_cols()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Server (service role) atau migration (postgres) boleh ubah apa saja.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  -- Client (authenticated/anon) TIDAK boleh mengubah kolom sensitif ini.
  if new.status     is distinct from old.status
     or new.subdomain  is distinct from old.subdomain
     or new.expires_at is distinct from old.expires_at then
    raise exception
      'Kolom status/subdomain/expires_at hanya dapat diubah oleh server.'
      using errcode = '42501'; -- insufficient_privilege
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_websites_protected_cols on public.websites;
create trigger trg_guard_websites_protected_cols
  before update on public.websites
  for each row
  execute function public.guard_websites_protected_cols();

-- ----------------------------------------------------------------------------
-- 2) Cegah dua website memakai subdomain sama (race TOCTOU di cek aplikasi).
--    Partial unique: baris draft dengan subdomain NULL tidak saling bentrok.
-- ----------------------------------------------------------------------------
create unique index if not exists websites_subdomain_unique
  on public.websites (subdomain)
  where subdomain is not null;
