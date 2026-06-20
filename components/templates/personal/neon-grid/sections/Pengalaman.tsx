"use client";

import { useState } from "react";
import { NEON, type SectionProps } from "../types";

const TABS = [
    { label: "Project / Intern / Work", key: "pekerjaan" },
    { label: "Competition", key: "kompetisi" },
    { label: "Organisasi / Volunteer", key: "organisasi" },
];

const PLACEHOLDER: Record<string, Array<{ tahun: string; judul: string; deskripsi: string }>> = {
    pekerjaan: [
        { tahun: "2023 – Sekarang", judul: "UI/UX Designer — Freelance", deskripsi: "Merancang antarmuka untuk klien startup dan UMKM, mulai dari wireframe hingga prototype siap handoff." },
        { tahun: "2022 – 2023", judul: "Frontend Developer — PT. XYZ", deskripsi: "Membangun aplikasi web berbasis React & Next.js, berkolaborasi dengan tim desain dan backend." },
        { tahun: "2021 – 2022", judul: "Junior Designer — Agensi Kreatif", deskripsi: "Mengerjakan aset visual, landing page, dan identitas brand untuk berbagai klien." },
    ],
    kompetisi: [
        { tahun: "2024", judul: "Juara 1 — Inkubator UNY", deskripsi: "Memenangkan kompetisi inkubator bisnis dengan platform BuatkanWeb.id." },
        { tahun: "2023", judul: "Finalis — Hackathon Nasional", deskripsi: "Masuk final dari 200+ tim dengan solusi digitalisasi UMKM berbasis AI." },
        { tahun: "2022", judul: "Top 10 — UI/UX Design Challenge", deskripsi: "Desain aplikasi kesehatan digital yang meraih penilaian tinggi dari juri industri." },
    ],
    organisasi: [
        { tahun: "2023 – Sekarang", judul: "Ketua — Komunitas Desainer Yogyakarta", deskripsi: "Menginisiasi dan memimpin komunitas desainer lokal dengan 200+ anggota aktif." },
        { tahun: "2022 – 2023", judul: "Divisi Kreatif — BEM Fakultas", deskripsi: "Bertanggung jawab atas identitas visual dan komunikasi kreatif organisasi mahasiswa." },
        { tahun: "2021 – 2022", judul: "Koordinator — UKM Fotografi", deskripsi: "Mengelola kegiatan dan dokumentasi visual unit kegiatan mahasiswa fotografi." },
    ],
};

const BG_GLOW = "radial-gradient(ellipse 55% 60% at 75% 50%, rgba(163,230,53,0.04) 0%, transparent 65%)";

export default function Pengalaman({ fotoBisnis, portofolio }: SectionProps) {
    const [activeTab, setActiveTab] = useState(0);
    const items = PLACEHOLDER[TABS[activeTab].key];

    return (
        <section id="pengalaman" style={{
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
                        {items.map((item, i) => (
                            <div key={`${activeTab}-${i}`} style={{
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

            {/* Photos strip */}
            {(fotoBisnis && fotoBisnis.length > 0) && (
                <div style={{ maxWidth: 1280, margin: "48px auto 0", width: "100%" }}>
                    <div className="ng-exp-photos" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                        {[
                            fotoBisnis?.[4] || fotoBisnis?.[0] || "",
                            fotoBisnis?.[1] || "",
                            fotoBisnis?.[2] || "",
                            fotoBisnis?.[3] || "",
                        ].filter(Boolean).map((img, i) => (
                            <div key={i} style={{ borderRadius: NEON.lg, overflow: "hidden", border: `1px solid ${NEON.hairline}`, aspectRatio: "4 / 3", background: NEON.card }}>
                                <img src={img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
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
                @media (max-width: 560px) {
                    .ng-exp-photos { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
