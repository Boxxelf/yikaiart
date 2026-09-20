import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const source = process.argv[2];
if (!source) throw new Error('Supply the Photos of Openings directory.');
const memories = JSON.parse(await fs.readFile('src/content/memories.json', 'utf8'));
await fs.mkdir('public/memories', { recursive: true });
for (const memory of memories) {
  const input = path.join(source, memory.sourceFilename);
  for (const [key, size] of [['thumbnail', 400], ['display', 1600]]) {
    await sharp(input).rotate().resize({width:size,height:size,fit:'inside',withoutEnlargement:true}).toColourspace('srgb').webp({quality:key==='thumbnail'?78:88}).toFile(path.join('public', memory.image[key]));
  }
}
console.log(`Prepared ${memories.length} memories, 60 images; originals unchanged.`);
