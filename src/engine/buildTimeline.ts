import { DECLARE_PART_ID, RETURN_PART_ID, exprToSource, isNewlinePrintf, loopPartId, printfToSource } from './renderSource';
import type {
  ComparisonOp,
  Expr,
  ForLoopStatement,
  LoopRole,
  ParamValues,
  PatternProgram,
  PrintfStatement,
  RenderedSource,
  SimulationEvent,
  Statement,
  VarName,
  VariableValues,
} from './types';

/** Safety limit: a supported pattern never needs more events than this. */
export const MAX_EVENTS = 5000;

/** Distributes `Omit` over each member of the event union. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type EventDraft = DistributiveOmit<SimulationEvent, 'index' | 'line' | 'code' | 'varsBefore' | 'varsAfter'>;

export class SimulationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SimulationError';
  }
}

export function compare(left: number, op: ComparisonOp, right: number): boolean {
  switch (op) {
    case '<=':
      return left <= right;
    case '<':
      return left < right;
    case '>=':
      return left >= right;
    case '>':
      return left > right;
  }
}

const OP_WORDS: Record<ComparisonOp, string> = {
  '<=': 'less than or equal to',
  '<': 'less than',
  '>=': 'greater than or equal to',
  '>': 'greater than',
};

const loopName = (role: LoopRole) => (role === 'outer' ? 'outer loop' : 'inner loop');

/** Describe printed text for beginners, e.g. `"* "` → a star followed by a space. */
function describePrinted(text: string): string {
  const visible = text.replace(/ /g, '');
  const spaces = text.length - visible.length;
  const spaceWords = spaces === 0 ? '' : spaces === 1 ? ' followed by a space' : ` followed by ${spaces} spaces`;
  if (visible === '*') return `a star${spaceWords}`;
  return `"${visible}"${spaceWords}`;
}

/**
 * Execute a structured pattern program and record every observable event.
 *
 * Loop semantics follow C exactly for the supported subset:
 *   1. initialise the loop variable once on entering the `for` statement;
 *   2. evaluate the condition; if false, leave the loop;
 *   3. otherwise run the body, then the update, then go back to step 2.
 * An inner loop is a statement inside the outer body, so its initialisation
 * runs again every time the outer body reaches it.
 *
 * Step policy: there is no separate "leave loop" event. A CONDITION_CHECK with
 * result `false` is the moment the loop ends; the next event is the statement
 * after the loop (or PROGRAM_END after the outer loop).
 */
