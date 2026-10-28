import type { ComparisonOp, Expr, PatternProgram, Statement, UpdateOp } from '../engine/types';
import type { ExplanationCard } from './types';

export const lit = (value: number): Expr => ({ kind: 'literal', value });
export const param = (name: string): Expr => ({ kind: 'param', name });
export const ref = (name: string): Expr => ({ kind: 'var', name });

interface LoopSpec {
  init: Expr;
  op: ComparisonOp;
  limit: Expr;
  update: UpdateOp;
}

/**
 * The shape shared by every Version 1 pattern:
 *
 *   for (i = …; i … ; i±±)
 *   {
 *       for (j = …; j … ; j±±)
 *       {
 *           printf(<format>, <args>);
 *       }
 *       printf("\n");
 *   }
 */
export function nestedLoopProgram(outer: LoopSpec, inner: LoopSpec, print: { format: string; args: string[] }): PatternProgram {
  return {
    variables: ['i', 'j'],
    body: [
      {
        kind: 'for',
        id: 'outer',
        role: 'outer',
        variable: 'i',
        init: outer.init,
        condition: { left: 'i', op: outer.op, right: outer.limit },
        update: outer.update,
        body: [
          {
            kind: 'for',
            id: 'inner',
            role: 'inner',
            variable: 'j',
            init: inner.init,
            condition: { left: 'j', op: inner.op, right: inner.limit },
            update: inner.update,
            body: [{ kind: 'printf', id: 'print', format: print.format, args: print.args }],
          },
          { kind: 'printf', id: 'newline', format: '\n', args: [] },
        ],
      },
    ],
  };
}

/** Join rows into program output: each row is followed by a newline. */
export const linesToOutput = (rows: string[]): string => rows.map((row) => `${row}\n`).join('');

/** Explanation cards for the classic shape: outer loop, inner loop, printf, newline. */
export function standardCards(e: { outerLoop: string; innerLoop: string; output: string; newline: string }): ExplanationCard[] {
  return [
    { title: 'Outer loop', loopId: 'outer', text: e.outerLoop },
    { title: 'Inner loop', loopId: 'inner', text: e.innerLoop },
    { title: 'Output statement', partId: 'print', text: e.output },
    { title: 'Newline', partId: 'newline', text: e.newline },
  ];
}

// ---------------------------------------------------------------------------
// Pyramids: an outer loop with TWO inner loops — spaces first, then symbols.
// ---------------------------------------------------------------------------

const sub = (left: Expr, right: Expr): Expr => ({ kind: 'binary', op: '-', left, right });
const mul = (left: Expr, right: Expr): Expr => ({ kind: 'binary', op: '*', left, right });
export const exprs = { sub, mul };

interface PyramidSpec {
  /** Prefix that keeps code-part ids unique when two pyramids share one program. */
  prefix?: string;
  outerLabel?: string;
  /** Outer loop: `for (i = init; i op limit; i update)`. */
  outer: LoopSpec;
  /** Limit of the stars/numbers loop (e.g. `i` or `2 * i - 1`). */
  symbolLimit: Expr;
  print: { format: string; args: string[] };
  symbolLabel: string;
}

/**
 *   for (i = …; …; …)
 *   {
 *       for (j = 1; j <= rows - i; j++)   // spaces loop
 *       {
 *           printf(" ");
 *       }
 *       for (k = 1; k <= <symbolLimit>; k++)   // symbols loop
 *       {
 *           printf(<format>, <args>);
 *       }
 *       printf("\n");
 *   }
 */
export function pyramidLoop(spec: PyramidSpec): Statement {
  const p = spec.prefix ?? '';
  const id = (name: string) => (p ? `${p}${name.charAt(0).toUpperCase()}${name.slice(1)}` : name);
  return {
    kind: 'for',
    id: p ? p : 'outer',
    role: 'outer',
    label: spec.outerLabel,
    variable: 'i',
    init: spec.outer.init,
    condition: { left: 'i', op: spec.outer.op, right: spec.outer.limit },
    update: spec.outer.update,
    body: [
      {
        kind: 'for',
        id: id('spaces'),
        role: 'inner',
        label: 'spaces',
        variable: 'j',
        init: lit(1),
        condition: { left: 'j', op: '<=', right: sub(param('rows'), ref('i')) },
        update: '++',
        body: [{ kind: 'printf', id: id('printSpace'), format: ' ', args: [] }],
      },
      {
        kind: 'for',
        id: id(spec.symbolLabel),
        role: 'inner',
        label: spec.symbolLabel,
        variable: 'k',
        init: lit(1),
        condition: { left: 'k', op: '<=', right: spec.symbolLimit },
        update: '++',
        body: [{ kind: 'printf', id: id('print'), format: spec.print.format, args: spec.print.args }],
      },
      { kind: 'printf', id: id('newline'), format: '\n', args: [] },
    ],
  };
}

export const PYRAMID_VARIABLES = ['i', 'j', 'k'];

export function pyramidProgram(spec: PyramidSpec): PatternProgram {
  return { variables: PYRAMID_VARIABLES, body: [pyramidLoop(spec)] };
}

export const PYRAMID_ROLES = { i: 'outer loop · rows', j: 'spaces loop', k: 'symbols loop' } as const;
