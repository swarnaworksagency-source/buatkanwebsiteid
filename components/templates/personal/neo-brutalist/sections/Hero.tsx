"use client";

import { useState } from "react";
import { Star, Phone, ArrowUpRight, Menu, X } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { BRUT, type SectionProps } from "../types";
import { EditableImage } from "../EditableImage";

const NAV_LINKS = [
    { label: "Home", href: "#beranda" },
    { label: "My Service", href: "#layanan" },
    { label: "About Me", href: "#tentang" },
    { label: "Portfolio", href: "#proyek" },
    { label: "Contact me", href: "#kontak" },
];

// Portrait height constant — used by both the img and wallPos so they always match.
const PORTRAIT_H = "min(90vh, 960px)";

export default function Hero({
    hero, about, fotoBisnis, logo, namaPanggilan, keahlian,
    isEditMode, edit, name, waLink, accent, imgPos, setImgPos,
}: SectionProps) {
    const [open, setOpen] = useState(false);

    // Teks besar (layering) = nama panggilan; fallback ke nama depan / headline.
    const wall = (namaPanggilan || name?.split(" ")[0] || hero?.headline || "CREATIVE").toUpperCase();
    const portrait = (fotoBisnis && fotoBisnis[0]) || logo || "";
    const vision = about?.deskripsi || "";

    // SVG text line layout — split by word, compute first-line dy so block is vertically centered.
    const wallWords = wall.split(" ");
    const wallLineCount = wallWords.length;
    const svgFirstDy = wallLineCount > 1 ? `${-(wallLineCount - 1) * 0.4}em` : "0";

    // wallPos.top = canvas_height - portrait_height/2  →  translateY(-50%) centers on that point
    // This guarantees the text wall bisects the portrait at any viewport size.
    const wallPos: React.CSSProperties = {
        position: "absolute",
        top: `calc(100% - ${PORTRAIT_H} / 2)`,
        transform: "translateY(-50%)",
        left: 0, right: 0,
        textAlign: "center", pointerEvents: "none",
    };
    const wallType: React.CSSProperties = {
        fontSize: "clamp(40px, 18cqw, 260px)", fontWeight: 900,
        lineHeight: 0.8, letterSpacing: "-0.045em", textTransform: "uppercase", wordBreak: "break-word",
    };

    // Keahlian untuk sayap kiri — dari input user, fallback ke default.
    const skillItems = (keahlian && keahlian.length > 0
        ? keahlian
        : [
            { nama: "Design", deskripsi: "Merancang antarmuka yang bersih dan fungsional" },
            { nama: "Branding", deskripsi: "Membangun identitas visual yang konsisten" },
            { nama: "Strategy", deskripsi: "Menyusun arah produk berbasis riset" },
        ]).slice(0, 5);

    return (
        <section id="beranda" style={{ background: accent, backgroundImage: BRUT.texGrid, backgroundSize: BRUT.gridSize, minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* ── Nav ── */}
            <nav className="nb-nav" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 32px", gap: 20, borderBottom: BRUT.borderThick, position: "relative", zIndex: 5,
            }}>
                <a href="#beranda" className="nb-brand" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
                    {logo ? (
                        <img src={logo} alt={name} style={{ height: 30, objectFit: "contain" }} />
                    ) : (
                        <>
                            <Star size={22} fill={BRUT.lime} style={{ color: BRUT.lime }} />
                            <span style={{ fontSize: 19, fontWeight: 900, color: BRUT.white, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
                                {name.split(" ").slice(0, 2).join(" ")}
                            </span>
                        </>
                    )}
                </a>

                <div className="nb-nav-menu" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {NAV_LINKS.map(l => (
                        <a key={l.href} href={l.href} style={{
                            fontSize: 13.5, fontWeight: 700, color: BRUT.white, textDecoration: "none",
                            padding: "8px 12px", textTransform: "uppercase", letterSpacing: "0.02em", transition: "color 0.12s",
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = BRUT.lime; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = BRUT.white; }}
                        >{l.label}</a>
                    ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="nb-nav-phone" style={{
                        display: "inline-flex", alignItems: "center", gap: 9,
                        background: BRUT.lime, color: BRUT.black, border: BRUT.border,
                        padding: "8px 16px 8px 8px", borderRadius: BRUT.full,
                        fontSize: 13.5, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap", textTransform: "uppercase",
                    }}>
                        <span style={{ width: 28, height: 28, borderRadius: "50%", background: BRUT.black, color: BRUT.lime, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Phone size={14} />
                        </span>
                        Contact me
                    </a>
                    <button className="nb-nav-burger" onClick={() => setOpen(!open)}
                        style={{ display: "none", background: BRUT.lime, border: BRUT.border, cursor: "pointer", color: BRUT.black, padding: 8, borderRadius: 0 }}>
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Menu mobile: absolute (overlay) supaya membuka menu TIDAK mendorong
                    canvas/tulisan nama layer ke bawah. Anchored di bawah nav. */}
                {open && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: BRUT.charcoal, borderBottom: BRUT.borderThick, padding: 12, display: "flex", flexDirection: "column", gap: 2, zIndex: 10 }}>
                        {NAV_LINKS.map(l => (
                            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                                style={{ fontSize: 15, fontWeight: 700, color: BRUT.white, textDecoration: "none", padding: "12px 14px", textTransform: "uppercase" }}>
                                {l.label}
                            </a>
                        ))}
                    </div>
                )}
            </nav>

            {/* ── Canvas: text walls + portrait (abs) + wings ── */}
            <div style={{
                position: "relative", overflow: "hidden",
                clipPath: "polygon(0 0, 100% 0, 100% 95%, 0 100%)",
                flex: 1, display: "flex", flexDirection: "column",
            }}>
                {/* Layer 1 (z:1) — solid lime text, behind portrait */}
                <div className="nb-wall" style={{ ...wallPos, zIndex: 1 }}>
                    <div style={{ ...wallType, color: BRUT.lime }}>
                        <EditableText
                            value={wall}
                            onChange={(v: string) => edit("namaPanggilan", v)}
                            isEditMode={isEditMode}
                            as="span"
                        />
                    </div>
                </div>

                {/* Portrait (z:2) — absolutely grounded at canvas bottom, centered horizontally */}
                <div className="nb-portrait" style={{
                    position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                    zIndex: 2, display: "flex", justifyContent: "center",
                }}>
                    {portrait ? (
                        <EditableImage
                            src={portrait} alt={name} mode="free" priority
                            isEditMode={isEditMode} pos={imgPos("hero")} onChange={(np) => setImgPos("hero", np)}
                            imgStyle={{
                                height: PORTRAIT_H, width: "auto", maxWidth: "44cqw",
                                objectFit: "contain", objectPosition: "bottom",
                                filter: "drop-shadow(0 16px 28px rgba(0,0,0,0.45))",
                            }}
                        />
                    ) : (
                        <div style={{ height: PORTRAIT_H, aspectRatio: "3/4", maxWidth: "44cqw", background: BRUT.charcoal, border: BRUT.borderThick, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 64, fontWeight: 900, color: BRUT.lime }}>
                                {name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Layer 3 (z:3) — outer-stroke-only via SVG feMorphology.
                    Dilate the lime-filled text shape by 2px, XOR with original →
                    only the outer ring is painted. Interior is truly transparent.
                    No WebkitTextStroke so no inner-half stroke artifact at all. */}
                <svg
                    aria-hidden
                    className="nb-wall-svg"
                    style={{ ...wallPos, zIndex: 3, mixBlendMode: "screen" as const, width: "100%", overflow: "visible", display: "block", pointerEvents: "none" }}
                    height="1"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <filter id="nb-outer-stroke" x="-5%" y="-30%" width="110%" height="160%" colorInterpolationFilters="sRGB">
                            <feMorphology in="SourceGraphic" operator="dilate" radius="2.5" result="expanded" />
                            <feComposite in="expanded" in2="SourceGraphic" operator="out" result="ring" />
                            <feFlood floodColor={BRUT.lime} result="lime" />
                            <feComposite in="lime" in2="ring" operator="in" />
                        </filter>
                    </defs>
                    <text
                        x="50%" y="0"
                        textAnchor="middle" dominantBaseline="central"
                        fill={BRUT.lime}
                        filter="url(#nb-outer-stroke)"
                        fontFamily="inherit" fontWeight="900"
                        style={{ fontSize: "clamp(40px, 18cqw, 260px)", letterSpacing: "-0.045em", textTransform: "uppercase" as const }}
                    >
                        {wallWords.map((word, i) => (
                            <tspan key={i} x="50%" dy={i === 0 ? svgFirstDy : "0.8em"}>{word}</tspan>
                        ))}
                    </text>
                </svg>

                {/* Wings (z:4) — flex row, left+right, vertically centered, above everything */}
                <div className="nb-hero-stage" style={{
                    position: "relative", zIndex: 4,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 10px", gap: 20, flex: 1, width: "100%", maxWidth: 1600, margin: "0 auto",
                    pointerEvents: "none", // biarkan area kosong tengah tembus ke portrait (z:2) supaya bisa di-drag
                }}>
                    {/* Left wing — keahlian: nama + deskripsi, satu baris ke bawah */}
                    <div className="nb-wing nb-wing-left" style={{ maxWidth: 260, alignSelf: "flex-start", paddingTop: 250, paddingRight: 40, pointerEvents: "auto" }}>
                        <p style={{ fontSize: 12, fontWeight: 900, color: BRUT.lime, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "2px solid rgba(255,255,255,0.4)", paddingBottom: 10 }}>Keahlian</p>
                        <div className="nb-skill-list" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {skillItems.map((s, i) => (
                                <div key={i} className="nb-skill-row" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <span className="nb-skill-name" style={{ display: "inline-block", width: "fit-content", background: BRUT.lime, color: BRUT.black, border: BRUT.border, padding: "4px 10px", fontSize: 12.5, fontWeight: 800, textTransform: "uppercase" }}>{s.nama}</span>
                                    {s.deskripsi && <p className="nb-skill-desc" style={{ fontSize: 12, color: BRUT.white, lineHeight: 1.45, margin: 0, fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.deskripsi}</p>}
                                </div>
                            ))}
                            {/* Badge "+N": hanya muncul di MOBILE (lihat @container), ringkas sisa keahlian
                                supaya chip tidak numpuk & menutupi muka di hero. Desktop: display none. */}
                            {skillItems.length > 1 && (
                                <span className="nb-skill-more" style={{ display: "none", width: "fit-content", alignSelf: "center", background: BRUT.white, color: BRUT.black, border: BRUT.border, padding: "4px 10px", fontSize: 12.5, fontWeight: 900, textTransform: "uppercase" }}>+{skillItems.length - 1}</span>
                            )}
                        </div>
                    </div>

                    {/* Right wing — vision + CTA */}
                    <div className="nb-wing" style={{ maxWidth: 300, width: 300, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20, paddingLeft: 50, pointerEvents: "auto" }}>
                        {vision && (
                            <p className="nb-vision" style={{ fontSize: 22, color: BRUT.white, lineHeight: 1.7, margin: 0, fontWeight: 500, textAlign: "justify" }}>
                                <EditableText
                                    value={vision.length > 180 ? vision.slice(0, 180) + "…" : vision}
                                    onChange={(v: string) => edit("about.deskripsi", v)}
                                    isEditMode={isEditMode}
                                    as="span"
                                    multiline
                                />
                            </p>
                        )}
                        <a className="nb-cta" href="#proyek" style={{
                            display: "inline-flex", alignItems: "center", gap: 10, whiteSpace: "nowrap",
                            background: BRUT.white, color: BRUT.black, border: BRUT.border,
                            padding: "13px 22px", borderRadius: 0, fontSize: 15, fontWeight: 900,
                            textDecoration: "none", textTransform: "uppercase", boxShadow: BRUT.shadowHard,
                        }}>
                            Lihat Portofolio Saya
                            <ArrowUpRight size={16} />
                        </a>
                    </div>
                </div>
            </div>

            <style>{`
                @container (max-width: 980px) {
                    .nb-nav-menu { display: none !important; }
                    .nb-nav-burger { display: flex !important; }
                    .nb-nav-phone { display: none !important; }
                    /* Navbar mobile lebih ringkas */
                    .nb-nav { padding: 12px 16px !important; }
                    .nb-brand img { height: 22px !important; }
                    .nb-brand span { font-size: 15px !important; }
                    .nb-nav-burger { padding: 6px !important; }
                    /* Wings di ATAS (keahlian lalu deskripsi), foto absolut di bawah */
                    .nb-hero-stage { flex-direction: column !important; justify-content: flex-start !important; padding: 24px 20px 0 !important; gap: 16px !important; }
                    .nb-wing { max-width: 100% !important; width: 100% !important; padding: 0 !important; }
                    .nb-wing-left { padding-top: 0 !important; }
                    /* Mobile: cukup keahlian PERTAMA + badge "+N", sisanya disembunyikan
                       biar chip tidak menutupi muka di hero. */
                    .nb-skill-list { flex-direction: row !important; flex-wrap: wrap !important; gap: 8px !important; align-items: center !important; }
                    .nb-skill-desc { display: none !important; }
                    .nb-skill-row:not(:first-child) { display: none !important; }
                    .nb-skill-more { display: inline-block !important; }
                    /* Deskripsi & tombol lebih kecil di mobile + maksimal 3 baris */
                    .nb-vision { font-size: 14px !important; line-height: 1.5 !important; text-align: left !important; display: -webkit-box !important; -webkit-line-clamp: 3 !important; -webkit-box-orient: vertical !important; overflow: hidden !important; }
                    .nb-cta { font-size: 12.5px !important; padding: 10px 16px !important; }
                    /* Tulisan layering diturunkan supaya tidak di atas kepala */
                    .nb-wall, .nb-wall-svg { top: 65% !important; }
                    /* Perbesar tulisan layering 1.5x di mobile */
                    .nb-wall > div, .nb-wall-svg text { font-size: 27cqw !important; }
                    .nb-portrait img, .nb-portrait > div { height: min(62vh, 580px) !important; max-width: 94cqw !important; }
                }
            `}</style>
        </section>
    );
}
