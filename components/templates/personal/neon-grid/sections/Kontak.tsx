"use client";

import { ArrowUpRight, Mail, Phone, MapPin, AtSign, Share2, Music2 } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { NEON, type SectionProps } from "../types";

export default function Kontak({
    footer, kontak, sosmed, lokasi, isEditMode, edit, name, waLink,
}: SectionProps) {
    const socials: Array<{ icon: React.ReactNode; href: string }> = [];
    if (sosmed?.instagram) socials.push({ icon: <AtSign size={17} />, href: `https://instagram.com/${sosmed.instagram}` });
    if (sosmed?.twitter) socials.push({ icon: <Share2 size={17} />, href: `https://twitter.com/${sosmed.twitter}` });
    if (sosmed?.tiktok) socials.push({ icon: <Music2 size={17} />, href: `https://tiktok.com/@${sosmed.tiktok}` });

    return (
        <>
            {/* Final CTA card */}
            <section id="kontak" style={{ backgroundColor: NEON.bg, backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 100%, color-mix(in srgb, var(--ng-accent, #a3e635) 5%, transparent) 0%, transparent 65%)", padding: "60px 16px 40px" }}>
                <div className="ng-cta-wrap" style={{
                    position: "relative", overflow: "hidden", maxWidth: 1280, margin: "0 auto",
                    borderRadius: NEON.huge, background: NEON.lime, color: NEON.onLime,
                    padding: "72px 40px", textAlign: "center",
                }}>
                    <h2 style={{ fontSize: "clamp(34px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.0, margin: "0 auto 18px", maxWidth: 720, color: NEON.onLime }}>
                        <EditableText
                            value={footer?.tagline || "Siap mulai proyek Anda?"}
                            onChange={(v: string) => edit("footer.tagline", v)}
                            isEditMode={isEditMode}
                            as="span"
                        />
                    </h2>
                    <p style={{ fontSize: 17, color: "rgba(11,17,22,0.72)", margin: "0 auto 36px", maxWidth: 480, lineHeight: 1.6, fontWeight: 500 }}>
                        Hubungi saya untuk diskusi secara gratis
                    </p>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        background: NEON.onLime, color: NEON.lime,
                        padding: "15px 28px", borderRadius: NEON.full, fontSize: 16, fontWeight: 800, textDecoration: "none",
                    }}>
                        <EditableText
                            value={footer?.ctaText || "Hubungi via WhatsApp"}
                            onChange={(v: string) => edit("footer.ctaText", v)}
                            isEditMode={isEditMode}
                            as="span"
                        />
                        <ArrowUpRight size={18} />
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: NEON.bg, padding: "20px 36px 44px" }}>
                <div className="ng-foot" style={{
                    maxWidth: 1280, margin: "0 auto",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    gap: 32, flexWrap: "wrap",
                    borderTop: `1px solid ${NEON.hairline}`, paddingTop: 36,
                }}>
                    <div style={{ maxWidth: 320 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <span style={{ width: 24, height: 24, borderRadius: 7, background: NEON.lime, display: "inline-block" }} />
                            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{name}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {kontak?.email && (
                                <a href={`mailto:${kontak.email}`} style={footLink}><Mail size={14} style={{ color: NEON.lime }} /> {kontak.email}</a>
                            )}
                            {kontak?.telepon && (
                                <a href={`tel:${kontak.telepon}`} style={footLink}><Phone size={14} style={{ color: NEON.lime }} /> {kontak.telepon}</a>
                            )}
                            {lokasi && (
                                <span style={footLink}><MapPin size={14} style={{ color: NEON.lime }} /> {lokasi}</span>
                            )}
                        </div>
                    </div>

                    {socials.length > 0 && (
                        <div style={{ display: "flex", gap: 10 }}>
                            {socials.map((s, i) => (
                                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                                    width: 42, height: 42, borderRadius: "50%",
                                    background: NEON.card, border: `1px solid ${NEON.hairline}`,
                                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
                                }}>{s.icon}</a>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ maxWidth: 1280, margin: "0 auto", marginTop: 28 }}>
                    <p style={{ fontSize: 13, color: NEON.muted, margin: 0 }}>
                        © {new Date().getFullYear()} {name} · Dibuat dengan{" "}
                        <a href="https://buatkanweb.id" style={{ color: NEON.lime, textDecoration: "none", fontWeight: 600 }}>BuatkanWeb.id</a>
                    </p>
                </div>
            </footer>
            <style>{`
                @media (max-width: 768px) {
                    .ng-cta-wrap { padding: 48px 22px !important; }
                    .ng-foot { padding-top: 28px !important; gap: 24px !important; }
                }
            `}</style>
        </>
    );
}

const footLink: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 9,
    fontSize: 14, color: NEON.body, textDecoration: "none",
};
