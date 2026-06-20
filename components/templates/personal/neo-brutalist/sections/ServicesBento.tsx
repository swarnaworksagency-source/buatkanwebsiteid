"use client";

import { ArrowUpRight } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { BRUT, type SectionProps, type ImagePos } from "../types";
import { EditableImage } from "../EditableImage";

export default function ServicesBento({
    layanan, about, fotoBisnis, portofolio, isEditMode, edit, waLink, accent, imgPos, setImgPos,
}: SectionProps) {
    const svc = layanan || [];
    if (svc.length === 0) return null;

    const title = (about?.judul || "Designing for seamless and enjoyable interactions").toUpperCase();
    const img1 = (portofolio && portofolio[0]) || (fotoBisnis && fotoBisnis[1]) || "";
    const imgC = (portofolio && portofolio[1]) || (fotoBisnis && fotoBisnis[2]) || (fotoBisnis && fotoBisnis[0]) || "";
    const img3 = (portofolio && portofolio[2]) || (fotoBisnis && fotoBisnis[3]) || "";

    const card1 = svc[0];
    const cardC = svc[1] || svc[0];
    const card3 = svc[2] || svc[0];

    return (
        <section id="layanan" style={{ background: BRUT.charcoal, backgroundImage: BRUT.texDotDark, backgroundSize: BRUT.dotSize, padding: "96px 32px", minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
                {/* ── 3.1 Section brief header ── */}
                <div className="nb-svc-head" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 28, marginBottom: 48, flexWrap: "wrap" }}>
                    <div style={{ maxWidth: 680 }}>
                        <span style={{ display: "inline-block", background: BRUT.lime, color: BRUT.black, border: BRUT.border, padding: "5px 14px", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 20 }}>
                            What We Do
                        </span>
                        <h2 style={{ fontSize: "clamp(28px, 4cqw, 52px)", fontWeight: 900, color: BRUT.white, lineHeight: 0.98, letterSpacing: "-0.03em", margin: 0, textTransform: "uppercase" }}>
                            <EditableText
                                value={title}
                                onChange={(v: string) => edit("about.judul", v)}
                                isEditMode={isEditMode}
                                as="span"
                            />
                        </h2>
                    </div>
                    <a href="#proyek" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: BRUT.borderLime, color: BRUT.lime, padding: "11px 20px", fontSize: 13, fontWeight: 800, textDecoration: "none", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        All Services <ArrowUpRight size={15} />
                    </a>
                </div>

                {/* ── 3.2 Uneven-height bento grid ── */}
                <div className="nb-bento" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "start" }}>
                    {/* Card 1 — standard */}
                    <BentoStd svc={card1} img={img1} idx={0} isEditMode={isEditMode} edit={edit} imgPos={imgPos} setImgPos={setImgPos} />

                    {/* Card 2 — center, blue, dropped + longer */}
                    <div className="nb-bento-center" style={{ marginTop: 56, background: accent, border: BRUT.borderThick, boxShadow: BRUT.shadowHard, display: "flex", flexDirection: "column" }}>
                        <div style={{ aspectRatio: "16/11", overflow: "hidden", borderBottom: BRUT.borderThick, background: BRUT.charcoal }}>
                            {imgC && <EditableImage src={imgC} alt={cardC.nama} isEditMode={isEditMode} pos={imgPos("bento-c")} onChange={(np) => setImgPos("bento-c", np)} />}
                        </div>
                        <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
                            <h3 style={{ fontSize: "clamp(24px, 2.6cqw, 38px)", fontWeight: 900, color: BRUT.white, lineHeight: 0.98, letterSpacing: "-0.03em", margin: 0, textTransform: "uppercase" }}>
                                <EditableText
                                    value={(cardC.nama || "Creative Digital Solution").toUpperCase()}
                                    onChange={(v: string) => edit("layanan.1.nama", v)}
                                    isEditMode={isEditMode}
                                    as="span"
                                />
                            </h3>
                            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                                marginTop: "auto", alignSelf: "flex-start",
                                width: 56, height: 56, borderRadius: "50%", background: BRUT.lime, border: BRUT.border,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <ArrowUpRight size={24} style={{ color: BRUT.black }} />
                            </a>
                        </div>
                    </div>

                    {/* Card 3 — standard */}
                    <BentoStd svc={card3} img={img3} idx={2} isEditMode={isEditMode} edit={edit} imgPos={imgPos} setImgPos={setImgPos} />
                </div>
            </div>

            <style>{`
                @container (max-width: 900px) {
                    .nb-bento { grid-template-columns: 1fr !important; }
                    .nb-bento-center { margin-top: 0 !important; }
                }
            `}</style>
        </section>
    );
}

function BentoStd({ svc, img, idx, isEditMode, edit, imgPos, setImgPos }: {
    svc: { nama: string; deskripsi: string }; img: string; idx: number;
    isEditMode: boolean; edit: (p: string, v: string) => void;
    imgPos: (id: string) => ImagePos | undefined; setImgPos: (id: string, p: ImagePos) => void;
}) {
    return (
        <div style={{ background: BRUT.cardDark, border: BRUT.borderThick, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <h3 style={{ fontSize: 19, fontWeight: 900, color: BRUT.white, lineHeight: 1.05, letterSpacing: "-0.02em", margin: 0, textTransform: "uppercase", maxWidth: "78%" }}>
                        <EditableText
                            value={(svc.nama || "").toUpperCase()}
                            onChange={(v: string) => edit(`layanan.${idx}.nama`, v)}
                            isEditMode={isEditMode}
                            as="span"
                        />
                    </h3>
                    <span style={{ width: 40, height: 40, borderRadius: "50%", background: BRUT.lime, border: BRUT.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <ArrowUpRight size={18} style={{ color: BRUT.black }} />
                    </span>
                </div>
                {svc.deskripsi && (
                    <p style={{ fontSize: 13.5, color: BRUT.bodyOnDark, lineHeight: 1.6, margin: 0 }}>
                        <EditableText
                            value={svc.deskripsi}
                            onChange={(v: string) => edit(`layanan.${idx}.deskripsi`, v)}
                            isEditMode={isEditMode}
                            as="span"
                            multiline
                        />
                    </p>
                )}
            </div>
            {img && (
                <div style={{ aspectRatio: "4/3", overflow: "hidden", borderTop: BRUT.borderThick, background: BRUT.charcoal }}>
                    <EditableImage src={img} alt={svc.nama} isEditMode={isEditMode} pos={imgPos(`bento-${idx}`)} onChange={(np) => setImgPos(`bento-${idx}`, np)} />
                </div>
            )}
        </div>
    );
}
