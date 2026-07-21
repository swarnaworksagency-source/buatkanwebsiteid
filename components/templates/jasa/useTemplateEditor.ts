"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  TemplateData,
  AILayananItem,
  AICaraKerjaItem,
  AITestimonial,
  PaketHarga,
} from "@/types";

// Flat, serializable edit-state shared by the jasa templates.
export interface EditorState {
  namaBisnis: string;
  heroHeadline: string;
  heroSub: string;
  heroCta: string;
  aboutJudul: string;
  aboutDeskripsi: string;
  aboutKeunggulan: string[];
  aboutSkills: string[];
  layanan: AILayananItem[];
  caraKerja: AICaraKerjaItem[];
  caraKerjaTitle: string;
  testimonials: AITestimonial[];
  paketNama: string[];
  paketHargaList: string[];
  footerTagline: string;
  footerCta: string;
  footerKontakTitle: string;
  footerSosmedTitle: string;
  footerDesc: string;
  copyright: string;
  // Teks UI statis yang dioverride user (label section, badge, teks tombol). Key bebas per template.
  uiText: Record<string, string>;
  // Posisi/zoom tiap gambar (id → {x,y,scale}), dipakai template dengan slot gambar geser/zoom.
  imagePositions: Record<string, { x: number; y: number; scale: number }>;
}

interface HookInput {
  namaBisnis: string;
  hero: TemplateData["hero"];
  about: TemplateData["about"];
  layanan: AILayananItem[];
  caraKerja: AICaraKerjaItem[];
  caraKerjaTitle: string;
  testimonials: AITestimonial[];
  paketHarga: PaketHarga[];
  footer: TemplateData["footer"];
  uiText?: Record<string, string>;
  imagePositions?: Record<string, { x: number; y: number; scale: number }>;
  isEditMode: boolean;
  onContentUpdate?: (content: Partial<TemplateData>) => void;
  websiteId?: string;
}

function buildPayload(s: EditorState, basePaket: PaketHarga[]): Partial<TemplateData> {
  return {
    // Hanya dikirim bila template memakainya — template lama tidak ikut terpengaruh.
    ...(Object.keys(s.uiText).length > 0 ? { uiText: s.uiText } : {}),
    ...(Object.keys(s.imagePositions).length > 0 ? { imagePositions: s.imagePositions } : {}),
    namaBisnis: s.namaBisnis,
    hero: { headline: s.heroHeadline, subheadline: s.heroSub, ctaText: s.heroCta },
    about: { judul: s.aboutJudul, deskripsi: s.aboutDeskripsi, keunggulan: s.aboutKeunggulan, skills: s.aboutSkills },
    layanan: s.layanan,
    caraKerja: s.caraKerja.slice(0, 3),
    caraKerjaTitle: s.caraKerjaTitle,
    testimonialPlaceholder: s.testimonials,
    footer: {
      tagline: s.footerTagline,
      ctaText: s.footerCta,
      kontakTitle: s.footerKontakTitle,
      sosmedTitle: s.footerSosmedTitle,
    },
    paketHarga: basePaket.map((p, i) => ({
      ...p,
      namaPaket: s.paketNama[i] ?? p.namaPaket,
      harga: s.paketHargaList[i] ?? p.harga,
    })),
  };
}

