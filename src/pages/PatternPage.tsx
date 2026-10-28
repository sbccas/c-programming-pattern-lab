import { AlertTriangle, ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CategoryBadge, DifficultyBadge } from '../components/Badges';
import { OutputPreview } from '../components/OutputPreview';
import { ParamControls } from '../components/ParamControls';
import { QuizCard } from '../components/QuizCard';
import { SimulatorWorkspace } from '../components/SimulatorWorkspace';
import { executePattern } from '../engine/executePattern';
import type { ParamValues } from '../engine/types';
import { defaultParams, validateParams } from '../engine/validateParams';
import { getNeighbours, getPattern } from '../patterns';
import { cardCode } from '../patterns/cardCode';
import type { PatternDefinition } from '../patterns/types';
import { useCorrectQuizAnswers } from '../utils/progress';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import { NotFoundPage } from './NotFoundPage';

/** Read parameters from the URL (?rows=5) so teachers can share a setting. */
function useUrlParams(pattern: PatternDefinition) {
  const [search, setSearch] = useSearchParams();
  const raw: Record<string, string> = {};
  let present = false;
  for (const spec of pattern.params) {
    const value = search.get(spec.name);
    if (value !== null) present = true;
    raw[spec.name] = value ?? String(spec.default);
  }
  const result = validateParams(pattern.params, raw);
  const values = result.ok ? result.values : defaultParams(pattern.params);
  const invalid = present && !result.ok ? Object.values(result.errors).join(' ') : null;

  const setValues = (next: ParamValues) => {
    const params = new URLSearchParams(search);
    for (const spec of pattern.params) {
      if (next[spec.name] === spec.default) params.delete(spec.name);
      else params.set(spec.name, String(next[spec.name]));
    }
    setSearch(params, { replace: true });
  };
  return { values, setValues, invalid };
}

function ExplanationCard({ title, code, text }: { title: string; code: string; text: string }) {
  return (
    <div className="card p-4">
      <h3 className="font-bold text-white">{title}</h3>
      <code className="mt-1 block font-mono text-sm break-words text-cyan-200">{code}</code>
      <p className="mt-2 text-sm text-slate-300">{text}</p>
    </div>
  );
}

