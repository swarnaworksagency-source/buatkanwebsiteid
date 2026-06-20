"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";

const elegant = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

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
      className={`relative h-screen w-full flex flex-col justify-start pt-24 sm:pt-28 lg:pt-40 bg-[#0a0a0a] overflow-hidden ${elegant.className}`}
    >
      {/* Premium Dark Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111827] via-[#0a0a0a] to-[#0a0a0a]" />

        {/* Diagonal blue light beam — top-left to bottom-right, aimed at the SVG */}
        <div className="absolute -top-1/4 -left-1/4 w-[160%] h-[75%] origin-top-left rotate-[25deg] bg-gradient-to-br from-[#67BAF4]/35 via-[#67BAF4]/10 to-transparent blur-[80px]" />
        <div className="absolute top-[5%] left-[8%] w-[70%] h-[45%] rotate-[25deg] bg-gradient-to-br from-white/25 via-[#89cff0]/15 to-transparent blur-[60px]" />

        {/* Glow converging behind the SVG */}
        <div className="absolute right-[-5%] bottom-0 w-[600px] h-[600px] rounded-full bg-[#67BAF4]/25 blur-[140px]" />
        <div className="absolute bottom-[5%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#1E466B]/25 blur-[110px] animate-pulse" style={{ animationDuration: '10s' }} />

        {/* Refined Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* SVG anchored bottom-right at every breakpoint — never floats, never clipped */}
      <div className="absolute bottom-0 right-[-18%] sm:right-0 z-[1] pointer-events-none flex items-end justify-end h-[80%] max-h-[640px] w-[150%] max-w-[150%] sm:h-[80%] sm:max-h-[720px] sm:w-[98%] sm:max-w-[98%] lg:h-[82%] lg:max-h-[760px] lg:w-auto lg:max-w-[92%]">
        <img
          src="/Hero.svg"
          alt="Ilustrasi BuatkanWeb.id"
          className="h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_40px_80px_rgba(103,186,244,0.3)] animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        />
      </div>

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start">

          <div className="text-left max-w-xl lg:max-w-lg">
            <h1 className="text-4xl sm:text-6xl lg:text-[4.4rem] font-semibold text-white leading-[1.12] tracking-tight mb-4 sm:mb-6 animate-fade-in-up">
              Website Profesional
              <br />
              <span className="bg-gradient-to-r from-[#67BAF4] via-[#89cff0] to-[#1E466B] bg-clip-text text-transparent safari-text-gradient">
                Siap dalam 5 Menit
              </span>
            </h1>

            <p
              className="text-zinc-400/90 text-[15px] sm:text-xl font-light max-w-md leading-relaxed mb-6 sm:mb-10 animate-fade-in-up tracking-wide"
              style={{ animationDelay: "0.15s" }}
            >
              Website kamu, Jadi hari ini. Isi form 5 menit. Langsung online.
            </p>

            <div
              className="flex flex-col sm:flex-row items-start justify-start gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <button
                onClick={handleCTA}
                disabled={loading}
                className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 whitespace-nowrap bg-white/10 backdrop-blur-xl border border-white/25 hover:bg-white/15 hover:border-white/40 text-white font-medium text-[13px] px-6 py-3 sm:text-[17px] sm:px-10 sm:py-5 rounded-full transition-all duration-300 shadow-[0_8px_32px_rgba(103,186,244,0.2)] hover:shadow-[0_8px_40px_rgba(103,186,244,0.35)] hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                Buat Website Sekarang
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <a
                href="#portofolio"
                className="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap bg-white/5 backdrop-blur-xl border border-white/15 hover:bg-white/10 hover:border-white/25 text-zinc-200 font-medium text-[13px] px-6 py-3 sm:text-[17px] sm:px-10 sm:py-5 rounded-full transition-all duration-300"
              >
                Lihat Portofolio
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
