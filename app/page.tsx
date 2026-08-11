import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import CaraKerjaSection from "@/components/landing/CaraKerjaSection";
import PricingSection from "@/components/landing/PricingSection";
import PortofolioSection from "@/components/landing/PortofolioSection";
import FaqSection, { FAQ_ITEMS } from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";
import { OrganizationJsonLd, ProductJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = {
  // `absolute` supaya judul tidak kena sufiks "| BuatkanWeb.id" dari root layout
  // (jadinya dobel brand). Kata kunci utama ditaruh di depan — bagian awal title
  // yang paling berbobot di mata Google dan paling terbaca di hasil pencarian.
  title: {
    absolute: `Buatkan Web Usaha Anda dalam 5 Menit — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Structured data khusus beranda. Dipasang di sini, bukan di root layout,
          supaya tidak ikut ter-render di website pelanggan (/s/[subdomain]). */}
      <OrganizationJsonLd />
      <ProductJsonLd />
      <FaqJsonLd items={FAQ_ITEMS} />

      <main>
        <Navbar />
        <HeroSection />
        <AboutSection />
        <CaraKerjaSection />
        <PricingSection />
        <PortofolioSection />
        <FaqSection />
        <Footer />
      </main>
    </>
  );
}
