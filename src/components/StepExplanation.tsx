import { CheckCircle2, Cpu } from 'lucide-react';
import type { SimulationState } from '../engine/types';
import { PART_KIND_STYLES, RESULT_STYLES, eventKind } from './eventStyles';

interface StepExplanationProps {
  state: SimulationState;
  total: number;
}

/** "What just happened?" — the current event explained in plain English. */
export function StepExplanation({ state, total }: StepExplanationProps) {
  const event = state.event;

  if (!event) {
    return (
      <div className="glass flex gap-3 p-4" aria-live="polite">
        <Cpu aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
        <div>
          <p className="font-display font-semibold text-white">Ready to run — step 0 of {total}</p>
          <p className="mt-1 text-sm text-slate-300">
            The variables i and j have been declared but do not have values yet. Press <strong className="text-white">Next Step</strong> to
            run one operation at a time, or <strong className="text-white">Auto Run</strong> to play the steps automatically.
          </p>
        </div>
      </div>
    );
  }

  const style = PART_KIND_STYLES[eventKind(event)];

  return (
    <div
      className={`glass p-4 transition-colors ${state.finished ? 'border-lime-300/40 bg-lime-300/[0.06]' : ''}`}
      aria-live="polite"
      aria-atomic="true"
      data-testid="step-explanation"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold text-slate-400">
          STEP {state.position}/{total}
        </span>
        <span className={`chip ${style.chip}`}>{style.label}</span>
        <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-sm text-slate-100">{event.code}</code>
        {event.type === 'CONDITION_CHECK' && (
          <span className={`chip font-mono font-bold ${RESULT_STYLES[String(event.result) as 'true' | 'false']}`}>
            {event.substituted} → {event.result ? 'TRUE' : 'FALSE'}
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-base font-semibold text-white sm:text-lg">{event.label}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-300">{event.explanation}</p>
      {state.finished && (
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-lime-300">
          <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0" />
          Simulation complete! The program ran all {total} steps. The output panel now shows the final output.
        </p>
      )}
    </div>
  );
}
