import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/routes';
import { PRODUCTION_HOST, loadVisitorStats, resetVisitorStats } from '../utils/visitorStats';

const PROD = { host: PRODUCTION_HOST, automated: false };

function stubCounter(body: unknown, status = 200) {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async () => new Response(JSON.stringify(body), { status }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
const sentBody = (call: unknown[]) => JSON.parse(String((call[1] as RequestInit).body)) as { newDevice: boolean };

describe('visitor counter (client)', () => {
  it('stays hidden when the counter cannot be reached', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { level: 1 });
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByTestId('visitor-counter')).not.toBeInTheDocument();
  });

  it('shows students and visits (Indian number format) on the home page and in the footer', async () => {
    const fetchMock = stubCounter({ configured: true, visits: 123456, devices: 1234 });
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const counters = await screen.findAllByTestId('visitor-counter');
    expect(counters).toHaveLength(2);
    expect(counters[0]).toHaveAccessibleName('1,234 students have used the lab, 1,23,456 visits in total');
    // jsdom runs on localhost, which is not production: the page only reads, never counts.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![1]).toBeUndefined();
  });

  it('stays hidden while the database is not connected yet', async () => {
    stubCounter({ configured: false, visits: 0, devices: 0 });
    expect(await loadVisitorStats(PROD)).toBeNull();
  });

  it('on production counts a new device once, and a visit once per session', async () => {
    const fetchMock = stubCounter({ configured: true, visits: 10, devices: 3 });

    // First ever visit: POST, new device.
    expect(await loadVisitorStats(PROD)).toEqual({ visits: 10, devices: 3 });
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ method: 'POST' });
    expect(sentBody(fetchMock.mock.calls[0]!)).toEqual({ newDevice: true });

    // Another page in the same session: only reads.
    resetVisitorStats();
    await loadVisitorStats(PROD);
    expect(fetchMock.mock.calls[1]![1]).toBeUndefined();

    // A new session on the same device: counts a visit, not a new device.
    window.sessionStorage.clear();
    resetVisitorStats();
    await loadVisitorStats(PROD);
    expect(sentBody(fetchMock.mock.calls[2]!)).toEqual({ newDevice: false });
  });

  it('never counts automated browsers or other hosts (previews, localhost)', async () => {
    const fetchMock = stubCounter({ configured: true, visits: 1, devices: 1 });
    await loadVisitorStats({ host: PRODUCTION_HOST, automated: true });
    resetVisitorStats();
    await loadVisitorStats({ host: 'c-programming-pattern-lab-git-feature.vercel.app', automated: false });
    expect(fetchMock.mock.calls.every((c) => c[1] === undefined)).toBe(true);
  });

  it('makes only one request per page load, however many counters render', async () => {
    const fetchMock = stubCounter({ configured: true, visits: 5, devices: 2 });
    await Promise.all([loadVisitorStats(PROD), loadVisitorStats(PROD), loadVisitorStats(PROD)]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not mark the browser as counted when the request fails', async () => {
    stubCounter({ error: 'down' }, 502);
    expect(await loadVisitorStats(PROD)).toBeNull();
    const fetchMock = stubCounter({ configured: true, visits: 1, devices: 1 });
    resetVisitorStats();
    await loadVisitorStats(PROD);
    expect(sentBody(fetchMock.mock.calls[0]!)).toEqual({ newDevice: true });
  });
});
