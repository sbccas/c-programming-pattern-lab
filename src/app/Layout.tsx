import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';

/** Scroll to the top when the page (not just the query string) changes. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo?.(0, 0);
  }, [pathname]);
  return null;
}

/** Decorative animated background: glow orbs, stars and a fading grid. */
function LabBackdrop() {
  return (
    <div className="lab-backdrop" aria-hidden="true">
      <div className="lab-stars" />
      <div
        className="lab-orb animate-float-slow motion-reduce:animate-none"
        style={{
          width: '42rem',
          height: '42rem',
          left: '-14rem',
          top: '-12rem',
          background: 'radial-gradient(circle, rgb(34 227 255 / 0.18), transparent 65%)',
        }}
      />
      <div
        className="lab-orb animate-float-slower motion-reduce:animate-none"
        style={{
          width: '38rem',
          height: '38rem',
          right: '-12rem',
          top: '20%',
          background: 'radial-gradient(circle, rgb(167 139 250 / 0.2), transparent 65%)',
        }}
      />
    </div>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <LabBackdrop />
      <ScrollToTop />
      <AppHeader />
      <main id="main" className="flex-1 focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
