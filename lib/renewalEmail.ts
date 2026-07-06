// Email pengingat perpanjangan — dikirim via Resend HTTP API (RESEND_API_KEY,
// sama dengan kunci SMTP GoTrue). HTML table-based + inline style supaya aman
// di Gmail/Outlook/dll. Dipakai oleh /api/cron/expiry.

export type ReminderKind = 'h7' | 'h3' | 'h1' | 'expired';

interface ReminderCopy {
  subject: (domain: string) => string;
  badge: string;
  headline: string;
  sub: (domain: string, expiresStr: string) => string;
  cta: string;
  accent: string; // warna aksen header & badge
}

const COPY: Record<ReminderKind, ReminderCopy> = {
  h7: {
    subject: (d) => `⏳ 7 hari lagi — jangan biarkan ${d} tidur`,
    badge: 'SISA 7 HARI',
    headline: 'Masa aktif website kamu hampir habis',
    sub: (d, e) =>
      `Website <strong>${d}</strong> aktif sampai <strong>${e}</strong>. Perpanjang sekarang biar pelanggan tetap bisa menemukanmu — tanpa jeda, tanpa ribet.`,
    cta: 'Perpanjang Sekarang',
    accent: '#67BAF4',
  },
  h3: {
    subject: (d) => `⚠️ 3 hari lagi masa aktif ${d} habis`,
    badge: 'SISA 3 HARI',
    headline: 'Waktunya makin mepet nih…',
    sub: (d, e) =>
      `Tinggal <strong>3 hari</strong> sebelum <strong>${d}</strong> nonaktif (${e}). Kalau website mati, pelanggan yang cari kamu di Google bakal nyasar ke kompetitor. Yuk amankan sekarang.`,
    cta: 'Amankan Website Saya',
    accent: '#F59E0B',
  },
  h1: {
    subject: (d) => `🚨 BESOK ${d} nonaktif — perpanjang sekarang`,
    badge: 'HARI TERAKHIR',
    headline: 'Besok website kamu offline!',
    sub: (d, e) =>
      `Ini pengingat terakhir — <strong>${d}</strong> akan nonaktif <strong>${e}</strong>. Satu menit sekarang menyelamatkan semua calon pelanggan yang datang besok.`,
    cta: 'Perpanjang Detik Ini',
    accent: '#EF4444',
  },
  expired: {
    subject: (d) => `😢 ${d} sudah nonaktif — aktifkan lagi dalam 1 menit`,
    badge: 'NONAKTIF',
    headline: 'Website kamu sedang offline',
    sub: (d) =>
      `Masa aktif <strong>${d}</strong> sudah habis dan pengunjung tidak bisa membukanya. Kabar baiknya: semua data & desainmu aman. Perpanjang sekarang dan website langsung tayang lagi.`,
    cta: 'Aktifkan Kembali',
    accent: '#EF4444',
  },
};

export function buildReminderEmail(opts: {
  kind: ReminderKind;
  domain: string;
  namaUsaha: string | null;
  expiresAt: Date;
}): { subject: string; html: string } {
  const { kind, domain, namaUsaha } = opts;
  const c = COPY[kind];
  const expiresStr = opts.expiresAt.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dashboardUrl = 'https://www.buatkanweb.id/dashboard';

  const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f7;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1E466B 0%,#67BAF4 100%);background-color:#1E466B;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">BuatkanWeb<span style="color:#cfe9ff;">.id</span></span>
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:#ffffff;padding:36px 32px 28px;">
          <div style="text-align:center;">
            <span style="display:inline-block;background-color:${c.accent}1A;color:${c.accent};font-size:11px;font-weight:800;letter-spacing:2px;padding:6px 14px;border-radius:999px;border:1px solid ${c.accent}40;">${c.badge}</span>
            <h1 style="margin:18px 0 10px;color:#1e293b;font-size:24px;line-height:1.3;font-weight:800;">${c.headline}</h1>
            <p style="margin:0 auto;max-width:440px;color:#475569;font-size:14px;line-height:1.7;">${c.sub(domain, expiresStr)}</p>
          </div>

          <!-- Domain card -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0;">
            <tr><td style="background-color:#f5f8fb;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;text-align:center;">
              ${namaUsaha ? `<div style="color:#64748b;font-size:12px;margin-bottom:4px;">${namaUsaha}</div>` : ''}
              <div style="color:#1E466B;font-size:17px;font-weight:700;">${domain}</div>
              <div style="color:#94a3b8;font-size:12px;margin-top:6px;">${kind === 'expired' ? 'Nonaktif sejak' : 'Aktif sampai'} ${expiresStr}</div>
            </td></tr>
          </table>

          <!-- Harga -->
          <p style="text-align:center;color:#475569;font-size:14px;margin:0 0 22px;">
            Perpanjang cuma <strong style="color:#1e293b;">Rp50.000/bulan</strong> — lebih murah dari sekali makan bareng klien 😄
          </p>

          <!-- CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${dashboardUrl}" style="display:inline-block;background-color:#1E466B;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:12px;">${c.cta} →</a>
            </td></tr>
          </table>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin:14px 0 0;">
            Buka <a href="${dashboardUrl}" style="color:#1E466B;">dashboard</a> → pilih website → klik <strong>Perpanjang</strong>. Selesai dalam 1 menit.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#f8fafc;border-radius:0 0 16px 16px;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
            Email ini dikirim otomatis karena kamu punya website di BuatkanWeb.id.<br>
            © ${new Date().getFullYear()} BuatkanWeb.id — Website UMKM jadi dalam hitungan menit.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: c.subject(domain), html };
}

// Kirim via Resend HTTP API. Return true kalau sukses (status 2xx).
export async function sendReminderEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY belum diset — email pengingat dilewati.');
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BuatkanWeb.id <noreply@buatkanweb.id>',
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('Resend fetch error:', e);
    return false;
  }
}
