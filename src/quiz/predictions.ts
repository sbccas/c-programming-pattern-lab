import type { SimulationEvent, SimulationState } from '../engine/types';

export interface Prediction {
  /** Position of the event being predicted (the step that will run next). */
  step: number;
  prompt: string;
  options: { id: string; label: string }[];
  answerId: string;
  hint: string;
}

const uniqueSorted = (values: number[]) => [...new Set(values)].sort((a, b) => a - b);

/**
 * Build a prediction question about the NEXT event, using only data from the
 * timeline itself — so the "correct" answer is always what the simulator will do.
 * Returns null for steps that are not worth predicting (e.g. the first init).
 */
export function predictionFor(next: SimulationEvent | undefined, current: SimulationState): Prediction | null {
  if (!next) return null;
  const vars = Object.entries(current.vars)
    .map(([k, v]) => `${k} = ${v ?? 'not set'}`)
    .join(', ');
  const step = next.index + 1;

  switch (next.type) {
    case 'CONDITION_CHECK':
      return {
        step,
        prompt: `Next, the program checks ${next.expression} (${vars}). Will the condition be true or false?`,
        options: [
          { id: 'true', label: 'True' },
          { id: 'false', label: 'False' },
        ],
        answerId: String(next.result),
        hint: `Replace the variables with their values: is ${next.substituted}?`,
      };
    case 'INCREMENT':
    case 'DECREMENT': {
      const options = uniqueSorted([next.from - 1, next.from, next.from + 1]);
      return {
        step,
        prompt: `Next, ${next.code} runs. ${next.variable} is ${next.from} now. What will ${next.variable} be?`,
        options: options.map((v) => ({ id: String(v), label: String(v) })),
        answerId: String(next.to),
        hint: next.type === 'INCREMENT' ? `${next.variable}++ adds 1.` : `${next.variable}-- subtracts 1.`,
      };
    }
    case 'INIT_VARIABLE': {
      if (next.loop !== 'inner') return null;
      const previous = current.vars[next.variable];
      const other = current.vars.i;
      const options = uniqueSorted(
        [next.value, previous ?? next.value + 1, other ?? next.value + 2].filter((v): v is number => v !== null),
      );
      return {
        step,
        prompt: `Execution reaches the inner loop again: ${next.code}. What value will ${next.variable} have?`,
        options: options.map((v) => ({ id: String(v), label: String(v) })),
        answerId: String(next.value),
        hint: `The initialisation part of the for header runs every time the loop is entered. Read it: ${next.code}.`,
      };
    }
    case 'OUTPUT': {
      if (!/\d/.test(next.text)) return null;
      const candidates = Object.values(current.vars).filter((v): v is number => v !== null);
      const options = [...new Set([next.text, ...candidates.map((v) => `${v} `)])].sort();
      return {
        step,
        prompt: `Next, ${next.code} runs (${vars}). What will be printed?`,
        options: options.map((t) => ({ id: t, label: `"${t}"` })),
        answerId: next.text,
        hint: 'Find which variable is written after the comma, then use its current value.',
      };
    }
    case 'NEWLINE':
    case 'PROGRAM_END':
      return null;
  }
}
