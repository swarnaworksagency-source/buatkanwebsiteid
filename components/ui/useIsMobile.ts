"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Lebar viewport tempat template dirender, diisi oleh `IframePreview`.
 *
 * Perlu context karena komponen template dieksekusi di window PARENT walaupun
 * DOM-nya berada di dalam iframe — `window.matchMedia` di sana mengukur layar
 * asli, bukan lebar iframe. null = render normal (pakai matchMedia).
 */
export const ViewportWidthContext = createContext<number | null>(null);

/**
 * Menentukan apakah template harus dirender dengan layout mobile.
 *
 * Template jasa/peternakan memilih layout lewat ternary `isMob ? ... : ...`,
 * bukan lewat breakpoint Tailwind. Kalau `isMob` hanya dihitung dari prop
 * `forceMobile`, halaman publik (`/s/[subdomain]`) dan preview yang TIDAK
 * mengirim prop itu akan selalu memakai cabang desktop — termasuk saat dibuka
 * di HP, sehingga layoutnya berantakan.
 *
 * Aturan:
 * - `forceMobile === true`  → paksa layout mobile (tombol preview mobile).
 * - `forceMobile === false` → paksa layout desktop (tombol preview desktop).
 * - `undefined` di dalam `IframePreview` → ikut lebar iframe.
 * - `undefined` di luar iframe → ikut lebar viewport asli (< 768px = mobile).
 *
 * Render pertama di server selalu desktop; setelah hydrate, perangkat sempit
 * beralih ke layout mobile.
 */
export function useIsMobile(forceMobile?: boolean, breakpoint = 767): boolean {
  const previewWidth = useContext(ViewportWidthContext);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (forceMobile !== undefined || previewWidth !== null) return;
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [forceMobile, previewWidth, breakpoint]);

  if (forceMobile !== undefined) return forceMobile;
  if (previewWidth !== null) return previewWidth <= breakpoint;
  return narrow;
}
