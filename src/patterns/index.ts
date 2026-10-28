import { diamond } from './diamond';
import { invertedNumberTriangle } from './invertedNumberTriangle';
import { invertedPyramid } from './invertedPyramid';
import { invertedTriangle } from './invertedTriangle';
import { numberPyramid } from './numberPyramid';
import { numberTriangle } from './numberTriangle';
import { oddPyramid } from './oddPyramid';
import { rectangle } from './rectangle';
import { repeatedRowNumber } from './repeatedRowNumber';
import { square } from './square';
import { starPyramid } from './starPyramid';
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
  starPyramid,
  numberPyramid,
  oddPyramid,
  invertedPyramid,
  diamond,
];

export const FEATURED_PATTERN_IDS = ['star-triangle', 'star-pyramid', 'diamond'] as const;

export function getPattern(id: string | undefined): PatternDefinition | undefined {
  return PATTERNS.find((p) => p.id === id);
}

export function getNeighbours(id: string): { previous?: PatternDefinition; next?: PatternDefinition } {
  const index = PATTERNS.findIndex((p) => p.id === id);
  if (index < 0) return {};
  return { previous: PATTERNS[index - 1], next: PATTERNS[index + 1] };
}
