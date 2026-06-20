import { ArrowUpRight } from "lucide-react";
import { STUDIO, type SectionProps } from "../types";

const BG_LAYERS = "radial-gradient(ellipse 55% 45% at 80% 30%, rgba(255,59,48,0.06) 0%, transparent 70%), radial-gradient(rgba(255,255,255,0.07) 1.4px, transparent 1.4px)";
const BG_SIZES = "100% 100%, 28px 28px";

export default function Portofolio({ portofolio, layanan, waLink }: SectionProps) {
    if (!portofolio || portofolio.length === 0) return null;

    const items = portofolio.map((img, i) => ({
        img,
        title: layanan?.[i]?.nama || `Project ${String(i + 1).padStart(2, "0")}`,
        desc: layanan?.[i]?.deskripsi || "",
    }));

    return (
        <section id="proyek" className="bb-port-sec" style={{
            backgroundColor: STUDIO.bg, backgroundImage: BG_LAYERS, backgroundSize: BG_SIZES,
            padding: "96px 36px", minHeight: "100vh", display: "flex", alignItems: "center",
        }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
                {/* Header */}
                <div style={{ marginBottom: 44 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: STUDIO.amber, letterSpacing: "0.05em", textTransform: "uppercase" as const, display: "block", marginBottom: 10 }}>
                        Selected Work
                    </span>
                    <h2 style={{ fontSize: "clamp(28px, 3.8vw, 46px)", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1, color: STUDIO.ink, margin: 0 }}>
                        Project
                    </h2>
                </div>

                {/* Cards */}
                <div className="bb-port" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                    {items.map((p, i) => (
                        <a key={i} href={waLink} target="_blank" rel="noopener noreferrer"
                            style={{
                                position: "relative", display: "block",
                                borderRadius: STUDIO.xl, overflow: "hidden",
                                border: `1px solid ${STUDIO.hairline}`, aspectRatio: "4 / 5",
                                background: STUDIO.card, textDecoration: "none", transition: "transform 0.25s ease, box-shadow 0.25s ease",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px rgba(0,0,0,0.4)`;
                                const im = e.currentTarget.querySelector("img");
                                if (im) { im.style.filter = "grayscale(0) contrast(1)"; im.style.transform = "scale(1.04)"; }
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                const im = e.currentTarget.querySelector("img");
                                if (im) { im.style.filter = "grayscale(1) contrast(1.1)"; im.style.transform = "scale(1)"; }
                            }}
                        >
                            <img src={p.img} alt={p.title} loading="lazy"
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(1) contrast(1.1)", transition: "filter 0.35s ease, transform 0.45s ease" }} />
                            <div style={{
                                position: "absolute", inset: 0,
                                background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 55%)",
                                display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 22,
                            }}>
                                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
                                    <div>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{p.title}</h3>
                                        {p.desc && (
                                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.4 }}>
                                                {p.desc.length > 60 ? p.desc.slice(0, 60) + "…" : p.desc}
                                            </p>
                                        )}
                                    </div>
                                    <span style={{ width: 34, height: 34, borderRadius: "50%", background: STUDIO.crimson, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <ArrowUpRight size={15} style={{ color: "#fff" }} />
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
            <style>{`
                @media (max-width: 900px) { .bb-port { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 768px) { .bb-port-sec { padding: 56px 18px !important; min-height: auto !important; } }
                @media (max-width: 560px) { .bb-port { grid-template-columns: 1fr !important; } }
            `}</style>
        </section>
    );
}
