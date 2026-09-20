import fs from 'node:fs/promises';
import path from 'node:path';
const works=JSON.parse(await fs.readFile('src/content/works.json','utf8'));
const memories=JSON.parse(await fs.readFile('src/content/memories.json','utf8'));
const holdings=JSON.parse(await fs.readFile('src/content/holdings.json','utf8'));
const archive=JSON.parse(await fs.readFile('src/content/collection-archive.json','utf8'));
// Copy the validated catalogues, avoiding unreferenced sync-conflict duplicates.
// Originals and duplicate files on disk are left untouched.
const images=new Set([
 ...works.flatMap(w=>[w.image.thumbnail,w.image.medium,w.image.display]),
 ...memories.flatMap(m=>[m.image.thumbnail,m.image.display]),
 ...[...holdings,...archive].flatMap(m=>[m.image.thumbnail,m.image.display]),
]);
await fs.mkdir('dist',{recursive:true});
for(const entry of await fs.readdir('public',{withFileTypes:true})){
 if(['art','memories','collections'].includes(entry.name)||entry.name.startsWith('.'))continue;
 await fs.cp(path.join('public',entry.name),path.join('dist',entry.name),{recursive:true});
}
for(const image of images){
 const target=path.join('dist',image);
 await fs.mkdir(path.dirname(target),{recursive:true});
 await fs.copyFile(path.join('public',image),target);
}
console.log(`Copied ${images.size} catalogue images and the remaining public assets.`);
