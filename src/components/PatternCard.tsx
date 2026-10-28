import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PatternDefinition } from '../patterns/types';
import { CategoryBadge, DifficultyBadge } from './Badges';
import { OutputPreview } from './OutputPreview';

interface PatternCardProps {
  pattern: PatternDefinition;
  completed?: boolean;
}

export function PatternCard({ pattern, completed = false }: PatternCardProps) {
  return (
    <article className="glass group relative flex flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_0_50px_-18px_rgba(34,227,255,0.7)] motion-reduce:hover:translate-y-0">
      <div className="flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={pattern.difficulty} />
        <CategoryBadge category={pattern.category} level={pattern.level} />
      </div>
      <h3 className="mt-3 text-lg font-bold">{pattern.title}</h3>
      <p className="mt-1 text-sm text-slate-400">{pattern.summary}</p>
      <div className="mt-3">
        <OutputPreview output={pattern.expectedOutput} label={`Expected output of ${pattern.title}`} size="sm" />
      </div>
      <p className="mt-3 text-sm text-slate-300">
        <strong className="text-white">You will learn:</strong> {pattern.objective}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        {completed ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-lime-300">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> Completed
          </span>
        ) : (
          <span />
        )}
        <Link to={`/patterns/${pattern.id}`} className="btn-primary" aria-label={`Open lesson: ${pattern.title}`}>
          Open lesson
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
