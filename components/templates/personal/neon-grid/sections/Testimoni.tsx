import { Quote } from "lucide-react";
import { NEON, type SectionProps } from "../types";

export default function Testimoni({ testimonialPlaceholder }: SectionProps) {
    if (!testimonialPlaceholder || testimonialPlaceholder.length === 0) return null;

    return (
        <section id="testimoni" style={{ backgroundColor: NEON.bg, backgroundImage: "radial-gradient(ellipse 45% 55% at 85% 30%, rgba(163,230,53,0.04) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 10% 70%, rgba(163,230,53,0.03) 0%, transparent 60%)", padding: "60px 36px", minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
                <div style={{ marginBottom: 44 }}>
                    <h2 style={{ fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#fff", margin: 0 }}>
                        What clients say
                    </h2>
                </div>

                <div className="ng-test" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                    {testimonialPlaceholder.map((t, i) => (
                        <div key={i} style={{
                            background: NEON.card, border: `1px solid ${NEON.hairline}`, borderRadius: NEON.md,
                            padding: "28px 26px", display: "flex", flexDirection: "column", gap: 18,
                        }}>
                            <Quote size={26} style={{ color: NEON.lime }} fill={NEON.lime} />
                            <p style={{ fontSize: 15, color: "#fff", lineHeight: 1.7, flex: 1, margin: 0, fontWeight: 500 }}>
                                “{t.teks}”
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: `1px solid ${NEON.hairline}` }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                                    background: NEON.limeDim, color: NEON.lime,
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800,
                                }}>
                                    {t.nama.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.nama}</div>
                                    <div style={{ fontSize: 12, color: NEON.muted }}>{t.peran}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                @media (max-width: 1024px) { .ng-test { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 600px)  { .ng-test { grid-template-columns: 1fr !important; } }
            `}</style>
        </section>
    );
}
