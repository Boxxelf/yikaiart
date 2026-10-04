import fs from 'node:fs/promises';
import sharp from 'sharp';
import path from 'node:path';
const source=process.argv[2];
if(!source) throw Error('Pass the 1003 source folder.');
const read=async n=>JSON.parse(await fs.readFile(`src/content/${n}.json`,'utf8'));
const write=async(n,d)=>fs.writeFile(`src/content/${n}.json`,JSON.stringify(d,null,2)+'\n');
async function derivative(file,prefix,sizes){
 const bytes=await sharp(await fs.readFile(file)).rotate().toColourspace('srgb').toBuffer();
 const meta=await sharp(bytes).metadata(),image={width:meta.width,height:meta.height};
 for(const [key,size] of Object.entries(sizes)){
  image[key]=`${prefix}-${size}.webp`;await fs.mkdir(path.dirname(`public/${image[key]}`),{recursive:true});
  await sharp(bytes).resize({width:size,height:size,fit:'inside',withoutEnlargement:true}).webp({quality:90}).toFile(`public/${image[key]}`);
 }
 return {image,bytes};
}
let works=await read('works');
// Stable IDs for existing works preserve bookmarked links; new paintings get distinct IDs.
if(!works.some(w=>w.sourceFolder==='1003')){
 works=works.filter(w=>!/^now-the-fragmented-self-(6|7|8|9|10|11|12|13)$/.test(w.id));
 for(const w of works.filter(w=>w.displayTitle.startsWith('The Fragmented Self'))){
  const number=Number(w.displayTitle.match(/#(\d+)/)?.[1]??0)+1;
  w.displayTitle=`The Fragmented Self #${number}`;w.image.alt=`${w.displayTitle}, a work by Yi Kai in the NOW collection.`;
 }
 const additions=[];
 for(let n=6;n<=9;n++){
  const title=`The Fragmented Self #${n+1}`,id=`now-fragmented-self-1003-${n+1}`;
  const {image,bytes}=await derivative(path.join(source,`fragmentedself${n}.jpg`),`art/${id}`,{thumbnail:480,medium:960,display:1920});
  const placeholder=await sharp(bytes).resize({width:24}).webp({quality:35}).toBuffer();
  additions.push({id,sourceFilename:`fragmentedself${n}.jpg`,sourceFolder:'1003',collectionId:'now',displayTitle:title,image:{...image,originalAspectRatio:image.width/image.height,placeholder:`data:image/webp;base64,${placeholder.toString('base64')}`,alt:`${title}, a work by Yi Kai in the NOW collection.`}});
 }
 const end=works.findLastIndex(w=>w.displayTitle.startsWith('The Fragmented Self'));
 works.splice(end+1,0,...additions);await write('works',works);
}
let archive=await read('collection-archive');
const ids=['archive-historic-preservation','archive-gallery-guide-west','archive-china-times','archive-gallery-guide-midwest'];
let migrated=archive.filter(x=>ids.includes(x.id));
if(migrated.length){await write('press-archive',migrated);archive=archive.filter(x=>!ids.includes(x.id));}
for(const [id,file,title] of [['archive-shepherd-girl-certificate','牧羊姑娘.jpg','Shepherd Girl'],['archive-kashgar-certificate','Impressions of Id Kah Square.jpg','Impressions of Id Kah Square']]){
 const {image}=await derivative(path.join(source,file),`collections/${id}-artwork`,{thumbnail:680,display:1800});
 archive.find(x=>x.id===id).companion={title,alt:`${title}, the artwork shown alongside its exhibition certificate.`,sourceFilename:file,image};
}
await write('collection-archive',archive);
const scans=[];
for(let n=8042;n<=8048;n++){
 const {image}=await derivative(path.join(source,`IMG_${n}.jpeg`),`reviews/scan-${n}`,{thumbnail:680,display:2400});
 scans.push({sourceFilename:`IMG_${n}.jpeg`,...image});
}
await write('press-scans',scans);
console.log(`Imported 1003: ${works.length} works, 6 collection documents, 4 press documents, 7 magazine scans and 2 companion artworks.`);
