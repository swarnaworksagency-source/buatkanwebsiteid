"use client";

import { useState } from "react";
import type { TemplateData } from "@/types";
import { EditableText } from "@/components/ui/EditableText";
import { useTemplateEditor } from "./useTemplateEditor";
import { SaveBar, Toast, EditBanner, Lightbox, Stars } from "./TemplateShared";
import { Phone, MapPin, Clock, ShieldCheck, Check, MessageCircle, Menu, X } from "lucide-react";

const DEFAULT_CARA_KERJA = [
  { step: "1", title: "Hubungi Kami", desc: "Cukup chat lewat WhatsApp, ceritakan kebutuhan Anda." },
  { step: "2", title: "Kami Datang", desc: "Tim kami siap datang atau Anda bisa langsung mampir." },
  { step: "3", title: "Beres", desc: "Pekerjaan selesai, Anda tinggal terima hasilnya." },
];

interface Props extends Partial<TemplateData> {
  forceMobile?: boolean;
  isEditable?: boolean;
  isEditMode?: boolean;
  onContentUpdate?: (content: Partial<TemplateData>) => void;
  websiteId?: string;
}

export default function TemplateTiga(props: Props) {
  const {
    hero = { headline: "Solusi Tepat untuk Kebutuhan Anda", subheadline: "Pelayanan ramah, hasil memuaskan, dan harga yang masuk akal. Kami siap bantu kapan pun Anda butuh.", ctaText: "Chat Sekarang" },
    about = { judul: "Kenapa Banyak yang Memilih Kami", deskripsi: "Kami mengutamakan kepuasan setiap pelanggan. Bukan sekadar selesai, tapi selesai dengan rapi dan sesuai harapan Anda.", keunggulan: ["Pengerjaan cepat dan rapi", "Harga jelas tanpa biaya tersembunyi", "Pelayanan ramah", "Bergaransi"] },
    layanan = [],
    targetPelanggan = { deskripsi: "", painPoint: "", solusi: "" },
    testimonialPlaceholder = [],
    footer = { tagline: "Butuh bantuan? Kami siap melayani.", ctaText: "Chat Sekarang" },
    namaBisnis = "Nama Usaha",
    lokasi = "",
    kontak = { wa: "", telepon: "", email: "" },
    sosmed = { instagram: "", tiktok: "", twitter: "" },
    warna = { primary: "#c2603b", tema: "light" },
    paketHarga = [],
    logo = "",
    fotoBisnis = [],
    portofolio = [],
    caraKerja = DEFAULT_CARA_KERJA,
    caraKerjaTitle = "Mudah dan Cepat",
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

  const isMob = forceMobile === true;
  const isDesk = forceMobile === false;

  const isDark = warna.tema === "dark";
  const canvas = isDark ? "bg-[#211b16]" : "bg-[#fbf7f2]";
  const surface = isDark ? "bg-[#2c241d]" : "bg-white";
  const ink = isDark ? "text-[#f7efe6]" : "text-[#2b2420]";
  const muted = isDark ? "text-[#b3a392]" : "text-[#6b5f54]";
  const line = isDark ? "border-[#3d3228]" : "border-[#ece1d4]";
  const chipBg = isDark ? "bg-[#352b22]" : "bg-[#f2e9de]";
  const pc = warna.primary || "#c2603b";
  const pcSoft = `${pc}14`;

  const waLink = `https://wa.me/${kontak.wa}?text=Halo,%20saya%20mau%20tanya%20soal%20layanan%20Anda.`;
  const photos = fotoBisnis || [];
  const gallery = portofolio || [];
  const plans = paketHarga && paketHarga.length > 0 ? paketHarga : [];

  const navItems = [
    { label: "Tentang", href: "#tentang" },
    s.layanan.length > 0 && { label: "Layanan", href: "#layanan" },
    gallery.length > 0 && { label: "Galeri", href: "#galeri" },
    plans.length > 0 && { label: "Harga", href: "#harga" },
    s.testimonials.length > 0 && { label: "Testimoni", href: "#testimoni" },
  ].filter(Boolean) as { label: string; href: string }[];

  const px = isMob ? "px-5" : isDesk ? "px-8" : "px-5 md:px-8";

  return (
    <div
      className={`min-h-full ${canvas} ${ink} font-sans relative`}
      style={em ? { border: "2px solid #f59e0b", borderRadius: "8px" } : undefined}
      onClickCapture={(e) => {
        if (em) {
          const t = e.target as HTMLElement;
          if (!t.closest('[data-editable="true"]')) { e.preventDefault(); e.stopPropagation(); }
        }
      }}
    >
      <EditBanner show={em} />

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 ${canvas}/95 backdrop-blur border-b ${line}`}>
        <div className={`max-w-6xl mx-auto ${px} py-3.5 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            {logo ? (
              <img src={logo} alt={namaBisnis} className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: pc }}>
                <span className="text-white font-bold text-[15px]">{namaBisnis.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <EditableText value={s.namaBisnis} onChange={(v) => patch({ namaBisnis: v })} isEditMode={em} as="span" className={`font-bold tracking-tight ${ink} ${isMob ? "text-[16px]" : "text-[18px]"} truncate max-w-[150px] md:max-w-xs`} />
          </div>

          {!isMob && (
            <div className={`${isDesk ? "flex" : "hidden md:flex"} items-center gap-7 text-[14px] ${muted}`}>
              {navItems.map((n) => (
                <a key={n.label} href={n.href} className="hover:opacity-70 transition-opacity">{n.label}</a>
              ))}
            </div>
          )}

          {!isMob && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`${isDesk ? "inline-flex" : "hidden md:inline-flex"} items-center gap-2 text-white text-[14px] font-semibold px-5 py-2.5 rounded-full`} style={{ backgroundColor: pc }}>
              <MessageCircle className="w-4 h-4" /> Chat
            </a>
          )}

          {(isMob || forceMobile === undefined) && (
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className={`${isDesk ? "hidden" : isMob ? "block" : "md:hidden"} p-1.5`}>
              {menuOpen ? <X className={`w-5 h-5 ${muted}`} /> : <Menu className={`w-5 h-5 ${muted}`} />}
            </button>
          )}
        </div>
        {menuOpen && (isMob || forceMobile === undefined) && (
          <div className={`${isDesk ? "hidden" : isMob ? "block" : "md:hidden"} border-t ${line} ${surface} px-5 py-4 space-y-1`}>
            {navItems.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)} className={`block py-2 text-[14px] ${muted}`}>{n.label}</a>
            ))}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mt-3 text-white text-[14px] font-semibold px-4 py-3 rounded-full" style={{ backgroundColor: pc }}>
              <MessageCircle className="w-4 h-4" /> Chat Sekarang
            </a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className={`${isMob ? "py-10" : "py-14 md:py-20"}`}>
        <div className={`max-w-6xl mx-auto ${px}`}>
          <div className={`grid ${isMob ? "grid-cols-1 gap-8" : isDesk ? "grid-cols-2 gap-12 items-center" : "grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 md:items-center"}`}>
            <div>
              {lokasi && (
                <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-full mb-5 ${chipBg} ${muted}`}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: pc }} /> Melayani {lokasi}
                </span>
              )}
              <EditableText value={s.heroHeadline} onChange={(v) => patch({ heroHeadline: v })} isEditMode={em} as="h1" className={`font-extrabold tracking-tight leading-[1.1] ${ink} ${isMob ? "text-[34px]" : isDesk ? "text-[52px]" : "text-[34px] md:text-[52px]"}`} />
              <EditableText value={s.heroSub} onChange={(v) => patch({ heroSub: v })} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed mt-5 max-w-md ${isMob ? "text-[15px]" : "text-[17px]"}`} />
              <div className={`mt-7 flex ${isMob ? "flex-col" : "flex-row"} gap-3`}>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 text-white px-7 py-3.5 rounded-full text-[15px] font-semibold ${isMob ? "w-full" : ""}`} style={{ backgroundColor: pc }}>
                  <MessageCircle className="w-5 h-5" /> <EditableText value={s.heroCta || "Chat Sekarang"} onChange={(v) => patch({ heroCta: v })} isEditMode={em} />
                </a>
                {kontak.telepon && (
                  <a href={`tel:${kontak.telepon}`} className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold border ${line} ${ink} ${isMob ? "w-full" : ""}`}>
                    <Phone className="w-4 h-4" /> Telepon
                  </a>
                )}
              </div>
              <div className={`mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[13px] ${muted}`}>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" style={{ color: pc }} /> Bergaransi</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" style={{ color: pc }} /> Respon Cepat</span>
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: pc }} /> Harga Jujur</span>
              </div>
            </div>

            <div>
              {photos.length > 0 ? (
                <img src={photos[0]} alt={namaBisnis} className={`w-full object-cover rounded-3xl ${isMob ? "aspect-[4/3]" : "aspect-[4/3]"}`} loading="lazy" />
              ) : (
                <div className={`rounded-3xl ${isMob ? "aspect-[4/3]" : "aspect-[4/3]"} flex flex-col items-center justify-center text-center p-8`} style={{ backgroundColor: pcSoft }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: pc }}>
                    <span className="text-white font-extrabold text-[26px]">{namaBisnis.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className={`font-bold text-[20px] ${ink}`}>{s.namaBisnis}</span>
                  {lokasi && <span className={`text-[14px] mt-1 ${muted}`}>{lokasi}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tentang / kenapa pilih kami */}
      <section id="tentang" className={`${surface} border-y ${line}`}>
        <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-14" : "py-20"}`}>
          <div className={`grid ${isMob ? "grid-cols-1 gap-8" : "grid-cols-2 gap-14 items-center"}`}>
            <div>
              <EditableText value={s.aboutJudul} onChange={(v) => patch({ aboutJudul: v })} isEditMode={em} as="h2" className={`font-extrabold tracking-tight leading-[1.15] ${ink} ${isMob ? "text-[26px]" : "text-[36px]"}`} />
              <EditableText value={s.aboutDeskripsi} onChange={(v) => patch({ aboutDeskripsi: v })} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed mt-5 ${isMob ? "text-[15px]" : "text-[16px]"}`} />
            </div>
            <div className="space-y-3">
              {s.aboutKeunggulan.map((k, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl ${canvas} border ${line}`}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: pc }}>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </span>
                  <EditableText value={k} onChange={(v) => { const a = [...s.aboutKeunggulan]; a[i] = v; patch({ aboutKeunggulan: a }); }} isEditMode={em} as="span" className={`text-[15px] font-medium ${ink}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Layanan cards */}
      {s.layanan.length > 0 && (
        <section id="layanan" className={`${isMob ? "py-14" : "py-20"}`}>
          <div className={`max-w-6xl mx-auto ${px}`}>
            <div className="text-center mb-12 max-w-xl mx-auto">
              <h2 className={`font-extrabold tracking-tight ${ink} ${isMob ? "text-[26px]" : "text-[36px]"}`}>Layanan Kami</h2>
              <p className={`${muted} mt-3 text-[15px]`}>Pilih layanan yang Anda butuhkan, langsung chat untuk pemesanan.</p>
            </div>
            <div className={`grid gap-5 ${isMob ? "grid-cols-1" : s.layanan.length === 1 ? "grid-cols-1 max-w-md mx-auto" : s.layanan.length === 2 ? "grid-cols-2 max-w-3xl mx-auto" : "grid-cols-1 md:grid-cols-3"}`}>
              {s.layanan.map((l, i) => (
                <div key={i} className={`${surface} border ${line} rounded-3xl p-7 flex flex-col`}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 font-bold text-[18px] text-white" style={{ backgroundColor: pc }}>
                    {String(i + 1)}
                  </div>
                  <EditableText value={l.nama} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], nama: v }; patch({ layanan: a }); }} isEditMode={em} as="h3" className={`font-bold ${ink} ${isMob ? "text-[19px]" : "text-[21px]"} mb-2.5`} />
                  <EditableText value={l.deskripsi} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], deskripsi: v }; patch({ layanan: a }); }} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed text-[14.5px] flex-1`} />
                  <div className={`mt-6 pt-5 border-t ${line} flex items-center justify-between`}>
                    <EditableText value={l.harga} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], harga: v }; patch({ layanan: a }); }} isEditMode={em} className={`font-bold text-[15px]`} style={{ color: pc }} />
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-full text-white" style={{ backgroundColor: pc }}>
                      <MessageCircle className="w-3.5 h-3.5" /> Pesan
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Untuk siapa */}
      {(targetPelanggan?.deskripsi || targetPelanggan?.solusi) && (
        <section className={`${surface} border-y ${line}`}>
          <div className={`max-w-4xl mx-auto ${px} ${isMob ? "py-14" : "py-18"} text-center`}>
            <span className={`inline-block text-[13px] font-semibold px-4 py-1.5 rounded-full mb-5`} style={{ backgroundColor: pcSoft, color: pc }}>Cocok untuk Anda</span>
            <p className={`font-bold leading-snug ${ink} ${isMob ? "text-[22px]" : "text-[30px]"}`}>
              {targetPelanggan.solusi || targetPelanggan.deskripsi}
            </p>
            {targetPelanggan.painPoint && <p className={`${muted} mt-4 text-[15px]`}>{targetPelanggan.painPoint}</p>}
          </div>
        </section>
      )}

      {/* Cara kerja */}
      <section className={`${isMob ? "py-14" : "py-20"}`}>
        <div className={`max-w-6xl mx-auto ${px}`}>
          <div className="text-center mb-12">
            <EditableText value={s.caraKerjaTitle} onChange={(v) => patch({ caraKerjaTitle: v })} isEditMode={em} as="h2" className={`font-extrabold tracking-tight ${ink} ${isMob ? "text-[26px]" : "text-[36px]"}`} />
          </div>
          <div className={`grid ${isMob ? "grid-cols-1 gap-8" : "grid-cols-3 gap-6"}`}>
            {s.caraKerja.slice(0, 3).map((ck, i) => (
              <div key={i} className={`text-center ${isMob ? "" : "px-4"}`}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 font-extrabold text-[22px]" style={{ backgroundColor: pcSoft, color: pc }}>
                  {ck.step}
                </div>
                <EditableText value={ck.title} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], title: v }; patch({ caraKerja: a }); }} isEditMode={em} as="h4" className={`font-bold ${ink} text-[19px] mb-2`} />
                <EditableText value={ck.desc} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], desc: v }; patch({ caraKerja: a }); }} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed text-[14.5px]`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeri */}
      {gallery.length > 0 && (
        <section id="galeri" className={`${surface} border-y ${line} ${isMob ? "py-14" : "py-20"}`}>
          <div className={`max-w-6xl mx-auto ${px}`}>
            <div className="text-center mb-10">
              <h2 className={`font-extrabold tracking-tight ${ink} ${isMob ? "text-[26px]" : "text-[36px]"}`}>Hasil Kerja Kami</h2>
            </div>
            <div className={`grid ${isMob ? "grid-cols-2 gap-3" : "grid-cols-3 gap-4"}`}>
              {gallery.map((src, i) => (
                <button key={i} type="button" onClick={() => setLightbox(i)} className="overflow-hidden rounded-2xl aspect-square cursor-pointer group">
                  <img src={src} alt={`Hasil ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Harga */}
      {plans.length > 0 && (
        <section id="harga" className={`${isMob ? "py-14" : "py-20"}`}>
          <div className={`max-w-6xl mx-auto ${px}`}>
            <div className="text-center mb-12">
              <h2 className={`font-extrabold tracking-tight ${ink} ${isMob ? "text-[26px]" : "text-[36px]"}`}>Pilihan Paket</h2>
            </div>
            <div className={`grid gap-6 ${isMob ? "grid-cols-1" : plans.length === 1 ? "grid-cols-1 max-w-md mx-auto" : plans.length === 2 ? "grid-cols-2 max-w-3xl mx-auto" : "grid-cols-3"}`}>
              {plans.map((plan, idx) => (
                <div key={idx} className={`rounded-3xl p-7 flex flex-col border-2 ${plan.isPopuler ? "" : line} ${surface}`} style={plan.isPopuler ? { borderColor: pc } : undefined}>
                  {plan.isPopuler && <span className="inline-block self-start text-[12px] font-bold px-3 py-1 rounded-full text-white mb-4" style={{ backgroundColor: pc }}>Paling Populer</span>}
                  <EditableText value={s.paketNama[idx] ?? plan.namaPaket} onChange={(v) => { const a = [...s.paketNama]; a[idx] = v; patch({ paketNama: a }); }} isEditMode={em} as="h3" className={`font-bold ${ink} text-[20px] mb-3`} />
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-[14px] font-semibold ${muted}`}>Rp</span>
                    <EditableText value={s.paketHargaList[idx] ?? plan.harga} onChange={(v) => { const a = [...s.paketHargaList]; a[idx] = v; patch({ paketHargaList: a }); }} isEditMode={em} className={`font-extrabold ${ink} text-[30px]`} />
                  </div>
                  <ul className="space-y-3 mb-7 flex-1">
                    {plan.fitur.map((f, fi) => (
                      <li key={fi} className={`flex items-start gap-2.5 text-[14.5px] ${ink}`}>
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: pc }} />
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
        <section id="testimoni" className={`${surface} border-y ${line} ${isMob ? "py-14" : "py-20"}`}>
          <div className={`max-w-6xl mx-auto ${px}`}>
            <div className="text-center mb-12">
              <h2 className={`font-extrabold tracking-tight ${ink} ${isMob ? "text-[26px]" : "text-[36px]"}`}>Kata Pelanggan Kami</h2>
            </div>
            <div className={`grid gap-5 ${isMob ? "grid-cols-1" : "grid-cols-3"}`}>
              {s.testimonials.map((t, i) => (
                <div key={i} className={`${canvas} border ${line} rounded-3xl p-7 flex flex-col`}>
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
      <section className={`${isMob ? "py-16" : "py-20"}`} style={{ backgroundColor: pc }}>
        <div className={`max-w-3xl mx-auto ${px} text-center`}>
          <EditableText value={s.footerTagline || "Siap Membantu Anda Hari Ini"} onChange={(v) => patch({ footerTagline: v })} isEditMode={em} as="h2" className={`font-extrabold text-white leading-tight ${isMob ? "text-[28px]" : "text-[40px]"}`} />
          <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 bg-white mt-8 px-8 py-4 rounded-full text-[15px] font-bold`} style={{ color: pc }}>
            <MessageCircle className="w-5 h-5" /> <EditableText value={s.footerCta || "Chat Sekarang"} onChange={(v) => patch({ footerCta: v })} isEditMode={em} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${canvas} border-t ${line}`}>
        <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-12" : "py-14"}`}>
          <div className={`grid ${isMob ? "grid-cols-1 gap-8" : "grid-cols-3 gap-10"}`}>
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                {logo ? <img src={logo} alt={namaBisnis} className="w-8 h-8 rounded-lg object-cover" /> : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: pc }}>
                    <span className="text-white font-bold text-[13px]">{namaBisnis.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className={`font-bold ${ink}`}>{s.namaBisnis}</span>
              </div>
              <EditableText value={s.footerDesc} onChange={(v) => patch({ footerDesc: v })} isEditMode={em} as="p" multiline className={`${muted} text-[13.5px] leading-relaxed max-w-xs`} />
            </div>
            {(kontak.wa || kontak.telepon || kontak.email) && (
              <div>
                <EditableText value={s.footerKontakTitle} onChange={(v) => patch({ footerKontakTitle: v })} isEditMode={em} as="p" className={`font-bold text-[14px] mb-4 ${ink}`} />
                <div className={`space-y-3 text-[13.5px] ${muted}`}>
                  {kontak.wa && <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><MessageCircle className="w-4 h-4" /> WhatsApp</a>}
                  {kontak.telepon && <a href={`tel:${kontak.telepon}`} className="flex items-center gap-2 hover:underline"><Phone className="w-4 h-4" /> {kontak.telepon}</a>}
                  {lokasi && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {lokasi}</span>}
                </div>
              </div>
            )}
            {(sosmed.instagram || sosmed.tiktok || sosmed.twitter) && (
              <div>
                <EditableText value={s.footerSosmedTitle} onChange={(v) => patch({ footerSosmedTitle: v })} isEditMode={em} as="p" className={`font-bold text-[14px] mb-4 ${ink}`} />
                <div className={`space-y-3 text-[13.5px] ${muted}`}>
                  {sosmed.instagram && <a href={`https://instagram.com/${sosmed.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="block hover:underline">Instagram</a>}
                  {sosmed.tiktok && <a href={`https://tiktok.com/${sosmed.tiktok.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="block hover:underline">TikTok</a>}
                  {sosmed.twitter && <a href={`https://x.com/${sosmed.twitter.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="block hover:underline">Twitter / X</a>}
                </div>
              </div>
            )}
          </div>
          <div className={`border-t ${line} mt-10 pt-6`}>
            <EditableText value={s.copyright} onChange={(v) => patch({ copyright: v })} isEditMode={em} as="p" className={`text-[12.5px] ${muted}`} />
          </div>
        </div>
      </footer>

      <Lightbox photos={gallery} index={lightbox} setIndex={setLightbox} />
      {isEditable && !em && <SaveBar show={hasChanges} saving={saving} onSave={handleSave} />}
      <Toast message={toast} />
    </div>
  );
}
