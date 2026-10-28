import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { clearProgressCache } from '../utils/progress';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  clearProgressCache();
});

// jsdom does not implement these; components call them defensively.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
window.scrollTo = (() => {}) as typeof window.scrollTo;
