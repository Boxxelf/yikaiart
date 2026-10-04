import { useTranslation } from '../i18n/Locale';
import Icon from './Icon';
import { useEffect, useState, type RefObject } from 'react';
import { collectionAsset, type Holding } from '../content/holdings';
import ArchiveDialog from '../features/editorial/ArchiveDialog';
import ArchiveImage from '../features/editorial/ArchiveImage';
export default function CollectionDetail({item,items,onChange,onClose,opener}:{item:Holding;items:Holding[];onChange:(id:string)=>void;onClose:()=>void;opener:RefObject<HTMLElement|null>}){
 const { t } = useTranslation();

 const [zoomed,setZoomed]=useState(false);const [companion,setCompanion]=useState(false);const index=items.findIndex(h=>h.id===item.id);
 useEffect(()=>{setZoomed(false);setCompanion(false);},[item.id]);
 const move=(d:number)=>onChange(items[(index+d+items.length)%items.length].id);
 return <ArchiveDialog label={`View ${item.title}`} className="collection-reader" onClose={onClose} opener={opener}>
  <div className="collection-reader-layout">
   <div className="collection-reader-art"><div className={`collection-image-viewport ${zoomed?'is-zoomed':''}`} tabIndex={zoomed?0:undefined} aria-label={t(zoomed?'Enlarged image; scroll to explore':undefined)}>{companion&&item.companion?<img src={collectionAsset(item.companion.image.display)} alt={t(item.companion.alt)}/>:<ArchiveImage item={item} large eager/>}</div>{item.companion&&<div className="collection-pair-switch" aria-label={t("Artwork and certificate")}><button aria-pressed={!companion} onClick={()=>{setCompanion(false);setZoomed(false);}}>{t("Exhibition certificate")}</button><button aria-pressed={companion} onClick={()=>{setCompanion(true);setZoomed(false);}}>{t(item.companion.title)}</button></div>}<button className="collection-zoom" aria-pressed={zoomed} onClick={()=>setZoomed(v=>!v)}>{t(zoomed?'Fit image':'Zoom image')} <span aria-hidden="true">{t(zoomed?'−':'+')}</span></button></div>
   <div className="collection-reader-copy"><span className="editorial-eyebrow">{t(item.kind==='archive'?`${item.documentType}${item.date?' / '+item.date:''}`:'Selected collection')}</span><h1>{t(item.title)}</h1>
    {item.collector&&<div className="collection-owner"><span>{t("In the collection of")}</span><h2>{t(item.collector)}</h2><p>{t(item.location)}</p></div>}
    {(item.medium||item.dimensions)&&<p className="collection-medium">{t(item.medium)}{item.dimensions&&<><br/>{t(item.dimensions)}</>}</p>}
    {item.description&&<p className="collection-description">{t(item.description)}</p>}
    <p className="editorial-provenance">{t(item.kind==='archive'?'From the artist’s archive':'Collection record / Yi Kai')}{item.kind==='archive'&&<><br/>{t("English description based on the pictured document.")}</>}</p>
    <nav className="editorial-pagination" aria-label={t("Browse collection details")}><button aria-label={t("Previous collection item")} disabled={items.length<2} onClick={()=>move(-1)}><Icon name="left" /></button><span>{t(String(index+1).padStart(2,'0'))}{t(" / ")}{t(String(items.length).padStart(2,'0'))}</span><button aria-label={t("Next collection item")} disabled={items.length<2} onClick={()=>move(1)}><Icon name="right" /></button></nav>
   </div>
  </div>
 </ArchiveDialog>;
}
