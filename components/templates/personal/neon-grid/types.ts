import type { TemplateData } from "@/types";

// ── Neon Grid design tokens ──
// "Clean Tech SaaS / Sports Analytics Minimalist" — PersonalBranding3 spec.
// Fixed palette: deep navy black + high-vibrancy neon lime accent.
export const NEON = {
    font: "'Montserrat', -apple-system, 'Segoe UI', system-ui, Roboto, 'Helvetica Neue', Arial, sans-serif",

    // Surfaces (deep navy / midnight charcoal)
    bg:           "#0b1116",
    bgElev:       "#111a22",
    card:         "#1e293b",
    cardSoft:     "#243244",
    hairline:     "rgba(255,255,255,0.08)",
    hairlineSoft: "rgba(255,255,255,0.05)",

    // Text
    ink:   "#ffffff",
    body:  "#94a3b8",
    muted: "#64748b",

    // Accent (neon lime)
    lime:    "#a3e635",
    limeDim: "rgba(163,230,53,0.14)",
    limeSoft:"rgba(163,230,53,0.30)",
    onLime:  "#0b1116",

    // Radius — large outer panels, medium inner cells
    huge: 40,
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
    imgPos: (id: string) => ImagePos | undefined;
    setImgPos: (id: string, pos: ImagePos) => void;
}
