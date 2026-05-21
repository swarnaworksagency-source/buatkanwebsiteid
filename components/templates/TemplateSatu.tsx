"use client";

import { useState, useEffect, useCallback } from "react";
import type { TemplateData, AILayananItem, AICaraKerjaItem } from "@/types";
import { EditableText } from "@/components/ui/EditableText";
import {
  CheckCircle, ArrowRight, MessageCircle, Star, Shield, Zap,
  Menu, X, Quote, Clock, Award, Users,
  Wrench, Sparkles, Headphones, Settings, Palette, Camera,
  Phone, Mail, Check,
} from "lucide-react";

const SERVICE_ICONS = [Wrench, Settings, Sparkles, Headphones, Palette, Camera, Shield, Zap, Award, Clock, Users, CheckCircle];

const DEFAULT_CARA_KERJA = [
  { step: "01", title: "Konsultasi", desc: "Hubungi kami via WhatsApp untuk diskusi kebutuhan Anda secara gratis." },
  { step: "02", title: "Pengerjaan", desc: "Tim profesional kami segera mengerjakan sesuai jadwal yang disepakati." },
  { step: "03", title: "Selesai", desc: "Pekerjaan selesai dengan hasil terjamin. Garansi kepuasan pelanggan." },
];

function StarRating({ rating, onChange, isEditMode }: { rating: number, onChange: (val: number) => void, isEditMode: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1 mb-3" data-editable={isEditMode ? "true" : undefined}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{
            cursor: isEditMode ? 'pointer' : 'default',
            color: star <= (isEditMode ? (hovered || rating) : rating) ? '#f59e0b' : '#3f3f46',
            fontSize: '18px',
            lineHeight: 1,
            transition: 'color 0.15s'
          }}
          onMouseEnter={() => isEditMode && setHovered(star)}
          onMouseLeave={() => isEditMode && setHovered(0)}
          onClick={(e) => { if (isEditMode) { e.preventDefault(); e.stopPropagation(); onChange(star); } }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

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
    about = { judul: "Tentang Kami", deskripsi: "Penjelasan mengenai keahlian dan pengalaman bisnis Anda.", keunggulan: ["Berpengalaman", "Terpercaya", "Profesional"] }, 
    layanan = [{ nama: "Layanan 1", deskripsi: "Deskripsi layanan pertama", harga: "Mulai Rp 100.000" }, { nama: "Layanan 2", deskripsi: "Deskripsi layanan kedua", harga: "Hubungi Kami" }], 
    testimonialPlaceholder = [{ nama: "Budi", peran: "Pelanggan", teks: "Pelayanan sangat memuaskan dan cepat." }], 
    footer = { tagline: "Layanan profesional untuk Anda.", ctaText: "Hubungi Kami" },
    namaBisnis = "Bisnis Anda", 
    kontak = { wa: "", telepon: "", email: "" },
    sosmed = { instagram: "", tiktok: "", twitter: "" },
    warna = { primary: "#4f46e5", tema: "light" },
    paketHarga = [],
    logo = "", 
    fotoBisnis = [], 
    portofolio = [], 
    targetPelanggan, 
    caraKerja = DEFAULT_CARA_KERJA,
    caraKerjaTitle = "Cara Kerja Kami",
    forceMobile,
    isEditable = false,
    isEditMode = false,
    onContentUpdate,
    websiteId,
  } = props;
  
  const pc = warna.primary || "#4f46e5";
  const isDark = warna.tema === "dark";
  const waLink = `https://wa.me/${kontak.wa}?text=Halo,%20saya%20tertarik%20dengan%20layanan%20Anda...`;
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
  const [editedCaraKerja, setEditedCaraKerja] = useState<AICaraKerjaItem[]>([...caraKerja]);
  const [editedCaraKerjaTitle, setEditedCaraKerjaTitle] = useState(caraKerjaTitle);
  const [editedTestimonials, setEditedTestimonials] = useState([...testimonialPlaceholder]);
  const [editedFooterTagline, setEditedFooterTagline] = useState(footer.tagline);
  const [editedFooterCta, setEditedFooterCta] = useState(footer.ctaText);
  const [editedFooterKontakTitle, setEditedFooterKontakTitle] = useState(footer.kontakTitle || "Kontak");
  const [editedFooterSosmedTitle, setEditedFooterSosmedTitle] = useState(footer.sosmedTitle || "Sosial Media");
  const [editedFooterDesc, setEditedFooterDesc] = useState(about.deskripsi.substring(0, 120) + "...");
  const [editedCopyright, setEditedCopyright] = useState(`© ${new Date().getFullYear()} ${namaBisnis}. Hak cipta dilindungi.`);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { setEditedNamaBisnis(namaBisnis); }, [namaBisnis]);
  useEffect(() => { setEditedHeadline(hero.headline); setEditedSubheadline(hero.subheadline); setEditedCtaText(hero.ctaText); }, [hero]);
  useEffect(() => { setEditedAboutJudul(about.judul); setEditedAboutDeskripsi(about.deskripsi); setEditedAboutKeunggulan([...about.keunggulan]); }, [about]);
  useEffect(() => { setEditedLayanan([...layanan]); }, [layanan]);
  useEffect(() => { setEditedCaraKerja([...caraKerja]); setEditedCaraKerjaTitle(caraKerjaTitle); }, [caraKerja, caraKerjaTitle]);
  useEffect(() => { setEditedPaketNama(paketHarga.map(p => p.namaPaket)); setEditedPaketHarga(paketHarga.map(p => p.harga)); }, [paketHarga]);
  useEffect(() => { setEditedTestimonials([...testimonialPlaceholder]); }, [testimonialPlaceholder]);
  useEffect(() => { setEditedFooterTagline(footer.tagline); setEditedFooterCta(footer.ctaText); setEditedFooterKontakTitle(footer.kontakTitle || "Kontak"); setEditedFooterSosmedTitle(footer.sosmedTitle || "Sosial Media"); }, [footer]);

  // Auto-sync inline edits back to parent so "Simpan Perubahan" in left panel gets them
  useEffect(() => {
    if (hasChanges && onContentUpdate) {
      // Debounce slightly to avoid rapid state updates if multiple fields change quickly
      const handler = setTimeout(() => {
        onContentUpdate({
          namaBisnis: editedNamaBisnis,
          hero: { headline: editedHeadline, subheadline: editedSubheadline, ctaText: editedCtaText },
          about: { judul: editedAboutJudul, deskripsi: editedAboutDeskripsi, keunggulan: editedAboutKeunggulan },
          layanan: editedLayanan,
          caraKerja: editedCaraKerja,
          caraKerjaTitle: editedCaraKerjaTitle,
          testimonialPlaceholder: editedTestimonials,
          footer: { tagline: editedFooterTagline, ctaText: editedFooterCta, kontakTitle: editedFooterKontakTitle, sosmedTitle: editedFooterSosmedTitle },
          paketHarga: paketHarga.map((p, i) => ({ ...p, namaPaket: editedPaketNama[i] ?? p.namaPaket, harga: editedPaketHarga[i] ?? p.harga })),
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
    paketHarga, hasChanges, onContentUpdate
  ]);

  const markChanged = useCallback(() => setHasChanges(true), []);
  const em = isEditMode; // shorthand for edit mode

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
  }, [editedNamaBisnis, editedHeadline, editedSubheadline, editedCtaText, editedAboutJudul, editedAboutDeskripsi, editedAboutKeunggulan, editedLayanan, editedCaraKerja, editedCaraKerjaTitle, editedPaketNama, editedPaketHarga, editedTestimonials, editedFooterTagline, editedFooterCta, editedFooterKontakTitle, editedFooterSosmedTitle, editedFooterDesc, editedCopyright, paketHarga, onContentUpdate, websiteId]);

  const isMob = forceMobile === true;
  const isDesk = forceMobile === false;

  const pcBg10 = `${pc}1a`;
  const pcBg20 = `${pc}33`;

  const bg = isDark ? "bg-zinc-950" : "bg-white";
  const bgSoft = isDark ? "bg-zinc-900" : "bg-zinc-50/50";
  const textPrimary = isDark ? "text-zinc-100" : "text-zinc-900";
  const textSecondary = isDark ? "text-zinc-400" : "text-zinc-500";
  const textTertiary = isDark ? "text-zinc-500" : "text-zinc-400";
  const borderColor = isDark ? "border-zinc-800" : "border-zinc-100";
  const borderColorSoft = isDark ? "border-zinc-800/50" : "border-zinc-200";
  const cardBg = isDark ? "bg-zinc-900" : "bg-white";
  const cardBorder = isDark ? "border-zinc-800" : "border-zinc-100";
  const navBg = isDark ? "bg-zinc-950/80" : "bg-white/80";
  const heroGradient = isDark
    ? "bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900"
    : "bg-gradient-to-br from-indigo-50/80 via-white to-slate-50";

  const plans = paketHarga && paketHarga.length > 0 ? paketHarga : [];
  const photos = fotoBisnis || [];
  const portfolioPhotos = portofolio || [];

  return (
    <div 
      className={`min-h-full ${bg} ${textPrimary} font-sans relative`} 
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
      <nav className={`sticky top-0 z-50 backdrop-blur-xl ${navBg} border-b ${borderColor}`}>
        <div className={`relative max-w-6xl mx-auto ${isMob ? "px-4 py-3" : isDesk ? "px-6 py-4" : "px-4 md:px-6 py-3 md:py-4"} flex items-center justify-between`}>
          <div className="flex items-center gap-2 z-10 flex-shrink-0">
            {logo ? (
              <img src={logo} alt={namaBisnis} className={`${isMob ? "w-7 h-7" : isDesk ? "w-8 h-8" : "w-7 h-7 md:w-8 md:h-8"} rounded-lg object-cover`} />
            ) : (
              <div className={`${isMob ? "w-7 h-7" : isDesk ? "w-8 h-8" : "w-7 h-7 md:w-8 md:h-8"} rounded-lg flex items-center justify-center`} style={{ backgroundColor: pc }}>
                <span className={`text-white font-bold ${isMob ? "text-xs" : isDesk ? "text-sm" : "text-xs md:text-sm"}`}>{namaBisnis.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <EditableText value={editedNamaBisnis} onChange={(v) => { setEditedNamaBisnis(v); markChanged(); }} isEditMode={em} className={`font-semibold tracking-tight ${textPrimary} truncate max-w-[150px] sm:max-w-[200px] md:max-w-xs ${isMob ? "text-[13px]" : isDesk ? "text-[15px]" : "text-[13px] md:text-[15px]"}`} />
          </div>
          {!isMob && (
            <div className={`${isDesk ? "flex" : "hidden md:flex"} absolute left-1/2 -translate-x-1/2 items-center gap-6 text-[13px] ${textSecondary} font-medium`}>
              {["Beranda", "Tentang", "Layanan", "Harga", "Testimoni"].map((n) => (
                <a key={n} href={`#${n.toLowerCase()}`} className={`hover:${textPrimary} transition-colors`}>{n}</a>
              ))}
            </div>
          )}
          {!isMob && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`z-10 ${isDesk ? "flex" : "hidden md:flex"} text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors items-center gap-1.5`} style={{ backgroundColor: pc }}>
              <MessageCircle className="w-3.5 h-3.5" /> Hubungi Kami
            </a>
          )}
          {(isMob || forceMobile === undefined) && (
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className={`z-10 ${isDesk ? "hidden" : isMob ? "block" : "md:hidden"} p-1.5 rounded-lg transition-colors`}>
              {menuOpen ? <X className={`w-5 h-5 ${textSecondary}`} /> : <Menu className={`w-5 h-5 ${textSecondary}`} />}
            </button>
          )}
        </div>
        {menuOpen && (isMob || forceMobile === undefined) && (
          <div className={`${isDesk ? "hidden" : isMob ? "block" : "md:hidden"} border-t ${borderColor} ${navBg} backdrop-blur-xl px-4 py-3 space-y-1`}>
            {["Beranda", "Tentang", "Layanan", "Harga", "Testimoni"].map((n) => (
              <a key={n} href={`#${n.toLowerCase()}`} onClick={() => setMenuOpen(false)} className={`block py-2 px-3 text-[13px] ${textSecondary} rounded-lg transition-colors`}>{n}</a>
            ))}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 mt-2 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg" style={{ backgroundColor: pc }}>
              <MessageCircle className="w-3.5 h-3.5" /> Hubungi Kami
            </a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="beranda" className="relative overflow-hidden min-h-screen flex flex-col">
        <div className={`absolute inset-0 ${heroGradient}`} />
        <div className={`absolute top-20 right-10 ${isMob ? "w-48 h-48" : isDesk ? "w-72 h-72" : "w-48 md:w-72 h-48 md:h-72"} rounded-full blur-3xl`} style={{ backgroundColor: pcBg10 }} />
        <div className={`relative flex-1 flex max-w-6xl mx-auto w-full ${isMob ? "items-start justify-start pt-24 pb-12 px-6" : isDesk ? "items-center justify-center px-6" : "items-start justify-start pt-24 pb-12 px-6 md:items-center md:justify-center md:pt-0 md:pb-0 md:px-6"}`}>
          <div className={`max-w-3xl flex flex-col ${isMob ? "items-start text-left" : isDesk ? "items-center text-center" : "items-start text-left md:items-center md:text-center"}`}>
            <EditableText value={editedHeadline} onChange={(v) => { setEditedHeadline(v); markChanged(); }} isEditMode={em} as="h1" className={`font-bold leading-[1.15] tracking-tight ${textPrimary} ${isMob ? "text-3xl mb-3" : isDesk ? "text-5xl lg:text-6xl mb-5" : "text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-5"}`} />
            <EditableText value={editedSubheadline} onChange={(v) => { setEditedSubheadline(v); markChanged(); }} isEditMode={em} as="p" multiline className={`${textSecondary} leading-relaxed max-w-2xl ${isMob ? "text-[14px] mb-6" : isDesk ? "text-lg mb-8" : "text-[14px] md:text-lg mb-6 md:mb-8"}`} />
            <div className={`flex gap-2.5 ${isMob ? "flex-col w-full items-start" : isDesk ? "flex-row items-center justify-center gap-3" : "flex-col w-full items-start sm:flex-row sm:w-auto md:items-center md:justify-center gap-2.5 md:gap-3"}`}>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={`group text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${isMob ? "px-5 py-3 text-[14px] w-full" : isDesk ? "px-8 py-3.5 text-[15px]" : "px-5 md:px-8 py-3 md:py-3.5 text-[14px] md:text-[15px] w-full sm:w-auto"}`} style={{ backgroundColor: pc, boxShadow: `0 10px 15px -3px ${pcBg20}` }}>
                <MessageCircle className="w-4 h-4" /> <EditableText value={editedCtaText || "Hubungi via WhatsApp"} onChange={(v) => { setEditedCtaText(v); markChanged(); }} isEditMode={em} /> <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a href="#layanan" className={`font-medium rounded-xl border ${borderColorSoft} ${textSecondary} transition-all text-center ${isMob ? "px-5 py-3 text-[14px] w-full" : isDesk ? "px-8 py-3.5 text-[15px]" : "px-5 md:px-8 py-3 md:py-3.5 text-[14px] md:text-[15px] w-full sm:w-auto"}`}>Lihat Layanan</a>
            </div>
            <div className={`flex flex-wrap items-center border-t ${borderColor} ${isMob ? "gap-4 mt-8 pt-6 justify-start" : isDesk ? "gap-5 mt-10 pt-8 justify-center" : "gap-4 md:gap-5 mt-8 md:mt-10 pt-6 md:pt-8 justify-start md:justify-center"}`}>
              {[
                { icon: Shield, color: "#10b981", label: "Terpercaya" },
                { icon: Zap, color: "#f59e0b", label: "Respon Cepat" },
                { icon: Star, label: "Kualitas Terbaik", fill: true },
              ].map((t) => (
                <div key={t.label} className={`flex items-center gap-1.5 ${isMob ? "text-[11px]" : isDesk ? "text-[12px]" : "text-[11px] md:text-[12px]"}`}>
                  <t.icon className={`${isMob ? "w-3.5 h-3.5" : "w-4 h-4"}`} style={{ color: t.fill ? pc : t.color, fill: t.fill ? pc : "none" }} />
                  <span className={textSecondary}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tentang Kami ── */}
      <section id="tentang" className={`${bgSoft} ${isMob ? "py-12" : isDesk ? "py-20" : "py-12 md:py-20"}`}>
        <div className={`max-w-6xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
          <div className={`${photos.length > 0 && !isMob ? "flex flex-col md:flex-row items-center gap-10" : "text-center max-w-4xl mx-auto"}`}>
            {/* Text Block */}
            <div className={photos.length > 0 && !isMob ? "flex-1" : ""}>
              <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: pc }}>Tentang Kami</p>
              <EditableText value={editedAboutJudul} onChange={(v) => { setEditedAboutJudul(v); markChanged(); }} isEditMode={em} as="h2" className={`font-bold tracking-tight mb-4 ${textPrimary} ${isMob ? "text-xl" : isDesk ? "text-3xl" : "text-xl md:text-3xl"}`} />
              <EditableText value={editedAboutDeskripsi} onChange={(v) => { setEditedAboutDeskripsi(v); markChanged(); }} isEditMode={em} as="p" multiline className={`${textSecondary} leading-relaxed ${isMob ? "text-[13px] mb-8" : isDesk ? "text-[15px] mb-10" : "text-[13px] md:text-[15px] mb-8 md:mb-10"}`} />
              <div className={`grid grid-cols-2 ${isMob ? "gap-3" : "gap-4"}`}>
                {about.keunggulan.map((k, i) => {
                  const Icon = [Award, Clock, Shield, Users][i % 4];
                  return (
                    <div key={i} className={`flex flex-col items-center gap-2 rounded-xl border ${cardBg} ${cardBorder} ${isMob ? "p-3" : isDesk ? "p-5" : "p-3 md:p-5"}`}>
                      <Icon className={`flex-shrink-0 ${isMob ? "w-5 h-5" : "w-6 h-6"}`} style={{ color: pc }} />
                      <div className="text-center">
                        <EditableText value={editedAboutKeunggulan[i] ?? k} onChange={(v) => { const a = [...editedAboutKeunggulan]; a[i] = v; setEditedAboutKeunggulan(a); markChanged(); }} isEditMode={em} as="p" className={`font-semibold ${textPrimary} ${isMob ? "text-[12px]" : "text-[13px]"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Foto Bisnis Grid */}
            {photos.length > 0 && (
              <div className={`${isMob ? "mt-8" : "flex-1 max-w-md"}`}>
                {photos.length === 1 ? (
                  <img src={photos[0]} alt="Foto Bisnis" className="w-full h-64 object-cover rounded-2xl shadow-lg" />
                ) : photos.length === 2 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {photos.slice(0, 2).map((p, i) => (
                      <img key={i} src={p} alt={`Foto Bisnis ${i + 1}`} className="w-full h-48 object-cover rounded-xl shadow-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <img src={photos[0]} alt="Foto Bisnis 1" className="col-span-2 w-full h-48 object-cover rounded-xl shadow-lg" />
                    {photos.slice(1, 3).map((p, i) => (
                      <img key={i} src={p} alt={`Foto Bisnis ${i + 2}`} className="w-full h-32 object-cover rounded-xl shadow-lg" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Layanan ── */}
      <section id="layanan" className={`${bg} min-h-screen flex flex-col justify-center ${isMob ? "py-12" : isDesk ? "py-16" : "py-12 md:py-16"}`}>
        <div className={`max-w-6xl mx-auto w-full ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
          <div className={`text-center ${isMob ? "mb-8" : isDesk ? "mb-12" : "mb-8 md:mb-12"}`}>
            <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: pc }}>Layanan Kami</p>
            <h2 className={`font-bold tracking-tight ${textPrimary} ${isMob ? "text-xl" : isDesk ? "text-3xl" : "text-xl md:text-3xl"}`}>Apa yang Kami Tawarkan</h2>
            <p className={`${textTertiary} text-[13px] mt-2 max-w-lg mx-auto`}>Berbagai layanan profesional untuk memenuhi kebutuhan Anda.</p>
          </div>
          <div className={`flex flex-wrap justify-center ${isMob ? "gap-3" : "gap-5"}`}>
            {layanan.map((l, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <div key={i}
                  className={`group border rounded-2xl transition-all duration-300 hover:shadow-lg ${cardBg} ${cardBorder} ${isMob ? "p-5 w-full" : "p-6"} ${
                    !isMob ? (layanan.length <= 2 ? "w-full max-w-[380px]" : "w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]") : ""
                  }`}>
                  <div className={`rounded-xl flex items-center justify-center mb-4 transition-colors ${isMob ? "w-10 h-10" : "w-12 h-12"}`} style={{ backgroundColor: pcBg10 }}>
                    <Icon className={`${isMob ? "w-5 h-5" : "w-6 h-6"}`} style={{ color: pc }} />
                  </div>
                  <EditableText value={editedLayanan[i]?.nama ?? l.nama} onChange={(v) => { const a = [...editedLayanan]; if(a[i]) a[i] = {...a[i], nama: v}; setEditedLayanan(a); markChanged(); }} isEditMode={em} as="h3" className={`font-semibold mb-1.5 ${textPrimary} ${isMob ? "text-[14px]" : "text-[15px]"}`} />
                  <EditableText value={editedLayanan[i]?.deskripsi ?? l.deskripsi} onChange={(v) => { const a = [...editedLayanan]; if(a[i]) a[i] = {...a[i], deskripsi: v}; setEditedLayanan(a); markChanged(); }} isEditMode={em} as="p" multiline className={`${textTertiary} leading-relaxed ${isMob ? "text-[12px]" : "text-[13px]"}`} />
                </div>
              );
            })}
          </div>

          {/* Cara Kerja */}
          <div className={`border-t ${borderColor} ${isMob ? "mt-10 pt-10" : isDesk ? "mt-16 pt-14" : "mt-10 md:mt-16 pt-10 md:pt-14"}`}>
            <div className={`text-center ${isMob ? "mb-8" : "mb-10"}`}>
              <EditableText value={editedCaraKerjaTitle} onChange={(v) => { setEditedCaraKerjaTitle(v); markChanged(); }} isEditMode={em} as="h3" className={`font-bold tracking-tight ${textPrimary} ${isMob ? "text-lg" : isDesk ? "text-2xl" : "text-lg md:text-2xl"}`} />
            </div>
            <div className={`grid ${isMob ? "grid-cols-1 gap-6" : isDesk ? "grid-cols-3 gap-8" : "grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"} max-w-4xl mx-auto`}>
              {editedCaraKerja.map((ck, i) => (
                <div key={i} className="text-center">
                  <div className={`inline-flex items-center justify-center rounded-full font-bold mb-3 ${isMob ? "w-10 h-10 text-[14px]" : "w-12 h-12 text-[16px]"}`} style={{ backgroundColor: pcBg10, color: pc }}>
                    <EditableText value={ck.step} onChange={(v) => { const a = [...editedCaraKerja]; a[i] = {...a[i], step: v}; setEditedCaraKerja(a); markChanged(); }} isEditMode={em} />
                  </div>
                  <EditableText value={ck.title} onChange={(v) => { const a = [...editedCaraKerja]; a[i] = {...a[i], title: v}; setEditedCaraKerja(a); markChanged(); }} isEditMode={em} as="h4" className={`font-semibold mb-1 ${textPrimary} ${isMob ? "text-[14px]" : "text-[15px]"}`} />
                  <EditableText value={ck.desc} onChange={(v) => { const a = [...editedCaraKerja]; a[i] = {...a[i], desc: v}; setEditedCaraKerja(a); markChanged(); }} isEditMode={em} as="p" multiline className={`${textTertiary} leading-relaxed ${isMob ? "text-[12px]" : "text-[13px]"}`} />
                  {i < editedCaraKerja.length - 1 && !isMob && (
                    <ArrowRight className={`mx-auto mt-3 ${textTertiary} ${isDesk ? "hidden" : "md:hidden"} w-4 h-4`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      {plans.length > 0 && (
        <section id="harga" className={`${bgSoft} ${isMob ? "py-12" : isDesk ? "py-16" : "py-12 md:py-16"}`}>
          <div className={`max-w-6xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
            <div className={`text-center ${isMob ? "mb-8" : isDesk ? "mb-12" : "mb-8 md:mb-12"}`}>
              <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: pc }}>Harga</p>
              <h2 className={`font-bold tracking-tight ${textPrimary} ${isMob ? "text-xl" : isDesk ? "text-3xl" : "text-xl md:text-3xl"}`}>Pilih Paket yang Sesuai</h2>
              <p className={`${textTertiary} text-[13px] mt-2 max-w-lg mx-auto`}>Harga transparan tanpa biaya tersembunyi.</p>
            </div>
            <div className={`flex flex-wrap ${isMob ? "flex-col gap-6" : isDesk ? "flex-row gap-5" : "flex-col md:flex-row gap-6 md:gap-5"}`}>
              {plans.map((plan, idx) => {
                const isPopular = plan.isPopuler;
                return (
                  <div key={idx} className={`relative rounded-2xl border transition-all flex flex-col ${isMob ? "p-5 w-full" : isDesk ? "p-6 flex-1" : "p-5 md:p-6 w-full md:flex-1"} ${isPopular ? "text-white shadow-xl" : `${cardBg} ${cardBorder} hover:shadow-lg`}`}
                    style={isPopular ? { backgroundColor: pc, borderColor: pc, boxShadow: `0 20px 25px -5px ${pcBg20}` } : undefined}>
                    {isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-900 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">Populer</div>}
                    <EditableText value={editedPaketNama[idx] ?? plan.namaPaket} onChange={(v) => { const a = [...editedPaketNama]; a[idx] = v; setEditedPaketNama(a); markChanged(); }} isEditMode={em} as="p" className={`font-semibold mb-1 ${isMob ? "text-[14px]" : "text-[15px]"} ${isPopular ? "text-white" : textPrimary}`} />
                    <div className="flex items-baseline gap-1 mb-5 mt-2">
                      <span className={`text-[11px] ${isPopular ? "text-white/60" : textTertiary}`}>Rp</span>
                      <EditableText value={editedPaketHarga[idx] ?? plan.harga} onChange={(v) => { const a = [...editedPaketHarga]; a[idx] = v; setEditedPaketHarga(a); markChanged(); }} isEditMode={em} className={`font-bold ${isMob ? "text-2xl" : "text-3xl"} ${isPopular ? "text-white" : textPrimary}`} />
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.fitur.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2">
                          <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isPopular ? "text-white/60" : ""}`} style={!isPopular ? { color: pc } : undefined} />
                          <span className={`${isMob ? "text-[12px]" : "text-[13px]"} ${isPopular ? "text-white/80" : textSecondary}`}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors mt-auto"
                      style={isPopular ? { backgroundColor: "white", color: pc } : { backgroundColor: pc, color: "white" }}>
                      <MessageCircle className="w-3.5 h-3.5" /> Pilih Paket
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials + Portofolio photos ── */}
      <section id="testimoni" className={`${bg} ${isMob ? "py-12" : isDesk ? "py-16" : "py-12 md:py-16"}`}>
        <div className={`max-w-6xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
          <div className={`text-center ${isMob ? "mb-8" : isDesk ? "mb-12" : "mb-8 md:mb-12"}`}>
            <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: pc }}>Testimoni</p>
            <h2 className={`font-bold tracking-tight ${textPrimary} ${isMob ? "text-xl" : isDesk ? "text-3xl" : "text-xl md:text-3xl"}`}>Apa Kata Pelanggan Kami</h2>
          </div>
          <div className={`grid gap-4 ${isMob ? "grid-cols-1" : isDesk ? "grid-cols-3 gap-5" : "grid-cols-1 md:grid-cols-3 md:gap-5"}`}>
            {testimonialPlaceholder.map((t, i) => {
              const hasPhoto = portfolioPhotos.length > i && portfolioPhotos[i];
              return (
                <div key={i} className={`${cardBg} border ${cardBorder} rounded-2xl hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full`}>
                  {hasPhoto && (
                    <img src={portfolioPhotos[i]} alt={`Portofolio ${i + 1}`} className="w-full h-48 object-cover flex-shrink-0" />
                  )}
                  <div className={`${isMob ? "p-5" : "p-6"} flex flex-col flex-1`}>
                    <Quote className={`mb-3 flex-shrink-0 ${isMob ? "w-6 h-6" : "w-7 h-7"}`} style={{ color: pcBg20 }} />
                    <EditableText value={editedTestimonials[i]?.teks ?? t.teks} onChange={(v) => { const a = [...editedTestimonials]; if(a[i]) a[i] = {...a[i], teks: v}; setEditedTestimonials(a); markChanged(); }} isEditMode={em} as="p" multiline className={`${textSecondary} leading-relaxed mb-4 flex-1 ${isMob ? "text-[12px]" : "text-[13px]"}`} />
                    <div className="mt-auto">
                      <StarRating rating={editedTestimonials[i]?.rating ?? t.rating ?? 5} onChange={(v) => { const a = [...editedTestimonials]; if(a[i]) a[i] = {...a[i], rating: v}; setEditedTestimonials(a); markChanged(); }} isEditMode={em} />
                      <div className="flex items-center gap-2.5">
                        <div className={`rounded-full flex items-center justify-center flex-shrink-0 ${isMob ? "w-8 h-8" : "w-9 h-9"}`} style={{ backgroundColor: pcBg10 }}>
                          <span className="text-[11px] font-bold" style={{ color: pc }}>{t.nama.charAt(0)}</span>
                        </div>
                        <div>
                          <EditableText value={editedTestimonials[i]?.nama ?? t.nama} onChange={(v) => { const a = [...editedTestimonials]; if(a[i]) a[i] = {...a[i], nama: v}; setEditedTestimonials(a); markChanged(); }} isEditMode={em} as="p" className={`font-semibold ${textPrimary} ${isMob ? "text-[12px]" : "text-[13px]"}`} />
                          <EditableText value={editedTestimonials[i]?.peran ?? t.peran} onChange={(v) => { const a = [...editedTestimonials]; if(a[i]) a[i] = {...a[i], peran: v}; setEditedTestimonials(a); markChanged(); }} isEditMode={em} as="p" className={`${textTertiary} ${isMob ? "text-[10px]" : "text-[11px]"}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`${bgSoft} ${isMob ? "py-12" : isDesk ? "py-16" : "py-12 md:py-16"}`}>
        <div className={`max-w-6xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
          <div className={`relative bg-zinc-900 rounded-2xl overflow-hidden ${isMob ? "p-8" : isDesk ? "p-14" : "p-8 md:p-14"}`}>
            <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 rounded-full blur-3xl translate-x-20 -translate-y-20" style={{ backgroundColor: `${pc}15` }} />
            <div className="relative text-center max-w-2xl mx-auto">
              <EditableText value={editedFooterTagline || "Siap untuk Memulai?"} onChange={(v) => { setEditedFooterTagline(v); markChanged(); }} isEditMode={em} as="h2" className={`font-bold text-white tracking-tight ${isMob ? "text-xl mb-3" : isDesk ? "text-3xl mb-4" : "text-xl md:text-3xl mb-3 md:mb-4"}`} />
              <p className={`text-zinc-400 leading-relaxed ${isMob ? "text-[12px] mb-6" : isDesk ? "text-[15px] mb-8" : "text-[12px] md:text-[15px] mb-6 md:mb-8"}`}>Hubungi kami sekarang melalui WhatsApp untuk konsultasi gratis.</p>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className={`group inline-flex items-center gap-2 text-white font-medium rounded-xl transition-all shadow-xl ${isMob ? "px-6 py-3 text-[13px]" : isDesk ? "px-8 py-3.5 text-[14px]" : "px-6 md:px-8 py-3 md:py-3.5 text-[13px] md:text-[14px]"}`}
                style={{ backgroundColor: pc, boxShadow: `0 20px 25px -5px ${pcBg20}` }}>
                <MessageCircle className="w-4 h-4" /> <EditableText value={editedFooterCta || "Chat WhatsApp Sekarang"} onChange={(v) => { setEditedFooterCta(v); markChanged(); }} isEditMode={em} /> <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`border-t ${borderColor} ${isMob ? "py-8" : isDesk ? "py-12" : "py-8 md:py-12"}`}>
        <div className={`max-w-6xl mx-auto ${isMob ? "px-4" : isDesk ? "px-6" : "px-4 md:px-6"}`}>
          <div className={`grid gap-8 ${isMob ? "grid-cols-1" : isDesk ? "grid-cols-3 gap-10" : "grid-cols-1 md:grid-cols-3 md:gap-10"}`}>
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {logo ? (
                  <img src={logo} alt={namaBisnis} className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: pc }}>
                    <span className="text-white text-[11px] font-bold">{namaBisnis.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className={`font-semibold text-[14px] ${textPrimary}`}>{editedNamaBisnis}</span>
              </div>
              <EditableText value={editedFooterDesc} onChange={(v) => { setEditedFooterDesc(v); markChanged(); }} isEditMode={em} as="p" multiline className={`${textTertiary} text-[12px] leading-relaxed max-w-xs`} />
            </div>

            {/* Contact */}
            {(kontak.wa || kontak.telepon || kontak.email) && (
              <div>
                <EditableText value={editedFooterKontakTitle} onChange={(v) => { setEditedFooterKontakTitle(v); markChanged(); }} isEditMode={em} as="p" className={`font-semibold text-[13px] mb-3 ${textPrimary}`} />
                <div className="space-y-2">
                  {kontak.wa && (
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-[12px] ${textSecondary} hover:${textPrimary} transition-colors`}>
                      <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: pc }} /> WhatsApp
                    </a>
                  )}
                  {kontak.telepon && (
                    <a href={`tel:${kontak.telepon}`} className={`flex items-center gap-2 text-[12px] ${textSecondary} hover:${textPrimary} transition-colors`}>
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: pc }} /> {kontak.telepon}
                    </a>
                  )}
                  {kontak.email && (
                    <a href={`mailto:${kontak.email}`} className={`flex items-center gap-2 text-[12px] ${textSecondary} hover:${textPrimary} transition-colors`}>
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: pc }} /> {kontak.email}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Social */}
            {(sosmed.instagram || sosmed.twitter || sosmed.tiktok) && (
              <div>
                <EditableText value={editedFooterSosmedTitle} onChange={(v) => { setEditedFooterSosmedTitle(v); markChanged(); }} isEditMode={em} as="p" className={`font-semibold text-[13px] mb-3 ${textPrimary}`} />
                <div className="space-y-2">
                  {sosmed.instagram && (
                    <a href={`https://instagram.com/${sosmed.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-[12px] ${textSecondary} hover:${textPrimary} transition-colors`}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: pc }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> {sosmed.instagram}
                    </a>
                  )}
                  {sosmed.tiktok && (
                    <a href={`https://tiktok.com/${sosmed.tiktok.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-[12px] ${textSecondary} hover:${textPrimary} transition-colors`}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: pc }}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg> {sosmed.tiktok}
                    </a>
                  )}
                  {sosmed.twitter && (
                    <a href={`https://x.com/${sosmed.twitter.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-[12px] ${textSecondary} hover:${textPrimary} transition-colors`}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ color: pc }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> {sosmed.twitter}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className={`border-t ${borderColor} mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2`}>
            <EditableText value={editedCopyright} onChange={(v) => { setEditedCopyright(v); markChanged(); }} isEditMode={em} as="p" className={`${textTertiary} text-[11px]`} />
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`text-[11px] font-medium flex items-center gap-1`} style={{ color: pc }}>
              <MessageCircle className="w-3 h-3" /> Hubungi Kami
            </a>
          </div>
        </div>
      </footer>

      {/* ── Floating Save Button ── */}
      {isEditable && hasChanges && !em && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-5 py-3 rounded-xl shadow-2xl shadow-blue-600/30 transition-all duration-300 animate-[slideUp_0.3s_ease-out] cursor-pointer disabled:opacity-60"
          style={{ animationFillMode: "both" }}
        >
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-xl text-[13px] font-medium shadow-xl transition-all duration-300 animate-[slideUp_0.3s_ease-out] ${
          toast.includes("berhasil") ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast}
        </div>
      )}
    </div>
  );
}
