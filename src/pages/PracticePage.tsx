import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuizCard } from '../components/QuizCard';
import { PATTERNS } from '../patterns';
import { ALL_QUESTIONS, GENERAL_QUESTIONS } from '../quiz/questions';
import { QUIZ_KIND_LABELS, type QuizKind, type QuizQuestion } from '../quiz/types';
import { resetProgress, useCorrectQuizAnswers } from '../utils/progress';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const KINDS = Object.keys(QUIZ_KIND_LABELS) as QuizKind[];

export function PracticePage() {
  useDocumentTitle('Practice zone');
  const [solved, markSolved] = useCorrectQuizAnswers();
  const [kind, setKind] = useState<QuizKind | null>(null);
  const [resetCount, setResetCount] = useState(0);

  const filter = (qs: QuizQuestion[]) => (kind ? qs.filter((q) => q.kind === kind) : qs);
  const groups = [
    ...PATTERNS.map((p) => ({ id: p.id, title: p.title, link: `/patterns/${p.id}`, questions: filter(p.quiz) })),
    { id: 'general', title: 'Nested loops in general', link: null, questions: filter(GENERAL_QUESTIONS) },
  ].filter((g) => g.questions.length > 0);
  const solvedCount = ALL_QUESTIONS.filter((q) => solved.includes(q.id)).length;

  const chip = (active: boolean) =>
    `min-h-11 rounded-full border px-4 text-sm font-semibold ${
      active ? 'border-cyan-300/70 bg-cyan-300/15 text-cyan-100 shadow-[0_0_20px_-6px_rgba(34,227,255,0.7)]' : 'border-white/15 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-white">Practice zone</h1>
      <p className="mt-2 max-w-2xl text-slate-300">
        All the questions from every lesson in one place, plus some general nested-loop questions. Wrong answers are fine —
        each one gives you a hint so you can try again.
      </p>

      <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-semibold" aria-live="polite">
            {solvedCount} of {ALL_QUESTIONS.length} questions answered correctly
          </p>
          <div
            className="mt-2 h-2 w-56 max-w-full overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Questions answered correctly"
            aria-valuemin={0}
            aria-valuemax={ALL_QUESTIONS.length}
            aria-valuenow={solvedCount}
          >
            <div className="h-full bg-gradient-to-r from-neon-lime to-neon-cyan" style={{ width: `${(solvedCount / ALL_QUESTIONS.length) * 100}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-400">Progress is saved only in this browser, on this device.</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            resetProgress();
            setResetCount((n) => n + 1);
          }}
        >
          Reset my progress
        </button>
      </div>

      <div role="group" aria-label="Question type" className="mt-6 flex flex-wrap gap-2">
        <button type="button" className={chip(kind === null)} aria-pressed={kind === null} onClick={() => setKind(null)}>
          All types
        </button>
        {KINDS.map((k) => (
          <button key={k} type="button" className={chip(kind === k)} aria-pressed={kind === k} onClick={() => setKind(k)}>
            {QUIZ_KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <div key={resetCount} className="mt-8 space-y-10">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`group-${g.id}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`group-${g.id}`} className="text-xl font-bold text-white">
                {g.title}
              </h2>
              {g.link && (
                <Link to={g.link} className="text-sm font-semibold text-cyan-300 underline underline-offset-2">
                  Open the lesson
                </Link>
              )}
            </div>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              {g.questions.map((q) => (
                <QuizCard key={q.id} question={q} solvedBefore={solved.includes(q.id)} onCorrect={markSolved} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
