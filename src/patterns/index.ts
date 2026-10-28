import { invertedNumberTriangle } from './invertedNumberTriangle';
import { invertedTriangle } from './invertedTriangle';
import { numberTriangle } from './numberTriangle';
import { rectangle } from './rectangle';
import { repeatedRowNumber } from './repeatedRowNumber';
import { square } from './square';
import { starTriangle } from './starTriangle';
import type { PatternDefinition } from './types';

/** All published patterns, in teaching order. */
export const PATTERNS: readonly PatternDefinition[] = [
  rectangle,
  square,
  repeatedRowNumber,
  starTriangle,
  numberTriangle,
  invertedTriangle,
  invertedNumberTriangle,
];

export const FEATURED_PATTERN_IDS = ['star-triangle', 'rectangle', 'number-triangle'] as const;

export function getPattern(id: string | undefined): PatternDefinition | undefined {
  return PATTERNS.find((p) => p.id === id);
}

export function getNeighbours(id: string): { previous?: PatternDefinition; next?: PatternDefinition } {
  const index = PATTERNS.findIndex((p) => p.id === id);
  if (index < 0) return {};
  return { previous: PATTERNS[index - 1], next: PATTERNS[index + 1] };
}
