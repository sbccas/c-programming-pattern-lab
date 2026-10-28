import { linesToOutput, lit, nestedLoopProgram, param } from './builders';
import type { PatternDefinition } from './types';

export const rectangle: PatternDefinition = {
  id: 'rectangle',
  title: 'Rectangle of Stars',
  summary: 'Print the same number of stars on every row.',
  description:
    'The simplest nested-loop pattern. The outer loop decides how many rows are printed, and the inner loop prints a fixed number of stars on each row.',
  category: 'Basic repetition',
  level: 1,
  difficulty: 'Beginner',
  objective: 'See that the inner loop runs completely, from start to finish, on every pass of the outer loop.',
  goals: [
    'The outer loop controls the rows.',
    'The inner loop has a fixed number of iterations.',
    'The inner loop completes before the next row starts.',
    'The newline is printed after the inner loop, once per row.',
  ],
  params: [
    { name: 'rows', label: 'Rows', description: 'Limit of the outer loop (how many rows).', min: 1, max: 10, default: 3 },
    { name: 'columns', label: 'Stars per row', description: 'Limit of the inner loop.', min: 1, max: 10, default: 4 },
  ],
  program: nestedLoopProgram(
    { init: lit(1), op: '<=', limit: param('rows'), update: '++' },
    { init: lit(1), op: '<=', limit: param('columns'), update: '++' },
    { format: '* ', args: [] },
  ),
  expectedOutput: linesToOutput(['* * * * ', '* * * * ', '* * * * ']),
  explain: ({ rows = 3, columns = 4 }) => ({
    outerLoop: `for (i = 1; i <= ${rows}; i++) runs ${rows} time${rows === 1 ? '' : 's'}: i takes the values 1 to ${rows}. In this lesson each pass of the outer loop produces one row.`,
    innerLoop: `for (j = 1; j <= ${columns}; j++) runs ${columns} time${columns === 1 ? '' : 's'} on every row. Its limit is a fixed number, so every row gets the same number of stars. Each time a new row begins, execution reaches the inner loop again and j starts again from 1.`,
    output: 'printf("* "); prints one star followed by a space. It does not move to a new line, so the stars of a row appear side by side.',
    newline:
      'printf("\\n"); is after the inner loop but still inside the outer loop. It runs once per row, after all the stars of that row have been printed.',
  }),
  notes: ['Each star is followed by a space, so every row ends with an invisible trailing space. Turn on "Show spaces" in the output panel to see it.'],
  quiz: [
    {
      id: 'rectangle-total-stars',
      kind: 'iterations',
      prompt: 'With 3 rows and 4 stars per row, how many times does printf("* "); run in total?',
      options: [
        { id: 'a', label: '7' },
        { id: 'b', label: '12' },
        { id: 'c', label: '4' },
        { id: 'd', label: '3' },
      ],
      answerId: 'b',
      hint: 'The inner loop runs completely on every row. How many rows are there, and how many stars does each row get?',
      explanation: 'The inner loop body runs 4 times on each of the 3 rows, so printf("* "); runs 3 × 4 = 12 times.',
      verify: { kind: 'total-symbols', patternId: 'rectangle', params: { rows: 3, columns: 4 } },
    },
    {
      id: 'rectangle-condition',
      kind: 'condition',
      prompt: 'On row 2, j has just been increased to 5. The inner condition is j <= 4. Is it true or false?',
      options: [
        { id: 'true', label: 'True — print another star' },
        { id: 'false', label: 'False — the inner loop ends' },
      ],
      answerId: 'false',
      hint: 'Is 5 less than or equal to 4?',
      explanation: '5 <= 4 is false, so the inner loop ends. Execution continues with printf("\\n"); and the row is finished.',
    },
    {
      id: 'rectangle-output-2x3',
      kind: 'identify-output',
      prompt: 'If the outer limit is changed to 2 and the inner limit to 3, which output is printed?',
      code: 'for (i = 1; i <= 2; i++)\n{\n    for (j = 1; j <= 3; j++)\n    {\n        printf("* ");\n    }\n    printf("\\n");\n}',
      options: [
        { id: 'a', label: '* *\n* *\n* *', mono: true },
        { id: 'b', label: '* * *\n* * *', mono: true },
        { id: 'c', label: '* * * * * *', mono: true },
        { id: 'd', label: '*\n* *', mono: true },
      ],
      answerId: 'b',
      hint: 'The outer limit decides the number of rows. The inner limit decides the stars on each row.',
      explanation: 'The outer loop runs 2 times (2 rows) and the inner loop runs 3 times on each row (3 stars).',
      verify: { kind: 'final-output', patternId: 'rectangle', params: { rows: 2, columns: 3 } },
    },
  ],
};
