import type { Chapter } from '../../content/about';
const cache = new Map<string, HTMLCanvasElement>();
function random(seed: number) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; }; }
export function bookSurface(chapter: Chapter, kind: 'cover' | 'spine' | 'inside' = 'cover') {
  const key = `${chapter.id}-${kind}`;
  if (cache.has(key)) return cache.get(key)!;
  const canvas = document.createElement('canvas');
  canvas.width = kind === 'spine' ? Math.round(chapter.width / chapter.height * 1250) : 840;
  canvas.height = kind === 'spine' ? 1250 : 1160;
  const w = canvas.width, h = canvas.height, ctx = canvas.getContext('2d')!;
  const rand = random(Number(chapter.number) * 3571 + (kind === 'cover' ? 997 : 12));
  const base = kind === 'inside' ? '#F3EADB' : chapter.color;
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  // Irregular pigment density and fine surface fibres. Texture never covers an artwork.
  const pixels = ctx.getImageData(0, 0, w, h);
  const cloth = chapter.material === 'cloth' && kind !== 'inside';
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = (y * w + x) * 4;
    const weave = cloth ? Math.sin(x * 2.1) * 4 + Math.cos(y * 2.4) * 4 + ((x % 4 < 2) !== (y % 4 < 2) ? 2 : -2) : 0;
    const grain = (rand() - .5) * (cloth ? 15 : 11) + weave + Math.sin(x * .038 + Math.sin(y * .004)) * 1.6 + Math.cos(y * .019) * 1.8;
    for (let c = 0; c < 3; c++) pixels.data[p + c] = Math.min(255, Math.max(0, pixels.data[p + c] + grain));
  }
  ctx.putImageData(pixels, 0, 0);
  ctx.lineWidth = .65;
  for (let i = 0; i < 1300; i++) { const x = rand() * w, y = rand() * h; ctx.strokeStyle = rand() > .5 ? 'rgba(255,255,240,.14)' : 'rgba(31,22,12,.075)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rand() * 18, y + rand() * 3); ctx.stroke(); }
  if (kind !== 'inside') {
    if (chapter.id === 'origin') { ctx.fillStyle = '#33312c'; ctx.globalAlpha = .88; ctx.fillRect(0, h * .75, w, h * .25); ctx.globalAlpha = 1; }
    if (chapter.id === 'study') { ctx.fillStyle = 'rgba(65,86,100,.21)'; ctx.fillRect(0, h * .72, w, h * .28); ctx.fillStyle = '#B94132'; ctx.fillRect(w * .72, 0, Math.max(2, w * .005), h); }
    if (chapter.id === 'crossing') { ctx.fillStyle = '#183F72'; ctx.fillRect(w * .08, h * .62, w * .84, h * .38); ctx.fillStyle = 'rgba(244,240,226,.4)'; ctx.fillRect(w * .02, 0, w * .93, h * .98); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.strokeRect(w * .025, 3, w * .93, h - 8); }
    if (chapter.id === 'dialogue') { ctx.fillStyle = '#B94132'; ctx.fillRect(w * .7, 0, w * .19, h * .105); }
    if (chapter.id === 'hand') { ctx.strokeStyle = 'rgba(241,231,210,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w * .23, h * .83); ctx.lineTo(w * .77, h * .83); ctx.stroke(); }
    if (chapter.id === 'unresolved') { ctx.fillStyle = 'rgba(137,144,120,.3)'; ctx.fillRect(0, h * .62, w * .7, h * .38); for (let i = 0; i < 35; i++) { ctx.fillStyle = `rgba(137,144,120,${rand() * .2})`; ctx.fillRect(w * .7 - rand() * 20, h * .62 + rand() * h * .38, rand() * 34, rand() * 15); } }
    if (chapter.id === 'index') { ctx.fillStyle = '#B94132'; ctx.fillRect(w * .05, h * .77, w * .55, h * .075); }
  }
  // Scuffed edges and a narrow indentation at the binding.
  for (let i = 0; i < 700; i++) { ctx.fillStyle = cloth ? `rgba(248,234,209,${rand() * .18})` : `rgba(100,80,51,${rand() * .12})`; const x = rand() > .5 ? rand() * 7 : w - rand() * 7; ctx.fillRect(x, rand() * h, rand() * 3, rand() * 14); }
  ctx.strokeStyle = cloth ? 'rgba(242,229,199,.22)' : 'rgba(85,65,40,.18)'; ctx.lineWidth = 1; ctx.strokeRect(3, 2, w - 6, h - 4);
  ctx.fillStyle = kind === 'inside' ? '#181613' : chapter.ink;
  if (kind === 'spine') {
    ctx.textAlign = 'center'; ctx.font = '400 29px "Instrument Sans Variable", sans-serif'; ctx.fillText(chapter.number, w / 2, h * .125);
    ctx.save(); ctx.translate(w / 2, h * .51); ctx.rotate(-Math.PI / 2);
    ctx.font = `500 ${chapter.id === 'unresolved' ? 34 : 40}px "Instrument Sans Variable", sans-serif`;
    ctx.letterSpacing = '7px'; ctx.fillText(chapter.spine, 0, 0); ctx.restore();
    ctx.font = '400 19px "Instrument Sans Variable", sans-serif'; ctx.fillStyle = chapter.id === 'origin' ? '#F3EADB' : chapter.ink; ctx.fillText('YI KAI', w / 2, h * .94);
  } else if (kind === 'cover') {
    const inset = 73;
    ctx.textAlign = 'left'; ctx.font = '400 22px "Instrument Sans Variable", sans-serif'; ctx.fillText(`YI KAI     /     ${chapter.number}`, inset, 92);
    ctx.font = `${chapter.id === 'unresolved' ? '400 133px' : '400 85px'} "Source Serif 4 Variable", Georgia, serif`;
    ctx.fillText(chapter.cover[0], inset, h * .32, w - inset * 2);
    ctx.font = '500 26px "Instrument Sans Variable", sans-serif'; ctx.fillText(chapter.cover[1], inset, h * .38, w - inset * 2);
    ctx.font = '400 20px "Instrument Sans Variable", sans-serif'; ctx.fillText(chapter.subtitle, inset, h * .53, w - inset * 2);
    ctx.fillStyle = chapter.id === 'origin' ? '#F3EADB' : chapter.ink; ctx.font = '400 17px "Instrument Sans Variable", sans-serif'; ctx.fillText('A LIFE IN PAINTING', inset, h * .93);
  } else {
    ctx.font = '400 25px "Instrument Sans Variable", sans-serif'; ctx.fillText(chapter.number, 80, 95);
    ctx.font = '400 55px "Source Serif 4 Variable", Georgia, serif'; ctx.fillText(chapter.title, 80, 265, w - 160);
    ctx.font = '400 23px "Instrument Sans Variable", sans-serif'; ctx.fillText(chapter.subtitle, 80, 330, w - 160);
    let y = 490; ctx.font = '400 28px "Source Serif 4 Variable", Georgia, serif'; let line = '';
    for (const word of chapter.excerpt.split(' ')) { if (ctx.measureText(line + word).width > w - 160) { ctx.fillText(line, 80, y); line = ''; y += 47; } line += `${word} `; } ctx.fillText(line, 80, y);
  }
  cache.set(key, canvas); return canvas;
}
