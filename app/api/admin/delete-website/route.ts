import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { adminClient } from '@/lib/ip';
import { websiteIdSchema } from '@/lib/validations';

// Hapus website mana pun (tanpa cek kepemilikan — khusus admin).
// Pola sama dengan /api/website/delete: payment di-soft-delete + dilepas
// dari website (audit tetap tersimpan), lalu website di-hard-delete.
export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const parsed = websiteIdSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'websiteId tidak valid.' }, { status: 400 });
  }
  const { websiteId } = parsed.data;

  const admin = adminClient();

  const { data: website, error: getErr } = await admin
    .from('websites')
    .select('id, subdomain, status')
    .eq('id', websiteId)
    .single();
  if (getErr || !website) {
    return NextResponse.json({ error: 'Website tidak ditemukan.' }, { status: 404 });
  }

  await admin
    .from('payments')
    .update({ deleted_at: new Date().toISOString(), website_id: null })
    .eq('website_id', websiteId);

  const { error: delErr } = await admin.from('websites').delete().eq('id', websiteId);
  if (delErr) {
    console.error('Admin website delete error:', delErr);
    return NextResponse.json({ error: 'Gagal menghapus website.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, subdomain: website.subdomain });
}
