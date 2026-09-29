import type { Chapter } from '../../content/about';
const cache = new Map<string, HTMLCanvasElement>();
function random(seed: number) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; }; }

// Wear follows the places a book is touched: joints, corners and exposed edges.
// Keep it deterministic so the mobile cover and the physical book are identical.
function ageSurface(ctx: CanvasRenderingContext2D, chapter: Chapter, kind: string) {
  const { width: w, height: h } = ctx.canvas;
  const rand = random(Number(chapter.number) * 7919 + kind.length);
  const cloth = chapter.material === 'cloth' && kind !== 'inside';
  const inside = kind === 'inside';
  ctx.save();
  // Broad, low-contrast variations, without a repeated grunge image or vignette.
  for (let i = 0; i < 26; i++) {
    const x = rand() * w, y = rand() * h, radius = w * (.1 + rand() * .35);
    const wash = ctx.createRadialGradient(x, y, 0, x, y, radius);
    wash.addColorStop(0, cloth ? `rgba(237,221,183,${.012 + rand() * .026})` : `rgba(111,76,35,${.008 + rand() * .022})`);
    wash.addColorStop(1, 'rgba(111,76,35,0)');
    ctx.fillStyle = wash; ctx.fillRect(0, 0, w, h);
  }
  // Bleached cloth and oxidised paper at the fore-edge; a darker recessed joint.
  const edge = ctx.createLinearGradient(w, 0, w - w * .065, 0);
  edge.addColorStop(0, cloth ? 'rgba(234,217,181,.27)' : 'rgba(112,73,30,.18)');
  edge.addColorStop(.25, cloth ? 'rgba(234,217,181,.09)' : 'rgba(112,73,30,.055)');
  edge.addColorStop(1, 'rgba(112,73,30,0)');
  ctx.fillStyle = edge; ctx.fillRect(w * .935, 0, w * .065, h);
  if (!inside) {
    const jointX = kind === 'spine' ? w * .09 : w * .035;
    const joint = ctx.createLinearGradient(0, 0, jointX * 2.4, 0);
    joint.addColorStop(0, 'rgba(36,27,17,.14)');
    joint.addColorStop(.36, 'rgba(255,245,220,.1)');
    joint.addColorStop(.51, 'rgba(36,27,17,.2)');
    joint.addColorStop(.7, 'rgba(255,245,220,.07)');
    joint.addColorStop(1, 'rgba(36,27,17,0)');
    ctx.fillStyle = joint; ctx.fillRect(0, 0, jointX * 2.4, h);
  }
  // Irregular exposed fibres taper away from the four corners.
  for (const [cx, cy] of [[0, 0], [w, 0], [0, h], [w, h]]) {
    const reach = (inside ? .025 : .045 + rand() * .035) * Math.min(w, h);
    const sx = cx ? -1 : 1, sy = cy ? -1 : 1;
    for (let i = 0; i < 160; i++) {
      const along = rand() * reach, depth = Math.pow(rand(), 3) * (1 - along / reach) * reach * .23;
      const horizontal = rand() > .5;
      const x = cx + sx * (horizontal ? along : depth), y = cy + sy * (horizontal ? depth : along);
      ctx.strokeStyle = `rgba(242,228,197,${.08 + rand() * (cloth ? .43 : .27)})`;
      ctx.lineWidth = .5 + rand() * 1.8; ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + sx * (horizontal ? 2 + rand() * 8 : rand() * 2), y + sy * (horizontal ? rand() * 2 : 2 + rand() * 8)); ctx.stroke();
    }
  }
  // Small breaks in the printed surface, concentrated at top and bottom edges.
  for (let i = 0; i < 900; i++) {
    const x = rand() * w, band = Math.pow(rand(), 4) * h * .025;
    const y = rand() > .5 ? band : h - band;
    ctx.fillStyle = `rgba(239,225,195,${rand() * (cloth ? .3 : .19)})`;
    ctx.fillRect(x, y, .5 + rand() * 4, .4 + rand() * 2);
  }
  ctx.restore();
}

// Unprinted surface relief keeps letters from looking embossed or engraved.
export function bookRelief(chapter: Chapter) {
  const key = `${chapter.id}-relief`;
  if (cache.has(key)) return cache.get(key)!;
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 384;
  const ctx = canvas.getContext('2d')!, pixels = ctx.createImageData(256, 384);
  const rand = random(Number(chapter.number) * 3571);
  for (let y = 0; y < 384; y++) for (let x = 0; x < 256; x++) {
    const p = (y * 256 + x) * 4;
    const weave = chapter.material === 'cloth' ? Math.sin(x * Math.PI / 2) * 18 + Math.cos(y * Math.PI / 2) * 18 : 0;
    const value = 128 + weave + (rand() - .5) * 24;
    pixels.data[p] = pixels.data[p + 1] = pixels.data[p + 2] = value; pixels.data[p + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0); cache.set(key, canvas); return canvas;
}
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
  ageSurface(ctx, chapter, kind);
  cache.set(key, canvas); return canvas;
}
