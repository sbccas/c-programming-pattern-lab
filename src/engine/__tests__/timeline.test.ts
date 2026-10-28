import { describe, expect, it } from 'vitest';
import { PATTERNS, getPattern } from '../../patterns';
import { buildTimeline, compare, MAX_EVENTS } from '../buildTimeline';
import { executePattern, outputRows } from '../executePattern';
import { exprToSource, renderSource } from '../renderSource';
import { replayState } from '../replayState';
import type { ConditionCheckEvent, Expr, PatternProgram, SimulationEvent, Statement } from '../types';

const pattern = (id: string) => {
  const p = getPattern(id);
  if (!p) throw new Error(`missing pattern ${id}`);
  return p;
};

/** Compact, readable signature of an event for order assertions. */
function sig(e: SimulationEvent): string {
  switch (e.type) {
    case 'INIT_VARIABLE':
      return `init ${e.variable}=${e.value}`;
    case 'CONDITION_CHECK':
      return `check ${e.substituted} ${e.result}`;
    case 'OUTPUT':
      return `print "${e.text}"`;
    case 'NEWLINE':
      return 'newline';
    case 'INCREMENT':
    case 'DECREMENT':
      return `${e.variable} ${e.from}->${e.to}`;
    case 'PROGRAM_END':
      return 'end';
  }
}

describe('star triangle — PRD section 11 first-row sequence', () => {
  const sim = executePattern(pattern('star-triangle'), { rows: 4 });

  it('follows the exact documented order for the first row', () => {
    expect(sim.events.slice(0, 10).map(sig)).toEqual([
      'init i=1',
      'check 1 <= 4 true',
      'init j=1',
      'check 1 <= 1 true',
      'print "* "',
      'j 1->2',
      'check 2 <= 1 false',
      'newline',
      'i 1->2',
      'check 2 <= 4 true',
    ]);
  });

  it('highlights the matching code part for each of those events', () => {
    expect(sim.events.slice(0, 10).map((e) => e.code)).toEqual([
      'i = 1',
      'i <= 4',
      'j = 1',
      'j <= i',
      'printf("* ");',
      'j++',
      'j <= i',
      'printf("\\n");',
      'i++',
      'i <= 4',
    ]);
  });

  it('re-initialises j = 1 at the start of every row, right after a true outer check', () => {
    const inits = sim.events.filter((e) => e.type === 'INIT_VARIABLE' && e.variable === 'j');
    expect(inits).toHaveLength(4);
    for (const init of inits) {
      const prev = sim.events[init.index - 1] as ConditionCheckEvent;
      expect(prev.type).toBe('CONDITION_CHECK');
      expect(prev.loop).toBe('outer');
      expect(prev.result).toBe(true);
      // j carries its old (larger) value from the previous row until this event.
      if (init.index > 2) expect(init.varsBefore.j).toBeGreaterThan(1);
      expect(init.varsAfter.j).toBe(1);
    }
  });

  it('never runs the outer update before the inner loop and the newline have finished', () => {
    sim.events.forEach((e) => {
      if (e.type === 'INCREMENT' && e.variable === 'i') {
        expect(sim.events[e.index - 1]!.type).toBe('NEWLINE');
        expect(sim.events[e.index - 2]).toMatchObject({ type: 'CONDITION_CHECK', loop: 'inner', result: false });
      }
    });
  });

  it('produces the exact output with trailing spaces and newlines', () => {
    expect(sim.finalOutput).toBe('* \n* * \n* * * \n* * * * \n');
  });

  it('ends with a false outer check followed by PROGRAM_END', () => {
    const tail = sim.events.slice(-2).map(sig);
    expect(tail).toEqual(['check 5 <= 4 false', 'end']);
    expect(sim.states[sim.states.length - 1]!.finished).toBe(true);
    expect(sim.states.filter((s) => s.finished)).toHaveLength(1);
  });

  it('has the event count implied by the loop semantics', () => {
    // outer: init + (rows+1) checks + rows updates; per row r: init + (r+1) checks + r prints + r updates + newline; end.
    const rows = 4;
    let expected = 1 + (rows + 1) + rows + 1;
    for (let r = 1; r <= rows; r++) expected += 1 + (r + 1) + r + r + 1;
    expect(sim.events).toHaveLength(expected);
  });
});

