import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { SPEEDS, type SimulationControls, type SpeedId } from '../hooks/useSimulation';

interface ExecutionControlsProps {
  controls: SimulationControls;
  speed: SpeedId;
  onSpeedChange: (speed: SpeedId) => void;
}

/** Floating control dock. Mobile-first: big touch targets, two compact rows on phones. */
export function ExecutionControls({ controls, speed, onSpeedChange }: ExecutionControlsProps) {
  const { position, total, playing, atStart, atEnd } = controls;
  const percent = total === 0 ? 0 : Math.round((position / total) * 100);

  return (
    <div role="group" aria-label="Simulation controls" className="glass-strong safe-bottom px-2 pt-2 sm:px-3 sm:pt-3">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        <button
          type="button"
          className="btn-secondary px-3"
          onClick={controls.previous}
          disabled={atStart}
          aria-keyshortcuts="ArrowLeft"
          aria-label="Previous Step"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          <span className="hidden xs:inline">
            Prev<span className="hidden sm:inline">ious</span>
          </span>
        </button>
        <button
          type="button"
          id="next-step-button"
          className="btn-primary whitespace-nowrap sm:min-w-36"
          onClick={controls.next}
          disabled={atEnd}
          aria-keyshortcuts="ArrowRight"
        >
          Next Step
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
        {playing ? (
          <button type="button" className="btn-secondary px-3 text-cyan-200" onClick={controls.pause} aria-label="Pause">
            <Pause aria-hidden="true" className="h-4 w-4" />
            <span className="hidden xs:inline">Pause</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary px-3 whitespace-nowrap"
            onClick={controls.play}
            disabled={total === 0}
            aria-label={atEnd ? 'Replay' : 'Auto Run'}
          >
            <Play aria-hidden="true" className="h-4 w-4" />
            <span className="hidden xs:inline">{atEnd ? 'Replay' : 'Auto Run'}</span>
          </button>
        )}
        <div className="col-span-3 flex items-center gap-1 sm:contents">
          <button type="button" className="btn-ghost px-2.5" onClick={controls.reset} disabled={atStart && !playing}>
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
          <button type="button" className="btn-ghost px-2.5" onClick={controls.end} disabled={atEnd}>
            <SkipForward aria-hidden="true" className="h-4 w-4" />
            <span>
              End<span className="sr-only"> (jump to the last step)</span>
            </span>
          </button>
          <label className="ml-auto flex items-center gap-2 text-sm text-slate-300">
            <span className="hidden sm:inline">Speed</span>
            <select
              aria-label="Speed"
              className="min-h-11 rounded-xl border border-white/15 bg-white/[0.06] px-2 text-sm text-slate-100"
              value={speed}
              onChange={(e) => onSpeedChange(e.target.value as SpeedId)}
            >
              {SPEEDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({(s.ms / 1000).toFixed(1)} s)
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 pb-1">
        <div
          role="progressbar"
          aria-label="Simulation progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={position}
          aria-valuetext={`Step ${position} of ${total}`}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink shadow-[0_0_12px_rgba(34,227,255,0.8)] transition-[width] duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-xs text-slate-300" data-testid="progress-text">
          Step {position} / {total}
          {playing && <span className="ml-2 font-sans font-semibold text-cyan-300">Running…</span>}
        </span>
      </div>
      <p className="hidden pb-1 text-xs text-slate-400 lg:block">Tip: press ← and → on your keyboard to step backward and forward.</p>
    </div>
  );
}
