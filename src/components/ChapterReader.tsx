import { useEffect, useRef, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { chapters, biography, type Chapter } from '../content/about';
import { collections } from '../content/collections';
import { asset } from '../content/works';
import BookCover from './BookCover';
export default function ChapterReader({ chapter, full = false, onChange, onClose, returnFocus }: { chapter: Chapter; full?: boolean; onChange: (id: string) => void; onClose: () => void; returnFocus: RefObject<HTMLButtonElement | null> }) {
  const dialog = useRef<HTMLDialogElement>(null), text = useRef<HTMLDivElement>(null);
  const index = chapters.findIndex(c => c.id === chapter.id);
  useEffect(() => { const d = dialog.current!; const previous = document.activeElement as HTMLElement; d.showModal(); return () => { d.close(); const target = returnFocus.current?.isConnected ? returnFocus.current : previous; target?.focus(); }; }, []);
  useEffect(() => { text.current?.scrollTo(0, 0); }, [chapter.id, full]);
  const step = (delta: number) => onChange(chapters[(index + delta + 7) % 7].id);
  return <dialog ref={dialog} className="chapter-dialog" aria-label={full ? 'About Yi Kai — full biography' : `${chapter.spine} — ${chapter.title}`} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === dialog.current) onClose(); }} onKeyDown={e => { if (!full && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); } }}>
    <button className="reader-close" onClick={onClose}>Return to shelf <span aria-hidden="true">×</span></button>
    <aside className="reader-cover"><BookCover chapter={chapter} /><span>{chapter.number} / 07</span></aside>
    <div className="reader-text" ref={text}><div className="reader-content">
      <p className="small-label">{full ? 'Chinese-American contemporary artist' : `${chapter.spine} / ${chapter.subtitle}`}</p>
      <h1>{full ? 'About Yi Kai' : chapter.title}</h1>
      {!full && <p className="chapter-excerpt">{chapter.excerpt}</p>}
      {!full && chapter.id !== 'index' && <ul className="chapter-notes">{chapter.notes.map(n => <li key={n}>{n}</li>)}</ul>}
      {(full || chapter.id === 'crossing') && <figure className="biography-photo"><img src={asset('photos/IMG_7587.webp')} width={1600} height={1143} alt="Yi Kai, at left, with two companions in a photograph from his personal archive." /><figcaption>Yi Kai, at left. From the artist’s archive.</figcaption></figure>}
      {chapter.id === 'index' && !full ? <nav className="reader-index" aria-label="Work collections">{collections.map(c => <Link key={c.id} to={`/works?series=${c.id}`} onClick={onClose}><span>{c.label}</span><span>{c.count} works <span aria-hidden="true">↗</span></span></Link>)}</nav> : (full ? biography.slice(2) : chapter.paragraphs.map(i => biography[i])).filter(Boolean).map((paragraph, i) => <p className="biography-paragraph" key={`${chapter.id}-${i}`}>{paragraph}</p>)}
      {!full && chapter.id === 'hand' && <figure className="biography-photo"><img src={asset('photos/IMG_7581.webp')} width={1600} height={1102} alt="Yi Kai, at right, in a photograph from his personal archive." loading="lazy" /><figcaption>Yi Kai, at right. From the artist’s archive.</figcaption></figure>}
      {!full && <nav className="reader-pagination" aria-label="Chapter navigation"><button onClick={() => step(-1)}>← Previous chapter</button><button onClick={() => step(1)}>Next chapter →</button></nav>}
      <p className="reader-colophon">From “About Yi Kai,” provided by the artist.</p>
    </div></div>
  </dialog>;
}
