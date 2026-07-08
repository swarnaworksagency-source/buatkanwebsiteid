import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { wabotQueryJson } from '@/lib/wabot';

// Daftar pengguna Agent Jadwal (yang redeem kode) + info slot aktivasi.
export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const sql = `select json_build_object(
    'users', coalesce((select json_agg(t order by t.created_at desc) from (
       select u.id, u.phone, u.display_name as name, u.status, u.created_at,
         (select count(*)::int from wabot.reminders r where r.user_id = u.id and r.status = 'scheduled') as active_reminders,
         (select count(*)::int from wabot.reminders r where r.user_id = u.id) as total_reminders,
         (select max(m.created_at) from wabot.messages_log m where m.wa_jid = u.wa_jid) as last_activity
       from wabot.users u
    ) t), '[]'::json),
    'slot', (select row_to_json(a) from (
       select used_count, max_uses from wabot.activation_codes where code = 'buatkanweb123'
    ) a)
  )`;

  const data = await wabotQueryJson<{ users: unknown[]; slot: unknown }>(sql, { users: [], slot: null });
  return NextResponse.json(data);
}
