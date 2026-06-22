"use client";

import type { CSSProperties } from "react";
import type { TemplateData } from "@/types";
import { readableOn, withAlpha } from "@/lib/color";
import { NEON } from "./types";
import Hero from "./sections/Hero";
import HowItWorks from "./sections/HowItWorks";
import Features from "./sections/Features";
import Pengalaman from "./sections/Pengalaman";
import Portofolio from "./sections/Portofolio";
import Testimoni from "./sections/Testimoni";
import Kontak from "./sections/Kontak";

interface Props extends Partial<TemplateData> {
    forceMobile?: boolean;
    isEditable?: boolean;
    isEditMode?: boolean;
    onUpdate?: (path: string, value: string) => void;
    onContentUpdate?: (content: Partial<TemplateData>) => void;
    websiteId?: string;
}

export default function NeonGrid({
    hero,
    about,
    layanan,
    caraKerja,
    caraKerjaTitle,
    testimonialPlaceholder,
    paketHarga,
    footer,
    namaBisnis,
    lokasi,
    kontak,
    sosmed,
    warna,
    logo,
    fotoBisnis,
    portofolio,
    keahlian,
    pengalaman,
    imagePositions,
    forceMobile,
    isEditMode = false,
    onUpdate,
    onContentUpdate,
    websiteId: _websiteId,
}: Props) {
    const name = namaBisnis || hero?.headline || "Nama Anda";

    // Inline edit: terapkan path ke field top-level lalu emit lewat onContentUpdate
    // (di-merge ke templateData di /buat). Sama seperti template 1.
    const edit = (path: string, val: string) => {
        onUpdate?.(path, val);
        if (!onContentUpdate) return;
        const [top, k1, k2] = path.split(".");
        switch (top) {
            case "about":
                onContentUpdate({ about: { ...(about as any), [k1]: val } } as Partial<TemplateData>);
                break;
            case "footer":
                onContentUpdate({ footer: { ...(footer as any), [k1]: val } } as Partial<TemplateData>);
                break;
            case "hero":
                onContentUpdate({ hero: { ...(hero as any), [k1]: val } } as Partial<TemplateData>);
                break;
            case "layanan": {
                const idx = Number(k1);
                const arr = (layanan || []).map((it, i) => i === idx ? { ...it, [k2]: val } : it);
                onContentUpdate({ layanan: arr });
                break;
            }
        }
    };

    // Posisi/zoom gambar per-id (geser di edit mode → simpan ke imagePositions).
    const imgPos = (id: string) => imagePositions?.[id];
    const setImgPos = (id: string, pos: { x: number; y: number; scale: number }) => {
        onContentUpdate?.({ imagePositions: { ...(imagePositions || {}), [id]: pos } });
    };

    const waLink = kontak?.wa
        ? `https://wa.me/${kontak.wa.replace(/\D/g, "")}?text=Halo%20${encodeURIComponent(name)}%2C%20saya%20tertarik%20dengan%20layanan%20Anda`
        : "#";

    const sectionProps = {
        hero, about, layanan, caraKerja, caraKerjaTitle, testimonialPlaceholder, paketHarga, footer,
        namaBisnis, lokasi, kontak, sosmed, warna, logo, fotoBisnis, portofolio, keahlian, pengalaman,
        name, waLink, isEditMode, edit, imgPos, setImgPos,
    };

    // Warna aksen dari "Preferensi Warna". Di-set sebagai CSS var di root → semua NEON.lime,
    // NEON.onLime, glow, dll otomatis ikut warna user. Fallback ke lime default.
    const accent = (warna?.primary || "").trim() || "#a3e635";
    const accentVars = {
        "--ng-accent": accent,
        "--ng-accent-dim": withAlpha(accent, 0.14),
        "--ng-accent-soft": withAlpha(accent, 0.30),
        "--ng-on-accent": readableOn(accent, "#0b1116"),
    } as CSSProperties;

    return (
        <div
            style={{
                ...accentVars,
                fontFamily: NEON.font,
                background: NEON.bg,
                color: NEON.ink,
                minHeight: "100vh",
                width: forceMobile ? "390px" : "100%",
                overflowX: "hidden",
            }}
        >
            <Hero {...sectionProps} />
            <HowItWorks {...sectionProps} />
            <Features {...sectionProps} />
            <Pengalaman {...sectionProps} />
            <Portofolio {...sectionProps} />
            <Testimoni {...sectionProps} />
            <Kontak {...sectionProps} />
        </div>
    );
}