/**
 * Independent oracle for C control flow, worked out from the program's
 * structure (not from the interpreter): which code part must run next.
 */
function controlFlow(program: PatternProgram) {
  const following = new Map<string, string>(); // part that runs after a statement completes
  const bodyStart = new Map<string, string>(); // first part of a loop body
  const firstPart = (s: Statement) => (s.kind === 'for' ? `${s.id}.init` : s.kind === 'printf' ? s.id : null);
  const walk = (stmts: readonly Statement[], after: string) => {
    const real = stmts.filter((s) => s.kind !== 'comment');
    real.forEach((s, k) => {
      const next = real[k + 1];
      const afterThis = next ? firstPart(next)! : after;
      if (s.kind === 'for') {
        following.set(s.id, afterThis);
        const firstInBody = s.body.find((b) => b.kind !== 'comment');
        bodyStart.set(s.id, firstInBody ? firstPart(firstInBody)! : `${s.id}.update`);
        walk(s.body, `${s.id}.update`);
      } else if (s.kind === 'printf') {
        following.set(s.id, afterThis);
      }
    });
  };
  walk(program.body, 'return');
  const first = program.body.find((s) => s.kind !== 'comment');
  return {
    /** The first code part main() executes. */
    start: first ? firstPart(first)! : 'return',
    expectedNext(e: SimulationEvent): string | null {
      const loopId = e.partId.split('.')[0]!;
      switch (e.type) {
        case 'INIT_VARIABLE':
        case 'INCREMENT':
        case 'DECREMENT':
          return `${loopId}.condition`;
        case 'CONDITION_CHECK':
          return e.result ? bodyStart.get(loopId)! : following.get(loopId)!;
        case 'OUTPUT':
        case 'NEWLINE':
          return following.get(e.partId)!;
        case 'PROGRAM_END':
          return null;
      }
    },
  };
}

describe('loop semantics across every pattern and every allowed parameter value', () => {
  for (const p of PATTERNS) {
    const spec = p.params[0]!;
    const flow = controlFlow(p.program);
    for (let value = spec.min; value <= spec.max; value++) {
      const params = Object.fromEntries(p.params.map((s) => [s.name, s.name === spec.name ? value : s.default]));
      it(`${p.id} with ${JSON.stringify(params)} obeys C for-loop order`, () => {
        const sim = executePattern(p, params);
        const events = sim.events;

        // Every condition result matches its operands.
        for (const e of events) {
          if (e.type === 'CONDITION_CHECK') expect(e.result).toBe(compare(e.leftValue, e.op, e.rightValue));
        }

        // Every step is followed by exactly the code part C would run next.
        expect(events[0]!.partId).toBe(flow.start);
        events.forEach((e, k) => {
          const expected = flow.expectedNext(e);
          if (expected === null) expect(k).toBe(events.length - 1);
          else expect(events[k + 1]?.partId, `after step ${k + 1} (${e.partId})`).toBe(expected);
        });

        // Each update is followed immediately by a check of the same loop.
        events.forEach((e, k) => {
          if (e.type === 'INCREMENT' || e.type === 'DECREMENT') {
            expect(events[k + 1]).toMatchObject({ type: 'CONDITION_CHECK', loop: e.loop });
            expect(e.to).toBe(e.type === 'INCREMENT' ? e.from + 1 : e.from - 1);
          }
        });

        // Variables only change on INIT / update events.
        for (const e of events) {
          const changed = Object.keys(e.varsAfter).filter((v) => e.varsAfter[v] !== e.varsBefore[v]);
          if (e.type === 'INIT_VARIABLE' || e.type === 'INCREMENT' || e.type === 'DECREMENT') {
            expect(changed.length).toBeLessThanOrEqual(1);
          } else {
            expect(changed).toEqual([]);
          }
        }

        // One row of output per true outer check, and one newline per row.
        const outerTrue = events.filter((e) => e.type === 'CONDITION_CHECK' && e.loop === 'outer' && e.result).length;
        expect(events.filter((e) => e.type === 'NEWLINE')).toHaveLength(outerTrue);
        expect(outputRows(sim.finalOutput)).toHaveLength(outerTrue);
        expect(sim.finalOutput.endsWith('\n')).toBe(true);

        // Exactly one PROGRAM_END, and it is last.
        expect(events.filter((e) => e.type === 'PROGRAM_END')).toHaveLength(1);
        expect(events[events.length - 1]!.type).toBe('PROGRAM_END');

        // Indices are stable and sequential.
        events.forEach((e, k) => expect(e.index).toBe(k));
      });
    }
  }
});

