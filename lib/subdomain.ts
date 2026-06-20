// Validasi subdomain terpusat — dipakai server (authoritative) DAN client (UX).
// Jangan duplikasi daftar/aturan di tempat lain; import dari sini.

export const RESERVED_SUBDOMAINS = [
  'www', 'api', 'admin', 'dashboard',
  'app', 'mail', 'smtp', 'ftp', 'blog',
  'dev', 'staging', 'test', 'demo',
  'support', 'help', 'docs', 'status',
  'buat', 'preview', 'auth', 'harga',
  'portofolio', 'tentang', 'beranda', 's',
];

const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export type SubdomainCheck =
  | { ok: true; value: string }
  | { ok: false; message: string };

// Normalisasi + validasi penuh. Kembalikan nilai bersih kalau valid.
export function validateSubdomain(raw: unknown): SubdomainCheck {
  if (typeof raw !== 'string') return { ok: false, message: 'Subdomain wajib diisi.' };
  const value = raw.trim().toLowerCase();
  if (value.length < 3) return { ok: false, message: 'Minimal 3 karakter.' };
  if (value.length > 30) return { ok: false, message: 'Maksimal 30 karakter.' };
  if (!SUBDOMAIN_REGEX.test(value)) {
    return { ok: false, message: 'Hanya huruf kecil, angka, dan tanda hubung. Tidak boleh diawali/diakhiri tanda hubung.' };
  }
  if (value.includes('--')) return { ok: false, message: 'Tidak boleh menggunakan tanda hubung ganda (--).' };
  if (RESERVED_SUBDOMAINS.includes(value)) return { ok: false, message: `"${value}" adalah subdomain yang sudah dipesan sistem.` };
  return { ok: true, value };
}