export function useTemplateEditor(input: HookInput) {
  const {
    namaBisnis, hero, about, layanan, caraKerja, caraKerjaTitle,
    testimonials, paketHarga, footer, uiText, imagePositions, onContentUpdate, websiteId,
  } = input;

  const [s, setS] = useState<EditorState>(() => ({
    namaBisnis,
    heroHeadline: hero.headline,
    heroSub: hero.subheadline,
    heroCta: hero.ctaText,
    aboutJudul: about.judul,
    aboutDeskripsi: about.deskripsi,
    aboutKeunggulan: [...about.keunggulan],
    aboutSkills: [...(about.skills ?? [])],
    layanan: [...layanan],
    caraKerja: [...caraKerja],
    caraKerjaTitle,
    testimonials: [...testimonials],
    paketNama: paketHarga.map((p) => p.namaPaket),
    paketHargaList: paketHarga.map((p) => p.harga),
    footerTagline: footer.tagline,
    footerCta: footer.ctaText,
    footerKontakTitle: footer.kontakTitle || "Kontak",
    footerSosmedTitle: footer.sosmedTitle || "Sosial Media",
    footerDesc: about.deskripsi.length > 120 ? about.deskripsi.substring(0, 120) + "..." : about.deskripsi,
    copyright: `© ${new Date().getFullYear()} ${namaBisnis}.`,
    uiText: { ...(uiText ?? {}) },
    imagePositions: { ...(imagePositions ?? {}) },
  }));

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Re-sync when incoming props change (e.g. parent regenerates content).
  useEffect(() => {
    setS((prev) => ({
      ...prev,
      namaBisnis,
      heroHeadline: hero.headline,
      heroSub: hero.subheadline,
      heroCta: hero.ctaText,
      aboutJudul: about.judul,
      aboutDeskripsi: about.deskripsi,
      aboutKeunggulan: [...about.keunggulan],
      aboutSkills: [...(about.skills ?? [])],
      layanan: [...layanan],
      caraKerja: [...caraKerja],
      caraKerjaTitle,
      testimonials: [...testimonials],
      paketNama: paketHarga.map((p) => p.namaPaket),
      paketHargaList: paketHarga.map((p) => p.harga),
      footerTagline: footer.tagline,
      footerCta: footer.ctaText,
      footerKontakTitle: footer.kontakTitle || "Kontak",
      footerSosmedTitle: footer.sosmedTitle || "Sosial Media",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namaBisnis, hero, about, layanan, caraKerja, caraKerjaTitle, testimonials, paketHarga, footer]);

  const patch = useCallback((partial: Partial<EditorState>) => {
    setS((prev) => ({ ...prev, ...partial }));
    setHasChanges(true);
  }, []);

  // Live preview update (debounced) so the parent stays in sync while editing.
  useEffect(() => {
    if (!hasChanges || !onContentUpdate) return;
    const t = setTimeout(() => onContentUpdate(buildPayload(s, paketHarga)), 120);
    return () => clearTimeout(t);
  }, [s, hasChanges, onContentUpdate, paketHarga]);

  const paketRef = useRef(paketHarga);
  paketRef.current = paketHarga;

  const handleSave = useCallback(async () => {
    const payload = buildPayload(s, paketRef.current);
    setSaving(true);
    try {
      if (onContentUpdate) onContentUpdate(payload);
      if (websiteId) {
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        const { data: existing } = await supabase
          .from("websites")
          .select("generated_content")
          .eq("id", websiteId)
          .single();
        if (existing) {
          const merged = { ...existing.generated_content, ...payload };
          await supabase
            .from("websites")
            .update({ generated_content: merged, nama_usaha: s.namaBisnis })
            .eq("id", websiteId);
        }
      }
      setHasChanges(false);
      setToast("Perubahan berhasil disimpan!");
      setTimeout(() => setToast(""), 3000);
    } catch (e) {
      console.error("Save error:", e);
      setToast("Gagal menyimpan.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSaving(false);
    }
  }, [s, onContentUpdate, websiteId]);

  // Ubah satu label UI statis (key bebas, mis. "produk.badge").
  const patchUi = useCallback((key: string, value: string) => {
    setS((prev) => ({ ...prev, uiText: { ...prev.uiText, [key]: value } }));
    setHasChanges(true);
  }, []);

  // Simpan posisi/zoom satu gambar (id bebas, mis. "hero").
  const setImgPos = useCallback((id: string, pos: { x: number; y: number; scale: number }) => {
    setS((prev) => ({ ...prev, imagePositions: { ...prev.imagePositions, [id]: pos } }));
    setHasChanges(true);
  }, []);

  return { s, patch, patchUi, setImgPos, hasChanges, saving, toast, handleSave };
}
