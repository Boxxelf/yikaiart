import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collections, collectionFor } from '../content/collections';
import { featuredWorks, works } from '../content/works';
import { useMedia } from '../hooks';
import WorkImage from '../components/WorkImage';
import WorkDetail from '../components/WorkDetail';
const WorksRing = lazy(() => import('../features/works-ring/WorksRing'));
export default function WorksPage() {
  const [params, setParams] = useSearchParams();
  const [current, setCurrent] = useState(0);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const ringControl = useRef<(delta: number) => void>(() => {});
  const touchStart = useRef(0);
  const reduce = useMedia('(prefers-reduced-motion: reduce)');
  const small = useMedia('(max-width: 767px)');
  const collection = collections.find(c => c.id === params.get('series'));
  const catalogue = params.get('view') === 'archive' || !!collection;
  const currentWork = featuredWorks[current];
  const items = catalogue ? works.filter(w => !collection || w.collectionId === collection.id) : featuredWorks;
  const detail = works.find(w => w.id === params.get('work'));
  const staticMode = reduce || small || webglFailed;
  const move = (delta: number) => staticMode ? setCurrent(i => (i + delta + 12) % 12) : ringControl.current(delta);
  const openWork = (id: string) => { const p = new URLSearchParams(params); p.set('work', id); setParams(p, { preventScrollReset: true }); };
  const closeWork = () => { const p = new URLSearchParams(params); p.delete('work'); setParams(p, { replace: true, preventScrollReset: true }); };
  const changeCollection = (id?: string) => { setSeriesOpen(false); setParams(id ? { series: id } : { view: 'archive' }); };
  useEffect(() => { document.title = `${detail ? detail.displayTitle : collection ? collection.label : 'Selected Works'} — Yi Kai`; }, [collection, detail]);
  useEffect(() => { if (catalogue) window.scrollTo(0, 0); }, [collection, catalogue]);
  return <main id="main" tabIndex={-1} className={catalogue ? 'archive-page' : 'works-page'}>
    {catalogue ? <>
      <div className="archive-heading"><div><span className="small-label">Selected works / {items.length} works</span><h1>{collection ? collection.label : 'The archive'}</h1></div><button className="text-link" onClick={() => setParams({})}>Return to the ring <span aria-hidden="true">↗</span></button></div>
      <nav className="collection-tabs" aria-label="Filter collections"><button aria-pressed={!collection} onClick={() => changeCollection()}>All works <sup>113</sup></button>{collections.map(c => <button key={c.id} aria-pressed={collection?.id === c.id} onClick={() => changeCollection(c.id)}>{c.label} <sup>{c.count}</sup></button>)}</nav>
      <div className="archive-grid">{items.map((work, i) => <button className="archive-work" key={work.id} onClick={() => openWork(work.id)} aria-label={`View ${work.displayTitle}`}><div className="archive-image"><WorkImage work={work} eager={i < 4} /></div><div className="archive-caption"><h2>{work.displayTitle}</h2><span>{collectionFor(work.collectionId).label}{work.dimensions ? ` / ${work.dimensions}` : ''}</span></div></button>)}</div>
      <footer className="archive-footer"><span>Yi Kai</span><span>© {new Date().getFullYear()} Yi Kai. All rights reserved.</span></footer>
    </> : <>
      <h1 className="sr-only">Selected works by Yi Kai</h1>
      <div className="ring-surface" role="region" aria-label="Featured artwork carousel" onKeyDown={e => { if (e.target instanceof HTMLElement && e.target.closest('button,a')) return; if (e.key === 'Enter') { e.preventDefault(); openWork(currentWork.id); } if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); } }}>
        {staticMode ? <div className="static-ring" onTouchStart={e => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStart.current; if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1); }}><button className="static-work" onClick={() => openWork(currentWork.id)} aria-label={`View ${currentWork.displayTitle}`}><WorkImage key={currentWork.id} work={currentWork} eager /></button></div>
        : <Suspense fallback={<div className="ring-loading"><WorkImage work={currentWork} eager /></div>}><WorksRing initialIndex={current} onIndexChange={setCurrent} onOpen={i => openWork(featuredWorks[i].id)} controls={ringControl} paused={!!detail || seriesOpen} onFailure={() => setWebglFailed(true)} /></Suspense>}
      </div>
      <div className="work-label" aria-live="polite" aria-atomic="true"><span className="work-number">{String(current + 1).padStart(2, '0')}<span> / 12</span></span><div><p className="small-label">{collectionFor(currentWork.collectionId).label}</p><h2>{currentWork.displayTitle}</h2>{currentWork.dimensions && <p className="work-dimensions">{currentWork.dimensions}</p>}</div></div>
      <nav className="series-index" aria-label="Series"><span className="small-label">Series</span>{collections.map(c => <button key={c.id} onClick={() => changeCollection(c.id)} className={currentWork.collectionId === c.id ? 'is-active' : ''}><span>{c.label}</span><span>{c.count}</span></button>)}</nav>
      <button className="series-toggle" aria-expanded={seriesOpen} onClick={() => setSeriesOpen(!seriesOpen)}>Series <span aria-hidden="true">{seriesOpen ? '−' : '+'}</span></button>
      {seriesOpen && <nav className="mobile-series" aria-label="Choose series">{collections.map(c => <button key={c.id} onClick={() => changeCollection(c.id)}>{c.label}<span>{c.count}</span></button>)}</nav>}
      <button className="view-current text-link" onClick={() => openWork(currentWork.id)}>View work <span aria-hidden="true">↗</span></button>
      <footer className="works-footer"><button className="text-link" onClick={() => changeCollection()}>View all works <span className="count">113</span></button><span className="browse-hint">{small ? 'Swipe to browse' : reduce ? 'Use arrows to browse' : 'Scroll or drag to browse'}</span><div className="ring-arrows"><button onClick={() => move(-1)} aria-label="Previous featured work">←</button><span>{String(current + 1).padStart(2, '0')} — 12</span><button onClick={() => move(1)} aria-label="Next featured work">→</button></div></footer>
    </>}
    {detail && <WorkDetail work={detail} items={items.some(w => w.id === detail.id) ? items : works.filter(w => w.collectionId === detail.collectionId)} onChange={openWork} onClose={closeWork} />}
  </main>;
}
