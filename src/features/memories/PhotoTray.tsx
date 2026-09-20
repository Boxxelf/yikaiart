import { useEffect, useState } from 'react';
import { memories, memoryAsset, type Memory, type MemoryKind } from '../../content/memories';
const filters: {id: MemoryKind | 'all';label:string}[] = [{id:'all',label:'All'},{id:'photo',label:'Photographs'},{id:'exhibition-material',label:'Exhibition material'}];
const warmed=new Set<string>();
function warm(memory:Memory){
  if(warmed.has(memory.id))return;
  warmed.add(memory.id);
  const image=new Image();image.decoding='async';image.fetchPriority='low';image.src=memoryAsset(memory.image.display);
}
const pageSize=4;
export default function PhotoTray({selected,queuedId,onChoose,onDragChange,ready}: {
  selected:Memory;queuedId?:string;onChoose:(m:Memory,origin:HTMLElement|null)=>void;
  onDragChange:(id:string|null)=>void;ready:boolean;
}) {
  const [filter,setFilter]=useState<MemoryKind|'all'>('all');
  const [page,setPage]=useState(()=>Math.floor(memories.findIndex(m=>m.id===selected.id)/pageSize));
  const items=memories.filter(m=>filter==='all'||m.kind===filter);
  const pages=Math.ceil(items.length/pageSize);
  const safePage=Math.min(page,pages-1);
  const spread=items.slice(safePage*pageSize,(safePage+1)*pageSize);
  useEffect(()=>{spread.forEach(warm);},[filter,safePage]);
  return <section className="memory-album" aria-label="Photo album">
    <header className="memory-album-title"><h2>The photo album</h2><span>1988 — 2026</span></header>
    <nav className="memory-album-filters" aria-label="Filter memories">{filters.map(f=><button key={f.id} aria-pressed={filter===f.id} onClick={()=>{setFilter(f.id);setPage(0);}}>{f.label} <span>{f.id==='all'?memories.length:memories.filter(m=>m.kind===f.id).length}</span></button>)}</nav>
    <div className="memory-album-spread" key={`${filter}-${safePage}`}>
      {spread.map(m=><button className={`memory-photo-card ${selected.id===m.id?'is-selected':''} ${queuedId===m.id?'is-queued':''}`} key={m.id} aria-label={`Load ${m.title}`} aria-pressed={selected.id===m.id} disabled={!ready} draggable={ready}
        onClick={e=>onChoose(m,e.currentTarget.querySelector('.memory-photo-print'))}
        onPointerEnter={()=>warm(m)} onFocus={()=>warm(m)}
        onDragStart={e=>{e.dataTransfer.setData('text/x-yikai-memory',m.id);e.dataTransfer.effectAllowed='copy';onDragChange(m.id);}}
        onDragEnd={()=>onDragChange(null)} onKeyDown={e=>{if(e.key==='Escape')onDragChange(null);}}>
        <span className="memory-photo-print"><img src={memoryAsset(m.image.thumbnail)} alt="" draggable={false}/></span>
        <span className="memory-photo-date">{m.year??'Undated'}{queuedId===m.id?' / Up next':''}</span><span className="memory-photo-title">{m.title}</span>
      </button>)}
      {Array.from({length:pageSize-spread.length},(_,i)=><span key={`empty-${i}`} className="memory-album-empty" aria-hidden="true"/>)}
    </div>
    <div className="memory-album-paging"><button aria-label="Previous album page" disabled={safePage===0} onClick={()=>setPage(safePage-1)}>←</button><label><span className="sr-only">Album pages</span><select aria-label="Album pages" value={safePage} onChange={e=>setPage(Number(e.target.value))}>{Array.from({length:pages},(_,i)=><option key={i} value={i}>{String(i*pageSize+1).padStart(2,'0')}–{String(Math.min((i+1)*pageSize,items.length)).padStart(2,'0')} / {items.length}</option>)}</select></label><button aria-label="Next album page" disabled={safePage===pages-1} onClick={()=>setPage(safePage+1)}>→</button></div>
    <p className="memory-album-hint">Click a photograph to bring it to life.</p>
  </section>;
}
