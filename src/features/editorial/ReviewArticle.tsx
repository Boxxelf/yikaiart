import { useTranslation } from '../../i18n/Locale';
import { useRef, useState } from 'react';
import { type Review, type ReviewScan } from '../../content/reviews';
import images from '../../content/review-images.json';
import press from '../../content/press-archive.json' with { type: 'json' };
import { collectionArchive, collectionAsset, type Holding } from '../../content/holdings';
import ArchiveImage from './ArchiveImage';
import ArchiveDialog from './ArchiveDialog';
import Icon from '../../components/Icon';
export default function ReviewArticle({review}:{review:Review;onImage?:()=>void}){
 const { t, locale } = useTranslation();

 const picture=images.find(i=>i.id===review.id);
 const related=[...collectionArchive,...press as Holding[]].find(h=>h.id===review.relatedArchive);
 const [enlarged,setEnlarged]=useState<ReviewScan|null>(null),[zoom,setZoom]=useState(false);
 const opener=useRef<HTMLElement|null>(null);
 const open=(scan:ReviewScan)=>{opener.current=document.activeElement as HTMLElement;setZoom(false);setEnlarged(scan);};
 return <>
  <div className="newspaper-nameplate"><span>{t("Yi Kai")}</span><span>{t("Reviews and Accolades")}</span></div><div className="newspaper-dateline"><span>{t(review.organization||'The artist’s archive')}</span><span>{t(review.year)}</span></div>
  <div className="review-sheet-author"><h2 tabIndex={-1}>{t(review.title||review.author)}</h2><p lang={locale}>{t(review.title?review.byline+' / ':'')}{t(review.role)}</p></div>
  {review.scans&&<div className={`review-front-scans ${review.scans.length===1?'single-scan':''} scans-${review.scans.length}`} aria-label={t("Original publication photographs")}>{review.scans.map((scan,i)=><figure key={scan.path}><button onClick={()=>open(scan)} aria-label={t(`Enlarge ${scan.caption}`)}><img src={collectionAsset(scan.path)} width={scan.width} height={scan.height} alt={t(scan.alt)} loading={i===0?'eager':'lazy'}/><span aria-hidden="true"><Icon name="plus"/></span></button><figcaption>{t(scan.caption)}</figcaption></figure>)}</div>}
  {!review.scans&&related&&<figure className="review-clipping review-front-clipping"><button onClick={()=>open({path:related.image.display,alt:related.alt,caption:related.title,width:related.image.width,height:related.image.height})} aria-label={t(`Enlarge ${related.title}`)}><ArchiveImage item={related} large/></button><figcaption><strong>{t(related.title)}</strong><p>{t(related.description)}</p></figcaption></figure>}
  {review.intro&&<p className="review-intro">{t(review.intro)}</p>}
  {review.textLabel&&<p className="review-text-label">{t(review.textLabel)}</p>}
  <div className="review-article-layout">
   {picture&&!review.scans&&<figure className="review-portrait"><img src={collectionAsset(picture.path)} alt={t(`Image accompanying the ${review.author} review`)} loading="lazy"/><figcaption>{t("From the review archive")}</figcaption></figure>}
   <div className="review-article-text" lang={locale}>{locale==='zh-Hant'&&<div className="translation-note" role="note">繁體中文譯文；原文可切換英文版或查看原始文獻。</div>}{review.paragraphs.map((p,i)=><p key={i}>{t(p)}</p>)}<footer className="review-signature"><strong>{t(review.byline)}</strong><span>{t(review.role)}</span><span>{t(review.year)}</span></footer></div>
  </div>
  {enlarged&&<ArchiveDialog label={enlarged.caption} className="press-image-reader" onClose={()=>setEnlarged(null)} opener={opener}><div className="press-image-toolbar"><p>{t(enlarged.caption)}</p><button aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{t(zoom?'Fit image':'Zoom image')}</button></div><div className={`press-image-viewport ${zoom?'is-zoomed':''}`} tabIndex={0}><img src={collectionAsset(enlarged.path)} alt={t(enlarged.alt)}/></div></ArchiveDialog>}
 </>;
}
