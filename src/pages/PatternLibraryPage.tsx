import { useSearchParams } from 'react-router-dom';
import { PatternCard } from '../components/PatternCard';
import { PATTERNS } from '../patterns';
import { CATEGORIES, DIFFICULTIES, type Category, type Difficulty } from '../patterns/types';
import { useCompletedPatterns } from '../utils/progress';
import { useDocumentTitle } from '../utils/useDocumentTitle';

interface FilterGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T | null) => void;
}

function FilterGroup<T extends string>({ label, options, value, onChange }: FilterGroupProps<T>) {
  const chip = (active: boolean) =>
    `min-h-11 rounded-full border px-4 text-sm font-semibold ${
      active ? 'border-cyan-300/70 bg-cyan-300/15 text-cyan-100 shadow-[0_0_20px_-6px_rgba(34,227,255,0.7)]' : 'border-white/15 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white'
    }`;
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-slate-400">{label}:</span>
      <button type="button" className={chip(value === null)} aria-pressed={value === null} onClick={() => onChange(null)}>
        All
      </button>
      {options.map((o) => (
        <button key={o} type="button" className={chip(value === o)} aria-pressed={value === o} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function PatternLibraryPage() {
  useDocumentTitle('Pattern library');
  const [completed] = useCompletedPatterns();
  const [search, setSearch] = useSearchParams();
  const categoryParam = search.get('category');
  const difficultyParam = search.get('difficulty');
  const category = CATEGORIES.find((c) => c === categoryParam) ?? null;
  const difficulty = DIFFICULTIES.find((d) => d === difficultyParam) ?? null;

  const setFilter = (key: 'category' | 'difficulty', value: string | null) => {
    const next = new URLSearchParams(search);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearch(next, { replace: true });
  };

  const visible = PATTERNS.filter((p) => (!category || p.category === category) && (!difficulty || p.difficulty === difficulty));

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-white">Pattern library</h1>
      <p className="mt-2 max-w-2xl text-slate-300">
        The patterns are ordered from simple to more challenging. Each lesson has the C code, the expected output, a
        step-by-step simulator, a dry-run table and practice questions.
      </p>
      <p className="mt-1 text-sm text-slate-400">
        {completed.length} of {PATTERNS.length} simulations completed on this device.
      </p>

      <div className="mt-6 space-y-3">
        <FilterGroup<Category> label="Category" options={CATEGORIES} value={category} onChange={(v) => setFilter('category', v)} />
        <FilterGroup<Difficulty> label="Difficulty" options={DIFFICULTIES} value={difficulty} onChange={(v) => setFilter('difficulty', v)} />
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} pattern{visible.length === 1 ? '' : 's'}.
      </p>
      {visible.length === 0 ? (
        <p className="card mt-6 p-6 text-center text-slate-400">No patterns match these filters yet. Choose “All” to see every pattern.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <PatternCard key={p.id} pattern={p} completed={completed.includes(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
