"use client";

import { useEffect, useRef, useState } from "react";
import { ViewportWidthContext } from "@/components/ui/useIsMobile";
import { createRoot, type Root } from "react-dom/client";

/**
 * Render konten di dalam <iframe> dengan viewport ASLI sesuai lebar iframe.
 *
 * Kenapa iframe, bukan sekadar <div> sempit + prop `forceMobile`?
 * Media query Tailwind (`sm:`/`md:`/`lg:`) merespons lebar VIEWPORT, bukan lebar
 * container. Men-shrink <div> di viewport desktop tetap mengaktifkan kelas desktop
 * → layout berantakan. iframe punya viewport sendiri (= lebarnya), jadi breakpoint
 * berperilaku persis seperti HP/Chrome device simulator. Preview === produksi.
 *
 * Konten dirender lewat React root TERPISAH di dalam iframe (createRoot), bukan
 * createPortal: event sintetis React tidak menyeberang batas dokumen iframe, jadi
 * portal akan membuat klik/ketik (inline edit) mati. Root terpisah = event hidup,
 * sementara state tetap di parent (callback ditutup lewat closure pada `children`).
 */
export function IframePreview({
  children,
  dark = false,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<Root | null>(null);
  const rootedBodyRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  // Lebar iframe → dipakai template untuk memutuskan layout mobile/desktop.
  // Media query saja tidak cukup: komponen dieksekusi di window parent.
  const [width, setWidth] = useState<number | null>(null);

  const setup = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    // viewport meta → media query mengikuti lebar iframe (real mobile viewport).
    if (!doc.querySelector('meta[name="viewport"]')) {
      const meta = doc.createElement("meta");
      meta.setAttribute("name", "viewport");
      meta.setAttribute("content", "width=device-width, initial-scale=1");
      doc.head.appendChild(meta);
    }

    syncStyles(doc, dark);

    // Browser bisa mengganti document about:blank saat 'load' → root lama jadi basi.
    // Buat ulang root kalau body target berubah.
    if (rootRef.current && rootedBodyRef.current !== doc.body) {
      const stale = rootRef.current;
      rootRef.current = null;
      setTimeout(() => stale.unmount(), 0);
    }
    if (!rootRef.current) {
      const container = doc.createElement("div");
      doc.body.innerHTML = "";
      doc.body.appendChild(container);
      rootRef.current = createRoot(container);
      rootedBodyRef.current = doc.body;
    }
    setReady(true);
  };

  // Setup awal + re-sync style saat HMR (dev) menambah <style>/<link>.
  useEffect(() => {
    setup();
    const obs = new MutationObserver(() => {
      const doc = iframeRef.current?.contentDocument;
      if (doc) syncStyles(doc, dark);
    });
    obs.observe(document.head, { childList: true, subtree: true });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tema berubah → update background iframe.
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (doc?.body) doc.body.style.background = dark ? "#111111" : "#ffffff";
  }, [dark]);

  // Pantau lebar iframe supaya breakpoint template ikut lebar preview.
  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    const sync = () => setWidth(el.getBoundingClientRect().width || null);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Render ulang ke root iframe tiap children berubah (state parent berubah).
  useEffect(() => {
    if (!ready || !rootRef.current) return;
    try {
      rootRef.current.render(
        <ViewportWidthContext.Provider value={width}>{children as React.ReactElement}</ViewportWidthContext.Provider>
      );
    } catch { /* root keburu unmount */ }
  }, [ready, children, width]);

  // Cleanup root saat unmount. Unmount async + try/catch supaya tidak balapan dengan
  // React yang membongkar <iframe> di tree luar (cegah crash removeChild null).
  useEffect(() => {
    return () => {
      const r = rootRef.current;
      rootRef.current = null;
      rootedBodyRef.current = null;
      if (r) setTimeout(() => { try { r.unmount(); } catch { /* iframe sudah hilang */ } }, 0);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="Preview"
      onLoad={setup}
      className={className}
      style={{
        border: "none",
        width: "100%",
        height: "100%",
        display: "block",
        background: dark ? "#111111" : "#ffffff",
      }}
    />
  );
}

// Salin semua <style> & <link rel=stylesheet> parent ke iframe supaya Tailwind +
// next/font ikut. Class html/body disamakan agar variabel font tersedia.
function syncStyles(doc: Document, dark: boolean) {
  doc.head.querySelectorAll("[data-preview-style]").forEach((n) => n.remove());
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    const clone = node.cloneNode(true) as HTMLElement;
    clone.setAttribute("data-preview-style", "");
    doc.head.appendChild(clone);
  });
  doc.documentElement.className = document.documentElement.className;
  doc.body.className = document.body.className;
  doc.body.style.margin = "0";
  doc.body.style.background = dark ? "#111111" : "#ffffff";
}
