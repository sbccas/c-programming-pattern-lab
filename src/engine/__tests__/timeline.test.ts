import { describe, expect, it } from 'vitest';
import { getPattern } from '../../patterns';
import { buildTimeline, compare, MAX_EVENTS } from '../buildTimeline';
import { executePattern, outputRows } from '../executePattern';
import { renderSource } from '../renderSource';
import { replayState } from '../replayState';
import type { ConditionCheckEvent, SimulationEvent } from '../types';

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

describe('loop semantics across every pattern and every allowed parameter value', () => {
  const ids = ['rectangle', 'square', 'repeated-row-number', 'star-triangle', 'number-triangle', 'inverted-triangle', 'inverted-number-triangle'];

  for (const id of ids) {
    const p = pattern(id);
    const spec = p.params[0]!;
    for (let value = spec.min; value <= spec.max; value++) {
      const params = Object.fromEntries(p.params.map((s) => [s.name, s.name === spec.name ? value : s.default]));
      it(`${id} with ${JSON.stringify(params)} obeys C for-loop order`, () => {
        const sim = executePattern(p, params);
        const events = sim.events;

        // Every condition result matches its operands.
        for (const e of events) {
          if (e.type === 'CONDITION_CHECK') expect(e.result).toBe(compare(e.leftValue, e.op, e.rightValue));
        }

        // After a true check the loop body starts; after a false inner check comes the newline.
        events.forEach((e, k) => {
          const next = events[k + 1];
          if (e.type !== 'CONDITION_CHECK') return;
          if (e.loop === 'outer') expect(next?.type).toBe(e.result ? 'INIT_VARIABLE' : 'PROGRAM_END');
          if (e.loop === 'inner') expect(next?.type).toBe(e.result ? 'OUTPUT' : 'NEWLINE');
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
