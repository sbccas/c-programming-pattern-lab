import { CheckCircle2, Lightbulb, RotateCcw, XCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { QUIZ_KIND_LABELS, type QuizQuestion } from '../quiz/types';

interface QuizCardProps {
  question: QuizQuestion;
  /** Whether the question was answered correctly before (stored on this device). */
  solvedBefore?: boolean;
  onCorrect?: (id: string) => void;
}

type Feedback = 'none' | 'correct' | 'wrong';

/** One multiple-choice question with hint → retry → explanation feedback. */
export function QuizCard({ question, solvedBefore = false, onCorrect }: QuizCardProps) {
  const uid = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [wrongTries, setWrongTries] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const check = () => {
    if (selected === null) return;
    if (selected === question.answerId) {
      setFeedback('correct');
      onCorrect?.(question.id);
    } else {
      setFeedback('wrong');
      setWrongTries((n) => n + 1);
      setShowHint(true);
    }
  };

  const retry = () => {
    setSelected(null);
    setFeedback('none');
    setRevealed(false);
  };

  const answer = question.options.find((o) => o.id === question.answerId)!;
  const done = feedback === 'correct' || revealed;

  return (
    <article className="glass p-4 sm:p-5" aria-labelledby={`${uid}-prompt`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip bg-violet-400/10 text-violet-200 ring-violet-400/40">
          {QUIZ_KIND_LABELS[question.kind]}
        </span>
        {solvedBefore && (
          <span className="flex items-center gap-1 text-xs font-medium text-lime-300">
            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> Solved before
          </span>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
      >
        <fieldset disabled={done}>
          <legend id={`${uid}-prompt`} className="mt-3 font-semibold text-white">
            {question.prompt}
          </legend>
          {question.code && (
            <pre className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-sm text-slate-100">{question.code}</pre>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {question.options.map((o) => {
              const isSelected = selected === o.id;
              const showCorrect = done && o.id === question.answerId;
              return (
                <label
                  key={o.id}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm text-slate-200 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-cyan-300 ${
                    showCorrect
                      ? 'border-lime-400/70 bg-lime-400/10'
                      : isSelected && feedback === 'wrong'
                        ? 'border-rose-400/70 bg-rose-500/10'
                        : isSelected
                          ? 'border-cyan-300/70 bg-cyan-300/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]'
                  }`}
                >
                  <input
                    type="radio"
                    name={`${uid}-option`}
                    value={o.id}
                    checked={isSelected}
                    onChange={() => {
                      setSelected(o.id);
                      if (feedback === 'wrong') setFeedback('none');
                    }}
                    className="mt-1 h-4 w-4 shrink-0 accent-cyan-400"
                  />
                  {o.mono ? <pre className="font-mono whitespace-pre-wrap">{o.label}</pre> : <span>{o.label}</span>}
                  {showCorrect && <span className="sr-only"> (correct answer)</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-3 flex flex-wrap gap-2">
          {!done && (
            <button type="submit" className="btn-primary" disabled={selected === null}>
              Check answer
            </button>
          )}
          {!done && !showHint && (
            <button type="button" className="btn-ghost" onClick={() => setShowHint(true)}>
              <Lightbulb aria-hidden="true" className="h-4 w-4" /> Show hint
            </button>
          )}
          {!done && wrongTries >= 1 && (
            <button type="button" className="btn-ghost" onClick={() => setRevealed(true)}>
              Reveal answer
            </button>
          )}
          {done && (
            <button type="button" className="btn-secondary" onClick={retry}>
              <RotateCcw aria-hidden="true" className="h-4 w-4" /> Try again
            </button>
          )}
        </div>
      </form>

      <div aria-live="polite" className="mt-3 space-y-2 text-sm">
        {feedback === 'correct' && (
          <p className="flex items-center gap-2 font-semibold text-lime-300">
            <CheckCircle2 aria-hidden="true" className="h-5 w-5" /> Correct!
          </p>
        )}
        {feedback === 'wrong' && (
          <p className="flex items-center gap-2 font-semibold text-rose-300">
            <XCircle aria-hidden="true" className="h-5 w-5" /> Not quite. Read the hint and try again.
          </p>
        )}
        {showHint && !done && (
          <p className="flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-amber-100">
            <Lightbulb aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Hint:</strong> {question.hint}
            </span>
          </p>
        )}
        {done && (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-slate-200">
            {revealed && feedback !== 'correct' && (
              <p className="mb-1 font-semibold">
                Answer: <span className="font-mono whitespace-pre-wrap">{answer.label}</span>
              </p>
            )}
            <p>
              <strong>Why:</strong> {question.explanation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
