import { useEffect, useRef, useState } from 'react';
import { featuredWorks, type Work } from '../../content/works';
import WorkImage from '../../components/WorkImage';

type Props = { work: Work; move: (delta: number) => void; open: () => void; reduced: boolean; paused: boolean };
export default function MobileWorksGallery({ work, move, open, reduced, paused }: Props) {
  const [opening, setOpening] = useState(!reduced && !paused);
  const [ready, setReady] = useState(false);
  const gesture = useRef({ x: 0, y: 0, swiped: false });
  useEffect(() => {
    if (reduced || paused) setOpening(false);
  }, [reduced, paused]);
  useEffect(() => {
    if (!ready || !opening) return;
    const timer = window.setTimeout(() => setOpening(false), 1800);
    return () => clearTimeout(timer);
  }, [ready, opening]);
  return <div className="mobile-gallery" data-intro={opening} data-ready={ready}>
    <div className="static-ring" onTouchStart={e => { gesture.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, swiped: false }; }} onTouchEnd={e => {
      const dx = e.changedTouches[0].clientX - gesture.current.x;
      const dy = e.changedTouches[0].clientY - gesture.current.y;
      if (!opening && !paused && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { gesture.current.swiped = true; move(dx < 0 ? 1 : -1); }
    }}>
      {opening && <div className="mobile-intro-leaves" aria-hidden="true">{[featuredWorks[0], featuredWorks[1]].map(w => <div key={w.id}><WorkImage work={w} eager /></div>)}</div>}
      <button className="static-work" disabled={opening} onClick={e => { if (gesture.current.swiped) { e.preventDefault(); gesture.current.swiped = false; return; } open(); }} aria-label={`View ${work.displayTitle}`}>
        <WorkImage key={work.id} work={work} eager onLoad={() => setReady(true)} />
      </button>
      {opening && <span className="mobile-intro-wordmark" aria-hidden="true">YI KAI<span>A life in painting</span></span>}
    </div>
    {opening && <button className="mobile-intro-skip" onClick={() => setOpening(false)}>Skip intro</button>}
    {!opening && <span className="mobile-gallery-hint">Swipe to explore · Tap to view</span>}
  </div>;
}
