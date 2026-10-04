import traditional from './zh-Hant.json';
import english from './en.json';
export type Locale = 'en' | 'zh-Hant';
const zh = traditional as Record<string,string>;
const en = english as Record<string,string>;
export function translateText(text:string, locale:Locale):string {
 const normalized=text.replace(/\s+/g,' ').trim();
 const dictionary=locale==='zh-Hant'?zh:en;
 const exact=dictionary[normalized];
 if(exact!==undefined)return text.replace(/\S[\s\S]*\S|\S/,()=>exact);
 if(locale==='en')return text;
 const patterns:[RegExp,(...parts:string[])=>string][]=[
  [/^(.+) Up next: (.+)\.$/,(status,title)=>`${translateText(status,locale)} 接著播放：${translateText(title,locale)}。`],
  [/^Enlarge studio photograph (\d+): (.+)$/, (n,caption)=>`放大工作室照片 ${n}：${translateText(caption,locale)}`],
  [/^The Fragmented Self\s*#(\d+)$/,n=>`破碎的自我 #${n}`],
  [/^(\d+) works$/i,n=>`${n} 件作品`],
  [/^(\d+) WORKS \/ SIX COLLECTIONS$/,n=>`${n} 件作品／六個系列`],
  [/^(\d+) documents$/,n=>`${n} 份文獻`],
  [/^(\d+) perspectives$/,n=>`${n} 篇評論`],
  [/^(\d+) photographs in the local archive$/,n=>`個人檔案中共有 ${n} 張照片`],
  [/^Page (\d+) of (\d+)$/, (n,total)=>`第 ${n} 頁，共 ${total} 頁`],
  [/^Pages (\d+)–(\d+)$/, (a,b)=>`第 ${a}–${b} 頁`],
  [/^(View archive|Enlarge archive|View featured|View|Enlarge|Load|Browse|Read|Perspective by|Memory:) (.+)$/, (action,rest)=>`${({View:'查看',Enlarge:'放大',Load:'開啟',Browse:'瀏覽',Read:'閱讀','View archive':'查看文獻','Enlarge archive':'放大文獻','View featured':'查看精選作品','Perspective by':'評論作者','Memory:':'回憶：'} as Record<string,string>)[action]} ${translateText(rest,locale)}`],
  [/^(.+) — artwork detail$/, title=>`${translateText(title,locale)} — 作品詳情`],
  [/^(.+) and certificate$/, title=>`${translateText(title,locale)}與參展證書`],
  [/^Image accompanying the (.+) review$/,name=>`${translateText(name,locale)}評論的附圖`],
  [/^(.+), a work by Yi Kai in the (.+) collection\.$/,(title,series)=>`易凱的作品《${translateText(title,locale)}》，屬於「${translateText(series,locale)}」系列。`],
  [/^(.+) — archival photograph$/,title=>`${translateText(title,locale)} — 歷史照片`],
  [/^Open (.+): (.+)$/, (spine,title)=>`開啟${translateText(spine,locale)}：${translateText(title,locale)}`],
  [/^Select (.+): (.+)$/, (spine,title)=>`選擇${translateText(spine,locale)}：${translateText(title,locale)}`],
 ];
 for(const [regex,format] of patterns){const match=normalized.match(regex);if(match)return format(...match.slice(1));}
 // Composite labels retain their separators and any proper names not translated in the catalogue.
 if(/( \/ | — | · |: )/.test(text))return text.split(/( \/ | — | · |: )/).map(part=>translatePart(part,locale)).join('');
 return text;
}
function translatePart(part:string,locale:Locale):string {
 if([' / ',' — ',' · ',': '].includes(part))return part;
 return translateText(part,locale);
}
export function translateValue<T>(value:T,locale:Locale):T {
 return (typeof value==='string'?translateText(value,locale):value) as T;
}
