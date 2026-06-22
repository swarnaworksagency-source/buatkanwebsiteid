"use client";

import { ArrowUpRight } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { EditableImage } from "../../neo-brutalist/EditableImage";
import { STUDIO, type SectionProps } from "../types";

export default function Editorial({
    about, fotoBisnis, portofolio, isEditMode, edit, name, waLink, imgPos, setImgPos, keahlian, accent2, onAccent,
}: SectionProps) {
    const skills = (keahlian || []).filter((k) => k.nama?.trim());
    const title = about?.judul || "Shaping experiences that make life simpler";
    const copy = about?.deskripsi
        || `${name.split(" ")[0]} turns ideas into clean, functional design — from first sketch to final pixel.`;

    const imgLeft1 = (fotoBisnis && fotoBisnis[3]) || (fotoBisnis && fotoBisnis[0]) || "";
    const imgLeft2 = (fotoBisnis && fotoBisnis[1]) || (portofolio && portofolio[0]) || "";
    const imgRight = (fotoBisnis && fotoBisnis[2]) || (portofolio && portofolio[1]) || "";

    return (
        <section id="tentang" className="bb-edit" style={{ background: STUDIO.bg, padding: "40px 36px 32px", height: "100vh", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", flex: 1, gap: 28 }}>
                {/* ── Top: text header ── */}
                <div className="bb-edit-head" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start", flexShrink: 0 }}>
                    <div>
                        <h2 style={{ fontSize: "clamp(26px, 3.6vw, 48px)", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.045em", color: STUDIO.ink, margin: 0 }}>
                            <EditableText
                                value={title}
                                onChange={(v: string) => edit("about.judul", v)}
                                isEditMode={isEditMode}
                                as="span"
                            />
                        </h2>
                    </div>
                    <div>
                        <p style={{ fontSize: 15, lineHeight: 1.7, color: STUDIO.body, margin: "0 0 20px" }}>
                            {copy.length > 200 ? copy.slice(0, 200) + "…" : copy}
                        </p>
                        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                            display: "inline-flex", alignItems: "center", gap: 10,
                            background: accent2, color: onAccent || "#0b0b0c",
                            padding: "8px 8px 8px 20px", borderRadius: STUDIO.full,
                            fontSize: 14, fontWeight: 800, textDecoration: "none",
                        }}>
                            Start a Project
                            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#0b0b0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ArrowUpRight size={15} style={{ color: "#fff" }} />
                            </span>
                        </a>
                        {skills.length > 0 && (
                            <div style={{ marginTop: 22 }}>
                                <p style={{ fontSize: 12, fontWeight: 800, color: STUDIO.muted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Keahlian</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {skills.map((k, i) => (
                                        <span key={i} style={{ fontSize: 12.5, fontWeight: 700, color: STUDIO.ink, background: STUDIO.bgElev, border: `1px solid ${STUDIO.hairline}`, borderRadius: STUDIO.full, padding: "6px 14px" }}>{k.nama}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Bottom: 3 cards ── */}
                {(imgLeft1 || imgLeft2 || imgRight) && (
                    <div className="bb-edit-imgs" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, height: "70vh", flexShrink: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
                            {imgLeft1 && (
                                <div className="bb-edit-img" style={{ borderRadius: STUDIO.xl, overflow: "hidden", border: `1px solid ${STUDIO.hairline}`, flex: 1, background: STUDIO.card, minHeight: 0 }}>
                                    <EditableImage src={imgLeft1} alt={name} mode="box" isEditMode={isEditMode} pos={imgPos("edit-1")} onChange={(np) => setImgPos("edit-1", np)} imgStyle={{ filter: "none" }} />
                                </div>
                            )}
                            {imgLeft2 && (
                                <div className="bb-edit-img" style={{ borderRadius: STUDIO.xl, overflow: "hidden", border: `1px solid ${STUDIO.hairline}`, flex: 1, background: STUDIO.card, minHeight: 0 }}>
                                    <EditableImage src={imgLeft2} alt={name} mode="box" isEditMode={isEditMode} pos={imgPos("edit-2")} onChange={(np) => setImgPos("edit-2", np)} imgStyle={{ filter: "none" }} />
                                </div>
                            )}
                        </div>
                        {imgRight && (
                            <div className="bb-edit-img" style={{ borderRadius: STUDIO.xl, overflow: "hidden", border: `1px solid ${STUDIO.hairline}`, minHeight: 0, background: STUDIO.card }}>
                                <EditableImage src={imgRight} alt={name} mode="box" isEditMode={isEditMode} pos={imgPos("edit-3")} onChange={(np) => setImgPos("edit-3", np)} imgStyle={{ filter: "none" }} />
                            </div>
                        )}
                    </div>
                )}
            </div>
            <style>{`
                @media (max-width: 860px) {
                    .bb-edit-head { grid-template-columns: 1fr !important; gap: 16px !important; }
                    .bb-edit-imgs { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 768px) {
                    /* Lepas tinggi tetap 100vh/70vh → konten mengalir, gambar pakai tinggi tetap. */
                    .bb-edit { height: auto !important; overflow: visible !important; padding: 32px 18px !important; }
                    .bb-edit-imgs { height: auto !important; }
                    .bb-edit-img { flex: none !important; height: 240px !important; min-height: 240px !important; }
                }
            `}</style>
        </section>
    );
}
