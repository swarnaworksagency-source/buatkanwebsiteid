import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Schema `wabot` TIDAK diekspos via PostgREST/Kong — hanya dijangkau langsung
// lewat Postgres. App berjalan di VPS yang sama, jadi query dijalankan via
// `docker exec` ke container db (pola sama dengan /api/admin/infra).
// CATATAN KEAMANAN: `sql` di sini SELALU string literal internal + UUID yang
// sudah divalidasi UUID_RE. JANGAN pernah menyisipkan teks bebas user ke sini.
// Hindari karakter " di dalam SQL (memutus arg shell yang dibungkus ").
async function psql(sql: string, tuplesOnly: boolean): Promise<string> {
  const flags = tuplesOnly ? '-tAc' : '-c';
  const cmd = `docker exec supabase-db psql -U postgres -d postgres ${flags} "${sql}"`;
  const { stdout } = await execAsync(cmd, { timeout: 8000, maxBuffer: 8 * 1024 * 1024 });
  return stdout.trim();
}

// Jalankan SQL yang mengembalikan satu nilai JSON (json_build_object / json_agg).
// Return objek hasil parse, atau `fallback` bila gagal (mis. dev Windows tanpa docker).
export async function wabotQueryJson<T>(sql: string, fallback: T): Promise<T> {
  try {
    const out = await psql(sql, true);
    if (!out) return fallback;
    return JSON.parse(out) as T;
  } catch {
    return fallback;
  }
}

// Jalankan SQL mutasi (delete/update). Throw bila gagal.
export async function wabotExec(sql: string): Promise<void> {
  await psql(sql, false);
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
