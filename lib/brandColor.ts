// Warna default color-picker di /buat. Kalau user tidak menyentuh picker, nilainya
// tetap ini — dianggap "belum memilih" supaya template tetap memakai palet khasnya.
const PICKER_DEFAULT = "#4f46e5";

/**
 * Warna aksen efektif untuk template.
 * - user memilih warna  → pakai warna itu.
 * - masih default/kosong → pakai `signature` (warna khas template).
 */
export function brandColor(primary: string | undefined, signature: string): string {
  const p = (primary || "").trim().toLowerCase();
  if (!p || p === PICKER_DEFAULT) return signature;
  return primary as string;
}

/**
 * Nada gelap (near-black) yang diwarnai `hex`, untuk latar hero/footer/section gelap
 * supaya ikut warna brand tapi tetap gelap & teks putih tetap terbaca.
 */
export function darkTone(hex: string, factor = 0.22): string {
  const c = hex.replace("#", "").trim();
  if (c.length < 6) return "#0B132B";
  const to = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  const r = parseInt(c.slice(0, 2), 16) * factor;
  const g = parseInt(c.slice(2, 4), 16) * factor;
  const b = parseInt(c.slice(4, 6), 16) * factor;
  return `#${to(r)}${to(g)}${to(b)}`;
}

/**
 * Pilih warna teks (gelap/terang) yang kontras di atas latar `hex`,
 * dipakai untuk teks di atas tombol beraksen.
 */
export function textOn(hex: string): string {
  const c = hex.replace("#", "").trim();
  if (c.length < 6) return "#0a0a0a";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.6 ? "#0a0a0a" : "#ffffff";
}
