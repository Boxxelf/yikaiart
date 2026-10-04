import LanguageSwitch from '../../components/LanguageSwitch';
import { useTranslation } from '../../i18n/Locale';
import Icon from '../../components/Icon';
import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
export default function ArchiveDialog({label,className,children,onClose,opener}:{label:string;className?:string;children:ReactNode;onClose:()=>void;opener:RefObject<HTMLElement|null>}){
 const { t } = useTranslation();

 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current!;dialog.showModal();return()=>dialog.close();},[]);
 const close=()=>{ref.current?.close();onClose();requestAnimationFrame(()=>opener.current?.focus({preventScroll:true}));};
 return <dialog ref={ref} className={`editorial-dialog ${className??''}`} aria-label={t(label)} onCancel={e=>{e.preventDefault();close();}}>
  <header className="editorial-dialog-top"><LanguageSwitch/><span>{t("Yi Kai / Personal archive")}</span><button autoFocus onClick={close}>{t("Return ")}<span aria-hidden="true"><Icon name="close" /></span></button></header>
  {t(children)}
 </dialog>;
}
