import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const read=async name=>JSON.parse(await fs.readFile(`src/content/${name}.json`,'utf8'));
const holdings=await read('holdings'), archive=await read('collection-archive');
assert.equal(holdings.length,16);assert.equal(archive.length,10);
const items=[...holdings,...archive];assert.equal(new Set(items.map(i=>i.id)).size,26);
assert.deepEqual(archive.map(i=>i.sourceFilename).sort(),Array.from({length:10},(_,i)=>`${182+i}.jpg`));
const assets=new Set();
for(const item of items){
 assert.ok(item.title&&item.alt&&item.image.width>0&&item.image.height>0,item.id);
 assert.doesNotMatch([item.title,item.description,item.collector,item.location,item.alt].join(' '),/[\u3400-\u9fff]/,item.id);
 if(item.kind==='archive')assert.ok(item.description.length>120,item.id);
 else assert.ok(item.collector&&item.sourceImage.startsWith('https://yikaistudio.com/'),item.id);
 for(const size of ['thumbnail','display']){
  const asset=item.image[size];assert.match(asset,/^collections\/[a-z0-9-]+\.webp$/);assert.ok(!assets.has(asset));assets.add(asset);
  const meta=await sharp(await fs.readFile(`public/${asset}`)).metadata();assert.ok(meta.width>0&&meta.height>0);
  assert.ok(Math.max(meta.width,meta.height)<=(size==='thumbnail'?680:1800));
 }
}
console.log('Validated 16 collection records, 10 English archive descriptions and 52 image assets.');
