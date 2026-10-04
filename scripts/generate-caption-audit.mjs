import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const records=JSON.parse(await fs.readFile('src/content/memories.json','utf8')).sort((a,b)=>a.checklistNumber-b.checklistNumber);
const out='docs/review-1003';
const assetRoot=process.argv[2]||'public';
await fs.mkdir(out,{recursive:true});
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pending=records.filter(m=>m.reviewStatus==='needs-confirmation');
const cards=[];
for(const m of records){
 const data=(await sharp(path.join(assetRoot,m.image.display)).resize({width:850,withoutEnlargement:true}).webp({quality:82}).toBuffer()).toString('base64');
 cards.push(`<article id="photo-${m.checklistNumber}"><div class="photo"><img src="data:image/webp;base64,${data}" alt="${escape(m.alt)}"></div><div class="copy"><p class="number">${String(m.checklistNumber).padStart(2,'0')} / 28 · ${m.year??'年份未注明'}</p><h2>${escape(m.title)}</h2><p>${escape(m.location)}</p><p class="caption" lang="en">${escape(m.description)}</p><p class="notes ${m.reviewStatus==='needs-confirmation'?'pending':''}">${escape(m.reviewNotes)}</p><small>${escape(m.sourceFilename)}</small><p class="status">${m.reviewStatus==='needs-confirmation'?'待确认手写内容':'已核对'}</p></div></article>`);
}
await fs.writeFile(path.join(out,'28-photo-audit.html'),`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yi Kai — 28 张照片复核</title><style>*{box-sizing:border-box}body{margin:0;background:#faf8f3;color:#29251f;font:16px/1.75 system-ui,sans-serif}header,main{max-width:1180px;margin:auto;padding:36px}header{padding-top:64px}h1{font-size:40px;font-weight:500;line-height:1.3}h2{font:30px/1.3 Georgia,serif}.number,small{color:#72695b;font-size:13px}header p{max-width:850px}article{display:grid;grid-template-columns:1fr 1fr;gap:40px;padding:38px 0;border-top:1px solid #ccc3b6;break-inside:avoid}.photo img{width:100%;max-height:520px;object-fit:contain}.caption{font:20px/1.7 Georgia,serif}.notes{background:#eee9df;padding:16px;font-size:14px}.pending{border-left:3px solid #a14b2f}.status{font-size:13px}a{color:inherit}li{margin:8px 0}@media(max-width:700px){header,main{padding:24px}article{grid-template-columns:1fr;gap:12px}h1{font-size:32px}}@media print{@page{size:A4;margin:16mm}body{background:white}header,main{padding:0}article{page-break-before:always;border:0;grid-template-columns:1fr;gap:8mm}.photo img{max-height:110mm}.caption{font-size:14pt}.notes{font-size:10pt}h2{font-size:20pt}}</style></head><body><header><p class="number">YI KAI / 1003 红笔清单复核</p><h1>28 张照片与介绍<br>逐张复核结果</h1><p>按您批注所用的 1–28 顺序排列，共 27 张照片及 1 张展览海报。图片与原核对 PDF、网站逐一比对。补充年份后仍保持原编号，方便继续对照。英文为本次网站图注，中文说明记录改动和待确认项；本次补充的 5 项已按您的确认更新；第 6 项采用与年份、馆长职务及“艾文”读音吻合的 Evan Maurer，依据记录在该项说明中。</p><p>待确认 ${pending.length} 项：</p><ul>${pending.map(m=>`<li><a href="#photo-${m.checklistNumber}">#${m.checklistNumber}</a> ${escape(m.reviewNotes)}</li>`).join('')}</ul><p>图片已嵌入本文件，可离线查看，也可使用浏览器打印或存为 PDF。</p></header><main>${cards.join('')}</main></body></html>`);
const fields=['红笔编号','原文件','年份','地点','网站英文标题','网站英文图注','复核说明','状态'];
const rows=records.map(m=>[m.checklistNumber,m.sourceFilename,m.year??'未注明',m.location,m.title,m.description,m.reviewNotes,m.reviewStatus==='needs-confirmation'?'待确认':'已核对']);
await fs.writeFile(path.join(out,'28-photo-audit.csv'),'\ufeff'+[fields,...rows].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n'));
console.log(`Created 28-photo audit; ${pending.length} pending clarifications.`);
