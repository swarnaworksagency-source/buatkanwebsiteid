"use client";

import { useEffect, useRef, useState } from "react";
import type { TemplateData } from "@/types";
import { useIsMobile } from "@/components/ui/useIsMobile";
import { brandColor, textOn } from "@/lib/brandColor";
import { EditableText } from "@/components/ui/EditableText";
import { SlotImage } from "@/components/ui/SlotImage";
import { useTemplateEditor } from "./useTemplateEditor";
import { SaveBar, Toast, EditBanner, Stars, MobileNav } from "./TemplateShared";
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronsRight, Check, Phone, Mail, MapPin, AtSign, Music2, Share2 } from "lucide-react";

// Bar keahlian default (dipakai bila AI tidak mengisi about.skills). Format "Label|persen".
const DEFAULT_SKILLS = ["Kualitas & Ketelitian|92", "Kecepatan Pengerjaan|85", "Kepuasan Pelanggan|96"];

// Foto dummy placeholder (SVG data-URI, self-contained/offline) — dipakai bila portofolio kosong.
// Harus single-line tanpa spasi awal: sebagian browser menolak data:image/svg+xml diawali newline.
const dummyPhoto = (label: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='1000' viewBox='0 0 1600 1000'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#26332A'/><stop offset='1' stop-color='#131A15'/></linearGradient></defs><rect width='1600' height='1000' fill='url(#g)'/><g fill='none' stroke='#4ADE80' stroke-opacity='0.75' stroke-width='7'><circle cx='600' cy='420' r='95'/><path d='M280 730 L620 460 L850 650 L1080 420 L1340 730 Z'/></g><rect x='40' y='40' width='1520' height='920' rx='28' fill='none' stroke='#4ADE80' stroke-opacity='0.3' stroke-width='4'/><text x='800' y='880' fill='#B9C6BC' font-family='Arial, sans-serif' font-size='46' font-weight='700' text-anchor='middle' letter-spacing='4'>${label}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
};
const DUMMY_PHOTOS = [dummyPhoto("FOTO TIM"), dummyPhoto("FOTO KEGIATAN")];

// Foto potret dummy online (Unsplash) — dipakai avatar testimoni bila tak ada foto khusus.
const DUMMY_AVATARS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=500&q=70",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=500&q=70",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=500&q=70",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=500&q=70",
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=400&h=500&q=70",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=500&q=70",
];

const DEFAULT_CARA_KERJA = [
  { step: "01", title: "Konsultasi", desc: "Ceritakan kebutuhan Anda lewat WhatsApp, gratis tanpa biaya." },
  { step: "02", title: "Penawaran", desc: "Kami susun solusi dan estimasi yang jelas sejak awal." },
  { step: "03", title: "Selesai", desc: "Hasil rapi, sesuai harapan, dan siap Anda gunakan." },
];

interface Props extends Partial<TemplateData> {
  forceMobile?: boolean;
  isEditable?: boolean;
  isEditMode?: boolean;
  onContentUpdate?: (content: Partial<TemplateData>) => void;
  websiteId?: string;
}

