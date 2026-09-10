import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/source-serif-4';
import './styles/tokens.css';
import './styles/global.css';
const WorksPage = lazy(() => import('./pages/WorksPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
function Site() {
  const location = useLocation();
  const about = location.pathname.startsWith('/about');
  return <div className={`site ${about ? 'site-about' : 'site-works'}`}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <NavLink className="wordmark" to="/works" aria-label="Yi Kai — Selected Works">YI KAI<span className="wordmark-period">.</span></NavLink>
      <span className="artist-descriptor">Chinese-American<br />Contemporary Artist</span>
      <nav aria-label="Main navigation"><NavLink to="/works">Works</NavLink><NavLink to="/about">About</NavLink></nav>
    </header>
    <Suspense fallback={<main id="main" className="page-loading" aria-live="polite">Opening the archive…</main>}>
      <Routes><Route path="/" element={<Navigate to="/works" replace />} /><Route path="/works" element={<WorksPage />} /><Route path="/about" element={<AboutPage />} /><Route path="*" element={<Navigate to="/works" replace />} /></Routes>
    </Suspense>
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}><Site /></BrowserRouter></React.StrictMode>);
