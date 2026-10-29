import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      {/* Vercel Web Analytics: cookieless, anonymous page-view counts for the site owner's dashboard. */}
      <Analytics />
    </BrowserRouter>
  );
}
