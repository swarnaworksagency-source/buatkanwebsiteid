"use client";

import type { TemplateData } from "@/types";
import { readableOn } from "@/lib/color";
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

    const waBase = kontak?.wa ? `https://wa.me/${kontak.wa.replace(/\D/g, "")}` : "#";
    const waLink = kontak?.wa
        ? `${waBase}?text=Halo%20${encodeURIComponent(name)}%2C%20saya%20tertarik%20dengan%20layanan%20Anda`
        : "#";

    // Warna tema utama dari form ("Preferensi Warna"). Kalau user BELUM pilih warna,
    // pakai palet oranye asli bento (crimson/amber/gradient) — dipakai juga di galeri/preview.
    const customAccent = (warna?.primary || "").trim();
    const accent = customAccent || STUDIO.crimson;   // dot / ikon
    const accentSoft = customAccent || STUDIO.amber;  // label eyebrow
    const accent2 = customAccent || STUDIO.yellow;    // highlight (badge/tombol/aktif)
    // Teks/ikon di atas bidang aksen. Kosong saat default → tiap tempat pakai default aslinya
    // (#0b0b0c di atas yellow, #fff di atas crimson/gradient). Saat custom → auto kontras.
    const onAccent = customAccent ? readableOn(customAccent) : "";
    const accentGradient = customAccent
        ? `linear-gradient(120deg, ${customAccent} 0%, color-mix(in srgb, ${customAccent}, #ffffff 18%) 100%)`
        : STUDIO.gradient;

    const sectionProps = {
        hero, about, layanan, testimonialPlaceholder, paketHarga, footer,
        namaBisnis, lokasi, kontak, sosmed, warna, logo, fotoBisnis, portofolio, keahlian, pengalaman,
        name, waLink, waBase, isEditMode, edit, imgPos, setImgPos,
        accent, accentSoft, accent2, accentGradient, onAccent,
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
