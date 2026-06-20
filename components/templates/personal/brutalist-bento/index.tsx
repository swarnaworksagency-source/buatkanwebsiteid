"use client";

import type { TemplateData } from "@/types";
import { STUDIO } from "./types";
import Hero from "./sections/Hero";
import Editorial from "./sections/Editorial";
import BentoServices from "./sections/BentoServices";
import Pengalaman from "./sections/Pengalaman";
import Portofolio from "./sections/Portofolio";
import Penutup from "./sections/Penutup";

interface Props extends Partial<TemplateData> {
    forceMobile?: boolean;
    isEditable?: boolean;
    isEditMode?: boolean;
    onUpdate?: (path: string, value: string) => void;
    onContentUpdate?: (content: Partial<TemplateData>) => void;
    websiteId?: string;
}

export default function BrutalistBento({
    hero,
    about,
    layanan,
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

    const waBase = kontak?.wa ? `https://wa.me/${kontak.wa.replace(/\D/g, "")}` : "#";
    const waLink = kontak?.wa
        ? `${waBase}?text=Halo%20${encodeURIComponent(name)}%2C%20saya%20tertarik%20dengan%20layanan%20Anda`
        : "#";

    const sectionProps = {
        hero, about, layanan, testimonialPlaceholder, paketHarga, footer,
        namaBisnis, lokasi, kontak, sosmed, warna, logo, fotoBisnis, portofolio,
        name, waLink, waBase, isEditMode, edit,
    };

    return (
        <div
            style={{
                fontFamily: STUDIO.font,
                background: STUDIO.bg,
                color: STUDIO.ink,
                minHeight: "100vh",
                width: forceMobile ? "390px" : "100%",
                overflowX: "hidden",
            }}
        >
            <Hero {...sectionProps} />
            <Editorial {...sectionProps} />
            <BentoServices {...sectionProps} />
            <Pengalaman {...sectionProps} />
            <Portofolio {...sectionProps} />
            <Penutup {...sectionProps} />
        </div>
    );
}
