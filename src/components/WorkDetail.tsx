import { useEffect, useRef } from 'react';
import { collectionFor } from '../content/collections';
import type { Work } from '../content/works';
import WorkImage from './WorkImage';
export default function WorkDetail({ work, items, onChange, onClose }: { work: Work; items: Work[]; onChange: (id: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const index = items.findIndex(w => w.id === work.id);
  const step = (delta: number) => onChange(items[(index + delta + items.length) % items.length].id);
  useEffect(() => { const dlg = ref.current!; const previous = document.activeElement as HTMLElement; dlg.showModal(); return () => { dlg.close(); previous?.focus(); }; }, []);
  return <dialog ref={ref} className="work-dialog" aria-label={`${work.displayTitle} — artwork detail`} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) onClose(); }} onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } }}>
    <div className="detail-top"><span>Selected works</span><button onClick={onClose} aria-label="Close artwork">Close <span aria-hidden="true">×</span></button></div>
    <figure className="detail-art"><WorkImage key={work.id} work={work} detail eager /></figure>
    <div className="detail-info"><div><span className="small-label">{collectionFor(work.collectionId).label}</span><h1>{work.displayTitle}</h1>{work.dimensions && <p>{work.dimensions}</p>}</div><div className="detail-navigation"><span>{String(index + 1).padStart(2, '0')} / {items.length}</span><button onClick={() => step(-1)} aria-label="Previous artwork">←</button><button onClick={() => step(1)} aria-label="Next artwork">→</button></div></div>
    <p className="detail-copyright">© Yi Kai. All rights reserved.</p>
  </dialog>;
}
