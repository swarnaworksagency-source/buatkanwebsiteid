import { Hexagon } from "lucide-react";
import { STUDIO, type SectionProps } from "../types";

export default function TrustBar({ testimonialPlaceholder }: SectionProps) {
    const fromClients = (testimonialPlaceholder || [])
        .map(t => t?.nama)
        .filter(Boolean)
        .slice(0, 4) as string[];
    const brands = fromClients.length >= 2
        ? fromClients
        : ["Supa Blox", "Hype Blox", "Frame Blox", "Ultra Blox"];

    return (
        <section style={{ background: STUDIO.bg, padding: "40px 36px" }}>
            <div className="bb-trust" style={{
                maxWidth: 1280, margin: "0 auto", width: "100%",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 32, flexWrap: "wrap",
                borderTop: `1px solid ${STUDIO.hairline}`, borderBottom: `1px solid ${STUDIO.hairline}`,
                padding: "26px 0",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 38, flexWrap: "wrap" }}>
                    {brands.map((b, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <Hexagon size={18} style={{ color: "#fff" }} />
                            <span style={{ fontSize: 17, fontWeight: 700, color: STUDIO.ink, letterSpacing: "-0.02em" }}>{b}</span>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`@media (max-width: 700px) { .bb-trust > div { gap: 22px !important; } }`}</style>
        </section>
    );
}
