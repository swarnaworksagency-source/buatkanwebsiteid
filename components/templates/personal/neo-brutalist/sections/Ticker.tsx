import { BRUT, type SectionProps } from "../types";

export default function Ticker({ layanan }: SectionProps) {
    const items = (layanan && layanan.length >= 3)
        ? layanan.slice(0, 4).map(l => l.nama.toUpperCase())
        : ["BRANDING", "GRAPHIC DESIGN", "WEB DESIGN", "DIGITAL MARKETING"];

    // Duplicate the track so the marquee loops seamlessly.
    const track = [...items, ...items, ...items];

    return (
        <section style={{
            background: BRUT.lime, borderTop: BRUT.borderThick, borderBottom: BRUT.borderThick,
            overflow: "hidden", padding: "16px 0",
            marginTop: "clamp(-60px, -4.5vh, -28px)",
            position: "relative", zIndex: 1,
        }}>
            <div className="nb-marquee" style={{ display: "flex", width: "max-content", whiteSpace: "nowrap" }}>
                {track.map((t, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 28, paddingRight: 28 }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: BRUT.black, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{t}</span>
                        <span style={{ fontSize: 18, color: BRUT.black }}>✦</span>
                    </span>
                ))}
            </div>
            <style>{`
                .nb-marquee { animation: nb-scroll 22s linear infinite; }
                @keyframes nb-scroll { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
                @media (prefers-reduced-motion: reduce) { .nb-marquee { animation: none; } }
            `}</style>
        </section>
    );
}
