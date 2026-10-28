import { PYRAMID_ROLES, exprs, linesToOutput, lit, param, pyramidProgram, ref } from './builders';
import type { PatternDefinition } from './types';

const { sub, mul } = exprs;

export const oddPyramid: PatternDefinition = {
  id: 'odd-star-pyramid',
  title: 'Solid Pyramid (Odd Stars)',
  summary: 'Print 1, 3, 5, 7 … stars per row using k <= 2 * i - 1.',
  description:
    'This solid pyramid prints stars with no spaces between them. Row i needs an odd number of stars — 2 × i − 1 — so the stars loop uses an arithmetic expression as its limit.',
  category: 'Pyramids & diamonds',
  level: 4,
  difficulty: 'Challenging',
  objective: 'Use an arithmetic expression (2 * i - 1) as a loop limit and predict its value on every row.',
  goals: [
    'The spaces loop prints 4 - i spaces, exactly like the star pyramid.',
    'The stars loop limit 2 * i - 1 gives the odd numbers 1, 3, 5, 7.',
    'The program works out 2 * i - 1 again every time the condition is checked.',
  ],
  params: [{ name: 'rows', label: 'Rows', description: 'Height of the pyramid (outer loop limit).', min: 1, max: 10, default: 4 }],
  program: pyramidProgram({
    outer: { init: lit(1), op: '<=', limit: param('rows'), update: '++' },
    symbolLimit: sub(mul(lit(2), ref('i')), lit(1)),
    print: { format: '*', args: [] },
    symbolLabel: 'stars',
  }),
  variableRoles: { ...PYRAMID_ROLES, k: 'stars loop' },
  expectedOutput: linesToOutput(['   *', '  ***', ' *****', '*******']),
  explain: ({ rows = 4 }) => [
    {
      title: 'Outer loop',
      loopId: 'outer',
      text: `Runs ${rows} time${rows === 1 ? '' : 's'}, once per row, with i = 1, 2, … ${rows}.`,
    },
    {
      title: 'Spaces loop',
      loopId: 'spaces',
      text: `Prints ${rows} - i spaces before the stars, so each row is centred under the one above.`,
    },
    {
      title: 'Stars loop',
      loopId: 'stars',
      text: `Prints 2 * i - 1 stars: 1, 3, 5, … up to ${2 * rows - 1} on the last row. Each row has 2 more stars than the row above (one more on each side).`,
    },
    {
      title: 'Output statements',
      partId: 'print',
      text: 'printf("*"); prints a star with no space after it, so the stars join into a solid triangle. printf(" "); in the spaces loop prints one space.',
    },
  ],
  notes: ['The bottom row is 2 × rows − 1 characters wide, so 10 rows make a 19-star base.'],
  quiz: [
    {
      id: 'odd-pyramid-row4-stars',
      kind: 'iterations',
      prompt: 'How many times does the stars loop body run on row 4 (i = 4)?',
      options: [
        { id: 'a', label: '4' },
        { id: 'b', label: '6' },
        { id: 'c', label: '7' },
        { id: 'd', label: '8' },
      ],
      answerId: 'c',
      hint: 'Work out 2 * i - 1 with i = 4.',
      explanation: '2 × 4 − 1 = 7, so k <= 7 is true for k = 1 … 7: seven stars.',
      verify: { kind: 'inner-iterations', patternId: 'odd-star-pyramid', params: { rows: 4 }, row: 4, loopId: 'stars' },
    },
    {
      id: 'odd-pyramid-output-3',
      kind: 'identify-output',
      prompt: 'With 3 rows, which output does this program print?',
      options: [
        { id: 'a', label: '*\n***\n*****', mono: true },
        { id: 'b', label: '  *\n ***\n*****', mono: true },
        { id: 'c', label: '  *\n **\n***', mono: true },
        { id: 'd', label: '   *\n  ***\n *****', mono: true },
      ],
      answerId: 'b',
      hint: 'With 3 rows the spaces are 3 - i (2, 1, 0) and the stars are 2 * i - 1 (1, 3, 5).',
      explanation: 'Row 1: 2 spaces + 1 star. Row 2: 1 space + 3 stars. Row 3: no spaces + 5 stars.',
      verify: { kind: 'final-output', patternId: 'odd-star-pyramid', params: { rows: 3 } },
    },
    {
      id: 'odd-pyramid-expression',
      kind: 'next-value',
      prompt: 'The outer loop is on row 3. What is the value of the stars-loop limit 2 * i - 1?',
      options: [
        { id: 'a', label: '3' },
        { id: 'b', label: '4' },
        { id: 'c', label: '5' },
        { id: 'd', label: '6' },
      ],
      answerId: 'c',
      hint: 'Multiplication happens before subtraction: (2 × 3) − 1.',
      explanation: '2 × 3 = 6, then 6 − 1 = 5. So row 3 prints 5 stars.',
    },
  ],
};
