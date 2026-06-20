import { NextRequest, NextResponse } from "next/server";
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateSchema } from '@/lib/validations';
import { getClientIp, getActiveBan } from '@/lib/ip';

// Batas generate per user per hari. Harus sama dengan MAX_DAILY di DashboardClient.
const MAX_DAILY = 3;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    // Validasi + batasi input (cegah cost-explosion / prompt-injection padding).
    const parsedBody = generateSchema.safeParse(await request.json().catch(() => null));
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Data formulir tidak valid." }, { status: 400 });
    }
    const {
      namaBisnis,
      tagline,
      kategoriJasa,
      lokasi,
      keunggulan,
      layananSpesifik,
      paketHarga,
      usia,
      statusKeluarga,
      pekerjaan,
      gayaHidup,
      nuansaDesain,
      proyekPortofolio
    } = parsedBody.data;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not set.");
      return NextResponse.json({ error: "Server configuration error (API Key missing)." }, { status: 500 });
    }

    // ─── IP BAN: blokir jaringan yang di-ban (anti-abuse / hemat biaya AI) ───
    const ip = getClientIp(request);
    if (await getActiveBan(ip)) {
      return NextResponse.json({ error: "Akses dari jaringan ini diblokir." }, { status: 403 });
    }

    // ─── AUTH: wajib login ───
    // Endpoint ini memanggil Anthropic (berbiaya). Tanpa gate ini, caller anonim
    // bisa membakar kredit AI / DoS. Sesi dibaca dari cookie HttpOnly (@supabase/ssr).
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Anda harus login untuk generate website." }, { status: 401 });
    }

    // ─── KUOTA: maksimal MAX_DAILY generate per user per hari (DIPAKSA DI SERVER) ───
    // Cek client-side di /buat hanya untuk UX. Batas sebenarnya WAJIB di sini supaya
    // tidak bisa dilewati dengan memanggil endpoint langsung.
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count: todayCount, error: quotaError } = await supabase
      .from('generate_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString());

    if (quotaError) {
      console.error("Quota check error:", quotaError);
      return NextResponse.json({ error: "Gagal memeriksa kuota generate. Coba lagi." }, { status: 500 });
    }

    if ((todayCount ?? 0) >= MAX_DAILY) {
      return NextResponse.json(
        { error: `Batas generate harian tercapai. Kamu sudah generate ${MAX_DAILY} website hari ini. Coba lagi besok setelah pukul 00.00 WIB.` },
        { status: 429 }
      );
    }

    // Reserve slot kuota SEBELUM memanggil Anthropic (cegah biaya AI kalau pencatatan gagal).
    // Fail-closed: kalau log gagal, tolak — jangan generate tanpa tercatat (anti-bypass).
    const { data: logRow, error: logError } = await supabase
      .from('generate_logs')
      .insert({ user_id: user.id })
      .select('id')
      .single();

    if (logError) {
      console.error("Failed to record generate_logs:", logError);
      return NextResponse.json({ error: "Gagal mencatat kuota generate. Coba lagi." }, { status: 500 });
    }

    // ─── SYSTEM PROMPT ───
    const systemPrompt = `Kamu adalah copywriter profesional spesialis UMKM Indonesia dengan pengalaman 10 tahun.

Tugasmu membuat konten website yang:
- Natural dan tidak terkesan dibuat AI
- Sesuai karakter dan tone bisnis UMKM lokal Indonesia
- Persuasif tapi tidak berlebihan
- Menggunakan bahasa Indonesia yang hangat dan akrab
- Spesifik terhadap jenis usaha, lokasi, dan target pelanggan yang diberikan

ATURAN PENTING:
- Jangan gunakan kata-kata klise seperti "terpercaya", "berkualitas tinggi", "solusi terbaik" tanpa konteks spesifik
- Sebutkan nama bisnis minimal 2x di hero section (headline + subheadline)
- Sebutkan lokasi/kota secara natural di konten
- Copywriting harus mencerminkan USP unik bisnis ini
- Hindari kata-kata tidak formal seperti 'banget', 'beneran', 'oke', 'yuk', dan sejenisnya. Gunakan bahasa Indonesia yang profesional namun tetap hangat dan bersahabat.
- Untuk keunggulan bisnis: WAJIB konkret dan spesifik. Jangan tulis frasa generik seperti "Profesional & Berpengalaman", "Kualitas Terjamin", "Harga Terjangkau", "Pelayanan Ramah". Tulis klaim yang bisa diverifikasi — waktu pengerjaan, bahan yang dipakai, cara kerja, ketersediaan, jaminan konkret.
- Deskripsi about section maksimal 3 kalimat yang padat dan langsung ke poin. Tidak perlu menulis sejarah panjang perusahaan.
- Headline hero tidak boleh menggunakan format 'Nama Bisnis - Deskripsi'. Gunakan format kalimat aktif yang menarik.
- Selalu kembalikan response dalam format JSON valid
- DILARANG memakai tanda hubung panjang (em dash "—" atau "–") maupun tanda " - " sebagai pemisah klausa di dalam kalimat. Pakai koma, titik, atau pecah jadi kalimat terpisah. Contoh SALAH: "Konsultasi gratis — tanpa komitmen". Contoh BENAR: "Konsultasi gratis, tanpa komitmen."

PRINSIP UTAMA — INPUT USER = BAHAN MENTAH, BUKAN OUTPUT:
- JANGAN PERNAH menyalin mentah-mentah teks user ke output. Selalu olah ulang agar PAS, RAPI, dan MUAT di layout template website.
- Input panjang/bertele/berantakan: RINGKAS jadi inti yang menjual sesuai batas panjang tiap field. Tulis ulang jadi padat, JANGAN dipotong di tengah kalimat.
- Input pendek/kosong: lengkapi secukupnya dari konteks (kategori, lokasi, target pelanggan). JANGAN mengarang fakta, angka, atau klaim palsu.
- PATUHI BATAS PANJANG tiap field secara KETAT. Teks melebihi batas MERUSAK tampilan template. Lebih baik pendek-padat daripada panjang-berantakan.
- Nama bisnis, lokasi, harga, dan kontak: pakai APA ADANYA. Tapi semua teks DESKRIPTIF (headline, deskripsi, keunggulan, testimoni, dll) WAJIB diolah agar fit.
- Pastikan setiap teks cocok dengan latar/jenis usaha user: tone, istilah, dan contoh selaras dengan kategori dan lokasi bisnisnya.
- Tidak ada teks di luar JSON. JANGAN bungkus dalam markdown code block`;

    // ─── BUILD USER PROMPT with actual data ───
    const layananFormatted = Array.isArray(layananSpesifik) && layananSpesifik.length > 0
      ? layananSpesifik.map((l: string) => `- ${l}`).join("\n")
      : "- (tidak disebutkan)";

    const keunggulanFormatted = keunggulan && typeof keunggulan === "string" && keunggulan.trim()
      ? keunggulan.trim()
      : "(tidak disebutkan)";

    const usiaFormatted = Array.isArray(usia) && usia.length > 0
      ? usia.join(", ")
      : "(tidak disebutkan)";

    const statusFormatted = Array.isArray(statusKeluarga) && statusKeluarga.length > 0
      ? statusKeluarga.join(", ")
      : "(tidak disebutkan)";

    const pekerjaanFormatted = Array.isArray(pekerjaan) && pekerjaan.length > 0
      ? pekerjaan.join(", ")
      : "(tidak disebutkan)";

    const gayaHidupFormatted = Array.isArray(gayaHidup) && gayaHidup.length > 0
      ? gayaHidup.join(", ")
      : "(tidak disebutkan)";

    const paketFormatted = Array.isArray(paketHarga) && paketHarga.length > 0
      ? paketHarga.map((p: { namaPaket: string; harga: string; fitur: string[] }) =>
          `- ${p.namaPaket}: ${p.harga} | Fitur: ${p.fitur.join(", ")}`
        ).join("\n")
      : "(tidak ada paket — skip bagian harga)";

    // Mode portfolio: proyek jadi sumber konten "layanan" (judul + deskripsi menarik) + SEO.
    const hasProyek = Array.isArray(proyekPortofolio) && proyekPortofolio.length > 0;
    const proyekFormatted = hasProyek
      ? proyekPortofolio.map((p: { namaProyek: string; kategori: string; masalah: string; peran: string; solusi: string; hasil: string }, i: number) =>
          `Proyek ${i + 1}: ${p.namaProyek || "(tanpa nama)"}${p.kategori ? ` [${p.kategori}]` : ""}\n  - Masalah: ${p.masalah || "-"}\n  - Peran: ${p.peran || "-"}\n  - Solusi: ${p.solusi || "-"}\n  - Hasil: ${p.hasil || "-"}`
        ).join("\n")
      : "";

    const userPrompt = `Buatkan konten website lengkap untuk bisnis ini:

=== DATA BISNIS ===
Nama Bisnis: ${namaBisnis || "(kosong)"}
Tagline dari pemilik: ${tagline || "(tidak ada)"}
Kategori: ${kategoriJasa || "(tidak disebutkan)"}
Lokasi: ${lokasi || "(tidak disebutkan)"}

=== KEUNGGULAN BISNIS ===
${keunggulanFormatted}

=== LAYANAN ===
${layananFormatted}

=== TARGET PELANGGAN ===
- Usia: ${usiaFormatted}
- Status: ${statusFormatted}
- Pekerjaan: ${pekerjaanFormatted}
- Gaya Hidup: ${gayaHidupFormatted}

=== PAKET HARGA ===
${paketFormatted}

=== PREFERENSI DESAIN ===
Nuansa: ${nuansaDesain || "light"}

=== INSTRUKSI OUTPUT ===
Kembalikan JSON MURNI (tanpa markdown, tanpa backtick) dengan struktur PERSIS ini:
{
  "hero": {
    "headline": "judul utama yang menarik, max 10 kata, sebutkan nama bisnis '${namaBisnis || ""}' atau layanan utamanya",
    "subheadline": "penjelasan singkat 1-2 kalimat yang menyebut lokasi '${lokasi || ""}' dan nilai utama bisnis. Sebutkan juga nama bisnis.",
    "ctaText": "teks tombol CTA utama (max 5 kata, contoh: 'Konsultasi Gratis Sekarang')"
  },
  "about": {
    "judul": "pernyataan identitas bisnis '${namaBisnis || ""}' (max 8 kata). WAJIB HINDARI: 'Tentang Kami', 'Mengapa Memilih Kami', 'Kenapa Harus Kami', 'Siapa Kami'. Gunakan kalimat aktif yang langsung menggambarkan APA yang bisnis ini kerjakan atau hasilkan — bukan sekedar siapa mereka.",
    "deskripsi": "2-3 kalimat yang menjelaskan APA YANG DIKERJAKAN bisnis ini secara konkret untuk kategori '${kategoriJasa || ""}' di '${lokasi || ""}'. Jangan tulis klaim kosong seperti 'terpercaya', 'berkualitas', 'berpengalaman' tanpa konteks spesifik. Tulis fakta: proses kerja, spesialisasi, atau cara bisnis ini berbeda dari yang lain.",
    "keunggulan": [
      "klaim konkret 1 — 6-12 kata, sertakan angka atau detail spesifik yang bisa diverifikasi (contoh: 'Pengerjaan selesai dalam 1-2 hari kerja', 'Pakai bahan import langsung dari supplier', 'Dikerjakan sendiri oleh pemilik, bukan karyawan lepas', 'Tersedia hari Minggu tanpa biaya tambahan')",
      "klaim konkret 2 — sama: spesifik, berbasis fakta bisnis ini, hindari kata 'profesional/berkualitas/terpercaya' berdiri sendiri",
      "klaim konkret 3",
      "klaim konkret 4"
    ]
  },
  "layanan": [
    {
      "nama": "nama layanan sesuai input",
      "deskripsi": "deskripsi persuasif 1-2 kalimat yang spesifik",
      "harga": "harga jika ada, atau 'Hubungi Kami'"
    }
  ],
  "targetPelanggan": {
    "deskripsi": "1-2 kalimat menjelaskan siapa target pelanggan ideal bisnis ini",
    "painPoint": "masalah utama yang dirasakan target pelanggan terkait kategori ${kategoriJasa || "ini"}",
    "solusi": "bagaimana ${namaBisnis || "bisnis ini"} menyelesaikan masalah tersebut"
  },
  "testimonialPlaceholder": [
    {
      "nama": "nama Indonesia yang realistis sesuai demografi target",
      "peran": "profesi/status yang sesuai target pelanggan (${pekerjaanFormatted})",
      "teks": "testimoni 2-3 kalimat yang spesifik dan realistis tentang pengalaman menggunakan layanan ${kategoriJasa || "ini"}"
    },
    { "nama": "...", "peran": "...", "teks": "..." },
    { "nama": "...", "peran": "...", "teks": "..." }
  ],
  "footer": {
    "tagline": "ajakan bertindak yang kuat (max 10 kata), relevan dengan ${kategoriJasa || "bisnis ini"}",
    "ctaText": "teks tombol (max 5 kata)"
  },
  "seo": {
    "metaTitle": "judul SEO untuk Google (max 60 karakter). Format: [Nama Bisnis] - [Layanan Utama] di [Lokasi]. Contoh: 'Studio Foto Jogja - Jasa Foto Produk Profesional di Yogyakarta'",
    "metaDescription": "deskripsi SEO untuk Google (max 155 karakter). Harus mengandung nama bisnis, layanan utama, lokasi, dan ajakan bertindak. Ditulis sebagai kalimat persuasif."
  }
}

PENTING:
- Buat 3 testimoni yang berbeda dan realistis
- Buat layanan sesuai jumlah input layanan di atas
- Semua teks harus dalam bahasa Indonesia
- Jangan tambahkan field lain di luar struktur di atas
- Pastikan JSON valid dan bisa di-parse
- SEO metaTitle HARUS max 60 karakter dan mengandung nama bisnis + layanan utama + lokasi
- SEO metaDescription HARUS max 155 karakter dan persuasif
- BATAS PANJANG (KETAT, biar muat di template. Kalau input user lebih panjang: RINGKAS, bukan dipotong):
  - hero.headline maks 10 kata; hero.subheadline maks 110 karakter
  - about.judul maks 8 kata; about.deskripsi maks 280 karakter; tiap item about.keunggulan 6-12 kata
  - layanan.nama maks 5 kata; layanan.deskripsi maks 120 karakter (1 kalimat)
  - testimonialPlaceholder.teks maks 160 karakter; footer.tagline maks 10 kata`;

    // Mode portfolio: layanan = proyek (urut sama), AI hanya poles judul/kalimat + SEO.
    const finalUserPrompt = hasProyek
      ? userPrompt + `

=== DAFTAR PROYEK (PORTOFOLIO) ===
${proyekFormatted}

INSTRUKSI KHUSUS PORTOFOLIO PRIBADI:
- Ini website portofolio pribadi, BUKAN perusahaan. "${namaBisnis || ""}" adalah nama orang.
- "layanan" array WAJIB berisi tepat satu entri per proyek di atas, URUT SAMA dengan daftar proyek.
- "nama" tiap layanan = judul proyek yang dipoles jadi menarik & ringkas (maks 5 kata), tetap merepresentasikan proyek aslinya.
- "deskripsi" = 1 kalimat menarik merangkum masalah → solusi → hasil proyek tsb.
- "harga" = "" untuk semua (portofolio tidak memakai harga).
- about.judul & about.deskripsi cerminkan personal brand & keahlian orang ini.
- about.deskripsi WAJIB SINGKAT: maksimal 1 kalimat (sekitar 15 sampai 22 kata). Ini tampil di hero, jadi harus padat dan langsung kena poin. Kalau bio dari user panjang/bertele, ringkas jadi inti yang menjual.
- hero.subheadline juga singkat: maksimal 1 kalimat pendek.
- Tugas utamamu HANYA: optimasi SEO + bikin kalimat menarik dan RINGKAS. JANGAN mengarang proyek atau fakta baru di luar input.`
      : userPrompt;

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: finalUserPrompt }]
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err: any) {
          // Anthropic gagal (kredit/token habis, rate limit, overload). Refund slot kuota
          // yang sudah di-reserve supaya user tidak kehilangan jatah harian gara-gara ini.
          if (logRow?.id) {
            try { await supabase.from('generate_logs').delete().eq('id', logRow.id); } catch {}
          }
          const status = err?.status;
          const msg = String(err?.message || "");
          let code = "generate_failed";
          if (status === 400 && /credit balance|insufficient|quota/i.test(msg)) code = "insufficient_credit";
          else if (status === 429) code = "rate_limited";
          else if (status === 529) code = "overloaded";
          console.error("Anthropic stream error:", status, msg);
          // Tandai kegagalan lewat marker teks (response sudah 200 + streaming, tak bisa ganti status).
          controller.enqueue(new TextEncoder().encode(`__GENERATE_ERROR__:${code}`));
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat memproses permintaan." }, { status: 500 });
  }
}
