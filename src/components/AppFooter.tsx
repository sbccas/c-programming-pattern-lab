import { ExternalLink, Mail, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CREATOR, ORGANISATION } from '../branding';
import { BrandMark } from './BrandMark';
import { GithubIcon } from './GithubIcon';
import { VisitorCounter } from './VisitorCounter';

export function AppFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-void/60 backdrop-blur">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-8 w-8" />
            <p className="font-display text-lg font-bold text-white">C Programming Pattern Lab</p>
          </div>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            See the code. Follow the loop. Understand the pattern. Runs in your browser — no login, no cookies, no personal data.{' '}
            <Link to="/about" className="font-semibold text-cyan-300 underline-offset-4 hover:underline">
              About &amp; limitations
            </Link>
          </p>
          <div className="mt-3">
            <VisitorCounter variant="inline" />
          </div>
        </div>

        <div className="glass p-5">
          <p className="panel-title flex items-center gap-1.5">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Designed &amp; developed by
          </p>
          <p className="mt-2 font-display text-xl font-bold text-white">
            <Link to="/creator" className="hover:text-cyan-200">
              {CREATOR.name}
            </Link>
          </p>
          <p className="text-sm text-slate-400">{CREATOR.headline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={CREATOR.github.url} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-10 px-3 text-xs">
              <GithubIcon /> {CREATOR.github.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={ORGANISATION.url} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-10 px-3 text-xs">
              <ExternalLink aria-hidden="true" className="h-4 w-4" /> {ORGANISATION.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={`mailto:${CREATOR.email}`} className="btn-secondary min-h-10 px-3 text-xs">
              <Mail aria-hidden="true" className="h-4 w-4" /> {CREATOR.email}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <p className="container-page safe-bottom pt-4 text-xs text-slate-400">
          © {new Date().getFullYear()} {CREATOR.name} · {ORGANISATION.name}. Made for first-year BCA, BSc IT &amp; BSc Data
          Science students.
        </p>
      </div>
    </footer>
  );
}