describe('snapshots, replay and backward stepping', () => {
  const sim = executePattern(pattern('number-triangle'), { rows: 5 });

  it('has one state per position, starting from an uninitialised state', () => {
    expect(sim.states).toHaveLength(sim.events.length + 1);
    expect(sim.states[0]).toMatchObject({ position: 0, event: null, output: '', vars: { i: null, j: null }, finished: false });
  });

  it('state variables equal the interpreter values recorded on every event', () => {
    sim.events.forEach((e, k) => {
      expect(sim.states[k + 1]!.vars).toEqual(e.varsAfter);
      expect(sim.states[k]!.vars).toEqual(e.varsBefore);
      expect(sim.states[k + 1]!.event).toBe(e);
    });
  });

  it('output at every position equals the concatenation of all output events so far', () => {
    let acc = '';
    sim.events.forEach((e, k) => {
      if (e.type === 'OUTPUT' || e.type === 'NEWLINE') acc += e.text;
      expect(sim.states[k + 1]!.output).toBe(acc);
    });
  });

  it('replaying from scratch reproduces every snapshot exactly (forward and backward)', () => {
    const positions = [...Array(sim.states.length).keys()];
    for (const p of [...positions, ...positions.reverse()]) {
      expect(replayState(['i', 'j'], sim.events, p)).toEqual(sim.states[p]);
    }
  });

  it('tracks outer and inner passes', () => {
    const lastPrintOfRow3 = sim.states.find((s) => s.output === '1 \n1 2 \n1 2 3 ');
    expect(lastPrintOfRow3).toMatchObject({ outerPass: 3, innerPass: 3, symbolsPrinted: 6 });
  });

  it('is deterministic for repeated runs', () => {
    const again = executePattern(pattern('number-triangle'), { rows: 5 });
    expect(again.events).toEqual(sim.events);
    expect(again.states).toEqual(sim.states);
  });
});

describe('decrementing outer loop (inverted triangle)', () => {
  const sim = executePattern(pattern('inverted-triangle'), { rows: 4 });

  it('starts at the parameter value and decrements i', () => {
    expect(sim.events.slice(0, 3).map(sig)).toEqual(['init i=4', 'check 4 >= 1 true', 'init j=1']);
    const decrements = sim.events.filter((e) => e.type === 'DECREMENT').map(sig);
    expect(decrements).toEqual(['i 4->3', 'i 3->2', 'i 2->1', 'i 1->0']);
    expect(sim.events.some((e) => e.type === 'INCREMENT' && e.variable === 'i')).toBe(false);
  });

  it('stops when i becomes 0', () => {
    expect(sim.events.slice(-2).map(sig)).toEqual(['check 0 >= 1 false', 'end']);
    expect(sim.states[sim.states.length - 1]!.vars).toEqual({ i: 0, j: 2 });
  });
});

describe('printf formatting', () => {
  it('substitutes %d with the current variable value and keeps the space', () => {
    const sim = executePattern(pattern('repeated-row-number'), { rows: 3 });
    const prints = sim.events.filter((e) => e.type === 'OUTPUT').map((e) => (e.type === 'OUTPUT' ? e.text : ''));
    expect(prints).toEqual(['1 ', '2 ', '2 ', '3 ', '3 ', '3 ']);
  });
});

