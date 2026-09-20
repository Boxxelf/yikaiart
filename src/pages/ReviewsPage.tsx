import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { firstReview, reviews } from '../content/reviews';
import ReviewReader from '../components/ReviewReader';
import '../styles/editorial.css';
export default function ReviewsPage(){
 const [params,setParams]=useSearchParams();const requested=params.get('review');
 const review=reviews.find(r=>r.id===requested)??firstReview;const index=reviews.indexOf(review);
 const opener=useRef<HTMLElement|null>(null);const reading=params.get('read')==='1';
 const choose=(id:string)=>setParams({review:id,...(reading?{read:'1'}:{})},{preventScrollReset:true});
 const open=()=>{opener.current=document.activeElement as HTMLElement;setParams({review:review.id,read:'1'},{preventScrollReset:true});};
 const close=()=>setParams({review:review.id},{replace:true,preventScrollReset:true});
 useEffect(()=>{document.title=`Reviews${reading?' / '+review.author:''} — Yi Kai`;},[reading,review.author]);
 return <main id="main" tabIndex={-1} className="editorial-page reviews-page">
  <header className="editorial-heading"><span className="editorial-eyebrow">Words around the work / 1987 — 2015</span><h1>Reviews<span>.</span></h1><p>Perspectives on a life in painting.</p></header>
  {requested&&!reviews.some(r=>r.id===requested)&&<p className="editorial-notice" role="status">That perspective could not be found. Explore the reviews below.</p>}
  <div className="reviews-desk">
   <nav className="review-index" aria-label="Choose a review">{reviews.map((r,i)=><button key={r.id} aria-current={r.id===review.id?'true':undefined} onClick={()=>choose(r.id)}><span>{i===0||reviews[i-1].year!==r.year?r.year:''}</span><span>{r.author}</span></button>)}</nav>
   <label className="review-mobile-select">Choose a perspective<select value={review.id} onChange={e=>choose(e.target.value)}>{reviews.map(r=><option key={r.id} value={r.id}>{r.year} — {r.author}</option>)}</select></label>
   <div className="review-paper-stack"><article className="review-sheet" key={review.id} aria-label={`Perspective by ${review.author}`}>
    <div className="review-sheet-top"><span>{review.year}</span><span>{String(index+1).padStart(2,'0')} / {reviews.length}</span></div>
    <div className="review-sheet-body">{review.quote?<><span className="editorial-eyebrow">From the review</span><blockquote>“{review.quote}”</blockquote></>:<><span className="editorial-eyebrow">{review.translated?'Translated summary':'Editorial summary'}</span><p className="review-statement">{review.summary}</p></>}</div>
    <div className="review-sheet-author"><h2>{review.author}</h2><p>{review.role}</p></div><button className="editorial-text-button" onClick={open}>Read perspective <span aria-hidden="true">↗</span></button>
   </article><nav className="editorial-pagination" aria-label="Turn review pages"><button aria-label="Previous review" onClick={()=>choose(reviews[(index-1+reviews.length)%reviews.length].id)}>←</button><span>Thirteen perspectives</span><button aria-label="Next review" onClick={()=>choose(reviews[(index+1)%reviews.length].id)}>→</button></nav></div>
  </div>
  <footer className="editorial-footer"><span>From the archive of Yi Kai</span><span>© {new Date().getFullYear()} Yi Kai</span></footer>
  {reading&&<ReviewReader review={review} onChange={choose} onClose={close} opener={opener}/>}
 </main>;
}
