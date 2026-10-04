import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {translateValue,type Locale} from './translate';
const storageKey='yikai-language';
const valid=(value:string|null):value is Locale=>value==='en'||value==='zh-Hant';
const Context=createContext<{locale:Locale;setLocale:(locale:Locale)=>void}>({locale:'en',setLocale:()=>{}});
export function LocaleProvider({children}:{children:ReactNode}){
 const location=useLocation(),navigate=useNavigate();
 const [locale,setLanguage]=useState<Locale>(()=>{
  const query=new URLSearchParams(location.search).get('lang');if(valid(query))return query;
  try{const saved=localStorage.getItem(storageKey);if(valid(saved))return saved;}catch{/* Private browsers can disable storage. */}
  return 'en';
 });
 const setLocale=useCallback((next:Locale)=>{
  setLanguage(next);const params=new URLSearchParams(location.search);params.set('lang',next);
  navigate({...location,search:params.toString()},{replace:true,preventScrollReset:true});
 },[location,navigate]);
 useEffect(()=>{const query=new URLSearchParams(location.search).get('lang');if(valid(query))setLanguage(query);},[location.search]);
 useEffect(()=>{
  document.documentElement.lang=locale;
  try{localStorage.setItem(storageKey,locale);}catch{/* Switching remains available without persistent storage. */}
 },[locale]);
 // Keep the chosen language in links copied from the address bar, preserving filters and anchors.
 useEffect(()=>{const params=new URLSearchParams(location.search);if(!params.has('lang')&&locale==='zh-Hant'){params.set('lang',locale);navigate({...location,search:params.toString()},{replace:true,preventScrollReset:true});}},[locale,location,navigate]);
 useEffect(()=>{const sync=(e:StorageEvent)=>{if(e.key===storageKey&&valid(e.newValue))setLocale(e.newValue);};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[setLocale]);
 const value=useMemo(()=>({locale,setLocale}),[locale,setLocale]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useTranslation(){
 const context=useContext(Context);
 const t=useCallback(<T,>(value:T):T=>translateValue(value,context.locale),[context.locale]);
 return {...context,t};
}
