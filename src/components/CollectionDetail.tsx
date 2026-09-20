import { useEffect, useState, type RefObject } from 'react';
import type { Holding } from '../content/holdings';
import ArchiveDialog from '../features/editorial/ArchiveDialog';
import ArchiveImage from '../features/editorial/ArchiveImage';
export default function CollectionDetail({item,items,onChange,onClose,opener}:{item:Holding;items:Holding[];onChange:(id:string)=>void;onClose:()=>void;opener:RefObject<HTMLElement|null>}){
 const [zoomed,setZoomed]=useState(false);const index=items.findIndex(h=>h.id===item.id);
 useEffect(()=>setZoomed(false),[item.id]);
 const move=(d:number)=>onChange(items[(index+d+items.length)%items.length].id);
 return <ArchiveDialog label={`View ${item.title}`} className="collection-reader" onClose={onClose} opener={opener}>
  <div className="collection-reader-layout">
   <div className="collection-reader-art"><div className={`collection-image-viewport ${zoomed?'is-zoomed':''}`} tabIndex={zoomed?0:undefined} aria-label={zoomed?'Enlarged image; scroll to explore':undefined}><ArchiveImage item={item} large eager/></div><button className="collection-zoom" aria-pressed={zoomed} onClick={()=>setZoomed(v=>!v)}>{zoomed?'Fit image':'Zoom image'} <span aria-hidden="true">{zoomed?'−':'+'}</span></button></div>
   <div className="collection-reader-copy"><span className="editorial-eyebrow">{item.kind==='archive'?`${item.documentType}${item.date?' / '+item.date:''}`:'Selected collection'}</span><h1>{item.title}</h1>
    {item.collector&&<div className="collection-owner"><span>In the collection of</span><h2>{item.collector}</h2><p>{item.location}</p></div>}
    {(item.medium||item.dimensions)&&<p className="collection-medium">{item.medium}{item.dimensions&&<><br/>{item.dimensions}</>}</p>}
    {item.description&&<p className="collection-description">{item.description}</p>}
    <p className="editorial-provenance">{item.kind==='archive'?'From the artist’s archive':'Collection record / Yi Kai'}{item.kind==='archive'&&<><br/>English description based on the pictured document.</>}</p>
    <nav className="editorial-pagination" aria-label="Browse collection details"><button aria-label="Previous collection item" disabled={items.length<2} onClick={()=>move(-1)}>←</button><span>{String(index+1).padStart(2,'0')} / {String(items.length).padStart(2,'0')}</span><button aria-label="Next collection item" disabled={items.length<2} onClick={()=>move(1)}>→</button></nav>
   </div>
  </div>
 </ArchiveDialog>;
}
