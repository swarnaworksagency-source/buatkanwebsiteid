import type { TemplateData } from "@/types";

// ── Brutalist Bento design tokens ──
// "Brutalism Premium Minimalist Meets Bento Grid" — PersonalBranding2 spec.
// Fixed palette per blueprint: crimson→amber gradient + electric yellow utility.
export const STUDIO = {
    font: "'Montserrat', -apple-system, 'Segoe UI', system-ui, Roboto, 'Helvetica Neue', Arial, sans-serif",

    // Surfaces (deep matte black #0B0B0C)
    bg:           "#0b0b0c",
    bgElev:       "#141416",
    card:         "#19191c",
    cardSoft:     "#212125",
    hairline:     "rgba(255,255,255,0.10)",
    hairlineSoft: "rgba(255,255,255,0.06)",

    // Text (off-white / crisp white)
    ink:   "#f6f5f3",
    body:  "#b4b3b0",
    muted: "#7a7a7c",

    // Accent palette (hardcoded per spec)
    crimson: "#FF3B30",
    amber:   "#FF9500",
    yellow:  "#FFCC00",
    gradient: "linear-gradient(120deg, #FF3B30 0%, #FF6A1F 50%, #FF9500 100%)",

    // Radius — extreme curves
    huge: 44,
    xl:   32,
    lg:   24,
    md:   16,
    sm:   12,
    full: 9999,
} as const;

export interface ImagePos { x: number; y: number; scale: number }

export interface SectionProps extends Partial<TemplateData> {
    isEditMode: boolean;
    edit: (path: string, val: string) => void;
    name: string;
    waLink: string;
    waBase: string;
    imgPos: (id: string) => ImagePos | undefined;
    setImgPos: (id: string, pos: ImagePos) => void;
    // Warna tema utama dari form ("Preferensi Warna").
    // accent = solid (dot/ikon), accentSoft = eyebrow label, accent2 = highlight (eks-yellow),
    // accentGradient = gradient, onAccent = warna teks/ikon di ATAS bidang aksen (kosong = pakai default).
    // Saat user belum pilih warna, semua jatuh ke palet oranye asli (crimson/amber/yellow/gradient).
    accent: string;
    accentSoft: string;
    accent2: string;
    accentGradient: string;
    onAccent: string;
}
