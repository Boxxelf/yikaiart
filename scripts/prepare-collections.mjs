import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const [remoteDir,additionalDir]=process.argv.slice(2);
if(!remoteDir||!additionalDir)throw new Error('Pass the downloaded source directory and additional-photo directory.');
const sourceImages=JSON.parse(await fs.readFile(path.join(remoteDir,'images.json'),'utf8'));
await fs.mkdir('public/collections',{recursive:true});
for(const name of ['holdings','collection-archive']){
 const items=JSON.parse(await fs.readFile(`src/content/${name}.json`,'utf8'));
 for(const item of items){
  const source=item.kind==='holding'?path.join(remoteDir,(await fs.readdir(remoteDir)).find(n=>n.startsWith(`collection-${String(item.sourceIndex).padStart(2,'0')}.`))):path.join(additionalDir,item.sourceFilename);
  const original=await sharp(source).rotate().toBuffer();const metadata=await sharp(original).metadata();
  const thumbnail=`collections/${item.id}-thumb.webp`,display=`collections/${item.id}-display.webp`;
  await sharp(original).resize({width:680,height:680,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toFile(`public/${thumbnail}`);
  await sharp(original).resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:91}).toFile(`public/${display}`);
  item.image={thumbnail,display,width:metadata.width,height:metadata.height};
  if(item.kind==='holding')item.sourceImage=sourceImages[item.sourceIndex-1].downloadUrl||sourceImages[item.sourceIndex-1].src;
 }
 await fs.writeFile(`src/content/${name}.json`,JSON.stringify(items,null,2)+'\n');
}
console.log('Prepared 16 collection artworks and 10 additional archive photographs.');
