import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { clearProgressCache } from '../utils/progress';
import { resetVisitorStats } from '../utils/visitorStats';

// No real network in tests: the visitor counter's request fails, so it stays hidden
// unless a test stubs fetch itself.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network is disabled in tests'))));
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  clearProgressCache();
  resetVisitorStats();
  vi.unstubAllGlobals();
});

// jsdom does not implement these; components call them defensively.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
window.scrollTo = (() => {}) as typeof window.scrollTo;
