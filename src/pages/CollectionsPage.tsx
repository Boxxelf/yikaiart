import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allHoldings, holdings, collectionArchive, collectionFilters, featuredHolding, type Holding } from '../content/holdings';
import CollectionDetail from '../components/CollectionDetail';
import ArchiveImage from '../features/editorial/ArchiveImage';
import '../styles/editorial.css';
export default function CollectionsPage(){
 const [params,setParams]=useSearchParams();const opener=useRef<HTMLElement|null>(null);
 const group=collectionFilters.some(f=>f.id===params.get('type'))?params.get('type')!:'all';
 const items=holdings.filter(h=>group==='all'||h.category===group);
 const detail=allHoldings.find(h=>h.id===params.get('collection'));
 const open=(item:Holding)=>{opener.current=document.activeElement as HTMLElement;const p=new URLSearchParams(params);p.set('collection',item.id);setParams(p,{preventScrollReset:true});};
 const change=(id:string)=>{const p=new URLSearchParams(params);p.set('collection',id);setParams(p,{replace:true,preventScrollReset:true});};
 const close=()=>{const p=new URLSearchParams(params);p.delete('collection');setParams(p,{replace:true,preventScrollReset:true});};
 const filter=(type:string)=>{const p=new URLSearchParams();if(type!=='all')p.set('type',type);setParams(p,{preventScrollReset:true});};
 useEffect(()=>{document.title=`${detail?.title??'Collections'} — Yi Kai`;},[detail]);
 return <main id="main" tabIndex={-1} className="editorial-page collections-page">
  <header className="editorial-heading"><span className="editorial-eyebrow">Works in the world</span><h1>Collections<span>.</span></h1><p>Selected public and private collections.</p></header>
  {params.has('collection')&&!detail&&<p className="editorial-notice" role="status">That collection record could not be found. Explore the works below.</p>}
  <section className="collection-feature" aria-label="Featured collection"><button className="collection-feature-image" onClick={()=>open(featuredHolding)} aria-label={`View featured ${featuredHolding.title}`}><ArchiveImage item={featuredHolding} large eager/></button><div className="collection-feature-copy"><span className="editorial-eyebrow">In the collection of</span><h2>{featuredHolding.collector}</h2><p>{featuredHolding.location}</p><div className="collection-feature-label"><h3>{featuredHolding.title}</h3><p>{featuredHolding.medium}<br/>{featuredHolding.dimensions}</p></div><button className="editorial-text-button" onClick={()=>open(featuredHolding)}>View work <span aria-hidden="true">↗</span></button></div></section>
  <section className="collection-catalogue" aria-labelledby="holdings-title"><div className="editorial-section-heading"><h2 id="holdings-title">Selected collections</h2><span>{items.length} / {holdings.length} records</span></div><nav className="holding-filters" aria-label="Filter collections">{collectionFilters.map(f=><button key={f.id} aria-pressed={group===f.id} onClick={()=>filter(f.id)}>{f.label}<span>{f.id==='all'?holdings.length:holdings.filter(h=>h.category===f.id).length}</span></button>)}</nav>
   <div className="holding-grid">{items.map(item=><button className="holding-card" key={item.id} onClick={()=>open(item)} aria-label={`View ${item.title} — ${item.collector}`}><span className="holding-image"><ArchiveImage item={item}/></span><span className="holding-caption"><span className="holding-owner">{item.collector}</span><span className="holding-place">{item.location}</span><span className="holding-title">{item.title}</span><span className="holding-medium">{item.medium}{item.dimensions?' / '+item.dimensions:''}</span></span></button>)}</div>
  </section>
  <section className="collection-documents" aria-labelledby="documents-title"><div className="editorial-section-heading"><div><span className="editorial-eyebrow">Portraits, publications & exhibition records</span><h2 id="documents-title">From the archive</h2></div><span>{collectionArchive.length} documents</span></div><p className="collection-documents-intro">The printed pages, portraits and records that accompany a life in painting.</p><div className="collection-document-grid">{collectionArchive.map(item=><button className="collection-document" key={item.id} onClick={()=>open(item)} aria-label={`View archive ${item.title}`}><span className="collection-document-image"><ArchiveImage item={item}/></span><span className="editorial-eyebrow">{item.documentType}{item.date?' / '+item.date:''}</span><span className="collection-document-title">{item.title}</span><span className="collection-document-description">{item.description}</span><span className="editorial-text-button">Look closer <span aria-hidden="true">↗</span></span></button>)}</div></section>
  <footer className="editorial-footer"><a href="https://yikaistudio.com/collections/" target="_blank" rel="noreferrer">Collection records from Yi Kai Studio ↗</a><span>© {new Date().getFullYear()} Yi Kai</span></footer>
  {detail&&<CollectionDetail item={detail} items={detail.kind==='archive'?collectionArchive:items.some(h=>h.id===detail.id)?items:holdings} onChange={change} onClose={close} opener={opener}/>}
 </main>;
}
