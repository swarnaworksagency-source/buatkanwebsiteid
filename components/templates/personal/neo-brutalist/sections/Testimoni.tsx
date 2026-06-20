import { Star } from "lucide-react";
import { BRUT, type SectionProps } from "../types";

export default function Testimoni({ testimonialPlaceholder }: SectionProps) {
    if (!testimonialPlaceholder || testimonialPlaceholder.length === 0) return null;

    return (
        <section id="testimoni" style={{ background: BRUT.gray, backgroundImage: BRUT.texDotLight, backgroundSize: BRUT.dotSize, padding: "96px 32px", minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
                <div style={{ marginBottom: 44 }}>
                    <span style={{ display: "inline-block", background: BRUT.lime, color: BRUT.black, border: BRUT.border, padding: "5px 14px", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 18 }}>
                        Testimonials
                    </span>
                    <h2 style={{ fontSize: "clamp(28px, 4cqw, 50px)", fontWeight: 900, color: BRUT.inkLight, lineHeight: 0.98, letterSpacing: "-0.03em", margin: 0, textTransform: "uppercase" }}>
                        What clients say
                    </h2>
                </div>

                <div className="nb-test" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                    {testimonialPlaceholder.map((t, i) => (
                        <div key={i} style={{ background: BRUT.white, border: BRUT.borderThick, boxShadow: BRUT.shadowHard, padding: "26px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", gap: 3 }}>
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={15} fill={BRUT.black} style={{ color: BRUT.black }} />)}
                            </div>
                            <p style={{ fontSize: 15, color: BRUT.inkLight, lineHeight: 1.6, flex: 1, margin: 0, fontWeight: 600 }}>“{t.teks}”</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "2px solid #000" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: BRUT.lime, border: BRUT.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 900, color: BRUT.black }}>
                                    {t.nama.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 900, color: BRUT.inkLight, textTransform: "uppercase" }}>{t.nama}</div>
                                    <div style={{ fontSize: 12, color: BRUT.bodyOnLight }}>{t.peran}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                @container (max-width: 1024px) { .nb-test { grid-template-columns: repeat(2, 1fr) !important; } }
                @container (max-width: 600px)  { .nb-test { grid-template-columns: 1fr !important; } }
            `}</style>
        </section>
    );
}
