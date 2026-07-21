"use client";

import { useRef, useState } from "react";
import { Move, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
export interface ImagePos { x: number; y: number; scale: number }

interface Props {
    src: string;
    alt: string;
    isEditMode?: boolean;
    pos?: ImagePos;
    onChange?: (p: ImagePos) => void;
    /** style tambahan untuk <img> (objectFit, filter, height, dll). objectPosition/transform dikelola komponen. */
    imgStyle?: React.CSSProperties;
    /** "box" = crop cover, geser = pindah frame (object-position, tanpa gap). "free" = ikut ukuran gambar (Hero), geser = translate. */
    mode?: "box" | "free";
    /** posisi tombol kontrol */
    controls?: "tr" | "tl";
    /** true = gambar above-the-fold (hero/LCP): eager + fetchpriority high. Default lazy. */
    priority?: boolean;
    /** class tambahan untuk <img> (mis. filter grayscale + hover) */
    imgClassName?: string;
}

const ctrlBtn: React.CSSProperties = {
    width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer",
};

export function EditableImage({ src, alt, isEditMode, pos, onChange, imgStyle, mode = "box", controls = "tr", priority = false, imgClassName }: Props) {
    const [dragging, setDragging] = useState(false);
    const start = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
    const wrapRef = useRef<HTMLDivElement>(null);

    // Default berbeda per mode: box pakai object-position (50,50 = tengah), free pakai translate (0,0).
    const def: ImagePos = mode === "free" ? { x: 0, y: 0, scale: 1 } : { x: 50, y: 50, scale: 1 };
    const p = pos || def;

    const imgBase: React.CSSProperties = mode === "free"
        ? { display: "block", ...imgStyle, transform: `translate(${p.x}%, ${p.y}%) scale(${p.scale})`, transformOrigin: "center bottom" }
        : { width: "100%", height: "100%", objectFit: "cover", ...imgStyle, objectPosition: `${p.x}% ${p.y}%`, transform: `scale(${p.scale})`, transformOrigin: "center" };

    if (!isEditMode || !onChange) {
        return (
            <img
                src={src}
                alt={alt}
                className={imgClassName}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
                style={imgBase}
            />
        );
    }

    const clamp01 = (v: number) => Math.max(0, Math.min(100, v));
    const freeLimit = Math.max(50, p.scale * 50);
    const clampFree = (v: number) => Math.max(-freeLimit, Math.min(freeLimit, v));

    const onDown = (cx: number, cy: number) => { setDragging(true); start.current = { mx: cx, my: cy, px: p.x, py: p.y }; };
    const onMove = (cx: number, cy: number) => {
        if (!dragging || !start.current || !wrapRef.current) return;
        const r = wrapRef.current.getBoundingClientRect();
        const dx = ((cx - start.current.mx) / r.width) * 100;
        const dy = ((cy - start.current.my) / r.height) * 100;
        if (mode === "free") {
            // gambar ikut arah pointer
            onChange({ ...p, x: clampFree(start.current.px + dx), y: clampFree(start.current.py + dy) });
        } else {
            // geser frame: object-position bergerak berlawanan arah pointer (lihat bagian foto lain)
            onChange({ ...p, x: clamp01(start.current.px - dx), y: clamp01(start.current.py - dy) });
        }
    };
    const end = () => setDragging(false);
    const zoom = (d: number) => onChange({ ...p, scale: Math.max(1, Math.min(4, +(p.scale + d).toFixed(2))) });
    const reset = () => onChange(def);

    const wrapStyle: React.CSSProperties = mode === "free"
        ? { position: "relative", display: "inline-flex", cursor: dragging ? "grabbing" : "grab", touchAction: "none" }
        : { position: "relative", width: "100%", height: "100%", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", touchAction: "none" };

    return (
        <div
            ref={wrapRef}
            style={wrapStyle}
            onMouseDown={(e) => { e.preventDefault(); onDown(e.clientX, e.clientY); }}
            onMouseMove={(e) => onMove(e.clientX, e.clientY)}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={(e) => { const t = e.touches[0]; onDown(t.clientX, t.clientY); }}
            onTouchMove={(e) => { const t = e.touches[0]; onMove(t.clientX, t.clientY); }}
            onTouchEnd={end}
        >
            <img src={src} alt={alt} className={imgClassName} draggable={false} style={{ ...imgBase, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 6, [controls === "tl" ? "left" : "right"]: 6, display: "flex", gap: 4, zIndex: 6 }}>
                <button type="button" title="Perbesar" onClick={(e) => { e.stopPropagation(); zoom(0.2); }} style={ctrlBtn}><ZoomIn size={14} /></button>
                <button type="button" title="Perkecil" onClick={(e) => { e.stopPropagation(); zoom(-0.2); }} style={ctrlBtn}><ZoomOut size={14} /></button>
                <button type="button" title="Reset" onClick={(e) => { e.stopPropagation(); reset(); }} style={ctrlBtn}><RotateCcw size={14} /></button>
            </div>
            <div style={{ position: "absolute", bottom: 6, left: 6, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.65)", color: "#fff", padding: "3px 8px", fontSize: 10, fontWeight: 700, borderRadius: 4, pointerEvents: "none", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Move size={11} /> Geser
            </div>
        </div>
    );
}
