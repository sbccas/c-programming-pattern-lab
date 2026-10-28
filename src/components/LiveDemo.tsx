import { useEffect, useMemo, useState } from 'react';
import { executePattern } from '../engine/executePattern';
import { defaultParams } from '../engine/validateParams';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery';
import type { PatternDefinition } from '../patterns/types';

const STEP_MS = 260;
const HOLD_STEPS = 12; // pause on the finished output before looping

interface LiveDemoProps {
  pattern: PatternDefinition;
}

/**
 * A self-playing mini simulator for the home page. It replays the real engine
 * snapshots — the same steps students see in the lesson — not a canned animation.
 * With reduced motion it simply shows the finished program.
 */
export function LiveDemo({ pattern }: LiveDemoProps) {
  const sim = useMemo(() => executePattern(pattern, defaultParams(pattern.params)), [pattern]);
  const reduced = usePrefersReducedMotion();
  const last = sim.events.length;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced) return undefined;
    const id = window.setInterval(() => setTick((t) => (t + 1) % (last + 1 + HOLD_STEPS)), STEP_MS);
    return () => window.clearInterval(id);
  }, [reduced, last]);

  const position = reduced ? last : Math.min(tick, last);
  const state = sim.states[position]!;
  const loopLines = sim.source.lines.slice(6, 14); // the two for loops, as rendered for students

  return (
    <div className="neon-border relative overflow-hidden rounded-2xl shadow-[0_0_80px_-20px_rgba(167,139,250,0.55)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-lime-400/80" />
        </span>
        <span className="font-mono text-[11px] text-slate-400">live · {pattern.title.toLowerCase()}</span>
      </div>

      <div aria-hidden="true" className="grid gap-0 sm:grid-cols-[1.25fr_1fr]">
        <pre className="overflow-x-auto px-3 py-3 font-mono text-[11.5px] leading-5 text-slate-300 xs:text-xs sm:text-[12.5px] sm:leading-6">
          {loopLines.map((line) => {
            const active = state.event?.line === line.number;
            return (
              <span key={line.number} className={`block whitespace-pre ${active ? 'bg-cyan-300/10' : ''}`}>
                {line.segments.map((seg, k) =>
                  seg.partId && seg.partId === state.event?.partId ? (
                    <span key={k} className="rounded bg-cyan-300/25 px-0.5 text-cyan-100 shadow-[0_0_14px_rgba(34,227,255,0.7)]">
                      {seg.text.replace(/^ {4}/, '')}
                    </span>
                  ) : (
                    <span key={k}>{seg.text.replace(/^ {4}/, '')}</span>
                  ),
                )}
              </span>
            );
          })}
        </pre>
        <div className="flex flex-col border-t border-white/10 sm:border-t-0 sm:border-l">
          <div className="flex gap-4 px-4 pt-3 font-mono text-xs">
            {(['i', 'j'] as const).map((v) => (
              <span key={v} className="text-slate-400">
                {v} = <span className="text-base font-bold text-cyan-200">{state.vars[v] ?? '?'}</span>
              </span>
            ))}
          </div>
          <pre className="scanlines terminal-glow m-3 min-h-28 flex-1 rounded-xl bg-black/60 p-3 font-mono text-sm leading-6 text-lime-300">
            {state.output}
            {!state.finished && <span className="animate-blink motion-reduce:animate-none">▋</span>}
          </pre>
        </div>
      </div>
      <p className="border-t border-white/10 bg-white/[0.02] px-4 py-2 font-mono text-[11px] text-slate-400">
        <span className="sr-only">
          Animated preview of the star triangle program running step by step. Final output: four rows of 1 to 4 stars.
        </span>
        <span aria-hidden="true">
          step {String(position).padStart(2, '0')}/{last} · {state.event ? state.event.label : 'ready'}
        </span>
      </p>
    </div>
  );
}
