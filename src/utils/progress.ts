import { useCallback, useSyncExternalStore } from 'react';
import { isStringArray, readStored, removeStored, writeStored } from './storage';

/**
 * Local progress (this device only): which simulations were run to the end
 * and which quiz questions were answered correctly.
 */
const KEYS = { completed: 'completed-patterns', quiz: 'quiz-correct' } as const;
type ProgressKey = keyof typeof KEYS;

const listeners = new Set<() => void>();
const cache: Partial<Record<ProgressKey, string[]>> = {};

function read(key: ProgressKey): string[] {
  if (!cache[key]) cache[key] = readStored(KEYS[key], [], isStringArray);
  return cache[key]!;
}

function add(key: ProgressKey, id: string) {
  const current = read(key);
  if (current.includes(id)) return;
  cache[key] = [...current, id];
  writeStored(KEYS[key], cache[key]);
  listeners.forEach((l) => l());
}

export function resetProgress() {
  for (const key of Object.keys(KEYS) as ProgressKey[]) {
    removeStored(KEYS[key]);
    cache[key] = [];
  }
  listeners.forEach((l) => l());
}

/** Test helper: forget the in-memory cache so storage is read again. */
export function clearProgressCache() {
  for (const key of Object.keys(KEYS) as ProgressKey[]) delete cache[key];
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useProgressList(key: ProgressKey) {
  const list = useSyncExternalStore(subscribe, () => read(key), () => read(key));
  const mark = useCallback((id: string) => add(key, id), [key]);
  return [list, mark] as const;
}

export const useCompletedPatterns = () => useProgressList('completed');
export const useCorrectQuizAnswers = () => useProgressList('quiz');
