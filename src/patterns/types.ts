import type { ExecutablePattern } from '../engine/executePattern';
import type { ParamValues } from '../engine/types';
import type { QuizQuestion } from '../quiz/types';

export type Difficulty = 'Beginner' | 'Easy' | 'Moderate';

export type Category = 'Basic repetition' | 'Increasing patterns' | 'Decreasing patterns';

export const CATEGORIES: readonly Category[] = ['Basic repetition', 'Increasing patterns', 'Decreasing patterns'];
export const DIFFICULTIES: readonly Difficulty[] = ['Beginner', 'Easy', 'Moderate'];

/** Plain-English explanation of each part of the program, for the chosen parameters. */
export interface PatternExplanation {
  outerLoop: string;
  innerLoop: string;
  output: string;
  newline: string;
}

export interface PatternDefinition extends ExecutablePattern {
  title: string;
  /** One-sentence description for cards. */
  summary: string;
  description: string;
  category: Category;
  level: 1 | 2 | 3;
  difficulty: Difficulty;
  /** The main learning objective (one sentence). */
  objective: string;
  /** Detailed learning goals. */
  goals: string[];
  /**
   * Output for the default parameters, written out by hand from the PRD.
   * Tests check that the engine produces exactly this text.
   */
  expectedOutput: string;
  explain: (params: ParamValues) => PatternExplanation;
  /** Assumptions or limits worth telling students. */
  notes: string[];
  quiz: QuizQuestion[];
}
