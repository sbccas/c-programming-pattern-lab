import { memo, useEffect, useRef } from 'react';
import type { SimulationEvent, VarName } from '../engine/types';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { visibleText } from '../utils/whitespace';
import { PART_KIND_STYLES, RESULT_STYLES, eventKind, operationName } from './eventStyles';

interface DryRunTableProps {
  events: readonly SimulationEvent[];
  variables: readonly VarName[];
  /** Number of events executed so far (0 = none). */
  position: number;
  showUpcoming: boolean;
  onShowUpcomingChange: (value: boolean) => void;
  onSelectStep: (position: number) => void;
}

interface RowProps {
  event: SimulationEvent;
  variables: readonly VarName[];
  isCurrent: boolean;
  isFuture: boolean;
  onSelectStep: (position: number) => void;
}

const valueText = (v: number | null | undefined) => (v === null || v === undefined ? '–' : String(v));

function StepButton({ step, onSelectStep }: { step: number; onSelectStep: (p: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelectStep(step)}
      className="min-h-8 min-w-8 rounded-md font-mono font-semibold text-cyan-300 underline-offset-2 hover:bg-cyan-300/10 hover:underline"
      aria-label={`Go to step ${step}`}
    >
      {step}
    </button>
  );
}

/** Desktop / tablet: one table row per step. */
const DryRunRow = memo(function DryRunRow({ event, variables, isCurrent, isFuture, onSelectStep }: RowProps) {
  const step = event.index + 1;
  return (
    <tr
      data-step={step}
      aria-current={isCurrent ? 'step' : undefined}
      className={`border-b border-white/5 align-top ${
        isCurrent ? 'bg-cyan-300/10 outline-1 -outline-offset-1 outline-cyan-300/70' : isFuture ? 'text-slate-500' : ''
      }`}
    >
      <td className="px-2 py-1.5 text-right">
        <StepButton step={step} onSelectStep={onSelectStep} />
      </td>
      <td className="px-2 py-1.5 whitespace-nowrap">
        {isCurrent && <span className="sr-only">Current step: </span>}
        {operationName(event)}
      </td>
      <td className="px-2 py-1.5 font-mono whitespace-nowrap text-slate-200">{event.code}</td>
      {variables.map((v) => {
        const changed = event.varsAfter[v] !== event.varsBefore[v];
        return (
          <td key={v} className={`px-2 py-1.5 text-center font-mono ${changed ? 'font-bold text-cyan-300' : ''}`}>
            {valueText(event.varsAfter[v])}
            {changed && <span className="sr-only"> (changed)</span>}
          </td>
        );
      })}
      <td className="px-2 py-1.5 font-mono whitespace-nowrap">
        {event.type === 'CONDITION_CHECK' ? `${event.expression}  (${event.substituted})` : ''}
      </td>
      <td className="px-2 py-1.5">
        {event.type === 'CONDITION_CHECK' && (
          <span className={`chip font-mono ${isFuture ? 'ring-white/10' : RESULT_STYLES[String(event.result) as 'true' | 'false']}`}>
            {event.result ? 'true' : 'false'}
          </span>
        )}
      </td>
      <td className="px-2 py-1.5 font-mono whitespace-nowrap text-lime-300">
        {event.type === 'OUTPUT' || event.type === 'NEWLINE' ? visibleText(event.text) : ''}
      </td>
      <td className="hidden min-w-72 px-2 py-1.5 text-slate-400 lg:table-cell">{event.explanation}</td>
    </tr>
  );
});

