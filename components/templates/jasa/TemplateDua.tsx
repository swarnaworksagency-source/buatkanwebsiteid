"use client";

import { useState, useEffect } from "react";
import type { TemplateData } from "@/types";
import { EditableText } from "@/components/ui/EditableText";
import { useTemplateEditor } from "./useTemplateEditor";
import { SaveBar, Toast, EditBanner, Lightbox, Stars } from "./TemplateShared";
import { ArrowRight, ArrowUpRight, Sparkle, Menu, X, Phone, MapPin, Monitor, Smartphone, PenTool, Layers, Camera, Wrench } from "lucide-react";

const DEFAULT_CARA_KERJA = [
  { step: "01", title: "Konsultasi", desc: "Ceritakan kebutuhan Anda lewat WhatsApp, gratis tanpa biaya." },
  { step: "02", title: "Penawaran", desc: "Kami susun solusi dan estimasi yang jelas sejak awal." },
  { step: "03", title: "Pengerjaan", desc: "Tim kami mengerjakan dengan teliti dan tepat waktu." },
  { step: "04", title: "Selesai", desc: "Hasil rapi, sesuai harapan, dan siap Anda gunakan." },
];

const SERVICE_ICONS = [Monitor, Smartphone, PenTool, Layers, Camera, Wrench];

// Default hero background (office team) — shown in preview; replaced when user uploads foto.
const DEFAULT_HERO_IMG = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80";

// Default collage photos for About — preview only; replaced by user's foto/portofolio.
const DEFAULT_COLLAGE = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
];

