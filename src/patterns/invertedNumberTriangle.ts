import { linesToOutput, lit, nestedLoopProgram, param, ref, standardCards } from './builders';
import type { PatternDefinition } from './types';

export const invertedNumberTriangle: PatternDefinition = {
  id: 'inverted-number-triangle',
  title: 'Decreasing Number Triangle',
  summary: 'Count down the rows while each row still counts up from 1.',
  description:
    'This combines the inverted triangle and the number triangle: the outer loop counts down with i--, and each row prints the values of j from 1 up to i.',
  category: 'Decreasing patterns',
  level: 3,
  difficulty: 'Moderate',
  objective: 'Track two loops moving in opposite directions: i goes down while j goes up.',
  goals: [
    'The outer loop decreases i after each row.',
    'The inner loop always restarts at j = 1 and counts up to the current i.',
    'Printing j shows exactly how far the inner loop got on each row.',
  ],
  params: [{ name: 'rows', label: 'Rows', description: 'Starting value of i (the first row is the longest).', min: 1, max: 9, default: 4 }],
  program: nestedLoopProgram(
    { init: param('rows'), op: '>=', limit: lit(1), update: '--' },
    { init: lit(1), op: '<=', limit: ref('i'), update: '++' },
    { format: '%d ', args: ['j'] },
  ),
  expectedOutput: linesToOutput(['1 2 3 4 ', '1 2 3 ', '1 2 ', '1 ']),
  explain: ({ rows = 4 }) => standardCards({
    outerLoop: `for (i = ${rows}; i >= 1; i--) runs ${rows} time${rows === 1 ? '' : 's'}, with i = ${rows}, ${rows > 1 ? `${rows - 1}, … ` : ''}1.`,
    innerLoop: 'for (j = 1; j <= i; j++) counts j from 1 up to the current i, so each row is one number shorter than the row before.',
    output: 'printf("%d ", j); prints the current value of j and a space.',
    newline: 'printf("\\n"); ends the row after the inner loop finishes.',
  }),
  notes: ['Rows are limited to 9 here so every number stays a single digit.'],
  quiz: [
    {
      id: 'inverted-number-predict-row',
      kind: 'predict-row',
      prompt: 'Two rows have been printed. What is the third row?',
      code: '1 2 3 4\n1 2 3',
      options: [
        { id: 'a', label: '1 2', mono: true },
        { id: 'b', label: '2 1', mono: true },
        { id: 'c', label: '1 2 3', mono: true },
        { id: 'd', label: '3 3', mono: true },
      ],
      answerId: 'a',
      hint: 'On the third row, i has been decreased twice from 4. j still starts at 1.',
      explanation: 'On the third row i = 2, so j takes the values 1 and 2.',
      verify: { kind: 'row', patternId: 'inverted-number-triangle', params: { rows: 4 }, row: 3 },
    },
    {
      id: 'inverted-number-first-row',
      kind: 'iterations',
      prompt: 'With 4 rows, how many numbers are printed on the first row?',
      options: [
        { id: 'a', label: '1' },
        { id: 'b', label: '3' },
        { id: 'c', label: '4' },
        { id: 'd', label: '5' },
      ],
      answerId: 'c',
      hint: 'On the first row i has its starting value.',
      explanation: 'The first row has i = 4, so the inner loop runs 4 times.',
      verify: { kind: 'inner-iterations', patternId: 'inverted-number-triangle', params: { rows: 4 }, row: 1 },
    },
  ],
};
