/**
 * Public visitor counter — a Vercel Function (deployed from /api).
 *
 *   GET  /api/counter                         → { configured, visits, devices }
 *   POST /api/counter  { "newDevice": true }  → counts one visit (and one device) and returns the totals
 *
 * Privacy: only two integers are stored (total visits, total devices).
 * No cookies, IP addresses, names or user agents are stored. Whether a browser
 * was already counted is remembered in that browser's own localStorage.
 *
 * Storage: Upstash Redis via its REST API, connected from the Vercel Marketplace.
 * Until the database is connected the endpoint answers `configured: false`
 * and the site simply hides the counter.
 */

const VISITS_KEY = 'cpl:visits';
const DEVICES_KEY = 'cpl:devices';

export interface CounterStats {
  configured: boolean;
  visits: number;
  devices: number;
}

interface RedisConfig {
  url: string;
  token: string;
}

/**
 * Redis REST credentials. The Vercel Marketplace integration may name the
 * variables either way. Reads use the read-only token when one exists, so
 * the frequent GET requests can never change the counters.
 */
export function redisConfig(
  env: Record<string, string | undefined> = process.env,
  access: 'read' | 'write' = 'write',
): RedisConfig | null {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const writeToken = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  const readToken = env.KV_REST_API_READ_ONLY_TOKEN || env.UPSTASH_REDIS_REST_READ_ONLY_TOKEN;
  const token = access === 'read' ? readToken || writeToken : writeToken;
  // Writes need the full token; without one the counter is treated as not configured.
  if (!url || !writeToken || !token) return null;
  return { url: url.replace(/\/+$/, ''), token };
}

/** Run several Redis commands in one round trip (Upstash REST pipeline). */
async function pipeline(config: RedisConfig, commands: (string | number)[][]): Promise<unknown[]> {
  const res = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis responded ${res.status}`);
  const rows = (await res.json()) as { result?: unknown; error?: string }[];
  return rows.map((row) => {
    if (row.error) throw new Error(row.error);
    return row.result;
  });
}

const toCount = (value: unknown): number => {
  const n = typeof value === 'number' ? value : Number.parseInt(String(value ?? '0'), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Never cache: the numbers change with every visit.
      'Cache-Control': 'no-store',
    },
  });

const notConfigured = () => json({ configured: false, visits: 0, devices: 0 } satisfies CounterStats);

export async function GET(): Promise<Response> {
  const config = redisConfig(process.env, 'read');
  if (!config) return notConfigured();
  try {
    const [visits, devices] = await pipeline(config, [
      ['GET', VISITS_KEY],
      ['GET', DEVICES_KEY],
    ]);
    return json({ configured: true, visits: toCount(visits), devices: toCount(devices) } satisfies CounterStats);
  } catch {
    return json({ error: 'Counter unavailable' }, 502);
  }
}

export async function POST(request: Request): Promise<Response> {
  const config = redisConfig();
  if (!config) return notConfigured();

  let newDevice = false;
  try {
    const body = (await request.json()) as { newDevice?: unknown };
    newDevice = body?.newDevice === true;
  } catch {
    // An empty or invalid body counts as a visit from a known device.
  }

  try {
    const commands: (string | number)[][] = [['INCR', VISITS_KEY], newDevice ? ['INCR', DEVICES_KEY] : ['GET', DEVICES_KEY]];
    const [visits, devices] = await pipeline(config, commands);
    return json({ configured: true, visits: toCount(visits), devices: toCount(devices) } satisfies CounterStats);
  } catch {
    return json({ error: 'Counter unavailable' }, 502);
  }
}
