import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { memoryAsset, type Memory } from '../../content/memories';
export type MemoryPhase = 'idle' | 'loading' | 'inserting' | 'revealing' | 'viewing';
export function useMemorySequence(reduced: boolean) {
  const [phase, setPhase] = useState<MemoryPhase>('idle');
  const [current, setCurrent] = useState<Memory | null>(null);
  const [incoming, setIncoming] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState('');
  const progress = useRef({ value: 1 });
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const generation = useRef(0);
  const cancelLoad = useRef<(() => void) | null>(null);
  const busyRef = useRef(false);
  const start = useCallback((memory: Memory, animate: boolean) => {
    const ticket = ++generation.current;
    timeline.current?.kill(); cancelLoad.current?.();
    busyRef.current = true; setPhase('loading'); setError('');
    const img = new Image(); img.decoding = 'async';
    const fail = () => {
      if (ticket !== generation.current) return;
      cancelLoad.current?.(); generation.current++;
      busyRef.current = false; setPhase('idle'); setError('This photograph could not be loaded. Please try again.');
    };
    const timeout = window.setTimeout(fail, 15000);
    cancelLoad.current = () => { clearTimeout(timeout); img.onload = null; img.onerror = null; };
    img.onerror = () => { clearTimeout(timeout); fail(); };
    img.onload = async () => {
      try { await img.decode(); } catch { clearTimeout(timeout); fail(); return; }
      clearTimeout(timeout);
      if (ticket !== generation.current) return;
      setIncoming(img);
      if (!animate || reduced) {
        progress.current.value = 1; setCurrent(memory); setPhase('viewing'); busyRef.current = false; return;
      }
      progress.current.value = 0; setPhase('inserting');
      timeline.current = gsap.timeline({onComplete: () => { busyRef.current = false; setPhase('viewing'); }})
        .to(progress.current, {value:1, duration:2.8, ease:'none'}, 0)
        .call(() => {setCurrent(memory);setPhase('revealing');}, [], 1.5);
    };
    img.src = memoryAsset(memory.image.display);
  }, [reduced]);
  const reset = useCallback(() => {
    generation.current++; timeline.current?.kill(); cancelLoad.current?.();
    busyRef.current = false; progress.current.value = 1; setCurrent(null);setIncoming(null);setPhase('idle');setError('');
  }, []);
  useEffect(() => () => { generation.current++; timeline.current?.kill(); cancelLoad.current?.(); }, []);
  const skip = () => timeline.current?.progress(1);
  return {phase,current,incoming,error,progress,start,reset,skip,busyRef};
}
