import { Link } from 'react-router-dom';
import type { RefObject } from 'react';
import { reviews, reviewSource, type Review } from '../content/reviews';
import { collectionArchive } from '../content/holdings';
import ArchiveImage from '../features/editorial/ArchiveImage';
import ArchiveDialog from '../features/editorial/ArchiveDialog';
export default function ReviewReader({review,onChange,onClose,opener}:{review:Review;onChange:(id:string)=>void;onClose:()=>void;opener:RefObject<HTMLElement|null>}){
 const index=reviews.findIndex(r=>r.id===review.id);const related=collectionArchive.find(h=>h.id===review.relatedArchive);
 return <ArchiveDialog label={`Read ${review.author}`} className="review-reader" onClose={onClose} opener={opener}>
  <article className="review-reader-paper"><span className="editorial-eyebrow">Perspective / {review.year}</span><h1>{review.author}</h1><p className="review-reader-role">{review.role}</p>
   {review.quote&&<blockquote>“{review.quote}”</blockquote>}
   <div className="review-reader-summary"><span className="editorial-eyebrow">{review.translated?'Translated summary':'Editorial summary'}</span><p>{review.summary}</p></div>
   <a className="editorial-source" href={reviewSource} target="_blank" rel="noreferrer">Read the original perspective ↗</a>
   {related&&<Link className="review-related" to={`/collections?collection=${related.id}`}><ArchiveImage item={related}/><span>From the archive<strong>{related.title}</strong><span>View document ↗</span></span></Link>}
   <nav className="editorial-pagination" aria-label="Browse reviews"><button aria-label="Previous review in reader" onClick={()=>onChange(reviews[(index-1+reviews.length)%reviews.length].id)}>←</button><span>{String(index+1).padStart(2,'0')} / {reviews.length}</span><button aria-label="Next review in reader" onClick={()=>onChange(reviews[(index+1)%reviews.length].id)}>→</button></nav>
  </article>
 </ArchiveDialog>;
}
