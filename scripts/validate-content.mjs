import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { collectionIds } from './prepare-work-updates.mjs';
const works = JSON.parse(fs.readFileSync('src/content/works.generated.json', 'utf8'));
assert(works.length > 0);
assert.equal(new Set(works.map(w => w.id)).size, works.length);
const featured = works.filter(w => w.featuredOrder).sort((a,b) => a.featuredOrder - b.featuredOrder);
assert.deepEqual(featured.map(w => w.featuredOrder), Array.from({length:12}, (_,i) => i+1));
for (const work of works) {
  assert(collectionIds.includes(work.collectionId));
  assert(work.displayTitle && work.image.alt && work.image.originalAspectRatio > 0);
  if (work.dimensions) assert.match(work.dimensions, /^\d+(\.\d+)? × \d+(\.\d+)? (in|cm)$/);
  for (const key of ['thumbnail','medium','display']) {
    assert.match(work.image[key], /^art\/[a-z0-9/.-]+\.webp$/i);
    assert(!work.image[key].includes('..'));
    assert(fs.statSync(path.join('public', work.image[key])).size > 0, work.image[key]);
  }
  assert(!/[\u3400-\u9FFF]/.test(work.displayTitle));
}
console.log(`Validated ${works.length} works, six collection IDs, 12 Home selections, dimensions and ${works.length * 3} image references.`);
