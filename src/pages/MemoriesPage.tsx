import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { memories, type Memory } from '../content/memories';
import { useMedia } from '../hooks';
import MemoryScreen from '../features/memories/MemoryScreen';
import PhotoTray from '../features/memories/PhotoTray';
import { useMemorySequence } from '../features/memories/useMemorySequence';
import '../styles/memories.css';
const MemoryComputer=lazy(()=>import('../features/memories/MemoryComputer'));
function CloseReader({memory,onClose}:{memory:Memory;onClose:()=>void}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current!;dialog.showModal();return()=>dialog.close();},[]);
  const dismiss=()=>{ref.current?.close();onClose();};
  return <dialog className="memory-reader" ref={ref} onCancel={e=>{e.preventDefault();dismiss();}} aria-label={`Read ${memory.title}`}>
    <header><span>Yi Kai / The personal archive</span><button onClick={dismiss}>Return to the desk <span aria-hidden="true">×</span></button></header>
    <div className="memory-reader-computer"><div className="memory-reader-screen"><MemoryScreen memory={memory} revealing={false}/></div><div className="memory-reader-chin"><span>YI KAI</span><i aria-hidden="true"/></div></div>
  </dialog>;
}
export default function MemoriesPage(){
  const [params,setParams]=useSearchParams();
  const routeId=params.get('photo');
  const [selected,setSelected]=useState(()=>memories.find(m=>m.id===routeId)??memories[0]);
  const [dragging,setDragging]=useState<string|null>(null);
  const [over,setOver]=useState(false);
  const [viewReset,setViewReset]=useState(0);
  const [rotateStep,setRotateStep]=useState(0);
  const activeMemoryId=useRef<string|null>(routeId);
  const [queued,setQueued]=useState<{memory:Memory;origin:HTMLElement|null}|null>(null);
  const origin=useRef<HTMLElement|null>(null);
  const [failed,setFailed]=useState(false);
  const [ready,setReady]=useState(false);
  const [close,setClose]=useState(false);
  const reduce=useMedia('(prefers-reduced-motion: reduce)');
  const sequence=useMemorySequence(reduce||failed);
  const screen=useRef<HTMLDivElement>(null),slot=useRef<HTMLDivElement>(null);
  const stage=useRef<HTMLElement>(null);
  const animateNext=useRef(false);
  const readerOpener=useRef<HTMLElement|null>(null);
  const openReader=()=>{readerOpener.current=document.activeElement as HTMLElement;setClose(true);};
  const invalid=!!routeId&&!memories.some(m=>m.id===routeId);
  const busy=sequence.phase==='loading'||sequence.phase==='inserting'||sequence.phase==='revealing';
  const animating=sequence.phase==='inserting'||sequence.phase==='revealing';
  const hasMemory=!!sequence.current;
  useEffect(()=>{
    const memory=memories.find(m=>m.id===routeId);
    activeMemoryId.current=memory?.id??null;
    setClose(false);
    if(memory){setSelected(memory);sequence.start(memory,animateNext.current);}
    else sequence.reset();
    animateNext.current=false;
  },[routeId,sequence.start,sequence.reset]);
  useEffect(()=>{const cancelQueue=()=>setQueued(null);window.addEventListener('popstate',cancelQueue);return()=>window.removeEventListener('popstate',cancelQueue);},[]);
  useEffect(()=>{document.title=`${sequence.current?.title??'Memories'} — Yi Kai`;},[sequence.current]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setDragging(null);setOver(false);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
  const place=(memory:Memory,print:HTMLElement|null=null)=>{
    setSelected(memory);setDragging(null);setOver(false);
    if(sequence.busyRef.current){setQueued(activeMemoryId.current===memory.id?null:{memory,origin:print});return;}
    activeMemoryId.current=memory.id;
    origin.current=print;
    sequence.busyRef.current=true;
    const bounds=stage.current?.getBoundingClientRect();
    if(bounds&&(bounds.top<0||bounds.bottom>window.innerHeight))stage.current?.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'});
    if(routeId===memory.id)sequence.start(memory,true);
    else{animateNext.current=true;setParams({photo:memory.id},{preventScrollReset:true});}
  };
  useEffect(()=>{if(queued&&!sequence.busyRef.current&&(sequence.phase==='viewing'||sequence.phase==='idle')){setQueued(null);place(queued.memory,queued.origin);}},[queued,sequence.phase]);
  const move=(delta:number)=>{const index=memories.findIndex(m=>m.id===(sequence.current?.id??selected.id));place(memories[(index+delta+memories.length)%memories.length]);};
  const status=sequence.error || (invalid?'That memory was not found. Choose a photograph below.':sequence.phase==='loading'?'Preparing the photograph…':sequence.phase==='inserting'?'Placing this moment in the memory box…':sequence.phase==='revealing'?'A moment comes into view.':hasMemory?'Click the screen to view the full photograph.':'Click a photograph in the album to begin.');
  return <main id="main" tabIndex={-1} className="memories-page">
    <div className="memories-layout">
      <header className="memories-intro"><span className="memory-section-name">The personal archive / 1988 — 2026</span><h1>Memories<span className="memory-title-period">.</span></h1><p className="memories-deck">A life around art, one photograph at a time.</p></header>
      <div className="memory-desk">
      <PhotoTray selected={selected} queuedId={queued?.memory.id} onChoose={place} onDragChange={setDragging} ready={ready||failed}/>
      <section ref={stage} className={`memory-stage ${failed?'is-fallback':''} ${dragging?'is-dragging':''} ${over?'is-over':''}`} aria-label="Interactive memory computer" data-phase={sequence.phase}>
        <div className="memory-stage-caption"><span>{hasMemory?`${String(memories.findIndex(m=>m.id===sequence.current!.id)+1).padStart(2,'0')} / ${memories.length}`:'Waiting for a moment'}</span></div>
        {!failed&&<Suspense fallback={<div className="memory-stage-loading">Opening the memory box…</div>}><MemoryComputer screen={screen} slot={slot} progress={sequence.progress} phase={sequence.phase} image={sequence.incoming} hasMemory={hasMemory} interaction={stage} origin={origin} viewReset={viewReset} rotateStep={rotateStep} reduced={reduce} paused={close} onFailure={()=>setFailed(true)} onReady={()=>setReady(true)}/></Suspense>}
        {failed&&<div className="memory-fallback-housing" aria-hidden="true"><div className="memory-fallback-base"><span>YI KAI</span><i/></div><div className="memory-fallback-keyboard">{Array.from({length:48},(_,i)=><i key={i}/>)}</div></div>}
        <div className={`memory-display ${(ready||failed)&&sequence.phase!=='inserting'?'has-content':''}`} ref={screen} inert={sequence.phase==='inserting'} aria-hidden={sequence.phase==='inserting'}>
          {sequence.current?<><MemoryScreen memory={sequence.current} revealing={sequence.phase==='revealing'}/><button className="memory-screen-open" disabled={busy} onClick={openReader} aria-label={`Enlarge ${sequence.current.title}`}><span aria-hidden="true">View photograph ↗</span></button></>:<div className="memory-screen-idle"><span className="memory-idle-mark">YI KAI<span>®</span></span><span>MEMORY TERMINAL</span><i aria-hidden="true"/><p>Every photograph holds a story.</p><small>Click a photograph in the album.</small></div>}

        </div>
        <div className="memory-slot-target" ref={slot} onDragOver={e=>{if(dragging&&!busy){e.preventDefault();e.dataTransfer.dropEffect='copy';setOver(true);}}} onDragLeave={()=>setOver(false)} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('text/x-yikai-memory');const memory=memories.find(m=>m.id===id);setOver(false);setDragging(null);if(memory&&!busy)place(memory);}}><span>Place photograph here</span></div>
        <div className="memory-stage-controls"><div className="memory-rotation-controls"><button disabled={busy||failed} aria-label="Rotate computer left" onClick={()=>setRotateStep(v=>v-1)}>↶</button><button disabled={busy||failed} onClick={()=>setViewReset(v=>v+1)}>Reset view</button><button disabled={busy||failed} aria-label="Rotate computer right" onClick={()=>setRotateStep(v=>v+1)}>↷</button></div><div>{hasMemory&&<><button disabled={busy} onClick={()=>place(sequence.current!)}>Replay</button><button disabled={busy} onClick={openReader}>Read closer <span aria-hidden="true">↗</span></button></>}{animating&&<button onClick={sequence.skip}>Skip animation</button>}</div></div>
      </section>
      </div>
      <p className="memories-instructions">Drag the computer to turn it. <span>Click its screen to look closer.</span></p>
    </div>
    <div className="memory-now-playing"><div><span className="memory-selected-label">{busy?'Opening photograph':hasMemory?'On the screen':'From the album'}</span><p>{sequence.current?.title??selected.title}</p></div><div className="memory-navigation"><button disabled={busy} onClick={()=>move(-1)} aria-label="Previous memory">←</button><button disabled={busy} onClick={()=>move(1)} aria-label="Next memory">→</button></div></div>
    <p className={`memory-status ${sequence.error||invalid?'is-error':''}`} role="status" aria-live="polite">{queued?`${status} Up next: ${queued.memory.title}.`:status} {sequence.error&&<button className="memory-retry" onClick={()=>place(selected)}>Try again</button>}</p>
    <footer className="memories-footer"><span>From the personal archive of Yi Kai</span><span>© {new Date().getFullYear()} Yi Kai</span></footer>
    {close&&sequence.current&&<CloseReader memory={sequence.current} onClose={()=>{setClose(false);readerOpener.current?.focus({preventScroll:true});}}/>}
  </main>;
}
