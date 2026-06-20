"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    step: "01",
    title: "Isi Form 5 Menit",
    desc: "Ceritakan usahamu. Mulai dari nama, layanan, kontak, dan upload foto asli produkmu. Tidak perlu keahlian apapun.",
  },
  {
    step: "02",
    title: "AI Bekerja Otomatis",
    desc: "Teknologi kami menyusun copywriting dan membangun tampilan websitemu secara instan, disesuaikan dengan jenis usahamu.",
  },
  {
    step: "03",
    title: "Preview & Langsung Online",
    desc: "Website profesionalmu siap dalam hitungan detik. Review, lalu deploy usahamu langsung terlihat di internet.",
  },
];

export default function CaraKerjaSection() {
  const sectionRef = useRef<HTMLElement>(null);

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
      id="cara-kerja"
      ref={sectionRef}
      className="min-h-[100dvh] flex flex-col items-center justify-center py-24 sm:py-32 bg-[#0D0D0D] relative overflow-hidden"
    >
      <style>{`
        @keyframes flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-flow {
          animation: flow 2.5s infinite linear;
        }
      `}</style>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 w-full z-10">
        {/* Header */}
        <div className="text-center mb-20 sm:mb-28">
          <p className="reveal text-[13px] font-bold tracking-[0.2em] uppercase text-[#67BAF4] mb-4">
            CARA KERJA
          </p>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Semudah <span className="text-[#67BAF4] drop-shadow-sm">1, 2, 3</span>
          </h2>
          <p className="reveal reveal-delay-2 text-zinc-400 text-[15px] sm:text-[17px] mt-6 max-w-lg mx-auto leading-relaxed">
            Tidak perlu keahlian teknis. Cukup ceritakan usahamu, sisanya kami yang urus.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative flex flex-col md:flex-row items-start justify-between gap-12 md:gap-8 max-w-4xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute left-[15%] right-[15%] h-[2px] bg-white/5 rounded-full z-0 overflow-hidden" style={{ top: 'calc(8px + 60px)' }}>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#67BAF4] to-transparent opacity-70 animate-flow" />
          </div>

          {STEPS.map((item, i) => (
            <div key={item.step} className={`reveal reveal-delay-${i + 1} group relative z-10 flex flex-col items-center text-center w-full md:w-1/3`}>

              {/* Icon Box */}
              <div className="relative mb-8 h-[120px] w-[120px] flex items-center justify-center">
                {/* The Box */}
                <div className="w-[120px] h-[120px] rounded-3xl bg-gradient-to-br from-[#1A2333] to-[#0A0F1A] border border-white/10 flex items-center justify-center text-[#67BAF4] shadow-[0_0_30px_rgba(30,70,107,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_50px_rgba(103,186,244,0.3)] group-hover:border-[#67BAF4]/30">
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-3xl bg-[#67BAF4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 text-[36px] font-extrabold text-[#67BAF4] drop-shadow-[0_0_15px_rgba(103,186,244,0.5)] transition-transform duration-500 group-hover:scale-110 select-none">
                    {item.step}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="min-h-[56px] sm:min-h-[64px] flex items-start justify-center w-full mb-2 sm:mb-3">
                <h3 className="text-[20px] sm:text-[22px] font-bold text-white group-hover:text-[#67BAF4] transition-colors duration-300 leading-tight">
                  {item.title}
                </h3>
              </div>
              <p className="text-zinc-400 text-[14px] sm:text-[15px] leading-relaxed max-w-[260px]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
