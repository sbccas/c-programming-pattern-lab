import { linesToOutput, lit, nestedLoopProgram, param, ref } from './builders';
import type { PatternDefinition } from './types';

export const invertedTriangle: PatternDefinition = {
  id: 'inverted-triangle',
  title: 'Inverted Triangle of Stars',
  summary: 'The outer loop counts down, so each row has one star fewer.',
  description:
    'The outer loop starts at the largest value and decreases i with i--. The inner loop still uses j <= i, so the number of stars shrinks row by row.',
  category: 'Decreasing patterns',
  level: 3,
  difficulty: 'Moderate',
  objective: 'Follow a loop that counts down with i-- and see how the inner loop uses the current value of i.',
  goals: [
    'The outer loop decrements.',
    'The inner loop uses the current value of i.',
    'The number of output symbols decreases each row.',
  ],
  params: [{ name: 'rows', label: 'Rows', description: 'Starting value of i (the first row is the longest).', min: 1, max: 10, default: 4 }],
  program: nestedLoopProgram(
    { init: param('rows'), op: '>=', limit: lit(1), update: '--' },
    { init: lit(1), op: '<=', limit: ref('i'), update: '++' },
    { format: '* ', args: [] },
  ),
  expectedOutput: linesToOutput(['* * * * ', '* * * ', '* * ', '* ']),
  explain: ({ rows = 4 }) => ({
    outerLoop: `for (i = ${rows}; i >= 1; i--) starts with i = ${rows} and decreases i by 1 after each row. It stops when i becomes 0, because 0 >= 1 is false.`,
    innerLoop: 'for (j = 1; j <= i; j++) runs i times. Since i gets smaller each row, the inner loop runs fewer times each row.',
    output: 'printf("* "); prints one star and a space.',
    newline: 'printf("\\n"); ends each row after the inner loop.',
  }),
  notes: ['Only the outer loop counts down. The inner loop still counts up from 1.'],
  quiz: [
    {
      id: 'inverted-condition-end',
      kind: 'condition',
      prompt: 'i has just been decreased from 1 to 0. Is the outer condition i >= 1 true or false?',
      options: [
        { id: 'true', label: 'True — another row is printed' },
        { id: 'false', label: 'False — the program moves to return 0;' },
      ],
      answerId: 'false',
      hint: 'Is 0 greater than or equal to 1?',
      explanation: '0 >= 1 is false, so the outer loop ends and the program reaches return 0;.',
    },
    {
      id: 'inverted-next-value',
      kind: 'next-value',
      prompt: 'Row 1 printed 4 stars with i = 4. The outer update i-- runs. What is i now?',
      options: [
        { id: 'a', label: '5' },
        { id: 'b', label: '4' },
        { id: 'c', label: '3' },
        { id: 'd', label: '1' },
      ],
      answerId: 'c',
      hint: 'i-- subtracts 1.',
      explanation: 'i-- changes i from 4 to 3, so the next row has 3 stars.',
    },
    {
      id: 'inverted-choose-condition',
      kind: 'choose-condition',
      prompt: 'The outer loop starts with i = 4 and uses i--. Which condition makes it run exactly 4 times?',
      options: [
        { id: 'a', label: 'i <= 4', mono: true },
        { id: 'b', label: 'i > 1', mono: true },
        { id: 'c', label: 'i >= 0', mono: true },
        { id: 'd', label: 'i >= 1', mono: true },
      ],
      answerId: 'd',
      hint: 'i takes the values 4, 3, 2, 1 and must stop at 0.',
      explanation:
        'i >= 1 is true for 4, 3, 2, 1 and false for 0: four passes. i > 1 stops after 3 passes, i >= 0 runs 5 times, and i <= 4 stays true as i keeps decreasing.',
    },
    {
      id: 'inverted-output-3',
      kind: 'identify-output',
      prompt: 'If the outer loop starts at i = 3 instead of 4, which output is printed?',
      options: [
        { id: 'a', label: '*\n* *\n* * *', mono: true },
        { id: 'b', label: '* * *\n* *\n*', mono: true },
        { id: 'c', label: '* * *\n* * *\n* * *', mono: true },
        { id: 'd', label: '* * * *\n* * *\n* *', mono: true },
      ],
      answerId: 'b',
      hint: 'The first row has i stars, and i decreases by 1 each row.',
      explanation: 'i takes the values 3, 2, 1, so the rows have 3, 2 and 1 stars.',
      verify: { kind: 'final-output', patternId: 'inverted-triangle', params: { rows: 3 } },
    },
  ],
};
