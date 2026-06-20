import { createClient } from '@supabase/supabase-js';

// Ambil IP klien dari header proxy (Vercel set x-forwarded-for). Ambil IP pertama.
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

// Service-role client (bypass RLS). banned_ips & signup_attempts hanya disentuh server.
export function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface BanRecord {
  ip: string;
  reason: string | null;
  expires_at: string | null;
}

// Kembalikan record ban kalau IP sedang diblokir (belum expired), else null.
export async function getActiveBan(ip: string): Promise<BanRecord | null> {
  if (!ip || ip === 'unknown') return null;
  const supabase = adminClient();
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from('banned_ips')
    .select('ip, reason, expires_at')
    .eq('ip', ip)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .limit(1)
    .maybeSingle();
  return (data as BanRecord) || null;
}

// Auto-ban: tiap kali IP kena rate-limit, catat 1 strike. Kalau strike dalam
// 1 jam terakhir >= STRIKE_BAN_THRESHOLD, ban IP selama AUTO_BAN_HOURS jam.
const STRIKE_WINDOW_MIN = 60;
const STRIKE_BAN_THRESHOLD = 5;
const AUTO_BAN_HOURS = 1;

// Catat strike & ban otomatis kalau melewati ambang. Return true kalau IP kini terblokir.
// Best-effort: error DB di-log, tak melempar (jangan ganggu alur utama).
export async function recordStrikeAndMaybeBan(ip: string, kind: string): Promise<boolean> {
  if (!ip || ip === 'unknown') return false;
  const supabase = adminClient();

  const { error: insErr } = await supabase.from('rate_limit_hits').insert({ ip, kind });
  if (insErr) {
    console.error('rate_limit_hits insert error:', insErr);
    return false;
  }

  const windowStart = new Date(Date.now() - STRIKE_WINDOW_MIN * 60_000).toISOString();
  const { count, error: cntErr } = await supabase
    .from('rate_limit_hits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', windowStart);
  if (cntErr) {
    console.error('rate_limit_hits count error:', cntErr);
    return false;
  }

  if ((count ?? 0) < STRIKE_BAN_THRESHOLD) return false;

  // Jangan timpa ban manual/permanen yang masih aktif.
  if (await getActiveBan(ip)) return true;

  const expiresAt = new Date(Date.now() + AUTO_BAN_HOURS * 3_600_000).toISOString();
  const { error: banErr } = await supabase
    .from('banned_ips')
    .upsert(
      { ip, reason: `Auto-ban: ${STRIKE_BAN_THRESHOLD}x rate-limit dalam ${STRIKE_WINDOW_MIN} menit`, expires_at: expiresAt },
      { onConflict: 'ip' }
    );
  if (banErr) {
    console.error('auto-ban upsert error:', banErr);
    return false;
  }
  return true;
}
