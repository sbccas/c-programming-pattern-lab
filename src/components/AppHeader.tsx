import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ORGANISATION } from '../branding';
import { BrandMark } from './BrandMark';

const NAV = [
  { to: '/patterns', label: 'Patterns' },
  { to: '/practice', label: 'Practice' },
  { to: '/creator', label: 'Creator' },
  { to: '/about', label: 'About' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition-colors ${
    isActive ? 'bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/30' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
  }`;

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-void/70 backdrop-blur-xl">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-cyan-300 focus:px-3 focus:py-2 focus:font-semibold focus:text-slate-950"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link to="/" onClick={close} className="flex min-h-11 min-w-0 items-center gap-2.5">
          <BrandMark />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-[15px] font-bold tracking-tight text-white sm:text-base">
              C Pattern <span className="neon-text">Lab</span>
            </span>
            <span className="block truncate text-[10px] font-medium tracking-wide text-slate-400 sm:text-[11px]">
              by {ORGANISATION.shortName}
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="btn-ghost h-11 w-11 px-0 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Main mobile" className="border-t border-white/10 bg-void/95 md:hidden">
          <ul className="container-page grid grid-cols-2 gap-2 py-3">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass} onClick={close}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
