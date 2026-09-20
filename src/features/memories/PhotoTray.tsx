import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { memories, memoryAsset, type Memory, type MemoryKind } from '../../content/memories';
import { useMedia } from '../../hooks';
import { useAlbumPosition } from './useAlbumPosition';
const filters:{id:MemoryKind|'all';label:string}[]=[{id:'all',label:'All'},{id:'photo',label:'Photographs'},{id:'exhibition-material',label:'Exhibition material'}];
const warmed=new Set<string>();
function warm(m:Memory){if(warmed.has(m.id))return;warmed.add(m.id);const i=new Image();i.decoding='async';i.src=memoryAsset(m.image.display);}
const pageSize=4;
type Turn={from:number;to:number;direction:number;progress:number;settling:boolean};
export default function PhotoTray({selected,queuedId,onChoose,onDragChange,ready,onLiftChange}:{selected:Memory;queuedId?:string;onChoose:(m:Memory,origin:HTMLElement|null)=>void;onDragChange:(id:string|null)=>void;ready:boolean;onLiftChange?:(lifted:boolean)=>void}){
 const placement=useAlbumPosition();
 const [filter,setFilter]=useState<MemoryKind|'all'>('all');const [page,setPage]=useState(()=>Math.floor(memories.findIndex(m=>m.id===selected.id)/pageSize));
 const [opened,setOpened]=useState(false);const [turn,setTurn]=useState<Turn|null>(null);const reduce=useMedia('(prefers-reduced-motion: reduce)');
 const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);const drag=useRef<{x:number;direction:number;progress:number}|null>(null);
 const book=useRef<HTMLDivElement>(null);const cover=useRef<HTMLButtonElement>(null);
 const dialog=useRef<HTMLDialogElement>(null);const panel=useRef<HTMLDivElement>(null);const motion=useRef<Animation|null>(null);const closing=useRef(false);
 const [returning,setReturning]=useState(false);
 const liftTransform=()=>{const a=cover.current!.getBoundingClientRect(),b=panel.current!.getBoundingClientRect();return `translate(${a.left+a.width/2-b.left-b.width/2}px,${a.top+a.height/2-b.top-b.height/2}px) scale(${a.width/b.width},${a.height/b.height}) rotate(-9deg)`;};
 const lift=()=>{if(dialog.current?.open||closing.current)return;setOpened(true);onLiftChange?.(true);dialog.current?.showModal();if(!reduce){motion.current?.cancel();motion.current=panel.current!.animate([{transform:liftTransform(),opacity:.65},{transform:'none',opacity:1}],{duration:650,easing:'cubic-bezier(.2,.75,.2,1)'});}};
 const putBack=(after?:()=>void)=>{if(closing.current)return;closing.current=true;clearTimeout(timer.current);drag.current=null;setTurn(null);setReturning(true);motion.current?.cancel();const finish=()=>{dialog.current?.close();setOpened(false);setReturning(false);closing.current=false;onLiftChange?.(false);cover.current?.focus({preventScroll:true});after?.();};if(reduce){finish();return;}motion.current=panel.current!.animate([{transform:'none',opacity:1},{transform:liftTransform(),opacity:.3}],{duration:380,easing:'cubic-bezier(.4,0,.8,.3)'});motion.current.onfinish=finish;};
 useEffect(()=>()=>{motion.current?.cancel();dialog.current?.close();},[]);
 const pick=(memory:Memory)=>putBack(()=>onChoose(memory,cover.current));
 const items=memories.filter(m=>filter==='all'||m.kind===filter),pages=Math.ceil(items.length/pageSize),safePage=Math.min(page,pages-1);
 const spread=items.slice(safePage*pageSize,(safePage+1)*pageSize);
 useEffect(()=>{spread.forEach(warm);},[filter,safePage]);useEffect(()=>()=>clearTimeout(timer.current),[]);
 const go=(to:number)=>{if(turn||to===safePage||to<0||to>=pages)return;if(reduce){setPage(to);return;}setTurn({from:safePage,to,direction:to>safePage?1:-1,progress:0,settling:false});timer.current=setTimeout(()=>{setTurn(t=>t?{...t,progress:1,settling:true}:null);timer.current=setTimeout(()=>{setPage(to);setTurn(null);},650);},30);};
 const begin=(e:PointerEvent<HTMLButtonElement>,direction:number)=>{if(turn||safePage+direction<0||safePage+direction>=pages)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,direction,progress:0};if(!reduce)setTurn({from:safePage,to:safePage+direction,direction,progress:0,settling:false});};
 const scrub=(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d||reduce)return;d.progress=Math.max(0,Math.min(1,(d.x-e.clientX)*d.direction/(book.current!.clientWidth*.6)));setTurn(t=>t?{...t,progress:d.progress}:null);};
 const release=()=>{const d=drag.current;if(!d)return;drag.current=null;const commit=d.progress>.2;if(reduce){go(safePage+d.direction);return;}setTurn(t=>t?{...t,progress:commit?1:0,settling:true}:null);timer.current=setTimeout(()=>{if(commit)setPage(safePage+d.direction);setTurn(null);},650);};

 const ghost=(which:number,side:number)=><div className="album-leaf-photos">{items.slice(which*4,(which+1)*4).filter((_,i)=>i%2===side).map(m=><span key={m.id}><img src={memoryAsset(m.image.thumbnail)} alt=""/><small>{m.year??'Undated'}</small></span>)}</div>;
 const cloth=<span className="album-cover-frame"><span className="album-cover-name">Yi Kai</span><span className="album-cover-rule"/><span className="album-cover-title">A life<br/>in photographs</span><span className="album-cover-date">1988 — 2026</span></span>;
 return <div ref={placement.dock} style={placement.style} className={`memory-album-dock ${opened?'is-lifted':''} ${placement.moving?'is-moving':''}`}>
  <div className="desk-album-shadow" aria-hidden="true"/>
  <button ref={cover} className="desk-album" aria-label="Pick up and open photo album" aria-haspopup="dialog" aria-expanded={opened} aria-describedby="album-desk-help" {...placement.handlers} onDragStart={e=>e.preventDefault()} onClick={e=>{if(e.detail===0||!placement.wasDragged.current)lift();}}><span className="desk-album-pages" aria-hidden="true"/><span className="desk-album-cover">{cloth}<span className="album-cover-spine" aria-hidden="true"/></span></button>
  <span className="desk-album-caption"><small>Click to open · Drag to move</small></span><span id="album-desk-help" className="sr-only">Drag to move the album. Use arrow keys to reposition it, Home to reset, or Enter to open.</span>
  <dialog ref={dialog} className="album-lift-dialog" aria-label="The photo album" onCancel={e=>{e.preventDefault();putBack();}} onClick={e=>{if(e.target===e.currentTarget)putBack();}}>
  <div ref={panel} className={`album-lift-panel ${returning?'is-returning':''}`} inert={returning}>
  <div className="album-lift-top"><span>From the desk of Yi Kai</span><button autoFocus onClick={()=>putBack()}>Put album back <span aria-hidden="true">×</span></button></div>
  <section className={`memory-album is-open ${turn?'is-turning':''}`} aria-label="Photo album">
  <header className="memory-album-title"><h2>The photo album</h2><span>1988 — 2026</span></header>
  <nav className="memory-album-filters" aria-label="Filter memories" inert={!opened}>{filters.map(f=><button disabled={!!turn} key={f.id} aria-pressed={filter===f.id} onClick={()=>{setFilter(f.id);setPage(0);}}>{f.label} <span>{f.id==='all'?memories.length:memories.filter(m=>m.kind===f.id).length}</span></button>)}</nav>
  <div className="album-perspective"><div className="album-object" ref={book} data-open={opened}>
   <div className="album-back-board" aria-hidden="true"/><div className="album-page-edges" aria-hidden="true"/>
   <div className="memory-album-spread" inert={!opened||!!turn} aria-hidden={!opened||!!turn}>
    {spread.map(m=><button className={`memory-photo-card ${selected.id===m.id?'is-selected':''} ${queuedId===m.id?'is-queued':''}`} key={m.id} aria-label={`Load ${m.title}`} aria-pressed={selected.id===m.id} disabled={!ready||!!turn} draggable={ready&&!turn} onClick={()=>pick(m)} onPointerEnter={()=>warm(m)} onFocus={()=>warm(m)} onDragStart={e=>{e.dataTransfer.setData('text/x-yikai-memory',m.id);e.dataTransfer.effectAllowed='copy';onDragChange(m.id);motion.current?.cancel();timer.current=setTimeout(()=>{dialog.current?.close();setOpened(false);onLiftChange?.(false);},0);}} onDragEnd={()=>onDragChange(null)} onKeyDown={e=>{if(e.key==='Escape')onDragChange(null);}}>
     <span className="memory-photo-print"><img src={memoryAsset(m.image.thumbnail)} alt="" draggable={false}/></span><span className="memory-photo-date">{m.year??'Undated'}{queuedId===m.id?' / Up next':''}</span><span className="memory-photo-title">{m.title}</span>
    </button>)}{Array.from({length:4-spread.length},(_,i)=><span className="memory-album-empty" key={i} aria-hidden="true"/>)}
   </div>
   {turn&&<div className={`album-turn-leaf ${turn.direction<0?'is-backward':''} ${turn.settling?'is-settling':''}`} style={{transform:`rotateY(${-180*turn.direction*turn.progress}deg)`}} aria-hidden="true"><div className="album-leaf-front">{ghost(turn.from,turn.direction>0?1:0)}</div><div className="album-leaf-back">{ghost(turn.to,turn.direction>0?0:1)}</div></div>}
   <div className="album-binding" aria-hidden="true"/>

   {opened&&<><button className="album-drag-edge is-left" aria-label="Drag to turn album page backward" disabled={safePage===0} onPointerDown={e=>begin(e,-1)} onPointerMove={scrub} onPointerUp={release} onPointerCancel={()=>{drag.current=null;setTurn(null);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go(safePage-1);}}}/><button className="album-drag-edge is-right" aria-label="Drag to turn album page forward" disabled={safePage===pages-1} onPointerDown={e=>begin(e,1)} onPointerMove={scrub} onPointerUp={release} onPointerCancel={()=>{drag.current=null;setTurn(null);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go(safePage+1);}}}/></>}
  </div></div>
  {opened?<><div className="memory-album-paging"><button aria-label="Previous album page" disabled={safePage===0||!!turn} onClick={()=>go(safePage-1)}>←</button><label><span className="sr-only">Album pages</span><select aria-label="Album pages" disabled={!!turn} value={safePage} onChange={e=>go(Number(e.target.value))}>{Array.from({length:pages},(_,i)=><option key={i} value={i}>{String(i*4+1).padStart(2,'0')}–{String(Math.min((i+1)*4,items.length)).padStart(2,'0')} / {items.length}</option>)}</select></label><button aria-label="Next album page" disabled={safePage===pages-1||!!turn} onClick={()=>go(safePage+1)}>→</button></div><div className="album-bottom"><p>Turn a page. Choose a photograph.</p><span>Click a photograph to send it to the computer.</span></div></>:<p className="memory-album-hint">Pick up the album to open it.</p>}
 </section></div></dialog></div>;
}
