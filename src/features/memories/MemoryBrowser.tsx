import { useEffect, useRef, useState } from 'react';
import { memories, memoryAsset, type Memory } from '../../content/memories';
import MemoryScreen from './MemoryScreen';
export default function MemoryBrowser({memory,onClose}:{memory:Memory;onClose:(memory:Memory)=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [history,setHistory]=useState([memory.id]);const [cursor,setCursor]=useState(0);
 const [directory,setDirectory]=useState(false);const [reload,setReload]=useState(0);
 const current=memories.find(m=>m.id===history[cursor])!;const index=memories.indexOf(current);
 const visit=(id:string)=>{if(id!==current.id){setHistory(h=>[...h.slice(0,cursor+1),id]);setCursor(cursor+1);}setDirectory(false);};
 useEffect(()=>{const d=dialog.current!;d.showModal();return()=>d.close();},[]);
 const close=()=>{dialog.current?.close();onClose(current);};
 return <dialog ref={dialog} className="memory-reader memory-browser-reader" aria-label={`Read ${current.title}`} onCancel={e=>{e.preventDefault();close();}}>
  <div className="memory-browser-bezel"><div className="memory-browser-window">
   <header className="memory-browser-title"><span><i aria-hidden="true">▧</i> Yi Kai — Memory Explorer</span><button autoFocus onClick={close} aria-label="Close memory browser">×</button></header>
   <div className="memory-browser-menu"><span>The personal archive</span><button aria-expanded={directory} onClick={()=>setDirectory(v=>!v)}>Photo directory</button><button onClick={close}>Return to the desk</button></div>
   <nav className="memory-browser-toolbar" aria-label="Memory browser controls"><button aria-label="Browser back" disabled={cursor===0} onClick={()=>{setCursor(cursor-1);setDirectory(false);}}>← <span>Back</span></button><button aria-label="Browser forward" disabled={cursor===history.length-1} onClick={()=>{setCursor(cursor+1);setDirectory(false);}}>→ <span>Forward</span></button><button aria-label="Reload photograph" onClick={()=>setReload(v=>v+1)}>↻ <span>Reload</span></button><button aria-label="All photos" aria-pressed={directory} onClick={()=>setDirectory(v=>!v)}>▦ <span>All photos</span></button><span className="memory-browser-count">{index+1} / {memories.length}</span></nav>
   <label className="memory-browser-address"><span>Address</span><input aria-label="Simulated browser address" readOnly value={`memory://yikai.local/photographs/${current.id}`}/><span className="memory-browser-local">Local archive</span></label>
   <div className="memory-browser-document">
    {directory?<section className="memory-browser-directory" aria-label="All photographs"><header><h2>The personal archive</h2><p>Choose a photograph to open it in this window.</p></header><div>{memories.map(m=><button key={m.id} onClick={()=>visit(m.id)} aria-label={`Browse ${m.title}`}><img src={memoryAsset(m.image.thumbnail)} alt="" loading="lazy"/><span>{m.title}<small>{m.year??'Undated'}</small></span></button>)}</div></section>:<MemoryScreen key={`${current.id}-${reload}`} memory={current} revealing={false}/>}
   </div>
   <footer className="memory-browser-status"><span role="status">{directory?'28 photographs in the local archive':current.title}</span><nav aria-label="Browse photographs"><button aria-label="Previous photograph in browser" onClick={()=>visit(memories[(index-1+memories.length)%memories.length].id)}>← Previous</button><button aria-label="Next photograph in browser" onClick={()=>visit(memories[(index+1)%memories.length].id)}>Next →</button></nav></footer>
  </div><div className="memory-browser-chin"><span>YI KAI</span><span>Memory terminal <i aria-hidden="true"/></span></div></div>
 </dialog>;
}
