import { useRef, useState } from 'react';
import { type Review, type ReviewScan } from '../../content/reviews';
import images from '../../content/review-images.json';
import press from '../../content/press-archive.json' with { type: 'json' };
import { collectionArchive, collectionAsset, type Holding } from '../../content/holdings';
import ArchiveImage from './ArchiveImage';
import ArchiveDialog from './ArchiveDialog';
import Icon from '../../components/Icon';
export default function ReviewArticle({review}:{review:Review;onImage?:()=>void}){
 const picture=images.find(i=>i.id===review.id);
 const related=[...collectionArchive,...press as Holding[]].find(h=>h.id===review.relatedArchive);
 const [enlarged,setEnlarged]=useState<ReviewScan|null>(null),[zoom,setZoom]=useState(false);
 const opener=useRef<HTMLElement|null>(null);
 const open=(scan:ReviewScan)=>{opener.current=document.activeElement as HTMLElement;setZoom(false);setEnlarged(scan);};
 return <>
  <div className="newspaper-nameplate"><span>Yi Kai</span><span>Reviews and Accolades</span></div><div className="newspaper-dateline"><span>{review.organization||'The artist’s archive'}</span><span>{review.year}</span></div>
  <div className="review-sheet-author"><h2 tabIndex={-1}>{review.title||review.author}</h2><p lang={review.language}>{review.title?review.byline+' / ':''}{review.role}</p></div>
  {review.scans&&<div className={`review-front-scans ${review.scans.length===1?'single-scan':''} scans-${review.scans.length}`} aria-label="Original publication photographs">{review.scans.map((scan,i)=><figure key={scan.path}><button onClick={()=>open(scan)} aria-label={`Enlarge ${scan.caption}`}><img src={collectionAsset(scan.path)} width={scan.width} height={scan.height} alt={scan.alt} loading={i===0?'eager':'lazy'}/><span aria-hidden="true"><Icon name="plus"/></span></button><figcaption>{scan.caption}</figcaption></figure>)}</div>}
  {!review.scans&&related&&<figure className="review-clipping review-front-clipping"><button onClick={()=>open({path:related.image.display,alt:related.alt,caption:related.title,width:related.image.width,height:related.image.height})} aria-label={`Enlarge ${related.title}`}><ArchiveImage item={related} large/></button><figcaption><strong>{related.title}</strong><p>{related.description}</p></figcaption></figure>}
  {review.intro&&<p className="review-intro">{review.intro}</p>}
  {review.textLabel&&<p className="review-text-label">{review.textLabel}</p>}
  <div className="review-article-layout">
   {picture&&!review.scans&&<figure className="review-portrait"><img src={collectionAsset(picture.path)} alt={`Image accompanying the ${review.author} review`} loading="lazy"/><figcaption>From the review archive</figcaption></figure>}
   <div className="review-article-text" lang={review.language}>{review.paragraphs.map((p,i)=><p key={i}>{p}</p>)}<footer className="review-signature"><strong>{review.byline}</strong><span>{review.role}</span><span>{review.year}</span></footer></div>
  </div>
  {enlarged&&<ArchiveDialog label={enlarged.caption} className="press-image-reader" onClose={()=>setEnlarged(null)} opener={opener}><div className="press-image-toolbar"><p>{enlarged.caption}</p><button aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?'Fit image':'Zoom image'}</button></div><div className={`press-image-viewport ${zoom?'is-zoomed':''}`} tabIndex={0}><img src={collectionAsset(enlarged.path)} alt={enlarged.alt}/></div></ArchiveDialog>}
 </>;
}
