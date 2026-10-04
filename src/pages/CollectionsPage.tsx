import { useTranslation } from '../i18n/Locale';
import Icon from '../components/Icon';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import pressArchive from '../content/press-archive.json' with { type: 'json' };
import { allHoldings, holdings, collectionArchive, collectionFilters, featuredHolding, type Holding, collectionAsset } from '../content/holdings';
import CollectionDetail from '../components/CollectionDetail';
import ArchiveImage from '../features/editorial/ArchiveImage';
import '../styles/editorial.css';
export default function CollectionsPage(){
 const { t, locale } = useTranslation();

 const [params,setParams]=useSearchParams();const [archiveSelected,setArchiveSelected]=useState(collectionArchive.find(item=>item.id==='archive-shepherd-girl-certificate')!);const opener=useRef<HTMLElement|null>(null);
 const group=collectionFilters.some(f=>f.id===params.get('type'))?params.get('type')!:'all';
 const items=holdings.filter(h=>group==='all'||h.category===group);
 const detail=allHoldings.find(h=>h.id===params.get('collection'));
 const open=(item:Holding)=>{opener.current=document.activeElement as HTMLElement;const p=new URLSearchParams(params);p.set('collection',item.id);setParams(p,{preventScrollReset:true});};
 const change=(id:string)=>{const p=new URLSearchParams(params);p.set('collection',id);setParams(p,{replace:true,preventScrollReset:true});};
 const close=()=>{const p=new URLSearchParams(params);p.delete('collection');setParams(p,{replace:true,preventScrollReset:true});};
 const filter=(type:string)=>{const p=new URLSearchParams();if(type!=='all')p.set('type',type);setParams(p,{preventScrollReset:true});};
 useEffect(()=>{document.title = t(`${detail?.title??'Collections'} — Yi Kai`);},[detail,t]);
 if(pressArchive.some(item=>item.id===params.get('collection')))return <Navigate replace to={`/reviews?review=${params.get('collection')}&read=1`}/>;
 return <main id="main" tabIndex={-1} className="editorial-page collections-page">
  <header className="editorial-heading"><span className="editorial-eyebrow">{t("Works in the world")}</span><h1>{t("Collections")}<span>{t(".")}</span></h1><p>{t("Selected public and private collections.")}</p></header>
  {params.has('collection')&&!detail&&<p className="editorial-notice" role="status">{t("That collection record could not be found. Explore the works below.")}</p>}
  <nav className="collections-chapters" aria-label={t("Collections sections")}><a href="#from-the-archive">{t("From the archive ")}<span>{t(collectionArchive.length)}{t(" documents")}</span></a><a href="#collection-records">{t("Selected collections ")}<span>{t("16 works")}</span></a></nav>
  <section id="from-the-archive" className="collection-documents archive-front" aria-labelledby="documents-title"><div className="editorial-section-heading"><div><span className="editorial-eyebrow">{t("Portraits & exhibition records")}</span><h2 id="documents-title">{t("From the archive")}</h2></div><span>{t(collectionArchive.length)}{t(" documents")}</span></div>
   <div className="archive-front-feature"><div className={`archive-artwork-pair ${archiveSelected.companion?'has-companion':''}`}><button className="archive-front-image" onClick={()=>open(archiveSelected)} aria-label={t(`Enlarge archive ${archiveSelected.title}`)}><ArchiveImage item={archiveSelected} large eager/></button>{archiveSelected.companion&&<button className="archive-companion-image" onClick={()=>open(archiveSelected)} aria-label={t(`Enlarge ${archiveSelected.companion.title} and certificate`)}><img src={collectionAsset(archiveSelected.companion.image.display)} alt={t(archiveSelected.companion.alt)} width={archiveSelected.companion.image.width} height={archiveSelected.companion.image.height}/></button>}</div><article className="archive-front-copy" aria-live="polite"><span className="editorial-eyebrow">{t(archiveSelected.documentType)}{t(archiveSelected.date?' / '+archiveSelected.date:'')}</span><h3>{t(archiveSelected.title)}</h3><p>{t(archiveSelected.description)}</p><button className="editorial-text-button" onClick={()=>open(archiveSelected)}>{t("Look closer ")}<span aria-hidden="true"><Icon name="diagonal" /></span></button></article></div>
   <div className="archive-document-rail" aria-label={t("Choose an archive document")}>{collectionArchive.map(item=><button className="collection-document" key={item.id} aria-pressed={archiveSelected.id===item.id} onClick={()=>setArchiveSelected(item)} aria-label={t(`View archive ${item.title}`)}><span className="collection-document-image"><ArchiveImage item={item}/></span><span className="editorial-eyebrow">{t(item.date||item.documentType)}</span><span className="collection-document-title">{t(item.title)}</span></button>)}</div><p className="archive-rail-hint">{t("Browse the documents above. Select one to read its story.")}</p>
  </section>
  <section className="collection-feature" aria-label={t("Featured collection")}><button className="collection-feature-image" onClick={()=>open(featuredHolding)} aria-label={t(`View featured ${featuredHolding.title}`)}><ArchiveImage item={featuredHolding} large eager/></button><div className="collection-feature-copy"><span className="editorial-eyebrow">{t("In the collection of")}</span><h2>{t(featuredHolding.collector)}</h2><p>{t(featuredHolding.location)}</p><div className="collection-feature-label"><h3>{t(featuredHolding.title)}</h3><p>{t(featuredHolding.medium)}<br/>{t(featuredHolding.dimensions)}</p></div><button className="editorial-text-button" onClick={()=>open(featuredHolding)}>{t("View work ")}<span aria-hidden="true"><Icon name="diagonal" /></span></button></div></section>
  <section id="collection-records" className="collection-catalogue" aria-labelledby="holdings-title"><div className="editorial-section-heading"><h2 id="holdings-title">{t("Selected collections")}</h2><span>{t(items.length)}{t(" / ")}{t(holdings.length)}{t(" records")}</span></div><nav className="holding-filters" aria-label={t("Filter collections")}>{collectionFilters.map(f=><button key={f.id} aria-pressed={group===f.id} onClick={()=>filter(f.id)}>{t(f.label)}<span>{t(f.id==='all'?holdings.length:holdings.filter(h=>h.category===f.id).length)}</span></button>)}</nav>
   <div className="holding-grid">{items.map(item=><button className="holding-card" key={item.id} onClick={()=>open(item)} aria-label={t(`View ${item.title} — ${item.collector}`)}><span className="holding-image"><ArchiveImage item={item}/></span><span className="holding-caption"><span className="holding-owner">{t(item.collector)}</span><span className="holding-place">{t(item.location)}</span><span className="holding-title">{t(item.title)}</span><span className="holding-medium">{t(item.medium)}{t(item.dimensions?' / '+item.dimensions:'')}</span></span></button>)}</div>
  </section>

  <footer className="editorial-footer"><span>{t("Collection records & documents from the archive of Yi Kai")}</span><span>{t("© ")}{t(new Date().getFullYear())}{t(" Yi Kai")}</span></footer>
  {detail&&<CollectionDetail item={detail} items={detail.kind==='archive'?collectionArchive:items.some(h=>h.id===detail.id)?items:holdings} onChange={change} onClose={close} opener={opener}/>}
 </main>;
}
