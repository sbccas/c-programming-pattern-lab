import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query. When matchMedia is unavailable (tests, very
 * old browsers) it returns `fallback`.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : fallback);
  return useSyncExternalStore(subscribe, get, () => fallback);
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)', false);
