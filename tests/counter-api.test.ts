import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST, redisConfig } from '../api/counter';

/** Fake Upstash REST pipeline: keeps counters in memory and records every command. */
function fakeRedis(start: Record<string, number> = {}) {
  const store = new Map<string, number>(Object.entries(start));
  const calls: { url: string; auth: string | null; commands: string[][] }[] = [];
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    const commands = JSON.parse(String(init.body)) as string[][];
    calls.push({ url, auth: new Headers(init.headers).get('Authorization'), commands });
    const results = commands.map(([cmd, key]) => {
      if (cmd === 'INCR') {
        store.set(key!, (store.get(key!) ?? 0) + 1);
        return { result: store.get(key!) };
      }
      if (cmd === 'GET') return { result: store.has(key!) ? String(store.get(key!)) : null };
      return { error: `unsupported ${cmd}` };
    });
    return new Response(JSON.stringify(results), { status: 200 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { store, calls, fetchMock };
}

const post = (body?: unknown) =>
  POST(new Request('https://example.test/api/counter', { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }));

describe('/api/counter', () => {
  beforeEach(() => {
    vi.stubEnv('KV_REST_API_URL', 'https://redis.example.test/');
    vi.stubEnv('KV_REST_API_TOKEN', 'test-token');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reports "not configured" (and stores nothing) until the database is connected', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');
    const { fetchMock } = fakeRedis();
    for (const res of [await GET(), await post({ newDevice: true })]) {
      expect(await res.json()).toEqual({ configured: false, visits: 0, devices: 0 });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts both Vercel Marketplace variable names', () => {
    expect(redisConfig({ KV_REST_API_URL: 'https://a/', KV_REST_API_TOKEN: 't' })).toEqual({ url: 'https://a', token: 't' });
    expect(redisConfig({ UPSTASH_REDIS_REST_URL: 'https://b', UPSTASH_REDIS_REST_TOKEN: 'u' })).toEqual({ url: 'https://b', token: 'u' });
    expect(redisConfig({})).toBeNull();
  });

  it('reads with the read-only token when Vercel provides one, and writes with the full token', async () => {
    const env = { KV_REST_API_URL: 'https://r', KV_REST_API_TOKEN: 'full', KV_REST_API_READ_ONLY_TOKEN: 'ro' };
    expect(redisConfig(env, 'read')).toEqual({ url: 'https://r', token: 'ro' });
    expect(redisConfig(env, 'write')).toEqual({ url: 'https://r', token: 'full' });
    expect(redisConfig({ KV_REST_API_URL: 'https://r', KV_REST_API_TOKEN: 'full' }, 'read')!.token).toBe('full');
    expect(redisConfig({ KV_REST_API_URL: 'https://r', KV_REST_API_READ_ONLY_TOKEN: 'ro' }, 'read')).toBeNull();

    vi.stubEnv('KV_REST_API_READ_ONLY_TOKEN', 'read-token');
    const { calls } = fakeRedis({ 'cpl:visits': 1, 'cpl:devices': 1 });
    await GET();
    await post({ newDevice: true });
    expect(calls.map((c) => c.auth)).toEqual(['Bearer read-token', 'Bearer test-token']);
  });

  it('GET only reads the totals', async () => {
    const { calls } = fakeRedis({ 'cpl:visits': 41, 'cpl:devices': 7 });
    const res = await GET();
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(await res.json()).toEqual({ configured: true, visits: 41, devices: 7 });
    expect(calls[0]!.url).toBe('https://redis.example.test/pipeline');
    expect(calls[0]!.auth).toBe('Bearer test-token');
    expect(calls[0]!.commands).toEqual([
      ['GET', 'cpl:visits'],
      ['GET', 'cpl:devices'],
    ]);
  });

  it('POST from a new device counts one visit and one device', async () => {
    const { calls } = fakeRedis({ 'cpl:visits': 41, 'cpl:devices': 7 });
    expect(await (await post({ newDevice: true })).json()).toEqual({ configured: true, visits: 42, devices: 8 });
    expect(calls[0]!.commands).toEqual([
      ['INCR', 'cpl:visits'],
      ['INCR', 'cpl:devices'],
    ]);
  });

  it('POST from a returning device counts only the visit', async () => {
    const { calls } = fakeRedis({ 'cpl:visits': 41, 'cpl:devices': 7 });
    expect(await (await post({ newDevice: false })).json()).toEqual({ configured: true, visits: 42, devices: 7 });
    expect(calls[0]!.commands).toEqual([
      ['INCR', 'cpl:visits'],
      ['GET', 'cpl:devices'],
    ]);
  });

  it('treats a missing or odd body as a returning device (never trusts truthy junk)', async () => {
    const { store } = fakeRedis();
    await post();
    await post({ newDevice: 'yes' });
    await post({ newDevice: 1 });
    expect(store.get('cpl:visits')).toBe(3);
    expect(store.has('cpl:devices')).toBe(false);
  });

  it('starts from zero on a fresh database', async () => {
    fakeRedis();
    expect(await (await GET()).json()).toEqual({ configured: true, visits: 0, devices: 0 });
  });

  it('answers 502 (so the site hides the counter) when the database fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('down', { status: 500 })));
    expect((await GET()).status).toBe(502);
    expect((await post({ newDevice: true })).status).toBe(502);
  });
});