describe('pyramids: two inner loops in one outer body', () => {
  const sim = executePattern(pattern('star-pyramid'), { rows: 4 });

  it('follows the exact first-row order: spaces loop, then stars loop, then newline', () => {
    expect(sim.events.slice(0, 18).map(sig)).toEqual([
      'init i=1',
      'check 1 <= 4 true',
      'init j=1',
      'check 1 <= 3 true', // j <= 4 - i with i = 1
      'print " "',
      'j 1->2',
      'check 2 <= 3 true',
      'print " "',
      'j 2->3',
      'check 3 <= 3 true',
      'print " "',
      'j 3->4',
      'check 4 <= 3 false', // spaces loop ends …
      'init k=1', // … and only then does the stars loop start
      'check 1 <= 1 true',
      'print "* "',
      'k 1->2',
      'check 2 <= 1 false',
    ]);
    expect(sim.events[18]!.type).toBe('NEWLINE');
  });

  it('prints rows - i spaces and i stars on every row', () => {
    expect(outputRows(sim.finalOutput)).toEqual(['   * ', '  * * ', ' * * * ', '* * * * ']);
    for (const rows of [1, 5, 10]) {
      const out = outputRows(executePattern(pattern('star-pyramid'), { rows }).finalOutput);
      out.forEach((row, k) => {
        const i = k + 1;
        expect(row).toBe(' '.repeat(rows - i) + '* '.repeat(i));
      });
    }
  });

  it('shows arithmetic limits in the code and works them out in the explanation', () => {
    const check = sim.events.find((e) => e.type === 'CONDITION_CHECK' && e.loopId === 'spaces') as ConditionCheckEvent;
    expect(check.expression).toBe('j <= 4 - i');
    expect(check.substituted).toBe('1 <= 3');
    expect(check.explanation).toContain('here 4 - i = 3');
    expect(check.label).toBe('Check spaces condition: true');
    expect(sim.source.text).toContain('for (j = 1; j <= 4 - i; j++)');
    expect(sim.source.text).toContain('int i, j, k;');
  });

  it('counts only visible symbols, not spaces', () => {
    expect(sim.states[sim.states.length - 1]!.symbolsPrinted).toBe(10);
  });

  it('evaluates 2 * i - 1 on every check of the odd-star pyramid', () => {
    const odd = executePattern(pattern('odd-star-pyramid'), { rows: 5 });
    expect(odd.source.text).toContain('for (k = 1; k <= 2 * i - 1; k++)');
    expect(outputRows(odd.finalOutput).map((r) => r.trim().length)).toEqual([1, 3, 5, 7, 9]);
    const limits = odd.events
      .filter((e): e is ConditionCheckEvent => e.type === 'CONDITION_CHECK' && e.loopId === 'stars' && !e.result)
      .map((e) => e.rightValue);
    expect(limits).toEqual([1, 3, 5, 7, 9]);
  });
});

describe('diamond: two outer loops in sequence', () => {
  const sim = executePattern(pattern('diamond'), { rows: 4 });

  it('renders both halves as real C, with comments and the folded start value', () => {
    expect(sim.source.text).toBe(`#include <stdio.h>

int main(void)
{
    int i, j, k;

    // upper half: the pyramid grows
    for (i = 1; i <= 4; i++)
    {
        for (j = 1; j <= 4 - i; j++)
        {
            printf(" ");
        }
        for (k = 1; k <= i; k++)
        {
            printf("* ");
        }
        printf("\\n");
    }

    // lower half: the pyramid shrinks
    for (i = 3; i >= 1; i--)
    {
        for (j = 1; j <= 4 - i; j++)
        {
            printf(" ");
        }
        for (k = 1; k <= i; k++)
        {
            printf("* ");
        }
        printf("\\n");
    }

    return 0;
}
`);
  });

  it('starts the lower half only after the upper half ends, at i = rows - 1', () => {
    const upperEnd = sim.events.findIndex((e) => e.type === 'CONDITION_CHECK' && e.loopId === 'upper' && !e.result);
    expect(sig(sim.events[upperEnd]!)).toBe('check 5 <= 4 false');
    expect(sim.events[upperEnd + 1]).toMatchObject({ type: 'INIT_VARIABLE', loopId: 'lower', variable: 'i', value: 3 });
    expect(sim.events.slice(0, upperEnd).some((e) => e.loopId?.startsWith('lower'))).toBe(false);
    expect(sim.events[sim.events.length - 2]).toMatchObject({ type: 'CONDITION_CHECK', loopId: 'lower', result: false, substituted: '0 >= 1' });
  });

  it('prints 2 × rows − 1 rows with the widest row only once', () => {
    expect(outputRows(sim.finalOutput)).toEqual(['   * ', '  * * ', ' * * * ', '* * * * ', ' * * * ', '  * * ', '   * ']);
    for (let rows = 1; rows <= 9; rows++) {
      const out = outputRows(executePattern(pattern('diamond'), { rows }).finalOutput);
      expect(out).toHaveLength(2 * rows - 1);
      expect(out.filter((r) => r === '* '.repeat(rows))).toHaveLength(1);
      expect(out).toEqual([...out].reverse()); // symmetric top to bottom
    }
  });
});

