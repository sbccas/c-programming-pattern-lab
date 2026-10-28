import type { SimulationState } from '../engine/types';
import { NEWLINE_SYMBOL, SPACE_SYMBOL } from '../utils/whitespace';

interface OutputPanelProps {
  state: SimulationState;
  showSpaces: boolean;
  onShowSpacesChange: (value: boolean) => void;
}

function renderText(text: string, showSpaces: boolean, keyPrefix: string) {
  if (!showSpaces) return text;
  // Spaces become a visible dot; newlines get a ↵ marker before the real line break.
  return text.split('').map((ch, k) =>
    ch === ' ' ? (
      <span key={`${keyPrefix}${k}`} className="text-slate-500 [text-shadow:none]">
        {SPACE_SYMBOL}
      </span>
    ) : ch === '\n' ? (
      <span key={`${keyPrefix}${k}`}>
        <span className="text-slate-500 [text-shadow:none]">{NEWLINE_SYMBOL}</span>
        {'\n'}
      </span>
    ) : (
      ch
    ),
  );
}

/** Program output, built one event at a time. The underlying text is never trimmed. */
export function OutputPanel({ state, showSpaces, onShowSpacesChange }: OutputPanelProps) {
  const { output, appended, finished } = state;
  const before = output.slice(0, output.length - appended.length);

  return (
    <section
      aria-labelledby="output-title"
      className={`glass flex flex-col p-4 transition-shadow ${finished ? 'border-lime-300/50 shadow-[0_0_40px_-12px_rgba(163,247,91,0.6)]' : ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="output-title" className={`panel-title ${finished ? 'text-lime-300' : ''}`}>
          {finished ? 'Final output' : 'Output so far'}
        </h3>
        <label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            className="h-4 w-4 accent-cyan-400"
            checked={showSpaces}
            onChange={(e) => onShowSpacesChange(e.target.checked)}
          />
          Show spaces ({SPACE_SYMBOL}) &amp; newlines ({NEWLINE_SYMBOL})
        </label>
      </div>
      <pre
        className="scanlines terminal-glow mt-3 min-h-32 overflow-x-auto rounded-xl border border-lime-300/15 bg-black/60 p-4 font-mono text-base leading-7 text-lime-300"
        aria-label={finished ? 'Final program output' : 'Program output so far'}
      >
        {output === '' ? (
          <span className="text-slate-500 italic [text-shadow:none]">(nothing printed yet)</span>
        ) : (
          <span data-testid="output-text">
            {renderText(before, showSpaces, 'b')}
            {appended && (
              <mark key={state.position} className="animate-pop rounded-sm bg-cyan-300/20 text-cyan-100">
                {renderText(appended, showSpaces, 'a')}
              </mark>
            )}
          </span>
        )}
        {!finished && (
          <span aria-hidden="true" className="ml-px inline-block w-2 animate-blink bg-lime-300/80 motion-reduce:animate-none">
            &nbsp;
          </span>
        )}
      </pre>
      <p className="mt-2 text-xs text-slate-400">
        {appended === '\n'
          ? 'Last step printed a newline: the cursor moved to the next line.'
          : appended
            ? `Last step printed "${appended}" (highlighted).`
            : finished
              ? 'The program has finished. This is everything it printed.'
              : 'The blinking block shows where the next character will appear.'}
      </p>
    </section>
  );
}
