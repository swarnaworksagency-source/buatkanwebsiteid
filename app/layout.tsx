import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BuatkanWeb.id",
  description:
    "Buat website profesional untuk bisnis Anda dalam 5 menit. Tanpa coding, tanpa prompt — cukup isi form sederhana. Solusi website terjangkau untuk UMKM Indonesia.",
  keywords: "website builder, UMKM, landing page, buat website, website murah, zero prompting, AI website",
  icons: {
    icon: "/Logo buatkanweb.webp",
  },
  openGraph: {
    title: "BuatkanWeb.id",
    description: "Website profesional untuk UMKM Indonesia. Siap dalam 5 menit, tanpa coding.",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

