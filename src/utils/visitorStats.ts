import { useEffect, useState } from 'react';
import { STORAGE_PREFIX } from './storage';

/**
 * Public visitor counter (client side). See `api/counter.ts` for the server.
 *
 * - Only the production site counts. Previews, localhost and automated
 *   browsers (navigator.webdriver) only read the totals.
 * - A device is counted once, ever (flag in localStorage).
 * - A visit is counted once per browser session (flag in sessionStorage).
 * - Nothing personal is sent: the request body is just `{ "newDevice": true|false }`.
 * - Any failure (no database yet, offline, local dev) hides the counter.
 */
export const PRODUCTION_HOST = 'c-programming-pattern-lab.vercel.app';
export const COUNTER_ENDPOINT = '/api/counter';
const DEVICE_FLAG = `${STORAGE_PREFIX}device-counted`;
const VISIT_FLAG = `${STORAGE_PREFIX}visit-counted`;

export interface VisitorStats {
  visits: number;
  devices: number;
}

const readFlag = (store: () => Storage, key: string): boolean => {
  try {
    return store().getItem(key) === '1';
  } catch {
    return false;
  }
};
const writeFlag = (store: () => Storage, key: string) => {
  try {
    store().setItem(key, '1');
  } catch {
    // Storage blocked: this browser may be counted again next time.
  }
};
const local = () => window.localStorage;
const session = () => window.sessionStorage;

export interface CountingEnv {
  host: string;
  /** True in automated browsers (tests, screenshot tools, crawlers that announce it). */
  automated: boolean;
}

const currentEnv = (): CountingEnv => ({ host: window.location.hostname, automated: navigator.webdriver === true });

export function shouldCount(env: CountingEnv = currentEnv()): boolean {
  return env.host === PRODUCTION_HOST && !env.automated;
}

let pending: Promise<VisitorStats | null> | null = null;

/** Count this visit (when appropriate) and return the totals. One request per page load. */
export function loadVisitorStats(env: CountingEnv = currentEnv()): Promise<VisitorStats | null> {
  if (pending) return pending;
  pending = (async () => {
    try {
      const counting = shouldCount(env) && !readFlag(session, VISIT_FLAG);
      const newDevice = counting && !readFlag(local, DEVICE_FLAG);
      const res = counting
        ? await fetch(COUNTER_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newDevice }),
          })
        : await fetch(COUNTER_ENDPOINT);
      if (!res.ok) return null;
      const data = (await res.json()) as Partial<VisitorStats> & { configured?: boolean };
      if (!data.configured || typeof data.visits !== 'number' || typeof data.devices !== 'number') return null;
      if (counting) {
        writeFlag(session, VISIT_FLAG);
        if (newDevice) writeFlag(local, DEVICE_FLAG);
      }
      return { visits: data.visits, devices: data.devices };
    } catch {
      return null;
    }
  })();
  return pending;
}

/** Test helper: forget the cached request. */
export function resetVisitorStats() {
  pending = null;
}

/** Totals for display, or null while loading / when the counter is unavailable. */
export function useVisitorStats(): VisitorStats | null {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  useEffect(() => {
    let alive = true;
    void loadVisitorStats().then((s) => {
      if (alive) setStats(s);
    });
    return () => {
      alive = false;
    };
  }, []);
  return stats;
}

export const formatCount = (n: number) => n.toLocaleString('en-IN');
