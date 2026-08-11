import type { Metadata } from "next";
import { Montserrat, Anton, Kaushan_Script } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/seo";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

/* Font khusus template (dipakai lewat CSS variable, bukan class global).
   Browser hanya mengunduh file font-nya kalau ada elemen yang benar-benar
   memakai variabelnya — halaman lain tidak ikut kena beban. */
const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const kaushan = Kaushan_Script({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // metadataBase WAJIB: tanpa ini semua URL og:image / canonical jadi relatif
  // dan diabaikan crawler. Ini akar dari hampir semua metadata di bawah.
  metadataBase: new URL(SITE_URL),

  title: {
    // Halaman utama pakai judul penuh; halaman lain cukup set title-nya sendiri
    // dan otomatis dapat sufiks brand lewat `template`.
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: "SwarnaWorks Creative Agency" }],
  creator: "SwarnaWorks Creative Agency",
  publisher: SITE_NAME,
  category: "technology",

  // Sengaja TIDAK ada `alternates.canonical` di sini. Metadata diwariskan ke
  // seluruh route, termasuk /s/[subdomain] (website pelanggan) — kalau canonical
  // diset "/" di root, semua website pelanggan ikut mengarah ke beranda kami dan
  // hilang dari indeks. Canonical diset per-halaman.

  icons: {
    icon: "/Logo buatkanweb.webp",
    apple: "/Logo buatkanweb.webp",
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    // og:image diisi otomatis oleh app/opengraph-image.tsx
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // Kode verifikasi Google Search Console. Isi lewat env supaya tidak
  // perlu commit ulang saat properti GSC dibuat.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
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
    <html lang="id" className={`${montserrat.variable} ${anton.variable} ${kaushan.variable} h-full antialiased`} suppressHydrationWarning>
      {/* Structured data BuatkanWeb sengaja tidak dipasang di root layout —
          root ikut dipakai /s/[subdomain], dan schema Organization kami tidak
          boleh muncul di website pelanggan. Dipasang di app/page.tsx saja. */}
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

