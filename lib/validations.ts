import { z } from 'zod';

// Skema validasi input untuk route handler (server-side boundary).
// Tujuan utama: tolak payload bentuk salah + BATASI panjang string/array supaya
// /api/generate tidak bisa dipakai membengkakkan biaya AI atau menyuntik prompt panjang.
// z.object default = strip key tak dikenal, jadi field FormData lain (kontak, sosmed,
// warna, dll) yang ikut terkirim akan dibuang tanpa error.

const paketSchema = z.object({
  namaPaket: z.string().max(150).default(''),
  harga: z.string().max(100).default(''),
  fitur: z.array(z.string().max(200)).max(50).default([]),
  isPopuler: z.boolean().optional(),
});

const proyekSchema = z.object({
  namaProyek: z.string().max(200).default(''),
  kategori: z.string().max(150).default(''),
  masalah: z.string().max(1000).default(''),
  peran: z.string().max(500).default(''),
  solusi: z.string().max(1000).default(''),
  hasil: z.string().max(1000).default(''),
});

// Body /api/generate. Semua opsional (route sudah handle nilai kosong), tapi DIBATASI.
export const generateSchema = z.object({
  namaBisnis: z.string().max(150).optional(),
  tagline: z.string().max(300).optional(),
  kategoriJasa: z.string().max(150).optional(),
  lokasi: z.string().max(150).optional(),
  keunggulan: z.string().max(2000).optional(),
  layananSpesifik: z.array(z.string().max(200)).max(50).optional(),
  paketHarga: z.array(paketSchema).max(20).optional(),
  usia: z.array(z.string().max(100)).max(50).optional(),
  statusKeluarga: z.array(z.string().max(100)).max(50).optional(),
  pekerjaan: z.array(z.string().max(100)).max(50).optional(),
  gayaHidup: z.array(z.string().max(100)).max(50).optional(),
  nuansaDesain: z.string().max(50).optional(),
  proyekPortofolio: z.array(proyekSchema).max(30).optional(),
});

// Body endpoint berbasis id (UUID Supabase).
export const websiteIdSchema = z.object({ websiteId: z.uuid() });
export const paymentIdSchema = z.object({ paymentId: z.uuid() });
