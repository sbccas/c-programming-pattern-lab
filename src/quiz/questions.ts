import { PATTERNS } from '../patterns';
import type { QuizQuestion } from './types';

/** General nested-loop questions that are not tied to a single pattern. */
export const GENERAL_QUESTIONS: QuizQuestion[] = [
  {
    id: 'general-order',
    kind: 'condition',
    prompt: 'In a for loop, the body has just finished. What happens next?',
    code: 'for (j = 1; j <= i; j++)',
    options: [
      { id: 'a', label: 'j = 1 runs again, then the condition is checked.' },
      { id: 'b', label: 'The condition j <= i is checked, then j++ runs.' },
      { id: 'c', label: 'The update j++ runs, then the condition j <= i is checked.' },
      { id: 'd', label: 'The loop always ends after the body.' },
    ],
    answerId: 'c',
    hint: 'The initialisation runs only once when the loop starts. Which part runs at the end of every pass?',
    explanation:
      'The order is: initialise once → check → body → update → check → body → update → … The loop ends when a check is false.',
  },
  {
    id: 'general-inner-init-count',
    kind: 'iterations',
    prompt: 'The outer loop body runs 4 times, and the inner for statement is inside it. How many times does the inner initialisation j = 1 run?',
    options: [
      { id: 'a', label: '1' },
      { id: 'b', label: '4' },
      { id: 'c', label: '5' },
      { id: 'd', label: 'It depends on the inner limit.' },
    ],
    answerId: 'b',
    hint: 'The initialisation runs every time execution reaches the inner for statement.',
    explanation: 'Each pass of the outer body reaches the inner for statement once, so j = 1 runs 4 times — once per row.',
  },
  {
    id: 'general-newline-position',
    kind: 'spot-mistake',
    prompt: 'This code prints all the stars on one long line instead of a rectangle. What is wrong?',
    code: 'for (i = 1; i <= 3; i++)\n{\n    for (j = 1; j <= 4; j++)\n    {\n        printf("* ");\n    }\n}\nprintf("\\n");',
    options: [
      { id: 'a', label: 'printf("\\n"); is outside the outer loop, so it runs only once, at the very end.' },
      { id: 'b', label: 'The inner condition should be j < 4.' },
      { id: 'c', label: 'printf("* "); should be printf("*");' },
      { id: 'd', label: 'i should start at 0.' },
    ],
    answerId: 'a',
    hint: 'Count the braces. Which loop is printf("\\n"); inside?',
    explanation:
      'To end every row, printf("\\n"); must be inside the outer loop body, after the inner loop. Here it is after the outer loop, so it runs once.',
  },
  {
    id: 'general-same-line',
    kind: 'identify-output',
    prompt: 'Which statement prints a star and keeps the cursor on the same line?',
    options: [
      { id: 'a', label: 'printf("*\\n");', mono: true },
      { id: 'b', label: 'printf("\\n");', mono: true },
      { id: 'c', label: 'printf("* ");', mono: true },
      { id: 'd', label: 'printf("\\n* ");', mono: true },
    ],
    answerId: 'c',
    hint: '\\n moves the cursor to the next line. Which option has no \\n?',
    explanation: 'printf("* "); prints a star and a space only. Every other option contains \\n, which moves to a new line.',
  },
];

/** Every question in the lab: pattern quizzes first (in teaching order), then general ones. */
export const ALL_QUESTIONS: QuizQuestion[] = [...PATTERNS.flatMap((p) => p.quiz), ...GENERAL_QUESTIONS];
