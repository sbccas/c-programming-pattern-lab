import { PYRAMID_ROLES, linesToOutput, lit, param, pyramidProgram, ref } from './builders';
import type { PatternDefinition } from './types';

export const invertedPyramid: PatternDefinition = {
  id: 'inverted-pyramid',
  title: 'Inverted Pyramid',
  summary: 'Count the rows down: more spaces and fewer stars on every row.',
  description:
    'The outer loop starts at the number of rows and counts down with i--. The same two inner loops then print more spaces and fewer stars on each row, turning the pyramid upside down.',
  category: 'Pyramids & diamonds',
  level: 4,
  difficulty: 'Challenging',
  objective: 'Predict how both inner loops change when the outer loop counts down instead of up.',
  goals: [
    'The outer loop decrements: i = 4, 3, 2, 1.',
    'As i gets smaller, 4 - i gets bigger, so there are more spaces.',
    'k <= i prints fewer stars on each row.',
  ],
  params: [{ name: 'rows', label: 'Rows', description: 'Height of the pyramid (starting value of i).', min: 1, max: 10, default: 4 }],
  program: pyramidProgram({
    outer: { init: param('rows'), op: '>=', limit: lit(1), update: '--' },
    symbolLimit: ref('i'),
    print: { format: '* ', args: [] },
    symbolLabel: 'stars',
  }),
  variableRoles: { ...PYRAMID_ROLES, k: 'stars loop' },
  expectedOutput: linesToOutput(['* * * * ', ' * * * ', '  * * ', '   * ']),
  explain: ({ rows = 4 }) => [
    {
      title: 'Outer loop (counts down)',
      loopId: 'outer',
      text: `Starts with i = ${rows} and runs while i >= 1, decreasing i after each row. It stops when i becomes 0.`,
    },
    {
      title: 'Spaces loop',
      loopId: 'spaces',
      text: `Prints ${rows} - i spaces. On the first row i = ${rows}, so there are none; each later row has one more.`,
    },
    {
      title: 'Stars loop',
      loopId: 'stars',
      text: 'Prints i stars (each with a space). Because i decreases, every row has one star fewer.',
    },
    {
      title: 'Newline',
      partId: 'newline',
      text: 'Ends the row after both inner loops have finished.',
    },
  ],
  notes: ['Compare with the Pyramid of Stars: only the outer loop changed, yet the shape flips.'],
  quiz: [
    {
      id: 'inverted-pyramid-predict-row',
      kind: 'predict-row',
      prompt: 'Two rows have been printed. What is row 3?',
      code: '* * * *\n * * *',
      options: [
        { id: 'a', label: '* *', mono: true },
        { id: 'b', label: ' * *', mono: true },
        { id: 'c', label: '  * *', mono: true },
        { id: 'd', label: '  * * *', mono: true },
      ],
      answerId: 'c',
      hint: 'On row 3, i = 2. Spaces: 4 - i. Stars: i.',
      explanation: 'With i = 2 the row has 4 - 2 = 2 spaces and 2 stars.',
      verify: { kind: 'row', patternId: 'inverted-pyramid', params: { rows: 4 }, row: 3 },
    },
    {
      id: 'inverted-pyramid-row1-spaces',
      kind: 'iterations',
      prompt: 'How many times does the spaces loop body run on the first row (i = 4)?',
      options: [
        { id: 'a', label: '0' },
        { id: 'b', label: '1' },
        { id: 'c', label: '3' },
        { id: 'd', label: '4' },
      ],
      answerId: 'a',
      hint: 'Check j <= 4 - i with i = 4 and j = 1.',
      explanation: '4 - 4 = 0 and 1 <= 0 is false, so the spaces loop body never runs on the first row.',
      verify: { kind: 'inner-iterations', patternId: 'inverted-pyramid', params: { rows: 4 }, row: 1, loopId: 'spaces' },
    },
  ],
};