describe('expression rendering', () => {
  it('folds constant parts and keeps variables', () => {
    const lit = (value: number) => ({ kind: 'literal' as const, value });
    const ref = (name: string) => ({ kind: 'var' as const, name });
    const param = (name: string) => ({ kind: 'param' as const, name });
    const bin = (op: '+' | '-' | '*', left: Expr, right: Expr): Expr => ({ kind: 'binary', op, left, right });
    expect(exprToSource(bin('-', param('rows'), lit(1)), { rows: 4 })).toBe('3');
    expect(exprToSource(bin('-', param('rows'), ref('i')), { rows: 4 })).toBe('4 - i');
    expect(exprToSource(bin('-', bin('*', lit(2), ref('i')), lit(1)), {})).toBe('2 * i - 1');
    expect(exprToSource(bin('*', lit(2), bin('-', ref('i'), lit(1))), {})).toBe('2 * (i - 1)');
    expect(exprToSource(bin('-', lit(9), bin('-', ref('i'), lit(1))), {})).toBe('9 - (i - 1)');
  });

  it('rejects duplicate code-part ids so highlights can never be ambiguous', () => {
    const loop = (id: string): Statement => ({
      kind: 'for', id, role: 'outer', variable: 'i', init: { kind: 'literal', value: 1 },
      condition: { left: 'i', op: '<=', right: { kind: 'literal', value: 1 } }, update: '++', body: [],
    });
    expect(() => renderSource({ variables: ['i'], body: [loop('a'), loop('a')] }, {})).toThrow(/Duplicate code part id/);
  });
});

describe('engine safety limits', () => {
  it('reports use of an uninitialised variable', () => {
    const program = {
      variables: ['i', 'j'],
      body: [{ kind: 'printf' as const, id: 'print', format: '%d ', args: ['j'] }],
    };
    const source = renderSource(program, {});
    expect(() => buildTimeline(program, {}, source)).toThrow(/before it is initialised/);
  });

  it('stops a runaway loop instead of freezing the browser', () => {
    const program = {
      variables: ['i'],
      body: [
        {
          kind: 'for' as const,
          id: 'outer',
          role: 'outer' as const,
          variable: 'i',
          init: { kind: 'literal' as const, value: 1 },
          condition: { left: 'i', op: '>=' as const, right: { kind: 'literal' as const, value: 1 } },
          update: '++' as const,
          body: [],
        },
      ],
    };
    const source = renderSource(program, {});
    expect(() => buildTimeline(program, {}, source)).toThrow(new RegExp(String(MAX_EVENTS)));
  });

  it('rejects invalid parameters with a plain-language message', () => {
    expect(() => executePattern(pattern('star-triangle'), { rows: 0 })).toThrow(/between 1 and 10/);
    expect(() => executePattern(pattern('star-triangle'), { rows: 11 })).toThrow(/between 1 and 10/);
    expect(() => executePattern(pattern('star-triangle'), { rows: 2.5 })).toThrow(/whole number/);
    expect(() => executePattern(pattern('star-triangle'), {})).toThrow(/required/);
  });
});
