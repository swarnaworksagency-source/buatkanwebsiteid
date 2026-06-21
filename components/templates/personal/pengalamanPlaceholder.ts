// Data contoh section "Pengalaman" — dipakai template personal-002/003 sebagai
// fallback saat user belum mengisi pengalaman (preview tak kosong). Satu sumber,
// jangan duplikasi per template. Key = kategori ("pekerjaan"/"kompetisi"/"organisasi").
export type PengalamanRow = { tahun: string; judul: string; deskripsi: string };

export const PENGALAMAN_PLACEHOLDER: Record<string, PengalamanRow[]> = {
  pekerjaan: [
    { tahun: "2023 – Sekarang", judul: "UI/UX Designer — Freelance", deskripsi: "Merancang antarmuka untuk klien startup dan UMKM, mulai dari wireframe hingga prototype siap handoff." },
    { tahun: "2022 – 2023", judul: "Frontend Developer — PT. XYZ", deskripsi: "Membangun aplikasi web berbasis React & Next.js, berkolaborasi dengan tim desain dan backend." },
    { tahun: "2021 – 2022", judul: "Junior Designer — Agensi Kreatif", deskripsi: "Mengerjakan aset visual, landing page, dan identitas brand untuk berbagai klien." },
  ],
  kompetisi: [
    { tahun: "2024", judul: "Juara 1 — Inkubator UNY", deskripsi: "Memenangkan kompetisi inkubator bisnis dengan platform BuatkanWeb.id." },
    { tahun: "2023", judul: "Finalis — Hackathon Nasional", deskripsi: "Masuk final dari 200+ tim dengan solusi digitalisasi UMKM berbasis AI." },
    { tahun: "2022", judul: "Top 10 — UI/UX Design Challenge", deskripsi: "Desain aplikasi kesehatan digital yang meraih penilaian tinggi dari juri industri." },
  ],
  organisasi: [
    { tahun: "2023 – Sekarang", judul: "Ketua — Komunitas Desainer Yogyakarta", deskripsi: "Menginisiasi dan memimpin komunitas desainer lokal dengan 200+ anggota aktif." },
    { tahun: "2022 – 2023", judul: "Divisi Kreatif — BEM Fakultas", deskripsi: "Bertanggung jawab atas identitas visual dan komunikasi kreatif organisasi mahasiswa." },
    { tahun: "2021 – 2022", judul: "Koordinator — UKM Fotografi", deskripsi: "Mengelola kegiatan dan dokumentasi visual unit kegiatan mahasiswa fotografi." },
  ],
};
