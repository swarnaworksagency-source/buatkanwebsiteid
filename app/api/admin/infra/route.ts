import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, stat } from 'fs/promises';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import { requireAdminApi } from '@/lib/auth';

const execAsync = promisify(exec);

// Status infra VPS untuk panel admin: PM2, container Docker, disk, RAM, uptime,
// dan backup terakhir. App berjalan di VPS yang sama (PM2, user buatkanweb),
// jadi cukup exec perintah read-only lokal. Semua perintah string tetap — tidak
// ada input user yang masuk ke shell. Tiap item best-effort: gagal → null,
// bukan error 500 (di dev Windows semua item memang null).
export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const run = async (cmd: string): Promise<string | null> => {
    try {
      const { stdout } = await execAsync(cmd, { timeout: 8000, maxBuffer: 8 * 1024 * 1024 });
      return stdout;
    } catch {
      return null;
    }
  };

  const [pm2Raw, dockerRaw, dfRaw, memRaw, uptimeRaw, backup] = await Promise.all([
    run('pm2 jlist'),
    run('docker ps -a --format "{{.Names}}\t{{.State}}\t{{.Status}}"'),
    run('df -kP /'),
    run('free -b'),
    readFile('/proc/uptime', 'utf8').catch(() => null),
    latestBackup(),
  ]);

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    pm2: parsePm2(pm2Raw),
    docker: parseDocker(dockerRaw),
    disk: parseDf(dfRaw),
    memory: parseFree(memRaw),
    uptimeSeconds: uptimeRaw ? Math.floor(parseFloat(uptimeRaw)) : null,
    backup,
  });
}

interface Pm2Proc {
  name: string;
  status: string;
  cpu: number;
  memoryBytes: number;
  restarts: number;
  uptimeMs: number;
}

function parsePm2(raw: string | null): Pm2Proc[] | null {
  if (!raw) return null;
  try {
    // pm2 kadang menyisipkan log sebelum JSON — ambil mulai dari '[' pertama.
    const jsonStart = raw.indexOf('[');
    if (jsonStart === -1) return null;
    const list = JSON.parse(raw.slice(jsonStart)) as Array<{
      name: string;
      pm2_env?: { status?: string; restart_time?: number; pm_uptime?: number };
      monit?: { cpu?: number; memory?: number };
    }>;
    return list.map((p) => ({
      name: p.name,
      status: p.pm2_env?.status ?? 'unknown',
      cpu: p.monit?.cpu ?? 0,
      memoryBytes: p.monit?.memory ?? 0,
      restarts: p.pm2_env?.restart_time ?? 0,
      uptimeMs: p.pm2_env?.pm_uptime ? Date.now() - p.pm2_env.pm_uptime : 0,
    }));
  } catch {
    return null;
  }
}

interface DockerContainer {
  name: string;
  state: string;
  status: string;
}

function parseDocker(raw: string | null): DockerContainer[] | null {
  if (!raw) return null;
  const rows = raw
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [name, state, status] = line.split('\t');
      return { name: name ?? '', state: state ?? '', status: status ?? '' };
    });
  return rows.length > 0 ? rows : null;
}

interface DiskInfo {
  totalBytes: number;
  usedBytes: number;
  availBytes: number;
  usedPercent: number;
}

function parseDf(raw: string | null): DiskInfo | null {
  if (!raw) return null;
  const lines = raw.trim().split('\n');
  const cols = lines[lines.length - 1]?.split(/\s+/);
  if (!cols || cols.length < 5) return null;
  const totalBytes = Number(cols[1]) * 1024;
  const usedBytes = Number(cols[2]) * 1024;
  const availBytes = Number(cols[3]) * 1024;
  if (!Number.isFinite(totalBytes) || totalBytes <= 0) return null;
  return {
    totalBytes,
    usedBytes,
    availBytes,
    usedPercent: Math.round((usedBytes / totalBytes) * 100),
  };
}

interface MemInfo {
  totalBytes: number;
  usedBytes: number;
  availBytes: number;
  usedPercent: number;
}

function parseFree(raw: string | null): MemInfo | null {
  if (!raw) return null;
  const memLine = raw.split('\n').find((l) => l.startsWith('Mem:'));
  const cols = memLine?.split(/\s+/);
  if (!cols || cols.length < 7) return null;
  const totalBytes = Number(cols[1]);
  const availBytes = Number(cols[6]);
  const usedBytes = totalBytes - availBytes;
  if (!Number.isFinite(totalBytes) || totalBytes <= 0) return null;
  return {
    totalBytes,
    usedBytes,
    availBytes,
    usedPercent: Math.round((usedBytes / totalBytes) * 100),
  };
}

interface BackupInfo {
  fileName: string;
  sizeBytes: number;
  modifiedAt: string;
  count: number;
}

// File backup terbaru dari ~/Soni/backups (cron 02:30 WIB, retensi 7 hari).
async function latestBackup(): Promise<BackupInfo | null> {
  try {
    const dir = join(homedir(), 'Soni', 'backups');
    const names = await readdir(dir);
    if (names.length === 0) return null;
    const stats = await Promise.all(
      names.map(async (name) => {
        const s = await stat(join(dir, name));
        return { name, size: s.size, mtime: s.mtime, isFile: s.isFile() };
      })
    );
    const files = stats.filter((f) => f.isFile);
    if (files.length === 0) return null;
    files.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    return {
      fileName: files[0].name,
      sizeBytes: files[0].size,
      modifiedAt: files[0].mtime.toISOString(),
      count: files.length,
    };
  } catch {
    return null;
  }
}
