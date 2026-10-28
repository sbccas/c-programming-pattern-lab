import { useCallback, useState } from 'react';
import { readStored, writeStored } from './storage';

/** useState that remembers its value in localStorage (when available). */
export function useStoredState<T>(key: string, fallback: T, isValid: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(() => readStored(key, fallback, isValid));
  const update = useCallback(
    (next: T) => {
      setValue(next);
      writeStored(key, next);
    },
    [key],
  );
  return [value, update] as const;
}
