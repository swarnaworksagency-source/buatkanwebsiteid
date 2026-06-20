"use client";

import { ArrowUpRight, Mail, Phone, MapPin, AtSign, Share2, Music2 } from "lucide-react";
import { EditableText } from "@/components/ui/EditableText";
import { BRUT, type SectionProps } from "../types";

export default function Kontak({
    footer, kontak, sosmed, lokasi, isEditMode, edit, name, waLink, accent,
}: SectionProps) {
    const socials: Array<{ icon: React.ReactNode; label: string; href: string }> = [];
    if (sosmed?.instagram) socials.push({ icon: <AtSign size={16} />, label: "Instagram", href: `https://instagram.com/${sosmed.instagram}` });
    if (sosmed?.twitter) socials.push({ icon: <Share2 size={16} />, label: "X / Twitter", href: `https://twitter.com/${sosmed.twitter}` });
    if (sosmed?.tiktok) socials.push({ icon: <Music2 size={16} />, label: "TikTok", href: `https://tiktok.com/@${sosmed.tiktok}` });

    return (
        <section id="kontak" style={{ background: BRUT.gray, backgroundImage: BRUT.texDotLight, backgroundSize: BRUT.dotSize, padding: "96px 32px", minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: 1080, margin: "0 auto", width: "100%" }}>
                <div style={{ background: accent, border: BRUT.borderThick, boxShadow: BRUT.shadowHard, padding: "64px 40px", textAlign: "center" }}>
                    <h2 style={{ fontSize: "clamp(34px, 5.4cqw, 68px)", fontWeight: 900, color: BRUT.white, lineHeight: 0.94, letterSpacing: "-0.035em", margin: "0 auto 18px", maxWidth: 720, textTransform: "uppercase" }}>
                        <EditableText
                            value={(footer?.tagline || "Let's build something bold").toUpperCase()}
                            onChange={(v: string) => edit("footer.tagline", v)}
                            isEditMode={isEditMode}
                            as="span"
                        />
                    </h2>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", margin: "0 auto 32px", maxWidth: 460, lineHeight: 1.6, fontWeight: 500 }}>
                        Hubungi saya untuk diskusi proyek. Gratis, tanpa komitmen.
                    </p>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        background: BRUT.lime, color: BRUT.black, border: BRUT.border,
                        padding: "15px 28px", fontSize: 16, fontWeight: 900, textDecoration: "none", textTransform: "uppercase", boxShadow: "5px 5px 0 #000",
                    }}>
                        <EditableText
                            value={footer?.ctaText || "Hubungi via WhatsApp"}
                            onChange={(v: string) => edit("footer.ctaText", v)}
                            isEditMode={isEditMode}
                            as="span"
                        />
                        <ArrowUpRight size={18} />
                    </a>

                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 24px", marginTop: 44, paddingTop: 32, borderTop: "2px solid rgba(255,255,255,0.3)" }}>
                        {kontak?.email && <a href={`mailto:${kontak.email}`} style={ct}><Mail size={15} /> {kontak.email}</a>}
                        {kontak?.telepon && <a href={`tel:${kontak.telepon}`} style={ct}><Phone size={15} /> {kontak.telepon}</a>}
                        {lokasi && <span style={ct}><MapPin size={15} /> {lokasi}</span>}
                    </div>

                    {socials.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 24 }}>
                            {socials.map((s, i) => (
                                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", background: BRUT.white, color: BRUT.black, border: BRUT.border, fontSize: 13, fontWeight: 800, textTransform: "uppercase", textDecoration: "none" }}>{s.icon} {s.label}</a>
                            ))}
                        </div>
                    )}
                </div>
                <p style={{ fontSize: 13, color: BRUT.bodyOnLight, margin: "24px 0 0", textAlign: "center", fontWeight: 600 }}>
                    © {new Date().getFullYear()} {name} · Dibuat dengan{" "}
                    <a href="https://buatkanweb.id" style={{ color: BRUT.inkLight, fontWeight: 900, textDecoration: "none" }}>BuatkanWeb.id</a>
                </p>
            </div>
        </section>
    );
}

const ct: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "#fff", textDecoration: "none", fontWeight: 600,
};
