import texts from './review-texts.json' with { type: 'json' };
import press from './press-archive.json' with { type: 'json' };
import scans from './press-scans.json' with { type: 'json' };
export const reviewSource='https://yikaistudio.com/reviews/';
export type ReviewScan={path:string;alt:string;caption:string;width:number;height:number};
export type Review={id:string;author:string;byline:string;year:number;role:string;language:string;paragraphs:string[];relatedArchive?:string;organization?:string;title?:string;intro?:string;scans?:ReviewScan[];textLabel?:string};
const organizations:Record<string,string>={
 'tammi-schneider':'Claremont Graduate University','alice-king':'Alisan Fine Arts','david-pagel':'Los Angeles Times','andi-campognone':'Museum of Art and History, Lancaster','robert-jacobson':'Minneapolis Institute of Arts','mary-abbe':'ARTnews','ruth-appelhof':'Minnesota Museum of American Art','dolly-fiterman':'Dolly Fiterman Fine Arts','stewart-turnquist':'Minneapolis Institute of Arts','susan-tai':'Santa Barbara Museum of Art'
};
const publicationNames:Record<string,string>={'archive-historic-preservation':'Historic Preservation','archive-gallery-guide-west':'Art Now Gallery Guide / West Coast','archive-china-times':'China Times Weekly','archive-gallery-guide-midwest':'Art Now Gallery Guide / Midwest'};
const scan=(n:number,caption:string):ReviewScan=>{const s=scans.find(x=>x.sourceFilename===`IMG_${n}.jpeg`)!;return {path:s.display,alt:caption,caption,width:s.width,height:s.height};};
export const reviews:Review[]=[
 ...texts.map(r=>({...r,organization:organizations[r.id],...(r.id==='mary-abbe'?{
  title:'Yi Kai at Dolly Fiterman',intro:'ARTnews / September 1999. Mary Abbe reviews an exhibition in Minneapolis, tracing the meeting of Chinese calligraphy, American symbols and the artist’s cultural roots.',
  scans:[scan(8042,'ARTnews, September 1999 — cover'),scan(8043,'Mary Abbe’s review of Yi Kai at Dolly Fiterman — opening'),scan(8044,'Mary Abbe’s review — continuation and byline')]
 }: {})})),
 ...press.map(p=>({id:p.id,author:publicationNames[p.id],organization:publicationNames[p.id],byline:publicationNames[p.id],year:Number(p.date),role:p.documentType,language:'en',title:p.title,paragraphs:[p.description],textLabel:'About this document',scans:[{path:p.image.display,alt:p.alt,caption:p.title,width:p.image.width,height:p.image.height}]})),
 {id:'asian-art-news',author:'John Millichap',organization:'Asian Art News',byline:'John Millichap',year:1998,role:'Asian Art News / September–October 1998 / pp. 73–75',language:'en',title:'The Spirit That Links',textLabel:'About this article',intro:'John Millichap on Yi Kai’s paintings and the connections between East and West.',paragraphs:[
  'Published in the September–October 1998 issue of Asian Art News, “The Spirit That Links” examines Yi Kai’s life and work in Minneapolis and his exploration of the relationships between Chinese and Western cultures.',
  'Millichap describes paintings that bring together Chinese characters, English words, fragments of symbols and broad fields of color. His discussion of the Words in the Mixture series considers how ideas of family, love, harmony and spirit recur across these different visual languages.',
  'The magazine’s cover and the complete three-page article are preserved here, including reproductions of Mixture Forever and other paintings. Select any page to read the original at a larger size.'
 ],scans:[scan(8045,'Asian Art News, September–October 1998 — cover'),scan(8046,'The Spirit That Links by John Millichap — page 73'),scan(8047,'The Spirit That Links — page 74'),scan(8048,'The Spirit That Links — page 75')]}
].sort((a,b)=>b.year-a.year);
export const reviewLabel=(review:Review)=>review.organization||review.author;
export const firstReview=reviews.find(r=>r.id==='mary-abbe')!;
