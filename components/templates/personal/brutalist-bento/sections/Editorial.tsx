"use client";

import { ArrowUpRight } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { STUDIO, type SectionProps } from "../types";

export default function Editorial({
    about, fotoBisnis, portofolio, isEditMode, edit, name, waLink,
}: SectionProps) {
    const title = about?.judul || "Shaping experiences that make life simpler";
    const copy = about?.deskripsi
        || `${name.split(" ")[0]} turns ideas into clean, functional design — from first sketch to final pixel.`;

    const imgLeft1 = (fotoBisnis && fotoBisnis[3]) || (fotoBisnis && fotoBisnis[0]) || "";
    const imgLeft2 = (fotoBisnis && fotoBisnis[1]) || (portofolio && portofolio[0]) || "";
    const imgRight = (fotoBisnis && fotoBisnis[2]) || (portofolio && portofolio[1]) || "";

    return (
        <section id="tentang" style={{ background: STUDIO.bg, padding: "40px 36px 32px", height: "100vh", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
                            background: STUDIO.yellow, color: "#0b0b0c",
                            padding: "8px 8px 8px 20px", borderRadius: STUDIO.full,
                            fontSize: 14, fontWeight: 800, textDecoration: "none",
                        }}>
                            Start a Project
                            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#0b0b0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ArrowUpRight size={15} style={{ color: "#fff" }} />
                            </span>
                        </a>
                    </div>
                </div>

                {/* ── Bottom: 3 cards ── */}
                {(imgLeft1 || imgLeft2 || imgRight) && (
                    <div className="bb-edit-imgs" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, height: "70vh", flexShrink: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
                            {imgLeft1 && (
                                <div style={{ borderRadius: STUDIO.xl, overflow: "hidden", border: `1px solid ${STUDIO.hairline}`, flex: 1, background: STUDIO.card, minHeight: 0 }}>
                                    <img src={imgLeft1} alt={name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "none" }} />
                                </div>
                            )}
                            {imgLeft2 && (
                                <div style={{ borderRadius: STUDIO.xl, overflow: "hidden", border: `1px solid ${STUDIO.hairline}`, flex: 1, background: STUDIO.card, minHeight: 0 }}>
                                    <img src={imgLeft2} alt={name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "none" }} />
                                </div>
                            )}
                        </div>
                        {imgRight && (
                            <div style={{ borderRadius: STUDIO.xl, overflow: "hidden", border: `1px solid ${STUDIO.hairline}`, minHeight: 0, background: STUDIO.card }}>
                                <img src={imgRight} alt={name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "none" }} />
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
            `}</style>
        </section>
    );
}
