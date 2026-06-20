"use client";

import type { TemplateData } from "@/types";
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
    forceMobile,
    isEditMode = false,
    onUpdate,
    onContentUpdate: _onContentUpdate,
    websiteId: _websiteId,
}: Props) {
    const name = namaBisnis || hero?.headline || "Nama Anda";

    const edit = (path: string, val: string) => onUpdate?.(path, val);

    const waLink = kontak?.wa
        ? `https://wa.me/${kontak.wa.replace(/\D/g, "")}?text=Halo%20${encodeURIComponent(name)}%2C%20saya%20tertarik%20dengan%20layanan%20Anda`
        : "#";

    const sectionProps = {
        hero, about, layanan, caraKerja, caraKerjaTitle, testimonialPlaceholder, paketHarga, footer,
        namaBisnis, lokasi, kontak, sosmed, warna, logo, fotoBisnis, portofolio,
        name, waLink, isEditMode, edit,
    };

    return (
        <div
            style={{
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
