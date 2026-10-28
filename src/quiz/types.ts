export type QuizKind =
  | 'predict-row'
  | 'next-value'
  | 'condition'
  | 'iterations'
  | 'choose-condition'
  | 'identify-output'
  | 'spot-mistake';

export const QUIZ_KIND_LABELS: Record<QuizKind, string> = {
  'predict-row': 'Predict the next row',
  'next-value': 'Predict the next value',
  condition: 'Evaluate a condition',
  iterations: 'Count the iterations',
  'choose-condition': 'Choose the loop condition',
  'identify-output': 'Identify the output',
  'spot-mistake': 'Spot the mistake',
};

export interface QuizOption {
  id: string;
  label: string;
  /** Render the label as monospace pre-formatted text (code or program output). */
  mono?: boolean;
}

/**
 * Optional link to the simulator so tests can prove the answer is right.
 * - `final-output`: the correct option is the complete program output.
 * - `row`: the correct option is output row `row` (1-based, trailing space trimmed).
 * - `inner-iterations`: the correct option is how many times the inner body runs on outer pass `row`.
 * - `total-symbols`: the correct option is the number of printf symbol calls in the whole run.
 */
export type QuizVerification =
  | { kind: 'final-output'; patternId: string; params: Record<string, number> }
  | { kind: 'row'; patternId: string; params: Record<string, number>; row: number }
  | { kind: 'inner-iterations'; patternId: string; params: Record<string, number>; row: number }
  | { kind: 'total-symbols'; patternId: string; params: Record<string, number> };

export interface QuizQuestion {
  id: string;
  kind: QuizKind;
  prompt: string;
  /** Optional C code or program output shown with the question. */
  code?: string;
  options: QuizOption[];
  answerId: string;
  /** Shown on request, or after a wrong answer, before the full explanation. */
  hint: string;
  /** Shown once the student answers correctly (or chooses to reveal). */
  explanation: string;
  verify?: QuizVerification;
}
