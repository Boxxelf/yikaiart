import LanguageSwitch from './LanguageSwitch';
import { useTranslation } from '../i18n/Locale';
import Icon from './Icon';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useMedia } from '../hooks';
const links=[['/works','Works'],['/collections','Collections'],['/reviews','Reviews'],['/memories','Memories'],['/about','About']];
export default function SiteNavigation(){
 const { t } = useTranslation();

 const mobile=useMedia('(max-width:900px)');const [open,setOpen]=useState(false);const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);const location=useLocation();
 useEffect(()=>{setOpen(false);window.scrollTo(0,0);},[location.pathname]);
 useEffect(()=>{const d=dialog.current;if(open&&mobile)d?.showModal();else d?.close();return()=>d?.close();},[open,mobile]);
 const close=()=>{dialog.current?.close();setOpen(false);trigger.current?.focus({preventScroll:true});};
 if(!mobile)return <nav aria-label={t("Main navigation")}>{links.map(([to,label])=><NavLink key={to} to={to}>{t(label)}</NavLink>)}</nav>;
 return <><button ref={trigger} className="site-menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(true)}>{t("Menu ")}<Icon name="plus" /></button><dialog id="mobile-navigation" className="site-menu-dialog" aria-label={t("Site menu")} ref={dialog} onCancel={e=>{e.preventDefault();close();}}><div className="site-menu-top"><span>{t("YI KAI")}<span className="wordmark-period">{t(".")}</span></span><LanguageSwitch/><button autoFocus onClick={close}>{t("Close ")}<span aria-hidden="true"><Icon name="close" /></span></button></div><nav aria-label={t("Main navigation")}>{links.map(([to,label])=><NavLink key={to} to={to} onClick={()=>{dialog.current?.close();setOpen(false);}}>{t(label)}</NavLink>)}</nav><p>{t("A life in painting.")}</p></dialog></>;
}
