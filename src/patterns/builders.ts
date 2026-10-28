import type { ComparisonOp, Expr, PatternProgram, UpdateOp } from '../engine/types';

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
