import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { wabotQueryJson, UUID_RE } from '@/lib/wabot';

// Log satu pengguna Agent: reminder yang dijadwalkan + riwayat pesan (in/out).
export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const userId = new URL(request.url).searchParams.get('userId') || '';
  if (!UUID_RE.test(userId)) {
    return NextResponse.json({ error: 'userId tidak valid.' }, { status: 400 });
  }

  const sql = `select json_build_object(
    'reminders', coalesce((select json_agg(r order by r.created_at desc) from (
       select id, title, recurrence, next_run_at, status, source_text, created_at
       from wabot.reminders where user_id = '${userId}'
    ) r), '[]'::json),
    'messages', coalesce((select json_agg(m) from (
       select direction, body, created_at
       from wabot.messages_log
       where wa_jid = (select wa_jid from wabot.users where id = '${userId}')
       order by id desc limit 100
    ) m), '[]'::json)
  )`;

  const data = await wabotQueryJson<{ reminders: unknown[]; messages: unknown[] }>(sql, {
    reminders: [],
    messages: [],
  });
  return NextResponse.json(data);
}
