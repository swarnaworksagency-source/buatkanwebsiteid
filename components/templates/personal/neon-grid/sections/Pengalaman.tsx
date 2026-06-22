"use client";

import { useState } from "react";
import { EditableImage } from "../../neo-brutalist/EditableImage";
import { NEON, type SectionProps } from "../types";
import { PENGALAMAN_PLACEHOLDER as PLACEHOLDER } from "../../pengalamanPlaceholder";

const TABS = [
    { label: "Project / Intern / Work", key: "pekerjaan" },
    { label: "Competition", key: "kompetisi" },
    { label: "Organisasi / Volunteer", key: "organisasi" },
];

const BG_GLOW = "radial-gradient(ellipse 55% 60% at 75% 50%, color-mix(in srgb, var(--ng-accent, #a3e635) 4%, transparent) 0%, transparent 65%)";

export default function Pengalaman({ fotoBisnis, portofolio, isEditMode, imgPos, setImgPos, pengalaman }: SectionProps) {
    const [activeTab, setActiveTab] = useState(0);
    // Pakai data user (dari form). Kalau kosong → placeholder biar preview tak hampa.
    const userItems = pengalaman || [];
    const hasUser = userItems.length > 0;
    const items = hasUser
        ? userItems.filter((p) => p.kategori === TABS[activeTab].key)
        : PLACEHOLDER[TABS[activeTab].key];

    // Foto strip = HANYA foto galeri yang user isi (fotoBisnis[1..4]), tanpa fallback ke foto hero.
    // 3 input → 3 tampil; strip dipusatkan (lihat maxWidth + margin auto di bawah).
    const expPhotos = [fotoBisnis?.[1], fotoBisnis?.[2], fotoBisnis?.[3], fotoBisnis?.[4]].filter(Boolean) as string[];

    return (
        <section id="pengalaman" className="ng-exp-sec" style={{
            backgroundColor: NEON.bg, backgroundImage: BG_GLOW,
            padding: "96px 36px 64px", minHeight: "100vh",
            display: "flex", flexDirection: "column", justifyContent: "flex-start",
        }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>

                {/* Top row: title left, active tab label right */}
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
                    <h2 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-0.045em", color: "#fff", margin: 0, lineHeight: 1 }}>
                        Experience
                    </h2>
                    <span style={{ fontSize: 13, fontWeight: 700, color: NEON.lime, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
                        {TABS[activeTab].label}
                    </span>
                </div>

                {/* Two-col: left = tabs, right = content */}
                <div className="ng-exp-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 48 }}>

                    {/* Left: vertical tab buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {TABS.map((tab, i) => {
                            const isActive = i === activeTab;
                            return (
                                <button key={tab.key} onClick={() => setActiveTab(i)} style={{
                                    display: "flex", alignItems: "center", gap: 16,
                                    padding: "16px 20px",
                                    background: isActive ? NEON.card : "transparent",
                                    border: "none",
                                    borderLeft: isActive ? `3px solid ${NEON.lime}` : "3px solid transparent",
                                    borderRadius: `0 ${NEON.sm}px ${NEON.sm}px 0`,
                                    cursor: "pointer", textAlign: "left" as const,
                                    transition: "all 0.18s",
                                }}>
                                    <span style={{
                                        fontSize: 11, fontWeight: 800, color: isActive ? NEON.lime : NEON.muted,
                                        letterSpacing: "0.06em", minWidth: 24,
                                    }}>
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: isActive ? "#fff" : NEON.body, lineHeight: 1.3 }}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right: content list */}
                    <div>
                        {items.length === 0 && (
                            <p style={{ fontSize: 14, color: NEON.muted, margin: 0, padding: "8px 0" }}>Belum ada di kategori ini.</p>
                        )}
                        {items.map((item, i) => (
                            <div key={`${activeTab}-${i}`} className="ng-exp-row" style={{
                                display: "grid", gridTemplateColumns: "140px 1fr", gap: 32,
                                padding: "28px 0",
                                borderBottom: i < items.length - 1 ? `1px solid ${NEON.hairline}` : "none",
                                alignItems: "start",
                            }}>
                                {/* Year */}
                                <div>
                                    <span style={{
                                        fontSize: 12, fontWeight: 800, color: NEON.lime,
                                        letterSpacing: "0.04em", textTransform: "uppercase" as const,
                                        display: "block", marginBottom: 4,
                                    }}>
                                        {`${String(i + 1).padStart(2, "0")}.`}
                                    </span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: NEON.muted }}>
                                        {item.tahun}
                                    </span>
                                </div>
                                {/* Title + desc */}
                                <div>
                                    <h3 style={{ fontSize: "clamp(17px, 1.8vw, 22px)", fontWeight: 700, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.025em" }}>
                                        {item.judul}
                                    </h3>
                                    <p style={{ fontSize: 14, color: NEON.body, lineHeight: 1.65, margin: 0 }}>
                                        {item.deskripsi}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Photos strip — hanya foto yang diisi, jumlah kolom = jumlah foto, dipusatkan. */}
            {expPhotos.length > 0 && (
                <div style={{ maxWidth: 1280, margin: "48px auto 0", width: "100%" }}>
                    <div className="ng-exp-photos" style={{ display: "grid", gridTemplateColumns: `repeat(${expPhotos.length}, 1fr)`, gap: 16, maxWidth: expPhotos.length * 312, marginInline: "auto" }}>
                        {expPhotos.map((img, i) => (
                            <div key={i} style={{ borderRadius: NEON.lg, overflow: "hidden", border: `1px solid ${NEON.hairline}`, aspectRatio: "4 / 3", background: NEON.card }}>
                                <EditableImage src={img} alt="" mode="box" isEditMode={isEditMode} pos={imgPos(`exp-${i + 1}`)} onChange={(np) => setImgPos(`exp-${i + 1}`, np)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 900px) {
                    .ng-exp-layout { grid-template-columns: 1fr !important; gap: 24px !important; }
                    .ng-exp-photos { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 768px) {
                    .ng-exp-sec { min-height: auto !important; padding: 56px 18px !important; }
                    .ng-exp-row { grid-template-columns: 1fr !important; gap: 8px !important; }
                }
                @media (max-width: 560px) {
                    .ng-exp-photos { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
