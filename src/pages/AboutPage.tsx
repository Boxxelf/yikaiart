import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chapters } from '../content/about';
import { useMedia } from '../hooks';
import BookCover from '../components/BookCover';
import ChapterReader from '../components/ChapterReader';
import ArtistProfile from '../components/ArtistProfile';
import '../styles/about-profile.css';
import type { ShelfControl } from '../features/bookshelf/BookshelfScene';
const BookshelfScene = lazy(() => import('../features/bookshelf/BookshelfScene'));
export default function AboutPage() {
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const controls = useRef<ShelfControl | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const reduce = useMedia('(prefers-reduced-motion: reduce)');
  const small = useMedia('(max-width: 767px)');
  const staticMode = small || reduce || failed;
  const chapter = chapters.find(c => c.id === params.get('chapter'));
  const full = params.get('read') === 'biography';
  const current = chapters.find(c => c.id === (selected || hovered));
  const close = () => { setParams({}, { replace: true, preventScrollReset: true }); controls.current?.reset(); setSelected(null); };
  const read = (id: string) => setParams({ chapter: id }, { preventScrollReset: true });
  useEffect(() => { document.title = 'About — Yi Kai'; document.fonts.ready.then(() => setFontsReady(true)); }, []);
  useEffect(() => { const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && !chapter && !full) { controls.current?.reset(); setSelected(null); } }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, [chapter, full]);
  return <main id="main" tabIndex={-1} className={`about-page ${staticMode ? 'about-static' : ''}`}>
    <section className="about-bookshelf" aria-label="The artist’s bookshelf"><div className="about-heading"><div><span className="small-label">About the artist</span><h1>A life in painting.</h1></div><div className="about-heading-links"><p>Seven chapters.<br />A practice still unfolding.</p><a href="#artist-profile">Artist statement & career ↓</a></div></div>
    {staticMode ? <div className="book-catalogue">{chapters.map(c => <button className="book-catalogue-item" key={c.id} onClick={e => { returnFocus.current = e.currentTarget; read(c.id); }} aria-label={`Open ${c.spine}: ${c.title}`}><BookCover chapter={c} /><span><span>{c.number} — {c.spine}</span><span>{c.subtitle}</span></span></button>)}</div> : <div className="shelf-viewport"><div className="shelf-stage">{fontsReady && <Suspense fallback={<span className="sr-only">Preparing the bookshelf…</span>}><BookshelfScene onSelect={id => { setSelected(id); if (id) returnFocus.current = document.querySelector<HTMLButtonElement>(`[data-chapter="${id}"]`); }} onOpen={read} onHover={setHovered} onFailure={() => setFailed(true)} controls={controls} paused={!!chapter || full} /></Suspense>}<div className="shelf-baseline" aria-hidden="true" /></div></div>}
    {!staticMode && <nav className="chapter-strip" aria-label="Choose a chapter">{chapters.map(c => <button key={c.id} data-chapter={c.id} className={selected === c.id ? 'active' : ''} aria-label={`Select ${c.spine}: ${c.title}`} aria-pressed={selected === c.id} onFocus={() => setHovered(c.id)} onClick={e => { returnFocus.current = e.currentTarget; controls.current?.select(c.id); }}><span>{c.number}</span>{c.spine}</button>)}</nav>}
    <footer className="about-footer"><button className="text-link" onClick={e => { returnFocus.current = e.currentTarget; setParams({ read: 'biography' }); }}>Read full biography <span aria-hidden="true">↗</span></button><span className="shelf-hint">{selected ? current?.title : hovered ? current?.title : staticMode ? 'Choose a chapter to read' : 'Choose a book. Take a closer look.'}</span>{selected && !staticMode ? <div className="shelf-actions"><button onClick={() => { controls.current?.reset(); setSelected(null); }}>Return</button><button onClick={() => controls.current?.open()}>Open chapter ↗</button></div> : <span className="about-edition">Yi Kai / Personal archive</span>}</footer>
    </section><ArtistProfile />
    {(chapter || full) && <ChapterReader chapter={chapter || chapters[0]} full={full} onChange={read} onClose={close} returnFocus={returnFocus} />}
  </main>;
}
