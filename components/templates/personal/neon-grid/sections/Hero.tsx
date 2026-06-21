"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowRight, Menu, X, AtSign, Share2, Music2 } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { NEON, type SectionProps } from "../types";

const NAV_LINKS = [
    { label: "Home", href: "#beranda" },
    { label: "About", href: "#proses" },
    { label: "Services", href: "#fitur" },
    { label: "Experience", href: "#pengalaman" },
    { label: "Projects", href: "#proyek" },
    { label: "Testimonials", href: "#testimoni" },
];

export default function Hero({
    hero, about, fotoBisnis, logo, sosmed,
    isEditMode, edit, name, waLink,
}: SectionProps) {
    const [open, setOpen] = useState(false);

    const taglineWhite = hero?.headline || "Play Smarter.";
    const taglineLime = hero?.subheadline || "Improve Faster.";
    const subtext = about?.deskripsi || "";
    const heroImg = (fotoBisnis && fotoBisnis[0]) || logo || "";
    const ctaText = hero?.ctaText || "Hubungi via WhatsApp";

    const socials: Array<{ icon: React.ReactNode; href: string }> = [];
    if (sosmed?.instagram) socials.push({ icon: <AtSign size={16} />, href: `https://instagram.com/${sosmed.instagram}` });
    if (sosmed?.twitter) socials.push({ icon: <Share2 size={16} />, href: `https://twitter.com/${sosmed.twitter}` });
    if (sosmed?.tiktok) socials.push({ icon: <Music2 size={16} />, href: `https://tiktok.com/@${sosmed.tiktok}` });

    return (
        <section id="beranda" style={{ background: NEON.bg, padding: "20px 16px 0" }}>
            {/* Preload gambar hero (background-image) → LCP. React 19 hoist <link> ke <head>. */}
            {heroImg && <link rel="preload" as="image" href={heroImg} fetchPriority="high" />}
            <div style={{ maxWidth: 1320, margin: "0 auto", width: "100%" }}>
                {/* ── 1.1 Navigation Dock ── */}
                <nav style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 8px 24px", gap: 20,
                }}>
                    <a href="#beranda" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
                        {logo ? (
                            <img src={logo} alt={name} style={{ height: 30, objectFit: "contain" }} />
                        ) : (
                            <>
                                <span style={{ width: 26, height: 26, borderRadius: 8, background: NEON.lime, display: "inline-block" }} />
                                <span style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                                    {name.split(" ").slice(0, 2).join(" ")}
                                </span>
                            </>
                        )}
                    </a>

                    <div className="ng-nav-menu" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {NAV_LINKS.map(l => (
                            <a key={l.href} href={l.href} style={{
                                fontSize: 14, fontWeight: 500, color: NEON.body, textDecoration: "none",
                                padding: "8px 14px", borderRadius: NEON.full, transition: "color 0.15s",
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = NEON.body; }}
                            >{l.label}</a>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="ng-nav-cta"
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                background: NEON.lime, color: NEON.onLime,
                                padding: "10px 20px", borderRadius: NEON.full,
                                fontSize: 14, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
                            }}>
                            Get Started <ArrowRight size={16} />
                        </a>
                        <button className="ng-nav-burger" onClick={() => setOpen(!open)}
                            style={{ display: "none", background: NEON.card, border: "none", cursor: "pointer", color: "#fff", padding: 9, borderRadius: NEON.sm }}>
                            {open ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </nav>

                {open && (
                    <div style={{ margin: "0 0 16px", background: NEON.card, borderRadius: NEON.md, padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
                        {NAV_LINKS.map(l => (
                            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                                style={{ fontSize: 15, fontWeight: 500, color: "#fff", textDecoration: "none", padding: "12px 14px", borderRadius: NEON.sm }}>
                                {l.label}
                            </a>
                        ))}
                    </div>
                )}

                {/* ── 1.2 Overlapping Hero Showcase ── */}
                <div className="ng-hero-box" style={{
                    position: "relative", borderRadius: NEON.huge, overflow: "hidden",
                    minHeight: 600, background: NEON.card,
                    border: `1px solid ${NEON.hairline}`,
                }}>
                    {heroImg && (
                        <div style={{
                            position: "absolute", top: 0, right: 0, bottom: 0, width: "46%",
                            backgroundImage: `url(${heroImg})`,
                            backgroundSize: "cover", backgroundPosition: "center top",
                            zIndex: 0,
                            maskImage: "linear-gradient(to right, transparent 0%, #000 38%)",
                            WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 38%)",
                        }} />
                    )}
                    {/* Left scrim */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(11,17,22,0.95) 0%, rgba(11,17,22,0.5) 55%, rgba(11,17,22,0) 100%)", zIndex: 0, pointerEvents: "none" }} />

                    {/* Top-right social pill */}
                    {socials.length > 0 && (
                        <div className="ng-hero-social" style={{
                            position: "absolute", top: 24, right: 24, zIndex: 2,
                            display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10,
                        }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Follow us</span>
                            <div style={{ display: "flex", gap: 8 }}>
                                {socials.map((s, i) => (
                                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                                        width: 38, height: 38, borderRadius: "50%",
                                        background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                                        textDecoration: "none", backdropFilter: "blur(6px)",
                                    }}>{s.icon}</a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom inset layer — tagline + subtext (left) | dual CTA (right) */}
                    <div className="ng-hero-bottom" style={{
                        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 2,
                        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                        gap: 32, padding: "40px 40px 44px", flexWrap: "wrap",
                    }}>
                        {/* Bottom-left — oversized 2-tone tagline */}
                        <div style={{ flex: "1 1 460px", minWidth: 0 }}>
                            <h1 style={{
                                fontSize: "clamp(40px, 6vw, 78px)", fontWeight: 800,
                                lineHeight: 0.95, letterSpacing: "-0.04em", margin: 0,
                            }}>
                                <span style={{ display: "block", color: "#fff" }}>
                                    <EditableText
                                        value={taglineWhite}
                                        onChange={(v: string) => edit("hero.headline", v)}
                                        isEditMode={isEditMode}
                                        as="span"
                                    />
                                </span>
                                <span style={{ display: "block", color: NEON.lime }}>
                                    <EditableText
                                        value={taglineLime}
                                        onChange={(v: string) => edit("hero.subheadline", v)}
                                        isEditMode={isEditMode}
                                        as="span"
                                    />
                                </span>
                            </h1>
                            {subtext && (
                                <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.82)", margin: "20px 0 0", maxWidth: "45%", fontWeight: 500 }}
                                    className="ng-hero-subtext">
                                    <EditableText
                                        value={subtext}
                                        onChange={(v: string) => edit("about.deskripsi", v)}
                                        isEditMode={isEditMode}
                                        as="span"
                                        multiline
                                    />
                                </p>
                            )}
                        </div>

                        {/* Bottom-right — dual CTA (replaces app-store badges) */}
                        <div className="ng-hero-cta" style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
                            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "space-between", gap: 14,
                                // Glossy seperti tombol "Lihat Proyek", tapi warna lime.
                                background: "rgba(163,230,53,0.14)", color: NEON.lime,
                                border: "1px solid rgba(163,230,53,0.5)", backdropFilter: "blur(6px)",
                                padding: "14px 18px", borderRadius: NEON.md, minWidth: 220,
                                fontSize: 14, fontWeight: 700, textDecoration: "none",
                            }}>
                                {ctaText}
                                <ArrowUpRight size={18} />
                            </a>
                            <a href="#proyek" style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "space-between", gap: 14,
                                background: "rgba(255,255,255,0.08)", color: "#fff",
                                border: "1px solid rgba(255,255,255,0.22)",
                                padding: "14px 18px", borderRadius: NEON.md, minWidth: 220,
                                fontSize: 14, fontWeight: 600, textDecoration: "none", backdropFilter: "blur(6px)",
                            }}>
                                Lihat Proyek
                                <ArrowUpRight size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .ng-nav-menu { display: none !important; }
                    .ng-nav-cta { display: none !important; }
                    .ng-nav-burger { display: flex !important; }
                    .ng-hero-subtext { max-width: 100% !important; }
                    .ng-hero-bottom { padding: 28px 24px 28px !important; }
                }
                @media (max-width: 768px) {
                    /* Konten bawah dilepas dari absolute → mengalir, kotak ikut tinggi konten
                       (sebelumnya nempel di minHeight:600 + overflow:hidden = kepotong). */
                    .ng-hero-box { min-height: auto !important; }
                    .ng-hero-bottom { position: static !important; flex-direction: column !important; align-items: stretch !important; padding: 24px 18px 28px !important; }
                    .ng-hero-cta { width: 100% !important; }
                    .ng-hero-cta a { min-width: 0 !important; }
                }
            `}</style>
        </section>
    );
}
