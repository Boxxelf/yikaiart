import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const read=async name=>JSON.parse(await fs.readFile(`src/content/${name}.json`,'utf8'));
const holdings=await read('holdings'), collectionArchive=await read('collection-archive'), press=await read('press-archive'), archive=[...collectionArchive,...press];
assert.equal(collectionArchive.length,6);assert.equal(press.length,4);
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
for(const item of collectionArchive.filter(x=>x.companion)){
 for(const size of ['thumbnail','display']){const m=await sharp(await fs.readFile(`public/${item.companion.image[size]}`)).metadata();assert.ok(m.width&&m.height);}
}
assert.equal(collectionArchive.filter(x=>x.companion).length,2);
const scans=await read('press-scans');assert.equal(scans.length,7);
for(const s of scans){const m=await sharp(await fs.readFile(`public/${s.display}`)).metadata();assert.ok(m.width&&m.height);}
const feature=await read('la-times');assert.equal(feature.photos.length,17);assert.ok(feature.paragraphs.length>=30);
for(const p of feature.photos){const m=await sharp(await fs.readFile(`public/${p.path}`)).metadata();assert.ok(m.width&&m.height);}
assert.ok((await fs.stat('public/documents/la-times-2025.pdf')).size>0);
console.log('Validated collections, migrated press, companion artworks, magazine scans and the LA Times feature.');
const reviewImages=await read('review-images');
assert.equal(reviewImages.length,13);
assert.equal(new Set(reviewImages.map(i=>i.id)).size,13);
for(const image of reviewImages){assert.match(image.path,/^reviews\/[a-z0-9-]+\.webp$/);const meta=await sharp(await fs.readFile(`public/${image.path}`)).metadata();assert.ok(meta.width>0&&meta.height>0);}
console.log('Validated all 13 locally hosted review images.');

const reviewTexts=await read('review-texts');
assert.equal(reviewTexts.length,13);
assert.deepEqual(reviewTexts.map(r=>r.id).sort(),reviewImages.map(i=>i.id).sort());
assert.equal(reviewTexts.reduce((count,r)=>count+r.paragraphs.length,0),26);
for(const review of reviewTexts){
 assert.ok(review.author&&review.byline&&review.role&&review.year&&review.language,review.id);
 assert.ok(review.paragraphs.every(p=>typeof p==='string'&&p.trim().length>0),review.id);
 assert.ok(!('summary' in review),review.id);
}
console.log('Validated 13 complete supplied reviews, 26 paragraphs, original bylines and image mappings.');