/** Phones: one compact card per step, no sideways scrolling. */
const DryRunItem = memo(function DryRunItem({ event, variables, isCurrent, isFuture, onSelectStep }: RowProps) {
  const step = event.index + 1;
  const style = PART_KIND_STYLES[eventKind(event)];
  return (
    <li
      data-step={step}
      aria-current={isCurrent ? 'step' : undefined}
      className={`flex gap-2 rounded-xl border px-2 py-2 text-sm ${
        isCurrent ? 'border-cyan-300/70 bg-cyan-300/10' : 'border-white/5 bg-white/[0.02]'
      } ${isFuture ? 'opacity-50' : ''}`}
    >
      <StepButton step={step} onSelectStep={onSelectStep} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`chip ${style.chip}`}>{operationName(event)}</span>
          <code className="font-mono text-xs break-all text-slate-200">{event.code}</code>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-slate-400">
          {variables.map((v) => {
            const changed = event.varsAfter[v] !== event.varsBefore[v];
            return (
              <span key={v} className={changed ? 'font-bold text-cyan-300' : ''}>
                {v}={valueText(event.varsAfter[v])}
              </span>
            );
          })}
          {event.type === 'CONDITION_CHECK' && (
            <span className={`chip ${RESULT_STYLES[String(event.result) as 'true' | 'false']}`}>
              {event.substituted} → {event.result ? 'true' : 'false'}
            </span>
          )}
          {(event.type === 'OUTPUT' || event.type === 'NEWLINE') && (
            <span className="text-lime-300">prints {visibleText(event.text)}</span>
          )}
        </div>
      </div>
    </li>
  );
});

/** Chronological trace generated from the same event timeline as every other panel. */
export function DryRunTable({ events, variables, position, showUpcoming, onShowUpcomingChange, onSelectStep }: DryRunTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const wide = useMediaQuery('(min-width: 640px)', true);
  const visible = showUpcoming ? events : events.slice(0, position);

  // Keep the current step in view by scrolling only the trace container (never the page).
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || position === 0) return;
    const row = container.querySelector<HTMLElement>(`[data-step="${position}"]`);
    if (!row) return;
    const header = container.querySelector('thead')?.getBoundingClientRect().height ?? 0;
    const top = row.offsetTop - header;
    const bottom = row.offsetTop + row.offsetHeight;
    if (top < container.scrollTop) container.scrollTop = top;
    else if (bottom > container.scrollTop + container.clientHeight) container.scrollTop = bottom - container.clientHeight;
  }, [position, showUpcoming, wide]);

  const empty = 'No steps yet. Press Next Step and each step will be recorded here.';

  return (
    <section aria-labelledby="dry-run-title" className="glass p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="dry-run-title" className="panel-title">
          Dry-run trace{' '}
          <span className="font-sans tracking-normal text-slate-400 normal-case">
            ({position} of {events.length} steps)
          </span>
        </h3>
        <label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            className="h-4 w-4 accent-cyan-400"
            checked={showUpcoming}
            onChange={(e) => onShowUpcomingChange(e.target.checked)}
          />
          Show upcoming steps
        </label>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Every row is one simulator step. Values of i and j are shown <em>after</em> the step; a highlighted value changed in
        that step. Tap a step number to jump to it.
      </p>

      <div ref={scrollRef} className="relative mt-3 max-h-[26rem] overflow-auto rounded-xl border border-white/10 bg-black/20">
        {wide ? (
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Dry run of the program, one row per step</caption>
            <thead className="sticky top-0 z-10 bg-[#0d1124] font-mono text-[11px] tracking-wider text-cyan-300/90 uppercase">
              <tr>
                <th scope="col" className="px-2 py-2 text-right">Step</th>
                <th scope="col" className="px-2 py-2">Operation</th>
                <th scope="col" className="px-2 py-2">Code</th>
                {variables.map((v) => (
                  <th key={v} scope="col" className="px-2 py-2 text-center normal-case">
                    {v}
                  </th>
                ))}
                <th scope="col" className="px-2 py-2">Condition</th>
                <th scope="col" className="px-2 py-2">Result</th>
                <th scope="col" className="px-2 py-2">Output</th>
                <th scope="col" className="hidden px-2 py-2 lg:table-cell">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8 + variables.length} className="px-3 py-8 text-center text-slate-400">
                    {empty}
                  </td>
                </tr>
              ) : (
                visible.map((event) => (
                  <DryRunRow
                    key={event.index}
                    event={event}
                    variables={variables}
                    isCurrent={event.index + 1 === position}
                    isFuture={event.index + 1 > position}
                    onSelectStep={onSelectStep}
                  />
                ))
              )}
            </tbody>
          </table>
        ) : visible.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-slate-400">{empty}</p>
        ) : (
          <ol className="space-y-1.5 p-1.5" aria-label="Dry run of the program, one item per step">
            {visible.map((event) => (
              <DryRunItem
                key={event.index}
                event={event}
                variables={variables}
                isCurrent={event.index + 1 === position}
                isFuture={event.index + 1 > position}
                onSelectStep={onSelectStep}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
