import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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

export default nextConfig;
