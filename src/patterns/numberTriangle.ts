import { linesToOutput, lit, nestedLoopProgram, param, ref } from './builders';
import type { PatternDefinition } from './types';

export const numberTriangle: PatternDefinition = {
  id: 'number-triangle',
  title: 'Number Triangle',
  summary: 'Same loops as the star triangle, but print j instead of a star.',
  description:
    'The loop structure is identical to the star triangle. Only the printf changes: it prints the value of j, which counts 1, 2, 3, … on every row.',
  category: 'Increasing patterns',
  level: 2,
  difficulty: 'Easy',
  objective: 'See that j really does start again from 1 on every row, because its value is printed.',
  goals: [
    'The loop structure is the same as the star triangle.',
    'Printing j rather than a fixed star changes the output.',
    'The inner loop starts with j = 1 on each row.',
  ],
  params: [{ name: 'rows', label: 'Rows', description: 'Limit of the outer loop.', min: 1, max: 9, default: 4 }],
  program: nestedLoopProgram(
    { init: lit(1), op: '<=', limit: param('rows'), update: '++' },
    { init: lit(1), op: '<=', limit: ref('i'), update: '++' },
    { format: '%d ', args: ['j'] },
  ),
  expectedOutput: linesToOutput(['1 ', '1 2 ', '1 2 3 ', '1 2 3 4 ']),
  explain: ({ rows = 4 }) => ({
    outerLoop: `for (i = 1; i <= ${rows}; i++) runs ${rows} time${rows === 1 ? '' : 's'}, once per row.`,
    innerLoop: 'for (j = 1; j <= i; j++) runs i times. Because it is initialised again on every row, each row counts from 1.',
    output: 'printf("%d ", j); prints the current value of j followed by a space.',
    newline: 'printf("\\n"); ends the row after the inner loop finishes.',
  }),
  notes: ['Rows are limited to 9 here so every number stays a single digit.'],
  quiz: [
    {
      id: 'number-predict-row',
      kind: 'predict-row',
      prompt: 'The first three rows have been printed. What is the fourth row?',
      code: '1\n1 2\n1 2 3',
      options: [
        { id: 'a', label: '4 4 4 4', mono: true },
        { id: 'b', label: '1 2 3 4', mono: true },
        { id: 'c', label: '2 3 4 5', mono: true },
        { id: 'd', label: '1 2 3', mono: true },
      ],
      answerId: 'b',
      hint: 'On every row, j is initialised to 1 again. What values does j take when i = 4?',
      explanation: 'When i = 4, j takes the values 1, 2, 3, 4 and each value is printed.',
      verify: { kind: 'row', patternId: 'number-triangle', params: { rows: 4 }, row: 4 },
    },
    {
      id: 'number-next-row-start',
      kind: 'next-value',
      prompt: 'Row 2 has just ended (j was 3 when j <= i became false). The outer loop moves to i = 3 and reaches the inner loop. What is j after the inner initialisation?',
      options: [
        { id: 'a', label: '3' },
        { id: 'b', label: '4' },
        { id: 'c', label: '1' },
        { id: 'd', label: '0' },
      ],
      answerId: 'c',
      hint: 'Read the first part of the inner for header: j = …',
      explanation: 'Each time execution reaches the inner for statement, j = 1 runs again. So j is 1 at the start of every row.',
    },
    {
      id: 'number-spot-mistake',
      kind: 'spot-mistake',
      prompt: 'A student wants the number triangle but wrote the inner condition as j < i. What happens?',
      code: 'for (j = 1; j < i; j++)\n{\n    printf("%d ", j);\n}',
      options: [
        { id: 'a', label: 'Each row is one number short, and the first row is empty.' },
        { id: 'b', label: 'Each row gets one extra number.' },
        { id: 'c', label: 'The output does not change.' },
        { id: 'd', label: 'The program never stops.' },
      ],
      answerId: 'a',
      hint: 'When i = 1 and j = 1, is 1 < 1 true?',
      explanation: 'j < i stops one step earlier than j <= i. On row 1, 1 < 1 is false, so nothing is printed before the newline.',
    },
  ],
};
