import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// Bundle analyzer: aktif hanya saat env ANALYZE=true. Build normal tak terpengaruh.
// Catatan: plugin berbasis webpack — jalankan dgn build webpack, mis:
//   ANALYZE=true next build --webpack
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const nextConfig: NextConfig = {
  // next/image: izinkan optimasi gambar dari Supabase Storage (host project).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "db.buatkanweb.id", pathname: "/storage/v1/object/public/**" },
    ],
  },

  // Origin LAN yang boleh akses dev server (Next 16 blok cross-origin dev asset by default;
  // kalau IP tak terdaftar → halaman render tapi JS tak ter-hidrasi → gabisa diklik).
  // Tambah IP eksak + wildcard subnet biar tahan ganti IP (DHCP). Dev-only, tak ke production.
  allowedDevOrigins: [
    "192.168.193.206",
    "10.109.86.10",
    "192.168.*.*",
    "10.*.*.*",
  ],
};

export default withBundleAnalyzer(nextConfig);
