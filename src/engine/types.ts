/**
 * Types for the C Programming Pattern Lab simulator.
 *
 * The simulator does NOT compile or parse C. Each pattern is a small,
 * structured program (a tree of `for` loops and `printf` calls). The same
 * structure is used both to render the C source shown to students and to
 * generate the execution timeline, so the visible code and the executed
 * program cannot drift apart.
 */

/** A loop variable such as `i` or `j`. */
export type VarName = string;

/** Value of a variable. `null` means "declared but not initialized yet". */
export type VarValue = number | null;

export type VariableValues = Readonly<Record<VarName, VarValue>>;

/** Values chosen for a pattern's adjustable parameters (e.g. `{ rows: 4 }`). */
export type ParamValues = Readonly<Record<string, number>>;

/**
 * An integer expression in the supported subset.
 * - `literal`: a fixed number written in the code.
 * - `param`: a lesson parameter (e.g. number of rows). It is displayed in the
 *   C source as the plain number currently chosen, e.g. `i <= 4`.
 * - `var`: the current value of a loop variable, e.g. the `i` in `j <= i`.
 */
export type Expr =
  | { kind: 'literal'; value: number }
  | { kind: 'param'; name: string }
  | { kind: 'var'; name: VarName };

export type ComparisonOp = '<=' | '<' | '>=' | '>';

/** A loop condition of the form `<variable> <op> <expr>`, e.g. `j <= i`. */
export interface Condition {
  left: VarName;
  op: ComparisonOp;
  right: Expr;
}

/** Supported loop updates: `i++` and `i--`. */
export type UpdateOp = '++' | '--';

export type LoopRole = 'outer' | 'inner';

export interface ForLoopStatement {
  kind: 'for';
  /** Stable id used to build code-part ids such as `outer.condition`. */
  id: string;
  role: LoopRole;
  variable: VarName;
  init: Expr;
  condition: Condition;
  update: UpdateOp;
  body: Statement[];
}

/**
 * A `printf` call. `format` is the runtime text (a real newline character for
 * `\n`); only the `%d` conversion is supported, and each `%d` consumes one
 * entry of `args`.
 */
export interface PrintfStatement {
  kind: 'printf';
  id: string;
  format: string;
  args: VarName[];
}

export type Statement = ForLoopStatement | PrintfStatement;

/** The body of `main()` for a supported pattern program. */
export interface PatternProgram {
  /** Variables declared at the top of main, e.g. `int i, j;`. */
  variables: VarName[];
  body: Statement[];
}

// ---------------------------------------------------------------------------
// Rendered C source
// ---------------------------------------------------------------------------

/** Kind of a highlightable code part, used for colour + text labels. */
export type CodePartKind = 'declare' | 'init' | 'condition' | 'update' | 'output' | 'newline' | 'return';

export interface SourceSegment {
  text: string;
  /** Present when this segment can be highlighted as the executing part. */
  partId?: string;
  partKind?: CodePartKind;
}

export interface SourceLine {
  /** 1-based line number. */
  number: number;
  segments: SourceSegment[];
}

export interface RenderedSource {
  lines: SourceLine[];
  /** Full source text, exactly as displayed. */
  text: string;
  /** Line number for every highlightable part id. */
  partLines: Readonly<Record<string, number>>;
  /** Source text of every highlightable part, e.g. `j <= i`. */
  partText: Readonly<Record<string, string>>;
}

// ---------------------------------------------------------------------------
// Execution events
// ---------------------------------------------------------------------------

export type EventType =
  | 'INIT_VARIABLE'
  | 'CONDITION_CHECK'
  | 'OUTPUT'
  | 'NEWLINE'
  | 'INCREMENT'
  | 'DECREMENT'
  | 'PROGRAM_END';

interface BaseEvent {
  /** 0-based position in the timeline. The UI shows `index + 1` as "Step". */
  index: number;
  type: EventType;
  /** Code part that executes during this event (e.g. `inner.condition`). */
  partId: string;
  /** Line of the code part in the rendered source. */
  line: number;
  /** Source text of the executing part, e.g. `j <= i` or `printf("* ");`. */
  code: string;
  /** Which loop the event belongs to, if any. */
  loop: LoopRole | null;
  varsBefore: VariableValues;
  varsAfter: VariableValues;
  /** Short beginner-friendly label, e.g. "Check inner condition". */
  label: string;
  /** One or two plain-English sentences explaining what happened and why. */
  explanation: string;
}

export interface InitVariableEvent extends BaseEvent {
  type: 'INIT_VARIABLE';
  variable: VarName;
  value: number;
}

export interface ConditionCheckEvent extends BaseEvent {
  type: 'CONDITION_CHECK';
  /** Expression as written in the code, e.g. `j <= i`. */
  expression: string;
  /** Expression with values substituted, e.g. `2 <= 1`. */
  substituted: string;
  leftValue: number;
  rightValue: number;
  op: ComparisonOp;
  result: boolean;
}

export interface OutputEvent extends BaseEvent {
  type: 'OUTPUT';
  /** Exact text appended to the output (spaces preserved). */
  text: string;
}

export interface NewlineEvent extends BaseEvent {
  type: 'NEWLINE';
  text: '\n';
}

export interface UpdateEvent extends BaseEvent {
  type: 'INCREMENT' | 'DECREMENT';
  variable: VarName;
  from: number;
  to: number;
}

export interface ProgramEndEvent extends BaseEvent {
  type: 'PROGRAM_END';
  returnValue: 0;
}

export type SimulationEvent =
  | InitVariableEvent
  | ConditionCheckEvent
  | OutputEvent
  | NewlineEvent
  | UpdateEvent
  | ProgramEndEvent;

// ---------------------------------------------------------------------------
// Simulation state (snapshots)
// ---------------------------------------------------------------------------

/**
 * The complete visible state after a given number of events.
 * Position 0 is the state before any event has executed.
 */
export interface SimulationState {
  position: number;
  /** The event that produced this state (`null` at position 0). */
  event: SimulationEvent | null;
  vars: VariableValues;
  /** Everything printed so far, with spaces and newlines preserved. */
  output: string;
  /** Text appended by the current event ('' if none). */
  appended: string;
  /** How many times the outer loop body has been entered so far. */
  outerPass: number;
  /** How many times the inner loop body has been entered in the current outer pass. */
  innerPass: number;
  /** Number of `printf` calls that produced visible symbols so far. */
  symbolsPrinted: number;
  finished: boolean;
}

/** Everything the UI needs for one pattern + parameter combination. */
export interface Simulation {
  patternId: string;
  params: ParamValues;
  source: RenderedSource;
  events: readonly SimulationEvent[];
  /** `states[k]` is the state after `k` events; length is `events.length + 1`. */
  states: readonly SimulationState[];
  finalOutput: string;
}
