import { PYRAMID_ROLES, linesToOutput, lit, param, pyramidProgram, ref } from './builders';
import type { PatternDefinition } from './types';

export const starPyramid: PatternDefinition = {
  id: 'star-pyramid',
  title: 'Pyramid of Stars',
  summary: 'Two inner loops: first print spaces, then print stars.',
  description:
    'A centred pyramid needs two inner loops inside the outer loop. The first prints spaces to push the row to the right; the second prints the stars. As i grows, there are fewer spaces and more stars.',
  category: 'Pyramids & diamonds',
  level: 4,
  difficulty: 'Moderate',
  objective: 'See how two inner loops run one after another inside the same outer loop body.',
  goals: [
    'The spaces loop runs first and finishes completely before the stars loop starts.',
    'j <= 4 - i prints fewer spaces on each new row.',
    'k <= i prints one more star on each new row.',
    'Printing "* " (star + space) makes the rows interlock into a pyramid.',
  ],
  params: [{ name: 'rows', label: 'Rows', description: 'Height of the pyramid (outer loop limit).', min: 1, max: 10, default: 4 }],
  program: pyramidProgram({
    outer: { init: lit(1), op: '<=', limit: param('rows'), update: '++' },
    symbolLimit: ref('i'),
    print: { format: '* ', args: [] },
    symbolLabel: 'stars',
  }),
  variableRoles: { ...PYRAMID_ROLES, k: 'stars loop' },
  expectedOutput: linesToOutput(['   * ', '  * * ', ' * * * ', '* * * * ']),
  explain: ({ rows = 4 }) => [
    {
      title: 'Outer loop',
      loopId: 'outer',
      text: `Runs ${rows} time${rows === 1 ? '' : 's'}, once per row. On each pass, i is the row number: 1, 2, … ${rows}.`,
    },
    {
      title: 'Spaces loop (first inner loop)',
      loopId: 'spaces',
      text: `Prints ${rows} - i spaces: ${Math.max(rows - 1, 0)} on row 1, ${Math.max(rows - 2, 0)} on row 2, … and 0 on the last row. These spaces push the stars to the right so the pyramid is centred.`,
    },
    {
      title: 'Stars loop (second inner loop)',
      loopId: 'stars',
      text: 'Starts only after the spaces loop has finished. It prints i stars, each followed by a space — 1 star on row 1, 2 on row 2, and so on.',
    },
    {
      title: 'Newline',
      partId: 'newline',
      text: 'printf("\\n"); comes after both inner loops, so the row is finished before the next pass of the outer loop.',
    },
  ],
  notes: [
    'Turn on "Show spaces" in the output panel to see the leading spaces that centre each row.',
    'This program uses a third variable, k, for the stars loop so you can follow both inner loops separately.',
  ],
  quiz: [
    {
      id: 'star-pyramid-spaces-row1',
      kind: 'iterations',
      prompt: 'With 4 rows, how many spaces does the spaces loop print on row 1 (i = 1)?',
      options: [
        { id: 'a', label: '0' },
        { id: 'b', label: '1' },
        { id: 'c', label: '3' },
        { id: 'd', label: '4' },
      ],
      answerId: 'c',
      hint: 'The spaces loop runs while j <= 4 - i. What is 4 - i when i = 1?',
      explanation: '4 - 1 = 3, so j <= 3 is true for j = 1, 2, 3: three spaces before the first star.',
      verify: { kind: 'inner-iterations', patternId: 'star-pyramid', params: { rows: 4 }, row: 1, loopId: 'spaces' },
    },
    {
      id: 'star-pyramid-predict-row',
      kind: 'predict-row',
      prompt: 'The first two rows have been printed. What is row 3? (Leading spaces matter!)',
      code: '   *\n  * *',
      options: [
        { id: 'a', label: '* * *', mono: true },
        { id: 'b', label: ' * * *', mono: true },
        { id: 'c', label: '  * * *', mono: true },
        { id: 'd', label: ' * * * *', mono: true },
      ],
      answerId: 'b',
      hint: 'On row 3, i = 3. Count the spaces (4 - i) and the stars (i).',
      explanation: 'Row 3 has 4 - 3 = 1 space and then 3 stars.',
      verify: { kind: 'row', patternId: 'star-pyramid', params: { rows: 4 }, row: 3 },
    },
    {
      id: 'star-pyramid-last-row-spaces',
      kind: 'condition',
      prompt: 'On the last row (i = 4), the spaces loop starts with j = 1 and checks j <= 4 - i. True or false?',
      options: [
        { id: 'true', label: 'True — one space is printed' },
        { id: 'false', label: 'False — no spaces on this row' },
      ],
      answerId: 'false',
      hint: 'Work out 4 - i first, then compare.',
      explanation: '4 - 4 = 0, and 1 <= 0 is false. The spaces loop ends immediately, so the last row starts at the left edge.',
    },
    {
      id: 'star-pyramid-choose-condition',
      kind: 'choose-condition',
      prompt: 'For a 5-row pyramid (for (i = 1; i <= 5; i++)), which spaces-loop condition gives 4 spaces on row 1 and 0 on row 5?',
      options: [
        { id: 'a', label: 'j <= i', mono: true },
        { id: 'b', label: 'j <= 5', mono: true },
        { id: 'c', label: 'j <= 5 - i', mono: true },
        { id: 'd', label: 'j < 5 - i', mono: true },
      ],
      answerId: 'c',
      hint: 'The number of spaces should go down as i goes up.',
      explanation: 'j <= 5 - i gives 4, 3, 2, 1, 0 spaces. j <= i would increase instead, j <= 5 never changes, and j < 5 - i is one space short on every row.',
    },
  ],
};
