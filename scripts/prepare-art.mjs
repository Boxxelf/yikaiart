import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) throw new Error('Usage: npm run prepare:art -- /path/to/0910');
const groups = [
  ['now', '1. NOW', 26], ['robot-ai', '2. Robot AI', 18], ['opera-players', '3. Opera Players', 18],
  ['agree-to-disagree', '4. Flags- Agree to Disagree', 14], ['tibet', '5. Tibet', 18], ['land', '6. Land', 19],
];
const featured = ['The Fragmented Self  jpg.jpg', 'B1 Couple in Red 60x52.jpg', 'C1 Mickey Opera Players with Masker 60x120.jpg', 'D1 Symbolic Impression of America 50x80.jpg', 'E1 Monk Before Temple 40x36.png', 'F4 Our Garbage 51x76.jpg', 'A1 Debating One Voice 51x47.jpg', 'B7 Machinery Man in Red Yellow and Blue.jpg', 'C7 Fragmented Peking Opera Player 51x31.jpg', 'D7 Map in Transition 50x80.jpg', 'E17 Hands of Tibet Pilgrim #1 24x18.jpg', 'F16 Fish with Plastic #1 44x32.jpg'];
const slug = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fraction = str => {
  const clean = str.replace(/_/g, '/').trim();
  const m = clean.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  return m ? Number(m[1]) + Number(m[2]) / Number(m[3]) : Number(clean);
};
function metadata(filename) {
  let title = filename.replace(/\.[^.]+$/, '').replace(/\s+jpg$/i, '').replace(/^[A-F]\d+\s+/i, '').trim();
  const match = title.match(/\s+(\d+(?:\s+\d+[\/_]\d+)?)\s*[xX×]\s*(\d+(?:\s+\d+[\/_]\d+)?)\s*(ft)?$/);
  let dimensions;
  let dimensionSource;
  if (match) {
    const factor = match[3] ? 12 : 1;
    dimensions = `${fraction(match[1]) * factor} × ${fraction(match[2]) * factor} in`;
    dimensionSource = match[3] ? 'Filename explicitly states feet; converted to inches.' : 'Filename; units confirmed as inches by owner.';
    title = title.slice(0, match.index).trim();
  }
  title = title.replace(/\s+water color on paper$/i, '').replace(/_s\b/g, "’s").replace(/_$/g, '?').replace(/\s+/g, ' ').trim();
  return { displayTitle: title, dimensions, dimensionSource };
}
await fs.mkdir(path.join(root, '.cache'), { recursive: true });
await fs.mkdir(path.join(root, 'public/art'), { recursive: true });
await fs.mkdir(path.join(root, 'public/photos'), { recursive: true });
await fs.mkdir(path.join(root, 'src/content'), { recursive: true });
const works = [];
for (const [collectionId, folder, count] of groups) {
  const directory = path.join(source, 'Selected Works', folder);
  const files = (await fs.readdir(directory)).filter(f => /\.(jpg|jpeg|png|psd)$/i.test(f)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  if (files.length !== count) throw new Error(`Expected ${count} in ${folder}, found ${files.length}`);
  for (const filename of files) {
    const meta = metadata(filename);
    const id = `${collectionId}-${slug(filename.replace(/\.[^.]+$/, ''))}`;
    let input = path.join(directory, filename);
    if (/\.psd$/i.test(filename)) {
      const png = path.join(root, '.cache', id + '.png');
      execFileSync('/usr/bin/sips', ['-s', 'format', 'png', input, '--out', png], { stdio: 'pipe' });
      input = png;
    }
    const oriented = await sharp(input, { limitInputPixels: false }).rotate().toColourspace('srgb').toBuffer();
    const info = await sharp(oriented).metadata();
    const base = `art/${id}`;
    for (const size of [480, 960, 1920]) {
      const target = path.join(root, 'public', `${base}-${size}.webp`);
      await sharp(oriented).resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true }).webp({ quality: size === 1920 ? 90 : 83, effort: 4 }).toFile(target);
    }
    const tiny = await sharp(oriented).resize({ width: 24, height: 24, fit: 'inside' }).webp({ quality: 45 }).toBuffer();
    works.push({ id, sourceFilename: filename, sourceFolder: folder, collectionId, ...meta, image: { thumbnail: `${base}-480.webp`, medium: `${base}-960.webp`, display: `${base}-1920.webp`, width: info.width, height: info.height, originalAspectRatio: info.width / info.height, placeholder: `data:image/webp;base64,${tiny.toString('base64')}`, alt: `${meta.displayTitle}, a work by Yi Kai in the ${folder.replace(/^\d+\.\s*/, '')} collection.` }, ...(featured.includes(filename) ? { featuredOrder: featured.indexOf(filename) + 1 } : {}) });
  }
  console.log(`Prepared ${count} works: ${folder}`);
}
if (works.length !== 113 || works.filter(w => w.featuredOrder).length !== 12) throw new Error('Catalogue count mismatch');
await fs.writeFile(path.join(root, 'src/content/works.json'), JSON.stringify(works, null, 2) + '\n');
for (const filename of ['IMG_7587.jpg', 'IMG_7581.jpg']) {
  await sharp(path.join(source, 'Photos of Openings', filename)).rotate().resize({ width: 1600, withoutEnlargement: true }).toColourspace('srgb').webp({ quality: 88 }).toFile(path.join(root, 'public/photos', filename.replace('.jpg', '.webp')));
}
const biography = (await fs.readFile(path.join(source, 'About Yi Kai.txt'), 'utf8')).replace(/^\uFEFF/, '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
await fs.writeFile(path.join(root, 'src/content/biography.json'), JSON.stringify(biography, null, 2) + '\n');
console.log(`Ready: ${works.length} works, ${works.filter(w => !w.dimensions).length} without filename dimensions. Source files unchanged.`);
