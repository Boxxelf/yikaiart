import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
export default function ArchiveDialog({label,className,children,onClose,opener}:{label:string;className?:string;children:ReactNode;onClose:()=>void;opener:RefObject<HTMLElement|null>}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current!;dialog.showModal();return()=>dialog.close();},[]);
 const close=()=>{ref.current?.close();onClose();opener.current?.focus({preventScroll:true});};
 return <dialog ref={ref} className={`editorial-dialog ${className??''}`} aria-label={label} onCancel={e=>{e.preventDefault();close();}}>
  <header className="editorial-dialog-top"><span>Yi Kai / Personal archive</span><button autoFocus onClick={close}>Return <span aria-hidden="true">×</span></button></header>
  {children}
 </dialog>;
}
