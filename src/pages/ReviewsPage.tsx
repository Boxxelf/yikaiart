import { useTranslation } from '../i18n/Locale';
import Icon from '../components/Icon';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { firstReview, reviews, reviewLabel } from '../content/reviews';
import ReviewReader from '../components/ReviewReader';
import ReviewArticle from '../features/editorial/ReviewArticle';
import '../styles/editorial.css';
export default function ReviewsPage(){
 const { t, locale } = useTranslation();

 const [params,setParams]=useSearchParams();const requested=params.get('review');
 const review=reviews.find(r=>r.id===requested)??firstReview;const index=reviews.indexOf(review);
 const sheet=useRef<HTMLElement>(null),previous=useRef(review.id);
 const opener=useRef<HTMLElement|null>(null);const reading=params.get('read')==='1';
 const choose=(id:string)=>setParams({review:id,...(reading?{read:'1'}:{})},{preventScrollReset:true});
 const open=()=>{opener.current=document.activeElement as HTMLElement;setParams({review:review.id,read:'1'},{preventScrollReset:true});};
 const close=()=>setParams({review:review.id},{replace:true,preventScrollReset:true});
 useEffect(()=>{if(previous.current===review.id)return;previous.current=review.id;if(!reading)sheet.current?.scrollIntoView({block:'start'});},[review.id,reading]);
 useEffect(()=>{document.title = t(`Reviews${reading?' / '+review.author:''} — Yi Kai`);},[reading,review.author,t]);
 return <main id="main" tabIndex={-1} className="editorial-page reviews-page">
  <header className="editorial-heading"><span className="editorial-eyebrow">{t("Words around the work / 1987 — 2015")}</span><h1>{t("Reviews")}<span>{t(".")}</span></h1><p>{t("Perspectives on a life in painting.")}</p></header>
  {requested&&!reviews.some(r=>r.id===requested)&&<p className="editorial-notice" role="status">{t("That perspective could not be found. Explore the reviews below.")}</p>}
  <div className="reviews-desk">
   <nav className="review-index" aria-label={t("Choose a review")}>{reviews.map((r,i)=><button key={r.id} aria-current={r.id===review.id?'true':undefined} onClick={()=>choose(r.id)}><span>{t(i===0||reviews[i-1].year!==r.year?r.year:'')}</span><span>{t(reviewLabel(r))}</span></button>)}</nav>
   <label className="review-mobile-select">{t("Choose a perspective")}<select value={review.id} onChange={e=>choose(e.target.value)}>{reviews.map(r=><option key={r.id} value={r.id}>{t(r.year)}{t(" — ")}{t(reviewLabel(r))}</option>)}</select></label>
   <div className="review-paper-stack"><article ref={sheet} className="review-sheet newspaper" key={review.id} aria-label={t(`Perspective by ${review.author}`)}>
    <ReviewArticle review={review} onImage={open}/><button className="editorial-text-button" onClick={open}>{t("Read perspective ")}<span aria-hidden="true"><Icon name="diagonal" /></span></button>
   </article><nav className="editorial-pagination" aria-label={t("Turn review pages")}><button aria-label={t("Previous review")} onClick={()=>choose(reviews[(index-1+reviews.length)%reviews.length].id)}><Icon name="left" /></button><span>{t(reviews.length)}{t(" perspectives")}</span><button aria-label={t("Next review")} onClick={()=>choose(reviews[(index+1)%reviews.length].id)}><Icon name="right" /></button></nav></div>
  </div>
  <footer className="editorial-footer"><span>{t("From the archive of Yi Kai")}</span><span>{t("© ")}{t(new Date().getFullYear())}{t(" Yi Kai")}</span></footer>
  {reading&&<ReviewReader review={review} onChange={choose} onClose={close} opener={opener}/>}
 </main>;
}
