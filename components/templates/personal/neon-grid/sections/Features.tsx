"use client";

import { Check } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { EditableImage } from "../../neo-brutalist/EditableImage";
import { NEON, type SectionProps } from "../types";

export default function Features({
    layanan, about, fotoBisnis, portofolio, isEditMode, edit, name, imgPos, setImgPos, keahlian,
}: SectionProps) {
    const skills = (keahlian || []).filter((k) => k.nama?.trim());
    const features = (layanan && layanan.length > 0)
        ? layanan.slice(0, 5)
        : (about?.keunggulan || []).slice(0, 5).map(k => ({ nama: k, deskripsi: "", harga: "" }));

    if (features.length === 0) return null;

    const img1 = (fotoBisnis && fotoBisnis[1]) || (portofolio && portofolio[0]) || "";
    const img2 = (fotoBisnis && fotoBisnis[2]) || (portofolio && portofolio[1]) || "";
    const img3 = (fotoBisnis && fotoBisnis[3]) || (portofolio && portofolio[2]) || (fotoBisnis && fotoBisnis[0]) || "";

    return (
        <section id="fitur" className="ng-feat-sec" style={{ backgroundColor: NEON.bg, backgroundImage: "radial-gradient(ellipse 50% 60% at 80% 40%, color-mix(in srgb, var(--ng-accent, #a3e635) 4%, transparent) 0%, transparent 65%)", padding: "60px 36px 96px", minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div className="ng-feat" style={{
                maxWidth: 1280, margin: "0 auto", width: "100%",
                display: "grid", gridTemplateColumns: "5fr 7fr", gap: 40, alignItems: "center",
            }}>
                {/* Left — feature detail list */}
                <div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {features.map((f, i) => (
                            <div key={i} style={{
                                display: "flex", gap: 16, padding: "22px 0",
                                borderBottom: i < features.length - 1 ? `1px solid ${NEON.hairline}` : "none",
                            }}>
                                <span style={{
                                    width: 30, height: 30, borderRadius: NEON.sm, flexShrink: 0, marginTop: 2,
                                    background: NEON.limeDim, color: NEON.lime,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Check size={16} />
                                </span>
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                                        <EditableText
                                            value={f.nama}
                                            onChange={(v: string) => edit(`layanan.${i}.nama`, v)}
                                            isEditMode={isEditMode}
                                            as="span"
                                        />
                                    </h3>
                                    {f.deskripsi && (
                                        <p style={{ fontSize: 14, lineHeight: 1.6, color: NEON.body, margin: 0 }}>
                                            <EditableText
                                                value={f.deskripsi}
                                                onChange={(v: string) => edit(`layanan.${i}.deskripsi`, v)}
                                                isEditMode={isEditMode}
                                                as="span"
                                                multiline
                                            />
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — 3-photo grid */}
                <div>
                    <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.035em", color: "#fff", margin: "0 0 24px", lineHeight: 1.1, textAlign: "center" }}>
                        Apa yang Anda dapat bersama{" "}
                        <span style={{ color: NEON.lime }}>{name.split(" ")[0]}</span>
                    </h2>
                    {skills.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", margin: "0 0 24px" }}>
                            {skills.map((k, i) => (
                                <span key={i} style={{ fontSize: 12.5, fontWeight: 700, color: NEON.ink, background: NEON.card, border: `1px solid ${NEON.hairline}`, borderRadius: NEON.full, padding: "6px 14px" }}>{k.nama}</span>
                            ))}
                        </div>
                    )}
                    <div className="ng-feat-imgs" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                        <div style={{ borderRadius: NEON.lg, overflow: "hidden", border: `1px solid ${NEON.hairline}`, aspectRatio: "3 / 4", background: NEON.card }}>
                            {img1 ? <EditableImage src={img1} alt={name} mode="box" isEditMode={isEditMode} pos={imgPos("feat-1")} onChange={(np) => setImgPos("feat-1", np)} /> : <Placeholder />}
                        </div>
                        <div style={{ borderRadius: NEON.lg, overflow: "hidden", border: `1px solid ${NEON.hairline}`, aspectRatio: "3 / 4", background: NEON.card }}>
                            {img2 ? <EditableImage src={img2} alt={name} mode="box" isEditMode={isEditMode} pos={imgPos("feat-2")} onChange={(np) => setImgPos("feat-2", np)} /> : <Placeholder />}
                        </div>
                        <div style={{ borderRadius: NEON.lg, overflow: "hidden", border: `1px solid ${NEON.hairline}`, aspectRatio: "3 / 4", background: NEON.card }}>
                            {img3 ? <EditableImage src={img3} alt={name} mode="box" isEditMode={isEditMode} pos={imgPos("feat-3")} onChange={(np) => setImgPos("feat-3", np)} /> : <Placeholder />}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .ng-feat { grid-template-columns: 1fr !important; gap: 40px !important; }
                }
                @media (max-width: 768px) {
                    .ng-feat-sec { min-height: auto !important; align-items: flex-start !important; padding: 56px 18px !important; }
                }
            `}</style>
        </section>
    );
}

function Placeholder() {
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: NEON.card }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: NEON.limeDim, display: "inline-block" }} />
        </div>
    );
}
