import { linesToOutput, lit, nestedLoopProgram, param, ref } from './builders';
import type { PatternDefinition } from './types';

export const starTriangle: PatternDefinition = {
  id: 'star-triangle',
  title: 'Right-Angle Triangle of Stars',
  summary: 'Each row prints one more star than the row before.',
  description:
    'The inner loop limit is the outer loop variable i. As i grows, the inner loop runs more times, so each row gets one more star.',
  category: 'Increasing patterns',
  level: 2,
  difficulty: 'Easy',
  objective: 'Understand how j <= i makes the number of stars change from row to row.',
  goals: [
    'j <= i controls the number of stars on each row.',
    'The inner loop iteration count changes with each row.',
    'The total number of stars for four rows is 1 + 2 + 3 + 4 = 10.',
  ],
  params: [{ name: 'rows', label: 'Rows', description: 'Limit of the outer loop.', min: 1, max: 10, default: 4 }],
  program: nestedLoopProgram(
    { init: lit(1), op: '<=', limit: param('rows'), update: '++' },
    { init: lit(1), op: '<=', limit: ref('i'), update: '++' },
    { format: '* ', args: [] },
  ),
  expectedOutput: linesToOutput(['* ', '* * ', '* * * ', '* * * * ']),
  explain: ({ rows = 4 }) => ({
    outerLoop: `for (i = 1; i <= ${rows}; i++) runs ${rows} time${rows === 1 ? '' : 's'}. On each pass, i is the row number: 1, 2, … ${rows}.`,
    innerLoop:
      'for (j = 1; j <= i; j++) runs i times. On row 1 it runs once, on row 2 twice, and so on. j starts again from 1 at the beginning of every row, because the inner for statement is reached again.',
    output: 'printf("* "); prints one star and a space without moving to the next line.',
    newline: 'printf("\\n"); runs after the inner loop ends, so the cursor moves down only after the whole row has been printed.',
  }),
  notes: ['Every row ends with a trailing space after its last star.'],
  quiz: [
    {
      id: 'triangle-iterations-row3',
      kind: 'iterations',
      prompt: 'On row 3 (when i = 3), how many times does the inner loop body printf("* "); run?',
      options: [
        { id: 'a', label: '1' },
        { id: 'b', label: '3' },
        { id: 'c', label: '4' },
        { id: 'd', label: '2' },
      ],
      answerId: 'b',
      hint: 'j starts at 1. Count the values of j for which j <= 3 is true.',
      explanation: 'j <= 3 is true for j = 1, 2 and 3, so the body runs 3 times. When j becomes 4 the condition is false.',
      verify: { kind: 'inner-iterations', patternId: 'star-triangle', params: { rows: 4 }, row: 3 },
    },
    {
      id: 'triangle-condition',
      kind: 'condition',
      prompt: 'i = 2 and j has just become 3. Is the inner condition j <= i true or false?',
      options: [
        { id: 'true', label: 'True' },
        { id: 'false', label: 'False' },
      ],
      answerId: 'false',
      hint: 'Substitute the values: is 3 <= 2?',
      explanation: '3 <= 2 is false, so the inner loop ends and printf("\\n"); runs. Row 2 has 2 stars.',
    },
    {
      id: 'triangle-total',
      kind: 'iterations',
      prompt: 'How many stars does the 4-row triangle print altogether?',
      options: [
        { id: 'a', label: '8' },
        { id: 'b', label: '16' },
        { id: 'c', label: '10' },
        { id: 'd', label: '4' },
      ],
      answerId: 'c',
      hint: 'Add the stars on each row: row 1 has 1, row 2 has 2, …',
      explanation: '1 + 2 + 3 + 4 = 10 stars.',
      verify: { kind: 'total-symbols', patternId: 'star-triangle', params: { rows: 4 } },
    },
    {
      id: 'triangle-spot-mistake',
      kind: 'spot-mistake',
      prompt: 'A student wrote this inner loop. What is wrong with it?',
      code: 'for (j = 1; j <= i; i++)\n{\n    printf("* ");\n}',
      options: [
        { id: 'a', label: 'j should start at 0.' },
        { id: 'b', label: 'The update changes i instead of j, so j <= i never becomes false and the loop does not stop.' },
        { id: 'c', label: 'printf must come before the for statement.' },
        { id: 'd', label: 'Nothing — it prints the same triangle.' },
      ],
      answerId: 'b',
      hint: 'Look at the third part of the for header. Which variable does it change?',
      explanation:
        'The update is i++, so j stays 1 while i keeps growing. The condition 1 <= i stays true, so the inner loop never ends. The update must be j++.',
    },
  ],
};
