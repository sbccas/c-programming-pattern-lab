import { useState } from 'react';
import { CREATOR } from '../branding';

const SIZES = {
  md: { box: 'h-20 w-20', text: 'text-2xl' },
  lg: { box: 'h-32 w-32 sm:h-36 sm:w-36', text: 'text-4xl sm:text-5xl' },
  xl: { box: 'h-40 w-40 sm:h-52 sm:w-52', text: 'text-5xl sm:text-6xl' },
} as const;

/**
 * The creator's portrait inside a slowly rotating neon ring.
 * - Animated GIF normally; a still frame when the viewer prefers reduced motion.
 * - Falls back to a monogram if the image cannot load.
 */
export function CreatorAvatar({ size = 'md' }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative mx-auto shrink-0 md:mx-0 ${s.box}`}>
      <div
        aria-hidden="true"
        className="absolute -inset-[3px] animate-spin-slow rounded-full motion-reduce:animate-none"
        style={{ background: 'conic-gradient(from 0deg, #22e3ff, #a78bfa, #f472d0, #22e3ff)' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: 'conic-gradient(#22e3ff, #a78bfa, #f472d0, #22e3ff)', opacity: 0.45 }}
      />
      <div className="absolute inset-[2px] overflow-hidden rounded-full bg-deep">
        {failed ? (
          <span role="img" aria-label={CREATOR.photo.alt} className="flex h-full w-full items-center justify-center">
            <span aria-hidden="true" className={`neon-text font-display font-bold ${s.text}`}>
              {CREATOR.initials}
            </span>
          </span>
        ) : (
          <picture>
            <source srcSet={CREATOR.photo.still} media="(prefers-reduced-motion: reduce)" type="image/webp" />
            <img
              src={CREATOR.photo.animated}
              alt={CREATOR.photo.alt}
              width={612}
              height={612}
              decoding="async"
              onError={() => setFailed(true)}
              // Slight zoom crops the white corners of the round source photo.
              className="h-full w-full scale-[1.04] object-cover"
            />
          </picture>
        )}
      </div>
    </div>
  );
}