export function buildTimeline(
  program: PatternProgram,
  params: ParamValues,
  source: RenderedSource,
): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  const vars: Record<VarName, number | null> = Object.fromEntries(program.variables.map((v) => [v, null]));

  const readVar = (name: VarName): number => {
    if (!(name in vars)) {
      throw new SimulationError(`Variable "${name}" is not declared.`);
    }
    const value = vars[name];
    if (value === null || value === undefined) {
      throw new SimulationError(`Variable "${name}" is used before it is initialised.`);
    }
    return value;
  };

  const evalExpr = (expr: Expr): number => {
    switch (expr.kind) {
      case 'literal':
        return expr.value;
      case 'var':
        return readVar(expr.name);
      case 'param': {
        const value = params[expr.name];
        if (value === undefined) throw new SimulationError(`Missing value for parameter "${expr.name}".`);
        return value;
      }
    }
  };

  const emit = (partId: string, draft: EventDraft, mutate?: () => void) => {
    if (events.length >= MAX_EVENTS) {
      throw new SimulationError(`The simulation exceeded ${MAX_EVENTS} steps. Try smaller values.`);
    }
    const line = source.partLines[partId];
    const code = source.partText[partId];
    if (line === undefined || code === undefined) {
      throw new SimulationError(`Code part "${partId}" is missing from the rendered source.`);
    }
    const varsBefore: VariableValues = { ...vars };
    mutate?.();
    const varsAfter: VariableValues = { ...vars };
    events.push({ ...draft, index: events.length, line, code, varsBefore, varsAfter } as SimulationEvent);
  };

  const runLoop = (loop: ForLoopStatement) => {
    const v = loop.variable;
    const name = loopName(loop.role);
    const initValue = evalExpr(loop.init);
    const isInner = loop.role === 'inner';

    emit(
      loopPartId(loop.id, 'init'),
      {
        type: 'INIT_VARIABLE',
        partId: loopPartId(loop.id, 'init'),
        loop: loop.role,
        variable: v,
        value: initValue,
        label: isInner ? `Start inner loop: ${v} = ${initValue}` : `Start outer loop: ${v} = ${initValue}`,
        explanation: isInner
          ? `Execution enters the inner loop, so ${v} is set to ${initValue}. The inner loop starts again from ${v} = ${initValue} every time the outer loop body reaches it.`
          : `Execution enters the outer loop, so ${v} is set to ${initValue}. This initialisation happens only once.`,
      },
      () => {
        vars[v] = initValue;
      },
    );

    for (;;) {
      const { left, op, right } = loop.condition;
      const leftValue = readVar(left);
      const rightValue = evalExpr(right);
      const result = compare(leftValue, op, rightValue);
      const expression = `${left} ${op} ${exprToSource(right, params)}`;
      const substituted = `${leftValue} ${op} ${rightValue}`;
      const why = `${leftValue} is ${result ? '' : 'not '}${OP_WORDS[op]} ${rightValue}`;
      const consequence = result
        ? `so the ${name} body runs${isInner ? '' : ' (a new row starts)'}.`
        : isInner
          ? `so the inner loop ends. Execution continues with the statement after the inner loop.`
          : `so the outer loop ends. Execution continues after the outer loop.`;

      emit(loopPartId(loop.id, 'condition'), {
        type: 'CONDITION_CHECK',
        partId: loopPartId(loop.id, 'condition'),
        loop: loop.role,
        expression,
        substituted,
        leftValue,
        rightValue,
        op,
        result,
        label: `Check ${name === 'outer loop' ? 'outer' : 'inner'} condition: ${result ? 'true' : 'false'}`,
        explanation: `Check ${expression}: ${substituted} is ${result ? 'true' : 'false'} because ${why}, ${consequence}`,
      });

      if (!result) break;

      runStatements(loop.body);

      const from = readVar(v);
      const to = loop.update === '++' ? from + 1 : from - 1;
      emit(
        loopPartId(loop.id, 'update'),
        {
          type: loop.update === '++' ? 'INCREMENT' : 'DECREMENT',
          partId: loopPartId(loop.id, 'update'),
          loop: loop.role,
          variable: v,
          from,
          to,
          label: `${loop.update === '++' ? 'Increase' : 'Decrease'} ${v}: ${from} → ${to}`,
          explanation: `The ${name} body has finished, so the update ${v}${loop.update} runs: ${v} changes from ${from} to ${to}. Next, the ${name} condition is checked again.`,
        },
        () => {
          vars[v] = to;
        },
      );
    }
  };

  const runPrintf = (stmt: PrintfStatement, enclosingLoop: LoopRole | null) => {
    let argIndex = 0;
    const text = stmt.format.replace(/%d/g, () => {
      const arg = stmt.args[argIndex++];
      if (arg === undefined) throw new SimulationError(`printf in "${stmt.id}" has too few arguments.`);
      return String(readVar(arg));
    });
    if (argIndex !== stmt.args.length) {
      throw new SimulationError(`printf in "${stmt.id}" has too many arguments.`);
    }
    const shownCode = printfToSource(stmt.format, stmt.args);

    if (isNewlinePrintf(stmt.format, stmt.args)) {
      emit(stmt.id, {
        type: 'NEWLINE',
        partId: stmt.id,
        loop: enclosingLoop,
        text: '\n',
        label: 'Print newline',
        explanation: `${shownCode} prints a newline character, so the cursor moves to the start of the next line. This row of output is complete.`,
      });
      return;
    }
    if (text.includes('\n')) {
      throw new SimulationError('A printf may print either symbols or a single newline, not both.');
    }
    const usesVar = stmt.args.length > 0 ? ` The value of ${stmt.args.join(', ')} is ${stmt.args.map((a) => readVar(a)).join(', ')}.` : '';
    emit(stmt.id, {
      type: 'OUTPUT',
      partId: stmt.id,
      loop: enclosingLoop,
      text,
      label: `Print "${text}"`,
      explanation: `${shownCode} prints ${describePrinted(text)}.${usesVar} No newline is printed, so the cursor stays on the same line.`,
    });
  };

  // Track the innermost loop that encloses each statement (for event context).
  const loopStack: LoopRole[] = [];
  const runStatements = (statements: readonly Statement[]) => {
    for (const stmt of statements) {
      if (stmt.kind === 'for') {
        loopStack.push(stmt.role);
        runLoop(stmt);
        loopStack.pop();
      } else {
        runPrintf(stmt, loopStack[loopStack.length - 1] ?? null);
      }
    }
  };

  // Declaration is shown in the code but is not an execution event: at
  // position 0 the variables exist with no value yet ("not set").
  if (source.partLines[DECLARE_PART_ID] === undefined) {
    throw new SimulationError('Rendered source is missing the variable declaration.');
  }

  runStatements(program.body);

  emit(RETURN_PART_ID, {
    type: 'PROGRAM_END',
    partId: RETURN_PART_ID,
    loop: null,
    returnValue: 0,
    label: 'Program ends: return 0',
    explanation: 'The outer loop has finished, so main() reaches return 0; and the program ends successfully.',
  });

  return events;
}
