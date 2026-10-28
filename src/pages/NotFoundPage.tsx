import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../utils/useDocumentTitle';

export function NotFoundPage({ message = 'This page does not exist.' }: { message?: string }) {
  useDocumentTitle('Page not found');
  return (
    <div className="container-page py-20 text-center">
      <p className="font-mono text-5xl font-bold text-cyan-300">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-slate-400">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/patterns" className="btn-primary">
          Go to the pattern library
        </Link>
        <Link to="/" className="btn-secondary">
          Home
        </Link>
      </div>
    </div>
  );
}
