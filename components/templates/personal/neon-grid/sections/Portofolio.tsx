import { ArrowUpRight } from "lucide-react";
import { NEON, type SectionProps } from "../types";

export default function Portofolio({ portofolio, layanan, waLink }: SectionProps) {
    if (!portofolio || portofolio.length === 0) return null;

    const items = portofolio.map((img, i) => ({
        img,
        title: layanan?.[i]?.nama || `Project ${String(i + 1).padStart(2, "0")}`,
    }));

    return (
        <section id="proyek" style={{ backgroundColor: NEON.bg, backgroundImage: "radial-gradient(ellipse 55% 50% at 50% 80%, rgba(163,230,53,0.04) 0%, transparent 65%)", padding: "60px 36px", minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#fff", margin: 0 }}>
                        Portfolio Highlights
                    </h2>
                </div>

                <div className="ng-port" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                    {items.map((p, i) => (
                        <a key={i} href={waLink} target="_blank" rel="noopener noreferrer"
                            style={{
                                position: "relative", display: "block", borderRadius: NEON.lg, overflow: "hidden",
                                border: `1px solid ${NEON.hairline}`, aspectRatio: "4 / 5", background: NEON.card,
                                textDecoration: "none", transition: "transform 0.25s ease, border-color 0.2s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                                (e.currentTarget as HTMLElement).style.borderColor = NEON.limeSoft;
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLElement).style.borderColor = NEON.hairline;
                            }}
                        >
                            <img src={p.img} alt={p.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,17,22,0.85) 0%, rgba(11,17,22,0) 50%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 20 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>{p.title}</h3>
                                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: NEON.lime, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <ArrowUpRight size={15} style={{ color: NEON.onLime }} />
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
            <style>{`
                @media (max-width: 900px) { .ng-port { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 560px) { .ng-port { grid-template-columns: 1fr !important; } }
            `}</style>
        </section>
    );
}
