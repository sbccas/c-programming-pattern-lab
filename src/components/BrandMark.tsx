import { useId } from 'react';

const CELLS = [
  [4, 5],
  [4, 11],
  [10, 11],
  [4, 17],
  [10, 17],
  [16, 17],
] as const;

/** The lab's logo: a glowing star-triangle glyph. */
export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  // useId() can contain characters that break `url(#…)`, so keep only safe ones.
  const gradientId = `brand-mark-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan via-neon-violet to-neon-pink p-[1.5px] shadow-[0_0_20px_-4px_rgba(34,227,255,0.8)] ${className}`}
    >
      <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-deep">
        <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22e3ff" />
              <stop offset="0.55" stopColor="#a78bfa" />
              <stop offset="1" stopColor="#f472d0" />
            </linearGradient>
          </defs>
          {CELLS.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1.2" fill={`url(#${gradientId})`} />
          ))}
        </svg>
      </span>
    </span>
  );
}
