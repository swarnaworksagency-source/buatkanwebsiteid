import { NextRequest, NextResponse } from "next/server";
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      nuansaDesain
    } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not set.");
      return NextResponse.json({ error: "Server configuration error (API Key missing)." }, { status: 500 });
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
- Deskripsi about section maksimal 3 kalimat yang padat dan langsung ke poin. Tidak perlu menulis sejarah panjang perusahaan.
- Headline hero tidak boleh menggunakan format 'Nama Bisnis - Deskripsi'. Gunakan format kalimat aktif yang menarik.
- Selalu kembalikan response dalam format JSON valid
- Tidak ada teks di luar JSON — JANGAN bungkus dalam markdown code block`;

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
    "judul": "judul section tentang kami (max 8 kata, kreatif, jangan generik)",
    "deskripsi": "Maksimal 3 kalimat tentang bisnis ${namaBisnis || "ini"}. Ceritakan nilai dan komitmen langsung ke poin, jangan sejarah panjang. Sebutkan lokasi ${lokasi || ""} secara natural.",
    "keunggulan": ["keunggulan 1 (max 4 kata)", "keunggulan 2", "keunggulan 3", "keunggulan 4"]
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
- SEO metaDescription HARUS max 155 karakter dan persuasif`;

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
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
        } catch (err) {
          controller.error(err);
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
