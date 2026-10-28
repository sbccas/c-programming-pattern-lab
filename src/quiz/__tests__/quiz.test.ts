import { describe, expect, it } from 'vitest';
import { executePattern, outputRows } from '../../engine/executePattern';
import { PATTERNS, getPattern } from '../../patterns';
import { ALL_QUESTIONS } from '../questions';
import type { QuizQuestion } from '../types';

/** Derive the correct answer text from the simulator for a verifiable question. */
function engineAnswer(q: QuizQuestion): string {
  const v = q.verify!;
  const pattern = getPattern(v.patternId);
  if (!pattern) throw new Error(`Unknown pattern ${v.patternId}`);
  const sim = executePattern(pattern, v.params);
  const rows = outputRows(sim.finalOutput).map((r) => r.trimEnd());
  switch (v.kind) {
    case 'final-output':
      return rows.join('\n');
    case 'row':
      return rows[v.row - 1]!;
    case 'total-symbols':
      return String(sim.states[sim.states.length - 1]!.symbolsPrinted);
    case 'inner-iterations': {
      const outerTrue = sim.events.filter((e) => e.type === 'CONDITION_CHECK' && e.loop === 'outer' && e.result);
      const start = outerTrue[v.row - 1]!.index;
      const end = outerTrue[v.row]?.index ?? sim.events.length;
      return String(
        sim.events.slice(start, end).filter((e) => e.type === 'CONDITION_CHECK' && e.loop === 'inner' && e.result).length,
      );
    }
  }
}

describe('quiz questions', () => {
  it('have unique ids, valid answers and complete feedback', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of ALL_QUESTIONS) {
      expect(q.options.map((o) => o.id)).toContain(q.answerId);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
      expect(q.hint.length).toBeGreaterThan(5);
      expect(q.explanation.length).toBeGreaterThan(5);
    }
  });

  it('include every pattern quiz', () => {
    for (const p of PATTERNS) for (const q of p.quiz) expect(ALL_QUESTIONS).toContain(q);
  });

  const verifiable = ALL_QUESTIONS.filter((q) => q.verify);
  it('has engine-verified questions', () => expect(verifiable.length).toBeGreaterThanOrEqual(8));

  for (const q of verifiable) {
    it(`${q.id}: the marked answer matches the simulator`, () => {
      const correct = q.options.find((o) => o.id === q.answerId)!;
      expect(correct.label).toBe(engineAnswer(q));
      // No wrong option may also equal the simulator answer.
      for (const o of q.options) if (o.id !== q.answerId) expect(o.label).not.toBe(engineAnswer(q));
    });
  }
});
