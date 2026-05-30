"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const NAV_LINKS = [
  { label: "Beranda", href: "#beranda" },
  { label: "Tentang", href: "#tentang" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Harga", href: "#harga" },
  { label: "Portofolio", href: "#portofolio" },
];

export default function Footer() {
  const { user } = useAuth();
  const router = useRouter();

  const handleCTA = () => {
    router.push(user ? "/buat" : "/auth/login");
  };

  return (
    <footer className="bg-[#0D0D0D] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <img
                src="/Logo buatkanweb.webp"
                alt="BuatkanWeb.id"
                className="w-8 h-8 rounded-lg object-contain"
              />
              <span className="font-bold text-[15px] tracking-tight text-white">
                BuatkanWeb<span className="text-[#67BAF4]">.id</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-[13px] leading-relaxed max-w-xs">
              Website profesional untuk UMKM Indonesia. Siap dalam 5 menit, tanpa coding, tanpa ribet.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[12px] font-semibold tracking-wider uppercase text-zinc-400 mb-4">
              Navigasi
            </p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[13px] text-zinc-500 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[12px] font-semibold tracking-wider uppercase text-zinc-400 mb-4">
              Kontak
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:swarnaworksagency@gmail.com"
                  className="flex items-center gap-2.5 text-[13px] text-zinc-500 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-4 h-4 flex-shrink-0 text-[#1E466B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  swarnaworksagency@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/buatkanweb.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-[13px] text-zinc-500 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-4 h-4 flex-shrink-0 text-[#1E466B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  @buatkanweb.id
                </a>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <p className="text-[12px] font-semibold tracking-wider uppercase text-zinc-400 mb-4">
              Mulai Sekarang
            </p>
            <p className="text-zinc-500 text-[13px] leading-relaxed mb-4">
              Buat website untuk bisnis Anda secara gratis dalam hitungan menit.
            </p>
            <button
              onClick={handleCTA}
              className="inline-flex items-center gap-2 bg-[#1E466B] hover:bg-[#255580] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#1E466B]/20 cursor-pointer"
            >
              Buat Website Gratis
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-zinc-600 text-[11px] sm:text-[12px]">
            &copy; {new Date().getFullYear()} BuatkanWeb.id. All rights reserved.
          </p>
          <p className="text-zinc-700 text-[11px]">
            Made with ❤️ for UMKM Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
