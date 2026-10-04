import { useTranslation } from '../i18n/Locale';
import Icon from '../components/Icon';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { collections, collectionFor } from '../content/collections';
import { featuredWorks, works } from '../content/works';
import { useMedia } from '../hooks';
import WorkImage from '../components/WorkImage';
import WorkDetail from '../components/WorkDetail';
import MobileWorksGallery from '../features/works-ring/MobileWorksGallery';
const openingIndex = featuredWorks.findIndex(work => work.id === 'opera-players-c1-mickey-opera-players-with-masker-60x120');
const WorksRing = lazy(() => import('../features/works-ring/WorksRing'));
export default function WorksPage({ home = false }: { home?: boolean }) {
 const { t, locale } = useTranslation();

  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [current, setCurrent] = useState(openingIndex);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const ringControl = useRef<(delta: number) => void>(() => {});
  const reduce = useMedia('(prefers-reduced-motion: reduce)');
  const small = useMedia('(max-width: 767px)');
  const collection = collections.find(c => c.id === params.get('series'));
  const catalogue = !home;
  const currentWork = featuredWorks[current];
  const items = catalogue ? works.filter(w => !collection || w.collectionId === collection.id) : featuredWorks;
  const detail = works.find(w => w.id === params.get('work'));
  const staticMode = reduce || small || webglFailed;
  const move = (delta: number) => staticMode ? setCurrent(i => (i + delta + 12) % 12) : ringControl.current(delta);
  const openWork = (id: string) => { const p = new URLSearchParams(params); p.set('work', id); setParams(p, { preventScrollReset: true }); };
  const closeWork = () => { const p = new URLSearchParams(params); p.delete('work'); setParams(p, { replace: true, preventScrollReset: true }); };
  const changeCollection = (id?: string) => { setSeriesOpen(false); navigate(id ? `/works?series=${id}` : '/works'); };
  useEffect(() => { document.title = t(`${detail ? detail.displayTitle : collection ? collection.label : home ? 'Home' : 'Works'} — Yi Kai`); }, [collection, detail, home, t]);
  useEffect(() => { if (catalogue) window.scrollTo(0, 0); }, [collection, catalogue]);
  return <main id="main" tabIndex={-1} className={catalogue ? 'archive-page' : 'works-page'}>
    {catalogue ? <>
      <div className="archive-heading"><div><span className="small-label">{t("Selected works / ")}{t(items.length)}{t(" works")}</span><h1>{t(collection ? collection.label : 'The archive')}</h1></div><Link className="text-link" to="/">{t("Back to Home ")}<span aria-hidden="true"><Icon name="diagonal" /></span></Link></div>
      <nav className="collection-tabs" aria-label={t("Filter collections")}><button aria-pressed={!collection} onClick={() => changeCollection()}>{t("All works ")}<sup>{t(works.length)}</sup></button>{collections.map(c => <button key={c.id} aria-pressed={collection?.id === c.id} onClick={() => changeCollection(c.id)}>{t(c.label)} <sup>{t(c.count)}</sup></button>)}</nav>
      <div className="archive-grid">{items.map((work, i) => <button className="archive-work" key={work.id} onClick={() => openWork(work.id)} aria-label={t(`View ${work.displayTitle}`)}><div className="archive-image"><WorkImage work={work} eager={i < 4} /></div><div className="archive-caption"><h2>{t(work.displayTitle)}</h2><span>{t(collectionFor(work.collectionId).label)}{t(work.medium ? ` / ${work.medium}` : '')}{t(work.dimensions ? ` / ${work.dimensions}` : '')}</span></div></button>)}</div>
      <footer className="archive-footer"><span>{t("Yi Kai")}</span><span>{t("© ")}{t(new Date().getFullYear())}{t(" Yi Kai. All rights reserved.")}</span></footer>
    </> : <>
      <h1 className="sr-only">{t("Selected works by Yi Kai")}</h1>
      <div className="ring-surface" role="region" aria-label={t("Featured artwork carousel")} onKeyDown={e => { if (e.target instanceof HTMLElement && e.target.closest('button,a')) return; if (e.key === 'Enter') { e.preventDefault(); openWork(currentWork.id); } if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); } }}>
        {staticMode ? <MobileWorksGallery work={currentWork} move={move} open={() => openWork(currentWork.id)} reduced={reduce || !small} paused={!!detail || seriesOpen} />
        : <Suspense fallback={<div className="ring-loading" aria-label={t("Loading artworks")} />}><WorksRing initialIndex={current} onIndexChange={setCurrent} onOpen={i => openWork(featuredWorks[i].id)} controls={ringControl} paused={!!detail || seriesOpen} onFailure={() => setWebglFailed(true)} /></Suspense>}
      </div>
      <div className="work-label" aria-live="polite" aria-atomic="true"><span className="work-number">{t(String(current + 1).padStart(2, '0'))}<span>{t(" / 12")}</span></span><div><p className="small-label">{t(collectionFor(currentWork.collectionId).label)}</p><h2>{t(currentWork.displayTitle)}</h2>{currentWork.dimensions && <p className="work-dimensions">{t(currentWork.dimensions)}</p>}</div></div>
      <nav className="series-index" aria-label={t("Series")}><span className="small-label">{t("Series")}</span>{collections.map(c => <button key={c.id} onClick={() => changeCollection(c.id)} className={currentWork.collectionId === c.id ? 'is-active' : ''}><span>{t(c.label)}</span><span>{t(c.count)}</span></button>)}</nav>
      <button className="series-toggle" aria-expanded={seriesOpen} onClick={() => setSeriesOpen(!seriesOpen)}>{t("Series ")}<span aria-hidden="true"><Icon name={seriesOpen ? 'minus' : 'plus'} /></span></button>
      {seriesOpen && <nav className="mobile-series" aria-label={t("Choose series")}>{collections.map(c => <button key={c.id} onClick={() => changeCollection(c.id)}>{t(c.label)}<span>{t(c.count)}</span></button>)}</nav>}
      <button className="view-current text-link" onClick={() => openWork(currentWork.id)}>{t("View work ")}<span aria-hidden="true"><Icon name="diagonal" /></span></button>
      <footer className="works-footer"><button className="text-link" onClick={() => changeCollection()}>{t("View all works ")}<span className="count">{t(works.length)}</span></button><span className="browse-hint">{t(small ? 'Swipe to browse' : reduce ? 'Use arrows to browse' : 'Scroll or drag to browse')}</span><div className="ring-arrows"><button onClick={() => move(-1)} aria-label={t("Previous featured work")}><Icon name="left" /></button><span>{t(String(current + 1).padStart(2, '0'))}{t(" — 12")}</span><button onClick={() => move(1)} aria-label={t("Next featured work")}><Icon name="right" /></button></div></footer>
    </>}
    {detail && <WorkDetail work={detail} items={items.some(w => w.id === detail.id) ? items : works.filter(w => w.collectionId === detail.collectionId)} onChange={openWork} onClose={closeWork} />}
  </main>;
}
