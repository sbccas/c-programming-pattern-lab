import type {
  CodePartKind,
  Expr,
  ParamValues,
  PatternProgram,
  RenderedSource,
  SourceLine,
  SourceSegment,
  Statement,
} from './types';

const INDENT = '    ';

/** Code-part ids for the three parts of a `for` header. */
export const loopPartId = (loopId: string, part: 'init' | 'condition' | 'update'): string => `${loopId}.${part}`;
export const DECLARE_PART_ID = 'declare';
export const RETURN_PART_ID = 'return';

/** Display an expression as C source. Parameters appear as their current number. */
export function exprToSource(expr: Expr, params: ParamValues): string {
  switch (expr.kind) {
    case 'literal':
      return String(expr.value);
    case 'var':
      return expr.name;
    case 'param': {
      const value = params[expr.name];
      if (value === undefined) {
        throw new Error(`Missing value for parameter "${expr.name}".`);
      }
      return String(value);
    }
  }
}

/** Escape runtime text back into a C string literal body (e.g. newline → `\n`). */
export function toCStringLiteral(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
}

export function printfToSource(format: string, args: readonly string[]): string {
  const argText = args.length > 0 ? `, ${args.join(', ')}` : '';
  return `printf("${toCStringLiteral(format)}"${argText});`;
}

/** A `printf` whose only output is a newline is shown as a newline statement. */
export function isNewlinePrintf(format: string, args: readonly string[]): boolean {
  return format === '\n' && args.length === 0;
}

/**
 * Render a structured pattern program as the exact C source shown to students.
 * Every highlightable part (loop init/condition/update, printf, return) is
 * tagged with a part id so the code panel can highlight it for each event.
 */
export function renderSource(program: PatternProgram, params: ParamValues): RenderedSource {
  const lines: SourceLine[] = [];
  const partLines: Record<string, number> = {};
  const partText: Record<string, string> = {};

  const push = (segments: SourceSegment[]) => {
    const number = lines.length + 1;
    for (const seg of segments) {
      if (seg.partId) {
        partLines[seg.partId] = number;
        partText[seg.partId] = seg.text;
      }
    }
    lines.push({ number, segments });
  };
  const plain = (text: string): SourceSegment => ({ text });
  const part = (text: string, partId: string, partKind: CodePartKind): SourceSegment => ({ text, partId, partKind });

  const renderStatements = (statements: readonly Statement[], depth: number) => {
    const pad = INDENT.repeat(depth);
    for (const stmt of statements) {
      if (stmt.kind === 'for') {
        const v = stmt.variable;
        push([
          plain(`${pad}for (`),
          part(`${v} = ${exprToSource(stmt.init, params)}`, loopPartId(stmt.id, 'init'), 'init'),
          plain('; '),
          part(
            `${stmt.condition.left} ${stmt.condition.op} ${exprToSource(stmt.condition.right, params)}`,
            loopPartId(stmt.id, 'condition'),
            'condition',
          ),
          plain('; '),
          part(`${v}${stmt.update}`, loopPartId(stmt.id, 'update'), 'update'),
          plain(')'),
        ]);
        push([plain(`${pad}{`)]);
        renderStatements(stmt.body, depth + 1);
        push([plain(`${pad}}`)]);
      } else {
        const kind: CodePartKind = isNewlinePrintf(stmt.format, stmt.args) ? 'newline' : 'output';
        push([plain(pad), part(printfToSource(stmt.format, stmt.args), stmt.id, kind)]);
      }
    }
  };

  push([plain('#include <stdio.h>')]);
  push([plain('')]);
  push([plain('int main(void)')]);
  push([plain('{')]);
  push([plain(INDENT), part(`int ${program.variables.join(', ')};`, DECLARE_PART_ID, 'declare')]);
  push([plain('')]);
  renderStatements(program.body, 1);
  push([plain('')]);
  push([plain(INDENT), part('return 0;', RETURN_PART_ID, 'return')]);
  push([plain('}')]);

  const text = lines.map((line) => line.segments.map((s) => s.text).join('')).join('\n') + '\n';
  return { lines, text, partLines, partText };
}
