import { DECLARE_PART_ID, RETURN_PART_ID, applyArithmetic, exprToSource, isNewlinePrintf, loopPartId, printfToSource } from './renderSource';
import type {
  ComparisonOp,
  Expr,
  ForLoopStatement,
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
type EventDraft = DistributiveOmit<
  SimulationEvent,
  'index' | 'line' | 'code' | 'varsBefore' | 'varsAfter' | 'loop' | 'loopId' | 'loopLabel'
>;

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

/** Short name of a loop, e.g. `spaces`; defaults to its role. */
export const loopLabel = (loop: ForLoopStatement): string => loop.label ?? loop.role;

/** Describe printed text for beginners, e.g. `"* "` → a star followed by a space. */
function describePrinted(text: string): string {
  const visible = text.replace(/ /g, '');
  const spaces = text.length - visible.length;
  if (visible === '') return spaces === 1 ? 'one space' : `${spaces} spaces`;
  const spaceWords = spaces === 0 ? '' : spaces === 1 ? ' followed by a space' : ` followed by ${spaces} spaces`;
  if (visible === '*') return `a star${spaceWords}`;
  if (/^\*+$/.test(visible)) return `${visible.length} stars${spaceWords}`;
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
 * runs again every time the outer body reaches it. Statements in a body run
 * in order, so a second inner loop starts only after the first has finished.
 *
 * Step policy: there is no separate "leave loop" event. A CONDITION_CHECK with
 * result `false` is the moment the loop ends; the next event is the statement
 * after the loop (or PROGRAM_END after the last statement of main).
 * Comments produce no events.
 */
export function buildTimeline(
  program: PatternProgram,
  params: ParamValues,
  source: RenderedSource,
): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  const vars: Record<VarName, number | null> = Object.fromEntries(program.variables.map((v) => [v, null]));
  const loopStack: ForLoopStatement[] = [];

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
      case 'binary':
        return applyArithmetic(expr.op, evalExpr(expr.left), evalExpr(expr.right));
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
    const current = loopStack[loopStack.length - 1];
    const varsBefore: VariableValues = { ...vars };
    mutate?.();
    const varsAfter: VariableValues = { ...vars };
    events.push({
      ...draft,
      index: events.length,
      line,
      code,
      loop: current?.role ?? null,
      loopId: current?.id ?? null,
      loopLabel: current ? loopLabel(current) : null,
      varsBefore,
      varsAfter,
    } as SimulationEvent);
  };

  const runLoop = (loop: ForLoopStatement) => {
    const v = loop.variable;
    const label = loopLabel(loop);
    const name = `${label} loop`;
    const initValue = evalExpr(loop.init);
    const isInner = loop.role === 'inner';

    emit(
      loopPartId(loop.id, 'init'),
      {
        type: 'INIT_VARIABLE',
        partId: loopPartId(loop.id, 'init'),
        variable: v,
        value: initValue,
        label: `Start ${name}: ${v} = ${initValue}`,
        explanation: isInner
          ? `Execution enters the ${name}, so ${v} is set to ${initValue}. The ${name} starts again from ${v} = ${initValue} every time the outer loop body reaches it.`
          : `Execution enters the ${name}, so ${v} is set to ${initValue}. This initialisation happens only once.`,
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
      const rightSource = exprToSource(right, params);
      const expression = `${left} ${op} ${rightSource}`;
      const substituted = `${leftValue} ${op} ${rightValue}`;
      const why = `${leftValue} is ${result ? '' : 'not '}${OP_WORDS[op]} ${rightValue}`;
      // For arithmetic limits, show the worked value first: "here 4 - i = 3".
      const worked = right.kind === 'binary' && rightSource !== String(rightValue) ? ` (here ${rightSource} = ${rightValue})` : '';
      const consequence = result
        ? `so the ${name} body runs${isInner ? '' : ' (a new row starts)'}.`
        : isInner
          ? `so the ${name} ends. Execution continues with the statement after the ${name}.`
          : `so the ${name} ends. Execution continues after the ${name}.`;

      emit(loopPartId(loop.id, 'condition'), {
        type: 'CONDITION_CHECK',
        partId: loopPartId(loop.id, 'condition'),
        expression,
        substituted,
        leftValue,
        rightValue,
        op,
        result,
        label: `Check ${label} condition: ${result ? 'true' : 'false'}`,
        explanation: `Check ${expression}${worked}: ${substituted} is ${result ? 'true' : 'false'} because ${why}, ${consequence}`,
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

  const runPrintf = (stmt: PrintfStatement) => {
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
    const purpose = text.trim() === '' ? ' Spaces are invisible, but they push the next symbol to the right.' : '';
    emit(stmt.id, {
      type: 'OUTPUT',
      partId: stmt.id,
      text,
      label: `Print "${text}"`,
      explanation: `${shownCode} prints ${describePrinted(text)}.${usesVar}${purpose} No newline is printed, so the cursor stays on the same line.`,
    });
  };

  const runStatements = (statements: readonly Statement[]) => {
    for (const stmt of statements) {
      if (stmt.kind === 'comment') continue;
      if (stmt.kind === 'for') {
        loopStack.push(stmt);
        runLoop(stmt);
        loopStack.pop();
      } else {
        runPrintf(stmt);
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
    returnValue: 0,
    label: 'Program ends: return 0',
    explanation: 'All the loops have finished, so main() reaches return 0; and the program ends successfully.',
  });

  return events;
}
