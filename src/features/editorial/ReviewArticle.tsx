import { type Review } from '../../content/reviews';
import images from '../../content/review-images.json';
import { collectionArchive, collectionAsset } from '../../content/holdings';
import ArchiveImage from './ArchiveImage';
export default function ReviewArticle({review,onImage}:{review:Review;onImage?:()=>void}){
 const picture=images.find(i=>i.id===review.id);const related=collectionArchive.find(h=>h.id===review.relatedArchive);
 return <>
  <div className="newspaper-nameplate"><span>Yi Kai</span><span>Reviews and Accolades</span></div><div className="newspaper-dateline"><span>The artist’s archive</span><span>{review.year}</span></div>
  <div className="review-sheet-author"><h2 tabIndex={-1}>{review.author}</h2><p lang={review.language}>{review.role}</p></div>
  <div className="review-article-layout">
   {picture&&<figure className="review-portrait"><img src={collectionAsset(picture.path)} alt={`Image accompanying the ${review.author} review`} loading="lazy"/><figcaption>From the review archive</figcaption></figure>}
   <div className="review-article-text" lang={review.language}>{review.paragraphs.map((p,i)=><p key={i}>{p}</p>)}<footer className="review-signature"><strong>{review.byline}</strong><span>{review.role}</span><span>{review.year}</span></footer></div>
  </div>
  {related&&<figure className="review-clipping">{onImage?<button onClick={onImage} aria-label={`Enlarge ${related.title}`}><ArchiveImage item={related} large/></button>:<ArchiveImage item={related} large/>}<figcaption><strong>{related.title}</strong><p>{related.description}</p></figcaption></figure>}
 </>;
}
