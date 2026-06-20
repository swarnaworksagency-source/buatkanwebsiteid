import type { TemplateData } from "@/types";

// ── Neo-Brutalist design tokens ──
// "Neo-Brutalism / Radical Creative Agency Grid" — revised PersonalBranding1 spec.
// Hardcoded multi-surface palette: electric blue / charcoal / light gray / acid lime.
export const BRUT = {
    font: "'Montserrat', -apple-system, 'Segoe UI', system-ui, Roboto, 'Helvetica Neue', Arial, sans-serif",

    // Core palette
    blue:     "#0033FF",
    charcoal: "#111111",
    gray:     "#F3F4F6",
    lime:     "#CCFF00",
    black:    "#000000",
    white:    "#FFFFFF",

    // Dark-surface secondary card
    cardDark: "#1a1a1a",

    // Text helpers
    inkLight:    "#111111",            // on light bg
    bodyOnDark:  "rgba(255,255,255,0.72)",
    bodyOnLight: "rgba(17,17,17,0.66)",
    mutedOnDark: "rgba(255,255,255,0.5)",

    // Brutalist structure — slimmer lines
    border:      "2px solid #000000",
    borderThick: "2.5px solid #000000",
    borderLime:  "2px solid #CCFF00",
    shadowHard:  "4px 4px 0 #000000",

    // Subtle textures (creative portfolio flavor) — layered over solid bg colors
    texDotDark:  "radial-gradient(rgba(255,255,255,0.05) 1.4px, transparent 1.4px)",
    texDotLight: "radial-gradient(rgba(17,17,17,0.07) 1.4px, transparent 1.4px)",
    texGrid:     "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
    dotSize:     "22px 22px",
    gridSize:    "44px 44px",

    // Radius — sharp dominant, optional 12px
    r0:  0,
    r12: 12,
    full: 9999,
} as const;

export interface ImagePos { x: number; y: number; scale: number }

export interface SectionProps extends Partial<TemplateData> {
    isEditMode: boolean;
    edit: (path: string, val: string) => void;
    name: string;
    waLink: string;
    accent: string;
    imgPos: (id: string) => ImagePos | undefined;
    setImgPos: (id: string, pos: ImagePos) => void;
}
