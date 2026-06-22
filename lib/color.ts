// Util warna untuk theming template dari "Preferensi Warna" (warna.primary).
// Dipakai untuk memilih warna teks yang kontras di atas warna aksen, dan membuat
// versi transparan (rgba) dari sebuah hex untuk glow/elevation.

function parseHex(hex: string): [number, number, number] | null {
  let h = (hex || "").trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Warna teks/ikon yang terbaca di ATAS warna solid `hex`.
 * Pakai brightness YIQ: latar terang → teks gelap, latar gelap → teks terang.
 */
export function readableOn(hex: string, dark = "#0a0a0a", light = "#ffffff"): string {
  const rgb = parseHex(hex);
  if (!rgb) return dark;
  const [r, g, b] = rgb;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? dark : light;
}

/** rgba(...) dari hex + alpha (0..1). Untuk glow/tint transparan dari warna aksen. */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}