function PatternLesson({ pattern }: { pattern: PatternDefinition }) {
  useDocumentTitle(pattern.title);
  const { values, setValues, invalid } = useUrlParams(pattern);
  const paramKey = JSON.stringify(values);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- paramKey is the stable identity of `values`
  const simulation = useMemo(() => executePattern(pattern, values), [pattern, paramKey]);
  const explanation = pattern.explain(simulation.params);
  const { previous, next } = getNeighbours(pattern.id);
  const [solved, markSolved] = useCorrectQuizAnswers();
  const src = simulation.source.partText;
  const paramSummary = pattern.params.map((s) => `${s.label.toLowerCase()} = ${values[s.name]}`).join(', ');

  const startSimulation = () => {
    document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('next-step-button')?.focus({ preventScroll: true });
  };

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/patterns" className="font-semibold text-cyan-300 underline underline-offset-2">
              Patterns
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{pattern.title}</li>
        </ol>
      </nav>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={pattern.difficulty} />
          <CategoryBadge category={pattern.category} level={pattern.level} />
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{pattern.title}</h1>
        <p className="mt-2 max-w-3xl text-slate-300">{pattern.description}</p>
        <button type="button" onClick={startSimulation} className="btn-primary mt-4">
          <Play aria-hidden="true" className="h-4 w-4" /> Start simulation
        </button>
      </header>

      {invalid && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-amber-300/10 p-3 text-sm text-amber-100 ring-1 ring-amber-300/30">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          The link contained a setting that is not allowed ({invalid}) so the default settings are used instead.
        </p>
      )}

      <section aria-labelledby="overview-title" className="mt-8 grid gap-4 lg:grid-cols-3">
        <h2 id="overview-title" className="sr-only">
          Lesson overview
        </h2>
        <div className="card p-5 lg:col-span-2">
          <h3 className="panel-title">Learning objective</h3>
          <p className="mt-2 font-semibold text-white">{pattern.objective}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
            {pattern.goals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          {pattern.notes.length > 0 && (
            <div className="mt-4 rounded-xl bg-white/[0.03] p-3 text-sm text-slate-300 ring-1 ring-white/10">
              <p className="font-semibold">Good to know</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {pattern.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="card p-5">
          <h3 className="panel-title">Expected output</h3>
          <p className="mt-1 text-xs text-slate-400">For {paramSummary}.</p>
          <div className="mt-2">
            <OutputPreview output={simulation.finalOutput} label="Expected output" />
          </div>
        </div>
      </section>

      <section aria-labelledby="explain-title" className="mt-8">
        <h2 id="explain-title" className="text-2xl font-bold text-white">
          How the program works
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {explanation.map((card) => (
            <ExplanationCard key={card.title} title={card.title} code={cardCode(card, src)} text={card.text} />
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-400">
          “Outer loop = rows, inner loop = what goes on each row” is the way of thinking used for these patterns. It is a
          helpful model, not a rule for every nested loop.
        </p>
      </section>

      <section id="simulator" aria-labelledby="simulator-title" className="mt-10 scroll-mt-16">
        <h2 id="simulator-title" className="text-2xl font-bold text-white">
          Simulator
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Each step is one real operation of the program: setting a variable, checking a condition, printing, or updating a
          loop variable.
        </p>
        <div className="mt-4">
          <ParamControls specs={pattern.params} values={values} onChange={setValues} />
        </div>
        <div className="mt-4">
          <SimulatorWorkspace
            key={`${pattern.id}:${paramKey}`}
            simulation={simulation}
            variables={pattern.program.variables}
            variableRoles={pattern.variableRoles}
          />
        </div>
      </section>

      <section aria-labelledby="quiz-title" className="mt-12">
        <h2 id="quiz-title" className="text-2xl font-bold text-white">
          Check your understanding
        </h2>
        <p className="mt-1 text-sm text-slate-400">Answer, use a hint if you are stuck, and try again as often as you like.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {pattern.quiz.map((q) => (
            <QuizCard key={q.id} question={q} solvedBefore={solved.includes(q.id)} onCorrect={markSolved} />
          ))}
        </div>
      </section>

      <nav aria-label="Other patterns" className="mt-12 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
        {previous ? (
          <Link to={`/patterns/${previous.id}`} className="card flex items-center gap-3 p-4 hover:border-cyan-300/40">
            <ArrowLeft aria-hidden="true" className="h-5 w-5 shrink-0 text-cyan-300" />
            <span>
              <span className="block text-xs text-slate-400">Previous pattern</span>
              <span className="font-semibold">{previous.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/patterns/${next.id}`} className="card flex items-center justify-end gap-3 p-4 text-right hover:border-cyan-300/40">
            <span>
              <span className="block text-xs text-slate-400">Next pattern</span>
              <span className="font-semibold">{next.title}</span>
            </span>
            <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-cyan-300" />
          </Link>
        ) : (
          <Link to="/practice" className="card flex items-center justify-end gap-3 p-4 text-right hover:border-cyan-300/40">
            <span>
              <span className="block text-xs text-slate-400">All patterns done?</span>
              <span className="font-semibold">Go to the Practice zone</span>
            </span>
            <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-cyan-300" />
          </Link>
        )}
      </nav>
    </div>
  );
}

export function PatternPage() {
  const { patternId } = useParams();
  const pattern = getPattern(patternId);
  if (!pattern) return <NotFoundPage message={`There is no pattern called “${patternId ?? ''}”.`} />;
  // Key by id so all lesson state resets when moving to another pattern.
  return <PatternLesson key={pattern.id} pattern={pattern} />;
}
