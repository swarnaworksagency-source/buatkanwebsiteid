"use client";

import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { STUDIO, type SectionProps } from "../types";

const NAV_LINKS = [
    { label: "Home", href: "#beranda" },
    { label: "About", href: "#tentang" },
    { label: "Services", href: "#layanan" },
    { label: "Experience", href: "#pengalaman" },
    { label: "Projects", href: "#proyek" },
];

export default function Hero({
    hero, about, fotoBisnis, logo,
    isEditMode, edit, name, waLink,
}: SectionProps) {
    const [open, setOpen] = useState(false);

    const roleRaw = hero?.subheadline || "Creative Director";
    const role = roleRaw.length > 40 ? roleRaw.slice(0, 40) + "…" : roleRaw;
    const metaTag = name;
    const portrait = (fotoBisnis && fotoBisnis[0]) || logo || "";
    const ctaText = hero?.ctaText || "Get in Touch";

    const fallbackStats = [
        { value: "8+", label: "Years Experience" },
        { value: "120+", label: "Projects Done" },
        { value: "60+", label: "Happy Clients" },
    ];
    const stats = [0, 1, 2].map(i => {
        const raw = about?.keunggulan?.[i];
        if (raw) {
            const m = raw.match(/^(\d+[^\s]*)\s+(.+)$/);
            return m ? { value: m[1], label: m[2].toUpperCase() } : { value: "—", label: raw.toUpperCase() };
        }
        return fallbackStats[i];
    });

    return (
        <section id="beranda" className="bb-hero" style={{ padding: "14px 14px 0", background: STUDIO.bg, height: "93vh", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
            {/* Preload gambar hero (background-image) → LCP. React 19 hoist <link> ke <head>. */}
            {portrait && <link rel="preload" as="image" href={portrait} fetchPriority="high" />}
            <div style={{
                position: "relative", borderRadius: STUDIO.huge,
                background: STUDIO.gradient, overflow: "hidden",
                flex: 1, display: "flex", flexDirection: "column", isolation: "isolate",
            }}>
                {/* High-contrast cutout portrait over gradient */}
                {portrait && (
                    <div className="bb-hero-portrait" style={{
                        position: "absolute", top: 0, right: "2%", bottom: 0, width: "44%",
                        backgroundImage: `url(${portrait})`, backgroundSize: "cover", backgroundPosition: "center top",
                        filter: "grayscale(1) contrast(1.12)", mixBlendMode: "luminosity", opacity: 0.95, zIndex: 0,
                        maskImage: "linear-gradient(to right, transparent 0%, #000 40%)",
                        WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 40%)",
                    }} />
                )}
                <div style={{
                    position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
                    background: "linear-gradient(100deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 56%)",
                }} />

                {/* ── 1.1 Navigation Control Deck ── */}
                <nav style={{
                    position: "relative", zIndex: 3,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "24px 32px", gap: 20,
                }}>
                    <a href="#beranda" style={{ textDecoration: "none", flexShrink: 0 }}>
                        {logo ? (
                            <img src={logo} alt={name} style={{ height: 30, objectFit: "contain" }} />
                        ) : (
                            <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
                                {name.split(" ").slice(0, 2).join(" ")}
                            </span>
                        )}
                    </a>

                    {/* Center floating pill menu */}
                    <div className="bb-nav-menu" style={{
                        display: "flex", alignItems: "center", gap: 2,
                        background: "rgba(0,0,0,0.22)", backdropFilter: "blur(10px)",
                        padding: 5, borderRadius: STUDIO.full, border: "1px solid rgba(255,255,255,0.18)",
                    }}>
                        {NAV_LINKS.map(l => (
                            <a key={l.href} href={l.href} style={{
                                fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,0.9)",
                                textDecoration: "none", padding: "8px 16px", borderRadius: STUDIO.full,
                                transition: "background 0.15s",
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.16)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >{l.label}</a>
                        ))}
                    </div>

                    {/* Right action pill */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="bb-nav-cta"
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 10,
                                background: "#fff", color: "#0b0b0c",
                                padding: "7px 7px 7px 20px", borderRadius: STUDIO.full,
                                fontSize: 14, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
                            }}>
                            {ctaText}
                            <span style={{
                                width: 30, height: 30, borderRadius: "50%", background: STUDIO.crimson, color: "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <ArrowUpRight size={16} />
                            </span>
                        </a>
                        <button className="bb-nav-burger" onClick={() => setOpen(!open)}
                            style={{ display: "none", background: "rgba(255,255,255,0.16)", border: "none", cursor: "pointer", color: "#fff", padding: 9, borderRadius: STUDIO.sm }}>
                            {open ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </nav>

                {open && (
                    <div style={{
                        position: "relative", zIndex: 3, margin: "0 24px 8px",
                        background: "rgba(0,0,0,0.3)", borderRadius: STUDIO.md, padding: 12,
                        display: "flex", flexDirection: "column", gap: 2, backdropFilter: "blur(8px)",
                    }}>
                        {NAV_LINKS.map(l => (
                            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                                style={{ fontSize: 15, fontWeight: 600, color: "#fff", textDecoration: "none", padding: "12px 14px", borderRadius: STUDIO.sm }}>
                                {l.label}
                            </a>
                        ))}
                    </div>
                )}

                {/* ── 1.2 Asymmetric Master Headline Grid (65 / 35) ── */}
                <div className="bb-hero-grid" style={{
                    position: "relative", zIndex: 2, flex: 1,
                    display: "grid", gridTemplateColumns: "1.86fr 1fr",
                    gap: 40, alignItems: "center", padding: "32px 36px 0",
                }}>
                    <div>
                        <span style={{ display: "inline-block", fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "0.01em" }}>
                            {metaTag}
                        </span>
                        <h1 style={{
                            fontSize: "clamp(48px, 8.2vw, 116px)", fontWeight: 800,
                            lineHeight: 0.9, letterSpacing: "-0.045em", color: "#fff", margin: 0,
                            textWrap: "balance" as const,
                        }}>
                            <EditableText
                                value={role}
                                onChange={(v: string) => edit("hero.subheadline", v)}
                                isEditMode={isEditMode}
                                as="span"
                            />
                        </h1>
                    </div>

                </div>

                {/* ── 1.3 Floating Infrastructure Statistics ── */}
                <div className="bb-hero-stats" style={{
                    position: "relative", zIndex: 2,
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
                    padding: "34px 36px 32px", marginTop: 36,
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                }}>
                    {stats.map((s, i) => (
                        <div key={i}>
                            <div style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.72)", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginTop: 8 }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .bb-hero-portrait { width: 100% !important; opacity: 0.4 !important; }
                    .bb-hero-grid { grid-template-columns: 1fr !important; padding-top: 20px !important; }
                    .bb-nav-menu { display: none !important; }
                    .bb-nav-cta { display: none !important; }
                    .bb-nav-burger { display: flex !important; }
                    .bb-hero-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
                }
                @media (max-width: 768px) {
                    /* Lepas tinggi tetap 93vh → biar konten mengalir, tidak terpotong/tabrakan. */
                    .bb-hero { height: auto !important; min-height: 100svh !important; }
                    .bb-hero nav { padding: 16px 18px !important; }
                    .bb-hero-grid { padding: 16px 18px 0 !important; gap: 20px !important; }
                    .bb-hero-stats { padding: 24px 18px 28px !important; margin-top: 24px !important; }
                }
            `}</style>
        </section>
    );
}
