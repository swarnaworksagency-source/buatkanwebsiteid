"use client";

import { useEffect, useRef, useState } from "react";
import type { TemplateData } from "@/types";
import { useIsMobile } from "@/components/ui/useIsMobile";
import { brandColor, textOn, darkTone } from "@/lib/brandColor";
import { EditableText } from "@/components/ui/EditableText";
import { EditableImage } from "@/components/ui/EditableImage";
import { useTemplateEditor } from "../jasa/useTemplateEditor";
import { SaveBar, Toast, EditBanner, Stars, MobileNav } from "../jasa/TemplateShared";
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Phone, Mail, MapPin, AtSign, Music2, Share2, Leaf, Quote, Star, Circle } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Template "Agri Corporate" (peternakan-002) — referensi desain:
   public/cth1.webp. Gaya korporat-agritech: putih bersih, aksen
   hijau lime terang, teks near-black, kartu bento, pil navigasi,
   kartu "Misi Kami" kaca menempel di hero.
   Palet DIKUNCI (lime + ink) — tidak mengikuti warna.primary,
   sama seperti TemplateAgriSatu.
   Semua section full-bleed (mentok kiri-kanan) + full height
   (min-h-[100dvh]).
   ───────────────────────────────────────────────────────────── */

const DEFAULT_HERO = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=2000&q=70"; // hamparan kebun/lahan panen
// Semua foto default bernuansa kebun/lahan panen (bukan ternak) — cocok tema korporat-agri.
const DEFAULT_CARDS = [
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=70", // ladang sayur
  "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=70",    // bibit tumbuh
  "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=1200&q=70", // musim panen
  "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1200&q=70", // traktor di lahan
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=70", // hamparan kebun
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=70", // petani di kebun
];
const DEFAULT_ABOUT = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=70";

const DEFAULT_CARA_KERJA = [
  { step: "01", title: "Konsultasi", desc: "Ceritakan kebutuhan tani/ternak Anda lewat WhatsApp, gratis." },
  { step: "02", title: "Perawatan", desc: "Kami rawat dengan standar organik dan pakan berkualitas." },
  { step: "03", title: "Panen & Kirim", desc: "Hasil segar diantar langsung sampai ke tangan Anda." },
];

/* Teks UI statis yang bisa diedit inline; nilainya disimpan di generated_content.uiText.
   Sengaja di module scope — kalau didefinisikan di dalam komponen, tiap render bikin
   tipe komponen baru sehingga editor inline ter-remount saat mengetik. */
function UiText({ k, d, em, uiText, patchUi, ...rest }: {
  k: string;
  d: string;
  em: boolean;
  uiText: Record<string, string>;
  patchUi: (key: string, value: string) => void;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p";
  multiline?: boolean;
  style?: React.CSSProperties;
}) {
  return <EditableText value={uiText[k] ?? d} onChange={(v) => patchUi(k, v)} isEditMode={em} {...rest} />;
}

/* Gambar slot: bisa digeser & di-zoom saat edit mode, posisi tersimpan per id.
   Module scope karena alasan yang sama (drag akan putus kalau komponen di-remount). */
function SlotImage({ id, src, alt, em, positions, setPos, priority }: {
  id: string;
  src: string;
  alt: string;
  em: boolean;
  positions: Record<string, { x: number; y: number; scale: number }>;
  setPos: (id: string, pos: { x: number; y: number; scale: number }) => void;
  priority?: boolean;
}) {
  return <EditableImage src={src} alt={alt} isEditMode={em} pos={positions[id]} onChange={(pos) => setPos(id, pos)} priority={priority} />;
}

interface Props extends Partial<TemplateData> {
  forceMobile?: boolean;
  isEditable?: boolean;
  isEditMode?: boolean;
  onContentUpdate?: (content: Partial<TemplateData>) => void;
  websiteId?: string;
}

