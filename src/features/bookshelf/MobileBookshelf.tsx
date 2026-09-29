import { useRef, useState } from 'react';
import { chapters } from '../../content/about';
import BookCover from '../../components/BookCover';
import Icon from '../../components/Icon';

type Props = { onRead: (id: string, button: HTMLButtonElement) => void; reduced: boolean };
export default function MobileBookshelf({ onRead, reduced }: Props) {
  const shelf = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const move = (index: number) => {
    const host = shelf.current!;
    const book = host.children[index] as HTMLElement;
    host.scrollTo({ left: book.offsetLeft - host.offsetLeft - (host.clientWidth - book.clientWidth) / 2, behavior: reduced ? 'instant' : 'smooth' });
  };
  const update = () => {
    const host = shelf.current!;
    const center = host.getBoundingClientRect().left + host.clientWidth / 2;
    let nearest = 0, distance = Infinity;
    Array.from(host.children).forEach((child, i) => { const box = child.getBoundingClientRect(); const d = Math.abs(box.left + box.width / 2 - center); if (d < distance) { distance = d; nearest = i; } });
    setActive(nearest);
  };
  return <div className="mobile-bookshelf">
    <div className="mobile-shelf-heading"><span>THE PERSONAL LIBRARY</span><span>Swipe to browse</span></div>
    <div className="book-catalogue mobile-book-track" ref={shelf} onScroll={update} role="region" aria-label="Browse the seven chapters">
      {chapters.map(c => <button className="book-catalogue-item" key={c.id} onClick={e => onRead(c.id, e.currentTarget)} aria-label={`Open ${c.spine}: ${c.title}`}>
        <div className="mobile-book-object"><BookCover chapter={c} /></div>
        <span className="mobile-book-copy"><span>{c.number} / {c.subtitle}</span><strong>{c.title}</strong><span className="mobile-book-excerpt">{c.excerpt}</span><span className="mobile-book-read">Read chapter <Icon name="diagonal" /></span></span>
      </button>)}
    </div>
    <nav className="mobile-shelf-navigation" aria-label="Bookshelf navigation"><button onClick={() => move(active - 1)} disabled={active === 0} aria-label="Previous book"><Icon name="left" /></button><span aria-live="polite">{String(active + 1).padStart(2, '0')} <span>/ 07</span></span><button onClick={() => move(active + 1)} disabled={active === chapters.length - 1} aria-label="Next book"><Icon name="right" /></button></nav>
  </div>;
}
