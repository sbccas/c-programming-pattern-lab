import { Users } from 'lucide-react';
import { formatCount, useVisitorStats } from '../utils/visitorStats';

/**
 * Live public counter: "812 students · 3,940 visits".
 * Renders nothing until real numbers are available (never a fake or zero placeholder).
 */
export function VisitorCounter({ variant = 'pill' }: { variant?: 'pill' | 'inline' }) {
  const stats = useVisitorStats();
  if (!stats) return null;

  const students = `${formatCount(stats.devices)} ${stats.devices === 1 ? 'student' : 'students'}`;
  const visits = `${formatCount(stats.visits)} ${stats.visits === 1 ? 'visit' : 'visits'}`;
  const label = `${students} have used the lab, ${visits} in total`;

  if (variant === 'inline') {
    return (
      <p className="flex items-center gap-2 text-xs text-slate-400" data-testid="visitor-counter" aria-label={label}>
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-neon-lime shadow-[0_0_8px_rgba(163,247,91,0.9)]" />
        <span aria-hidden="true">
          {students} · {visits}
        </span>
      </p>
    );
  }

  return (
    <p
      className="inline-flex items-center gap-2.5 rounded-full border border-lime-300/30 bg-lime-300/[0.07] px-3.5 py-1.5 text-sm text-slate-200"
      data-testid="visitor-counter"
      aria-label={label}
    >
      <span aria-hidden="true" className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-lime opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-lime" />
      </span>
      <Users aria-hidden="true" className="h-4 w-4 text-lime-300" />
      <span aria-hidden="true">
        <strong className="font-mono font-semibold text-white">{formatCount(stats.devices)}</strong>{' '}
        {stats.devices === 1 ? 'student' : 'students'} <span className="text-slate-500">·</span>{' '}
        <strong className="font-mono font-semibold text-white">{formatCount(stats.visits)}</strong>{' '}
        {stats.visits === 1 ? 'visit' : 'visits'}
      </span>
    </p>
  );
}
