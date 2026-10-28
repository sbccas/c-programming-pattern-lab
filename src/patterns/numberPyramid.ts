import { PYRAMID_ROLES, linesToOutput, lit, param, pyramidProgram, ref } from './builders';
import type { PatternDefinition } from './types';

export const numberPyramid: PatternDefinition = {
  id: 'number-pyramid',
  title: 'Number Pyramid',
  summary: 'A centred pyramid that counts 1, 2, 3 … on every row.',
  description:
    'The same spaces-then-symbols structure as the star pyramid, but the second inner loop prints the value of k. Because k starts again at 1 on every row, each row counts up from 1.',
  category: 'Pyramids & diamonds',
  level: 4,
  difficulty: 'Moderate',
  objective: 'Combine a centred layout (spaces loop) with printing a loop variable (numbers loop).',
  goals: [
    'The spaces loop centres the row.',
    'printf("%d ", k); prints the current value of k and a space.',
    'k is initialised to 1 again on every row.',
  ],
  params: [{ name: 'rows', label: 'Rows', description: 'Height of the pyramid (outer loop limit).', min: 1, max: 9, default: 4 }],
  program: pyramidProgram({
    outer: { init: lit(1), op: '<=', limit: param('rows'), update: '++' },
    symbolLimit: ref('i'),
    print: { format: '%d ', args: ['k'] },
    symbolLabel: 'numbers',
  }),
  variableRoles: { ...PYRAMID_ROLES, k: 'numbers loop' },
  expectedOutput: linesToOutput(['   1 ', '  1 2 ', ' 1 2 3 ', '1 2 3 4 ']),
  explain: ({ rows = 4 }) => [
    { title: 'Outer loop', loopId: 'outer', text: `Runs ${rows} time${rows === 1 ? '' : 's'}, once per row.` },
    { title: 'Spaces loop', loopId: 'spaces', text: `Prints ${rows} - i spaces to centre the row.` },
    {
      title: 'Numbers loop',
      loopId: 'numbers',
      text: 'Counts k from 1 up to i and prints each value: 1 on row 1, 1 2 on row 2, and so on.',
    },
    { title: 'Output statement', partId: 'print', text: 'printf("%d ", k); replaces %d with the current value of k.' },
  ],
  notes: ['Rows are limited to 9 so every number stays a single digit and the pyramid stays symmetrical.'],
  quiz: [
    {
      id: 'number-pyramid-predict-row',
      kind: 'predict-row',
      prompt: 'Three rows have been printed. What is row 4?',
      code: '   1\n  1 2\n 1 2 3',
      options: [
        { id: 'a', label: '1 2 3 4', mono: true },
        { id: 'b', label: ' 1 2 3 4', mono: true },
        { id: 'c', label: '4 4 4 4', mono: true },
        { id: 'd', label: '1 2 3', mono: true },
      ],
      answerId: 'a',
      hint: 'On row 4, how many spaces does j <= 4 - i print? Which values does k take?',
      explanation: '4 - 4 = 0 spaces, then k = 1, 2, 3, 4 is printed.',
      verify: { kind: 'row', patternId: 'number-pyramid', params: { rows: 4 }, row: 4 },
    },
    {
      id: 'number-pyramid-remove-spaces',
      kind: 'spot-mistake',
      prompt: 'A student deletes the whole spaces loop. What does the program print now?',
      options: [
        { id: 'a', label: 'The same centred pyramid.' },
        { id: 'b', label: 'The left-aligned number triangle: 1 / 1 2 / 1 2 3 / 1 2 3 4.' },
        { id: 'c', label: 'Only the last row.' },
        { id: 'd', label: 'Nothing — the program stops.' },
      ],
      answerId: 'b',
      hint: 'The spaces loop only adds the spaces in front of each row.',
      explanation: 'Without the leading spaces every row starts at the left edge, which is exactly the Number Triangle pattern.',
    },
  ],
};
