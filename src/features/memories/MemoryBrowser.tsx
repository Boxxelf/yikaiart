import LanguageSwitch from '../../components/LanguageSwitch';
import { useTranslation } from '../../i18n/Locale';
import Icon from '../../components/Icon';
import { useEffect, useRef, useState } from 'react';
import { memories, memoryAsset, type Memory } from '../../content/memories';
import MemoryScreen from './MemoryScreen';
export default function MemoryBrowser({memory,onClose}:{memory:Memory;onClose:(memory:Memory)=>void}){
 const { t } = useTranslation();

 const dialog=useRef<HTMLDialogElement>(null);
 const [history,setHistory]=useState([memory.id]);const [cursor,setCursor]=useState(0);
 const [directory,setDirectory]=useState(false);const [reload,setReload]=useState(0);
 const current=memories.find(m=>m.id===history[cursor])!;const index=memories.indexOf(current);
 const visit=(id:string)=>{if(id!==current.id){setHistory(h=>[...h.slice(0,cursor+1),id]);setCursor(cursor+1);}setDirectory(false);};
 useEffect(()=>{const d=dialog.current!;d.showModal();return()=>d.close();},[]);
 const close=()=>{dialog.current?.close();onClose(current);};
 return <dialog ref={dialog} className="memory-reader memory-browser-reader" aria-label={t(`Read ${current.title}`)} onCancel={e=>{e.preventDefault();close();}}>
  <div className="memory-browser-bezel"><div className="memory-browser-window">
   <header className="memory-browser-title"><span><i aria-hidden="true"><Icon name="image" /></i>{t(" Yi Kai — Memory Explorer")}</span><LanguageSwitch/><button autoFocus onClick={close} aria-label={t("Close memory browser")}><Icon name="close" /></button></header>
   <div className="memory-browser-menu"><span>{t("The personal archive")}</span><button aria-expanded={directory} onClick={()=>setDirectory(v=>!v)}>{t("Photo directory")}</button><button onClick={close}>{t("Return to the desk")}</button></div>
   <nav className="memory-browser-toolbar" aria-label={t("Memory browser controls")}><button aria-label={t("Browser back")} disabled={cursor===0} onClick={()=>{setCursor(cursor-1);setDirectory(false);}}><Icon name="left" /> <span>{t("Back")}</span></button><button aria-label={t("Browser forward")} disabled={cursor===history.length-1} onClick={()=>{setCursor(cursor+1);setDirectory(false);}}><Icon name="right" /> <span>{t("Forward")}</span></button><button aria-label={t("Reload photograph")} onClick={()=>setReload(v=>v+1)}><Icon name="rotate-left" /> <span>{t("Reload")}</span></button><button aria-label={t("All photos")} aria-pressed={directory} onClick={()=>setDirectory(v=>!v)}><Icon name="grid" /> <span>{t("All photos")}</span></button><span className="memory-browser-count">{t(index+1)}{t(" / ")}{t(memories.length)}</span></nav>
   <label className="memory-browser-address"><span>{t("Address")}</span><input aria-label={t("Simulated browser address")} readOnly value={`memory://yikai.local/photographs/${current.id}`}/><span className="memory-browser-local">{t("Local archive")}</span></label>
   <div className="memory-browser-document">
    {directory?<section className="memory-browser-directory" aria-label={t("All photographs")}><header><h2>{t("The personal archive")}</h2><p>{t("Choose a photograph to open it in this window.")}</p></header><div>{memories.map(m=><button key={m.id} onClick={()=>visit(m.id)} aria-label={t(`Browse ${m.title}`)}><img src={memoryAsset(m.image.thumbnail)} alt={t("")} loading="lazy"/><span>{t(m.title)}<small>{t(m.year??'Undated')}</small></span></button>)}</div></section>:<MemoryScreen key={`${current.id}-${reload}`} memory={current} revealing={false}/>}
   </div>
   <footer className="memory-browser-status"><span role="status">{t(directory?'28 photographs in the local archive':current.title)}</span><nav aria-label={t("Browse photographs")}><button aria-label={t("Previous photograph in browser")} onClick={()=>visit(memories[(index-1+memories.length)%memories.length].id)}><Icon name="left" />{t(" Previous")}</button><button aria-label={t("Next photograph in browser")} onClick={()=>visit(memories[(index+1)%memories.length].id)}>{t("Next ")}<Icon name="right" /></button></nav></footer>
  </div><div className="memory-browser-chin"><span>{t("YI KAI")}</span><span>{t("Memory terminal ")}<i aria-hidden="true"/></span></div></div>
 </dialog>;
}
