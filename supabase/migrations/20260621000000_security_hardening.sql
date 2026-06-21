-- ============================================================================
-- Security hardening (sudah diterapkan ke project fvwqpwwbgzxokkiqtbqk via MCP)
-- ============================================================================
-- H1 — Payment/authorization bypass:
--   Aktivasi (status->'active') & penetapan subdomain HANYA lewat server (service role)
--   di /api/website/deploy & /api/payment/create. Trigger di bawah memaksa di level DB:
--   client (authenticated/anon) TIDAK boleh ubah status/subdomain/expires_at.
--   Catatan: kolom websites.subdomain SUDAH punya UNIQUE constraint (M2 aman).
-- Bonus (advisor): kunci SECURITY DEFINER trigger handle_new_user.
-- Aman dijalankan ulang (idempotent).

-- ----------------------------------------------------------------------------
-- 1) Guard kolom sensitif websites. SECURITY INVOKER (default) WAJIB supaya
--    current_user = role pemanggil (authenticated/service_role), bukan owner.
-- ----------------------------------------------------------------------------
create or replace function public.guard_websites_protected_cols()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  if new.status     is distinct from old.status
     or new.subdomain  is distinct from old.subdomain
     or new.expires_at is distinct from old.expires_at then
    raise exception 'Kolom status/subdomain/expires_at hanya dapat diubah oleh server.'
      using errcode = '42501';
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
-- 2) Harden trigger handle_new_user (SECURITY DEFINER): search_path tetap +
--    cabut EXECUTE dari publik (tutup RPC anon/authenticated). Trigger tetap jalan.
-- ----------------------------------------------------------------------------
alter function public.handle_new_user() set search_path = public, pg_temp;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
