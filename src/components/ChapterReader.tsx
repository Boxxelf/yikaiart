import LanguageSwitch from './LanguageSwitch';
import { useTranslation } from '../i18n/Locale';
import Icon from './Icon';
import { useEffect, useRef, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { chapters, biography, type Chapter } from '../content/about';
import { collections } from '../content/collections';
import { asset } from '../content/works';
import BookCover from './BookCover';
export default function ChapterReader({ chapter, full = false, onChange, onClose, returnFocus }: { chapter: Chapter; full?: boolean; onChange: (id: string) => void; onClose: () => void; returnFocus: RefObject<HTMLButtonElement | null> }) {
 const { t } = useTranslation();

  const dialog = useRef<HTMLDialogElement>(null), text = useRef<HTMLDivElement>(null);
  const index = chapters.findIndex(c => c.id === chapter.id);
  useEffect(() => { const d = dialog.current!; const previous = document.activeElement as HTMLElement; d.showModal(); return () => { d.close(); const target = returnFocus.current?.isConnected ? returnFocus.current : previous; target?.focus(); }; }, []);
  useEffect(() => { text.current?.scrollTo(0, 0); }, [chapter.id, full]);
  const step = (delta: number) => onChange(chapters[(index + delta + 7) % 7].id);
  return <dialog ref={dialog} className="chapter-dialog" aria-label={t(full ? 'About Yi Kai — full biography' : `${chapter.spine} — ${chapter.title}`)} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === dialog.current) onClose(); }} onKeyDown={e => { if (!full && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); } }}>
    <LanguageSwitch/><button className="reader-close" onClick={onClose}>{t("Return to shelf ")}<span aria-hidden="true"><Icon name="close" /></span></button>
    <aside className="reader-cover"><BookCover chapter={chapter} /><span>{t(chapter.number)}{t(" / 07")}</span></aside>
    <div className="reader-text" ref={text}><div className="reader-content">
      <p className="small-label">{t(full ? 'Chinese-American contemporary artist' : `${chapter.spine} / ${chapter.subtitle}`)}</p>
      <h1>{t(full ? 'About Yi Kai' : chapter.title)}</h1>
      {!full && <p className="chapter-excerpt">{t(chapter.excerpt)}</p>}
      {!full && chapter.id !== 'index' && <ul className="chapter-notes">{chapter.notes.map(n => <li key={n}>{t(n)}</li>)}</ul>}
      {(full || chapter.id === 'crossing') && <figure className="biography-photo"><img src={asset('photos/IMG_7587.webp')} width={1600} height={1143} alt={t("Yi Kai with Ping Hsin-tao and Chiung Yao while preparing his 1988 solo exhibition at the Crown Art Center, Taipei.")} /><figcaption>{t("With Ping Hsin-tao and Chiung Yao while preparing his 1988 solo exhibition at the Crown Art Center, Taipei.")}</figcaption></figure>}
      {chapter.id === 'index' && !full ? <nav className="reader-index" aria-label={t("Work collections")}>{collections.map(c => <Link key={c.id} to={`/works?series=${c.id}`} onClick={onClose}><span>{t(c.label)}</span><span>{t(c.count)}{t(" works ")}<span aria-hidden="true"><Icon name="diagonal" /></span></span></Link>)}</nav> : (full ? biography.slice(2) : chapter.paragraphs.map(i => biography[i])).filter(Boolean).map((paragraph, i) => <p className="biography-paragraph" key={`${chapter.id}-${i}`}>{t(paragraph)}</p>)}
      {(full || chapter.id === 'hand') && <figure className="biography-photo"><img src={asset('photos/IMG_7581.webp')} width={1600} height={1102} alt={t("Yi Kai meeting with Chinese master painter Liu Haisu, 1984.")} loading="lazy" /><figcaption>{t("Meeting with Chinese master painter Liu Haisu, 1984.")}</figcaption></figure>}
      {!full && <nav className="reader-pagination" aria-label={t("Chapter navigation")}><button onClick={() => step(-1)}><Icon name="left" />{t(" Previous chapter")}</button><button onClick={() => step(1)}>{t("Next chapter ")}<Icon name="right" /></button></nav>}
      <p className="reader-colophon">{t("From “About Yi Kai,” provided by the artist.")}</p>
    </div></div>
  </dialog>;
}
