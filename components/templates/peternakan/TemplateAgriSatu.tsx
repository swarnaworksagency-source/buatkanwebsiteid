"use client";

import { useEffect, useRef, useState } from "react";
import type { TemplateData } from "@/types";
import { useIsMobile } from "@/components/ui/useIsMobile";
import { brandColor, darkTone } from "@/lib/brandColor";
import { getBisnisIcon } from "@/lib/bisnisIcon";
import { EditableText } from "@/components/ui/EditableText";
import { SlotImage } from "@/components/ui/SlotImage";
import { useTemplateEditor } from "../jasa/useTemplateEditor";
import { SaveBar, Toast, EditBanner, Stars, MobileNav } from "../jasa/TemplateShared";
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Phone, Mail, MapPin, AtSign, Music2, Share2, Quote, Star } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Template "Peternakan & Agri" — referensi desain: public/farm.webp
   (Framer "Ecoland"): hero foto ladang full-bleed dgn overlay hijau
   gelap, pita kuning statistik, kartu layanan hijau berfoto.
   Palet DIKUNCI (hijau tani + kuning panen) — tidak ikut warna.primary,
   sama seperti TemplateDua/TemplateLima yang mengunci paletnya.
   Setiap section full-height (min-h-[100dvh]) + full-bleed (mentok kiri-kanan).
   ───────────────────────────────────────────────────────────── */

// Foto default (Unsplash, tema tani/ternak) — dipakai bila user tidak upload foto.
const DEFAULT_HERO = "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=2000&q=70";
const DEFAULT_ABOUT = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=70";

const DEFAULT_CARA_KERJA = [
  { step: "01", title: "Konsultasi", desc: "Ceritakan kebutuhan tani/ternak Anda lewat WhatsApp, gratis." },
  { step: "02", title: "Perawatan", desc: "Kami rawat dengan standar organik dan pakan berkualitas." },
  { step: "03", title: "Panen & Kirim", desc: "Hasil segar diantar langsung sampai ke tangan Anda." },
];

interface Props extends Partial<TemplateData> {
  forceMobile?: boolean;
  isEditable?: boolean;
  isEditMode?: boolean;
  onContentUpdate?: (content: Partial<TemplateData>) => void;
  websiteId?: string;
}

