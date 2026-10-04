import fs from 'node:fs/promises';
import path from 'node:path';
const html = await fs.readFile('dist/index.html', 'utf8');
for (const route of ['works-editor', 'works', 'about', 'memories', 'reviews', 'collections']) { await fs.mkdir(`dist/${route}`, {recursive:true}); await fs.writeFile(`dist/${route}/index.html`, html); }
await fs.writeFile('dist/404.html', html);
await fs.writeFile('dist/.nojekyll', '');
const biography = JSON.parse(await fs.readFile('src/content/biography.json', 'utf8'));
const escape = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const traditional = JSON.parse(await fs.readFile('src/i18n/zh-Hant.json', 'utf8'));
for (const locale of ['en','zh-Hant']) {
 const zh=locale==='zh-Hant';
 const t=text=>zh?(traditional[text.replace(/\s+/g,' ').trim()]??text):text;
 await fs.writeFile(zh?'dist/biography.zh-Hant.html':'dist/biography.html', `<!doctype html><html lang="${locale}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t('About Yi Kai')}</title><style>body{max-width:42em;margin:6vw auto;padding:24px;background:#FCFAF5;color:#181613;font:18px/1.9 Georgia,"Songti TC",serif}a{color:inherit}h1{font-weight:400}nav{display:flex;justify-content:space-between;gap:20px}</style><nav><a href="./about?lang=${locale}">${t('Return to the bookshelf')}</a><a lang="${zh?'en':'zh-Hant'}" href="./${zh?'biography.html':'biography.zh-Hant.html'}">${zh?'English':'繁體中文'}</a></nav><main><h1>${t('About Yi Kai')}</h1><p>${t('Chinese-American Contemporary Artist')}</p>${biography.slice(2).map(p=>`<p>${escape(t(p))}</p>`).join('')}</main></html>`);
}
console.log('Prepared deep links, GitHub Pages fallback, and English / Traditional Chinese text biographies.');
