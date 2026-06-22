import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Upload aset (logo, foto, portofolio) lewat route server `/api/upload`.
 *
 * Kenapa lewat server, bukan `supabase.storage.from(...).upload(...)` langsung:
 * storage-api menolak INSERT object dari client yang sudah login dengan
 * "new row violates row-level security policy" — token user valid di GoTrue tapi
 * tidak diterima storage-api (regresi di sisi platform setelah perubahan kebijakan/JWT).
 * Sudah dibuktikan: bahkan policy `WITH CHECK (true)` pun tetap ditolak, jadi ini bukan
 * soal kebijakan RLS di tabel storage.objects. Route server memakai service-role (bypass
 * RLS) tapi tetap aman: digerbang wajib login + folder di-whitelist di server.
 *
 * Param `supabase`/`userId` dipertahankan demi kompatibilitas pemanggil; auth sebenarnya
 * divalidasi server-side via cookie session.
 *
 * @returns public URL file yang terunggah.
 */
export async function uploadAsset(
  _supabase: SupabaseClient,
  file: File | Blob,
  folder: string,
  _userId: string,
): Promise<string> {
  const fd = new FormData();
  fd.append("folder", folder);
  fd.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json())?.error || ""; } catch { /* abaikan */ }
    throw new Error(detail || `Upload gagal (HTTP ${res.status}).`);
  }
  const { url } = await res.json();
  if (!url) throw new Error("Server tidak mengembalikan URL file.");
  return url;
}
