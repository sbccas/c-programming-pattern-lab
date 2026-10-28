import { CheckCircle2, Lightbulb, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { Prediction } from '../quiz/predictions';

interface PredictionPromptProps {
  prediction: Prediction;
  onReveal: () => void;
  onAnswered: (correct: boolean) => void;
}

/**
 * "Predict the next step". The parent keys this component by step, so each
 * new question starts with fresh state.
 */
export function PredictionPrompt({ prediction, onReveal, onAnswered }: PredictionPromptProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const correct = chosen === prediction.answerId;

  const choose = (id: string) => {
    if (correct) return;
    setChosen(id);
    setTries((t) => t + 1);
    if (tries === 0) onAnswered(id === prediction.answerId);
  };

  return (
    <section aria-labelledby="prediction-title" className="neon-border rounded-2xl p-4 shadow-[0_0_40px_-16px_rgba(167,139,250,0.8)]">
      <h3 id="prediction-title" className="font-display text-sm font-bold text-violet-200">
        Predict step {prediction.step}
      </h3>
      <p className="mt-1 text-sm text-slate-200">{prediction.prompt}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Your prediction">
        {prediction.options.map((o) => {
          const isChosen = chosen === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={isChosen}
              onClick={() => choose(o.id)}
              className={`btn min-w-16 border font-mono ${
                isChosen && correct
                  ? 'border-lime-400 bg-lime-400/15 text-lime-200'
                  : isChosen
                    ? 'border-rose-400 bg-rose-500/15 text-rose-200'
                    : 'border-white/15 bg-white/[0.05] text-slate-100 hover:border-cyan-300/50 hover:bg-white/10'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="mt-3 text-sm">
        {chosen !== null && correct && (
          <div className="flex flex-wrap items-center gap-2 text-lime-300">
            <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
            <span className="font-semibold">Correct!</span>
            <span>Press Next Step to see it happen.</span>
            <button type="button" className="btn-primary min-h-9" onClick={onReveal}>
              Run step {prediction.step}
            </button>
          </div>
        )}
        {chosen !== null && !correct && (
          <div className="space-y-2">
            <p className="flex items-center gap-2 font-semibold text-rose-300">
              <XCircle aria-hidden="true" className="h-5 w-5" />
              Not quite — try again.
            </p>
            <p className="flex items-start gap-2 text-slate-300">
              <Lightbulb aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span>Hint: {prediction.hint}</span>
            </p>
            {tries >= 2 && (
              <button type="button" className="btn-secondary min-h-9" onClick={onReveal}>
                Show me — run step {prediction.step}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