export default function TemplateLima(props: Props) {
  const {
    hero = { headline: "Solusi Tepat untuk Bisnis Anda Berkembang Pesat", subheadline: "Kami membantu Anda tumbuh dengan layanan yang rapi, cepat, dan bisa diandalkan.", ctaText: "Hubungi Kami" },
    about = { judul: "Dipercaya Pelanggan dari Berbagai Daerah", deskripsi: "Kami menyediakan layanan profesional dengan hasil yang bisa diukur — dikerjakan tim berpengalaman, transparan sejak awal.", keunggulan: ["5+|Tahun Pengalaman", "500+|Pelanggan Puas", "100%|Bergaransi"], skills: DEFAULT_SKILLS },
    layanan = [],
    testimonialPlaceholder = [],
    footer = { tagline: "Berhenti menunda, mulai sekarang bersama kami!", ctaText: "Hubungi Kami" },
    namaBisnis = "Nama Usaha",
    lokasi = "",
    kontak = { wa: "", telepon: "", email: "" },
    sosmed = { instagram: "", tiktok: "", twitter: "" },
    warna = { primary: "", tema: "light" },
    paketHarga = [],
    logo = "",
    portofolio = [],
    caraKerja = DEFAULT_CARA_KERJA,
    imagePositions,
    caraKerjaTitle = "Bagaimana Cara Kerjanya?",
    forceMobile,
    isEditable = false,
    isEditMode = false,
    onContentUpdate,
    websiteId,
  } = props;

  const em = isEditMode;
  const { s, patch, setImgPos, hasChanges, saving, toast, handleSave } = useTemplateEditor({
    namaBisnis, hero, about, layanan, caraKerja, caraKerjaTitle,
    testimonials: testimonialPlaceholder, paketHarga, footer, imagePositions,
    isEditMode: em, onContentUpdate, websiteId,
  });

  // Layout mobile: ikut prop preview kalau ada, kalau tidak ikut lebar viewport asli
  // (halaman publik /s/[subdomain] tidak mengirim forceMobile).
  const isMob = useIsMobile(forceMobile);

  /* ── Latar gelap dikunci; aksen ikut "Preferensi Warna" user
     (default = neon green signature scene*.png). ── */
  const bg = "#0B0F0C";
  const accentDefault = "#4ADE80";
  const accent = brandColor(warna?.primary, accentDefault);
  const isCustomAccent = accent.toLowerCase() !== accentDefault.toLowerCase();
  const accentDark = isCustomAccent ? textOn(accent) : "#06230F"; // teks di atas tombol aksen
  const ink = "text-[#F2F5F1]";
  const muted = "text-[#8B968D]";
  const hairline = "border-white/[0.07]";
  const panel = "bg-white/[0.03]";
  // Gradient teks putih → hijau neon (headline & teks raksasa).
  const gradText: React.CSSProperties = {
    backgroundImage: isCustomAccent
      ? `linear-gradient(115deg, #ffffff 0%, ${accent} 100%)`
      : "linear-gradient(115deg, #EAFBEF 0%, #A7F3C0 45%, #4ADE80 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };

  // Section tanpa isi tidak dirender, link navbar-nya ikut hilang (hero selalu ada).
  const hasAbout = !!(s.aboutJudul.trim() || s.aboutDeskripsi.trim() || s.aboutKeunggulan.some((k) => k.trim()));

  const waLink = `https://wa.me/${kontak.wa}?text=Halo,%20saya%20tertarik%20dengan%20layanan%20Anda.`;
  const plans = paketHarga && paketHarga.length > 0 ? paketHarga : [];
  const px = isMob ? "px-5" : "px-8 lg:px-16";
  const testiRef = useRef<HTMLDivElement>(null);
  const scrollTesti = (dir: number) => testiRef.current?.scrollBy({ left: dir * (testiRef.current.clientWidth * 0.8), behavior: "smooth" });

  /* ── Efek magnetic (permintaan awal template ini) ─────────────────────
     Jarak kursor dari PUSAT layar (dx, dy) → elemen dekoratif hero bergeser
     ke arah BERLAWANAN, dibagi "depth" per elemen supaya halus + parallax.
     Transisi CSS lambat membuatnya mengambang (magnetic), tidak menempel kursor. */
  const aboutRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const field = aboutRef.current;
    if (!field) return;
    const els = Array.from(field.querySelectorAll<HTMLElement>("[data-orb]"));
    if (els.length === 0) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      for (const el of els) {
        const depth = Number(el.dataset.orb) || 20;
        el.style.transform = `translate3d(${-dx / depth}px, ${-dy / depth}px, 0) rotate(${el.dataset.rot || 0}deg)`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Headline: bagian awal putih, bagian akhir gradient hijau (gaya referensi).
  const words = (s.heroHeadline || "").trim().split(/\s+/);
  const splitAt = Math.max(1, Math.ceil(words.length * 0.55));
  const headWhite = words.slice(0, splitAt).join(" ");
  const headGreen = words.slice(splitAt).join(" ");

  // Stats bawah: HANYA item format numerik "nilai|label" (mis. "3k+|Proyek Selesai").
  // Item tanpa "|" (keunggulan kualitatif) tidak ditampilkan sebagai stat.
  const stats = s.aboutKeunggulan
    .filter((k) => k.includes("|"))
    .slice(0, 4)
    .map((k) => {
      const i = k.indexOf("|");
      return { val: k.slice(0, i).trim(), label: k.slice(i + 1).trim() };
    });

  // Bar keahlian: about.skills format "label|persen" → { label, pct }. Fallback ke DEFAULT_SKILLS.
  const skillSrc = s.aboutSkills.length > 0 ? s.aboutSkills : DEFAULT_SKILLS;
  const skills = skillSrc.slice(0, 4).map((k) => {
    const i = k.indexOf("|");
    const label = i >= 0 ? k.slice(0, i).trim() : k.trim();
    const pct = Math.max(0, Math.min(100, i >= 0 ? parseInt(k.slice(i + 1), 10) || 0 : 0));
    return { label, pct };
  });
  // Foto kolom kiri Tentang: 2 slot dari portofolio, fallback foto dummy bila kosong.
  const aboutPhotos = [portofolio?.[0] || DUMMY_PHOTOS[0], portofolio?.[1] || DUMMY_PHOTOS[1]];

  const clampPct = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  // Ubah 1 bar keahlian (label/persen). Rebuild dari daftar efektif → default ikut ter-seed saat disimpan.
  const setSkill = (idx: number, next: { label?: string; pct?: number }) => {
    const arr = skills.map((sk, i) =>
      i === idx ? { label: next.label ?? sk.label, pct: next.pct ?? sk.pct } : sk
    );
    patch({ aboutSkills: arr.map((sk) => `${sk.label}|${sk.pct}`) });
  };
  // Drag/klik track (edit mode) → set persen dari posisi kursor.
  const barPointer = (idx: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pctAt = (x: number) => clampPct(((x - rect.left) / rect.width) * 100);
    setSkill(idx, { pct: pctAt(e.clientX) });
    const move = (ev: PointerEvent) => setSkill(idx, { pct: pctAt(ev.clientX) });
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Elemen dekoratif hero yang bereaksi magnetic: glow blur saja (chip teks dihapus).
  const floaters: Array<{ depth: number; rot: number; cls: string; kind: "glow"; size?: number }> = [
    { depth: 14, rot: 0, cls: "top-[8%] left-1/2 -translate-x-1/2", kind: "glow", size: isMob ? 260 : 560 },
    { depth: 20, rot: 0, cls: "bottom-[10%] left-[6%]", kind: "glow", size: isMob ? 140 : 260 },
    { depth: 26, rot: 0, cls: "top-[30%] right-[4%]", kind: "glow", size: isMob ? 120 : 220 },
  ];

  // Grid garis blueprint (kotak-kotak, ref: scene00651.png) — garis vertikal & horizontal
  // di posisi berbeda-beda membentuk kotak, BUKAN menyebar dari satu titik. Beam cahaya
  // cuma jalan tegak lurus (90°): naik-turun di garis vertikal, kiri-kanan di garis horizontal.
  const gridV = ["8%", "24%", "42%", "58%", "76%", "92%"];
  const gridH = isMob ? ["30%", "70%"] : ["18%", "42%", "68%", "86%"];
  // from: arah datang beam — selalu berhenti & pudar di TENGAH garis, bukan tembus lurus (no closed loop).
  const beamsV: Array<{ pos: string; dur: number; delay: number; from: "top" | "bottom" }> = [
    { pos: gridV[0], dur: 3.2, delay: 0, from: "top" },
    { pos: gridV[2], dur: 3.6, delay: 1.4, from: "bottom" },
    { pos: gridV[4], dur: 2.9, delay: 2.4, from: "top" },
  ];
  const beamsH: Array<{ pos: string; dur: number; delay: number; from: "left" | "right" }> = [
    { pos: gridH[1], dur: 3.4, delay: 0.7, from: "left" },
    { pos: gridH[gridH.length - 1], dur: 3.0, delay: 1.9, from: "right" },
  ];

  const SectionTitle = ({ white, green }: { white: string; green: string }) => (
    <h2 className={`font-bold tracking-tight leading-tight ${isMob ? "text-[26px]" : "text-[38px]"}`}>
      <span className={ink}>{white} </span>
      <span style={{ color: accent }}>{green}</span>
    </h2>
  );

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: bg }}>
      <style>{`
        /* Beam selalu jalan SEARAH dari pinggir → tengah lalu pudar & diam (jeda) sebelum ulang —
           bukan tembus lurus / bolak-balik (closed loop). */
        @keyframes tl-beam-down  { 0% { top: -42%; opacity: 0; } 12% { opacity: 1; } 55% { top: 29%; opacity: 1; } 75%, 100% { top: 29%; opacity: 0; } }
        @keyframes tl-beam-up    { 0% { top: 100%; opacity: 0; } 12% { opacity: 1; } 55% { top: 29%; opacity: 1; } 75%, 100% { top: 29%; opacity: 0; } }
        @keyframes tl-beam-right { 0% { left: -42%; opacity: 0; } 12% { opacity: 1; } 55% { left: 29%; opacity: 1; } 75%, 100% { left: 29%; opacity: 0; } }
        @keyframes tl-beam-left  { 0% { left: 100%; opacity: 0; } 12% { opacity: 1; } 55% { left: 29%; opacity: 1; } 75%, 100% { left: 29%; opacity: 0; } }
        .tl-hscroll { -ms-overflow-style: none; scrollbar-width: none; }
        .tl-hscroll::-webkit-scrollbar { display: none; }
      `}</style>
      <EditBanner show={em} />

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${scrolled ? "bg-[#0B0F0C]/90 backdrop-blur border-b border-white/[0.06]" : "bg-transparent"}`}>
        <div className={`flex items-center justify-between ${px} ${isMob ? "h-14" : "h-16"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {logo ? (
              <img src={logo} alt={namaBisnis} className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent }}>
                <span className="font-black text-[13px]" style={{ color: accentDark }}>{namaBisnis.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <EditableText value={s.namaBisnis} onChange={(v) => patch({ namaBisnis: v })} isEditMode={em} as="span" className={`font-bold tracking-tight ${ink} truncate ${isMob ? "text-[14px] max-w-[130px]" : "text-[16px] max-w-[220px]"}`} />
          </div>
          {!isMob && (
            <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#B9C2BA]">
              {hasAbout && <a href="#tentang" className="hover:text-white transition-colors">Tentang</a>}
              <a href="#cara-kerja" className="hover:text-white transition-colors">Cara Kerja</a>
              <a href="#layanan" className="hover:text-white transition-colors">Layanan</a>
              {plans.length > 0 && <a href="#harga" className="hover:text-white transition-colors">Harga</a>}
              {s.testimonials.length > 0 && <a href="#testimoni" className="hover:text-white transition-colors">Testimoni</a>}
            </div>
          )}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 rounded-full font-bold ${isMob ? "px-4 py-2 text-[12px]" : "px-5 py-2.5 text-[13px]"}`} style={{ backgroundColor: accent, color: accentDark }}>
              {isMob ? <Phone className="w-4 h-4" /> : <>{s.heroCta || "Hubungi Kami"} <ArrowUpRight className="w-3.5 h-3.5" /></>}
            </a>
            {isMob && (
              <MobileNav
                bg="#0B0F0C"
                textColor="#B9C2BA"
                accent={accent}
                items={[
                  ...(hasAbout ? [{ href: "#tentang", label: "Tentang" }] : []),
                  ...(s.caraKerja.length > 0 ? [{ href: "#cara-kerja", label: "Cara Kerja" }] : []),
                  ...(s.layanan.length > 0 ? [{ href: "#layanan", label: "Layanan" }] : []),
                  ...(plans.length > 0 ? [{ href: "#harga", label: "Harga" }] : []),
                  ...(s.testimonials.length > 0 ? [{ href: "#testimoni", label: "Testimoni" }] : []),
                ]}
              />
            )}
          </div>
        </div>
      </nav>

      {/* Hero — headline putih→hijau + cahaya sudut kiri-atas menyorot ke arah CTA */}
      <section className={`relative overflow-hidden flex flex-col items-center justify-center ${isMob ? "min-h-[100dvh] pt-24 pb-16" : "h-[100dvh] pb-16"}`}>
        {/* Vignette dasar tipis, sisa gradasi biar tidak polos total */}
        <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(900px 480px at 50% -8%, rgba(74,222,128,0.10), transparent 62%)` }} />

        {/* Cahaya diagonal dari pojok kiri-atas ke arah CTA — teknik sama dgn hero utama BuatkanWeb.id (HeroSection.tsx) */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[160%] h-[75%] origin-top-left rotate-[25deg] bg-gradient-to-br from-[#4ADE80]/35 via-[#4ADE80]/10 to-transparent blur-[80px]" />
          <div className="absolute top-[5%] left-[8%] w-[70%] h-[45%] rotate-[25deg] bg-gradient-to-br from-white/25 via-[#A7F3C0]/15 to-transparent blur-[60px]" />
        </div>

        {/* Konten hero */}
        <div className={`relative z-10 flex flex-col items-center text-center w-full ${px} max-w-5xl mx-auto`}>
          {em ? (
            <EditableText value={s.heroHeadline} onChange={(v) => patch({ heroHeadline: v })} isEditMode={em} as="h1" className={`font-bold tracking-tight leading-[1.06] ${ink} ${isMob ? "text-[36px]" : "text-[clamp(40px,6.5vw,84px)]"}`} />
          ) : (
            <h1 className={`font-bold tracking-tight leading-[1.06] ${isMob ? "text-[36px]" : "text-[clamp(40px,6.5vw,84px)]"}`}>
              <span className={ink}>{headWhite} </span>
              <span style={gradText}>{headGreen}</span>
            </h1>
          )}
          <EditableText value={s.heroSub} onChange={(v) => patch({ heroSub: v })} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed mt-6 max-w-xl ${isMob ? "text-[14.5px]" : "text-[16px]"}`} />

          <div className={`flex items-center gap-3 mt-9 ${isMob ? "flex-col w-full" : "flex-row"}`}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-full font-bold ${isMob ? "w-full py-3.5 text-[14px]" : "px-7 py-3.5 text-[14px]"}`} style={{ backgroundColor: accent, color: accentDark, boxShadow: "0 18px 50px -18px rgba(74,222,128,0.55)" }}>
              <EditableText value={s.heroCta || "Hubungi Kami"} onChange={(v) => patch({ heroCta: v })} isEditMode={em} /> <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#layanan" className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold border border-white/12 bg-white/[0.04] text-white ${isMob ? "w-full py-3.5 text-[14px]" : "px-7 py-3.5 text-[14px]"}`}>
              Lihat Layanan
            </a>
          </div>
        </div>

        {/* Bawah kiri: sosmed. Bawah kanan: scroll hint */}
        <div className={`absolute bottom-6 inset-x-0 z-10 flex items-center justify-between ${px}`}>
          <div className={`flex items-center gap-3 ${muted}`}>
            {!isMob && <span className="text-[11px] font-medium tracking-wider uppercase">Ikuti Kami</span>}
            {sosmed.instagram && <a href={`https://instagram.com/${sosmed.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><AtSign className="w-4 h-4" /></a>}
            {sosmed.tiktok && <a href={`https://tiktok.com/@${sosmed.tiktok}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Music2 className="w-4 h-4" /></a>}
            {sosmed.twitter && <a href={`https://x.com/${sosmed.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Share2 className="w-4 h-4" /></a>}
          </div>
          <div className={`flex items-center gap-1.5 ${muted}`}>
            <span className="text-[11px] font-medium tracking-wider uppercase">Scroll</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Tentang + Stats — background hijau (vignette, orb magnetic, grid blueprint, beam) dipindah kesini dari Hero */}
      {/* Kosong → section hilang (link navbar ikut hilang). */}
      {hasAbout && (
      <section id="tentang" ref={aboutRef} className={`relative overflow-hidden min-h-[100dvh] flex flex-col justify-center ${px} ${isMob ? "py-16" : "py-28"}`}>
        {/* Cahaya hijau dari atas (vignette gelap di tepi) */}
        <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(900px 480px at 50% -8%, rgba(74,222,128,0.18), transparent 62%), radial-gradient(600px 320px at 82% 108%, rgba(74,222,128,0.07), transparent 60%)` }} />

        {/* Elemen mengambang — bereaksi terhadap kursor (magnetic) */}
        {floaters.map((f, i) => (
          <div
            key={i}
            data-orb={f.depth}
            aria-hidden
            className={`absolute rounded-full pointer-events-none ${f.cls}`}
            style={{ width: f.size, height: f.size, background: `radial-gradient(circle, rgba(74,222,128,0.14), transparent 70%)`, filter: "blur(10px)", transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1)", willChange: "transform" }}
          />
        ))}

        {/* Grid blueprint statis — jejak tipis garis vertikal & horizontal membentuk kotak-kotak */}
        {gridV.map((x, i) => (
          <div key={`gv${i}`} aria-hidden className="absolute top-0 bottom-0 w-px pointer-events-none" style={{ left: x, background: "rgba(74,222,128,0.08)" }} />
        ))}
        {gridH.map((y, i) => (
          <div key={`gh${i}`} aria-hidden className="absolute left-0 right-0 h-px pointer-events-none" style={{ top: y, background: "rgba(74,222,128,0.08)" }} />
        ))}

        {/* Beam vertikal — datang dari atas/bawah, berhenti & pudar di tengah (searah, no loop tembus) */}
        {beamsV.map((b, i) => (
          <div key={`bv${i}`} aria-hidden className="absolute top-0 bottom-0 pointer-events-none" style={{ left: b.pos }}>
            <div
              className="absolute left-1/2 -translate-x-1/2 w-px h-[42%]"
              style={{ animation: `${b.from === "top" ? "tl-beam-down" : "tl-beam-up"} ${b.dur}s ease-out infinite`, animationDelay: `${b.delay}s` }}
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2" style={{ width: isMob ? 14 : 22, background: "linear-gradient(to bottom, transparent, rgba(74,222,128,0.45), transparent)", filter: "blur(10px)" }} />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2" style={{ width: isMob ? 6 : 9, background: "linear-gradient(to bottom, transparent, rgba(74,222,128,0.85), transparent)", filter: "blur(3px)" }} />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2" style={{ width: 2, background: "linear-gradient(to bottom, transparent, rgba(200,255,220,0.95), transparent)" }} />
            </div>
          </div>
        ))}

        {/* Beam horizontal — datang dari kiri/kanan, berhenti & pudar di tengah (searah, no loop tembus) */}
        {beamsH.map((b, i) => (
          <div key={`bh${i}`} aria-hidden className="absolute left-0 right-0 pointer-events-none" style={{ top: b.pos }}>
            <div
              className="absolute top-1/2 -translate-y-1/2 h-px w-[42%]"
              style={{ animation: `${b.from === "left" ? "tl-beam-right" : "tl-beam-left"} ${b.dur}s ease-out infinite`, animationDelay: `${b.delay}s` }}
            >
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2" style={{ height: isMob ? 14 : 22, background: "linear-gradient(to right, transparent, rgba(74,222,128,0.45), transparent)", filter: "blur(10px)" }} />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2" style={{ height: isMob ? 6 : 9, background: "linear-gradient(to right, transparent, rgba(74,222,128,0.85), transparent)", filter: "blur(3px)" }} />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2" style={{ height: 2, background: "linear-gradient(to right, transparent, rgba(200,255,220,0.95), transparent)" }} />
            </div>
          </div>
        ))}

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          {/* Eyebrow + judul (centered) */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChevronsRight className="w-4 h-4" style={{ color: accent }} />
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>Tentang Kami</span>
          </div>
          <div className={`max-w-3xl mx-auto text-center ${isMob ? "mb-9" : "mb-11"}`}>
            <EditableText value={s.aboutJudul} onChange={(v) => patch({ aboutJudul: v })} isEditMode={em} as="h2" className={`font-bold tracking-tight leading-tight ${ink} ${isMob ? "text-[26px]" : "text-[40px]"}`} />
          </div>

          {/* Dua kolom: kiri foto bertumpuk, kanan deskripsi + bar keahlian + CTA */}
          <div className={`grid items-center ${isMob ? "grid-cols-1 gap-7" : "grid-cols-2 gap-10"}`}>
            {/* Kolom kiri — foto (tinggi dibatasi agar section tidak melebihi 1 layar) */}
            <div className={`grid gap-4 ${isMob ? "grid-cols-2" : "grid-cols-1"}`}>
              {[0, 1].map((slot) => (
                <div key={slot} className={`relative rounded-2xl overflow-hidden border ${hairline} ${isMob ? "aspect-square" : "h-[300px]"}`}>
                  <SlotImage id={"tentang" + slot} src={aboutPhotos[slot]} alt={`Tentang ${slot + 1}`} em={em} positions={s.imagePositions} setPos={setImgPos} imgClassName="grayscale hover:grayscale-0 transition-all duration-500" />
                  <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(160deg, transparent 55%, rgba(74,222,128,0.12))" }} />
                </div>
              ))}
            </div>

            {/* Kolom kanan — deskripsi + keahlian + CTA */}
            <div>
              <EditableText value={s.aboutDeskripsi} onChange={(v) => patch({ aboutDeskripsi: v })} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed ${isMob ? "text-[14px]" : "text-[15px]"}`} />

              <div className={`${isMob ? "mt-7" : "mt-8"} space-y-5`}>
                {skills.map((sk, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <EditableText
                        value={sk.label}
                        onChange={(v) => setSkill(i, { label: v })}
                        isEditMode={em}
                        as="span"
                        className={`text-[13px] font-medium ${ink}`}
                      />
                      <span className="text-[12.5px] font-bold tabular-nums inline-flex items-center" style={{ color: accent }}>
                        {em ? (
                          <EditableText
                            value={String(sk.pct)}
                            onChange={(v) => { const n = parseInt(v.replace(/\D/g, ""), 10); setSkill(i, { pct: clampPct(isNaN(n) ? sk.pct : n) }); }}
                            isEditMode={em}
                            as="span"
                            className="inline-block min-w-[22px] text-right tabular-nums"
                          />
                        ) : (
                          sk.pct
                        )}
                        %
                      </span>
                    </div>
                    <div
                      className={`relative rounded-full bg-white/[0.07] ${em ? "h-2.5 cursor-ew-resize" : "h-1.5 overflow-hidden"}`}
                      onPointerDown={em ? barPointer(i) : undefined}
                      style={em ? { touchAction: "none" } : undefined}
                    >
                      <div className="h-full rounded-full pointer-events-none" style={{ width: `${sk.pct}%`, backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }} />
                      {em && (
                        <div
                          className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none"
                          style={{ left: `${sk.pct}%`, transform: "translate(-50%, -50%)", backgroundColor: accent, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full font-bold mt-8 ${isMob ? "px-6 py-3 text-[13.5px]" : "px-7 py-3.5 text-[14px]"}`} style={{ backgroundColor: accent, color: accentDark, boxShadow: "0 18px 50px -18px rgba(74,222,128,0.55)" }}>
                Konsultasi Gratis <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Stats bawah — dipisah chevron ganda (ref). Item ber-"|": angka besar + label;
              item tanpa "|": teks tunggal (tidak dobel). */}
          {stats.length > 0 && (
            <div className={`${isMob ? "mt-11 pt-8" : "mt-12 pt-10"} border-t ${hairline}`}>
              <div className={`grid items-center ${isMob ? "grid-cols-2 gap-y-8" : stats.length === 1 ? "grid-cols-1" : stats.length === 2 ? "grid-cols-2" : stats.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
                {stats.map((st, i) => (
                  <div key={i} className={`relative text-center px-2 ${!isMob && i > 0 ? `border-l ${hairline}` : ""}`}>
                    {!isMob && i > 0 && (
                      <ChevronsRight aria-hidden className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: accent, backgroundColor: bg }} />
                    )}
                    <div className={`font-bold tracking-tight leading-tight break-words ${isMob ? "text-[clamp(24px,8vw,30px)]" : "text-[clamp(26px,3vw,40px)]"}`}>
                      <span className={ink}>{st.val.replace(/[+%]$/, "")}</span>
                      {/[+%]$/.test(st.val) && <span style={{ color: accent }}>{st.val.slice(-1)}</span>}
                    </div>
                    <EditableText
                      value={st.label}
                      onChange={(v) => { const a = s.aboutKeunggulan.filter((k) => k.includes("|")); a[i] = `${st.val}|${v}`; const rest = s.aboutKeunggulan.filter((k) => !k.includes("|")); patch({ aboutKeunggulan: [...a, ...rest] }); }}
                      isEditMode={em}
                      as="p"
                      className={`${muted} text-[12px] leading-snug break-words mt-1.5`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Cara Kerja — panel gelombang hijau + 3 langkah */}
      {s.caraKerja.length > 0 && (
        <section id="cara-kerja" className={`relative min-h-[100dvh] flex flex-col justify-center ${px} ${isMob ? "py-16" : "py-28"}`}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <EditableText value={s.caraKerjaTitle} onChange={(v) => patch({ caraKerjaTitle: v })} isEditMode={em} as="h2" className={`font-bold tracking-tight ${ink} ${isMob ? "text-[26px]" : "text-[38px]"}`} />
              <p className={`${muted} text-[13.5px] mt-2`}>Prosesnya sederhana dan transparan</p>
            </div>
            {/* Panel visual — gelombang cahaya hijau */}
            <div className={`relative rounded-3xl border ${hairline} overflow-hidden ${isMob ? "h-40" : "h-64"} mb-10`}>
              <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(60% 120% at 18% 100%, rgba(74,222,128,0.35), transparent 60%), radial-gradient(50% 100% at 55% 0%, rgba(74,222,128,0.16), transparent 55%), radial-gradient(45% 110% at 88% 90%, rgba(74,222,128,0.28), transparent 62%)`, filter: "blur(18px)" }} />
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,15,12,0.25), rgba(11,15,12,0.65))" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`font-bold ${isMob ? "text-[20px]" : "text-[30px]"}`} style={gradText}>{s.namaBisnis}</span>
              </div>
            </div>
            <div className={`grid gap-8 ${isMob ? "grid-cols-1" : "grid-cols-3"}`}>
              {s.caraKerja.slice(0, 3).map((ck, i) => (
                <div key={i}>
                  <p className="text-[11px] font-mono tracking-[0.2em] mb-2.5" style={{ color: accent }}>[ LANGKAH {i + 1} ]</p>
                  <EditableText value={ck.title} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], title: v }; patch({ caraKerja: a }); }} isEditMode={em} as="h3" className={`font-bold ${ink} text-[16.5px] mb-1.5`} />
                  <EditableText value={ck.desc} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], desc: v }; patch({ caraKerja: a }); }} isEditMode={em} as="p" multiline className={`${muted} text-[13.5px] leading-relaxed`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Layanan — split: kiri intro+CTA, kanan grid kartu, 1 kartu highlight (ref cth1.webp) */}
      {s.layanan.length > 0 && (
        <section id="layanan" className={`relative min-h-[100dvh] flex flex-col justify-center ${px} ${isMob ? "py-16" : "py-28"}`}>
          <div className={`max-w-6xl mx-auto grid ${isMob ? "grid-cols-1 gap-10" : "grid-cols-2 gap-14 items-center"}`}>
            {/* Kiri — intro */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ChevronsRight className="w-4 h-4" style={{ color: accent }} />
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>Layanan Kami</span>
              </div>
              <SectionTitle white="Layanan Terbaik yang Kami" green="Tawarkan" />
              <p className={`${muted} leading-relaxed mt-5 max-w-md ${isMob ? "text-[14px]" : "text-[15px]"}`}>
                Kami menghadirkan solusi lengkap dan profesional untuk membantu bisnis Anda tumbuh — dikerjakan dengan standar terbaik dan hasil yang bisa diandalkan.
              </p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full font-bold mt-8 ${isMob ? "px-6 py-3 text-[13.5px]" : "px-7 py-3.5 text-[14px]"}`} style={{ backgroundColor: accent, color: accentDark, boxShadow: "0 18px 50px -18px rgba(74,222,128,0.55)" }}>
                Konsultasi Gratis <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Kanan — grid kartu layanan. Jumlah ganjil (>1): kartu terakhir span penuh agar tak ada sel bolong. */}
            <div className={`grid gap-4 ${isMob || s.layanan.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {s.layanan.map((l, i) => {
                const featured = i === (s.layanan.length >= 2 ? 1 : 0);
                const titleCls = featured ? "text-[#06230F]" : ink;
                const descCls = featured ? "text-[#06230F]/70" : muted;
                const spanFull = !isMob && s.layanan.length > 1 && s.layanan.length % 2 === 1 && i === s.layanan.length - 1;
                return (
                  <div
                    key={i}
                    className={`group relative rounded-2xl p-6 flex flex-col min-h-[176px] border transition-all ${spanFull ? "col-span-2" : ""} ${featured ? "" : `${panel} ${hairline} hover:border-white/[0.14]`}`}
                    style={featured ? { background: "linear-gradient(150deg, #4ADE80, #16A34A)", borderColor: "transparent", boxShadow: "0 30px 80px -42px rgba(74,222,128,0.6)" } : undefined}
                  >
                    <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 border font-bold text-[15px] tabular-nums ${featured ? "" : ink}`} style={featured ? { backgroundColor: "rgba(6,35,15,0.16)", borderColor: "rgba(6,35,15,0.2)", color: accentDark } : { backgroundColor: "rgba(74,222,128,0.08)", borderColor: "rgba(74,222,128,0.25)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <EditableText value={l.nama} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], nama: v }; patch({ layanan: a }); }} isEditMode={em} as="h3" className={`font-bold ${titleCls} text-[15.5px] leading-snug mb-1.5`} />
                    <EditableText value={l.deskripsi} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], deskripsi: v }; patch({ layanan: a }); }} isEditMode={em} as="p" multiline className={`${descCls} text-[12.5px] leading-relaxed flex-1`} />
                    {l.harga && (
                      <EditableText value={l.harga} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], harga: v }; patch({ layanan: a }); }} isEditMode={em} as="span" className={`text-[12px] font-bold mt-3 ${featured ? "text-[#06230F]" : "text-[#4ADE80]"}`} />
                    )}
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className={`mt-4 self-start w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5 ${featured ? "" : "border"}`} style={featured ? { backgroundColor: accentDark, color: accent } : { borderColor: "rgba(74,222,128,0.35)", color: accent }}>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Harga — tabel paket gaya referensi */}
      {plans.length > 0 && (
        <section id="harga" className={`relative min-h-[100dvh] flex flex-col justify-center ${px} ${isMob ? "py-16" : "py-28"}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <SectionTitle white="Harga Terbaik untuk" green="Anda!" />
              <p className={`${muted} text-[13.5px] mt-2`}>Pilih paket yang sesuai kebutuhan Anda.</p>
            </div>
            <div className={`grid gap-5 ${isMob ? "grid-cols-1" : plans.length === 1 ? "grid-cols-1 max-w-md mx-auto" : plans.length === 2 ? "grid-cols-2 max-w-3xl mx-auto" : "grid-cols-3"}`}>
              {plans.map((plan, idx) => (
                <div key={idx} className={`relative rounded-2xl border p-7 flex flex-col ${plan.isPopuler ? "" : `${hairline} ${panel}`}`} style={plan.isPopuler ? { borderColor: "rgba(74,222,128,0.5)", backgroundColor: "rgba(74,222,128,0.05)", boxShadow: "0 30px 90px -40px rgba(74,222,128,0.45)" } : undefined}>
                  {plan.isPopuler && <span className="absolute -top-3 left-6 text-[10.5px] font-bold px-3 py-1 rounded-full" style={{ backgroundColor: accent, color: accentDark }}>PALING DIMINATI</span>}
                  <EditableText value={s.paketNama[idx] ?? plan.namaPaket} onChange={(v) => { const a = [...s.paketNama]; a[idx] = v; patch({ paketNama: a }); }} isEditMode={em} as="p" className={`${muted} text-[12.5px] font-semibold uppercase tracking-wider mb-2`} />
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-[14px] font-semibold ${muted}`}>Rp</span>
                    <EditableText value={s.paketHargaList[idx] ?? plan.harga} onChange={(v) => { const a = [...s.paketHargaList]; a[idx] = v; patch({ paketHargaList: a }); }} isEditMode={em} className={`font-bold ${ink} text-[32px] tracking-tight`} />
                  </div>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full text-center py-3 rounded-full text-[13.5px] font-bold mb-6 transition-opacity hover:opacity-90" style={plan.isPopuler ? { backgroundColor: accent, color: accentDark } : { border: "1px solid rgba(255,255,255,0.14)", color: "#F2F5F1" }}>
                    Pilih Paket
                  </a>
                  <ul className={`divide-y divide-white/[0.06] border-t ${hairline}`}>
                    {plan.fitur.map((f, fi) => (
                      <li key={fi} className={`flex items-start gap-2.5 py-3 text-[13.5px] ${ink}`}>
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimoni — baris potret ter-fan (perspektif) + kutipan di bawah (ref cth1.webp) */}
      {s.testimonials.length > 0 && (
        <section id="testimoni" className={`relative min-h-[100dvh] flex flex-col justify-center overflow-hidden ${px} ${isMob ? "py-16" : "py-28"}`}>
          <div className="max-w-6xl mx-auto w-full">
            {/* Heading */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <ChevronsRight className="w-4 h-4" style={{ color: accent }} />
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>Testimoni</span>
            </div>
            <div className="text-center mb-10">
              <SectionTitle white="Apa Kata" green="Mereka" />
              <p className={`${muted} mt-3 ${isMob ? "text-[13.5px]" : "text-[14.5px]"}`}>Cerita nyata dari pelanggan yang telah bekerja sama dengan kami.</p>
            </div>

            {/* Slider kartu testimoni — foto besar + kutipan. Geser horizontal bila > 3. */}
            <div className="relative">
              <div
                ref={testiRef}
                className={`tl-hscroll flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 ${s.testimonials.length > 3 ? "" : "lg:justify-center"}`}
              >
                {s.testimonials.map((t, i) => (
                  <div key={i} className={`snap-start shrink-0 flex flex-col ${isMob ? "w-[230px]" : "w-[288px]"}`}>
                    {/* Foto potret */}
                    <div className={`relative rounded-2xl overflow-hidden border ${hairline} ${isMob ? "h-[300px]" : "h-[360px]"}`}>
                      <SlotImage id={"testi" + i} src={DUMMY_AVATARS[i % DUMMY_AVATARS.length]} alt={t.nama || `Testimoni ${i + 1}`} em={em} positions={s.imagePositions} setPos={setImgPos} imgClassName="grayscale hover:grayscale-0 transition-all duration-500" />
                      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 45%, rgba(11,15,12,0.9))" }} />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <EditableText value={t.nama} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], nama: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" className="font-bold text-white text-[15px] leading-tight" />
                        <EditableText value={t.peran} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], peran: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" className="text-[12px] mt-0.5 text-[#4ADE80]" />
                      </div>
                    </div>
                    {/* Rating + kutipan */}
                    <div className="mt-4">
                      <Stars rating={t.rating ?? 5} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], rating: v }; patch({ testimonials: a }); }} isEditMode={em} color={accent} />
                      <EditableText value={t.teks} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], teks: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed mt-3 text-[13px]`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol geser — hanya bila > 3 (desktop) */}
              {s.testimonials.length > 3 && !isMob && (
                <>
                  <button type="button" aria-label="Sebelumnya" onClick={() => scrollTesti(-1)} className="absolute left-1 top-[180px] -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border border-white/15 bg-[#0B0F0C]/80 backdrop-blur hover:border-white/30 transition-colors" style={{ color: accent }}>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                  <button type="button" aria-label="Berikutnya" onClick={() => scrollTesti(1)} className="absolute right-1 top-[180px] -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border border-white/15 bg-[#0B0F0C]/80 backdrop-blur hover:border-white/30 transition-colors" style={{ color: accent }}>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA — teks kiri + tumpukan teks gradient kanan (gaya "Start earning") */}
      <section className={`relative overflow-hidden ${px} ${isMob ? "py-16" : "py-28"}`}>
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(500px 300px at 12% 50%, rgba(74,222,128,0.10), transparent 60%)" }} />
        <div className={`max-w-6xl mx-auto relative grid items-center gap-10 ${isMob ? "grid-cols-1" : "grid-cols-2"}`}>
          <div>
            <EditableText value={s.footerTagline} onChange={(v) => patch({ footerTagline: v })} isEditMode={em} as="h2" className={`font-bold tracking-tight leading-tight ${ink} ${isMob ? "text-[26px]" : "text-[36px]"}`} />
            <div className={`flex items-center gap-3 mt-7 ${isMob ? "flex-col w-full" : "flex-row"}`}>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-full font-bold ${isMob ? "w-full py-3.5 text-[14px]" : "px-7 py-3.5 text-[14px]"}`} style={{ backgroundColor: accent, color: accentDark }}>
                <EditableText value={s.footerCta || "Hubungi Kami"} onChange={(v) => patch({ footerCta: v })} isEditMode={em} /> <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#harga" className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold border border-white/12 text-white ${isMob ? "w-full py-3.5 text-[14px]" : "px-7 py-3.5 text-[14px]"}`}>
                Lihat Harga
              </a>
            </div>
          </div>
          <div aria-hidden className={`select-none pointer-events-none leading-[0.95] ${isMob ? "text-center" : "text-right"}`}>
            {[0.95, 0.75, 0.55, 0.35, 0.2].map((op, i) => (
              <div key={i} className={`font-black tracking-tight whitespace-nowrap ${isMob ? "text-[38px]" : "text-[clamp(40px,4.6vw,64px)]"}`} style={{ ...gradText, opacity: op }}>
                {s.footerCta || "Hubungi Kami"}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer — teks raksasa terpotong + kolom info */}
      <footer className="relative overflow-hidden">
        <div aria-hidden className="overflow-hidden select-none pointer-events-none" style={{ height: isMob ? 74 : 150 }}>
          <div className={`font-black tracking-tight whitespace-nowrap text-center leading-none ${isMob ? "text-[96px]" : "text-[200px]"}`} style={gradText}>
            {s.namaBisnis}
          </div>
        </div>
        <div className={`${px} border-t ${hairline}`}>
          <div className={`max-w-6xl mx-auto grid gap-8 ${isMob ? "grid-cols-1" : "grid-cols-3"} ${isMob ? "py-10" : "py-14"}`}>
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                {logo ? <img src={logo} alt={namaBisnis} className="w-8 h-8 rounded-lg object-contain" /> : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent }}>
                    <span className="font-black text-[13px]" style={{ color: accentDark }}>{namaBisnis.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className={`font-bold text-[16px] ${ink}`}>{s.namaBisnis}</span>
              </div>
              <EditableText value={s.footerDesc} onChange={(v) => patch({ footerDesc: v })} isEditMode={em} as="p" multiline className={`${muted} text-[13px] leading-relaxed`} />
            </div>
            <div>
              <EditableText value={s.footerKontakTitle} onChange={(v) => patch({ footerKontakTitle: v })} isEditMode={em} as="h4" className={`font-bold text-[13.5px] ${ink} mb-3`} />
              <ul className={`space-y-2.5 text-[13px] ${muted}`}>
                {kontak.wa && <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" style={{ color: accent }} /> {kontak.wa}</li>}
                {kontak.email && <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" style={{ color: accent }} /> {kontak.email}</li>}
                {lokasi && <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" style={{ color: accent }} /> {lokasi}</li>}
              </ul>
            </div>
            <div>
              <EditableText value={s.footerSosmedTitle} onChange={(v) => patch({ footerSosmedTitle: v })} isEditMode={em} as="h4" className={`font-bold text-[13.5px] ${ink} mb-3`} />
              <ul className={`space-y-2.5 text-[13px] ${muted}`}>
                {sosmed.instagram && <li className="flex items-center gap-2"><AtSign className="w-3.5 h-3.5" style={{ color: accent }} /> @{sosmed.instagram}</li>}
                {sosmed.tiktok && <li className="flex items-center gap-2"><Music2 className="w-3.5 h-3.5" style={{ color: accent }} /> @{sosmed.tiktok}</li>}
                {sosmed.twitter && <li className="flex items-center gap-2"><Share2 className="w-3.5 h-3.5" style={{ color: accent }} /> @{sosmed.twitter}</li>}
              </ul>
            </div>
          </div>
          <div className={`max-w-6xl mx-auto border-t ${hairline} py-6 text-center`}>
            <EditableText value={s.copyright} onChange={(v) => patch({ copyright: v })} isEditMode={em} as="p" className={`text-[12px] ${muted}`} />
          </div>
        </div>
      </footer>

      {isEditable && !em && <SaveBar show={hasChanges} saving={saving} onSave={handleSave} />}
      <Toast message={toast} />
    </div>
  );
}
