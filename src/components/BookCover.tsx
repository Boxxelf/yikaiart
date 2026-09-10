import { useEffect, useState } from 'react';
import type { Chapter } from '../content/about';
import { bookSurface } from '../features/bookshelf/materials';
export default function BookCover({ chapter }: { chapter: Chapter }) {
  const [url, setUrl] = useState('');
  useEffect(() => { let live = true; document.fonts.ready.then(() => { if (live) setUrl(bookSurface(chapter, 'cover').toDataURL('image/webp', .88)); }); return () => { live = false; }; }, [chapter]);
  return url ? <img className="book-cover" src={url} width={840} height={1160} alt={`${chapter.spine}: ${chapter.cover.join(' / ')}`} /> : <div className="book-cover cover-loading" style={{ background: chapter.color, color: chapter.ink }}>{chapter.spine}</div>;
}
