import fs from 'node:fs/promises';
const memories = JSON.parse(await fs.readFile('src/content/memories.json','utf8'));
if(memories.length!==28 || new Set(memories.map(m=>m.id)).size!==28) throw new Error('Expected 28 unique memories.');
for(const [kind,total] of [['photo',27],['exhibition-material',1]]) if(memories.filter(m=>m.kind===kind).length!==total)throw new Error(`Incorrect ${kind} count.`);
for(const m of memories){
 if(!m.description||!m.descriptionOriginal||!m.sourceFilename||!m.alt)throw new Error(`Missing content for ${m.id}`);
 if(/[\u3400-\u9fff]/u.test([m.title,m.description,m.location,m.alt].join(' ')))throw new Error(`Non-English display copy for ${m.id}`);
 for(const key of ['thumbnail','display'])await fs.access(`public/${m.image[key]}`);
}
console.log('Validated 28 memory records, original captions, two categories, and 56 images.');
