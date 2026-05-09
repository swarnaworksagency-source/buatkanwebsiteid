"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function useCountUp(end: number, duration: number = 2000, trigger: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * end));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, duration, trigger]);

  return count;
}

const StatCard = ({
  number,
  suffix,
  title,
  desc,
  delay,
  inView
}: {
  number: number;
  suffix: string;
  title: string;
  desc: string;
  delay: string;
  inView: boolean;
}) => {
  const count = useCountUp(number, 2500, inView);

  return (
    <div className={`reveal ${delay} group relative bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(103,186,244,0.12)] transition-all duration-500 hover:-translate-y-2 flex flex-col overflow-hidden`}>
      <div className="mb-6 relative z-10">
        <h3 className="text-6xl sm:text-7xl font-extrabold tracking-tight mb-3 flex items-baseline">
          <span className="bg-gradient-to-br from-[#1E466B] to-[#67BAF4] bg-clip-text text-transparent drop-shadow-sm safari-text-gradient">
            {count}
          </span>
          <span className="text-2xl sm:text-3xl text-[#67BAF4] ml-2 font-bold">{suffix}</span>
        </h3>
        <h4 className="text-xl sm:text-2xl font-bold text-[#0D0D0D] leading-tight group-hover:text-[#1E466B] transition-colors">{title}</h4>
      </div>
      <p className="text-zinc-500 text-[15px] sm:text-[16px] leading-relaxed mt-auto relative z-10">
        {desc}
      </p>
    </div>
  );
};

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleCTA = () => {
    router.push(user ? "/buat" : "/auth/login");
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            if (entry.target.id === "tentang") {
              setInView(true);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    const els = sectionRef.current?.querySelectorAll(".reveal");
    els?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="tentang"
      ref={sectionRef}
      className="py-24 sm:py-32 bg-[#F8FAFC] relative overflow-hidden"
    >
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#67BAF4]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1E466B]/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-20">
          <p className="reveal text-[13px] font-bold tracking-[0.2em] uppercase text-[#1E466B] mb-4">
            Tentang Kami
          </p>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0D0D0D] tracking-tight leading-[1.15]">
            Membangun Identitas Digital
            <br className="hidden sm:block" />
            <span className="text-[#1E466B]"> untuk UMKM Indonesia</span>
          </h2>
          <p className="reveal reveal-delay-2 text-zinc-600 text-[15px] sm:text-[17px] mt-6 max-w-2xl mx-auto leading-relaxed">
            Kami percaya setiap usaha kecil berhak punya website profesional. BuatkanWeb.id hadir
            sebagai solusi cepat, mudah, dan terjangkau agar bisnis Anda bisa tampil online dengan
            percaya diri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

          {/* Card 1 */}
          <StatCard
            number={9}
            suffix="/ 10 UMKM"
            title="UMKM Tertarik Mencoba"
            desc="Dari ratusan pelaku UMKM DIY yang kami survei, hampir semuanya ingin hadir secara digital mereka hanya butuh cara yang mudah."
            delay="reveal-delay-1"
            inView={inView}
          />

          {/* Card 2 */}
          <StatCard
            number={92}
            suffix="%"
            title="Berhasil Membuat Website Secara Mandiri"
            desc="Hampir semua peserta prototype testing berhasil membuat website sendiri tanpa perlu diajari atau didampingi siapapun."
            delay="reveal-delay-2"
            inView={inView}
          />

          {/* Card 3 */}
          <StatCard
            number={5}
            suffix=" Menit"
            title="Website Profesional Jadi"
            desc="Cukup isi form sederhana. Dalam 5 menit, website usahamu sudah siap tampil tanpa coding, tanpa ribet."
            delay="reveal-delay-3"
            inView={inView}
          />

          {/* Card 4 - CTA */}
          <div className="reveal reveal-delay-4 group relative bg-gradient-to-br from-[#1E466B] to-[#0F2338] rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_40px_rgba(30,70,107,0.2)] hover:shadow-[0_20px_60px_rgba(103,186,244,0.3)] transition-all duration-500 hover:-translate-y-2 flex flex-col justify-center overflow-hidden">
            {/* CTA Decorative BG */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#67BAF4]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-[#67BAF4]/20 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
            
            <div className="relative z-20">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-[1.15] drop-shadow-md">
                Siap usahamu tampil seperti ini?
              </h3>
              <p className="text-white/80 text-[15px] sm:text-[16px] leading-relaxed mb-10">
                Bergabung bersama UMKM yang sudah hadir secara digital tanpa coding, tanpa ribet.
              </p>
              <button
                onClick={handleCTA}
                className="inline-flex items-center justify-center w-full sm:w-auto gap-3 bg-white text-[#1E466B] font-bold text-[16px] px-8 py-4 sm:py-5 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02] border border-white/10 hover:bg-zinc-50 cursor-pointer"
              >
                Buat Website Sekarang
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
