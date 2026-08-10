"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isEarlyAdopter, setIsEarlyAdopter] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const handleCTA = () => {
    if (user) {
      router.push("/buat");
    } else {
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll(".reveal");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="harga"
      ref={sectionRef}
      className="py-16 sm:py-20 bg-gradient-to-b from-[#f5f7fa] to-[#eef2f7] relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#67BAF4]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="reveal reveal-delay-1 text-2xl sm:text-3xl md:text-4xl font-bold text-[#1e3a5f] tracking-tight leading-tight">
            Pilih Paket yang Sesuai
          </h2>
          <p className="reveal reveal-delay-2 text-slate-500 text-[14px] sm:text-[15px] mt-3 max-w-lg mx-auto leading-relaxed">
            Transparan dan terjangkau. Pilih sesuai kebutuhan bisnismu untuk mulai hadir secara digital.
          </p>
        </div>

        {/* Toggle */}
        <div className="reveal reveal-delay-2 flex justify-center mb-10 sm:mb-12">
          <div className="bg-white p-1 rounded-2xl flex items-center border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <button
              onClick={() => setIsEarlyAdopter(true)}
              className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 ${isEarlyAdopter
                ? "bg-[#1e3a5f] text-white shadow-md border border-[#1e3a5f]"
                : "text-slate-500 hover:text-slate-900 border border-transparent"
                }`}
            >
              Early Adopter
            </button>
            <button
              onClick={() => setIsEarlyAdopter(false)}
              className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 ${!isEarlyAdopter
                ? "bg-[#1e3a5f] text-white shadow-md border border-[#1e3a5f]"
                : "text-slate-500 hover:text-slate-900 border border-transparent"
                }`}
            >
              Normal
            </button>
          </div>
        </div>

        {/* Cards Container */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 items-start mt-6"
          style={{ gridTemplateRows: 'repeat(7, auto)' }}
        >

          {/* Card 1: Gratis */}
          <div
            className="reveal reveal-delay-3 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 gap-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all duration-300 relative w-full"
            style={{ display: 'grid', gridTemplateRows: 'subgrid', gridRow: 'span 7' }}
          >

            {/* Row 1: Judul */}
            <h4 className="text-[13px] font-bold text-slate-800 mb-4">Gratis</h4>

            {/* Row 2: Harga */}
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-[#1e3a5f] tracking-tight">Rp0</span>
            </div>

            {/* Row 3: Deskripsi */}
            <p className="text-slate-500 text-[13px] leading-relaxed mb-6">
              Coba platform kami tanpa risiko apapun
            </p>

            {/* Row 4: Subdomain Filler */}
            <div className="hidden lg:block"></div>

            {/* Row 5: CTA */}
            <div className="mb-6">
              <button onClick={handleCTA} className="block w-full py-3 px-4 rounded-xl border border-slate-200 bg-transparent text-[#1e3a5f] font-semibold text-center text-[13px] hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 cursor-pointer">
                Mulai Gratis &rarr;
              </button>
            </div>

            {/* Row 6: Separator */}
            <div className="border-t border-slate-100 pt-5"></div>

            {/* Row 7: Features */}
            <ul className="space-y-3 h-full">
              {[
                "Preview website 14 hari",
                "3x generate per hari",
                "Semua kategori usaha tersedia",
                "Tidak perlu kartu kredit"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#67BAF4] flex-shrink-0" />
                  <span className="text-slate-700 text-[13px]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Subdomain (Highlighted) */}
          <div
            className="reveal reveal-delay-4 relative bg-gradient-to-b from-[#1e3a5f] to-[#0f2d5e] border border-white/10 rounded-3xl p-6 sm:p-8 gap-0 shadow-[0_20px_40px_rgba(15,45,94,0.2)] transition-all duration-300 z-10 w-full lg:-my-4"
            style={{ display: 'grid', gridTemplateRows: 'subgrid', gridRow: 'span 7' }}
          >

            {/* Top Badge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="bg-[#67BAF4] text-[#0D0D0D] text-[11px] font-bold px-3 py-1 rounded-full flex items-center shadow-lg shadow-[#67BAF4]/30 whitespace-nowrap tracking-wide ring-4 ring-white/20">
                BEST SELLER
              </div>
            </div>

            {/* Row 1: Judul */}
            <h4 className="text-[13px] font-bold text-white mt-1 mb-4">Subdomain</h4>

            {/* Row 2: Harga */}
            <div className="flex flex-col mb-2 relative">
              <div className="flex items-baseline gap-1 whitespace-nowrap">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {isEarlyAdopter ? "Rp99.000" : "Rp199.000"}
                </span>
              </div>
              <p className="text-zinc-400 text-[12px] mt-1.5 whitespace-nowrap">
                Perpanjangan <span className="text-white font-semibold">50k/bulan</span>
              </p>

              {/* Savings Badge */}
              <div className={`transition-opacity duration-300 absolute -top-3 right-0 sm:-right-2 md:-right-4 lg:-right-6 rotate-6 ${isEarlyAdopter ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="bg-white text-red-600 text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-lg border border-red-100 whitespace-nowrap">
                  Hemat Rp100.000
                </div>
              </div>
            </div>

            {/* Row 3: Deskripsi */}
            <p className="text-zinc-300 text-[13px] leading-relaxed mb-2">
              Usahamu langsung online dengan subdomain profesional
            </p>

            {/* Row 4: Subdomain Preview */}
            <div className="mb-5">
              <p className="text-[#67BAF4] text-[12px] font-mono bg-[#67BAF4]/10 w-max px-2.5 py-1 rounded-md border border-[#67BAF4]/20">
                namausaha.buatkanweb.id
              </p>
            </div>

            {/* Row 5: CTA */}
            <div className="mb-6">
              <button onClick={handleCTA} className="block w-full py-3 px-4 rounded-xl bg-[#67BAF4] text-[#0D0D0D] font-bold text-center text-[13px] hover:bg-white transition-all duration-300 shadow-lg shadow-[#67BAF4]/20 hover:shadow-xl hover:shadow-[#67BAF4]/30 hover:scale-[1.02] cursor-pointer">
                Buat Website Sekarang &rarr;
              </button>
            </div>

            {/* Row 6: Separator */}
            <div className="border-t border-white/10 pt-5"></div>

            {/* Row 7: Features */}
            <ul className="space-y-3 h-full">
              {[
                "Semua fitur Gratis",
                "Website Langsung Live",
                "Subdomain buatkanweb.id",
                "Sistem testimoni otomatis",
                "Integrated WhatsApp",
                "SEO Optimized"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#67BAF4] flex-shrink-0" />
                  <span className="text-white/90 text-[13px] font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Custom */}
          <div
            className="reveal reveal-delay-5 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 gap-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all duration-300 relative w-full"
            style={{ display: 'grid', gridTemplateRows: 'subgrid', gridRow: 'span 7' }}
          >

            {/* Row 1: Judul */}
            <h4 className="text-[13px] font-bold text-slate-800 mb-4">Custom</h4>

            {/* Row 2: Harga */}
            <div className="flex flex-col mb-2">
              <span className="text-slate-500 text-[12px] font-medium mb-0.5">Mulai dari</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#1e3a5f] tracking-tight">Rp249k</span>
              </div>
            </div>

            {/* Row 3: Deskripsi */}
            <p className="text-slate-500 text-[13px] leading-relaxed mb-6">
              Website unik sesuai identitas usahamu, dikerjakan tim kami
            </p>

            {/* Row 4: Subdomain Filler */}
            <div className="hidden lg:block"></div>

            {/* Row 5: CTA */}
            <div className="mb-6">
              <a href="https://wa.me/6282136111625?text=Halo,%20saya%20tertarik%20dengan%20layanan%20Custom%20Website" target="_blank" rel="noopener noreferrer" className="block w-full py-3 px-4 rounded-xl border border-slate-200 bg-transparent text-[#1e3a5f] font-semibold text-center text-[13px] hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                Hubungi Kami &rarr;
              </a>
            </div>

            {/* Row 6: Separator */}
            <div className="border-t border-slate-100 pt-5"></div>

            {/* Row 7: Features */}
            <ul className="space-y-3 h-full">
              {[
                "Desain custom sesuai keinginan",
                "Custom Development",
                "SEO Optimized",
                "Revisi 3x",
                "Support & maintenance"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#67BAF4] flex-shrink-0" />
                  <span className="text-slate-700 text-[13px]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}

