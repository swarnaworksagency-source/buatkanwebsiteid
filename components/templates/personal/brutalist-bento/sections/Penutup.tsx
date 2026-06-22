"use client";

import { useState } from "react";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { STUDIO, type SectionProps } from "../types";

const COMPANY_LINKS = [
    { label: "Home", href: "#beranda" },
    { label: "About Us", href: "#tentang" },
    { label: "Our Services", href: "#layanan" },
    { label: "Testimonials", href: "#proyek" },
    { label: "Contact me", href: "#kontak" },
];

export default function Penutup({
    footer, about, layanan, kontak, sosmed, lokasi,
    isEditMode, edit, name, waBase, accentGradient, accent2, onAccent,
}: SectionProps) {
    const [email, setEmail] = useState("");

    const ctaHeading = footer?.tagline || "Ready to elevate your brand?";
    const tagline = about?.deskripsi || "Crafting premium digital experiences that move brands forward.";
    const services = (layanan || []).slice(0, 5);

    const submit = () => {
        const trimmed = email.trim();
        const msg = trimmed
            ? `Halo ${name}, saya ${trimmed} dan tertarik bekerja sama.`
            : `Halo ${name}, saya tertarik bekerja sama.`;
        const url = `${waBase}?text=${encodeURIComponent(msg)}`;
        if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
    };

    const socials: Array<{ label: string; href: string }> = [];
    if (sosmed?.instagram) socials.push({ label: `@${sosmed.instagram}`, href: `https://instagram.com/${sosmed.instagram}` });
    if (sosmed?.twitter) socials.push({ label: `@${sosmed.twitter}`, href: `https://twitter.com/${sosmed.twitter}` });
    if (sosmed?.tiktok) socials.push({ label: `@${sosmed.tiktok}`, href: `https://tiktok.com/@${sosmed.tiktok}` });

    return (
        <>
            {/* ── 6.1 CTA wrapper ── */}
            <section id="kontak" style={{ background: STUDIO.bg, padding: "40px 14px 14px" }}>
                <div className="bb-cta-wrap" style={{
                    position: "relative", overflow: "hidden",
                    borderRadius: STUDIO.huge, background: accentGradient,
                    padding: "76px 40px", textAlign: "center",
                }}>
                    <h2 style={{
                        fontSize: "clamp(36px, 5.4vw, 72px)", fontWeight: 800,
                        letterSpacing: "-0.045em", lineHeight: 0.98, color: onAccent || "#fff", margin: "0 auto 32px", maxWidth: 760,
                    }}>
                        <EditableText
                            value={ctaHeading}
                            onChange={(v: string) => edit("footer.tagline", v)}
                            isEditMode={isEditMode}
                            as="span"
                        />
                    </h2>

                    {/* Email input + CTA → prefilled WhatsApp */}
                    <div className="bb-cta-form" style={{
                        display: "flex", gap: 8, maxWidth: 520, margin: "0 auto",
                        background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: STUDIO.full, padding: 7,
                    }}>
                        <input
                            type="text"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") submit(); }}
                            placeholder="Mari Wujudkan Ide Anda!"
                            style={{
                                flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
                                color: "#fff", fontSize: 15, fontWeight: 500, padding: "0 18px",
                                WebkitAppearance: "none", boxShadow: "none",
                            }}
                        />
                        <button onClick={submit} style={{
                            display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0,
                            background: accent2, color: onAccent || "#0b0b0c", border: "none", cursor: "pointer",
                            padding: "12px 22px", borderRadius: STUDIO.full, fontSize: 14, fontWeight: 800, whiteSpace: "nowrap",
                        }}>
                            {footer?.ctaText || "Get In Touch Today"}
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 16 }}>
                        Diskusi proyek gratis via WhatsApp.
                    </p>
                </div>
            </section>

            {/* ── 6.2 Solid utility footer (electric yellow) ── */}
            <footer style={{ background: accent2, color: onAccent || "#0b0b0c", padding: "14px" }}>
                <div style={{ borderRadius: STUDIO.huge, background: accent2 }}>
                    <div className="bb-foot" style={{
                        maxWidth: 1280, margin: "0 auto", padding: "56px 32px 40px",
                        display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.4fr", gap: 32,
                    }}>
                        {/* Brand meta */}
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 14 }}>
                                {name}
                            </div>
                            <p style={{ fontSize: 14, lineHeight: 1.6, color: "color-mix(in srgb, currentColor 72%, transparent)", margin: 0, maxWidth: 280 }}>
                                {tagline.length > 130 ? tagline.slice(0, 130) + "…" : tagline}
                            </p>
                        </div>

                        {/* Services map */}
                        {services.length > 0 && (
                            <div>
                                <div style={footHeadStyle}>Services</div>
                                <ul style={footListStyle}>
                                    {services.map((s, i) => (
                                        <li key={i}><a href="#layanan" style={footLinkStyle}>{s.nama}</a></li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Company links */}
                        <div>
                            <div style={footHeadStyle}>Company</div>
                            <ul style={footListStyle}>
                                {COMPANY_LINKS.map(l => (
                                    <li key={l.href}><a href={l.href} style={footLinkStyle}>{l.label}</a></li>
                                ))}
                            </ul>
                        </div>

                        {/* Connect hub */}
                        <div>
                            <div style={footHeadStyle}>Let&apos;s Connect</div>
                            <ul style={footListStyle}>
                                {kontak?.email && (
                                    <li><a href={`mailto:${kontak.email}`} style={{ ...footLinkStyle, display: "inline-flex", alignItems: "center", gap: 8 }}><Mail size={14} /> {kontak.email}</a></li>
                                )}
                                {kontak?.telepon && (
                                    <li><a href={`tel:${kontak.telepon}`} style={{ ...footLinkStyle, display: "inline-flex", alignItems: "center", gap: 8 }}><Phone size={14} /> {kontak.telepon}</a></li>
                                )}
                                {lokasi && (
                                    <li><span style={{ ...footLinkStyle, display: "inline-flex", alignItems: "center", gap: 8 }}><MapPin size={14} /> {lokasi}</span></li>
                                )}
                                {socials.map((s, i) => (
                                    <li key={i}><a href={s.href} target="_blank" rel="noopener noreferrer" style={footLinkStyle}>{s.label}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 48px" }}>
                        <div style={{ borderTop: "1px solid color-mix(in srgb, currentColor 18%, transparent)", paddingTop: 24, fontSize: 13, color: "color-mix(in srgb, currentColor 70%, transparent)" }}>
                            © {new Date().getFullYear()} {name} · Dibuat dengan{" "}
                            <a href="https://buatkanweb.id" style={{ color: "currentColor", fontWeight: 700, textDecoration: "none" }}>BuatkanWeb.id</a>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                .bb-cta-form input:focus { outline: none !important; box-shadow: none !important; background: transparent !important; }
                .bb-cta-form input:-webkit-autofill,
                .bb-cta-form input:-webkit-autofill:focus { -webkit-box-shadow: 0 0 0 1000px transparent inset !important; -webkit-text-fill-color: #fff !important; }
                @media (max-width: 900px) {
                    .bb-foot { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
                }
                @media (max-width: 768px) {
                    .bb-cta-wrap { padding: 48px 20px !important; }
                    .bb-foot { padding: 40px 20px 32px !important; }
                }
                @media (max-width: 560px) {
                    .bb-foot { grid-template-columns: 1fr !important; }
                    .bb-cta-form { flex-direction: column !important; background: transparent !important; border: none !important; padding: 0 !important; gap: 12px !important; }
                    .bb-cta-form input { background: rgba(0,0,0,0.18) !important; border: 1px solid rgba(255,255,255,0.25) !important; border-radius: 9999px !important; padding: 14px 18px !important; }
                    .bb-cta-form button { justify-content: center !important; }
                }
            `}</style>
        </>
    );
}

const footHeadStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16,
};
const footListStyle: React.CSSProperties = {
    listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11,
};
const footLinkStyle: React.CSSProperties = {
    fontSize: 14, fontWeight: 600, color: "color-mix(in srgb, currentColor 78%, transparent)", textDecoration: "none",
};