export default function TemplateAgriDua(props: Props) {
  const {
    hero = { headline: "Menghadirkan Inovasi untuk Perjalanan Tani Anda", subheadline: "Dari pertanian presisi sampai praktik berkelanjutan, kami bantu Anda bertani lebih efisien dan lebih untung.", ctaText: "Mulai Sekarang" },
    about = { judul: "Berbekal pengalaman bertahun-tahun di bidang tani dan teknologi, kami berkomitmen membantu petani bekerja lebih cerdas dan panen lebih baik.", deskripsi: "Dengan memadukan inovasi dan keberlanjutan, kami membantu petani meningkatkan produktivitas, menekan limbah, dan menjaga bumi tetap sehat untuk generasi berikutnya.", keunggulan: ["10+|Tahun Inovasi Pertanian", "85%|Tingkat Kepuasan Pelanggan", "5000+|Pelanggan Terlayani"] },
    layanan = [],
    testimonialPlaceholder = [],
    footer = { tagline: "Siap tumbuh bersama kami?", ctaText: "Hubungi Kami" },
    namaBisnis = "Nama Usaha",
    lokasi = "",
    kontak = { wa: "", telepon: "", email: "" },
    sosmed = { instagram: "", tiktok: "", twitter: "" },
    warna = { primary: "", tema: "light" },
    paketHarga = [],
    logo = "",
    fotoBisnis = [],
    portofolio = [],
    caraKerja = DEFAULT_CARA_KERJA,
    caraKerjaTitle = "Bagaimana Cara Kerjanya?",
    uiText,
    imagePositions,
    forceMobile,
    isEditable = false,
    isEditMode = false,
    onContentUpdate,
    websiteId,
  } = props;

  const em = isEditMode;
  const { s, patch, patchUi, setImgPos, hasChanges, saving, toast, handleSave } = useTemplateEditor({
    namaBisnis, hero, about, layanan, caraKerja, caraKerjaTitle,
    testimonials: testimonialPlaceholder, paketHarga, footer, uiText, imagePositions,
    isEditMode: em, onContentUpdate, websiteId,
  });


  // Layout mobile: ikut prop preview kalau ada, kalau tidak ikut lebar viewport asli
  // (halaman publik /s/[subdomain] tidak mengirim forceMobile).
  const isMob = useIsMobile(forceMobile);

  /* ── Aksen (lime) ikut "Preferensi Warna" user; ink & shell struktural tetap. ── */
  const limeDefault = "#CBEF4A";
  const lime = brandColor(warna?.primary, limeDefault);          // aksen tombol/kartu highlight
  const isCustomLime = lime.toLowerCase() !== limeDefault.toLowerCase();
  const limeDeep = isCustomLime ? lime : "#B4DD2E";              // varian pekat (hover/border)
  // Dark struktural (hero overlay, section gelap, footer) ikut warna user bila memilih.
  const ink = isCustomLime ? darkTone(lime, 0.16) : "#12160F";  // near-black (section gelap + teks)
  const inkSoft = isCustomLime ? darkTone(lime, 0.24) : "#1D2318"; // gelap sekunder
  const paper = "#FFFFFF";       // putih
  const shell = "#F1F1EE";       // abu terang latar section
  const textDark = "text-[#12160F]";
  const textLight = "text-[#F6F8F1]";
  const mutedDark = "text-[#6B7263]";
  const mutedLight = "text-[#A7AF9C]";

  const waLink = `https://wa.me/${kontak.wa}?text=Halo,%20saya%20tertarik%20dengan%20produk%20Anda.`;
  // Full-bleed: background mentok kiri-kanan, hanya konten yang diberi padding.
  const px = isMob ? "px-5" : "px-8 lg:px-14";

  /* ── Sumber foto — sesuai TEMPLATE_PHOTO_SLOTS['peternakan-002'] di lib/templates.ts:
     fotoBisnis[0]=hero, [1]=tentang, [2]=bento; portofolio[i]=kartu produk ke-i.
     Website lama (sebelum slot bernama) tetap tampil lewat rantai fallback. ── */
  const slot = (i: number) => (fotoBisnis || [])[i] || "";
  const legacy = [...(fotoBisnis || []), ...(portofolio || [])].filter(Boolean);
  const heroImg = slot(0) || legacy[0] || DEFAULT_HERO;
  const aboutImg = slot(1) || legacy[1] || DEFAULT_ABOUT;
  const bentoImg = slot(2) || legacy[2] || DEFAULT_CARDS[0];
  const cardImg = (i: number) => (portofolio || [])[i] || slot(3 + i) || legacy[i] || DEFAULT_CARDS[i % DEFAULT_CARDS.length];

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Slider produk & testimoni (kartu geser bila jumlahnya banyak).
  const svcRef = useRef<HTMLDivElement>(null);
  const scrollSvc = (dir: number) => svcRef.current?.scrollBy({ left: dir * (svcRef.current.clientWidth * 0.8), behavior: "smooth" });
  const testiRef = useRef<HTMLDivElement>(null);
  const scrollTesti = (dir: number) => testiRef.current?.scrollBy({ left: dir * (testiRef.current.clientWidth * 0.8), behavior: "smooth" });

  // Stats: item aboutKeunggulan format "nilai|label".
  const stats = s.aboutKeunggulan
    .filter((k) => k.includes("|"))
    .slice(0, 4)
    .map((k) => {
      const i = k.indexOf("|");
      return { val: k.slice(0, i).trim(), label: k.slice(i + 1).trim() };
    });
  // Poin non-stat dipakai jadi isi tab "Keunggulan".
  const plainPoints = s.aboutKeunggulan.filter((k) => !k.includes("|"));

  // ≤2 produk → kartu lebar mengisi tinggi section (pola sama TemplateAgriSatu).
  const isWideCard = s.layanan.length > 0 && s.layanan.length <= 2;

  /* ── Tab section Tentang (ref cth1.webp: pil About/Journey/Vision/Mission).
     Tab hanya muncul bila datanya ada — tidak mengarang konten. ── */
  const tabs: { key: string; label: string }[] = [
    { key: "tentang", label: "Tentang" },
    ...(s.caraKerja.length > 0 ? [{ key: "proses", label: "Proses" }] : []),
    ...(plainPoints.length > 0 ? [{ key: "keunggulan", label: "Keunggulan" }] : []),
    ...(s.layanan.length > 0 ? [{ key: "produk", label: "Produk" }] : []),
  ];
  const [tab, setTab] = useState("tentang");

  // Section tanpa isi tidak dirender, link navbar-nya ikut hilang (hero selalu ada).
  const hasAbout = !!(s.aboutJudul.trim() || s.aboutDeskripsi.trim() || s.aboutKeunggulan.some((k) => k.trim()));
  const hasTentang = hasAbout || s.caraKerja.length > 0 || s.layanan.length > 0;
  // Label menu mobile ikut teks navbar yang sudah diedit user (uiText).
  const t = (k: string, d: string) => s.uiText[k] ?? d;

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: shell }}>
      <style>{`
        .agc-hscroll { -ms-overflow-style: none; scrollbar-width: none; }
        .agc-hscroll::-webkit-scrollbar { display: none; }
      `}</style>
      <EditBanner show={em} />

      {/* ── Navbar — pil kaca mengambang di atas hero ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${scrolled ? "backdrop-blur-md border-b border-white/[0.08]" : ""}`} style={{ backgroundColor: scrolled ? `${ink}D9` : "transparent" }}>
        <div className={`flex items-center justify-between gap-4 ${px} ${isMob ? "h-14" : "h-[72px]"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {logo ? (
              <img src={logo} alt={namaBisnis} className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: lime }}>
                <Leaf className="w-4 h-4" style={{ color: ink }} />
              </div>
            )}
            <EditableText value={s.namaBisnis} onChange={(v) => patch({ namaBisnis: v })} isEditMode={em} as="span" className={`font-semibold tracking-tight ${textLight} truncate ${isMob ? "text-[14px] max-w-[130px]" : "text-[17px] max-w-[220px]"}`} />
          </div>

          {!isMob && (
            <div className="hidden md:flex items-center gap-1 text-[13px] font-medium">
              {[
                ...(hasTentang ? [{ href: "#tentang", k: "nav.tentang", d: "Tentang" }] : []),
                { href: "#produk", k: "nav.produk", d: "Produk" },
                ...(s.testimonials.length > 0 ? [{ href: "#testimoni", k: "nav.testimoni", d: "Testimoni" }] : []),
                { href: "#footer", k: "nav.kontak", d: "Kontak" },
              ].map((n) => (
                <a key={n.href} href={n.href} className="rounded-full px-4 py-2 text-[#DCE3D2] hover:bg-white/10 hover:text-white transition-colors">
                  <UiText em={em} uiText={s.uiText} patchUi={patchUi} k={n.k} d={n.d} />
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 flex-shrink-0">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full font-bold ${isMob ? "px-4 py-2 text-[12px]" : "px-5 py-2.5 text-[13px]"}`} style={{ backgroundColor: lime, color: ink }}>
              {isMob ? <Phone className="w-4 h-4" /> : <><Circle className="w-2 h-2" style={{ color: ink, fill: ink }} /> {s.heroCta || "Hubungi Kami"}</>}
            </a>
            {isMob && (
              <MobileNav
                bg={ink}
                textColor="#DCE3D2"
                accent={lime}
                items={[
                  ...(hasTentang ? [{ href: "#tentang", label: t("nav.tentang", "Tentang") }] : []),
                  ...(s.layanan.length > 0 ? [{ href: "#produk", label: t("nav.produk", "Produk") }] : []),
                  ...(s.testimonials.length > 0 ? [{ href: "#testimoni", label: t("nav.testimoni", "Testimoni") }] : []),
                  { href: "#footer", label: t("nav.kontak", "Kontak") },
                ]}
              />
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero — foto full-bleed, headline kiri, kartu "Misi Kami" kaca kanan ── */}
      <section className={`relative w-full overflow-hidden flex items-end ${isMob ? "min-h-[100dvh] pt-24" : "h-[100dvh]"}`}>
        <div className="absolute inset-0">
          <SlotImage em={em} positions={s.imagePositions} setPos={setImgPos} id="hero" src={heroImg} alt={namaBisnis} priority />
        </div>
        <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${ink}99 0%, transparent 38%), linear-gradient(20deg, ${ink}F0 0%, ${ink}A6 42%, transparent 78%)` }} />

        <div className={`relative z-10 w-full ${px} ${isMob ? "pb-12" : "pb-16"}`}>
          <div className={`w-full flex ${isMob ? "flex-col gap-8" : "flex-row items-end justify-between gap-10"}`}>
            <div className={`${isMob ? "w-full" : "max-w-2xl"}`}>
              {em ? (
                <EditableText value={s.heroHeadline} onChange={(v) => patch({ heroHeadline: v })} isEditMode={em} as="h1" className={`font-semibold tracking-tight leading-[1.06] text-white ${isMob ? "text-[36px]" : "text-[clamp(42px,5.4vw,72px)]"}`} />
              ) : (
                <h1 className={`font-semibold tracking-tight leading-[1.06] text-white ${isMob ? "text-[36px]" : "text-[clamp(42px,5.4vw,72px)]"}`}>{s.heroHeadline}</h1>
              )}
              <EditableText value={s.heroSub} onChange={(v) => patch({ heroSub: v })} isEditMode={em} as="p" multiline className={`text-[#D5DCC9] leading-relaxed mt-5 max-w-xl ${isMob ? "text-[14px]" : "text-[15.5px]"}`} />

              <div className={`flex items-center gap-3 mt-8 ${isMob ? "flex-col w-full" : "flex-row"}`}>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-3 rounded-full font-bold ${isMob ? "w-full py-2.5 pl-6 pr-2.5 text-[14px]" : "py-2.5 pl-7 pr-2.5 text-[14px]"}`} style={{ backgroundColor: lime, color: ink }}>
                  <EditableText value={s.heroCta || "Mulai Sekarang"} onChange={(v) => patch({ heroCta: v })} isEditMode={em} />
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: ink }}><ArrowRight className="w-4 h-4" style={{ color: lime }} /></span>
                </a>
                <a href="#produk" className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold border border-white/30 text-white ${isMob ? "w-full py-3.5 text-[14px]" : "px-7 py-3.5 text-[14px]"}`}>
                  <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="hero.cta2" d="Lihat Produk" /> <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Kartu misi — kaca, sejajar bawah (ref cth1.webp) */}
            <div className={`rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 ${isMob ? "w-full" : "w-[330px] flex-shrink-0"}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lime }} />
                <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="hero.misiTitle" d="Misi Kami" as="span" className="text-[13px] font-semibold text-white" />
              </div>
              <p className="text-[13px] leading-relaxed text-[#D5DCC9] line-clamp-5">{s.aboutDeskripsi}</p>
              <a href="#tentang" className="inline-flex items-center gap-2 mt-5 text-[13px] font-semibold text-white">
                <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="hero.misiLink" d="Selengkapnya" /> <ArrowUpRight className="w-3.5 h-3.5" style={{ color: lime }} />
              </a>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-4 inset-x-0 z-10 flex items-center justify-center gap-1.5 ${mutedLight} ${isMob ? "hidden" : ""}`}>
          <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="hero.scroll" d="Scroll" as="span" className="text-[11px] font-medium tracking-wider uppercase" />
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </section>

      {/* ── Tentang — putih, pil tab + headline besar + bento statistik ── */}
      {/* Kosong → section hilang (link navbar ikut hilang). */}
      {hasTentang && (
      <section id="tentang" className={`relative w-full min-h-[100dvh] flex flex-col justify-center ${px} ${isMob ? "py-16" : "py-20"}`} style={{ backgroundColor: paper }}>
        <div className="w-full max-w-6xl mx-auto">
          {/* Pil tab */}
          <div className={`flex items-center gap-2 flex-wrap border-b pb-6 ${isMob ? "" : "pb-8"}`} style={{ borderColor: "#E6E6E1" }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-full px-5 py-2 text-[13px] font-semibold transition-colors border ${tab === t.key ? "" : "hover:bg-black/[0.04]"}`}
                style={tab === t.key
                  ? { backgroundColor: lime, borderColor: limeDeep, color: ink }
                  : { backgroundColor: "transparent", borderColor: "#DDDDD6", color: "#6B7263" }}
              >
                <UiText em={em} uiText={s.uiText} patchUi={patchUi} k={"tab." + t.key} d={t.label} />
              </button>
            ))}
          </div>

          {/* Isi tab */}
          <div className={`grid items-start ${isMob ? "grid-cols-1 gap-6 mt-8" : "grid-cols-[200px_1fr] gap-10 mt-12"}`}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ink }} />
              <UiText em={em} uiText={s.uiText} patchUi={patchUi}
                k={"tab." + tab + ".label"}
                d={tab === "tentang" ? `Siapa Kami di ${s.namaBisnis}` : tab === "proses" ? "Cara Kami Bekerja" : tab === "keunggulan" ? "Kenapa Memilih Kami" : "Yang Kami Tawarkan"}
                as="span"
                className={`text-[12.5px] font-medium ${mutedDark}`}
              />
            </div>

            <div>
              {tab === "tentang" && (
                <>
                  <EditableText value={s.aboutJudul} onChange={(v) => patch({ aboutJudul: v })} isEditMode={em} as="h2" multiline className={`font-semibold tracking-tight leading-[1.18] ${textDark} ${isMob ? "text-[24px]" : "text-[clamp(26px,2.6vw,38px)]"}`} />
                  <EditableText value={s.aboutDeskripsi} onChange={(v) => patch({ aboutDeskripsi: v })} isEditMode={em} as="p" multiline className={`${mutedDark} leading-relaxed mt-6 max-w-3xl ${isMob ? "text-[13.5px]" : "text-[14.5px]"}`} />
                </>
              )}

              {tab === "proses" && (
                <div className={`grid gap-5 ${isMob ? "grid-cols-1" : "grid-cols-3"}`}>
                  {s.caraKerja.slice(0, 3).map((ck, i) => (
                    <div key={i} className="rounded-2xl border p-6" style={{ borderColor: "#E6E6E1" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] mb-4" style={{ backgroundColor: lime, color: ink }}>{String(i + 1).padStart(2, "0")}</div>
                      <EditableText value={ck.title} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], title: v }; patch({ caraKerja: a }); }} isEditMode={em} as="h3" className={`font-semibold ${textDark} text-[17px] mb-2`} />
                      <EditableText value={ck.desc} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], desc: v }; patch({ caraKerja: a }); }} isEditMode={em} as="p" multiline className={`${mutedDark} text-[13.5px] leading-relaxed`} />
                    </div>
                  ))}
                </div>
              )}

              {tab === "keunggulan" && (
                <ul className={`grid gap-3 ${isMob ? "grid-cols-1" : "grid-cols-2"}`}>
                  {plainPoints.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-2xl border px-5 py-4" style={{ borderColor: "#E6E6E1" }}>
                      <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: lime }}>
                        <Leaf className="w-3.5 h-3.5" style={{ color: ink }} />
                      </span>
                      <EditableText
                        value={p}
                        onChange={(v) => { const rest = [...plainPoints]; rest[i] = v; patch({ aboutKeunggulan: [...s.aboutKeunggulan.filter((k) => k.includes("|")), ...rest] }); }}
                        isEditMode={em}
                        as="span"
                        className={`${textDark} text-[14px] leading-snug`}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {tab === "produk" && (
                <ul className={`grid gap-3 ${isMob ? "grid-cols-1" : "grid-cols-2"}`}>
                  {s.layanan.slice(0, 6).map((l, i) => (
                    <li key={i} className="rounded-2xl border px-5 py-4" style={{ borderColor: "#E6E6E1" }}>
                      <EditableText value={l.nama} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], nama: v }; patch({ layanan: a }); }} isEditMode={em} as="p" className={`font-semibold ${textDark} text-[15px]`} />
                      <EditableText value={l.deskripsi} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], deskripsi: v }; patch({ layanan: a }); }} isEditMode={em} as="p" multiline className={`${mutedDark} text-[13px] leading-relaxed mt-1.5 line-clamp-2`} />
                    </li>
                  ))}
                </ul>
              )}

              <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full border font-semibold mt-8 ${isMob ? "px-6 py-3 text-[13.5px]" : "px-7 py-3 text-[14px]"}`} style={{ borderColor: "#DDDDD6", color: ink }}>
                <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="tentang.cta" d="Konsultasi Gratis" /> <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Bento — foto / kartu statistik selang-seling (ref cth1.webp) */}
          <div className={`grid gap-4 ${isMob ? "grid-cols-1 mt-10" : "grid-cols-4 mt-14"}`}>
            <div className={`relative rounded-2xl overflow-hidden ${isMob ? "h-48" : "h-[230px]"}`}>
              <SlotImage em={em} positions={s.imagePositions} setPos={setImgPos} id="tentang" src={aboutImg} alt={s.namaBisnis} />
            </div>

            {stats.slice(0, 2).map((st, i) => {
              const highlight = i === 1; // kartu kedua pakai lime, seperti referensi
              return (
                <div
                  key={i}
                  className={`relative rounded-2xl border p-6 flex flex-col ${isMob ? "" : "h-[230px]"} ${i === 1 && !isMob ? "order-3" : ""}`}
                  style={highlight ? { backgroundColor: lime, borderColor: limeDeep } : { backgroundColor: shell, borderColor: "#E6E6E1" }}
                >
                  <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Hubungi kami" className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: highlight ? ink : paper }}>
                    <ArrowUpRight className="w-4 h-4" style={{ color: highlight ? lime : ink }} />
                  </a>
                  <EditableText value={st.val} onChange={(v) => { const a = s.aboutKeunggulan.filter((k) => k.includes("|")); a[i] = `${v}|${st.label}`; patch({ aboutKeunggulan: [...a, ...plainPoints] }); }} isEditMode={em} as="div" className={`font-semibold tracking-tight leading-none ${textDark} ${isMob ? "text-[32px]" : "text-[34px]"}`} />
                  <EditableText
                    value={st.label}
                    onChange={(v) => { const a = s.aboutKeunggulan.filter((k) => k.includes("|")); a[i] = `${st.val}|${v}`; patch({ aboutKeunggulan: [...a, ...plainPoints] }); }}
                    isEditMode={em}
                    as="p"
                    className={`font-semibold ${textDark} text-[14px] mt-3 leading-snug`}
                  />
                  <UiText em={em} uiText={s.uiText} patchUi={patchUi}
                    k={"bento." + i + ".desc"}
                    d={highlight ? "Angka ini datang dari kepercayaan pelanggan yang terus kembali." : "Pengalaman panjang di lapangan, hasilnya bisa Anda rasakan."}
                    as="p"
                    multiline
                    className={`text-[12.5px] leading-relaxed mt-2 ${highlight ? "text-[#3F4A2B]" : mutedDark}`}
                  />
                </div>
              );
            })}

            <div className={`relative rounded-2xl overflow-hidden ${isMob ? "h-48" : "h-[230px] order-2"}`}>
              <SlotImage em={em} positions={s.imagePositions} setPos={setImgPos} id="bento" src={bentoImg} alt={s.namaBisnis} />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ── Produk & Layanan — abu terang, kartu korporat.
          Tinggi dikunci 100dvh (bukan min-h) supaya kartu menyesuaikan layar, tidak meluber. ── */}
      {s.layanan.length > 0 && (
        <section id="produk" className={`relative w-full flex flex-col justify-center ${isMob ? "min-h-[100dvh] py-20" : "h-[100dvh] overflow-hidden py-16"} ${px}`} style={{ backgroundColor: shell }}>
          <div className="w-full max-w-6xl mx-auto flex-1 min-h-0 flex flex-col justify-center">
            <div className={`flex items-end justify-between gap-4 flex-shrink-0 ${isMob ? "mb-6" : "mb-8"}`}>
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11.5px] font-medium" style={{ borderColor: "#DDDDD6", color: "#6B7263" }}>
                  <Leaf className="w-3.5 h-3.5" style={{ color: limeDeep }} /> <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="produk.badge" d="Produk & Layanan" />
                </span>
                <UiText em={em} uiText={s.uiText} patchUi={patchUi}
                  k="produk.judul"
                  d="Solusi tani & ternak yang kami kerjakan setiap hari"
                  as="h2"
                  multiline
                  className={`font-semibold tracking-tight leading-tight ${textDark} mt-5 ${isMob ? "text-[26px]" : "text-[clamp(28px,3vw,42px)]"}`}
                />
              </div>
              {!isMob && s.layanan.length > 3 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button type="button" aria-label="Sebelumnya" onClick={() => scrollSvc(-1)} className="w-11 h-11 rounded-full flex items-center justify-center border transition-transform hover:scale-105" style={{ borderColor: "#DDDDD6", backgroundColor: paper }}><ChevronLeft className="w-5 h-5" style={{ color: ink }} /></button>
                  <button type="button" aria-label="Berikutnya" onClick={() => scrollSvc(1)} className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: lime }}><ChevronRight className="w-5 h-5" style={{ color: ink }} /></button>
                </div>
              )}
            </div>

            {/* Pola sama seperti TemplateAgriSatu: ≤2 produk → kartu lebar (foto di
                samping, tinggi mengisi section), 3 → grid 3 kolom, >3 → slider. */}
            <div
              ref={svcRef}
              className={`agc-hscroll ${isMob ? "" : "flex-1 min-h-0"} ${isWideCard
                ? `grid gap-5 grid-cols-1 ${isMob ? "" : "auto-rows-fr"}`
                : s.layanan.length > 3
                  ? "flex gap-5 overflow-x-auto snap-x snap-mandatory"
                  : `grid gap-5 ${isMob ? "grid-cols-1" : "auto-rows-fr grid-cols-3"}`}`}
            >
              {s.layanan.map((l, i) =>
                isWideCard ? (
                  /* Kartu lebar — foto separuh, teks separuh, selang-seling kiri/kanan */
                  <div key={i} className={`group relative rounded-3xl overflow-hidden border flex h-full ${isMob ? "flex-col" : "flex-row"}`} style={{ backgroundColor: paper, borderColor: "#E6E6E1" }}>
                    <div className={`relative overflow-hidden m-3 rounded-2xl ${isMob ? "h-52 flex-shrink-0" : `w-1/2 flex-shrink-0 ${i % 2 === 1 ? "order-2" : ""}`}`}>
                      <SlotImage em={em} positions={s.imagePositions} setPos={setImgPos} id={"produk" + i} src={cardImg(i)} alt={l.nama} />
                      <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label={`Pesan ${l.nama}`} className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: lime }}>
                        <ArrowUpRight className="w-4 h-4" style={{ color: ink }} />
                      </a>
                    </div>
                    <div className={`flex flex-col justify-between flex-1 min-w-0 ${isMob ? "px-6 pb-8 pt-3" : "px-10 py-9"}`}>
                      <div>
                        <span className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[11px] font-medium mb-4" style={{ borderColor: "#DDDDD6", color: "#6B7263" }}>
                          <Leaf className="w-3 h-3" style={{ color: limeDeep }} /> <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="produk.badgeKartu" d="Unggulan" />
                        </span>
                        <EditableText value={l.nama} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], nama: v }; patch({ layanan: a }); }} isEditMode={em} as="h3" className={`font-semibold ${textDark} leading-snug mb-3 ${isMob ? "text-[23px]" : "text-[30px]"}`} />
                        <EditableText value={l.deskripsi} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], deskripsi: v }; patch({ layanan: a }); }} isEditMode={em} as="p" multiline className={`${mutedDark} leading-relaxed max-w-md ${isMob ? "text-[13.5px]" : "text-[15px]"}`} />
                      </div>
                      <div className={`flex items-center gap-4 mt-7 ${isMob ? "flex-col items-start" : "flex-row"}`}>
                        {l.harga && (
                          <EditableText value={l.harga} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], harga: v }; patch({ layanan: a }); }} isEditMode={em} as="span" className={`font-semibold ${textDark} text-[15px]`} />
                        )}
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-3 rounded-full font-bold ${isMob ? "w-full py-2.5 pl-6 pr-2.5 text-[14px]" : "py-2.5 pl-7 pr-2.5 text-[14px]"}`} style={{ backgroundColor: lime, color: ink }}>
                          <UiText em={em} uiText={s.uiText} patchUi={patchUi} k={l.harga ? "produk.ctaHarga" : "produk.ctaTanpaHarga"} d={l.harga ? "Pesan Sekarang" : "Hubungi Kami"} />
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: ink }}><ArrowRight className="w-4 h-4" style={{ color: lime }} /></span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className={`group relative rounded-3xl overflow-hidden flex flex-col border ${s.layanan.length > 3 ? `snap-start shrink-0 ${isMob ? "w-[280px]" : "w-[340px]"}` : ""}`}
                    style={{ backgroundColor: paper, borderColor: "#E6E6E1" }}
                  >
                    {/* Foto mengisi porsi kartu (bukan tinggi tetap) supaya kartu pas di layar */}
                    <div className={`relative overflow-hidden m-3 rounded-2xl ${isMob ? "h-44 flex-shrink-0" : "flex-[1.3] min-h-0"}`}>
                      <SlotImage em={em} positions={s.imagePositions} setPos={setImgPos} id={"produk" + i} src={cardImg(i)} alt={l.nama} />
                      <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label={`Pesan ${l.nama}`} className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: lime }}>
                        <ArrowUpRight className="w-4 h-4" style={{ color: ink }} />
                      </a>
                    </div>
                    <div className="px-6 pb-7 pt-2 flex flex-col flex-shrink-0">
                      <EditableText value={l.nama} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], nama: v }; patch({ layanan: a }); }} isEditMode={em} as="h3" className={`font-semibold ${textDark} text-[19px] leading-snug mb-2`} />
                      <EditableText value={l.deskripsi} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], deskripsi: v }; patch({ layanan: a }); }} isEditMode={em} as="p" multiline className={`${mutedDark} text-[13.5px] leading-relaxed flex-1`} />
                      {l.harga && (
                        <div className="flex items-center justify-between mt-5 pt-4 border-t" style={{ borderColor: "#EDEDE8" }}>
                          <EditableText value={l.harga} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], harga: v }; patch({ layanan: a }); }} isEditMode={em} as="span" className={`font-semibold ${textDark} text-[14px]`} />
                          <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold" style={{ color: ink }}><UiText em={em} uiText={s.uiText} patchUi={patchUi} k="produk.ctaKecil" d="Pesan →" /></a>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Cara Kerja — panel gelap, angka lime ── */}
      {s.caraKerja.length > 0 && (
        <section className={`relative w-full min-h-[100dvh] flex flex-col justify-center overflow-hidden ${px} ${isMob ? "py-16" : "py-20"}`} style={{ backgroundColor: ink }}>
          <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(700px 380px at 80% 15%, ${lime}14, transparent 60%)` }} />
          <div aria-hidden className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: `linear-gradient(${lime}0F 1px, transparent 1px), linear-gradient(90deg, ${lime}0F 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

          <div className="w-full max-w-6xl mx-auto relative z-10">
            <div className={`${isMob ? "text-left" : "flex items-end justify-between gap-8"}`}>
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-[11.5px] font-medium text-[#D5DCC9]">
                  <Leaf className="w-3.5 h-3.5" style={{ color: lime }} /> <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="proses.badge" d="Prosesnya Mudah" />
                </span>
                <EditableText value={s.caraKerjaTitle} onChange={(v) => patch({ caraKerjaTitle: v })} isEditMode={em} as="h2" className={`font-semibold tracking-tight ${textLight} mt-5 ${isMob ? "text-[26px]" : "text-[clamp(28px,3vw,42px)]"}`} />
              </div>
              {!isMob && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-full font-bold py-2.5 pl-6 pr-2.5 text-[14px] flex-shrink-0" style={{ backgroundColor: lime, color: ink }}>
                  <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="proses.cta" d="Mulai Sekarang" />
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: ink }}><ArrowRight className="w-4 h-4" style={{ color: lime }} /></span>
                </a>
              )}
            </div>

            <div className={`grid gap-4 ${isMob ? "grid-cols-1 mt-10" : "grid-cols-3 mt-14"}`}>
              {s.caraKerja.slice(0, 3).map((ck, i) => (
                <div key={i} className="rounded-3xl p-7 border" style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: inkSoft }}>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`font-semibold tracking-tight ${isMob ? "text-[34px]" : "text-[40px]"}`} style={{ color: lime }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="w-9 h-9 rounded-full flex items-center justify-center border border-white/15">
                      <ArrowUpRight className="w-4 h-4" style={{ color: lime }} />
                    </span>
                  </div>
                  <EditableText value={ck.title} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], title: v }; patch({ caraKerja: a }); }} isEditMode={em} as="h3" className={`font-semibold ${textLight} text-[19px] mb-2`} />
                  <EditableText value={ck.desc} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], desc: v }; patch({ caraKerja: a }); }} isEditMode={em} as="p" multiline className={`${mutedLight} text-[13.5px] leading-relaxed`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimoni — putih, kartu bersih ── */}
      {s.testimonials.length > 0 && (
        <section id="testimoni" className={`relative w-full min-h-[100dvh] flex flex-col justify-center ${px} ${isMob ? "py-16" : "py-20"}`} style={{ backgroundColor: paper }}>
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
              <div>
                <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="testimoni.judul" d="Apa Kata Pelanggan Kami" as="h2" className={`font-semibold tracking-tight ${textDark} ${isMob ? "text-[26px]" : "text-[clamp(28px,3vw,42px)]"}`} />
                <div className="inline-flex items-center gap-2.5 mt-5 rounded-full px-5 py-2 border" style={{ borderColor: "#E6E6E1", backgroundColor: shell }}>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="w-4 h-4" style={{ color: limeDeep, fill: limeDeep }} />
                    ))}
                  </div>
                  <span className={`text-[13px] font-bold ${textDark}`}>
                    {(s.testimonials.reduce((sum, t) => sum + (t.rating ?? 5), 0) / s.testimonials.length).toFixed(1)}/5
                  </span>
                  <span className={`text-[12px] ${mutedDark}`}>
                    <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="testimoni.dari" d="dari" /> {s.testimonials.length} <UiText em={em} uiText={s.uiText} patchUi={patchUi} k="testimoni.satuan" d="pelanggan" />
                  </span>
                </div>
              </div>
              {!isMob && s.testimonials.length > 3 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button type="button" aria-label="Sebelumnya" onClick={() => scrollTesti(-1)} className="w-11 h-11 rounded-full flex items-center justify-center border transition-transform hover:scale-105" style={{ borderColor: "#DDDDD6" }}><ChevronLeft className="w-5 h-5" style={{ color: ink }} /></button>
                  <button type="button" aria-label="Berikutnya" onClick={() => scrollTesti(1)} className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: lime }}><ChevronRight className="w-5 h-5" style={{ color: ink }} /></button>
                </div>
              )}
            </div>

            <div
              ref={testiRef}
              className={
                s.testimonials.length > 3
                  ? "agc-hscroll flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2"
                  : `grid gap-5 ${isMob ? "grid-cols-1" : s.testimonials.length === 1 ? "grid-cols-1 max-w-2xl" : s.testimonials.length === 2 ? "grid-cols-2" : "grid-cols-3"}`
              }
            >
              {s.testimonials.slice(0, 6).map((t, i) => {
                const highlight = i === 1;
                const initial = (t.nama || "?").trim().charAt(0).toUpperCase() || "?";
                return (
                  <div
                    key={i}
                    className={`relative rounded-3xl flex flex-col border ${isMob ? "p-7" : "p-8"} ${s.testimonials.length > 3 ? `snap-start shrink-0 ${isMob ? "w-[300px]" : "w-[380px]"}` : ""}`}
                    style={highlight ? { backgroundColor: lime, borderColor: limeDeep } : { backgroundColor: shell, borderColor: "#E6E6E1" }}
                  >
                    <Quote className="absolute top-6 right-6 w-10 h-10" style={{ color: highlight ? "#3F4A2B22" : "#12160F14" }} />
                    <Stars rating={t.rating ?? 5} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], rating: v }; patch({ testimonials: a }); }} isEditMode={em} color={highlight ? ink : limeDeep} />
                    <EditableText value={t.teks} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], teks: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" multiline className={`${highlight ? "text-[#3A4428]" : mutedDark} leading-relaxed my-5 flex-1 relative z-10 ${isMob ? "text-[14px]" : "text-[15px]"}`} />
                    <div className="flex items-center gap-3 pt-5 border-t" style={{ borderColor: highlight ? "#B4DD2E" : "#E6E6E1" }}>
                      <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-[15px] flex-shrink-0" style={{ backgroundColor: highlight ? ink : paper, color: highlight ? lime : ink }}>
                        {initial}
                      </div>
                      <div>
                        <EditableText value={t.nama} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], nama: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" className={`font-semibold ${textDark} text-[14.5px] leading-tight`} />
                        <EditableText value={t.peran} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], peran: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" className={`text-[12.5px] mt-0.5 ${highlight ? "text-[#3F4A2B]" : mutedDark}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA + Footer — panel gelap full-bleed ── */}
      <footer id="footer" className="relative w-full overflow-hidden" style={{ backgroundColor: ink }}>
        <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(620px 320px at 20% 15%, ${lime}14, transparent 60%)` }} />

        <div className={`relative z-10 w-full max-w-5xl mx-auto text-center ${px} ${isMob ? "pt-16 pb-12" : "pt-24 pb-16"}`}>
          <EditableText value={s.footerTagline} onChange={(v) => patch({ footerTagline: v })} isEditMode={em} as="h2" className={`font-semibold tracking-tight leading-tight ${textLight} mx-auto max-w-3xl ${isMob ? "text-[28px]" : "text-[clamp(32px,4.6vw,54px)]"}`} />
          <div className={`flex items-center justify-center gap-3 mt-8 ${isMob ? "flex-col" : "flex-row"}`}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-3 rounded-full font-bold ${isMob ? "w-full py-2.5 pl-6 pr-2.5 text-[14px]" : "py-2.5 pl-7 pr-2.5 text-[15px]"}`} style={{ backgroundColor: lime, color: ink }}>
              <EditableText value={s.footerCta || "Hubungi Kami"} onChange={(v) => patch({ footerCta: v })} isEditMode={em} />
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: ink }}><ArrowRight className="w-4 h-4" style={{ color: lime }} /></span>
            </a>
            {kontak.telepon && (
              <a href={`tel:${kontak.telepon}`} className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold border border-white/25 text-white ${isMob ? "w-full py-3.5 text-[14px]" : "px-8 py-3.5 text-[15px]"}`}>
                <Phone className="w-4 h-4" style={{ color: lime }} /> {kontak.telepon}
              </a>
            )}
          </div>
        </div>

        <div className={`relative z-10 ${px} border-t border-white/[0.08]`}>
          <div className={`w-full max-w-6xl mx-auto grid gap-8 ${isMob ? "grid-cols-1 py-10" : "grid-cols-3 py-14"}`}>
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                {logo ? <img src={logo} alt={namaBisnis} className="w-8 h-8 rounded-lg object-contain" /> : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: lime }}><Leaf className="w-4 h-4" style={{ color: ink }} /></div>
                )}
                <span className={`font-semibold text-[16px] ${textLight}`}>{s.namaBisnis}</span>
              </div>
              <EditableText value={s.footerDesc} onChange={(v) => patch({ footerDesc: v })} isEditMode={em} as="p" multiline className={`${mutedLight} text-[13px] leading-relaxed`} />
            </div>
            <div>
              <EditableText value={s.footerKontakTitle} onChange={(v) => patch({ footerKontakTitle: v })} isEditMode={em} as="h4" className={`font-semibold text-[13.5px] ${textLight} mb-3`} />
              <ul className={`space-y-2.5 text-[13px] ${mutedLight}`}>
                {kontak.wa && <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" style={{ color: lime }} /> {kontak.wa}</li>}
                {kontak.email && <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" style={{ color: lime }} /> {kontak.email}</li>}
                {lokasi && <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" style={{ color: lime }} /> {lokasi}</li>}
              </ul>
            </div>
            <div>
              <EditableText value={s.footerSosmedTitle} onChange={(v) => patch({ footerSosmedTitle: v })} isEditMode={em} as="h4" className={`font-semibold text-[13.5px] ${textLight} mb-3`} />
              <ul className={`space-y-2.5 text-[13px] ${mutedLight}`}>
                {sosmed.instagram && <li className="flex items-center gap-2"><AtSign className="w-3.5 h-3.5" style={{ color: lime }} /> @{sosmed.instagram}</li>}
                {sosmed.tiktok && <li className="flex items-center gap-2"><Music2 className="w-3.5 h-3.5" style={{ color: lime }} /> @{sosmed.tiktok}</li>}
                {sosmed.twitter && <li className="flex items-center gap-2"><Share2 className="w-3.5 h-3.5" style={{ color: lime }} /> @{sosmed.twitter}</li>}
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