export default function TemplateAgriSatu(props: Props) {
  const {
    hero = { headline: "Peternakan & Pertanian Organik Terpercaya", subheadline: "Kami membudidayakan hasil bumi dan ternak segar dengan cara organik — sehat, berkualitas, langsung dari kebun ke meja Anda.", ctaText: "Hubungi Kami" },
    about = { judul: "Dari Kebun Kami untuk Keluarga Anda", deskripsi: "Sudah bertahun-tahun kami mengelola lahan dan ternak dengan metode ramah lingkungan. Tanpa bahan kimia berlebih, hasil panen dan produk ternak kami segar, sehat, dan bisa diandalkan.", keunggulan: ["10+|Tahun Pengalaman", "5000+|Pelanggan Puas", "100%|Organik"] },
    layanan = [],
    testimonialPlaceholder = [],
    footer = { tagline: "Ayo mulai hidup sehat dengan hasil tani segar!", ctaText: "Hubungi Kami" },
    namaBisnis = "Nama Usaha",
    kategori = "",
    lokasi = "",
    kontak = { wa: "", telepon: "", email: "" },
    sosmed = { instagram: "", tiktok: "", twitter: "" },
    warna = { primary: "", tema: "light" },
    paketHarga = [],
    logo = "",
    fotoBisnis = [],
    portofolio = [],
    caraKerja = DEFAULT_CARA_KERJA,
    imagePositions,
    uiText,
    caraKerjaTitle = "Bagaimana Cara Kerjanya?",
    forceMobile,
    isEditable = false,
    isEditMode = false,
    onContentUpdate,
    websiteId,
  } = props;

  const em = isEditMode;
  const { s, patch, patchUi, setImgPos, hasChanges, saving, toast, handleSave } = useTemplateEditor({
    namaBisnis, hero, about, layanan, caraKerja, caraKerjaTitle,
    testimonials: testimonialPlaceholder, paketHarga, footer, imagePositions, uiText,
    isEditMode: em, onContentUpdate, websiteId,
  });

  // Layout mobile: ikut prop preview kalau ada, kalau tidak ikut lebar viewport asli
  // (halaman publik /s/[subdomain] tidak mengirim forceMobile).
  const isMob = useIsMobile(forceMobile);

  /* ── Palet: aksen + warna gelap struktural ikut "Preferensi Warna" user.
     Default = hijau tani + kuning panen (ref farm.webp). Kuning & krem tetap. ── */
  const leaf = brandColor(warna?.primary, "#3E9142"); // aksen tombol/badge
  const isCustomLeaf = leaf.toLowerCase() !== "#3e9142";
  const forest = isCustomLeaf ? darkTone(leaf, 0.32) : "#12341B";      // section gelap
  const forestDeep = isCustomLeaf ? darkTone(leaf, 0.2) : "#0C2412";   // paling gelap (footer/overlay)
  const yellow = "#F2C230";      // kuning panen (aksen sekunder, tetap)
  const cream = "#F7F3E8";       // krem terang (section light)
  const inkDark = "text-[#12341B]";      // teks di atas krem
  const inkLight = "text-[#F4F7F0]";     // teks di atas hijau
  const mutedDark = "text-[#5B6B54]";    // teks sekunder di atas krem
  const mutedLight = "text-[#A9BBA3]";   // teks sekunder di atas hijau

  // Section tanpa isi tidak dirender, link navbar-nya ikut hilang (hero selalu ada).
  const hasAbout = !!(s.aboutJudul.trim() || s.aboutDeskripsi.trim() || s.aboutKeunggulan.some((k) => k.trim()));

  // Logo default & badge memakai ikon sesuai jenis usaha (hewan utk ternak, tumbuhan utk tani).
  const BizIcon = getBisnisIcon(kategori);
  const waLink = `https://wa.me/${kontak.wa}?text=Halo,%20saya%20tertarik%20dengan%20produk%20Anda.`;
  // Padding horizontal — full-bleed: bg mentok kiri-kanan, konten diberi padding.
  const px = isMob ? "px-5" : "px-8 lg:px-16";

  // Hero/About = latar: pakai foto user (fotoBisnis dulu, lalu portofolio), fallback default.
  // Foto PRODUK khusus: HANYA foto produk yang diunggah user (portofolio) — tanpa foto random.
  const bgPhotos = [...(fotoBisnis || []), ...(portofolio || [])].filter(Boolean);
  const heroImg = bgPhotos[0] || DEFAULT_HERO;
  const aboutImg = bgPhotos[1] || DEFAULT_ABOUT;
  const prodImg = (i: number) => (portofolio || [])[i] || "";

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Slider layanan (ref farm.webp punya panah geser kartu).
  const svcRef = useRef<HTMLDivElement>(null);
  const scrollSvc = (dir: number) => svcRef.current?.scrollBy({ left: dir * (svcRef.current.clientWidth * 0.8), behavior: "smooth" });

  // Slider testimoni (geser bila >3 kartu).
  const testiRef = useRef<HTMLDivElement>(null);
  const scrollTesti = (dir: number) => testiRef.current?.scrollBy({ left: dir * (testiRef.current.clientWidth * 0.8), behavior: "smooth" });

  // Teks UI statis (label section, teks tombol, dll) — bisa diedit, tersimpan di uiText.
  const t = (k: string, d: string) => s.uiText[k] ?? d;

  // Ubah nilai/label statistik ke-i (disimpan sbagai "nilai|label" di aboutKeunggulan).
  const setStat = (i: number, key: "val" | "label", v: string) => {
    const withPipe = s.aboutKeunggulan.filter((k) => k.includes("|"));
    const rest = s.aboutKeunggulan.filter((k) => !k.includes("|"));
    while (withPipe.length <= i) withPipe.push("|");
    const cur = withPipe[i];
    const idx = cur.indexOf("|");
    let val = cur.slice(0, idx), label = cur.slice(idx + 1);
    if (key === "val") val = v; else label = v;
    withPipe[i] = `${val}|${label}`;
    patch({ aboutKeunggulan: [...withPipe, ...rest] });
  };

  // Stats: item format "nilai|label" saja.
  const stats = s.aboutKeunggulan
    .filter((k) => k.includes("|"))
    .slice(0, 4)
    .map((k) => {
      const i = k.indexOf("|");
      return { val: k.slice(0, i).trim(), label: k.slice(i + 1).trim() };
    });

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: cream }}>
      <style>{`
        @keyframes agri-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .agri-hscroll { -ms-overflow-style: none; scrollbar-width: none; }
        .agri-hscroll::-webkit-scrollbar { display: none; }
      `}</style>
      <EditBanner show={em} />

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${scrolled ? "backdrop-blur border-b border-white/[0.08]" : ""}`} style={{ backgroundColor: scrolled ? `${forestDeep}E6` : "transparent" }}>
        <div className={`flex items-center justify-between ${px} ${isMob ? "h-14" : "h-16"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {logo ? (
              <img src={logo} alt={namaBisnis} className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: yellow }}>
                <BizIcon className="w-4 h-4" style={{ color: forestDeep }} />
              </div>
            )}
            <EditableText value={s.namaBisnis} onChange={(v) => patch({ namaBisnis: v })} isEditMode={em} as="span" className={`font-bold tracking-tight ${inkLight} truncate ${isMob ? "text-[14px] max-w-[130px]" : "text-[16px] max-w-[220px]"}`} />
          </div>
          {!isMob && (
            <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#CBD8C4]">
              {hasAbout && <a href="#tentang" className="hover:text-white transition-colors">Tentang</a>}
              <a href="#layanan" className="hover:text-white transition-colors">Produk</a>
              {s.testimonials.length > 0 && <a href="#testimoni" className="hover:text-white transition-colors">Testimoni</a>}
              <a href="#footer" className="hover:text-white transition-colors">Kontak</a>
            </div>
          )}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 rounded-full font-bold ${isMob ? "px-4 py-2 text-[12px]" : "px-5 py-2.5 text-[13px]"}`} style={{ backgroundColor: yellow, color: forestDeep }}>
              {isMob ? <Phone className="w-4 h-4" /> : <>{s.heroCta || "Hubungi Kami"} <ArrowUpRight className="w-3.5 h-3.5" /></>}
            </a>
            {isMob && (
              <MobileNav
                bg={forestDeep}
                textColor="#CBD8C4"
                accent={yellow}
                items={[
                  ...(hasAbout ? [{ href: "#tentang", label: "Tentang" }] : []),
                  ...(s.layanan.length > 0 ? [{ href: "#layanan", label: "Produk" }] : []),
                  ...(s.testimonials.length > 0 ? [{ href: "#testimoni", label: "Testimoni" }] : []),
                  { href: "#footer", label: "Kontak" },
                ]}
              />
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero — foto ladang full-bleed + overlay hijau gelap ── */}
      <section className={`relative w-full overflow-hidden flex items-center ${isMob ? "min-h-[100dvh] pt-24 pb-16" : "h-[100dvh]"}`}>
        <div className="absolute inset-0">
          <SlotImage id="hero" src={heroImg} alt={namaBisnis} em={em} positions={s.imagePositions} setPos={setImgPos} priority />
        </div>
        {/* Overlay hijau gelap: kuat di kiri/atas → transparan ke kanan (biar foto tetap kelihatan). */}
        <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(100deg, ${forestDeep}F2 0%, ${forestDeep}D9 32%, ${forest}66 62%, transparent 100%), linear-gradient(0deg, ${forestDeep}CC, transparent 55%)` }} />

        <div className={`relative z-10 w-full ${px}`}>
          <div className={`${isMob ? "max-w-full" : "max-w-2xl"}`}>
            {em ? (
              <EditableText value={s.heroHeadline} onChange={(v) => patch({ heroHeadline: v })} isEditMode={em} as="h1" className={`font-bold tracking-tight leading-[1.05] ${inkLight} ${isMob ? "text-[38px]" : "text-[clamp(44px,6vw,78px)]"}`} />
            ) : (
              <h1 className={`font-bold tracking-tight leading-[1.05] ${inkLight} ${isMob ? "text-[38px]" : "text-[clamp(44px,6vw,78px)]"}`}>{s.heroHeadline}</h1>
            )}
            <EditableText value={s.heroSub} onChange={(v) => patch({ heroSub: v })} isEditMode={em} as="p" multiline className={`${mutedLight} leading-relaxed mt-6 max-w-xl ${isMob ? "text-[14.5px]" : "text-[16px]"}`} />

            <div className={`flex items-center gap-3 mt-9 ${isMob ? "flex-col w-full" : "flex-row"}`}>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-full font-bold ${isMob ? "w-full py-3.5 text-[14px]" : "px-7 py-3.5 text-[14px]"}`} style={{ backgroundColor: leaf, color: "#FFFFFF", boxShadow: "0 18px 50px -18px rgba(0,0,0,0.45)" }}>
                <EditableText value={s.heroCta || "Hubungi Kami"} onChange={(v) => patch({ heroCta: v })} isEditMode={em} />
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: yellow }}><ArrowRight className="w-3 h-3" style={{ color: forestDeep }} /></span>
              </a>
              <a href="#layanan" className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold ${isMob ? "w-full py-3.5 text-[14px]" : "px-7 py-3.5 text-[14px]"}`} style={{ border: `1px solid ${yellow}`, color: yellow }}>
                <EditableText value={t("hero.cta2", "Lihat Produk")} onChange={(v) => patchUi("hero.cta2", v)} isEditMode={em} />
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: yellow }}><ArrowRight className="w-3 h-3" style={{ color: forestDeep }} /></span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className={`absolute bottom-6 inset-x-0 z-10 items-center justify-center gap-1.5 ${mutedLight} ${isMob ? "hidden" : "flex"}`}>
          <span className="text-[11px] font-medium tracking-wider uppercase">Scroll</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </section>

      {/* ── Pita kuning — statistik + badge berputar + produk segar ── */}
      <section className={`relative w-full min-h-[100dvh] flex flex-col justify-center overflow-hidden ${px} ${isMob ? "py-16" : "py-24"}`} style={{ backgroundColor: yellow }}>
        {/* Tekstur daun samar */}
        <div aria-hidden className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #12341B 0 2px, transparent 2px), radial-gradient(circle at 70% 70%, #12341B 0 2px, transparent 2px)", backgroundSize: "60px 60px" }} />
        <div className={`relative z-10 w-full max-w-6xl mx-auto grid items-center ${isMob ? "grid-cols-1 gap-12 text-center" : "grid-cols-3 gap-8"}`}>
          {/* Stat pertama */}
          <div className={`${isMob ? "" : "flex flex-col"}`}>
            <EditableText value={stats[1]?.val || "5000+"} onChange={(v) => setStat(1, "val", v)} isEditMode={em} as="div" className={`font-bold tracking-tight leading-none ${inkDark} ${isMob ? "text-[44px]" : "text-[clamp(40px,4vw,58px)]"}`} />
            <EditableText value={stats[1]?.label || "Pelanggan Puas"} onChange={(v) => setStat(1, "label", v)} isEditMode={em} as="p" className={`font-semibold mt-2 ${inkDark} ${isMob ? "text-[15px]" : "text-[17px]"}`} />
            <EditableText value={t("pita.sub", "Dipercaya keluarga di berbagai daerah.")} onChange={(v) => patchUi("pita.sub", v)} isEditMode={em} as="p" className="text-[13px] mt-1" style={{ color: "#3d5236" }} />
          </div>

          {/* Badge lingkaran berputar */}
          <div className="flex items-center justify-center">
            <div className={`relative ${isMob ? "w-36 h-36" : "w-44 h-44"}`}>
              <svg viewBox="0 0 200 200" className="w-full h-full" style={{ animation: "agri-spin 22s linear infinite" }}>
                <defs>
                  <path id="agri-circle" d="M 100,100 m -74,0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0" fill="none" />
                </defs>
                <text fill={forestDeep} fontSize="15.5" fontWeight="700" letterSpacing="3.5">
                  <textPath href="#agri-circle" startOffset="0%">
                    {t("badge.text", "• ORGANIK • SEGAR • SEHAT • ALAMI")} </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`rounded-full flex items-center justify-center ${isMob ? "w-16 h-16" : "w-20 h-20"}`} style={{ backgroundColor: forest }}>
                  <BizIcon className={`${isMob ? "w-7 h-7" : "w-9 h-9"}`} style={{ color: yellow }} />
                </div>
              </div>
            </div>
          </div>
          {/* Teks lingkaran berputar bisa diedit (hanya tampil di mode edit). */}
          {em && (
            <EditableText value={t("badge.text", "• ORGANIK • SEGAR • SEHAT • ALAMI")} onChange={(v) => patchUi("badge.text", v)} isEditMode={em} as="p" className="mt-3 text-center text-[12px] font-semibold" style={{ color: forestDeep }} />
          )}

          {/* Produk segar */}
          <div className={`${isMob ? "" : "flex flex-col items-start"}`}>
            <EditableText value={t("pita.judul", "Hidup Sehat dengan Produk Segar")} onChange={(v) => patchUi("pita.judul", v)} isEditMode={em} as="div" multiline className={`font-bold tracking-tight leading-tight ${inkDark} ${isMob ? "text-[26px]" : "text-[30px]"}`} />
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 font-bold text-[14px]" style={{ color: forestDeep }}>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: forest }}><ArrowRight className="w-4 h-4" style={{ color: yellow }} /></span>
              <EditableText value={t("pita.cta", "Pesan Sekarang")} onChange={(v) => patchUi("pita.cta", v)} isEditMode={em} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Tentang — hijau gelap, foto + teks + stats ── */}
      {/* Kosong → section hilang (link navbar ikut hilang). */}
      {hasAbout && (
      <section id="tentang" className={`relative w-full min-h-[100dvh] flex flex-col justify-center overflow-hidden ${px} ${isMob ? "py-16" : "py-24"}`} style={{ backgroundColor: forest }}>
        <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(700px 400px at 85% 10%, ${yellow}14, transparent 60%)` }} />
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className={`grid items-center ${isMob ? "grid-cols-1 gap-8" : "grid-cols-2 gap-14"}`}>
            {/* Foto */}
            <div className={`relative rounded-3xl overflow-hidden ${isMob ? "h-64" : "h-[440px]"}`}>
              <SlotImage id="tentang" src={aboutImg} alt={s.aboutJudul} em={em} positions={s.imagePositions} setPos={setImgPos} />
              <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 55%, ${forestDeep}CC)` }} />
              {/* Kartu pengalaman menempel */}
              <div className="absolute bottom-4 left-4 rounded-2xl px-5 py-4" style={{ backgroundColor: yellow }}>
                <EditableText value={stats[0]?.val || "10+"} onChange={(v) => setStat(0, "val", v)} isEditMode={em} as="div" className={`font-bold leading-none ${inkDark} text-[28px]`} />
                <EditableText value={stats[0]?.label || "Tahun Pengalaman"} onChange={(v) => setStat(0, "label", v)} isEditMode={em} as="div" className="text-[12px] font-semibold mt-1" style={{ color: "#3d5236" }} />
              </div>
            </div>
            {/* Teks */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BizIcon className="w-4 h-4" style={{ color: yellow }} />
                <EditableText value={t("tentang.kicker", "Tentang Kami")} onChange={(v) => patchUi("tentang.kicker", v)} isEditMode={em} as="span" className="text-[11.5px] font-semibold uppercase tracking-[0.2em]" style={{ color: yellow }} />
              </div>
              <EditableText value={s.aboutJudul} onChange={(v) => patch({ aboutJudul: v })} isEditMode={em} as="h2" className={`font-bold tracking-tight leading-tight ${inkLight} ${isMob ? "text-[28px]" : "text-[40px]"}`} />
              <EditableText value={s.aboutDeskripsi} onChange={(v) => patch({ aboutDeskripsi: v })} isEditMode={em} as="p" multiline className={`${mutedLight} leading-relaxed mt-5 ${isMob ? "text-[14px]" : "text-[15.5px]"}`} />
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full font-bold mt-8 ${isMob ? "px-6 py-3 text-[13.5px]" : "px-7 py-3.5 text-[14px]"}`} style={{ backgroundColor: yellow, color: forestDeep }}>
                <EditableText value={t("tentang.cta", "Konsultasi Gratis")} onChange={(v) => patchUi("tentang.cta", v)} isEditMode={em} /> <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Stats bar dihapus — statistik sudah tampil di pita kuning (stat 2) & kartu
              foto Tentang (stat 1); bar ini duplikat dan sempat memunculkan angka kosong
              saat diedit karena keunggulan dari AI bukan format "nilai|label". */}
        </div>
      </section>
      )}

      {/* ── Layanan/Produk — katalog full-bleed, mentok atas-bawah-kiri-kanan seperti hero ── */}
      {s.layanan.length > 0 && (
        <section id="layanan" className={`relative w-full flex flex-col ${isMob ? "min-h-[100dvh]" : "h-[100dvh] overflow-hidden"}`} style={{ backgroundColor: cream }}>
          <div className={`relative z-10 w-full h-full flex flex-col ${px} ${isMob ? "py-7" : "py-10"}`}>
            {/* Heading + panah */}
            <div className={`flex items-end justify-between gap-4 flex-shrink-0 ${isMob ? "mb-6" : "mb-8"}`}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BizIcon className="w-4 h-4" style={{ color: leaf }} />
                  <EditableText value={t("produk.kicker", "Produk & Layanan Kami")} onChange={(v) => patchUi("produk.kicker", v)} isEditMode={em} as="span" className="text-[11.5px] font-semibold uppercase tracking-[0.2em]" style={{ color: leaf }} />
                </div>
                <EditableText value={t("produk.judul", "Hasil Tani & Ternak Terbaik Kami")} onChange={(v) => patchUi("produk.judul", v)} isEditMode={em} as="h2" className={`font-bold tracking-tight leading-tight ${inkDark} ${isMob ? "text-[28px]" : "text-[42px]"}`} />
              </div>
              {!isMob && s.layanan.length > 3 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button type="button" aria-label="Sebelumnya" onClick={() => scrollSvc(-1)} className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: forest }}><ChevronLeft className="w-5 h-5" style={{ color: yellow }} /></button>
                  <button type="button" aria-label="Berikutnya" onClick={() => scrollSvc(1)} className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: forest }}><ChevronRight className="w-5 h-5" style={{ color: yellow }} /></button>
                </div>
              )}
            </div>

            {/* Kartu katalog — grid rapi sesuai jumlah produk (≤3), slider penuh tinggi bila >3 */}
            <div
              ref={svcRef}
              className={`agri-hscroll ${isMob ? "" : "flex-1 min-h-0"} ${s.layanan.length > 3 ? "flex gap-5 overflow-x-auto snap-x snap-mandatory" : `grid gap-5 ${isMob ? "grid-cols-1 auto-rows-fr" : s.layanan.length <= 2 ? "grid-cols-1 auto-rows-fr" : "grid-cols-3"}`}`}
            >
              {s.layanan.length <= 2 ? (
                /* Kartu unggulan — hijau full, foto kiri/kanan bergantian, ditumpuk atas-bawah bila 2 */
                s.layanan.map((l, i) => (
                  <div key={i} className={`relative rounded-3xl overflow-hidden h-full flex ${isMob ? "flex-col" : "flex-row"}`} style={{ backgroundColor: forest }}>
                    {/* Tekstur — noise halus + garis diagonal + glow, biar hijau tidak flat */}
                    <div aria-hidden className="absolute inset-0 opacity-[0.5] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")" }} />
                    <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(135deg, ${leaf}22 0px, ${leaf}22 1px, transparent 1px, transparent 26px)` }} />
                    <div aria-hidden className="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${yellow}22` }} />
                    <div aria-hidden className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${leaf}30` }} />

                    <div className={`relative overflow-hidden self-stretch m-3 rounded-2xl ${isMob ? "flex-[1.2] min-h-0" : `w-1/2 flex-shrink-0 ${i % 2 === 1 ? "order-2" : ""}`}`}>
                      {prodImg(i) ? (
                        <SlotImage id={"layanan" + i} src={prodImg(i)} alt={l.nama} em={em} positions={s.imagePositions} setPos={setImgPos} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${forestDeep}, ${forest})` }}>
                          <BizIcon className="w-14 h-14" style={{ color: yellow, opacity: 0.45 }} />
                        </div>
                      )}
                    </div>
                    <div className={`relative z-10 flex flex-col justify-between flex-1 min-w-0 ${isMob ? "px-6 pb-8 pt-4" : "px-10 py-8"}`}>
                      <div>
                        <EditableText value={l.nama} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], nama: v }; patch({ layanan: a }); }} isEditMode={em} as="h3" className={`font-bold ${inkLight} leading-snug mb-3 ${isMob ? "text-[24px]" : "text-[32px]"}`} />
                        <EditableText value={l.deskripsi} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], deskripsi: v }; patch({ layanan: a }); }} isEditMode={em} as="p" multiline className={`${mutedLight} leading-relaxed max-w-md ${isMob ? "text-[13.5px]" : "text-[15px]"}`} />
                      </div>
                      <div className={`flex items-center gap-4 mt-7 ${isMob ? "flex-col items-start" : "flex-row"}`}>
                        {l.harga && (
                          <EditableText value={l.harga} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], harga: v }; patch({ layanan: a }); }} isEditMode={em} as="span" className={`font-bold ${inkLight} text-[15px]`} />
                        )}
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-transform hover:scale-105 ${isMob ? "w-full py-3 text-[14px]" : "px-7 py-3 text-[14px]"}`} style={{ backgroundColor: yellow, color: forestDeep }}>
                          {l.harga ? t("produk.ctaHarga", "Pesan Sekarang") : t("produk.ctaTanpaHarga", "Hubungi Kami")} <ArrowUpRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                s.layanan.map((l, i) => (
                  <div key={i} className={`group relative rounded-3xl overflow-hidden flex flex-col h-full ${s.layanan.length > 3 ? `snap-start shrink-0 ${isMob ? "w-[280px]" : "w-[340px]"}` : ""}`} style={{ backgroundColor: forest }}>
                    {/* Foto — mengisi porsi kartu, bukan tinggi tetap */}
                    <div className="relative overflow-hidden flex-[1.3] min-h-0 m-3 rounded-2xl">
                      {prodImg(i) ? (
                        <SlotImage id={"layanan" + i} src={prodImg(i)} alt={l.nama} em={em} positions={s.imagePositions} setPos={setImgPos} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${forestDeep}, ${forest})` }}>
                          <BizIcon className="w-14 h-14" style={{ color: yellow, opacity: 0.45 }} />
                        </div>
                      )}
                    </div>
                    {/* Isi */}
                    <div className="px-5 pb-6 pt-1 flex flex-col flex-shrink-0">
                      <span className="inline-flex self-start items-center rounded-full px-3 py-1 mb-3 text-[11px] font-semibold border" style={{ borderColor: `${yellow}55`, color: yellow }}>
                        {t("produk.badge", "Kategori Unggulan")}
                      </span>
                      <EditableText value={l.nama} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], nama: v }; patch({ layanan: a }); }} isEditMode={em} as="h3" className={`font-bold ${inkLight} text-[19px] leading-snug mb-2`} />
                      <EditableText value={l.deskripsi} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], deskripsi: v }; patch({ layanan: a }); }} isEditMode={em} as="p" multiline className={`${mutedLight} text-[13px] leading-relaxed`} />
                      <div className="flex items-center justify-between mt-4">
                        {l.harga ? (
                          <EditableText value={l.harga} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], harga: v }; patch({ layanan: a }); }} isEditMode={em} as="span" className={`text-[13px] font-bold ${inkLight}`} />
                        ) : <span />}
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5 flex-shrink-0" style={{ backgroundColor: yellow }}>
                          <ArrowUpRight className="w-4 h-4" style={{ color: forestDeep }} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Cara Kerja — krem, 3 langkah, bg diberi tekstur biar tidak sepi ── */}
      {s.caraKerja.length > 0 && (
        <section className={`relative w-full min-h-[100dvh] flex flex-col justify-center overflow-hidden ${px} ${isMob ? "py-16" : "py-24"}`} style={{ backgroundColor: cream }}>
          {/* Dekorasi latar — dot grid + blob + garis diagonal + ikon tabur */}
          <div aria-hidden className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: `radial-gradient(${leaf}55 1.4px, transparent 1.4px)`, backgroundSize: "22px 22px" }} />
          <div aria-hidden className="absolute -top-28 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${leaf}26` }} />
          <div aria-hidden className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${yellow}2E` }} />
          <div aria-hidden className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(115deg, ${leaf}14 0px, ${leaf}14 1px, transparent 1px, transparent 90px)` }} />
          <BizIcon aria-hidden className={`absolute w-10 h-10 ${isMob ? "hidden" : "top-16 left-[10%]"}`} style={{ color: `${leaf}40`, transform: "rotate(-14deg)" }} />
          <BizIcon aria-hidden className={`absolute w-9 h-9 ${isMob ? "hidden" : "bottom-20 right-[9%]"}`} style={{ color: `${yellow}55`, transform: "rotate(18deg)" }} />

          <div className="w-full max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-3">
                <BizIcon className="w-4 h-4" style={{ color: leaf }} />
                <EditableText value={t("proses.kicker", "Prosesnya Mudah")} onChange={(v) => patchUi("proses.kicker", v)} isEditMode={em} as="span" className="text-[11.5px] font-semibold uppercase tracking-[0.2em]" style={{ color: leaf }} />
              </div>
              <EditableText value={s.caraKerjaTitle} onChange={(v) => patch({ caraKerjaTitle: v })} isEditMode={em} as="h2" className={`font-bold tracking-tight ${inkDark} ${isMob ? "text-[28px]" : "text-[42px]"}`} />
            </div>
            <div className={`grid gap-6 ${isMob ? "grid-cols-1" : "grid-cols-3"} relative`}>
              {!isMob && (
                <div aria-hidden className="absolute top-6 left-0 right-0 h-px" style={{ background: `repeating-linear-gradient(90deg, ${leaf}55 0 10px, transparent 10px 18px)` }} />
              )}
              {s.caraKerja.slice(0, 3).map((ck, i) => (
                <div key={i} className="relative rounded-3xl p-7 border shadow-sm" style={{ borderColor: `${leaf}33`, backgroundColor: "#FFFFFF" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] mb-5 relative z-10" style={{ backgroundColor: forest, color: yellow }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <EditableText value={ck.title} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], title: v }; patch({ caraKerja: a }); }} isEditMode={em} as="h3" className={`font-bold ${inkDark} text-[18px] mb-2`} />
                  <EditableText value={ck.desc} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], desc: v }; patch({ caraKerja: a }); }} isEditMode={em} as="p" multiline className={`${mutedDark} text-[13.5px] leading-relaxed`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimoni — tanpa foto profil, avatar inisial berwarna + dekorasi ramai ── */}
      {s.testimonials.length > 0 && (
        <section id="testimoni" className={`relative w-full min-h-[100dvh] flex flex-col justify-center overflow-hidden ${isMob ? "py-16" : "py-24"}`} style={{ backgroundColor: cream }}>
          {/* Dekorasi latar: dot grid + blob warna + garis diagonal + ikon tabur, biar section tidak kosong */}
          <div aria-hidden className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: `radial-gradient(${leaf}55 1.4px, transparent 1.4px)`, backgroundSize: "22px 22px" }} />
          <div aria-hidden className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${yellow}33` }} />
          <div aria-hidden className="absolute -bottom-28 -left-20 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${leaf}26` }} />
          <div aria-hidden className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: `${forest}12` }} />
          <div aria-hidden className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(115deg, ${leaf}14 0px, ${leaf}14 1px, transparent 1px, transparent 90px)` }} />
          <BizIcon aria-hidden className={`absolute w-10 h-10 ${isMob ? "hidden" : "top-14 right-[28%]"}`} style={{ color: `${yellow}55`, transform: "rotate(-12deg)" }} />
          <BizIcon aria-hidden className={`absolute w-8 h-8 ${isMob ? "top-6 right-6" : "bottom-16 right-[12%]"}`} style={{ color: `${leaf}40`, transform: "rotate(20deg)" }} />
          <Quote aria-hidden className={`absolute w-24 h-24 ${isMob ? "hidden" : "bottom-10 left-[6%]"}`} style={{ color: `${forest}0F` }} />

          <div className={`w-full relative z-10 ${px}`}>
            <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
              <div className="text-left">
                <EditableText value={t("testi.judul", "Apa Kata Pelanggan Kami")} onChange={(v) => patchUi("testi.judul", v)} isEditMode={em} as="h2" className={`font-bold tracking-tight ${inkDark} ${isMob ? "text-[28px]" : "text-[42px]"}`} />
                {/* Ringkasan rating — bikin section terasa lebih ramai & meyakinkan */}
                <div className="inline-flex items-center gap-2.5 mt-5 rounded-full px-5 py-2 border" style={{ borderColor: `${leaf}33`, backgroundColor: "#FFFFFF" }}>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="w-4 h-4" style={{ color: yellow, fill: yellow }} />
                    ))}
                  </div>
                  <span className={`text-[13px] font-bold ${inkDark}`}>
                    {(s.testimonials.reduce((sum, t) => sum + (t.rating ?? 5), 0) / s.testimonials.length).toFixed(1)}/5
                  </span>
                  <span className={`text-[12px] ${mutedDark}`}>dari {s.testimonials.length} pelanggan</span>
                </div>
              </div>
              {!isMob && s.testimonials.length > 3 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button type="button" aria-label="Sebelumnya" onClick={() => scrollTesti(-1)} className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: forest }}><ChevronLeft className="w-5 h-5" style={{ color: yellow }} /></button>
                  <button type="button" aria-label="Berikutnya" onClick={() => scrollTesti(1)} className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: forest }}><ChevronRight className="w-5 h-5" style={{ color: yellow }} /></button>
                </div>
              )}
            </div>

            <div
              ref={testiRef}
              className={
                s.testimonials.length > 3
                  ? "agri-hscroll flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2"
                  : `grid gap-6 ${isMob ? "grid-cols-1" : s.testimonials.length === 1 ? "grid-cols-1 max-w-2xl" : s.testimonials.length === 2 ? "grid-cols-2" : "grid-cols-3"}`
              }
            >
              {s.testimonials.slice(0, 6).map((t, i) => {
                const accent = [leaf, yellow, forest][i % 3];
                const initial = (t.nama || "?").trim().charAt(0).toUpperCase() || "?";
                return (
                  <div
                    key={i}
                    className={`relative rounded-3xl flex flex-col ${isMob ? "p-7" : "p-9"} ${s.testimonials.length > 3 ? `snap-start shrink-0 ${isMob ? "w-[300px]" : "w-[400px]"}` : ""}`}
                    style={{ backgroundColor: "#FFFFFF", borderTop: `4px solid ${accent}`, minHeight: isMob ? undefined : 320, boxShadow: "0 20px 45px -30px rgba(18,52,27,0.35)" }}
                  >
                    <Quote className="absolute top-6 right-6 w-11 h-11" style={{ color: `${accent}22` }} />
                    <Stars rating={t.rating ?? 5} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], rating: v }; patch({ testimonials: a }); }} isEditMode={em} color={yellow} />
                    <EditableText value={t.teks} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], teks: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" multiline className={`${mutedDark} leading-relaxed my-5 ${isMob ? "text-[14px]" : "text-[16px]"} flex-1 relative z-10`} />
                    <div className="flex items-center gap-3 mt-2 pt-5 border-t" style={{ borderColor: `${leaf}1F` }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] flex-shrink-0" style={{ backgroundColor: `${accent}1F`, color: accent }}>
                        {initial}
                      </div>
                      <div>
                        <EditableText value={t.nama} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], nama: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" className={`font-bold ${inkDark} text-[15px] leading-tight`} />
                        <EditableText value={t.peran} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], peran: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" className="text-[12.5px] mt-0.5" style={{ color: leaf }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA + Footer — hijau gelap ── */}
      <footer id="footer" className="relative w-full overflow-hidden" style={{ backgroundColor: forestDeep }}>
        <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(600px 320px at 15% 20%, ${leaf}22, transparent 60%), radial-gradient(500px 280px at 85% 90%, ${yellow}12, transparent 60%)` }} />
        {/* CTA */}
        <div className={`relative z-10 w-full max-w-5xl mx-auto text-center ${px} ${isMob ? "pt-16 pb-12" : "pt-24 pb-16"}`}>
          <EditableText value={s.footerTagline} onChange={(v) => patch({ footerTagline: v })} isEditMode={em} as="h2" className={`font-bold tracking-tight leading-tight ${inkLight} mx-auto max-w-3xl ${isMob ? "text-[30px]" : "text-[clamp(34px,5vw,56px)]"}`} />
          <div className={`flex items-center justify-center gap-3 mt-8 ${isMob ? "flex-col" : "flex-row"}`}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-full font-bold ${isMob ? "w-full py-3.5 text-[14px]" : "px-8 py-4 text-[15px]"}`} style={{ backgroundColor: yellow, color: forestDeep }}>
              <EditableText value={s.footerCta || "Hubungi Kami"} onChange={(v) => patch({ footerCta: v })} isEditMode={em} /> <ArrowRight className="w-4 h-4" />
            </a>
            {kontak.telepon && (
              <a href={`tel:${kontak.telepon}`} className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold ${isMob ? "w-full py-3.5 text-[14px]" : "px-8 py-4 text-[15px]"}`} style={{ border: `1px solid ${yellow}66`, color: yellow }}>
                <Phone className="w-4 h-4" /> {kontak.telepon}
              </a>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className={`relative z-10 ${px} border-t border-white/[0.08]`}>
          <div className={`w-full max-w-6xl mx-auto grid gap-8 ${isMob ? "grid-cols-1 py-10" : "grid-cols-3 py-14"}`}>
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                {logo ? <img src={logo} alt={namaBisnis} className="w-8 h-8 rounded-lg object-contain" /> : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: yellow }}><BizIcon className="w-4 h-4" style={{ color: forestDeep }} /></div>
                )}
                <span className={`font-bold text-[16px] ${inkLight}`}>{s.namaBisnis}</span>
              </div>
              <EditableText value={s.footerDesc} onChange={(v) => patch({ footerDesc: v })} isEditMode={em} as="p" multiline className={`${mutedLight} text-[13px] leading-relaxed`} />
            </div>
            <div>
              <EditableText value={s.footerKontakTitle} onChange={(v) => patch({ footerKontakTitle: v })} isEditMode={em} as="h4" className={`font-bold text-[13.5px] ${inkLight} mb-3`} />
              <ul className={`space-y-2.5 text-[13px] ${mutedLight}`}>
                {kontak.wa && <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" style={{ color: yellow }} /> {kontak.wa}</li>}
                {kontak.email && <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" style={{ color: yellow }} /> {kontak.email}</li>}
                {lokasi && <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" style={{ color: yellow }} /> {lokasi}</li>}
              </ul>
            </div>
            <div>
              <EditableText value={s.footerSosmedTitle} onChange={(v) => patch({ footerSosmedTitle: v })} isEditMode={em} as="h4" className={`font-bold text-[13.5px] ${inkLight} mb-3`} />
              <ul className={`space-y-2.5 text-[13px] ${mutedLight}`}>
                {sosmed.instagram && <li className="flex items-center gap-2"><AtSign className="w-3.5 h-3.5" style={{ color: yellow }} /> @{sosmed.instagram}</li>}
                {sosmed.tiktok && <li className="flex items-center gap-2"><Music2 className="w-3.5 h-3.5" style={{ color: yellow }} /> @{sosmed.tiktok}</li>}
                {sosmed.twitter && <li className="flex items-center gap-2"><Share2 className="w-3.5 h-3.5" style={{ color: yellow }} /> @{sosmed.twitter}</li>}
              </ul>
            </div>
          </div>
          <div className="w-full max-w-6xl mx-auto border-t border-white/[0.08] py-6 text-center">
            <EditableText value={s.copyright} onChange={(v) => patch({ copyright: v })} isEditMode={em} as="p" className={`text-[12px] ${mutedLight}`} />
          </div>
        </div>
      </footer>

      {isEditable && !em && <SaveBar show={hasChanges} saving={saving} onSave={handleSave} />}
      <Toast message={toast} />
    </div>
  );
}