// Watermark — oversized outline-only typography behind section content.
function Watermark({ text, className, stroke }: { text: string; className: string; stroke: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none select-none absolute font-black uppercase leading-none whitespace-nowrap z-0 ${className}`}
      style={{ WebkitTextStroke: `1.5px ${stroke}`, color: "transparent" }}
    >
      {text}
    </span>
  );
}

// Infinite royal-blue marquee strip with sparkle separators.
function Marquee({ items, color }: { items: string[]; color: string }) {
  const list = items.length > 0 ? items : ["Pelayanan Profesional", "Hasil Terjamin", "Harga Bersahabat"];
  const Row = () => (
    <div className="flex items-center shrink-0">
      {list.map((it, i) => (
        <span key={i} className="flex items-center gap-7 pr-7 text-white font-semibold text-[14px] tracking-wide">
          {it}
          <Sparkle className="w-4 h-4 fill-white" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative overflow-hidden py-3.5" style={{ backgroundColor: color }}>
      <div className="flex w-max animate-[jasaMarquee_28s_linear_infinite]">
        <Row />
        <Row />
      </div>
    </div>
  );
}

interface Props extends Partial<TemplateData> {
  forceMobile?: boolean;
  isEditable?: boolean;
  isEditMode?: boolean;
  onContentUpdate?: (content: Partial<TemplateData>) => void;
  websiteId?: string;
}

export default function TemplateDua(props: Props) {
  const {
    hero = { headline: "Solusi Tepat untuk Setiap Kebutuhan Anda", subheadline: "Kami menggabungkan pengalaman dan ketelitian untuk memberi hasil yang bisa Anda andalkan, tanpa janji berlebihan.", ctaText: "Hubungi Kami" },
    about = { judul: "Mewujudkan Kebutuhan Jadi Kenyataan", deskripsi: "Sudah bertahun-tahun kami melayani warga di sekitar dengan satu prinsip sederhana: kerjakan dengan baik dan perlakukan setiap pelanggan seperti keluarga sendiri.", keunggulan: ["5+|Tahun Pengalaman", "500+|Pelanggan Puas", "100%|Sepenuh Hati"] },
    layanan = [],
    targetPelanggan = { deskripsi: "", painPoint: "", solusi: "" },
    testimonialPlaceholder = [],
    footer = { tagline: "Siap membantu kebutuhan Anda.", ctaText: "Hubungi Kami" },
    namaBisnis = "Nama Usaha",
    namaPanggilan = "",
    lokasi = "",
    kontak = { wa: "", telepon: "", email: "" },
    sosmed = { instagram: "", tiktok: "", twitter: "" },
    warna = { primary: "#2563EB", tema: "light" },
    paketHarga = [],
    logo = "",
    fotoBisnis = [],
    portofolio = [],
    caraKerja = DEFAULT_CARA_KERJA,
    caraKerjaTitle = "Cara Kerja Kami yang Teruji",
    forceMobile,
    isEditable = false,
    isEditMode = false,
    onContentUpdate,
    websiteId,
  } = props;

  const em = isEditMode;
  const { s, patch, hasChanges, saving, toast, handleSave } = useTemplateEditor({
    namaBisnis, hero, about, layanan, caraKerja, caraKerjaTitle,
    testimonials: testimonialPlaceholder, paketHarga, footer,
    isEditMode: em, onContentUpdate, websiteId,
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Navbar ikut scroll: transparan di atas hero, solid navy saat di-scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isMob = forceMobile === true;
  const isDesk = forceMobile === false;

  // Palet dikunci sesuai contoh gambar (royal blue + navy + putih), tidak ikut warna.primary/tema.
  const isDark = false;
  const navy = "#0B132B";
  const pc = "#2563EB";
  const page = isDark ? "bg-[#070b16]" : "bg-[#F1F3F7]";
  const canvas = isDark ? "bg-[#0a1020]" : "bg-white";
  const altGray = isDark ? "bg-[#0e1730]" : "bg-[#F3F4F6]";
  const ink = isDark ? "text-white" : "text-[#0B132B]";
  const inkHex = isDark ? "#ffffff" : "#0B132B";
  const muted = isDark ? "text-[#9aa6bd]" : "text-[#5b6472]";
  const line = isDark ? "border-[#1e293b]" : "border-[#e5e7eb]";
  const cardBg = isDark ? "bg-[#111a30]" : "bg-white";
  const wmStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(11,19,43,0.045)";

  const waLink = `https://wa.me/${kontak.wa}?text=Halo,%20saya%20tertarik%20dengan%20layanan%20Anda.`;
  const photos = fotoBisnis || [];
  const gallery = portofolio || [];
  const plans = paketHarga && paketHarga.length > 0 ? paketHarga : [];
  const collageSrc = [...photos, ...gallery];
  const collage = (collageSrc.length > 0 ? collageSrc : DEFAULT_COLLAGE).slice(0, 4);
  while (collage.length < 4) collage.push(DEFAULT_COLLAGE[collage.length % DEFAULT_COLLAGE.length]);

  const marqueeItems = s.layanan.length > 0 ? s.layanan.map((l) => l.nama) : [];

  // Stats parsed from keunggulan, format "value|label".
  const stats = s.aboutKeunggulan.slice(0, 3).map((k) => {
    const idx = k.indexOf("|");
    return idx >= 0 ? { val: k.slice(0, idx).trim(), label: k.slice(idx + 1).trim() } : { val: k.trim(), label: "" };
  });

  const navItems = [
    { label: "Tentang", href: "#tentang" },
    s.layanan.length > 0 && { label: "Layanan", href: "#layanan" },
    gallery.length > 0 && { label: "Galeri", href: "#galeri" },
    plans.length > 0 && { label: "Harga", href: "#harga" },
    s.testimonials.length > 0 && { label: "Testimoni", href: "#testimoni" },
  ].filter(Boolean) as { label: string; href: string }[];

  const px = isMob ? "px-5" : isDesk ? "px-8 lg:px-12 xl:px-16" : "px-5 sm:px-8 lg:px-12 xl:px-16";
  const Kicker = ({ children, light }: { children: string; light?: boolean }) => (
    <p className="font-semibold text-[12px] tracking-[0.18em] uppercase mb-5" style={{ color: light ? "#93b4fb" : pc }}>
      {`// ${children}`}
    </p>
  );

  // Dual-tone heading: first word in ink, remainder in accent (view mode); plain editable in edit mode.
  const DualHeading = (value: string, onChange: (v: string) => void, cls: string) => {
    if (em) return <EditableText value={value} onChange={onChange} isEditMode={em} as="h2" className={`${cls} ${ink}`} />;
    const w = value.split(" ");
    const first = w[0] ?? "";
    const rest = w.slice(1).join(" ");
    return (
      <h2 className={cls}>
        <span style={{ color: inkHex }}>{first}</span>
        {rest && <span style={{ color: pc }}> {rest}</span>}
      </h2>
    );
  };

  const collageCellCls = ["rounded-2xl rounded-tl-[56px]", "rounded-2xl", "rounded-2xl", "rounded-2xl"];

  return (
    <div
      className={`min-h-full ${page} ${ink} font-sans relative`}
      style={em ? { border: "2px solid #f59e0b", borderRadius: "8px" } : undefined}
      onClickCapture={(e) => {
        if (em) {
          const t = e.target as HTMLElement;
          if (!t.closest('[data-editable="true"]')) { e.preventDefault(); e.stopPropagation(); }
        }
      }}
    >
      <style>{`@keyframes jasaMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <EditBanner show={em} />

      {/* Navbar — fixed, transparan di atas hero lalu solid saat scroll */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${scrolled ? "bg-[#0B132B]/95 backdrop-blur shadow-[0_4px_20px_-6px_rgba(0,0,0,0.35)]" : "bg-transparent"}`}>
        <div className={`w-full ${px} py-5 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            {logo ? (
              <img src={logo} alt={namaBisnis} className="w-9 h-9 rounded-xl object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: pc }}>
                <span className="text-white font-bold text-[15px]">{namaBisnis.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <EditableText value={s.namaBisnis} onChange={(v) => patch({ namaBisnis: v })} isEditMode={em} as="span" className={`font-bold tracking-tight text-white ${isMob ? "text-[16px]" : "text-[18px]"} truncate max-w-[160px] md:max-w-xs`} />
          </div>

          {!isMob && (
            <div className={`${isDesk ? "flex" : "hidden md:flex"} items-center gap-7 text-[14px] font-medium text-white/80`}>
              {navItems.map((n) => (
                <a key={n.label} href={n.href} className="hover:text-white transition-colors">{n.label}</a>
              ))}
            </div>
          )}

          {!isMob && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`${isDesk ? "inline-flex" : "hidden md:inline-flex"} items-center gap-2 text-white text-[14px] font-semibold px-5 py-2.5 rounded-full shadow-[0_10px_24px_-6px_rgba(37,99,235,0.7)]`} style={{ backgroundColor: pc }}>
              Hubungi Kami <ArrowUpRight className="w-4 h-4" />
            </a>
          )}

          {(isMob || forceMobile === undefined) && (
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className={`${isDesk ? "hidden" : isMob ? "block" : "md:hidden"} p-1.5`}>
              {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          )}
        </div>
        {menuOpen && (isMob || forceMobile === undefined) && (
          <div className={`${isDesk ? "hidden" : isMob ? "block" : "md:hidden"} border-t border-white/10 px-5 py-4 space-y-1`} style={{ backgroundColor: navy }}>
            {navItems.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)} className="block py-2 text-[14px] text-white/80">{n.label}</a>
            ))}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between mt-3 text-white text-[14px] font-semibold px-4 py-3 rounded-full" style={{ backgroundColor: pc }}>
              Hubungi Kami <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </nav>

      {/* Hero — full-bleed, marquee flush at bottom edge */}
      <section className="relative overflow-hidden" style={{ backgroundColor: navy }}>
        <img src={photos[0] || DEFAULT_HERO_IMG} alt={namaBisnis} className="absolute inset-0 w-full h-full object-cover object-[75%_center]" loading="lazy" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${navy} 0%, ${navy} 28%, ${navy}eb 48%, ${navy}b3 66%, ${navy}59 86%, ${navy}33 100%)` }} />
        <div className={`relative z-10 ${px} ${isMob ? "py-16 min-h-[62vh]" : "py-28 min-h-[88vh]"} flex flex-col justify-center`}>
            <div className={isMob ? "" : "max-w-[58%]"}>
              <EditableText value={s.heroHeadline} onChange={(v) => patch({ heroHeadline: v })} isEditMode={em} as="h1" className={`font-extrabold tracking-tight leading-[1.08] text-white ${isMob ? "text-[36px]" : isDesk ? "text-[56px]" : "text-[36px] md:text-[56px]"}`} />
              <EditableText value={s.heroSub} onChange={(v) => patch({ heroSub: v })} isEditMode={em} as="p" multiline className={`text-white/65 leading-relaxed mt-6 max-w-md ${isMob ? "text-[15px]" : "text-[16px]"}`} />
              <div className={`mt-9 flex ${isMob ? "flex-col" : "flex-row items-center"} gap-5`}>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 text-white px-7 py-3.5 rounded-full text-[15px] font-semibold ${isMob ? "w-full" : ""}`} style={{ backgroundColor: pc }}>
                  <EditableText value={s.heroCta || "Hubungi Kami"} onChange={(v) => patch({ heroCta: v })} isEditMode={em} /> <ArrowRight className="w-4 h-4" />
                </a>
                {navItems.find((n) => n.label === "Layanan") && (
                  <a href="#layanan" className="inline-flex items-center gap-1.5 text-white text-[14px] font-medium underline underline-offset-4 decoration-white/40">Lihat Semua Layanan</a>
                )}
              </div>
            </div>
          </div>
      </section>

      <Marquee items={marqueeItems} color={pc} />

      {/* About — collage + stats + watermark */}
      <section id="tentang" className={`relative overflow-hidden ${canvas}`}>
        <Watermark text="Tentang" className={`top-16 right-0 ${isMob ? "text-[72px]" : "text-[170px]"}`} stroke={wmStroke} />
        <div className={`relative z-10 w-full ${px} ${isMob ? "py-16" : "py-24"}`}>
          <div className={`grid ${isMob ? "grid-cols-1 gap-14" : "grid-cols-2 gap-16 items-center"}`}>
            {/* Left: asymmetric collage */}
            <div className="relative">
              {/* navy curved accent behind bottom-right */}
              <div className="absolute -bottom-5 -right-5 w-44 h-44 rounded-[3rem] rounded-tr-[5rem] z-0" style={{ backgroundColor: navy }} />
              {/* sparkles */}
              <Sparkle className="absolute -bottom-2 left-6 w-5 h-5 z-20" style={{ color: pc, fill: pc }} />
              <Sparkle className="absolute bottom-8 left-0 w-3.5 h-3.5 z-20" style={{ color: pc, fill: pc }} />
              <div className={`relative z-10 grid grid-cols-2 grid-rows-[1.35fr_1fr] gap-3 ${isMob ? "h-[360px]" : "h-[470px]"}`}>
                {collage.map((src, i) => (
                  <div key={i} className={`relative overflow-hidden ${collageCellCls[i]}`} style={{ backgroundColor: `${pc}1f` }}>
                    {src ? (
                      <img src={src} alt={`${namaBisnis} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${pc}22, ${pc}0d)` }}>
                        <span className="font-black text-[34px]" style={{ color: `${pc}55` }}>{namaBisnis.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                ))}
                {/* Center seal badge */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-full flex items-center justify-center ${isMob ? "w-[72px] h-[72px]" : "w-24 h-24"}`} style={{ backgroundColor: pc, boxShadow: `0 0 0 6px ${isDark ? "#0a1020" : "#ffffff"}` }}>
                  <div className="rounded-full border-2 border-white/40 w-full h-full flex flex-col items-center justify-center text-white text-center">
                    <Sparkle className={isMob ? "w-4 h-4 fill-white" : "w-5 h-5 fill-white"} />
                    <span className={`font-bold uppercase tracking-wider mt-0.5 ${isMob ? "text-[7px]" : "text-[9px]"}`}>Tepercaya</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: content + stats + signature */}
            <div>
              <Kicker>Tentang Kami</Kicker>
              {DualHeading(s.aboutJudul, (v) => patch({ aboutJudul: v }), `font-extrabold tracking-tight leading-[1.12] ${isMob ? "text-[28px]" : "text-[40px]"}`)}
              <EditableText value={s.aboutDeskripsi} onChange={(v) => patch({ aboutDeskripsi: v })} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed mt-5 ${isMob ? "text-[15px]" : "text-[16px]"}`} />
              <div className={`grid grid-cols-3 mt-10 border-t ${line} pt-7`}>
                {stats.map((st, i) => {
                  const numeric = /\d/.test(st.val) && st.val.length <= 7;
                  return (
                    <div key={i} className={`${i > 0 ? `border-l ${line} pl-5` : ""} ${i < 2 ? "pr-5" : ""}`}>
                      <EditableText
                        value={st.val}
                        onChange={(v) => { const a = [...s.aboutKeunggulan]; a[i] = `${v}|${st.label}`; patch({ aboutKeunggulan: a }); }}
                        isEditMode={em}
                        as="p"
                        className={`font-extrabold tracking-tight ${numeric ? (isMob ? "text-[28px]" : "text-[36px]") : "text-[18px]"}`}
                        style={{ color: pc }}
                      />
                      <EditableText
                        value={st.label}
                        onChange={(v) => { const a = [...s.aboutKeunggulan]; a[i] = `${st.val}|${v}`; patch({ aboutKeunggulan: a }); }}
                        isEditMode={em}
                        as="p"
                        className={`${muted} text-[12.5px] mt-1 leading-snug`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-8">
                <span className={`font-serif italic ${ink} ${isMob ? "text-[24px]" : "text-[30px]"}`}>{namaPanggilan || namaBisnis}</span>
                <p className={`${muted} text-[13px] mt-1`}>{namaBisnis} · Pemilik</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services — bento cards + watermark */}
      {s.layanan.length > 0 && (
        <section id="layanan" className={`relative overflow-hidden ${altGray}`}>
          <Watermark text="Layanan" className={`top-12 left-0 ${isMob ? "text-[72px]" : "text-[180px]"}`} stroke={wmStroke} />
          <div className={`relative z-10 w-full ${px} ${isMob ? "py-16" : "py-24"}`}>
            <div className={`flex ${isMob ? "flex-col gap-5" : "flex-row items-end justify-between"} mb-12`}>
              <div className="max-w-xl">
                <Kicker>Layanan Kami</Kicker>
                <h2 className={`font-extrabold tracking-tight leading-[1.15] ${isMob ? "text-[28px]" : "text-[38px]"}`}>
                  <span style={{ color: inkHex }}>Layanan yang Kami Sediakan </span>
                  <span style={{ color: pc }}>untuk Anda</span>
                </h2>
              </div>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white text-[14px] font-semibold px-5 py-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: pc }}>
                Konsultasi Gratis <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
            <div className={`grid gap-6 ${isMob ? "grid-cols-1" : s.layanan.length === 1 ? "grid-cols-1 max-w-md" : s.layanan.length === 2 ? "grid-cols-2 max-w-3xl" : "grid-cols-3"}`}>
              {s.layanan.map((l, i) => {
                const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
                return (
                  <div key={i} className={`${cardBg} rounded-2xl p-7 flex flex-col shadow-[0_8px_30px_-12px_rgba(11,19,43,0.12)] border-b-2 ${i === 0 ? "" : "border-b-transparent"}`} style={i === 0 ? { borderBottomColor: pc } : undefined}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: pc }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <EditableText value={l.nama} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], nama: v }; patch({ layanan: a }); }} isEditMode={em} as="h3" className={`font-bold ${ink} ${isMob ? "text-[19px]" : "text-[20px]"} mb-3`} />
                    <EditableText value={l.deskripsi} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], deskripsi: v }; patch({ layanan: a }); }} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed text-[14px] flex-1`} />
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold mt-6" style={{ color: pc }}>
                      Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Process — horizontal connected timeline + watermark */}
      <section className={`relative overflow-hidden ${canvas}`}>
        <Watermark text="Proses" className={`top-10 left-1/2 -translate-x-1/2 ${isMob ? "text-[72px]" : "text-[190px]"}`} stroke={wmStroke} />
        <div className={`relative z-10 w-full ${px} ${isMob ? "py-16" : "py-24"}`}>
          <div className="text-center mb-16 max-w-xl mx-auto">
            <Kicker>Cara Kerja Kami</Kicker>
            <EditableText value={s.caraKerjaTitle} onChange={(v) => patch({ caraKerjaTitle: v })} isEditMode={em} as="h2" className={`font-extrabold tracking-tight ${ink} ${isMob ? "text-[28px]" : "text-[38px]"}`} />
          </div>
          {(() => {
            const steps = s.caraKerja.slice(0, 4);
            return (
              <div className="relative">
                {!isMob && (
                  <div className={`absolute top-9 left-[14%] right-[14%] border-t-2 ${line} z-0`} />
                )}
                <div className={`relative z-10 grid ${isMob ? "grid-cols-1 gap-12" : steps.length === 3 ? "grid-cols-3" : "grid-cols-4"} gap-6`}>
                  {steps.map((ck, i) => {
                    const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
                    return (
                      <div key={i} className="flex flex-col items-center text-center">
                        <div className="relative mb-6">
                          <div className={`rounded-full flex items-center justify-center text-white ${isMob ? "w-16 h-16" : "w-[72px] h-[72px]"}`} style={{ backgroundColor: pc, boxShadow: `0 0 0 8px ${isDark ? "#0a1020" : "#ffffff"}` }}>
                            <Icon className={isMob ? "w-6 h-6" : "w-7 h-7"} />
                          </div>
                          <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: navy }}>
                            {ck.step}
                          </span>
                        </div>
                        <EditableText value={ck.title} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], title: v }; patch({ caraKerja: a }); }} isEditMode={em} as="h4" className={`font-bold mb-2 ${ink} text-[19px]`} />
                        <EditableText value={ck.desc} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], desc: v }; patch({ caraKerja: a }); }} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed text-[13.5px] max-w-[210px]`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Galeri */}
      {gallery.length > 0 && (
        <section id="galeri" className={`relative overflow-hidden ${altGray}`}>
          <Watermark text="Galeri" className={`top-10 right-0 ${isMob ? "text-[72px]" : "text-[180px]"}`} stroke={wmStroke} />
          <div className={`relative z-10 w-full ${px} ${isMob ? "py-16" : "py-24"}`}>
            <div className="mb-10">
              <Kicker>Hasil Kerja</Kicker>
              <h2 className={`font-extrabold tracking-tight ${ink} ${isMob ? "text-[28px]" : "text-[38px]"}`}>Galeri</h2>
            </div>
            <div className={`grid ${isMob ? "grid-cols-2 gap-3" : "grid-cols-3 gap-4"}`}>
              {gallery.map((src, i) => (
                <button key={i} type="button" onClick={() => setLightbox(i)} className="overflow-hidden rounded-2xl aspect-square cursor-pointer group">
                  <img src={src} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Harga */}
      {plans.length > 0 && (
        <section id="harga" className={`relative overflow-hidden ${canvas}`}>
          <Watermark text="Harga" className={`top-10 left-0 ${isMob ? "text-[72px]" : "text-[180px]"}`} stroke={wmStroke} />
          <div className={`relative z-10 w-full ${px} ${isMob ? "py-16" : "py-24"}`}>
            <div className="text-center mb-12">
              <Kicker>Pilihan Paket</Kicker>
              <h2 className={`font-extrabold tracking-tight ${ink} ${isMob ? "text-[28px]" : "text-[38px]"}`}>Daftar Harga</h2>
            </div>
            <div className={`grid gap-6 ${isMob ? "grid-cols-1" : plans.length === 1 ? "grid-cols-1 max-w-md mx-auto" : plans.length === 2 ? "grid-cols-2 max-w-3xl mx-auto" : "grid-cols-3"}`}>
              {plans.map((plan, idx) => (
                <div key={idx} className={`rounded-2xl p-7 flex flex-col border ${plan.isPopuler ? "" : line}`} style={plan.isPopuler ? { backgroundColor: navy, borderColor: navy } : undefined}>
                  {plan.isPopuler && <span className="inline-block self-start text-[11px] font-bold px-3 py-1 rounded-full text-white mb-4" style={{ backgroundColor: pc }}>Paling Diminati</span>}
                  <EditableText value={s.paketNama[idx] ?? plan.namaPaket} onChange={(v) => { const a = [...s.paketNama]; a[idx] = v; patch({ paketNama: a }); }} isEditMode={em} as="h3" className={`font-bold ${plan.isPopuler ? "text-white" : ink} text-[20px] mb-3`} />
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-[14px] font-semibold ${plan.isPopuler ? "text-white/60" : muted}`}>Rp</span>
                    <EditableText value={s.paketHargaList[idx] ?? plan.harga} onChange={(v) => { const a = [...s.paketHargaList]; a[idx] = v; patch({ paketHargaList: a }); }} isEditMode={em} className={`font-extrabold ${plan.isPopuler ? "text-white" : ink} text-[30px]`} />
                  </div>
                  <ul className="space-y-3 mb-7 flex-1">
                    {plan.fitur.map((f, fi) => (
                      <li key={fi} className={`flex items-start gap-2.5 text-[14.5px] ${plan.isPopuler ? "text-white/85" : ink}`}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: pc }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full text-center py-3 rounded-full text-[14px] font-semibold" style={plan.isPopuler ? { backgroundColor: pc, color: "white" } : { border: `1.5px solid ${pc}`, color: pc }}>
                    Pilih Paket
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimoni */}
      {s.testimonials.length > 0 && (
        <section id="testimoni" className={`relative overflow-hidden ${altGray}`}>
          <Watermark text="Ulasan" className={`bottom-4 right-0 ${isMob ? "text-[72px]" : "text-[180px]"}`} stroke={wmStroke} />
          <div className={`relative z-10 w-full ${px} ${isMob ? "py-16" : "py-24"}`}>
            <div className="mb-12">
              <Kicker>Kata Pelanggan</Kicker>
              <h2 className={`font-extrabold tracking-tight ${ink} ${isMob ? "text-[28px]" : "text-[38px]"}`}>Apa Kata Mereka</h2>
            </div>
            <div className={`grid gap-6 ${isMob ? "grid-cols-1" : "grid-cols-3"}`}>
              {s.testimonials.map((t, i) => (
                <div key={i} className={`${cardBg} rounded-2xl p-7 flex flex-col shadow-[0_8px_30px_-12px_rgba(11,19,43,0.12)]`}>
                  <Stars rating={t.rating ?? 5} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], rating: v }; patch({ testimonials: a }); }} isEditMode={em} color={pc} />
                  <EditableText value={t.teks} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], teks: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" multiline className={`${ink} leading-relaxed mt-4 mb-6 flex-1 text-[15px]`} />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-[15px]" style={{ backgroundColor: pc }}>
                      {(t.nama || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <EditableText value={t.nama} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], nama: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" className={`font-semibold text-[14px] ${ink}`} />
                      <EditableText value={t.peran} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], peran: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" className={`text-[12.5px] ${muted}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden" style={{ backgroundColor: pc }}>
        <div className={`relative z-10 max-w-4xl mx-auto ${px} ${isMob ? "py-16" : "py-24"} text-center`}>
          <EditableText value={s.footerTagline || "Mari Bekerja Sama"} onChange={(v) => patch({ footerTagline: v })} isEditMode={em} as="h2" className={`font-extrabold text-white tracking-tight leading-[1.1] ${isMob ? "text-[30px]" : "text-[46px]"}`} />
          <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 bg-white mt-9 px-8 py-4 rounded-full text-[15px] font-semibold`} style={{ color: pc }}>
            <EditableText value={s.footerCta || "Hubungi Kami Sekarang"} onChange={(v) => patch({ footerCta: v })} isEditMode={em} /> <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <Marquee items={marqueeItems} color={pc} />

      {/* Footer — deep navy */}
      <footer style={{ backgroundColor: navy }} className="text-white">
        <div className={`w-full ${px} ${isMob ? "py-12" : "py-16"}`}>
          <div className={`grid ${isMob ? "grid-cols-1 gap-10" : "grid-cols-3 gap-10"}`}>
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                {logo ? <img src={logo} alt={namaBisnis} className="w-8 h-8 rounded-lg object-cover" /> : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: pc }}>
                    <span className="text-white font-bold text-[13px]">{namaBisnis.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className="font-bold text-[17px]">{s.namaBisnis}</span>
              </div>
              <EditableText value={s.footerDesc} onChange={(v) => patch({ footerDesc: v })} isEditMode={em} as="p" multiline className="text-white/50 text-[13.5px] leading-relaxed max-w-xs" />
            </div>
            {(kontak.wa || kontak.telepon || kontak.email) && (
              <div>
                <EditableText value={s.footerKontakTitle} onChange={(v) => patch({ footerKontakTitle: v })} isEditMode={em} as="p" className="font-semibold text-[13px] tracking-[0.12em] uppercase mb-5 text-white/70" />
                <div className="space-y-3 text-[13.5px] text-white/60">
                  {kontak.wa && <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white"><Phone className="w-4 h-4" /> WhatsApp</a>}
                  {kontak.telepon && <a href={`tel:${kontak.telepon}`} className="block hover:text-white">{kontak.telepon}</a>}
                  {lokasi && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {lokasi}</span>}
                </div>
              </div>
            )}
            {(sosmed.instagram || sosmed.tiktok || sosmed.twitter) && (
              <div>
                <EditableText value={s.footerSosmedTitle} onChange={(v) => patch({ footerSosmedTitle: v })} isEditMode={em} as="p" className="font-semibold text-[13px] tracking-[0.12em] uppercase mb-5 text-white/70" />
                <div className="space-y-3 text-[13.5px] text-white/60">
                  {sosmed.instagram && <a href={`https://instagram.com/${sosmed.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="block hover:text-white">Instagram</a>}
                  {sosmed.tiktok && <a href={`https://tiktok.com/${sosmed.tiktok.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="block hover:text-white">TikTok</a>}
                  {sosmed.twitter && <a href={`https://x.com/${sosmed.twitter.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="block hover:text-white">Twitter / X</a>}
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-white/10 mt-12 pt-6">
            <EditableText value={s.copyright} onChange={(v) => patch({ copyright: v })} isEditMode={em} as="p" className="text-[12.5px] text-white/40" />
          </div>
        </div>
      </footer>

      <Lightbox photos={gallery} index={lightbox} setIndex={setLightbox} />
      {isEditable && !em && <SaveBar show={hasChanges} saving={saving} onSave={handleSave} />}
      <Toast message={toast} />
    </div>
  );
}
