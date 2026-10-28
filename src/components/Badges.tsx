import type { Difficulty } from '../patterns/types';

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner: 'bg-lime-400/10 text-lime-300 ring-lime-400/40',
  Easy: 'bg-cyan-300/10 text-cyan-200 ring-cyan-300/40',
  Moderate: 'bg-pink-400/10 text-pink-300 ring-pink-400/40',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`chip ${DIFFICULTY_STYLES[difficulty]}`}>
      <span className="sr-only">Difficulty: </span>
      {difficulty}
    </span>
  );
}

export function CategoryBadge({ category, level }: { category: string; level: number }) {
  return (
    <span className="chip bg-white/[0.04] text-slate-300 ring-white/15">
      L{level} · {category}
    </span>
  );
}
