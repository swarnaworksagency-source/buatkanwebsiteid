import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// Upload aset (logo/foto/portofolio) ke Supabase Storage DARI SERVER memakai service-role.
//
// Kenapa server-side: storage-api menolak INSERT object dari client yang sudah login
// (mengembalikan "new row violates row-level security policy") setelah perubahan
// kebijakan/JWT di sisi platform — token user tidak lagi diterima storage-api walau
// valid di GoTrue. Daripada bergantung pada RLS storage-api, upload dilakukan di server
// dengan service-role (bypass RLS), TAPI digerbang ketat: wajib user login (cookie
// session) + folder di-whitelist + nama file diawali user.id. File hanya boleh gambar.

const BUCKET = "website-assets";
const ALLOWED_FOLDERS = new Set(["logos", "foto-bisnis", "portofolio"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB (gambar sudah dikompres WebP di client)

export async function POST(request: NextRequest) {
  try {
    // Gate: wajib user login. Pakai cookie session (RLS-aware client) hanya untuk auth.
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Anda harus login." }, { status: 401 });
    }

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    const folder = String(form?.get("folder") || "");

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ error: "Folder tidak valid." }, { status: 400 });
    }
    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ error: "File tidak ada." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Ukuran file melebihi 8MB." }, { status: 413 });
    }
    const contentType = file.type || "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Hanya file gambar yang diperbolehkan." }, { status: 415 });
    }

    const ext = (file instanceof File ? file.name.split(".").pop() : "") || "webp";
    const path = `${folder}/${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Service-role: bypass RLS storage. JANGAN pernah ekspos key ini ke client.
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { upsert: true, contentType });

    if (uploadError) {
      console.error("Server upload error:", uploadError);
      return NextResponse.json({ error: "Gagal menyimpan file." }, { status: 500 });
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e: any) {
    console.error("Upload route error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan saat upload." }, { status: 500 });
  }
}
