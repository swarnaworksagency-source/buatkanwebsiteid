"use client";

import { useState } from "react";
import type { TemplateData, KeahlianItem } from "@/types";
import { EditableText } from "@/components/ui/EditableText";
import { useTemplateEditor } from "./useTemplateEditor";
import { SaveBar, Toast, EditBanner, Lightbox, Stars } from "./TemplateShared";
import { ArrowUpRight, ArrowRight, Menu, X } from "lucide-react";

const DEFAULT_CARA_KERJA = [
  { step: "01", title: "Diskusi", desc: "Kami pelajari kebutuhan Anda secara menyeluruh sebelum mulai." },
  { step: "02", title: "Eksekusi", desc: "Pengerjaan dilakukan terukur dengan standar yang kami jaga." },
  { step: "03", title: "Hasil", desc: "Anda menerima hasil akhir yang siap pakai dan bisa diandalkan." },
];

interface Props extends Partial<TemplateData> {
  forceMobile?: boolean;
  isEditable?: boolean;
  isEditMode?: boolean;
  onContentUpdate?: (content: Partial<TemplateData>) => void;
  websiteId?: string;
}

export default function TemplateEmpat(props: Props) {
  const {
    hero = { headline: "Kami Kerjakan dengan Serius", subheadline: "Standar kerja yang tinggi untuk hasil yang bisa Anda banggakan. Tidak ada pekerjaan yang dikerjakan setengah-setengah.", ctaText: "Mulai Diskusi" },
    about = { judul: "Tentang Kami", deskripsi: "Kami membangun reputasi dari hasil, bukan janji. Setiap proyek kami perlakukan dengan ketelitian yang sama, besar maupun kecil.", keunggulan: ["Hasil Terukur", "Tim Berpengalaman", "Komunikasi Jelas", "Tepat Waktu"] },
    layanan = [],
    keahlian = [],
    targetPelanggan = { deskripsi: "", painPoint: "", solusi: "" },
    testimonialPlaceholder = [],
    footer = { tagline: "Mari mulai kerja sama.", ctaText: "Hubungi Kami" },
    namaBisnis = "Nama Usaha",
    lokasi = "",
    kontak = { wa: "", telepon: "", email: "" },
    sosmed = { instagram: "", tiktok: "", twitter: "" },
    warna = { primary: "#1f4e79", tema: "light" },
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
  const canvas = isDark ? "bg-[#0c0c0c]" : "bg-white";
  const ink = isDark ? "text-white" : "text-[#0e0e0e]";
  const muted = isDark ? "text-[#9a9a9a]" : "text-[#555555]";
  const line = isDark ? "border-[#262626]" : "border-[#e4e2dc]";
  const lineStrong = isDark ? "border-[#3a3a3a]" : "border-[#0e0e0e]";
  // Inverted block (always dark, white text) used for contrast sections.
  const invBg = "bg-[#0e0e0e]";
  const pc = warna.primary || "#1f4e79";

  const waLink = `https://wa.me/${kontak.wa}?text=Halo,%20saya%20ingin%20berdiskusi%20soal%20layanan%20Anda.`;
  const photos = fotoBisnis || [];
  const gallery = portofolio || [];
  const plans = paketHarga && paketHarga.length > 0 ? paketHarga : [];
  const skills = (keahlian || []) as KeahlianItem[];

  const navItems = [
    { label: "Tentang", href: "#tentang" },
    s.layanan.length > 0 && { label: "Layanan", href: "#layanan" },
    gallery.length > 0 && { label: "Galeri", href: "#galeri" },
    plans.length > 0 && { label: "Harga", href: "#harga" },
    s.testimonials.length > 0 && { label: "Testimoni", href: "#testimoni" },
  ].filter(Boolean) as { label: string; href: string }[];

  const px = isMob ? "px-5" : isDesk ? "px-10" : "px-5 md:px-10";
  const Label = ({ n, children, dark }: { n: string; children: string; dark?: boolean }) => (
    <p className={`font-mono text-[11px] tracking-[0.2em] uppercase mb-6 ${dark ? "text-white/50" : muted}`}>
      <span style={{ color: pc }}>({n})</span> {children}
    </p>
  );

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
      <nav className={`sticky top-0 z-50 ${canvas} border-b ${lineStrong}`}>
        <div className={`max-w-6xl mx-auto ${px} py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt={namaBisnis} className="w-8 h-8 object-cover" />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: pc }}>
                <span className="text-white font-bold text-[14px]">{namaBisnis.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <EditableText value={s.namaBisnis} onChange={(v) => patch({ namaBisnis: v })} isEditMode={em} as="span" className={`font-bold uppercase tracking-tight ${ink} ${isMob ? "text-[15px]" : "text-[17px]"} truncate max-w-[160px] md:max-w-xs`} />
          </div>

          {!isMob && (
            <div className={`${isDesk ? "flex" : "hidden md:flex"} items-center gap-8 font-mono text-[12px] uppercase tracking-wider ${muted}`}>
              {navItems.map((n) => (
                <a key={n.label} href={n.href} className="hover:opacity-60 transition-opacity">{n.label}</a>
              ))}
            </div>
          )}

          {!isMob && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={`${isDesk ? "inline-flex" : "hidden md:inline-flex"} items-center gap-2 text-white text-[13px] font-semibold px-5 py-2.5`} style={{ backgroundColor: pc }}>
              Hubungi <ArrowUpRight className="w-4 h-4" />
            </a>
          )}

          {(isMob || forceMobile === undefined) && (
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className={`${isDesk ? "hidden" : isMob ? "block" : "md:hidden"} p-1.5`}>
              {menuOpen ? <X className={`w-5 h-5 ${muted}`} /> : <Menu className={`w-5 h-5 ${muted}`} />}
            </button>
          )}
        </div>
        {menuOpen && (isMob || forceMobile === undefined) && (
          <div className={`${isDesk ? "hidden" : isMob ? "block" : "md:hidden"} border-t ${line} px-5 py-4 space-y-1`}>
            {navItems.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)} className={`block py-2 font-mono text-[13px] uppercase tracking-wider ${muted}`}>{n.label}</a>
            ))}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between mt-3 text-white text-[14px] font-semibold px-4 py-3" style={{ backgroundColor: pc }}>
              Hubungi <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className={`border-b ${lineStrong}`}>
        <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-14" : "py-20 md:py-28"}`}>
          <Label n="01">{lokasi ? `Layanan ${lokasi}` : "Layanan Profesional"}</Label>
          <EditableText value={s.heroHeadline} onChange={(v) => patch({ heroHeadline: v })} isEditMode={em} as="h1" className={`font-extrabold tracking-tighter leading-[0.95] ${ink} ${isMob ? "text-[44px]" : isDesk ? "text-[88px]" : "text-[44px] md:text-[88px]"}`} />
          <div className={`grid ${isMob ? "grid-cols-1 gap-6" : "grid-cols-12 gap-8"} mt-10`}>
            <div className={isMob ? "" : "col-span-7"}>
              <div className="w-20 border-t-4 mb-7" style={{ borderColor: pc }} />
              <EditableText value={s.heroSub} onChange={(v) => patch({ heroSub: v })} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed max-w-xl ${isMob ? "text-[16px]" : "text-[19px]"}`} />
            </div>
            <div className={`${isMob ? "" : "col-span-5"} flex ${isMob ? "" : "justify-end items-end"}`}>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 text-white px-8 py-4 text-[15px] font-semibold ${isMob ? "w-full" : ""}`} style={{ backgroundColor: pc }}>
                <EditableText value={s.heroCta || "Mulai Diskusi"} onChange={(v) => patch({ heroCta: v })} isEditMode={em} /> <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Hero photo full-bleed (if any) */}
      {photos.length > 0 && (
        <div className={`border-b ${lineStrong}`}>
          <img src={photos[0]} alt={namaBisnis} className={`w-full object-cover ${isMob ? "h-[240px]" : "h-[440px]"}`} loading="lazy" />
        </div>
      )}

      {/* Tentang — inverted block */}
      <section id="tentang" className={`${invBg} text-white`}>
        <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-16" : "py-24"}`}>
          <Label n="02" dark>Tentang Kami</Label>
          <div className={`grid ${isMob ? "grid-cols-1 gap-8" : "grid-cols-12 gap-10"}`}>
            <div className={isMob ? "" : "col-span-6"}>
              <EditableText value={s.aboutJudul} onChange={(v) => patch({ aboutJudul: v })} isEditMode={em} as="h2" className={`font-extrabold tracking-tight leading-[1.05] text-white ${isMob ? "text-[32px]" : "text-[48px]"}`} />
            </div>
            <div className={isMob ? "" : "col-span-6"}>
              <EditableText value={s.aboutDeskripsi} onChange={(v) => patch({ aboutDeskripsi: v })} isEditMode={em} as="p" multiline className={`text-white/60 leading-relaxed ${isMob ? "text-[15px]" : "text-[17px]"}`} />
              <div className={`grid grid-cols-2 gap-px mt-9 ${isDark ? "bg-[#262626]" : "bg-[#262626]"}`}>
                {s.aboutKeunggulan.map((k, i) => (
                  <div key={i} className={`${invBg} py-5`}>
                    <span className="font-mono text-[12px]" style={{ color: pc }}>{String(i + 1).padStart(2, "0")}</span>
                    <EditableText value={k} onChange={(v) => { const a = [...s.aboutKeunggulan]; a[i] = v; patch({ aboutKeunggulan: a }); }} isEditMode={em} as="p" className="text-white text-[15px] font-medium mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan — big numbered rows */}
      {s.layanan.length > 0 && (
        <section id="layanan" className={`border-b ${lineStrong}`}>
          <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-16" : "py-24"}`}>
            <Label n="03">Layanan</Label>
            <div className={`border-t ${lineStrong}`}>
              {s.layanan.map((l, i) => (
                <div key={i} className={`group grid ${isMob ? "grid-cols-1 gap-3" : "grid-cols-12 gap-6 items-center"} py-9 border-b ${line}`}>
                  <div className={isMob ? "" : "col-span-1"}>
                    <span className={`font-mono text-[15px] ${muted}`}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className={isMob ? "" : "col-span-5"}>
                    <EditableText value={l.nama} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], nama: v }; patch({ layanan: a }); }} isEditMode={em} as="h3" className={`font-extrabold tracking-tight ${ink} ${isMob ? "text-[26px]" : "text-[34px]"}`} />
                  </div>
                  <div className={isMob ? "" : "col-span-4"}>
                    <EditableText value={l.deskripsi} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], deskripsi: v }; patch({ layanan: a }); }} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed text-[15px]`} />
                  </div>
                  <div className={`${isMob ? "" : "col-span-2 text-right"}`}>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-mono text-[13px] uppercase tracking-wide" style={{ color: pc }}>
                      <EditableText value={l.harga} onChange={(v) => { const a = [...s.layanan]; a[i] = { ...a[i], harga: v }; patch({ layanan: a }); }} isEditMode={em} />
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Keahlian */}
      {skills.length > 0 && (
        <section className={`border-b ${lineStrong}`}>
          <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-16" : "py-24"}`}>
            <Label n="04">Keahlian Kami</Label>
            <div className={`grid ${isMob ? "grid-cols-1 gap-px" : "grid-cols-3 gap-px"} ${isDark ? "bg-[#262626]" : "bg-[#e4e2dc]"}`}>
              {skills.map((sk, i) => (
                <div key={i} className={`${canvas} p-7`}>
                  <span className="font-mono text-[12px]" style={{ color: pc }}>{String(i + 1).padStart(2, "0")}</span>
                  <h4 className={`font-bold mt-3 mb-2 ${ink} text-[19px]`}>{sk.nama}</h4>
                  <p className={`${muted} leading-relaxed text-[14.5px]`}>{sk.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Untuk Siapa */}
      {(targetPelanggan?.deskripsi || targetPelanggan?.solusi) && (
        <section className={`border-b ${lineStrong}`}>
          <div className={`max-w-5xl mx-auto ${px} ${isMob ? "py-16" : "py-20"}`}>
            <Label n="05">Untuk Siapa</Label>
            <p className={`font-extrabold tracking-tight leading-[1.1] ${ink} ${isMob ? "text-[26px]" : "text-[42px]"}`}>
              {targetPelanggan.solusi || targetPelanggan.deskripsi}
            </p>
            {targetPelanggan.painPoint && <p className={`${muted} mt-5 text-[16px] max-w-2xl`}>{targetPelanggan.painPoint}</p>}
          </div>
        </section>
      )}

      {/* Cara Kerja */}
      <section className={`border-b ${lineStrong}`}>
        <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-16" : "py-24"}`}>
          <EditableText value={s.caraKerjaTitle} onChange={(v) => patch({ caraKerjaTitle: v })} isEditMode={em} as="h2" className={`font-extrabold tracking-tight mb-12 ${ink} ${isMob ? "text-[32px]" : "text-[48px]"}`} />
          <div className={`grid ${isMob ? "grid-cols-1 gap-10" : "grid-cols-3 gap-px"} ${isMob ? "" : isDark ? "bg-[#262626]" : "bg-[#e4e2dc]"}`}>
            {s.caraKerja.slice(0, 3).map((ck, i) => (
              <div key={i} className={`${canvas} ${isMob ? "" : "p-8"}`}>
                <span className="font-mono text-[34px] font-bold" style={{ color: pc }}>{ck.step}</span>
                <EditableText value={ck.title} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], title: v }; patch({ caraKerja: a }); }} isEditMode={em} as="h4" className={`font-bold mt-4 mb-2.5 ${ink} text-[22px]`} />
                <EditableText value={ck.desc} onChange={(v) => { const a = [...s.caraKerja]; a[i] = { ...a[i], desc: v }; patch({ caraKerja: a }); }} isEditMode={em} as="p" multiline className={`${muted} leading-relaxed text-[15px]`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeri */}
      {gallery.length > 0 && (
        <section id="galeri" className={`border-b ${lineStrong}`}>
          <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-16" : "py-24"}`}>
            <Label n="06">Portofolio</Label>
            <div className={`grid ${isMob ? "grid-cols-2 gap-2" : "grid-cols-3 gap-2"}`}>
              {gallery.map((src, i) => (
                <button key={i} type="button" onClick={() => setLightbox(i)} className="overflow-hidden aspect-square cursor-pointer group relative">
                  <img src={src} alt={`Portofolio ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <span className="absolute top-3 left-3 font-mono text-[12px] text-white mix-blend-difference">{String(i + 1).padStart(2, "0")}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Harga */}
      {plans.length > 0 && (
        <section id="harga" className={`border-b ${lineStrong}`}>
          <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-16" : "py-24"}`}>
            <Label n="07">Paket Harga</Label>
            <div className={`grid ${isMob ? "grid-cols-1 gap-px" : plans.length === 2 ? "grid-cols-2 gap-px max-w-3xl" : "grid-cols-3 gap-px"} ${isMob ? "" : isDark ? "bg-[#262626]" : "bg-[#e4e2dc]"}`}>
              {plans.map((plan, idx) => (
                <div key={idx} className={`${plan.isPopuler ? invBg + " text-white" : canvas} p-8 flex flex-col`}>
                  <div className="flex items-center justify-between mb-5">
                    <EditableText value={s.paketNama[idx] ?? plan.namaPaket} onChange={(v) => { const a = [...s.paketNama]; a[idx] = v; patch({ paketNama: a }); }} isEditMode={em} as="h3" className={`font-bold ${plan.isPopuler ? "text-white" : ink} text-[20px]`} />
                    {plan.isPopuler && <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1" style={{ backgroundColor: pc, color: "white" }}>Populer</span>}
                  </div>
                  <div className="flex items-baseline gap-1 mb-7">
                    <span className={`text-[14px] font-mono ${plan.isPopuler ? "text-white/60" : muted}`}>Rp</span>
                    <EditableText value={s.paketHargaList[idx] ?? plan.harga} onChange={(v) => { const a = [...s.paketHargaList]; a[idx] = v; patch({ paketHargaList: a }); }} isEditMode={em} className={`font-extrabold tracking-tight ${plan.isPopuler ? "text-white" : ink} text-[34px]`} />
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.fitur.map((f, fi) => (
                      <li key={fi} className={`flex items-baseline gap-3 text-[14.5px] ${plan.isPopuler ? "text-white/90" : ink}`}>
                        <span className="font-mono text-[11px]" style={{ color: pc }}>{String(fi + 1).padStart(2, "0")}</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full text-center py-3.5 text-[14px] font-semibold inline-flex items-center justify-center gap-2" style={plan.isPopuler ? { backgroundColor: pc, color: "white" } : { backgroundColor: isDark ? "#fff" : "#0e0e0e", color: isDark ? "#0e0e0e" : "#fff" }}>
                    Pilih Paket <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimoni */}
      {s.testimonials.length > 0 && (
        <section id="testimoni" className={`border-b ${lineStrong}`}>
          <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-16" : "py-24"}`}>
            <Label n="08">Testimoni</Label>
            <div className={`grid ${isMob ? "grid-cols-1 gap-px" : "grid-cols-3 gap-px"} ${isMob ? "" : isDark ? "bg-[#262626]" : "bg-[#e4e2dc]"}`}>
              {s.testimonials.map((t, i) => (
                <div key={i} className={`${canvas} p-8 flex flex-col`}>
                  <Stars rating={t.rating ?? 5} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], rating: v }; patch({ testimonials: a }); }} isEditMode={em} color={pc} />
                  <EditableText value={t.teks} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], teks: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" multiline className={`font-medium leading-snug mt-5 mb-7 flex-1 ${ink} ${isMob ? "text-[18px]" : "text-[21px]"}`} />
                  <div className={`pt-5 border-t ${line}`}>
                    <EditableText value={t.nama} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], nama: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" className={`font-bold text-[14px] ${ink}`} />
                    <EditableText value={t.peran} onChange={(v) => { const a = [...s.testimonials]; a[i] = { ...a[i], peran: v }; patch({ testimonials: a }); }} isEditMode={em} as="p" className={`font-mono text-[12px] uppercase tracking-wide mt-1 ${muted}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ backgroundColor: pc }}>
        <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-16" : "py-28"}`}>
          <EditableText value={s.footerTagline || "Mari Mulai Kerja Sama"} onChange={(v) => patch({ footerTagline: v })} isEditMode={em} as="h2" className={`font-extrabold tracking-tighter text-white leading-[0.95] ${isMob ? "text-[40px]" : "text-[80px]"}`} />
          <a href={waLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 bg-white mt-10 px-8 py-4 text-[15px] font-semibold`} style={{ color: pc }}>
            <EditableText value={s.footerCta || "Hubungi Kami"} onChange={(v) => patch({ footerCta: v })} isEditMode={em} /> <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${invBg} text-white`}>
        <div className={`max-w-6xl mx-auto ${px} ${isMob ? "py-12" : "py-16"}`}>
          <div className={`grid ${isMob ? "grid-cols-1 gap-8" : "grid-cols-3 gap-10"}`}>
            <div>
              <span className="font-bold uppercase tracking-tight text-[18px]">{s.namaBisnis}</span>
              <EditableText value={s.footerDesc} onChange={(v) => patch({ footerDesc: v })} isEditMode={em} as="p" multiline className="text-white/50 text-[13.5px] leading-relaxed mt-4 max-w-xs" />
            </div>
            {(kontak.wa || kontak.telepon || kontak.email) && (
              <div>
                <EditableText value={s.footerKontakTitle} onChange={(v) => patch({ footerKontakTitle: v })} isEditMode={em} as="p" className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 mb-5" />
                <div className="space-y-3 text-[13.5px] text-white/70">
                  {kontak.wa && <a href={waLink} target="_blank" rel="noopener noreferrer" className="block hover:text-white">WhatsApp</a>}
                  {kontak.telepon && <a href={`tel:${kontak.telepon}`} className="block hover:text-white">{kontak.telepon}</a>}
                  {kontak.email && <a href={`mailto:${kontak.email}`} className="block hover:text-white">{kontak.email}</a>}
                </div>
              </div>
            )}
            {(sosmed.instagram || sosmed.tiktok || sosmed.twitter) && (
              <div>
                <EditableText value={s.footerSosmedTitle} onChange={(v) => patch({ footerSosmedTitle: v })} isEditMode={em} as="p" className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 mb-5" />
                <div className="space-y-3 text-[13.5px] text-white/70">
                  {sosmed.instagram && <a href={`https://instagram.com/${sosmed.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="block hover:text-white">Instagram</a>}
                  {sosmed.tiktok && <a href={`https://tiktok.com/${sosmed.tiktok.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="block hover:text-white">TikTok</a>}
                  {sosmed.twitter && <a href={`https://x.com/${sosmed.twitter.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="block hover:text-white">Twitter / X</a>}
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-[#262626] mt-12 pt-6">
            <EditableText value={s.copyright} onChange={(v) => patch({ copyright: v })} isEditMode={em} as="p" className="font-mono text-[12px] text-white/40" />
          </div>
        </div>
      </footer>

      <Lightbox photos={gallery} index={lightbox} setIndex={setLightbox} />
      {isEditable && !em && <SaveBar show={hasChanges} saving={saving} onSave={handleSave} />}
      <Toast message={toast} />
    </div>
  );
}
