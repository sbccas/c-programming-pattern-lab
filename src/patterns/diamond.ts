import { PYRAMID_VARIABLES, exprs, linesToOutput, lit, param, pyramidLoop, ref } from './builders';
import type { PatternDefinition } from './types';

const { sub } = exprs;

export const diamond: PatternDefinition = {
  id: 'diamond',
  title: 'Diamond of Stars',
  summary: 'Two outer loops in a row: a pyramid, then an inverted pyramid.',
  description:
    'A diamond is a pyramid sitting on an upside-down pyramid. The program has two outer loops one after the other: the upper half counts i up, and the lower half counts i down — starting one row lower so the widest row is printed only once.',
  category: 'Pyramids & diamonds',
  level: 4,
  difficulty: 'Challenging',
  objective: 'Follow a program with two outer loops in sequence and see why the lower half starts at rows − 1.',
  goals: [
    'The lower-half loop starts only after the upper-half loop has completely finished.',
    'Both halves use the same spaces and stars loops.',
    'The lower half starts at i = rows - 1 so the widest row is not printed twice.',
  ],
  params: [
    { name: 'rows', label: 'Rows in upper half', description: 'Height of the top pyramid (the diamond has 2 × rows − 1 rows).', min: 1, max: 9, default: 4 },
  ],
  program: {
    variables: PYRAMID_VARIABLES,
    body: [
      { kind: 'comment', text: 'upper half: the pyramid grows' },
      pyramidLoop({
        prefix: 'upper',
        outerLabel: 'upper half',
        outer: { init: lit(1), op: '<=', limit: param('rows'), update: '++' },
        symbolLimit: ref('i'),
        print: { format: '* ', args: [] },
        symbolLabel: 'stars',
      }),
      { kind: 'comment', text: 'lower half: the pyramid shrinks' },
      pyramidLoop({
        prefix: 'lower',
        outerLabel: 'lower half',
        outer: { init: sub(param('rows'), lit(1)), op: '>=', limit: lit(1), update: '--' },
        symbolLimit: ref('i'),
        print: { format: '* ', args: [] },
        symbolLabel: 'stars',
      }),
    ],
  },
  variableRoles: { i: 'row loops (both halves)', j: 'spaces loop', k: 'stars loop' },
  expectedOutput: linesToOutput(['   * ', '  * * ', ' * * * ', '* * * * ', ' * * * ', '  * * ', '   * ']),
  explain: ({ rows = 4 }) => [
    {
      title: 'Upper half',
      loopId: 'upper',
      text: `Counts i up from 1 to ${rows}, printing a growing pyramid of ${rows} row${rows === 1 ? '' : 's'}.`,
    },
    {
      title: 'Lower half',
      loopId: 'lower',
      text:
        rows > 1
          ? `Runs after the upper half has finished. It starts at i = ${rows - 1} (not ${rows}) because the widest row was already printed, then counts down to 1.`
          : 'Starts at i = 0, so its condition i >= 1 is false at once: a 1-row diamond is just a single star.',
    },
    {
      title: 'Spaces loop (in both halves)',
      loopId: 'upperSpaces',
      text: `Prints ${rows} - i spaces, so rows with a smaller i are pushed further right.`,
    },
    {
      title: 'Stars loop (in both halves)',
      loopId: 'upperStars',
      text: 'Prints i stars, each followed by a space. The same rule builds both halves.',
    },
  ],
  notes: [
    `The default diamond has 4 + 3 = 7 rows. In general it has 2 × rows − 1 rows.`,
    'Each half has its own copy of the spaces and stars loops; the code is the same in both halves.',
  ],
  quiz: [
    {
      id: 'diamond-row-count',
      kind: 'iterations',
      prompt: 'With 4 rows in the upper half, how many rows does the whole diamond have?',
      options: [
        { id: 'a', label: '4' },
        { id: 'b', label: '7' },
        { id: 'c', label: '8' },
        { id: 'd', label: '9' },
      ],
      answerId: 'b',
      hint: 'The upper half prints rows for i = 1 … 4. The lower half starts at i = 3.',
      explanation: '4 rows going up + 3 rows going down (i = 3, 2, 1) = 7 rows.',
      verify: { kind: 'row-count', patternId: 'diamond', params: { rows: 4 } },
    },
    {
      id: 'diamond-predict-row',
      kind: 'predict-row',
      prompt: 'The widest row has just been printed. What is the next row?',
      code: '   *\n  * *\n * * *\n* * * *',
      options: [
        { id: 'a', label: '* * * *', mono: true },
        { id: 'b', label: ' * * *', mono: true },
        { id: 'c', label: '  * *', mono: true },
        { id: 'd', label: ' * * * *', mono: true },
      ],
      answerId: 'b',
      hint: 'The lower half starts with i = 3. Spaces: 4 - i. Stars: i.',
      explanation: 'The first lower-half row has i = 3: one space and three stars.',
      verify: { kind: 'row', patternId: 'diamond', params: { rows: 4 }, row: 5 },
    },
    {
      id: 'diamond-why-minus-one',
      kind: 'spot-mistake',
      prompt: 'A student starts the lower half with for (i = 4; i >= 1; i--) instead of i = 3. What goes wrong?',
      options: [
        { id: 'a', label: 'Nothing changes.' },
        { id: 'b', label: 'The widest row (* * * *) is printed twice, so the diamond has a flat middle.' },
        { id: 'c', label: 'The top star disappears.' },
        { id: 'd', label: 'The program never ends.' },
      ],
      answerId: 'b',
      hint: 'Which row did the upper half print last?',
      explanation: 'The upper half already printed the row with i = 4. Starting the lower half at 4 prints that row again.',
    },
    {
      id: 'diamond-lower-condition',
      kind: 'choose-condition',
      prompt: 'Complete the lower half: for (i = 3; ______; i--). Which condition prints the rows for i = 3, 2 and 1?',
      options: [
        { id: 'a', label: 'i > 1', mono: true },
        { id: 'b', label: 'i >= 1', mono: true },
        { id: 'c', label: 'i >= 0', mono: true },
        { id: 'd', label: 'i <= 3', mono: true },
      ],
      answerId: 'b',
      hint: 'The last row (the bottom tip) has i = 1, and the loop must stop at 0.',
      explanation:
        'i >= 1 is true for 3, 2, 1 and false for 0. i > 1 misses the bottom tip, i >= 0 adds an extra row with no stars, and i <= 3 stays true forever as i decreases.',
    },
  ],
};
