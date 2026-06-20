"use client";

import { Star, ArrowUpRight } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { BRUT, type SectionProps } from "../types";
import { EditableImage } from "../EditableImage";

export default function Profile({
    about, fotoBisnis, portofolio, isEditMode, edit, name, imgPos, setImgPos,
}: SectionProps) {
    const deskripsi = about?.deskripsi || "";
    const heading = (about?.judul || "Creativity meets strategy").toUpperCase();
    const skills = about?.keunggulan || [];
    const featureBars = skills.length > 0
        ? skills.slice(0, 2).map(s => s.toUpperCase())
        : ["OVER 10 YEARS OF EXPERIENCE", "TRUSTED BY GLOBAL BRANDS"];

    // Foto About Me = slot khusus fotoBisnis[1] (BEDA dari foto Hero di fotoBisnis[0]).
    // Fallback ke foto proyek, lalu placeholder. JANGAN pakai fotoBisnis[0] (itu foto Hero).
    const portrait = (fotoBisnis && fotoBisnis[1]) || (portofolio && portofolio[0]) || "";

    // Analytics bars — from remaining skills, else defaults.
    const bars = (skills.length > 2 ? skills.slice(2, 4) : ["Sustainable Design", "Brand Strategy"]).map((label, i) => ({
        label, pct: i === 0 ? 85 : 100,
    }));

    return (
        <section id="tentang" style={{ background: BRUT.gray, backgroundImage: BRUT.texDotLight, backgroundSize: BRUT.dotSize, padding: "96px 32px", minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div className="nb-prof" style={{
                maxWidth: 1280, margin: "0 auto", width: "100%",
                display: "grid", gridTemplateColumns: "5fr 7fr", gap: 56, alignItems: "center",
            }}>
                {/* ── 4.1 Left — profile copy ── */}
                <div>
                    <span style={{ display: "inline-block", background: BRUT.lime, color: BRUT.black, border: BRUT.border, padding: "5px 14px", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 22 }}>
                        Who I Am
                    </span>
                    <h2 style={{ fontSize: "clamp(30px, 4.2cqw, 56px)", fontWeight: 900, color: BRUT.inkLight, lineHeight: 0.96, letterSpacing: "-0.035em", margin: "0 0 28px", textTransform: "uppercase" }}>
                        <EditableText
                            value={heading}
                            onChange={(v: string) => edit("about.judul", v)}
                            isEditMode={isEditMode}
                            as="span"
                        />
                    </h2>

                    {deskripsi && (
                        <p style={{ fontSize: 16, color: BRUT.inkLight, lineHeight: 1.75, margin: "0 0 28px", fontWeight: 500, textAlign: "justify" }}>
                            <EditableText
                                value={deskripsi}
                                onChange={(v: string) => edit("about.deskripsi", v)}
                                isEditMode={isEditMode}
                                as="span"
                                multiline
                            />
                        </p>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                        {featureBars.map((f, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: BRUT.white, border: BRUT.border, padding: "14px 18px" }}>
                                <Star size={18} fill={BRUT.lime} style={{ color: BRUT.black, flexShrink: 0 }} />
                                <span style={{ fontSize: 15, fontWeight: 800, color: BRUT.inkLight, textTransform: "uppercase", letterSpacing: "0.01em" }}>{f}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bottom black logo strip */}
                    <div style={{ background: BRUT.black, border: BRUT.border, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={22} fill={i % 2 ? BRUT.lime : BRUT.white} style={{ color: i % 2 ? BRUT.lime : BRUT.white, opacity: 0.9 }} />
                        ))}
                    </div>
                </div>

                {/* ── 4.2 Right — portrait + analytics mesh ── */}
                <div style={{ position: "relative" }}>
                    {/* Neon badge ring accent */}
                    <div style={{ position: "absolute", top: -10, left: -10, width: 110, height: 110, borderRadius: "50%", border: BRUT.borderLime, zIndex: 0 }} />

                    <div style={{ position: "relative", zIndex: 1, border: BRUT.borderThick, boxShadow: BRUT.shadowHard, overflow: "hidden", background: BRUT.charcoal, aspectRatio: "4/3" }}>
                        {portrait
                            ? <EditableImage src={portrait} alt={name} isEditMode={isEditMode} pos={imgPos("profile")} onChange={(np) => setImgPos("profile", np)} controls="tl" />
                            : <div style={{ width: "110%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 64, fontWeight: 900, color: BRUT.lime }}>{name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span></div>}
                    </div>
                    {/* Floating analytics frame */}
                    <div className="nb-analytics" style={{
                        position: "absolute", top: 20, right: -16, zIndex: 2,
                        background: BRUT.white, border: BRUT.border, boxShadow: BRUT.shadowHard,
                        padding: "18px 18px 16px", width: 240, maxWidth: "70%",
                    }}>
                        {bars.map((b, i) => (
                            <div key={i} style={{ marginBottom: i < bars.length - 1 ? 14 : 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: BRUT.inkLight, marginBottom: 6, textTransform: "uppercase" }}>
                                    <span>{b.label}</span><span>{b.pct}%</span>
                                </div>
                                <div style={{ height: 10, background: BRUT.gray, border: "2px solid #000" }}>
                                    <div style={{ width: `${b.pct}%`, height: "100%", background: BRUT.lime }} />
                                </div>
                            </div>
                        ))}
                        <a href="#kontak" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, border: BRUT.border, color: BRUT.black, padding: "8px 14px", fontSize: 11, fontWeight: 900, textDecoration: "none", textTransform: "uppercase" }}>
                            About Me <ArrowUpRight size={13} />
                        </a>
                    </div>
                </div>
            </div>

            <style>{`
                @container (max-width: 900px) {
                    .nb-prof { grid-template-columns: 1fr !important; gap: 64px !important; }
                    .nb-analytics { right: 12px !important; }
                }
            `}</style>
        </section>
    );
}
