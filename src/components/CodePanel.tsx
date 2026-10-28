import type { RenderedSource, SimulationEvent } from '../engine/types';
import { PART_KIND_STYLES, eventKind } from './eventStyles';

interface CodePanelProps {
  source: RenderedSource;
  /** Event whose code part is highlighted (null before the first step). */
  event: SimulationEvent | null;
}

/** The C program, with the part that executed in the current step highlighted. */
export function CodePanel({ source, event }: CodePanelProps) {
  const activePart = event?.partId;
  const kind = event ? eventKind(event) : null;
  const style = kind ? PART_KIND_STYLES[kind] : null;

  return (
    <section aria-labelledby="code-panel-title" className="glass-strong flex h-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-lime-400/80" />
          </span>
          <h3 id="code-panel-title" className="panel-title">
            pattern.c
          </h3>
        </div>
        {event && style ? (
          <p className="text-xs text-slate-300">
            Line {event.line} · <span className={`chip ${style.chip}`}>{style.label}</span>
          </p>
        ) : (
          <p className="text-xs text-slate-400">Press Next Step to run the first statement.</p>
        )}
      </div>
      <pre
        className="flex-1 overflow-x-auto py-3 font-mono text-[12.5px] leading-6 text-slate-300 xs:text-[13px] sm:text-sm"
        tabIndex={0}
        aria-label="C source code"
      >
        <code>
          {source.lines.map((line) => {
            const isActiveLine = event?.line === line.number;
            return (
              <span
                key={line.number}
                data-line={line.number}
                aria-current={isActiveLine ? 'step' : undefined}
                className={`relative flex min-w-max pr-4 transition-colors ${
                  isActiveLine ? 'bg-gradient-to-r from-cyan-300/15 via-cyan-300/5 to-transparent' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-1 shrink-0 ${isActiveLine ? 'bg-neon-cyan shadow-[0_0_12px_rgba(34,227,255,0.9)]' : ''}`}
                />
                <span aria-hidden="true" className={`w-9 shrink-0 pr-3 text-right select-none ${isActiveLine ? 'text-cyan-200' : 'text-slate-600'}`}>
                  {line.number}
                </span>
                <span className="whitespace-pre">
                  {line.segments.map((seg, k) => {
                    const active = seg.partId !== undefined && seg.partId === activePart;
                    if (seg.isComment) {
                      return (
                        <span key={k} className="text-slate-500 italic">
                          {seg.text}
                        </span>
                      );
                    }
                    if (!active) return <span key={k}>{seg.text || ' '}</span>;
                    return (
                      <mark key={k} data-active-part={seg.partId} className={`exec-glow rounded px-0.5 font-semibold ${style?.code ?? ''}`}>
                        <span className="sr-only">Now running: </span>
                        {seg.text}
                      </mark>
                    );
                  })}
                </span>
              </span>
            );
          })}
        </code>
      </pre>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 border-t border-white/10 px-4 py-2 text-[11px] text-slate-400" aria-label="Highlight colours">
        {(['init', 'condition', 'update', 'output', 'newline'] as const).map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${PART_KIND_STYLES[k].swatch}`} />
            {PART_KIND_STYLES[k].label}
          </li>
        ))}
      </ul>
    </section>
  );
}
