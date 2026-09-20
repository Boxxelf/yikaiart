import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/source-serif-4';
import './styles/tokens.css';
import './styles/global.css';
import SiteNavigation from './components/SiteNavigation';
const WorksPage = lazy(() => import('./pages/WorksPage'));
const MemoriesPage = lazy(() => import('./pages/MemoriesPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
function Site() {
  const location = useLocation();
  const about = location.pathname.startsWith('/about');
  return <div className={`site ${about ? 'site-about' : 'site-works'}`}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <NavLink className="wordmark" to="/works" aria-label="Yi Kai — Selected Works">YI KAI<span className="wordmark-period">.</span></NavLink>
      <span className="artist-descriptor">Chinese-American<br />Contemporary Artist</span>
      <SiteNavigation/>
    </header>
    <Suspense fallback={<main id="main" className="page-loading" aria-live="polite">Opening the archive…</main>}>
      <Routes><Route path="/" element={<Navigate to="/works" replace />} /><Route path="/works" element={<WorksPage />} /><Route path="/memories" element={<MemoriesPage />} /><Route path="/reviews" element={<ReviewsPage/>}/><Route path="/collections" element={<CollectionsPage/>}/><Route path="/about" element={<AboutPage />} /><Route path="*" element={<Navigate to="/works" replace />} /></Routes>
    </Suspense>
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}><Site /></BrowserRouter></React.StrictMode>);
