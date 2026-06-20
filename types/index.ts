export interface ProyekPortofolio {
  namaProyek: string;
  kategori: string;
  masalah: string;
  peran: string;
  solusi: string;
  hasil: string;
  foto: string;
}

export interface KeahlianItem {
  nama: string;
  deskripsi: string;
}

// Riwayat pengalaman (dipakai template personal-002/003: tab Pekerjaan/Kompetisi/Organisasi).
export type PengalamanKategori = "pekerjaan" | "kompetisi" | "organisasi";
export interface PengalamanItem {
  kategori: PengalamanKategori;
  tahun: string;
  judul: string;
  deskripsi: string;
}

export interface PaketHarga {
  namaPaket: string;
  harga: string;
  fitur: string[];
  isPopuler: boolean;
}

export interface FormData {
  // Step 1 — Profil Dasar
  namaBisnis: string;
  namaPanggilan: string;
  tagline: string;
  kategoriJasa: string;
  lokasi: string;
  nomorWhatsApp: string;
  telepon: string;
  email: string;
  instagram: string;
  x_twitter: string;
  tiktok: string;
  linkedin: string;
  // Step 2 — Detail Bisnis
  keunggulan: string;
  layananSpesifik: string[];
  keahlianList: KeahlianItem[];
  usia: string[];
  statusKeluarga: string[];
  pekerjaan: string[];
  gayaHidup: string[];
  paketHarga: PaketHarga[];
  proyekPortofolio: ProyekPortofolio[];
  pengalaman: PengalamanItem[];
  // Step 3 — Visual & Aset
  tema: "dark" | "light" | "";
  primaryColor: string;
  logo: string;
  fotoBisnis: string[];
  portofolio: string[];
}

export interface AIHeroSection {
  headline: string;
  subheadline: string;
  ctaText: string;
}

export interface AIAboutSection {
  judul: string;
  deskripsi: string;
  keunggulan: string[];
}

export interface AILayananItem {
  nama: string;
  deskripsi: string;
  harga: string;
}

export interface AITargetPelanggan {
  deskripsi: string;
  painPoint: string;
  solusi: string;
}

export interface AITestimonial {
  nama: string;
  peran: string;
  teks: string;
  rating?: number;
}

export interface AIFooter {
  tagline: string;
  ctaText: string;
  kontakTitle?: string;
  sosmedTitle?: string;
}

export interface AICaraKerjaItem {
  step: string;
  title: string;
  desc: string;
}

export interface AISEO {
  metaTitle: string;
  metaDescription: string;
}

export interface TemplateData {
  // From AI (Claude)
  hero: AIHeroSection;
  about: AIAboutSection;
  layanan: AILayananItem[];
  targetPelanggan: AITargetPelanggan;
  testimonialPlaceholder: AITestimonial[];
  footer: AIFooter;
  caraKerja?: AICaraKerjaItem[];
  caraKerjaTitle?: string;
  seo?: AISEO;

  // From Form Data & Storage
  namaBisnis: string;
  namaPanggilan?: string;
  kategori: string;
  lokasi: string;
  
  kontak: {
    wa: string;
    telepon: string;
    email: string;
  };
  
  portofolioPositions?: Array<{
    x: number;
    y: number;
    scale: number;
  }>;

  // Posisi/zoom gambar per-id (dipakai template yang punya banyak slot gambar, mis. personal-001)
  imagePositions?: Record<string, { x: number; y: number; scale: number }>;
  
  sosmed: {
    instagram: string;
    tiktok: string;
    twitter: string;
  };
  
  warna: {
    primary: string;
    tema: "dark" | "light";
  };
  
  paketHarga: PaketHarga[];
  keahlian?: KeahlianItem[];
  pengalaman?: PengalamanItem[];
  logo: string;
  fotoBisnis: string[];
  portofolio: string[];
}
