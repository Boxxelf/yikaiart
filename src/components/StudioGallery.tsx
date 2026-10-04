import { useEffect, useRef, useState } from 'react';
import { studioAsset, studioPhotographs } from '../content/studio';
import Icon from './Icon';
import StudioFeature from './StudioFeature';
import '../styles/studio-gallery.css';

function StudioReader({ index, onChange, onClose }: { index: number; onChange: (index: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const photo = studioPhotographs[index];
  const step = (delta: number) => onChange((index + delta + studioPhotographs.length) % studioPhotographs.length);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className="studio-reader" aria-label="Studio photographs" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) onClose(); }} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); } }}>
    <div className="studio-reader-top"><span>In the studio</span><button onClick={onClose} aria-label="Close studio photographs">Close <Icon name="close" /></button></div>
    <figure><img key={photo.id} src={studioAsset(photo.id, 2400)} width={photo.width} height={photo.height} alt={photo.alt} /><figcaption aria-live="polite">{photo.caption}</figcaption></figure>
    <nav aria-label="Studio photograph navigation"><span>{String(index + 1).padStart(2, '0')} / 04</span><button onClick={() => step(-1)} aria-label="Previous studio photograph"><Icon name="left" /></button><button onClick={() => step(1)} aria-label="Next studio photograph"><Icon name="right" /></button></nav>
  </dialog>;
}

export default function StudioGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  return <section className="studio-gallery" id="studio" aria-labelledby="studio-title">
    <header className="studio-heading"><div><span className="small-label">The artist & his surroundings</span><h2 id="studio-title">In the studio.</h2></div><p>Art and everyday life.<br />A home, a studio, an evolving work.</p></header>
    <StudioFeature /><h3 className="studio-archive-label">Among the paintings</h3><div className="studio-photographs">{studioPhotographs.map((photo, index) => <figure className={`studio-photograph studio-photograph-${index + 1}`} key={photo.id}>
      <button onClick={() => setSelected(index)} aria-label={`Enlarge studio photograph ${index + 1}: ${photo.caption}`}><img src={studioAsset(photo.id)} srcSet={`${studioAsset(photo.id, 800)} 800w, ${studioAsset(photo.id)} 1600w, ${studioAsset(photo.id, 2400)} 2400w`} sizes={index === 0 ? '(max-width: 767px) calc(100vw - 48px), 75vw' : '(max-width: 767px) calc(100vw - 48px), 50vw'} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" decoding="async" /><span className="studio-enlarge" aria-hidden="true"><Icon name="plus" /></span></button>
      <figcaption><span>{String(index + 1).padStart(2, '0')}</span>{photo.caption}</figcaption>
    </figure>)}</div>
    {selected !== null && <StudioReader index={selected} onChange={setSelected} onClose={() => setSelected(null)} />}
  </section>;
}
