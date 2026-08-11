import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/components/seo/JsonLd";

/**
 * Sengaja SERVER component + <details>/<summary> native:
 *
 * 1. Seluruh jawaban ada di HTML awal, tidak disembunyikan di balik state React —
 *    ini syarat Google mau menampilkan rich result FAQ.
 * 2. Nol JavaScript tambahan ke browser.
 *
 * Teks di `FAQ_ITEMS` dipakai dua kali: dirender di sini DAN dikirim sebagai
 * FAQPage JSON-LD di app/page.tsx. Harus persis sama — kalau schema berisi teks
 * yang tidak terlihat pengguna, Google menganggapnya cloaking dan mencabut
 * rich result-nya. Jadi: ubah di sini saja, jangan tulis ulang di tempat lain.
 */
export const FAQ_ITEMS: readonly FaqItem[] = [
    {
        pertanyaan: "Apa itu BuatkanWeb.id?",
        jawaban:
            "BuatkanWeb.id adalah layanan buat website otomatis untuk UMKM Indonesia. Anda cukup mengisi form singkat tentang usaha Anda, lalu AI kami menyusun seluruh isi website — mulai dari headline, deskripsi layanan, hingga testimoni — dan langsung menampilkannya sebagai website jadi yang siap online.",
    },
    {
        pertanyaan: "Berapa biaya buatkan web di BuatkanWeb.id?",
        jawaban:
            "Membuat dan melihat preview website gratis, tanpa kartu kredit. Untuk membuat website Anda online dengan alamat namausaha.buatkanweb.id, biayanya Rp99.000 untuk 75 website pertama (setelah itu Rp199.000), dengan perpanjangan Rp50.000 per bulan. Kalau ingin desain custom yang dikerjakan langsung oleh tim kami, harganya mulai Rp249.000.",
    },
    {
        pertanyaan: "Berapa lama proses pembuatan websitenya?",
        jawaban:
            "Sekitar 5 menit. Anda mengisi form 3 langkah tentang profil usaha, detail bisnis, dan foto atau logo. Setelah itu AI menyusun websitenya dalam hitungan detik dan Anda bisa langsung melihat hasilnya.",
    },
    {
        pertanyaan: "Apakah saya perlu bisa coding atau menulis prompt AI?",
        jawaban:
            "Tidak perlu keduanya. Anda tidak menulis satu baris kode pun, dan tidak perlu tahu cara memberi perintah ke AI. Cukup isi form berbahasa Indonesia seperti mengisi formulir biasa — sisanya kami yang kerjakan.",
    },
    {
        pertanyaan: "Bisakah saya mengedit isi website setelah jadi?",
        jawaban:
            "Bisa. Semua teks di website bisa Anda klik dan ubah langsung di halamannya, tanpa masuk ke menu terpisah. Foto dan logo juga bisa diganti kapan saja lewat dashboard.",
    },
    {
        pertanyaan: "Jenis usaha apa saja yang bisa dibuatkan website?",
        jawaban:
            "Kami menyediakan template untuk usaha jasa, makanan dan minuman, toko atau ritel, industri kreatif, peternakan, serta personal branding dan portofolio. Setiap kategori punya desain yang disesuaikan dengan kebutuhan usaha tersebut.",
    },
    {
        pertanyaan: "Apakah website saya bisa muncul di Google?",
        jawaban:
            "Bisa. Setiap website yang sudah aktif otomatis dilengkapi judul, deskripsi, dan struktur halaman yang ramah mesin pencari, serta bisa dirayapi Google. Seberapa cepat muncul dan di posisi berapa tetap bergantung pada persaingan kata kunci di bidang usaha Anda.",
    },
    {
        pertanyaan: "Apakah saya dapat alamat website sendiri?",
        jawaban:
            "Ya. Setiap website aktif mendapat alamat namausaha.buatkanweb.id yang bisa Anda tentukan sendiri, sudah termasuk dalam biaya paket Subdomain. Kalau Anda membutuhkan domain pribadi seperti .com atau .id, silakan hubungi tim kami lewat WhatsApp untuk paket Custom.",
    },
    {
        pertanyaan: "Apa bedanya dengan jasa pembuatan website biasa?",
        jawaban:
            "Jasa pembuatan website umumnya memakan waktu berminggu-minggu dengan biaya jutaan rupiah, dan Anda harus bolak-balik merevisi lewat chat. Di BuatkanWeb.id, website Anda jadi dalam 5 menit, biayanya puluhan hingga ratusan ribu, dan revisi teks bisa Anda lakukan sendiri kapan saja.",
    },
    {
        pertanyaan: "Bagaimana cara pembayarannya?",
        jawaban:
            "Pembayaran diproses lewat Duitku dan mendukung transfer bank, virtual account, serta e-wallet seperti OVO, DANA, dan GoPay. Setelah pembayaran berhasil, website Anda langsung aktif secara otomatis.",
    },
];

export default function FaqSection() {
    return (
        <section
            id="faq"
            className="py-16 sm:py-20 bg-gradient-to-b from-[#eef2f7] to-[#f5f7fa] relative overflow-hidden"
        >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#67BAF4]/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative max-w-3xl mx-auto px-5 sm:px-8 z-10">
                <div className="text-center mb-8 sm:mb-10">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1e3a5f] tracking-tight leading-tight">
                        Pertanyaan yang Sering Ditanyakan
                    </h2>
                    <p className="text-slate-500 text-[14px] sm:text-[15px] mt-3 max-w-lg mx-auto leading-relaxed">
                        Hal-hal yang biasanya ditanyakan pemilik usaha sebelum mulai buat website.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {FAQ_ITEMS.map((item) => (
                        <details
                            key={item.pertanyaan}
                            className="group bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-200 transition-colors duration-300"
                        >
                            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 sm:px-6 py-4 sm:py-5">
                                <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#1e3a5f] leading-snug">
                                    {item.pertanyaan}
                                </h3>
                                <ChevronDown className="w-5 h-5 flex-shrink-0 text-[#67BAF4] transition-transform duration-300 group-open:rotate-180" />
                            </summary>
                            <div className="px-5 sm:px-6 pb-5 -mt-1">
                                <p className="text-slate-600 text-[13px] sm:text-[14px] leading-relaxed">
                                    {item.jawaban}
                                </p>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
