import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { prepareWorks } from '../scripts/prepare-work-updates.mjs';
const base = JSON.parse(await fs.readFile(new URL('../src/content/works.json', import.meta.url), 'utf8'));
const sample = base.find(work => work.collectionId === 'now' && !work.featuredOrder && !work.displayTitle.includes('Fragmented Self'));
const photo = `data:image/png;base64,${(await sharp({create:{width:96,height:64,channels:3,background:'#994422'}}).png().toBuffer()).toString('base64')}`;
const packet = (id, image = photo) => ({version:1,id,displayTitle:'Owner update test',collectionId:'now',medium:'Oil on canvas',size:{height:27.5,width:35.5,unit:'in'},...(image ? {imageDataUrl:image} : {})});
async function fixture(t) {
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'yikai-upload-test-')); t.after(()=>fs.rm(root,{recursive:true,force:true}));
 await fs.mkdir(path.join(root,'src/content'),{recursive:true});await fs.mkdir(path.join(root,'content/works-updates'),{recursive:true});
 await fs.writeFile(path.join(root,'src/content/works.json'),JSON.stringify(base));return root;
}
async function save(root,p,name=`${p.id}.json`) {await fs.writeFile(path.join(root,'content/works-updates',name),JSON.stringify(p));}
test('new work generates images, updates total, and leaves base/Home unchanged',async t=>{
 const root=await fixture(t); await save(root,packet('work-owner-new'));const result=await prepareWorks(root);
 assert.equal(result.length,base.length+1);assert.equal(result.filter(w=>w.collectionId==='now').length,base.filter(w=>w.collectionId==='now').length+1);assert.equal(result[0].id,'work-owner-new');
 assert.deepEqual(result.filter(w=>w.featuredOrder),base.filter(w=>w.featuredOrder));assert.deepEqual(JSON.parse(await fs.readFile(path.join(root,'src/content/works.json'))),base);
 const work=result[0];assert.equal(work.image.originalAspectRatio,1.5);
 for(const key of ['thumbnail','medium','display']) assert((await fs.stat(path.join(root,'public',work.image[key]))).size>0);
 assert.equal(JSON.parse(await fs.readFile(path.join(root,'public/works-packets/work-owner-new.json'))).imageDataUrl,photo);
});
test('existing metadata-only edit keeps image and ID, accepts centimeters, is repeatable',async t=>{
 const root=await fixture(t);const p=packet(sample.id,null);p.size.unit='cm';p.collectionId='tibet';await save(root,p);
 const works=await prepareWorks(root);const edited=works.find(w=>w.id===sample.id);assert.equal(works.length,base.length);assert.equal(edited.image.display,sample.image.display);assert.equal(edited.dimensions,'27.5 × 35.5 cm');assert.equal(edited.collectionId,'tibet');assert.deepEqual(await prepareWorks(root),works);
});
test('image replacement uses new cache-safe URLs; repeated metadata edit retains encoded image',async t=>{
 const root=await fixture(t);const p=packet(sample.id);await save(root,p);const first=(await prepareWorks(root)).find(w=>w.id===sample.id);assert.notEqual(first.image.display,sample.image.display);
 const carried=JSON.parse(await fs.readFile(path.join(root,`public/works-packets/${sample.id}.json`)));carried.displayTitle='Corrected title';await save(root,carried);
 const second=(await prepareWorks(root)).find(w=>w.id===sample.id);assert.equal(second.image.display,first.image.display);assert.notEqual(second.updateRevision,first.updateRevision);assert.equal(second.displayTitle,'Corrected title');
});
test('rejects duplicate download suffix, missing photo, invalid values and unsafe IDs',async t=>{
 for(const [name,change,filename,expected] of [
 ['suffix',p=>p,'work-owner-new (1).json',/文件名/],
 ['missing',p=>{delete p.imageDataUrl;return p;},null,/缺少图片/],
 ['size',p=>{p.size.width=-1;return p;},null,/大于 0/],
 ['series',p=>{p.collectionId='unknown';return p;},null,/系列/],
 ['id',p=>{p.id='../escape';return p;},'bad.json',/编号/],
 ['image',p=>{p.imageDataUrl='data:image/svg+xml;base64,AA==';return p;},null,/JPG/],
 ['date',p=>{p.updatedAt='yesterday';return p;},null,/更新时间/],
 ['title',p=>{p.displayTitle='中文';return p;},null,/英文/],
 ]) await t.test(name,async t=>{const root=await fixture(t);const p=change(packet('work-owner-new'));await save(root,p,filename||`${p.id}.json`);await assert.rejects(prepareWorks(root),expected);});
});

test('new and replaced works sort by update time, independent of filename and build time',async t=>{
 const root=await fixture(t);
 await save(root,{...packet('work-zzz-older'),updatedAt:'2026-10-03T20:00:00Z'});
 await save(root,{...packet('work-aaa-newer'),updatedAt:'2026-10-03T22:00:00Z'});
 await save(root,{...packet(sample.id),updatedAt:'2026-10-03T23:00:00Z'});
 const first=await prepareWorks(root);
 assert.deepEqual(first.slice(0,3).map(w=>w.id),[sample.id,'work-aaa-newer','work-zzz-older']);
 assert.equal(first.filter(w=>w.id===sample.id).length,1);
 assert.deepEqual(await prepareWorks(root),first);
 await save(root,{...packet('work-zzz-older'),updatedAt:'2026-10-04T01:00:00Z'});
 assert.equal((await prepareWorks(root))[0].id,'work-zzz-older');
});
