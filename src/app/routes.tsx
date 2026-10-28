import { Route, Routes } from 'react-router-dom';
import { AboutPage } from '../pages/AboutPage';
import { CreatorPage } from '../pages/CreatorPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PatternLibraryPage } from '../pages/PatternLibraryPage';
import { PatternPage } from '../pages/PatternPage';
import { PracticePage } from '../pages/PracticePage';
import { Layout } from './Layout';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="patterns" element={<PatternLibraryPage />} />
        <Route path="patterns/:patternId" element={<PatternPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="creator" element={<CreatorPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
