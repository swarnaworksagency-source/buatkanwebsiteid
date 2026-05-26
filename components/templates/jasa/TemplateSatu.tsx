"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { TemplateData, AILayananItem, AICaraKerjaItem } from "@/types";
import { EditableText } from "@/components/ui/EditableText";
import { Check, Loader, ArrowRight, ArrowUpRight, Menu, X, ArrowLeft, Move, ZoomIn, ZoomOut } from "lucide-react";

// Helper components inside the same file
function StarRating({ rating, onChange, isEditMode }: { rating: number, onChange: (val: number) => void, isEditMode: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1 mb-4" data-editable={isEditMode ? "true" : undefined}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{
            cursor: isEditMode ? 'pointer' : 'default',
            color: star <= (isEditMode ? (hovered || rating) : rating) ? '#f59e0b' : '#e6e5e0', // Using amber for star so it's obvious, or textPrimary. Let's use #f59e0b
            fontSize: '18px',
            lineHeight: 1,
            transition: 'color 0.15s',
            userSelect: 'none'
          }}
          onMouseEnter={() => isEditMode && setHovered(star)}
          onMouseLeave={() => isEditMode && setHovered(0)}
          onClick={(e) => { 
            if (isEditMode) { 
              e.preventDefault(); 
              e.stopPropagation(); 
              onChange(star); 
            } 
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

const DEFAULT_CARA_KERJA = [
  { step: "01", title: "Konsultasi", desc: "Hubungi kami via WhatsApp untuk diskusi." },
  { step: "02", title: "Pengerjaan", desc: "Tim profesional kami segera mengerjakan." },
  { step: "03", title: "Selesai", desc: "Pekerjaan selesai dengan hasil terjamin." },
];

interface Props extends Partial<TemplateData> {
  forceMobile?: boolean;
  isEditable?: boolean;
  isEditMode?: boolean;
  onContentUpdate?: (newContent: Partial<TemplateData>) => void;
  websiteId?: string;
}

export default function TemplateSatu(props: Props) {
  const {
    hero = { headline: "Judul Website", subheadline: "Deskripsi singkat mengenai bisnis Anda.", ctaText: "Hubungi Kami" },
    about = { judul: "Tentang Kami", deskripsi: "Penjelasan mengenai bisnis.", keunggulan: ["Profesional"] },
    layanan = [],
    testimonialPlaceholder = [],
    footer = { tagline: "Layanan profesional untuk Anda.", ctaText: "Hubungi Kami" },
    namaBisnis = "Bisnis Anda",
    kontak = { wa: "", telepon: "", email: "" },
    sosmed = { instagram: "", tiktok: "", twitter: "" },
    warna = { primary: "#f54e00", tema: "light" },
    paketHarga = [],
    logo = "",
    fotoBisnis = [],
    portofolio = [],
    caraKerja = DEFAULT_CARA_KERJA,
    caraKerjaTitle = "Cara Kerja",
    forceMobile,
    isEditable = false,
    isEditMode = false,
    onContentUpdate,
    websiteId,
  } = props;

  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Inline editing state ── */
  const [editedNamaBisnis, setEditedNamaBisnis] = useState(namaBisnis);
  const [editedHeadline, setEditedHeadline] = useState(hero.headline);
  const [editedSubheadline, setEditedSubheadline] = useState(hero.subheadline);
  const [editedCtaText, setEditedCtaText] = useState(hero.ctaText);
  const [editedAboutJudul, setEditedAboutJudul] = useState(about.judul);
  const [editedAboutDeskripsi, setEditedAboutDeskripsi] = useState(about.deskripsi);
  const [editedAboutKeunggulan, setEditedAboutKeunggulan] = useState([...about.keunggulan]);
  const [editedLayanan, setEditedLayanan] = useState<AILayananItem[]>([...layanan]);
  const [editedPaketNama, setEditedPaketNama] = useState(paketHarga.map(p => p.namaPaket));
  const [editedPaketHarga, setEditedPaketHarga] = useState(paketHarga.map(p => p.harga));
  const [editedCaraKerja, setEditedCaraKerja] = useState<AICaraKerjaItem[]>([...caraKerja].slice(0, 3));
  const [editedCaraKerjaTitle, setEditedCaraKerjaTitle] = useState(caraKerjaTitle);
  const [editedTestimonials, setEditedTestimonials] = useState([...testimonialPlaceholder]);
  const [editedFooterTagline, setEditedFooterTagline] = useState(footer.tagline);
  const [editedFooterCta, setEditedFooterCta] = useState(footer.ctaText);
  const [editedFooterKontakTitle, setEditedFooterKontakTitle] = useState(footer.kontakTitle || "Kontak");
  const [editedFooterSosmedTitle, setEditedFooterSosmedTitle] = useState(footer.sosmedTitle || "Sosial Media");
  const [editedFooterDesc, setEditedFooterDesc] = useState(about.deskripsi.substring(0, 120) + "...");
  const [editedCopyright, setEditedCopyright] = useState(`© ${new Date().getFullYear()} ${namaBisnis}.`);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAllPortofolio, setShowAllPortofolio] = useState(false);

  // -- Portofolio reposition state --
  const [positions, setPositions] = useState<Array<{x:number, y:number, scale:number}>>(
    portofolio.map((_, i) => props.portofolioPositions?.[i] ?? { x: 50, y: 50, scale: 1 })
  );
  const [repositioningIndex, setRepositioningIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{mouseX:number, mouseY:number, posX:number, posY:number} | null>(null);

  useEffect(() => {
    setPositions(portofolio.map((_, i) => props.portofolioPositions?.[i] ?? { x: 50, y: 50, scale: 1 }));
  }, [portofolio, props.portofolioPositions]);

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    if (repositioningIndex !== index) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, posX: positions[index].x, posY: positions[index].y };
  };
  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (!isDragging || repositioningIndex !== index || !dragStart.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.current.mouseX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.current.mouseY) / rect.height) * 100;
    const newX = Math.max(0, Math.min(100, dragStart.current.posX - deltaX));
    const newY = Math.max(0, Math.min(100, dragStart.current.posY - deltaY));
    setPositions(prev => prev.map((p, i) => i === index ? { ...p, x: newX, y: newY } : p));
  };
  const handleMouseUp = () => { if (isDragging) { setIsDragging(false); markChanged(); } };
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (repositioningIndex !== index) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = { mouseX: touch.clientX, mouseY: touch.clientY, posX: positions[index].x, posY: positions[index].y };
  };
  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (!isDragging || repositioningIndex !== index || !dragStart.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const deltaX = ((touch.clientX - dragStart.current.mouseX) / rect.width) * 100;
    const deltaY = ((touch.clientY - dragStart.current.mouseY) / rect.height) * 100;
    const newX = Math.max(0, Math.min(100, dragStart.current.posX - deltaX));
    const newY = Math.max(0, Math.min(100, dragStart.current.posY - deltaY));
    setPositions(prev => prev.map((p, i) => i === index ? { ...p, x: newX, y: newY } : p));
  };
  const adjustZoom = (index: number, delta: number, absolute?: number) => {
    setPositions(prev => prev.map((p, i) => {
      if (i !== index) return p;
      const newScale = absolute !== undefined ? absolute : Math.max(1, Math.min(3, p.scale + delta));
      return { ...p, scale: newScale };
    }));
    markChanged();
  };
  const resetPosition = (index: number) => {
    setPositions(prev => prev.map((p, i) => i === index ? { x: 50, y: 50, scale: 1 } : p));
    markChanged();
  };
  const handleWheel = (e: React.WheelEvent, index: number) => {
    if (repositioningIndex !== index) return;
    e.preventDefault();
    adjustZoom(index, e.deltaY > 0 ? -0.1 : 0.1);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightboxIndex(i => Math.min(i! + 1, portofolio.length - 1));
      if (e.key === 'ArrowLeft') setLightboxIndex(i => Math.max(i! - 1, 0));
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, portofolio.length]);

  useEffect(() => { setEditedNamaBisnis(namaBisnis); }, [namaBisnis]);
  useEffect(() => { setEditedHeadline(hero.headline); setEditedSubheadline(hero.subheadline); setEditedCtaText(hero.ctaText); }, [hero]);
  useEffect(() => { setEditedAboutJudul(about.judul); setEditedAboutDeskripsi(about.deskripsi); setEditedAboutKeunggulan([...about.keunggulan]); }, [about]);
  useEffect(() => { setEditedLayanan([...layanan]); }, [layanan]);
  useEffect(() => { setEditedCaraKerja([...caraKerja]); setEditedCaraKerjaTitle(caraKerjaTitle); }, [caraKerja, caraKerjaTitle]);
  useEffect(() => { setEditedPaketNama(paketHarga.map(p => p.namaPaket)); setEditedPaketHarga(paketHarga.map(p => p.harga)); }, [paketHarga]);
  useEffect(() => { setEditedTestimonials([...testimonialPlaceholder]); }, [testimonialPlaceholder]);
  useEffect(() => { setEditedFooterTagline(footer.tagline); setEditedFooterCta(footer.ctaText); setEditedFooterKontakTitle(footer.kontakTitle || "Kontak"); setEditedFooterSosmedTitle(footer.sosmedTitle || "Sosial Media"); }, [footer]);

  useEffect(() => {
    if (hasChanges && onContentUpdate) {
      const handler = setTimeout(() => {
        onContentUpdate({
          namaBisnis: editedNamaBisnis,
          hero: { headline: editedHeadline, subheadline: editedSubheadline, ctaText: editedCtaText },
          about: { judul: editedAboutJudul, deskripsi: editedAboutDeskripsi, keunggulan: editedAboutKeunggulan },
          layanan: editedLayanan,
          caraKerja: editedCaraKerja.slice(0, 3),
          caraKerjaTitle: editedCaraKerjaTitle,
          testimonialPlaceholder: editedTestimonials,
          footer: { tagline: editedFooterTagline, ctaText: editedFooterCta, kontakTitle: editedFooterKontakTitle, sosmedTitle: editedFooterSosmedTitle },
          paketHarga: paketHarga.map((p, i) => ({ ...p, namaPaket: editedPaketNama[i] ?? p.namaPaket, harga: editedPaketHarga[i] ?? p.harga })),
          portofolioPositions: positions,
        });
      }, 100);
      return () => clearTimeout(handler);
    }
  }, [
    editedNamaBisnis, editedHeadline, editedSubheadline, editedCtaText,
    editedAboutJudul, editedAboutDeskripsi, editedAboutKeunggulan,
    editedLayanan, editedCaraKerja, editedCaraKerjaTitle,
    editedPaketNama, editedPaketHarga, editedTestimonials,
    editedFooterTagline, editedFooterCta, editedFooterKontakTitle,
    editedFooterSosmedTitle, editedFooterDesc, editedCopyright,
    paketHarga, positions, hasChanges, onContentUpdate
  ]);

  const markChanged = useCallback(() => setHasChanges(true), []);
  const em = isEditMode;

  const handleSave = useCallback(async () => {
    const updatedContent: Partial<TemplateData> = {
      namaBisnis: editedNamaBisnis,
      hero: { headline: editedHeadline, subheadline: editedSubheadline, ctaText: editedCtaText },
      about: { judul: editedAboutJudul, deskripsi: editedAboutDeskripsi, keunggulan: editedAboutKeunggulan },
      layanan: editedLayanan,
      caraKerja: editedCaraKerja,
      caraKerjaTitle: editedCaraKerjaTitle,
      testimonialPlaceholder: editedTestimonials,
      footer: { tagline: editedFooterTagline, ctaText: editedFooterCta, kontakTitle: editedFooterKontakTitle, sosmedTitle: editedFooterSosmedTitle },
      paketHarga: paketHarga.map((p, i) => ({ ...p, namaPaket: editedPaketNama[i] ?? p.namaPaket, harga: editedPaketHarga[i] ?? p.harga })),
      portofolioPositions: positions,
    };
    setSaving(true);
    try {
      if (onContentUpdate) onContentUpdate(updatedContent);
      if (websiteId) {
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        const { data: existing } = await supabase.from("websites").select("generated_content").eq("id", websiteId).single();
        if (existing) {
          const merged = { ...existing.generated_content, ...updatedContent };
          await supabase.from("websites").update({ generated_content: merged, nama_usaha: editedNamaBisnis }).eq("id", websiteId);
        }
      }
      setHasChanges(false);
      setToast("Perubahan berhasil disimpan!");
      setTimeout(() => setToast(""), 3000);
    } catch (e) { console.error("Save error:", e); setToast("Gagal menyimpan."); setTimeout(() => setToast(""), 3000); }
    finally { setSaving(false); }
  }, [editedNamaBisnis, editedHeadline, editedSubheadline, editedCtaText, editedAboutJudul, editedAboutDeskripsi, editedAboutKeunggulan, editedLayanan, editedCaraKerja, editedCaraKerjaTitle, editedPaketNama, editedPaketHarga, editedTestimonials, editedFooterTagline, editedFooterCta, editedFooterKontakTitle, editedFooterSosmedTitle, editedFooterDesc, editedCopyright, paketHarga, positions, onContentUpdate, websiteId]);

  const isMob = forceMobile === true;
  const isDesk = forceMobile === false;

  // -- Colors and Theme (Editorial Calm) --
  const isDark = warna.tema === "dark";
  const canvas = isDark ? "bg-[#111111]" : "bg-[#ffffff]"; // Neutral dark, pure white light
  const surface = isDark ? "bg-[#1c1c1c]" : "bg-[#fafafa]";
  const textPrimary = isDark ? "text-[#ffffff]" : "text-[#111111]";
  const textMuted = isDark ? "text-[#a3a3a3]" : "text-[#525252]";
  const hairline = isDark ? "border-[#333333]" : "border-[#e5e5e5]";
  
  const pc = warna.primary || "#f54e00";
  const pcMuted = `${pc}1a`; // 10% opacity

  const timelineColors = [
    { bg: "#dfa88f", text: "#26251e" }, // Peach
    { bg: "#9fc9a2", text: "#26251e" }, // Mint
    { bg: "#9fbbe0", text: "#26251e" }, // Blue
  ];

  const waLink = `https://wa.me/${kontak.wa}?text=Halo,%20saya%20tertarik%20dengan%20layanan%20Anda...`;
  
  const plans = paketHarga && paketHarga.length > 0 ? paketHarga : [];
  const photos = fotoBisnis || [];
  const portfolioPhotos = portofolio || [];

  // Dynamic Navbar
  const navItems = [
    { label: "Beranda", href: "#beranda" },
    { label: "Tentang", href: "#tentang" },
    editedLayanan.length > 0 && { label: "Layanan", href: "#layanan" },
    plans.length > 0 && { label: "Harga", href: "#harga" },
    portfolioPhotos.length > 0 && { label: "Portofolio", href: "#portofolio" },
    editedTestimonials.length > 0 && { label: "Testimoni", href: "#testimoni" },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div
      className={`min-h-full ${canvas} ${textPrimary} font-sans relative transition-colors duration-300`}
      style={em ? { border: '2px solid #f59e0b', borderRadius: '8px' } : undefined}
      onClickCapture={(e) => {
        if (em) {
          const target = e.target as HTMLElement;
          const isEditable = target.closest('[data-editable="true"]');
          if (!isEditable) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }}
    >
      {/* ── Edit Mode Banner ── */}
      {em && (
        <div className="sticky top-0 z-[60] bg-amber-500 text-amber-950 text-center text-[11px] font-semibold py-1 px-3">
          MODE EDIT — Klik teks manapun untuk mengedit
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b ${hairline} ${isDark ? "bg-[#111111]/80" : "bg-[#ffffff]/80"} transition-colors duration-300`}>
        <div className={`max-w-7xl mx-auto ${isMob ? "px-4 py-4" : isDesk ? "px-6 py-5" : "px-4 md:px-6 py-4 md:py-5"} flex items-center justify-between`}>
          <div className="flex items-center gap-3 z-10 flex-shrink-0">
            {logo ? (
              <img src={logo} alt={namaBisnis} className={`${isMob ? "w-6 h-6" : isDesk ? "w-8 h-8" : "w-6 h-6 md:w-8 md:h-8"} rounded-md object-cover`} />
            ) : (
              <div className={`${isMob ? "w-6 h-6" : isDesk ? "w-8 h-8" : "w-6 h-6 md:w-8 md:h-8"} rounded-md flex items-center justify-center`} style={{ backgroundColor: pc }}>
                <span className={`text-white font-normal ${isMob ? "text-xs" : isDesk ? "text-sm" : "text-xs md:text-sm"}`}>{namaBisnis.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <EditableText value={editedNamaBisnis} onChange={(v) => { setEditedNamaBisnis(v); markChanged(); }} isEditMode={em} className={`font-normal tracking-tight ${textPrimary} truncate max-w-[150px] sm:max-w-[200px] md:max-w-xs ${isMob ? "text-[14px]" : isDesk ? "text-[16px]" : "text-[14px] md:text-[16px]"}`} />
          </div>
          
          {!isMob && (
            <div className={`${isDesk ? "flex" : "hidden md:flex"} absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[14px] ${textMuted}`}>
              {navItems.map((n) => (
                <a key={n.label} href={n.href} className={`hover:${textPrimary} transition-colors`}>{n.label}</a>
              ))}
            </div>
          )}

          {!isMob && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`z-10 ${isDesk ? "flex" : "hidden md:flex"} text-white text-[14px] font-normal px-5 py-2.5 rounded-md transition-colors items-center gap-2`} style={{ backgroundColor: pc }}>
              Hubungi Kami <ArrowUpRight className="w-4 h-4" />
            </a>
          )}

          {(isMob || forceMobile === undefined) && (
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className={`z-10 ${isDesk ? "hidden" : isMob ? "block" : "md:hidden"} p-1.5 transition-colors`}>
              {menuOpen ? <X className={`w-5 h-5 ${textMuted}`} /> : <Menu className={`w-5 h-5 ${textMuted}`} />}
            </button>
          )}
        </div>

        {menuOpen && (isMob || forceMobile === undefined) && (
          <div className={`${isDesk ? "hidden" : isMob ? "block" : "md:hidden"} border-t ${hairline} ${surface} px-4 py-4 space-y-2`}>
            {navItems.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)} className={`block py-2 text-[14px] ${textMuted} transition-colors`}>{n.label}</a>
            ))}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between mt-4 text-white text-[14px] font-normal px-4 py-3 rounded-md" style={{ backgroundColor: pc }}>
              Hubungi Kami <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="beranda" className={`${isMob ? "pt-20 pb-16" : isDesk ? "pt-32 pb-24" : "pt-20 md:pt-32 pb-16 md:pb-24"}`}>
        <div className={`max-w-5xl mx-auto ${isMob ? "px-4 text-left" : isDesk ? "px-6 text-center" : "px-4 md:px-6 text-left md:text-center"} flex flex-col ${isMob ? "items-start" : isDesk ? "items-center" : "items-start md:items-center"}`}>
          <EditableText value={editedHeadline} onChange={(v) => { setEditedHeadline(v); markChanged(); }} isEditMode={em} as="h1" className={`font-normal tracking-tighter leading-[1.1] ${textPrimary} ${isMob ? "text-5xl mb-6" : isDesk ? "text-[72px] mb-8" : "text-5xl md:text-[72px] mb-6 md:mb-8"}`} />
          <EditableText value={editedSubheadline} onChange={(v) => { setEditedSubheadline(v); markChanged(); }} isEditMode={em} as="p" multiline className={`${textMuted} leading-relaxed max-w-2xl ${isMob ? "text-[15px] mb-10" : isDesk ? "text-[18px] mb-12" : "text-[15px] md:text-[18px] mb-10 md:mb-12"}`} />
          <div className={`flex gap-4 ${isMob ? "flex-col w-full items-start" : isDesk ? "flex-row w-auto justify-center" : "flex-col md:flex-row w-full md:w-auto items-start md:justify-center"}`}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`text-white font-normal rounded-md transition-all flex items-center justify-center gap-2 ${isMob ? "px-6 py-4 text-[14px] w-full" : isDesk ? "px-8 py-4 text-[15px]" : "px-6 md:px-8 py-4 text-[14px] md:text-[15px] w-full md:w-auto"}`} style={{ backgroundColor: pc }}>
              <EditableText value={editedCtaText || "Hubungi Kami"} onChange={(v) => { setEditedCtaText(v); markChanged(); }} isEditMode={em} /> <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </a>
            {navItems.find(n => n.label === "Layanan") && (
              <a href="#layanan" className={`font-normal rounded-md border ${hairline} ${textPrimary} transition-colors flex items-center justify-center ${isMob ? "px-6 py-4 text-[14px] w-full" : isDesk ? "px-8 py-4 text-[15px]" : "px-6 md:px-8 py-4 text-[14px] md:text-[15px] w-full md:w-auto"}`}>
                Lihat Layanan
              </a>
            )}
          </div>
        </div>
      </section>

      <div className={`max-w-7xl mx-auto px-4 md:px-6`}><div className={`w-full border-t ${hairline}`}></div></div>

      {/* ── Tentang Kami ── */}
      <section id="tentang" className={`${isMob ? "py-20" : isDesk ? "py-32" : "py-20 md:py-32"}`}>
        <div className={`max-w-7xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
          <div className={`flex ${isMob ? "flex-col gap-10" : isDesk ? "flex-row gap-20" : "flex-col md:flex-row gap-10 md:gap-20"}`}>
            <div className="flex-1">
              <h2 className={`font-normal tracking-tight leading-[1.2] ${textPrimary} ${isMob ? "text-3xl mb-6" : isDesk ? "text-[36px] mb-8" : "text-3xl md:text-[36px] mb-6 md:mb-8"}`}>
                <EditableText value={editedAboutJudul} onChange={(v) => { setEditedAboutJudul(v); markChanged(); }} isEditMode={em} as="span" />
              </h2>
              <EditableText value={editedAboutDeskripsi} onChange={(v) => { setEditedAboutDeskripsi(v); markChanged(); }} isEditMode={em} as="p" multiline className={`${textMuted} leading-relaxed text-[15px]`} />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className={`border-l ${hairline} pl-6 md:pl-10 space-y-6 md:space-y-8`}>
                {about.keunggulan.map((k, i) => (
                  <div key={i}>
                    <p className={`text-[12px] font-mono mb-2 ${textMuted}`}>0{i + 1}</p>
                    <EditableText value={editedAboutKeunggulan[i] ?? k} onChange={(v) => { const a = [...editedAboutKeunggulan]; a[i] = v; setEditedAboutKeunggulan(a); markChanged(); }} isEditMode={em} as="p" className={`font-normal text-[18px] ${textPrimary}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={`max-w-7xl mx-auto px-4 md:px-6`}><div className={`w-full border-t ${hairline}`}></div></div>

      {/* ── Layanan ── */}
      {layanan.length > 0 && (
        <section id="layanan" className={`${isMob ? "py-20" : isDesk ? "py-32" : "py-20 md:py-32"}`}>
          <div className={`max-w-7xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
            <div className={`mb-12 md:mb-16 ${layanan.length <= 2 ? 'text-center' : ''}`}>
              <h2 className={`font-normal tracking-tight leading-[1.2] ${textPrimary} ${isMob ? "text-3xl" : isDesk ? "text-[36px]" : "text-3xl md:text-[36px]"}`}>Layanan Kami</h2>
            </div>
            {(() => {
              const layananCount = layanan.length;
              const gridClass = 
                layananCount === 1 ? "grid-cols-1 max-w-3xl mx-auto" :
                layananCount === 2 ? `max-w-4xl mx-auto ${isMob ? "grid-cols-1" : isDesk ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"}` :
                `${isMob ? "grid-cols-1" : isDesk ? "grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`;

              return (
                <div className={`grid gap-6 ${gridClass}`}>
                  {layanan.map((l, i) => {
                    const currentHarga = editedLayanan[i]?.harga ?? l.harga;
                    const isHargaButton = currentHarga.toLowerCase().includes("hubungi");
                    
                    if (layananCount === 1) {
                      return (
                        <div key={i} className={`flex flex-col items-center text-center gap-6 p-6 md:p-10 rounded-xl border ${hairline} ${surface}`}>
                          <div className="w-full">
                            <EditableText value={editedLayanan[i]?.nama ?? l.nama} onChange={(v) => { const a = [...editedLayanan]; if(!a[i]) a[i] = {...l}; a[i].nama = v; setEditedLayanan(a); markChanged(); }} isEditMode={em} as="h3" className={`font-normal mb-3 ${textPrimary} ${isMob ? "text-[24px]" : isDesk ? "text-[32px]" : "text-[24px] md:text-[32px]"}`} />
                            <EditableText value={editedLayanan[i]?.deskripsi ?? l.deskripsi} onChange={(v) => { const a = [...editedLayanan]; if(!a[i]) a[i] = {...l}; a[i].deskripsi = v; setEditedLayanan(a); markChanged(); }} isEditMode={em} as="p" multiline className={`${textMuted} leading-relaxed text-[16px] mb-0`} />
                          </div>
                          <div className={`pt-6 border-t ${hairline} w-full flex justify-center`}>
                            {isHargaButton ? (
                              <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-8 py-3.5 rounded-md transition-colors text-[15px] font-normal" style={{ backgroundColor: pc, color: "white" }}>
                                <EditableText value={currentHarga} onChange={(v) => { const a = [...editedLayanan]; if(!a[i]) a[i] = {...l}; a[i].harga = v; setEditedLayanan(a); markChanged(); }} isEditMode={em} />
                                <ArrowUpRight className="w-4 h-4" />
                              </a>
                            ) : (
                              <EditableText value={currentHarga} onChange={(v) => { const a = [...editedLayanan]; if(!a[i]) a[i] = {...l}; a[i].harga = v; setEditedLayanan(a); markChanged(); }} isEditMode={em} className={`font-mono text-[18px] md:text-[20px] ${textPrimary}`} />
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={i} className={`border ${hairline} rounded-lg ${surface} p-6 md:p-8 flex flex-col`}>
                        <EditableText value={editedLayanan[i]?.nama ?? l.nama} onChange={(v) => { const a = [...editedLayanan]; if(!a[i]) a[i] = {...l}; a[i].nama = v; setEditedLayanan(a); markChanged(); }} isEditMode={em} as="h3" className={`font-normal mb-3 ${textPrimary} ${isMob ? "text-[20px]" : isDesk ? "text-[24px]" : "text-[20px] md:text-[24px]"}`} />
                        <EditableText value={editedLayanan[i]?.deskripsi ?? l.deskripsi} onChange={(v) => { const a = [...editedLayanan]; if(!a[i]) a[i] = {...l}; a[i].deskripsi = v; setEditedLayanan(a); markChanged(); }} isEditMode={em} as="p" multiline className={`${textMuted} leading-relaxed text-[15px] mb-6 flex-1`} />
                        <div className={`pt-4 border-t ${hairline} mt-auto`}>
                          {isHargaButton ? (
                            <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors text-[13px] font-normal" style={{ backgroundColor: pc, color: "white" }}>
                              <EditableText value={currentHarga} onChange={(v) => { const a = [...editedLayanan]; if(!a[i]) a[i] = {...l}; a[i].harga = v; setEditedLayanan(a); markChanged(); }} isEditMode={em} />
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <EditableText value={currentHarga} onChange={(v) => { const a = [...editedLayanan]; if(!a[i]) a[i] = {...l}; a[i].harga = v; setEditedLayanan(a); markChanged(); }} isEditMode={em} className={`font-mono text-[14px] ${textPrimary}`} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            
            {/* Cara Kerja */}
            <div className={`mt-24 md:mt-32`}>
              <div className="mb-12 md:mb-16">
                <EditableText value={editedCaraKerjaTitle} onChange={(v) => { setEditedCaraKerjaTitle(v); markChanged(); }} isEditMode={em} as="h2" className={`font-normal tracking-tight leading-[1.2] ${textPrimary} ${isMob ? "text-3xl" : isDesk ? "text-[36px]" : "text-3xl md:text-[36px]"}`} />
              </div>
              <div className={`grid ${isMob ? "grid-cols-1 gap-12" : isDesk ? "grid-cols-3 gap-8" : "grid-cols-1 md:grid-cols-3 gap-8 md:gap-8"}`}>
                {editedCaraKerja.slice(0, 3).map((ck, i) => {
                  const badgeColor = timelineColors[i % timelineColors.length];
                  return (
                    <div key={i} className="relative">
                      {i < editedCaraKerja.slice(0, 3).length - 1 && !isMob && (
                        <div className={`absolute top-4 left-10 right-[-1rem] h-[1px] ${isDesk ? "block" : "hidden md:block"} ${hairline}`} />
                      )}
                      <div className="flex flex-col items-start relative z-10">
                        <div className={`inline-flex items-center justify-center rounded-full font-mono text-[13px] mb-5 w-8 h-8`} style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}>
                          <EditableText value={ck.step} onChange={(v) => { const a = [...editedCaraKerja]; a[i] = {...a[i], step: v}; setEditedCaraKerja(a); markChanged(); }} isEditMode={em} />
                        </div>
                        <EditableText value={ck.title} onChange={(v) => { const a = [...editedCaraKerja]; a[i] = {...a[i], title: v}; setEditedCaraKerja(a); markChanged(); }} isEditMode={em} as="h4" className={`font-normal tracking-tight mb-3 ${textPrimary} ${isMob ? "text-[20px]" : "text-[22px]"}`} />
                        <EditableText value={ck.desc} onChange={(v) => { const a = [...editedCaraKerja]; a[i] = {...a[i], desc: v}; setEditedCaraKerja(a); markChanged(); }} isEditMode={em} as="p" multiline className={`${textMuted} leading-relaxed text-[15px]`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Portofolio ── */}
      {portfolioPhotos.length > 0 && (
        <>
          <div className={`max-w-7xl mx-auto px-4 md:px-6`}><div className={`w-full border-t ${hairline}`}></div></div>
          <section id="portofolio" className={`${isMob ? "py-20" : isDesk ? "py-32" : "py-20 md:py-32"}`}>
            <div className={`max-w-7xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
              <div className="mb-12 md:mb-16">
                <h2 className={`font-normal tracking-tight leading-[1.2] ${textPrimary} ${isMob ? "text-3xl" : isDesk ? "text-[36px]" : "text-3xl md:text-[36px]"}`}>Portofolio</h2>
              </div>
              
              {(() => {
                const count = portfolioPhotos.length;
                const wrapperClass = "overflow-hidden rounded-lg";

                const getPos = (i: number) => positions[i] ?? { x: 50, y: 50, scale: 1 };

                const renderImg = (i: number, aspectClass: string) => {
                  const pos = getPos(i);
                  const isRepo = repositioningIndex === i;
                  return (
                    <div key={i} className={`relative ${aspectClass}`}>
                      {/* Drag container */}
                      <div
                        className={`w-full h-full overflow-hidden rounded-lg ${isRepo ? 'ring-2 ring-blue-400 ring-offset-0' : ''}`}
                        style={{ cursor: isRepo ? (isDragging ? 'grabbing' : 'grab') : 'pointer' }}
                        onClick={() => { if (!em || isRepo) { if (!isRepo) setLightboxIndex(i); } }}
                        onMouseDown={(e) => handleMouseDown(e, i)}
                        onMouseMove={(e) => handleMouseMove(e, i)}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={(e) => handleTouchStart(e, i)}
                        onTouchMove={(e) => handleTouchMove(e, i)}
                        onTouchEnd={handleMouseUp}
                        onWheel={(e) => handleWheel(e, i)}
                      >
                        <img
                          src={portfolioPhotos[i]}
                          alt={`Portofolio ${i + 1}`}
                          className="w-full h-full"
                          style={{
                            objectFit: 'cover',
                            objectPosition: `${pos.x}% ${pos.y}%`,
                            transform: `scale(${pos.scale})`,
                            transformOrigin: `${pos.x}% ${pos.y}%`,
                            transition: isDragging && isRepo ? 'none' : 'transform 0.2s ease',
                            userSelect: 'none',
                            pointerEvents: 'none',
                          }}
                          draggable={false}
                          loading="lazy"
                        />
                      </div>
                      {/* Atur Posisi button — OUTSIDE drag container */}
                      {em && !isRepo && (
                        <button
                          type="button"
                          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setRepositioningIndex(i); }}
                          className="absolute top-2 right-2 z-30 bg-black/60 text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1 hover:bg-black/80 transition-colors cursor-pointer"
                        >
                          <Move className="w-3 h-3" />
                          Atur Posisi
                        </button>
                      )}
                      {/* Toolbar — OUTSIDE drag container */}
                      {em && isRepo && (
                        <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/70 px-3 py-2 rounded-b-lg flex items-center gap-3" onPointerDown={(e) => e.stopPropagation()}>
                          <button type="button" onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); adjustZoom(i, -0.1); }} className="cursor-pointer"><ZoomOut className="w-4 h-4 text-white" /></button>
                          <input type="range" min="1" max="3" step="0.1" value={pos.scale} onChange={(e) => adjustZoom(i, 0, parseFloat(e.target.value))} className="flex-1 h-1 accent-white" onPointerDown={(e) => e.stopPropagation()} />
                          <button type="button" onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); adjustZoom(i, 0.1); }} className="cursor-pointer"><ZoomIn className="w-4 h-4 text-white" /></button>
                          <button type="button" onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); resetPosition(i); }} className="text-[11px] text-white/70 hover:text-white cursor-pointer">Reset</button>
                          <button type="button" onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setRepositioningIndex(null); markChanged(); }} className="text-[11px] bg-white text-black font-semibold px-3 py-1 rounded-md cursor-pointer">Selesai</button>
                        </div>
                      )}
                    </div>
                  );
                };

                if (count === 1) {
                  return (
                    <div className="max-w-3xl mx-auto">
                      {renderImg(0, "aspect-[16/9]")}
                    </div>
                  );
                }
                
                if (count === 2) {
                  return (
                    <div className={`grid ${isMob ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
                      {renderImg(0, "aspect-square")}
                      {renderImg(1, "aspect-square")}
                    </div>
                  );
                }

                if (count === 3) {
                  return (
                    <div className={`grid ${isMob ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
                      {renderImg(0, isMob ? "aspect-[2/3]" : "aspect-auto h-full")}
                      <div className="grid grid-rows-2 gap-2">
                        {renderImg(1, "aspect-square")}
                        {renderImg(2, "aspect-square")}
                      </div>
                    </div>
                  );
                }

                if (count === 4) {
                  return (
                    <div className={`grid ${isMob ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
                      {[0, 1, 2, 3].map(i => renderImg(i, "aspect-square"))}
                    </div>
                  );
                }

                if (count === 5) {
                  return (
                    <div className="flex flex-col gap-2">
                      {renderImg(0, "aspect-[16/9]")}
                      <div className={`grid ${isMob ? "grid-cols-2" : "grid-cols-4"} gap-2`}>
                        {[1, 2, 3, 4].map(i => renderImg(i, "aspect-square"))}
                      </div>
                    </div>
                  );
                }

                if (count === 6) {
                  return (
                    <div className={`grid ${isMob ? "grid-cols-1" : isDesk ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-3"} gap-2`}>
                      {[0, 1, 2, 3, 4, 5].map(i => renderImg(i, "aspect-[4/3]"))}
                    </div>
                  );
                }

                // 7 or more
                const visibleCount = showAllPortofolio ? count : Math.min(count, 9);
                return (
                  <div className="flex flex-col items-center">
                    <div className={`grid ${isMob ? "grid-cols-2" : isDesk ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-3"} gap-2 w-full`}>
                      {portfolioPhotos.slice(0, visibleCount).map((_, i) => (
                        <div key={i}>
                          {renderImg(i, "aspect-square")}
                        </div>
                      ))}
                    </div>
                    {count > 9 && !showAllPortofolio && (
                      <button 
                        onClick={() => setShowAllPortofolio(true)}
                        className={`mt-8 px-6 py-3 rounded-full border ${hairline} ${textPrimary} transition-colors text-[14px] font-medium cursor-pointer`}
                      >
                        Lihat Semua ({count} Foto)
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </section>
        </>
      )}

      {/* ── Harga ── */}
      {plans.length > 0 && (
        <>
          <div className={`max-w-7xl mx-auto px-4 md:px-6`}><div className={`w-full border-t ${hairline}`}></div></div>
          <section id="harga" className={`${isMob ? "py-20" : isDesk ? "py-32" : "py-20 md:py-32"}`}>
            <div className={`max-w-7xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
              <div className="mb-12 md:mb-16">
                <h2 className={`font-normal tracking-tight leading-[1.2] ${textPrimary} ${isMob ? "text-3xl" : isDesk ? "text-[36px]" : "text-3xl md:text-[36px]"}`}>Paket Harga</h2>
              </div>
              <div className={`grid ${isMob ? "grid-cols-1 gap-6" : isDesk ? "grid-cols-3 gap-6" : "grid-cols-1 md:grid-cols-3 gap-6"}`}>
                {plans.map((plan, idx) => {
                  const isPopular = plan.isPopuler;
                  return (
                    <div key={idx} className={`border ${hairline} rounded-lg ${surface} p-6 md:p-8 flex flex-col relative`} style={isPopular ? { backgroundColor: pcMuted } : undefined}>
                      {isPopular && (
                        <div className="absolute top-6 right-6 font-mono text-[11px] tracking-wider uppercase px-2 py-1 rounded-full border" style={{ borderColor: pc, color: pc }}>Populer</div>
                      )}
                      <EditableText value={editedPaketNama[idx] ?? plan.namaPaket} onChange={(v) => { const a = [...editedPaketNama]; a[idx] = v; setEditedPaketNama(a); markChanged(); }} isEditMode={em} as="h3" className={`font-normal mb-2 ${textPrimary} ${isMob ? "text-[18px]" : "text-[20px]"}`} />
                      <div className="flex items-baseline gap-1 mb-8">
                        <span className={`text-[14px] font-mono ${textMuted}`}>Rp</span>
                        <EditableText value={editedPaketHarga[idx] ?? plan.harga} onChange={(v) => { const a = [...editedPaketHarga]; a[idx] = v; setEditedPaketHarga(a); markChanged(); }} isEditMode={em} className={`font-mono ${textPrimary} ${isMob ? "text-[28px]" : "text-[32px]"}`} />
                      </div>
                      <div className={`w-full border-t ${hairline} mb-6`} style={isPopular ? { borderColor: pc } : undefined}></div>
                      <ul className="space-y-4 mb-8 flex-1">
                        {plan.fitur.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-3">
                            <span className={`text-[15px] font-mono ${textMuted}`}>{fi + 1}.</span>
                            <span className={`text-[15px] ${textPrimary}`}>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-2 py-3 rounded-md text-[14px] font-normal transition-colors`} style={isPopular ? { backgroundColor: pc, color: "white" } : { border: `1px solid`, borderColor: pc, color: pc }}>
                        Pilih Paket <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Testimoni ── */}
      {testimonialPlaceholder.length > 0 && (
        <>
          <div className={`max-w-7xl mx-auto px-4 md:px-6`}><div className={`w-full border-t ${hairline}`}></div></div>
          <section id="testimoni" className={`${isMob ? "py-20" : isDesk ? "py-32" : "py-20 md:py-32"}`}>
            <div className={`max-w-7xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
              <div className="mb-12 md:mb-16">
                <h2 className={`font-normal tracking-tight leading-[1.2] ${textPrimary} ${isMob ? "text-3xl" : isDesk ? "text-[36px]" : "text-3xl md:text-[36px]"}`}>Testimoni</h2>
              </div>
              <div className={`grid gap-6 ${isMob ? "grid-cols-1" : isDesk ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3"}`}>
                {testimonialPlaceholder.map((t, i) => (
                  <div key={i} className={`${surface} border ${hairline} rounded-lg flex flex-col p-6 md:p-8`}>
                    <StarRating rating={editedTestimonials[i]?.rating ?? t.rating ?? 5} onChange={(v) => { const a = [...editedTestimonials]; if(!a[i]) a[i] = {...t}; a[i].rating = v; setEditedTestimonials(a); markChanged(); }} isEditMode={em} />
                    <EditableText value={editedTestimonials[i]?.teks ?? t.teks} onChange={(v) => { const a = [...editedTestimonials]; if(!a[i]) a[i] = {...t}; a[i].teks = v; setEditedTestimonials(a); markChanged(); }} isEditMode={em} as="p" multiline className={`${textMuted} leading-relaxed mb-8 flex-1 text-[15px]`} />
                    <div className={`pt-4 border-t ${hairline}`}>
                      <EditableText value={editedTestimonials[i]?.nama ?? t.nama} onChange={(v) => { const a = [...editedTestimonials]; if(!a[i]) a[i] = {...t}; a[i].nama = v; setEditedTestimonials(a); markChanged(); }} isEditMode={em} as="p" className={`font-normal ${textPrimary} text-[15px]`} />
                      <EditableText value={editedTestimonials[i]?.peran ?? t.peran} onChange={(v) => { const a = [...editedTestimonials]; if(!a[i]) a[i] = {...t}; a[i].peran = v; setEditedTestimonials(a); markChanged(); }} isEditMode={em} as="p" className={`${textMuted} text-[13px] mt-1`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── CTA ── */}
      <section className={`${isMob ? "py-24" : isDesk ? "py-32" : "py-24 md:py-32"}`} style={{ backgroundColor: pc }}>
        <div className={`max-w-5xl mx-auto text-center ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
          <EditableText value={editedFooterTagline || "Siap untuk Memulai?"} onChange={(v) => { setEditedFooterTagline(v); markChanged(); }} isEditMode={em} as="h2" className={`font-normal text-white tracking-tight leading-[1.1] ${isMob ? "text-4xl mb-6" : isDesk ? "text-6xl mb-8" : "text-4xl md:text-6xl mb-6 md:mb-8"}`} />
          <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 bg-white font-normal rounded-md transition-all ${isMob ? "px-8 py-4 text-[15px]" : isDesk ? "px-10 py-5 text-[16px]" : "px-8 md:px-10 py-4 md:py-5 text-[15px] md:text-[16px]"}`} style={{ color: pc }}>
            <EditableText value={editedFooterCta || "Hubungi Kami Sekarang"} onChange={(v) => { setEditedFooterCta(v); markChanged(); }} isEditMode={em} /> <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`${surface} border-t ${hairline} ${isMob ? "py-12" : isDesk ? "py-20" : "py-12 md:py-20"}`}>
        <div className={`max-w-7xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
          <div className={`grid gap-12 ${isMob ? "grid-cols-1" : isDesk ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3"}`}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                {logo ? (
                  <img src={logo} alt={namaBisnis} className="w-6 h-6 rounded-md object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: pc }}>
                    <span className="text-white text-[10px] font-normal">{namaBisnis.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className={`font-normal text-[16px] ${textPrimary}`}>{editedNamaBisnis}</span>
              </div>
              <EditableText value={editedFooterDesc} onChange={(v) => { setEditedFooterDesc(v); markChanged(); }} isEditMode={em} as="p" multiline className={`${textMuted} text-[14px] leading-relaxed max-w-xs`} />
            </div>

            {(kontak.wa || kontak.telepon || kontak.email) && (
              <div>
                <EditableText value={editedFooterKontakTitle} onChange={(v) => { setEditedFooterKontakTitle(v); markChanged(); }} isEditMode={em} as="p" className={`font-mono text-[12px] uppercase tracking-wider mb-6 ${textPrimary}`} />
                <div className="space-y-4">
                  {kontak.wa && (
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className={`block text-[14px] ${textMuted} hover:${textPrimary} transition-colors`}>WhatsApp</a>
                  )}
                  {kontak.telepon && (
                    <a href={`tel:${kontak.telepon}`} className={`block text-[14px] ${textMuted} hover:${textPrimary} transition-colors`}>{kontak.telepon}</a>
                  )}
                  {kontak.email && (
                    <a href={`mailto:${kontak.email}`} className={`block text-[14px] ${textMuted} hover:${textPrimary} transition-colors`}>{kontak.email}</a>
                  )}
                </div>
              </div>
            )}

            {(sosmed.instagram || sosmed.twitter || sosmed.tiktok) && (
              <div>
                <EditableText value={editedFooterSosmedTitle} onChange={(v) => { setEditedFooterSosmedTitle(v); markChanged(); }} isEditMode={em} as="p" className={`font-mono text-[12px] uppercase tracking-wider mb-6 ${textPrimary}`} />
                <div className="space-y-4">
                  {sosmed.instagram && (
                    <a href={`https://instagram.com/${sosmed.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className={`block text-[14px] ${textMuted} hover:${textPrimary} transition-colors`}>Instagram</a>
                  )}
                  {sosmed.tiktok && (
                    <a href={`https://tiktok.com/${sosmed.tiktok.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className={`block text-[14px] ${textMuted} hover:${textPrimary} transition-colors`}>TikTok</a>
                  )}
                  {sosmed.twitter && (
                    <a href={`https://x.com/${sosmed.twitter.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className={`block text-[14px] ${textMuted} hover:${textPrimary} transition-colors`}>Twitter / X</a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={`border-t ${hairline} mt-12 md:mt-20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4`}>
            <EditableText value={editedCopyright} onChange={(v) => { setEditedCopyright(v); markChanged(); }} isEditMode={em} as="p" className={`${textMuted} text-[13px]`} />
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`text-[13px] font-normal transition-colors`} style={{ color: pc }}>Hubungi Kami</a>
          </div>
        </div>
      </footer>

      {/* ── Floating Save Button ── */}
      {isEditable && hasChanges && !em && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-normal px-6 py-3.5 rounded-md transition-all duration-300 animate-[slideUp_0.3s_ease-out] cursor-pointer disabled:opacity-60"
          style={{ animationFillMode: "both" }}
        >
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-md text-[14px] font-normal shadow-lg transition-all duration-300 animate-[slideUp_0.3s_ease-out] ${
          toast.includes("berhasil") ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors cursor-pointer"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 transition-colors disabled:opacity-30 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => Math.max(i! - 1, 0)); }}
            disabled={lightboxIndex === 0}
          >
            <ArrowLeft className="w-8 h-8" />
          </button>

          <img 
            src={portfolioPhotos[lightboxIndex]}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
            alt={`Portofolio ${lightboxIndex + 1}`}
          />
          
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 transition-colors disabled:opacity-30 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => Math.min(i! + 1, portfolioPhotos.length - 1)); }}
            disabled={lightboxIndex === portfolioPhotos.length - 1}
          >
            <ArrowRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-[14px] font-medium tracking-widest">
            {lightboxIndex + 1} / {portfolioPhotos.length}
          </div>
        </div>
      )}

    </div>
  );
}
