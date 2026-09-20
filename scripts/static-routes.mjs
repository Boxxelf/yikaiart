import fs from 'node:fs/promises';
import path from 'node:path';
const html = await fs.readFile('dist/index.html', 'utf8');
for (const route of ['works', 'about', 'memories', 'reviews', 'collections']) { await fs.mkdir(`dist/${route}`, {recursive:true}); await fs.writeFile(`dist/${route}/index.html`, html); }
await fs.writeFile('dist/404.html', html);
await fs.writeFile('dist/.nojekyll', '');
const biography = JSON.parse(await fs.readFile('src/content/biography.json', 'utf8'));
const escape = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await fs.writeFile('dist/biography.html', `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About Yi Kai</title><style>body{max-width:42em;margin:6vw auto;padding:24px;background:#FCFAF5;color:#181613;font:18px/1.8 Georgia,serif}a{color:inherit}h1{font-weight:400}</style><a href="./about">Return to the bookshelf</a><main><h1>About Yi Kai</h1><p>Chinese-American Contemporary Artist</p>${biography.slice(2).map(p=>`<p>${escape(p)}</p>`).join('')}</main></html>`);
console.log('Prepared Works/About/Memories/Reviews/Collections deep links, GitHub Pages fallback, and accessible text biography.');
