import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/import-0929.mjs /path/to/0929');
const cataloguePath = new URL('../src/content/works.json', import.meta.url);
const publicPath = new URL('../public/', import.meta.url);
const works = JSON.parse(await fs.readFile(cataloguePath, 'utf8'));
const additions = [];
for (let number = 6; number <= 13; number++) {
  const sourceFilename = `The Fragmented self${number}.jpg`;
  const id = `now-the-fragmented-self-${number}`;
  const displayTitle = `The Fragmented Self #${number}`;
  const input = await sharp(path.join(source, sourceFilename)).rotate().toColourspace('srgb').toBuffer();
  const { width, height } = await sharp(input).metadata();
  const base = `art/${id}`;
  for (const size of [480, 960, 1920]) {
    await sharp(input).resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true }).webp({ quality: size === 1920 ? 90 : 83 }).toFile(new URL(`${base}-${size}.webp`, publicPath).pathname);
  }
  const tiny = await sharp(input).resize({ width: 24, height: 24, fit: 'inside' }).webp({ quality: 45 }).toBuffer();
  additions.push({ id, sourceFilename, sourceFolder: '0929', collectionId: 'now', displayTitle, medium: 'Oil on canvas', dimensions: '27.5 × 35.5 in', dimensionSource: 'Artist-provided September 29 update; inches.', image: { thumbnail: `${base}-480.webp`, medium: `${base}-960.webp`, display: `${base}-1920.webp`, width, height, originalAspectRatio: width / height, placeholder: `data:image/webp;base64,${tiny.toString('base64')}`, alt: `${displayTitle}, oil on canvas by Yi Kai, 27.5 × 35.5 inches.` } });
}
const existing = works.filter(w => !additions.some(a => a.id === w.id));
const corrected = existing.find(w => w.id === 'now-the-fragmented-self-3a');
if (corrected) { corrected.displayTitle = 'The Fragmented Self #3'; corrected.image.alt = 'The Fragmented Self #3, a work by Yi Kai in the NOW collection.'; }
// Keep existing artwork URLs and feature order stable. New works lead the NOW archive.
await fs.writeFile(cataloguePath, JSON.stringify([...additions, ...existing], null, 2) + '\n');
console.log('Imported eight paintings and corrected The Fragmented Self #3.');
