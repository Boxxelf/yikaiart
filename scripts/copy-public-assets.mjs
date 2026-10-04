import fs from 'node:fs/promises';
import path from 'node:path';
const works=JSON.parse(await fs.readFile('src/content/works.generated.json','utf8'));
const memories=JSON.parse(await fs.readFile('src/content/memories.json','utf8'));
const holdings=JSON.parse(await fs.readFile('src/content/holdings.json','utf8'));
const archive=JSON.parse(await fs.readFile('src/content/collection-archive.json','utf8'));
const press=JSON.parse(await fs.readFile('src/content/press-archive.json','utf8'));
const companions=archive.filter(x=>x.companion).map(x=>x.companion);
// Copy the validated catalogues, avoiding unreferenced sync-conflict duplicates.
// Originals and duplicate files on disk are left untouched.
const images=new Set([
 ...works.flatMap(w=>[w.image.thumbnail,w.image.medium,w.image.display]),
 ...memories.flatMap(m=>[m.image.thumbnail,m.image.display]),
 ...[...holdings,...archive,...press,...companions].flatMap(m=>[m.image.thumbnail,m.image.display]),
]);
await fs.mkdir('dist',{recursive:true});
// Read/write bytes explicitly: copyFile's macOS clone path can stall inside
// a File Provider-managed Documents directory, leaving zero-byte output files.
async function copyBytes(source, target) {
 const info = await fs.stat(source);
 if (info.isDirectory()) {
  await fs.mkdir(target, {recursive:true});
  for (const name of await fs.readdir(source)) await copyBytes(path.join(source,name),path.join(target,name));
 } else {
  await fs.writeFile(target, await fs.readFile(source));
 }
}
for(const entry of await fs.readdir('public',{withFileTypes:true})){
 if(['art','memories','collections'].includes(entry.name)||entry.name.startsWith('.'))continue;
 await copyBytes(path.join('public',entry.name),path.join('dist',entry.name));
}
const imagePaths = [...images];
for(let offset=0;offset<imagePaths.length;offset+=8){
 await Promise.all(imagePaths.slice(offset,offset+8).map(async image => {
  const target=path.join('dist',image);
  await fs.mkdir(path.dirname(target),{recursive:true});
  await copyBytes(path.join('public',image),target);
 }));
}
console.log(`Copied ${images.size} catalogue images and the remaining public assets.`);
