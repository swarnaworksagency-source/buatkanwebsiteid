"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleCTA = () => {
    if (user) {
      router.push("/buat");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <section
      id="beranda"
      className="relative min-h-[calc(100vh+10rem)] pb-40 pt-16 flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]"
    >
      {/* Premium Dark Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111827] via-[#0a0a0a] to-[#0a0a0a]" />
        
        {/* Subtle Glowing Orbs */}
        <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#1E466B]/20 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-[#67BAF4]/15 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        
        {/* Refined Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 text-center">
        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold text-white leading-[1.05] tracking-tight mb-6 sm:mb-8 animate-fade-in-up drop-shadow-2xl"
        >
          Website Profesional
          <br />
          <span className="bg-gradient-to-r from-[#67BAF4] via-[#89cff0] to-[#1E466B] bg-clip-text text-transparent filter drop-shadow-lg safari-text-gradient">
            Siap dalam 5 Menit
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-zinc-400/90 text-lg sm:text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed mb-12 sm:mb-14 animate-fade-in-up tracking-wide"
          style={{ animationDelay: "0.15s" }}
        >
          Website usahamu, jadi hari ini.
          <br className="hidden sm:block" />
          Isi form 5 menit. Langsung online.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <button
            onClick={handleCTA}
            disabled={loading}
            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-b from-[#255580] to-[#1E466B] hover:from-[#2c6596] hover:to-[#255580] text-white font-bold text-[16px] px-10 py-4 sm:py-5 rounded-2xl transition-all duration-300 shadow-[0_0_40px_-10px_rgba(30,70,107,0.5)] hover:shadow-[0_0_60px_-15px_rgba(103,186,244,0.4)] hover:-translate-y-1 w-full sm:w-auto cursor-pointer disabled:opacity-50"
          >
            <span className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors" />
            Buat Website Sekarang
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <a
            href="#portofolio"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold text-[16px] px-10 py-4 sm:py-5 rounded-2xl transition-all duration-300 hover:bg-zinc-800/50 backdrop-blur-sm"
          >
            Lihat Portofolio
          </a>
        </div>
      </div>

      {/* Bottom Gradient Fade to transition into the next section cleanly */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
    </section>
  );
}
