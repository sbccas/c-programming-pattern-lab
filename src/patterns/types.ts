import type { ExecutablePattern } from '../engine/executePattern';
import type { ParamValues } from '../engine/types';
import type { QuizQuestion } from '../quiz/types';

export type Difficulty = 'Beginner' | 'Easy' | 'Moderate' | 'Challenging';

export type Category = 'Basic repetition' | 'Increasing patterns' | 'Decreasing patterns' | 'Pyramids & diamonds';

export const CATEGORIES: readonly Category[] = ['Basic repetition', 'Increasing patterns', 'Decreasing patterns', 'Pyramids & diamonds'];
export const DIFFICULTIES: readonly Difficulty[] = ['Beginner', 'Easy', 'Moderate', 'Challenging'];

/**
 * One "How the program works" card. The code shown on the card is taken from
 * the rendered program, never typed by hand:
 * - `loopId`: shows that loop's header, e.g. `for (j = 1; j <= 4 - i; j++)`;
 * - `partId`: shows one statement, e.g. `printf("* ");`.
 */
export interface ExplanationCard {
  title: string;
  text: string;
  loopId?: string;
  partId?: string;
}

export interface PatternDefinition extends ExecutablePattern {
  title: string;
  /** One-sentence description for cards. */
  summary: string;
  description: string;
  category: Category;
  level: 1 | 2 | 3 | 4;
  difficulty: Difficulty;
  /** The main learning objective (one sentence). */
  objective: string;
  /** Detailed learning goals. */
  goals: string[];
  /**
   * Output for the default parameters, written out by hand.
   * Tests check that the engine produces exactly this text.
   */
  expectedOutput: string;
  /** Plain-English explanation of each part of the program, for the chosen parameters. */
  explain: (params: ParamValues) => ExplanationCard[];
  /** What each variable does, shown in the variables panel (e.g. `{ j: 'spaces loop' }`). */
  variableRoles?: Readonly<Record<string, string>>;
  /** Assumptions or limits worth telling students. */
  notes: string[];
  quiz: QuizQuestion[];
}
