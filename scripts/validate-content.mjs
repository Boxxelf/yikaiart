import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const works = JSON.parse(fs.readFileSync('src/content/works.json', 'utf8'));
assert.equal(works.length, 113);
assert.equal(new Set(works.map(w => w.id)).size, 113);
const counts = { now: 26, 'robot-ai': 18, 'opera-players': 18, 'agree-to-disagree': 14, tibet: 18, land: 19 };
for (const [id, count] of Object.entries(counts)) assert.equal(works.filter(w => w.collectionId === id).length, count);
const featured = works.filter(w => w.featuredOrder).sort((a,b) => a.featuredOrder - b.featuredOrder);
assert.deepEqual(featured.map(w => w.featuredOrder), Array.from({length:12}, (_,i) => i+1));
assert.equal(featured[0].sourceFilename, 'The Fragmented Self  jpg.jpg');
for (const work of works) {
  assert(work.displayTitle && work.image.alt && work.image.originalAspectRatio > 0);
  if (work.dimensions) assert.match(work.dimensions, /^\d+(\.\d+)? × \d+(\.\d+)? in$/);
  for (const key of ['thumbnail','medium','display']) assert(fs.statSync(path.join('public', work.image[key])).size > 0, work.image[key]);
  assert(!/[\u3400-\u9FFF]/.test(work.displayTitle));
}
const fractional = works.find(w => w.sourceFilename === 'E12 Pilgrim 15 1_2 x 13.jpg');
assert.equal(fractional.dimensions, '15.5 × 13 in');
assert.equal(works.find(w => /D2 Mixture/.test(w.sourceFilename)).dimensions, '96 × 120 in');
assert.equal(works.filter(w => /\.psd$/i.test(w.sourceFilename)).length, 5);
console.log('Validated 113 works, six collection totals, 12 featured works, five PSD derivatives, inches and fractional dimensions, and 339 image files.');
