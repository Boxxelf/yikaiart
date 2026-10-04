import { LocaleProvider, useTranslation } from './i18n/Locale';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/source-serif-4';
import './styles/tokens.css';
import './styles/global.css';
import './styles/i18n.css';
import LanguageSwitch from './components/LanguageSwitch';
import SiteNavigation from './components/SiteNavigation';
const WorksEditorPage = lazy(() => import('./pages/WorksEditorPage'));
const WorksPage = lazy(() => import('./pages/WorksPage'));
const MemoriesPage = lazy(() => import('./pages/MemoriesPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
function Site() {
 const { t } = useTranslation();

  const location = useLocation();
  const about = location.pathname.startsWith('/about');
  return <div className={`site ${about ? 'site-about' : 'site-works'}`}>
    <a className="skip-link" href="#main">{t("Skip to content")}</a>
    <header className="site-header">
      <NavLink className="wordmark" to="/" aria-label={t("Yi Kai — Home")}>{t("YI KAI")}<span className="wordmark-period">{t(".")}</span></NavLink>
      <span className="artist-descriptor">{t("Chinese-American")}<br />{t("Contemporary Artist")}</span>
      <SiteNavigation/>
    </header>
    <LanguageSwitch floating/><Suspense fallback={<main id="main" className="page-loading" aria-live="polite">{t("Opening the archive…")}</main>}>
      <Routes><Route path="/works-editor" element={<WorksEditorPage />} /><Route path="/" element={<WorksPage key="home" home />} /><Route path="/works" element={<WorksPage key="archive" />} /><Route path="/memories" element={<MemoriesPage />} /><Route path="/reviews" element={<ReviewsPage/>}/><Route path="/collections" element={<CollectionsPage/>}/><Route path="/about" element={<AboutPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
    </Suspense>
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}><LocaleProvider><Site /></LocaleProvider></BrowserRouter></React.StrictMode>);
