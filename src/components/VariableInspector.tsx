import type { SimulationState, VarName } from '../engine/types';

interface VariableInspectorProps {
  state: SimulationState;
  variables: readonly VarName[];
  /** What each variable does; defaults to i = outer loop, j = inner loop. */
  roles?: Readonly<Record<string, string>>;
}

const DEFAULT_ROLES: Record<string, string> = { i: 'outer loop', j: 'inner loop' };
// Static class names so Tailwind can see them.
const GRID_COLS: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

/** Current values of the loop variables, and which operation changed them. */
export function VariableInspector({ state, variables, roles = DEFAULT_ROLES }: VariableInspectorProps) {
  const event = state.event;
  const changedVar =
    event && (event.type === 'INIT_VARIABLE' || event.type === 'INCREMENT' || event.type === 'DECREMENT') ? event.variable : null;

  return (
    <section aria-labelledby="variables-title" className="glass p-4">
      <h3 id="variables-title" className="panel-title">
        Variables
      </h3>
      <dl className={`mt-3 grid gap-2 sm:gap-3 ${GRID_COLS[variables.length] ?? 'grid-cols-2'}`}>
        {variables.map((name) => {
          const value = state.vars[name];
          const changed = name === changedVar;
          return (
            <div
              key={name}
              className={`relative overflow-hidden rounded-xl border p-3 transition-colors ${
                changed
                  ? 'border-cyan-300/60 bg-cyan-300/[0.08] shadow-[0_0_24px_-6px_rgba(34,227,255,0.6)]'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <dt className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="font-mono text-lg font-bold text-white">{name}</span>
                <span className="text-[10px] leading-tight tracking-wide text-slate-400 uppercase">{roles[name] ?? 'variable'}</span>
              </dt>
              <dd className="mt-1" data-testid={`var-${name}`}>
                {value === null || value === undefined ? (
                  <span className="text-sm font-medium text-slate-400 italic">not set yet</span>
                ) : (
                  <span
                    key={`${state.position}-${value}`}
                    className={`inline-block font-mono text-4xl font-bold ${changed ? 'animate-pop rounded text-cyan-200' : 'text-white'}`}
                  >
                    {value}
                  </span>
                )}
                {changed && event?.type === 'INIT_VARIABLE' && (
                  <p className="mt-1 text-xs font-medium text-cyan-200">Set by {event.code}</p>
                )}
                {changed && (event?.type === 'INCREMENT' || event?.type === 'DECREMENT') && (
                  <p className="mt-1 text-xs font-medium text-cyan-200">
                    Changed by {event.code}: {event.from} → {event.to}
                  </p>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
        <div className="rounded-lg bg-white/[0.03] p-2 ring-1 ring-white/5">
          <dt className="text-slate-400">Outer passes</dt>
          <dd className="font-mono text-lg font-semibold text-white" data-testid="outer-pass">
            {state.outerPass}
          </dd>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-2 ring-1 ring-white/5">
          <dt className="text-slate-400">Inner loop passes</dt>
          <dd className="font-mono text-lg font-semibold text-white" data-testid="inner-pass">
            {state.innerPass}
          </dd>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-2 ring-1 ring-white/5">
          <dt className="text-slate-400">Symbols printed</dt>
          <dd className="font-mono text-lg font-semibold text-white">{state.symbolsPrinted}</dd>
        </div>
      </dl>
    </section>
  );
}
