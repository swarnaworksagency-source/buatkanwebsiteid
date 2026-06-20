"use client";

import type { TemplateData } from "@/types";
import { BRUT } from "./types";
import Hero from "./sections/Hero";
import Ticker from "./sections/Ticker";
import ServicesBento from "./sections/ServicesBento";
import Profile from "./sections/Profile";
import Portofolio from "./sections/Portofolio";
import Testimoni from "./sections/Testimoni";
import Kontak from "./sections/Kontak";
import SlatFooter from "./sections/SlatFooter";

interface Props extends Partial<TemplateData> {
    forceMobile?: boolean;
    isEditable?: boolean;
    isEditMode?: boolean;
    onUpdate?: (path: string, value: string) => void;
    onContentUpdate?: (content: Partial<TemplateData>) => void;
    websiteId?: string;
}

export default function NeoBrutalist({
    hero,
    about,
    layanan,
    testimonialPlaceholder,
    paketHarga,
    keahlian,
    footer,
    namaBisnis,
    namaPanggilan,
    lokasi,
    kontak,
    sosmed,
    warna,
    logo,
    fotoBisnis,
    portofolio,
    imagePositions,
    forceMobile,
    isEditMode = false,
    onUpdate,
    onContentUpdate,
    websiteId: _websiteId,
}: Props) {
    const name = namaBisnis || hero?.headline || "Nama Anda";

    // Inline edit: terapkan path (mis. "about.deskripsi", "layanan.0.nama", "namaPanggilan")
    // ke field top-level lalu emit lewat onContentUpdate (yang di-merge ke templateData di /buat).
    const edit = (path: string, val: string) => {
        onUpdate?.(path, val); // kompat lama
        if (!onContentUpdate) return;
        const [top, k1, k2] = path.split(".");
        switch (top) {
            case "namaPanggilan":
                onContentUpdate({ namaPanggilan: val });
                break;
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

    const waLink = kontak?.wa
        ? `https://wa.me/${kontak.wa.replace(/\D/g, "")}?text=Halo%20${encodeURIComponent(name)}%2C%20saya%20tertarik%20dengan%20layanan%20Anda`
        : "#";

    // Warna brand dari "Preferensi Warna" form; fallback ke biru default neo-brutalist.
    const accent = warna?.primary || BRUT.blue;

    // Posisi/zoom gambar per-id. Geser di edit mode → simpan ke imagePositions via onContentUpdate.
    const imgPos = (id: string) => imagePositions?.[id];
    const setImgPos = (id: string, pos: { x: number; y: number; scale: number }) => {
        onContentUpdate?.({ imagePositions: { ...(imagePositions || {}), [id]: pos } });
    };

    const sectionProps = {
        hero, about, layanan, testimonialPlaceholder, paketHarga, keahlian, footer,
        namaBisnis, namaPanggilan, lokasi, kontak, sosmed, warna, logo, fotoBisnis, portofolio,
        name, waLink, isEditMode, edit, accent, imgPos, setImgPos,
    };

    return (
        <div
            style={{
                fontFamily: BRUT.font,
                background: BRUT.charcoal,
                color: BRUT.white,
                minHeight: "100vh",
                width: forceMobile ? "390px" : "100%",
                overflowX: "hidden",
                // Container context: layout & font (cqw) ikut lebar root, bukan viewport.
                // Wajib agar preview mobile (390px di viewport desktop) tetap responsif.
                containerType: "inline-size",
            }}
        >
            <Hero {...sectionProps} />
            <Ticker {...sectionProps} />
            <ServicesBento {...sectionProps} />
            <Profile {...sectionProps} />
            <Portofolio {...sectionProps} />
            <Testimoni {...sectionProps} />
            <Kontak {...sectionProps} />
            <SlatFooter {...sectionProps} />
        </div>
    );
}
