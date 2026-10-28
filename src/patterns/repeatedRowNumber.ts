import { linesToOutput, lit, nestedLoopProgram, param, ref } from './builders';
import type { PatternDefinition } from './types';

export const repeatedRowNumber: PatternDefinition = {
  id: 'repeated-row-number',
  title: 'Repeated Row Number',
  summary: 'Print the row number, repeated once for each position in the row.',
  description:
    'Instead of a star, this program prints the value of i. The inner loop decides how many times it is printed, and the outer loop decides which number is printed.',
  category: 'Basic repetition',
  level: 1,
  difficulty: 'Easy',
  objective: 'See the difference between what is printed (the value of i) and how many times it is printed (the inner loop).',
  goals: [
    'printf("%d ", i); prints the current value of i followed by a space.',
    'The inner loop repeats the print; it does not change i.',
    'The condition j <= i makes row i contain i numbers.',
  ],
  params: [{ name: 'rows', label: 'Rows', description: 'Limit of the outer loop.', min: 1, max: 9, default: 4 }],
  program: nestedLoopProgram(
    { init: lit(1), op: '<=', limit: param('rows'), update: '++' },
    { init: lit(1), op: '<=', limit: ref('i'), update: '++' },
    { format: '%d ', args: ['i'] },
  ),
  expectedOutput: linesToOutput(['1 ', '2 2 ', '3 3 3 ', '4 4 4 4 ']),
  explain: ({ rows = 4 }) => ({
    outerLoop: `for (i = 1; i <= ${rows}; i++) runs ${rows} time${rows === 1 ? '' : 's'}. The value of i is both the row number and the number that gets printed.`,
    innerLoop:
      'for (j = 1; j <= i; j++) uses the current value of i as its limit. When i is 3, j goes 1, 2, 3 — three passes — so three numbers are printed.',
    output:
      'printf("%d ", i); replaces %d with the value of i, then prints a space. j only counts the repetitions; it is not printed.',
    newline: 'printf("\\n"); runs after the inner loop, ending the row.',
  }),
  notes: ['Rows are limited to 9 here so every number stays a single digit and the columns line up.'],
  quiz: [
    {
      id: 'repeated-predict-row',
      kind: 'predict-row',
      prompt: 'The program has printed the first three rows. What will the fourth row be?',
      code: '1\n2 2\n3 3 3',
      options: [
        { id: 'a', label: '1 2 3 4', mono: true },
        { id: 'b', label: '4 4 4 4', mono: true },
        { id: 'c', label: '4', mono: true },
        { id: 'd', label: '3 3 3 3', mono: true },
      ],
      answerId: 'b',
      hint: 'On the fourth row i is 4. Which variable is printed, and how many times does the inner loop run when i is 4?',
      explanation: 'When i is 4 the inner loop runs 4 times, and each time it prints i, so the row is 4 4 4 4.',
      verify: { kind: 'row', patternId: 'repeated-row-number', params: { rows: 4 }, row: 4 },
    },
    {
      id: 'repeated-print-j',
      kind: 'identify-output',
      prompt: 'If printf("%d ", i); is changed to printf("%d ", j);, what will the third row be?',
      options: [
        { id: 'a', label: '3 3 3', mono: true },
        { id: 'b', label: '1 2 3', mono: true },
        { id: 'c', label: '3 2 1', mono: true },
        { id: 'd', label: '1 1 1', mono: true },
      ],
      answerId: 'b',
      hint: 'On the third row, j takes the values 1, 2 and 3 in turn.',
      explanation: 'Printing j shows the inner loop counter, which goes 1, 2, 3 on the third row. That is the number triangle pattern.',
      verify: { kind: 'row', patternId: 'number-triangle', params: { rows: 4 }, row: 3 },
    },
  ],
};
