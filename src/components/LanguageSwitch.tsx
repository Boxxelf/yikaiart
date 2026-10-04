import {useTranslation} from '../i18n/Locale';
export default function LanguageSwitch({floating=false}:{floating?:boolean}){
 const {locale,setLocale}=useTranslation();
 return <div className={`language-switch${floating?' language-switch-floating':''}`} role="group" aria-label={locale==='en'?'Language':'語言'}>
  <button type="button" lang="en" aria-label="Switch to English" aria-pressed={locale==='en'} onClick={()=>setLocale('en')}>EN</button><span aria-hidden="true">/</span><button type="button" lang="zh-Hant" aria-label="切換至繁體中文" aria-pressed={locale==='zh-Hant'} onClick={()=>setLocale('zh-Hant')}>繁中</button>
 </div>;
}
