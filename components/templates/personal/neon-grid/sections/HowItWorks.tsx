import { NEON, type SectionProps } from "../types";

const GENERIC_STEPS = [
    { title: "Konsultasi & Brief", desc: "Diskusi kebutuhan, tujuan, dan ekspektasi proyek Anda secara detail." },
    { title: "Konsep & Strategi", desc: "Menyusun arah visual dan strategi yang sesuai dengan brand Anda." },
    { title: "Eksekusi & Produksi", desc: "Pengerjaan dengan standar kualitas tinggi dan perhatian pada detail." },
    { title: "Revisi & Penyempurnaan", desc: "Penyesuaian berdasarkan feedback hingga hasil sesuai harapan." },
    { title: "Serah Terima & Dukungan", desc: "Pengiriman hasil akhir lengkap dengan dukungan setelahnya." },
];

const BG_GLOW = "radial-gradient(ellipse 60% 55% at 15% 50%, rgba(163,230,53,0.05) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 85% 20%, rgba(163,230,53,0.03) 0%, transparent 60%)";

export default function HowItWorks({ caraKerja, caraKerjaTitle, layanan, about, name }: SectionProps) {
    let steps: Array<{ title: string; desc: string }>;
    if (caraKerja && caraKerja.length > 0) {
        steps = caraKerja.map(s => ({ title: s.title, desc: s.desc }));
    } else if (layanan && layanan.length > 0) {
        steps = layanan.map(s => ({ title: s.nama, desc: s.deskripsi }));
    } else {
        steps = GENERIC_STEPS;
    }
    while (steps.length < 5) steps.push(GENERIC_STEPS[steps.length] ?? GENERIC_STEPS[0]);

    // Show 3 cards (bottom row of original layout: steps 2, 3, 4)
    const visibleSteps = steps.slice(2, 5);

    const introText = about?.deskripsi
        || `${name.split(" ")[0]} bekerja lewat proses yang jelas dan terukur — dari ide awal hingga hasil akhir.`;

    return (
        <section id="proses" style={{
            backgroundColor: NEON.bg,
            backgroundImage: BG_GLOW,
            padding: "96px 36px 60px", minHeight: "100vh", display: "flex", alignItems: "center",
        }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
                {/* Header — centered */}
                <div style={{ textAlign: "center", marginBottom: 56 }}>
                    <h2 style={{ fontSize: "clamp(26px, 3.4vw, 40px)", fontWeight: 800, letterSpacing: "-0.035em", color: "#fff", margin: "0 auto 20px", lineHeight: 1.05 }}>
                        {caraKerjaTitle || `Who is ${name.split(" ")[0]}`}
                    </h2>
                    <p style={{ fontSize: 16, lineHeight: 1.7, color: NEON.body, fontWeight: 500, margin: "0 auto", maxWidth: 560, textAlign: "center" }}>
                        {introText.length > 200 ? introText.slice(0, 200) + "…" : introText}
                    </p>
                </div>

                {/* 3 cards — uniform height */}
                <div className="ng-hiw-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "stretch" }}>
                    {visibleSteps.map((step, i) => (
                        <div key={i} style={{
                            background: NEON.card,
                            border: `1px solid ${NEON.hairline}`, borderRadius: NEON.md,
                            padding: "28px 26px",
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: NEON.lime, marginBottom: 14, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
                                {`Part ${i + 1}`}
                            </div>
                            <h4 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                                {step.title}
                            </h4>
                            <p style={{ fontSize: 14, lineHeight: 1.65, color: NEON.body, margin: 0, textAlign: "justify" }}>
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .ng-hiw-grid { grid-template-columns: 1fr 1fr !important; }
                }
                @media (max-width: 560px) {
                    .ng-hiw-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
