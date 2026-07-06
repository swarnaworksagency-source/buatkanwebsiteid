import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';

// Proxy internal ke tools ops di VPS (Netdata & Dozzle, bind 127.0.0.1 —
// tidak terekspos publik). Semua request dijaga requireAdminApi, jadi hanya
// admin dengan session Supabase yang bisa akses. Dipakai iframe di /admin.
// Dozzle dijalankan dengan DOZZLE_BASE=/api/ops/logs supaya asset path cocok;
// Netdata menghitung base dari window.location, jadi jalan di subpath apa pun.
const TARGETS: Record<string, string> = {
  netdata: 'http://127.0.0.1:19999',
  logs: 'http://127.0.0.1:9888',
};

const BASE = '/api/ops';

// Header request yang aman diteruskan. Cookie/authorization sengaja TIDAK
// dibawa ke upstream — tools ops tidak butuh dan tidak boleh lihat session user.
const PASSTHROUGH_HEADERS = [
  'accept',
  'accept-language',
  'content-type',
  'cache-control',
  'last-event-id',
];

async function proxyOps(request: Request, params: Promise<{ path: string[] }>) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { path } = await params;
  const [service, ...rest] = path ?? [];
  const target = TARGETS[service];
  if (!target) {
    return NextResponse.json({ error: 'Service ops tidak dikenal.' }, { status: 404 });
  }

  const { search } = new URL(request.url);
  const upstreamUrl = `${target}/${rest.map(encodeURIComponent).join('/')}${search}`;

  const headers = new Headers();
  for (const name of PASSTHROUGH_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
      // @ts-expect-error duplex wajib di Node fetch saat meneruskan body stream
      duplex: 'half',
    });
  } catch {
    return NextResponse.json(
      { error: `Service ${service} tidak bisa dihubungi (hanya tersedia di server produksi).` },
      { status: 502 }
    );
  }

  const resHeaders = new Headers(upstream.headers);
  // fetch sudah men-decompress body — buang header terkait supaya tidak mismatch.
  resHeaders.delete('content-encoding');
  resHeaders.delete('content-length');
  resHeaders.delete('transfer-encoding');
  // Redirect relatif dari upstream harus tetap di bawah prefix proxy.
  const location = resHeaders.get('location');
  if (location && location.startsWith('/')) {
    resHeaders.set('location', `${BASE}/${service}${location}`);
  }

  const body = upstream.status === 204 || upstream.status === 304 ? null : upstream.body;
  return new Response(body, { status: upstream.status, headers: resHeaders });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, ctx: Ctx) {
  return proxyOps(request, ctx.params);
}
export async function POST(request: Request, ctx: Ctx) {
  return proxyOps(request, ctx.params);
}
export async function PUT(request: Request, ctx: Ctx) {
  return proxyOps(request, ctx.params);
}
export async function DELETE(request: Request, ctx: Ctx) {
  return proxyOps(request, ctx.params);
}
