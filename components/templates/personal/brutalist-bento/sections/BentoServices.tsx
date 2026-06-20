"use client";

import { useState } from "react";
import { EditableText } from "@/components/ui/EditableText";
import { STUDIO, type SectionProps } from "../types";

const TEX_DOT = "radial-gradient(rgba(255,255,255,0.07) 1.4px, transparent 1.4px)";
const DOT_SIZE = "28px 28px";
const BG_LAYERS = "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(255,149,0,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 78% 55%, rgba(255,59,48,0.06) 0%, transparent 70%), radial-gradient(rgba(255,255,255,0.07) 1.4px, transparent 1.4px)";
const BG_SIZES = "100% 100%, 100% 100%, 28px 28px";

export default function BentoServices({
    layanan, testimonialPlaceholder, isEditMode, edit,
}: SectionProps) {
    const services = (layanan && layanan.length > 0) ? layanan : [];
    const people = testimonialPlaceholder || [];
    const [selected, setSelected] = useState(0);

    if (services.length === 0 && people.length === 0) return null;

    const activePerson = people[selected % people.length];

    return (
        <section id="layanan" style={{
            backgroundColor: STUDIO.bg, backgroundImage: BG_LAYERS, backgroundSize: BG_SIZES,
            padding: "40px 36px", height: "100vh", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden",
        }}>
            {/* ── Section header ── */}
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", marginBottom: 28 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: STUDIO.amber, letterSpacing: "0.05em", textTransform: "uppercase" as const, display: "block", marginBottom: 10 }}>
                    My Services
                </span>
                <h2 style={{ fontSize: "clamp(28px, 3.6vw, 46px)", fontWeight: 800, color: STUDIO.ink, margin: 0, letterSpacing: "-0.04em", lineHeight: 1 }}>
                    What I Do
                </h2>
            </div>

            <div className="bb-bento" style={{
                maxWidth: 1280, margin: "0 auto", width: "100%",
                display: "grid", gridTemplateColumns: "5fr 7fr", gap: 20, alignItems: "stretch",
            }}>
                {/* ── Left — clickable service list ── */}
                {services.length > 0 && (
                    <div style={{
                        background: STUDIO.card, border: `1px solid ${STUDIO.hairline}`,
                        borderRadius: STUDIO.xl, padding: "36px 32px",
                        display: "flex", flexDirection: "column",
                    }}>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                            {services.map((svc, i) => {
                                const isActive = i === selected;
                                return (
                                    <li key={i}
                                        onClick={() => setSelected(i)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 16,
                                            padding: "18px 12px", cursor: "pointer",
                                            borderRadius: STUDIO.md,
                                            background: isActive ? STUDIO.bgElev : "transparent",
                                            borderBottom: i < services.length - 1 ? `1px solid ${STUDIO.hairlineSoft}` : "none",
                                            transition: "background 0.18s",
                                        }}
                                    >
                                        <span style={{
                                            width: 36, height: 36, borderRadius: STUDIO.full, flexShrink: 0,
                                            background: isActive ? STUDIO.yellow : STUDIO.bgElev,
                                            color: isActive ? "#0b0b0c" : STUDIO.ink,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 14, fontWeight: 800,
                                            border: isActive ? "none" : `1px solid ${STUDIO.hairline}`,
                                            transition: "background 0.18s, color 0.18s",
                                        }}>{i + 1}</span>
                                        <span style={{ fontSize: "clamp(17px, 2vw, 22px)", fontWeight: 700, color: isActive ? STUDIO.ink : STUDIO.body, letterSpacing: "-0.02em", transition: "color 0.18s" }}>
                                            <EditableText
                                                value={svc.nama}
                                                onChange={(v: string) => edit(`layanan.${i}.nama`, v)}
                                                isEditMode={isEditMode}
                                                as="span"
                                            />
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* ── Right — single testimonial matching selected service ── */}
                {activePerson && (
                    <div style={{
                        background: STUDIO.card, border: `1px solid ${STUDIO.hairline}`,
                        borderRadius: STUDIO.xl, padding: "36px 32px",
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                    }}>
                        <div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: "#0b0b0c", background: STUDIO.yellow, padding: "4px 12px", borderRadius: STUDIO.full, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                                    Testimonials
                                </span>
                                <h3 style={{ fontSize: 19, fontWeight: 800, color: STUDIO.ink, margin: 0, letterSpacing: "-0.02em" }}>What clients say</h3>
                            </div>
                            <p style={{ fontSize: "clamp(18px, 2.2vw, 26px)", color: STUDIO.ink, lineHeight: 1.55, margin: "0 0 32px", fontWeight: 500 }}>
                                &ldquo;{activePerson.teks}&rdquo;
                            </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                                background: STUDIO.gradient, color: "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 16, fontWeight: 800,
                            }}>
                                {activePerson.nama.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: STUDIO.ink }}>{activePerson.nama}</div>
                                <div style={{ fontSize: 13, color: STUDIO.muted }}>{activePerson.peran}</div>
                            </div>
                            {/* Dot indicators */}
                            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                                {people.map((_, i) => (
                                    <button key={i} onClick={() => setSelected(i)} style={{
                                        width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer",
                                        background: i === selected ? STUDIO.yellow : STUDIO.muted,
                                        padding: 0, transition: "background 0.18s",
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @media (max-width: 900px) {
                    .bb-bento { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
