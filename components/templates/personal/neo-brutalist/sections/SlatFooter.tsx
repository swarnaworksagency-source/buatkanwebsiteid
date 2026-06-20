import { BRUT, type SectionProps } from "../types";

export default function SlatFooter({ footer }: SectionProps) {
    const phrase = (footer?.tagline && footer.tagline.length > 6
        ? footer.tagline
        : "We are creators, innovators, and storytellers").toUpperCase();

    return (
        <section style={{ background: BRUT.black, padding: "72px 32px", borderTop: BRUT.borderThick }}>
            <div style={{ maxWidth: 1320, margin: "0 auto", width: "100%" }}>
                <h2 style={{
                    fontSize: "clamp(34px, 7cqw, 110px)", fontWeight: 900, color: BRUT.white,
                    lineHeight: 0.9, letterSpacing: "-0.04em", margin: 0, textTransform: "uppercase",
                }}>
                    {phrase.split(",").map((part, i, arr) => (
                        <span key={i}>
                            <span style={{ color: i % 2 === 1 ? BRUT.lime : BRUT.white }}>{part.trim()}</span>
                            {i < arr.length - 1 && <span style={{ color: BRUT.lime }}>, </span>}
                        </span>
                    ))}
                </h2>
            </div>
        </section>
    );
}
