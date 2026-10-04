import { useTranslation } from '../i18n/Locale';
import Icon from './Icon';
import { useEffect, useRef, type RefObject } from 'react';
import { reviews, type Review } from '../content/reviews';
import ArchiveDialog from '../features/editorial/ArchiveDialog';
import ReviewArticle from '../features/editorial/ReviewArticle';
export default function ReviewReader({review,onChange,onClose,opener}:{review:Review;onChange:(id:string)=>void;onClose:()=>void;opener:RefObject<HTMLElement|null>}){
 const { t } = useTranslation();

 const article=useRef<HTMLElement>(null),previous=useRef(review.id);
 useEffect(()=>{if(previous.current===review.id)return;previous.current=review.id;article.current?.closest('dialog')?.scrollTo(0,0);article.current?.querySelector<HTMLElement>('.review-sheet-author h2')?.focus({preventScroll:true});},[review.id]);
 const index=reviews.findIndex(r=>r.id===review.id);
 return <ArchiveDialog label={`Read ${review.author}`} className="review-reader" onClose={onClose} opener={opener}><article ref={article} className="review-reader-paper newspaper"><ReviewArticle review={review}/><nav className="editorial-pagination" aria-label={t("Browse reviews")}><button aria-label={t("Previous review in reader")} onClick={()=>onChange(reviews[(index-1+reviews.length)%reviews.length].id)}><Icon name="left" /></button><span>{t(String(index+1).padStart(2,'0'))}{t(" / ")}{t(reviews.length)}</span><button aria-label={t("Next review in reader")} onClick={()=>onChange(reviews[(index+1)%reviews.length].id)}><Icon name="right" /></button></nav></article></ArchiveDialog>;
}
