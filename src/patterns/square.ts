import { linesToOutput, lit, nestedLoopProgram, param, standardCards } from './builders';
import type { PatternDefinition } from './types';

export const square: PatternDefinition = {
  id: 'square',
  title: 'Square of Stars',
  summary: 'Use the same limit for both loops to get a square.',
  description:
    'A square is a rectangle whose number of rows equals the number of stars per row. Both loops use the same limit, so changing one number changes both dimensions.',
  category: 'Basic repetition',
  level: 1,
  difficulty: 'Beginner',
  objective: 'Understand how the two loop limits decide the height and width of the output.',
  goals: [
    'Both loops use the same fixed limit.',
    'The outer limit gives the height; the inner limit gives the width.',
    'The inner loop variable j starts again from 1 on every row.',
  ],
  params: [{ name: 'size', label: 'Size', description: 'Limit of both loops (rows and stars per row).', min: 1, max: 10, default: 4 }],
  program: nestedLoopProgram(
    { init: lit(1), op: '<=', limit: param('size'), update: '++' },
    { init: lit(1), op: '<=', limit: param('size'), update: '++' },
    { format: '* ', args: [] },
  ),
  expectedOutput: linesToOutput(['* * * * ', '* * * * ', '* * * * ', '* * * * ']),
  explain: ({ size = 4 }) => standardCards({
    outerLoop: `for (i = 1; i <= ${size}; i++) runs ${size} time${size === 1 ? '' : 's'}, giving ${size} row${size === 1 ? '' : 's'}.`,
    innerLoop: `for (j = 1; j <= ${size}; j++) also runs ${size} time${size === 1 ? '' : 's'} on every row, so each row has ${size} star${size === 1 ? '' : 's'}. Same height and width makes a square.`,
    output: 'printf("* "); prints one star and a space on the current line.',
    newline: 'printf("\\n"); runs after the inner loop ends, so each row finishes before the next one starts.',
  }),
  notes: ['Characters on a screen are taller than they are wide, so the square may look slightly tall. It still has equal rows and columns.'],
  quiz: [
    {
      id: 'square-choose-condition',
      kind: 'choose-condition',
      prompt: 'The outer loop is for (i = 1; i <= 5; i++). Which inner loop condition prints a 5 × 5 square?',
      options: [
        { id: 'a', label: 'j <= i', mono: true },
        { id: 'b', label: 'j < 5', mono: true },
        { id: 'c', label: 'j <= 5', mono: true },
        { id: 'd', label: 'j >= 5', mono: true },
      ],
      answerId: 'c',
      hint: 'Every row needs exactly 5 stars, and j starts at 1.',
      explanation:
        'j <= 5 is true for j = 1, 2, 3, 4, 5 — exactly 5 stars per row. j < 5 gives only 4 stars, j <= i gives a triangle, and j >= 5 is false immediately when j = 1.',
    },
    {
      id: 'square-next-value',
      kind: 'next-value',
      prompt: 'In the 4 × 4 square, j is 4 and the inner update j++ runs. What is the value of j now?',
      options: [
        { id: 'a', label: '4' },
        { id: 'b', label: '5' },
        { id: 'c', label: '1' },
        { id: 'd', label: '0' },
      ],
      answerId: 'b',
      hint: 'j++ adds 1 to j. It does not reset j — resetting only happens when the inner loop starts again.',
      explanation: 'j++ changes j from 4 to 5. The next check, j <= 4, is then false, so the inner loop ends.',
    },
    {
      id: 'square-total',
      kind: 'iterations',
      prompt: 'For a 3 × 3 square, how many stars are printed altogether?',
      options: [
        { id: 'a', label: '6' },
        { id: 'b', label: '3' },
        { id: 'c', label: '9' },
        { id: 'd', label: '12' },
      ],
      answerId: 'c',
      hint: 'Rows × stars per row.',
      explanation: '3 rows with 3 stars each: 3 × 3 = 9 stars.',
      verify: { kind: 'total-symbols', patternId: 'square', params: { size: 3 } },
    },
  ],
};
