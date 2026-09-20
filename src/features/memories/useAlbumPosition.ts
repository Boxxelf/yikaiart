import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type KeyboardEvent } from 'react';

/** Keep the desk object movable without treating the release as an open click. */
export function useAlbumPosition() {
 const dock=useRef<HTMLDivElement>(null);
 const [position,setPosition]=useState({x:0,y:0});
 const [moving,setMoving]=useState(false);
 const wasDragged=useRef(false);
 const gesture=useRef<{x:number;y:number;startX:number;startY:number;minX:number;maxX:number;minY:number;maxY:number}|null>(null);
 const limits=()=>{
  const rect=dock.current!.getBoundingClientRect(),desk=dock.current!.parentElement!.getBoundingClientRect();
  return {minX:position.x+desk.left+25-rect.left,maxX:position.x+desk.right-25-rect.right,minY:position.y+desk.top+35-rect.top,maxY:position.y+desk.bottom-30-rect.bottom};
 };
 const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
 const down=(e:PointerEvent<HTMLButtonElement>)=>{
  if(e.button!==0||!e.isPrimary)return;
  wasDragged.current=false;
  gesture.current={x:e.clientX,y:e.clientY,startX:position.x,startY:position.y,...limits()};
  e.currentTarget.setPointerCapture(e.pointerId);
 };
 const move=(e:PointerEvent<HTMLButtonElement>)=>{
  const g=gesture.current;if(!g)return;
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!wasDragged.current&&Math.hypot(dx,dy)<6)return;
  wasDragged.current=true;setMoving(true);
  setPosition({x:clamp(g.startX+dx,g.minX,g.maxX),y:clamp(g.startY+dy,g.minY,g.maxY)});
 };
 const end=()=>{gesture.current=null;setMoving(false);};
 const key=(e:KeyboardEvent<HTMLButtonElement>)=>{
  if(e.key==='Home'){e.preventDefault();setPosition({x:0,y:0});return;}
  const delta:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  const d=delta[e.key];if(!d)return;e.preventDefault();const l=limits(),step=e.shiftKey?50:20;
  setPosition({x:clamp(position.x+d[0]*step,l.minX,l.maxX),y:clamp(position.y+d[1]*step,l.minY,l.maxY)});
 };
 useEffect(()=>{const resize=()=>{gesture.current=null;setMoving(false);setPosition({x:0,y:0});};window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 return {dock,moving,wasDragged,style:{'--album-offset-x':`${position.x}px`,'--album-offset-y':`${position.y}px`} as CSSProperties,handlers:{onPointerDown:down,onPointerMove:move,onPointerUp:end,onPointerCancel:end,onLostPointerCapture:end,onKeyDown:key}};
}
