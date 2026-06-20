import { ArrowUpRight, Star } from "lucide-react";
import { BRUT, type SectionProps } from "../types";
import { EditableImage } from "../EditableImage";

export default function Portofolio({ portofolio, layanan, waLink, isEditMode, imgPos, setImgPos }: SectionProps) {
    if (!portofolio || portofolio.length === 0) return null;

    const items = portofolio.map((img, i) => ({
        img,
        title: (layanan?.[i]?.nama || `Project ${String(i + 1).padStart(2, "0")}`).toUpperCase(),
        tag: layanan?.[i]?.harga && layanan[i].harga !== "Hubungi Kami" ? layanan[i].harga : "",
    }));

    return (
        <section id="proyek" style={{ background: BRUT.charcoal, backgroundImage: BRUT.texDotDark, backgroundSize: BRUT.dotSize, padding: "96px 32px", minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
                <div style={{ marginBottom: 44 }}>
                    <span style={{ display: "inline-block", background: BRUT.lime, color: BRUT.black, border: BRUT.border, padding: "5px 14px", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 18 }}>
                        Portfolio
                    </span>
                    <h2 style={{ fontSize: "clamp(28px, 4cqw, 50px)", fontWeight: 900, color: BRUT.white, lineHeight: 0.98, letterSpacing: "-0.03em", margin: 0, textTransform: "uppercase" }}>
                        Selected Work
                    </h2>
                </div>

                <div className="nb-port" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                    {items.map((p, i) => (
                        <a key={i} href={isEditMode ? undefined : waLink} target="_blank" rel="noopener noreferrer"
                            onClick={isEditMode ? (e) => e.preventDefault() : undefined}
                            style={{ position: "relative", display: "block", border: BRUT.borderThick, overflow: "hidden", aspectRatio: "4/5", background: BRUT.cardDark, textDecoration: "none", transition: "box-shadow 0.15s, transform 0.15s" }}
                            onMouseEnter={e => { if (isEditMode) return; (e.currentTarget as HTMLElement).style.boxShadow = BRUT.shadowHard; (e.currentTarget as HTMLElement).style.transform = "translate(-3px,-3px)"; }}
                            onMouseLeave={e => { if (isEditMode) return; (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; }}
                        >
                            <EditableImage src={p.img} alt={p.title} isEditMode={isEditMode} pos={imgPos(`porto-${i}`)} onChange={(np) => setImgPos(`porto-${i}`, np)} />
                            <div style={{ position: "absolute", inset: 0, pointerEvents: isEditMode ? "none" : undefined, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 52%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 18 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                    <h3 style={{ fontSize: 15, fontWeight: 900, color: BRUT.white, margin: 0, textTransform: "uppercase", letterSpacing: "-0.01em" }}>{p.title}</h3>
                                    <span style={{ width: 34, height: 34, borderRadius: "50%", background: BRUT.lime, border: BRUT.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <ArrowUpRight size={16} style={{ color: BRUT.black }} />
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 12, justifyContent: "center", color: BRUT.lime }}>
                    <Star size={16} fill={BRUT.lime} /> <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>More work on request</span> <Star size={16} fill={BRUT.lime} />
                </div>
            </div>
            <style>{`
                @container (max-width: 900px) { .nb-port { grid-template-columns: repeat(2, 1fr) !important; } }
                @container (max-width: 560px) { .nb-port { grid-template-columns: 1fr !important; } }
            `}</style>
        </section>
    );
}
