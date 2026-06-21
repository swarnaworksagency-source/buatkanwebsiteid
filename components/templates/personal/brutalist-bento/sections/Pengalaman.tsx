"use client";

import { useState } from "react";
import { STUDIO, type SectionProps } from "../types";
import { PENGALAMAN_PLACEHOLDER as PLACEHOLDER } from "../../pengalamanPlaceholder";

const BG_LAYERS = "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(255,204,0,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 20% 65%, rgba(255,59,48,0.05) 0%, transparent 70%), radial-gradient(rgba(255,255,255,0.07) 1.4px, transparent 1.4px)";
const BG_SIZES = "100% 100%, 100% 100%, 28px 28px";

const TABS = [
    { label: "Pekerjaan / Project", key: "pekerjaan" },
    { label: "Kompetisi", key: "kompetisi" },
    { label: "Organisasi", key: "organisasi" },
];

export default function Pengalaman({ pengalaman }: SectionProps) {
    const [activeTab, setActiveTab] = useState(0);
    // Pakai data user (dari form). Kalau kosong → placeholder biar preview tak hampa.
    const userItems = pengalaman || [];
    const hasUser = userItems.length > 0;
    const items = hasUser
        ? userItems.filter((p) => p.kategori === TABS[activeTab].key)
        : PLACEHOLDER[TABS[activeTab].key];

    return (
        <section id="pengalaman" className="bb-exp-sec" style={{
            backgroundColor: STUDIO.bg, backgroundImage: BG_LAYERS, backgroundSize: BG_SIZES,
            padding: "40px 36px", height: "100vh", boxSizing: "border-box",
            display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden",
        }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: STUDIO.amber, letterSpacing: "0.05em", textTransform: "uppercase" as const, display: "block", marginBottom: 10 }}>
                        Track Record
                    </span>
                    <h2 style={{ fontSize: "clamp(28px, 3.6vw, 46px)", fontWeight: 800, color: STUDIO.ink, margin: 0, letterSpacing: "-0.04em", lineHeight: 1 }}>
                        Pengalaman
                    </h2>
                </div>

                {/* Tab buttons */}
                <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                    {TABS.map((tab, i) => {
                        const isActive = i === activeTab;
                        return (
                            <button key={tab.key} onClick={() => setActiveTab(i)} style={{
                                padding: "10px 22px", borderRadius: STUDIO.full, cursor: "pointer",
                                background: isActive ? STUDIO.yellow : STUDIO.card,
                                color: isActive ? "#0b0b0c" : STUDIO.body,
                                fontSize: 14, fontWeight: 700,
                                border: isActive ? "none" : `1px solid ${STUDIO.hairline}` as any,
                                transition: "background 0.18s, color 0.18s",
                            }}>
                                {i + 1}. {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content card */}
                <div style={{
                    background: STUDIO.card, border: `1px solid ${STUDIO.hairline}`,
                    borderRadius: STUDIO.xl, padding: "36px 32px",
                    display: "flex", flexDirection: "column", gap: 0,
                }}>
                    {items.length === 0 && (
                        <p style={{ fontSize: 14, color: STUDIO.muted, margin: 0, padding: "8px 0" }}>Belum ada di kategori ini.</p>
                    )}
                    {items.map((item, i) => (
                        <div key={i} className="bb-exp-row" style={{
                            display: "grid", gridTemplateColumns: "160px 1fr", gap: 24,
                            padding: "20px 0",
                            borderBottom: i < items.length - 1 ? `1px solid ${STUDIO.hairlineSoft}` : "none",
                            alignItems: "start",
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: STUDIO.muted, letterSpacing: "0.01em" }}>
                                {item.tahun}
                            </span>
                            <div>
                                <div style={{ fontSize: "clamp(16px, 1.6vw, 20px)", fontWeight: 700, color: STUDIO.ink, marginBottom: 6, letterSpacing: "-0.02em" }}>
                                    {item.judul}
                                </div>
                                <p style={{ fontSize: 14, color: STUDIO.body, lineHeight: 1.65, margin: 0 }}>
                                    {item.deskripsi}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    /* Lepas tinggi tetap 100vh + stack kolom tahun/judul biar tidak sempit & terpotong. */
                    .bb-exp-sec { height: auto !important; overflow: visible !important; justify-content: flex-start !important; padding: 40px 18px !important; }
                    .bb-exp-row { grid-template-columns: 1fr !important; gap: 6px !important; }
                }
            `}</style>
        </section>
    );
}
