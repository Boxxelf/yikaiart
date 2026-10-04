import { useTranslation } from '../i18n/Locale';
import { useRef, useState } from 'react';
import article from '../content/la-times.json';
import Icon from './Icon';
import ArchiveDialog from '../features/editorial/ArchiveDialog';
import '../styles/editorial.css';
import '../styles/studio-feature.css';
const asset=(path:string)=>`${import.meta.env.BASE_URL}${path}`;
export default function StudioFeature(){
 const { t, locale } = useTranslation();

 const [selected,setSelected]=useState<number|null>(null),[zoom,setZoom]=useState(false);
 const opener=useRef<HTMLElement|null>(null);
 const photo=selected===null?null:article.photos[selected];
 const open=(index:number)=>{opener.current=document.activeElement as HTMLElement;setZoom(false);setSelected(index);};
 const figure=(index:number)=>{const p=article.photos[index];return <figure key={p.id}><button onClick={()=>open(index)} aria-label={t(`Enlarge ${p.caption}`)}><img src={asset(p.path)} width={p.width} height={p.height} alt={t(p.caption)} loading="lazy"/><span className="studio-enlarge" aria-hidden="true"><Icon name="plus"/></span></button><figcaption>{t(p.caption)}<span>{t("Photograph: ")}{t(p.credit)}</span></figcaption></figure>;};
 return <article className="studio-feature" aria-labelledby="studio-feature-title">
  <div className="studio-feature-masthead"><span>{t("Los Angeles Times")}</span><span>{t("At home with Yi Kai / ")}{t(article.date)}</span></div>
  <div className="studio-feature-opening"><div><span className="small-label">{t("Art, architecture & everyday life")}</span><h3 id="studio-feature-title">{t("A home made")}<br/>{t("for art.")}</h3><p>{t("A curving terrace. A pool filled with light. A studio at the heart of it all.")}</p></div><div className="studio-feature-intro"><p>{t("In Monterey Park, Yi Kai and Jian Zheng reimagined their home with architects De Peter Yi and Laura Marie Peterson. Their paintings, daily rituals and conversations between cultures shaped the spaces around them.")}</p><p>{t("Lisa Boone’s Los Angeles Times feature follows the transformation, from the original 1956 house to a home designed around art and the pool they kept.")}</p><p className="studio-feature-credit">{t("Written by ")}{t(article.author)}<br/>{t("Photography by ")}{t(article.photographer)}</p><a className="text-link" href="#studio-full-article" onClick={()=>{const el=document.getElementById('studio-full-article') as HTMLDetailsElement|null;if(el)el.open=true;}}>{t("Read the feature ")}<Icon name="down"/></a></div></div>
  <div className="studio-feature-hero">{t(figure(0))}</div>
  <div className="studio-feature-story"><blockquote>{t("“This house has always been treated not simply as a construction project, but as a continuously evolving piece of art.”")}<cite>{t("Yi Kai, in the Los Angeles Times")}</cite></blockquote><p>{t("A passage through the studio ceiling lets paintings move upstairs. Salvaged wood becomes a red, white and blue staircase. Across the house, architecture makes room for the work and for the life around it.")}</p></div>
  <div className="studio-feature-pair">{t(figure(5))}{t(figure(10))}</div>
  <details id="studio-full-article" className="studio-full-article"><summary><span>{t("The complete feature & photographs")}</span><Icon name="plus"/></summary><header><span className="small-label">{t(article.publication)}{t(" / ")}{t(article.date)}</span><h4>{t(article.title)}</h4><p>{t("By ")}{t(article.author)}{t(" · Photography by ")}{t(article.photographer)}</p><div><a href={asset('documents/la-times-2025.pdf')} target="_blank" rel="noreferrer">{t("Open original PDF ")}<Icon name="diagonal"/></a><a href={article.url} target="_blank" rel="noreferrer">{t("Read at Los Angeles Times ")}<Icon name="diagonal"/></a></div></header>{locale==='zh-Hant'&&<p className="translation-note">以下為繁體中文譯文。原始報導及圖片出處請見原文連結。</p>}<div className="studio-feature-fulltext">{article.paragraphs.map((p,i)=><p key={i}>{t(p)}</p>)}</div><div className="studio-feature-photoarchive">{t(article.photos.map((_,i)=>figure(i)))}</div></details>
  {photo&&selected!==null&&<ArchiveDialog label="Los Angeles Times photographs" className="press-image-reader" onClose={()=>setSelected(null)} opener={opener}><div className="press-image-toolbar"><p>{t(photo.caption)}{t(" — ")}{t(photo.credit)}</p><button aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{t(zoom?'Fit image':'Zoom image')}</button></div><div className={`press-image-viewport ${zoom?'is-zoomed':''}`} tabIndex={0}><img src={asset(photo.path)} alt={t(photo.caption)}/></div><nav className="studio-feature-photo-nav" aria-label={t("Los Angeles Times photograph navigation")}><button aria-label={t("Previous feature photograph")} onClick={()=>{setZoom(false);setSelected((selected+article.photos.length-1)%article.photos.length);}}><Icon name="left"/></button><span>{t(selected+1)}{t(" / ")}{t(article.photos.length)}</span><button aria-label={t("Next feature photograph")} onClick={()=>{setZoom(false);setSelected((selected+1)%article.photos.length);}}><Icon name="right"/></button></nav></ArchiveDialog>}
 </article>;
}
