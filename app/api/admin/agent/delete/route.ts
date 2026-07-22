import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { wabotExec, UUID_RE } from '@/lib/wabot';

// Hapus pengguna Agent Jadwal: buang pesan + reminder (cascade), lalu kembalikan
// satu slot aktivasi supaya bisa diisi orang lain.
export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  const userId: string = body?.userId || '';
  if (!UUID_RE.test(userId)) {
    return NextResponse.json({ error: 'userId tidak valid.' }, { status: 400 });
  }

  // Urutan: hapus log (by wa_jid) → kembalikan slot bila user memang ada →
  // hapus user (reminders ikut cascade via FK ON DELETE CASCADE).
  const sql = [
    `delete from wabot.messages_log where wa_jid = (select wa_jid from wabot.users where id = '${userId}')`,
    `update wabot.activation_codes set used_count = greatest(used_count - 1, 0) where code = 'webinarBW' and exists (select 1 from wabot.users where id = '${userId}')`,
    `delete from wabot.users where id = '${userId}'`,
  ].join('; ');

  try {
    await wabotExec(sql);
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus pengguna agent.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
