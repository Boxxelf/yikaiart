import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const photo='public/art/now-the-fragmented-self-5-480.webp';
async function fill(page: import('@playwright/test').Page) {
 const chooser=page.waitForEvent('filechooser'); await page.getByRole('button',{name:'选择作品照片',exact:true}).click(); await (await chooser).setFiles(photo);
 await page.getByLabel('英文作品名',{exact:true}).fill('Upload workflow test');
 await page.getByLabel('作品高度',{exact:true}).fill('27.5');await page.getByLabel('作品宽度',{exact:true}).fill('35.5');
 await page.getByRole('checkbox').check();
}
test('new artwork downloads one complete packet and exposes correct GitHub destination',async({page})=>{
 await page.goto('/works-editor');await fill(page);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'下载这件作品的更新文件'}).click();
 const file=await download;const packet=JSON.parse(await fs.readFile((await file.path())!,'utf8'));
 expect(Number.isFinite(Date.parse(packet.updatedAt))).toBe(true);expect(packet.displayTitle).toBe('Upload workflow test');expect(packet.size).toEqual({height:27.5,width:35.5,unit:'in'});expect(packet.imageDataUrl).toMatch(/^data:image\/jpeg;base64,/);expect(file.suggestedFilename()).toBe(`${packet.id}.json`);
 await expect(page.getByRole('link',{name:'打开 GitHub 上传页'})).toHaveAttribute('href','https://github.com/Boxxelf/yikaiart/upload/main/content/works-updates');
 await page.screenshot({path:'test-results/works-editor-publish.png',fullPage:true});
});
test('metadata edit keeps existing ID and image, missing image and duplicate title give clear errors',async({page})=>{
 await page.goto('/works-editor');await page.getByLabel('英文作品名',{exact:true}).fill('Missing image');await page.getByLabel('作品高度',{exact:true}).fill('20');await page.getByLabel('作品宽度',{exact:true}).fill('30');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'下载这件作品的更新文件'}).click();await expect(page.getByRole('alert')).toContainText('先选择一张照片');
 await fill(page);await page.getByLabel('英文作品名',{exact:true}).fill('The Fragmented Self #6');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'下载这件作品的更新文件'}).click();await expect(page.getByRole('alert')).toContainText('已有同名作品');
 await page.getByRole('radio',{name:'修改已有作品'}).check();await page.getByLabel('选择要修改的作品').selectOption('now-the-fragmented-self-5');await page.getByLabel('作品高度',{exact:true}).fill('20');await page.getByLabel('作品宽度',{exact:true}).fill('30');await expect(page.getByLabel('英文作品名',{exact:true})).toHaveValue('The Fragmented Self #6');await page.getByLabel('英文作品名',{exact:true}).fill('Corrected title');await page.getByRole('checkbox').check();const download=page.waitForEvent('download');await page.getByRole('button',{name:'下载这件作品的更新文件'}).click();const packet=JSON.parse(await fs.readFile((await(await download).path())!,'utf8'));expect(packet.id).toBe('now-the-fragmented-self-5');expect(packet.imageDataUrl).toBeUndefined();expect(packet.displayTitle).toBe('Corrected title');
});
test('replacement photo is packaged under the original ID',async({page})=>{
 await page.goto('/works-editor');await page.getByRole('radio',{name:'修改已有作品'}).check();await page.getByLabel('选择要修改的作品').selectOption('now-the-fragmented-self-5');await page.getByLabel('作品高度',{exact:true}).fill('20');await page.getByLabel('作品宽度',{exact:true}).fill('30');await page.getByLabel('作品照片（需要换图时再选）').setInputFiles(photo);await page.getByRole('checkbox').check();const download=page.waitForEvent('download');await page.getByRole('button',{name:'下载这件作品的更新文件'}).click();const packet=JSON.parse(await fs.readFile((await(await download).path())!,'utf8'));expect(packet.id).toBe('now-the-fragmented-self-5');expect(packet.imageDataUrl).toMatch(/^data:image\/jpeg/);
});
for(const width of [390,1440]) test(`editor is readable and accessible at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:960});await page.goto('/works-editor');await expect(page.getByRole('heading',{name:'作品更新助手',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const results=await new AxeBuilder({page}).include('.works-editor').withTags(['wcag2a','wcag2aa']).analyze();expect(results.violations).toEqual([]);
 await page.screenshot({path:`test-results/works-editor-${width}.png`,fullPage:true});
});

test('previously uploaded works retain the packet image on a later text edit',async({page})=>{
 test.skip(!process.env.EDITOR_FIXTURE,'Run with local owner-update fixtures; never publish the fixtures.');
 for(const id of ['work-editor-test-fixture','now-the-fragmented-self-5']) {
  await page.goto('/works-editor');await page.getByRole('radio',{name:'修改已有作品'}).check();await page.getByLabel('选择要修改的作品').selectOption(id);await expect(page.getByRole('status')).toHaveCount(0);
  const original=await(await page.request.get(`/works-packets/${id}.json`)).json();
  await page.getByLabel('英文作品名',{exact:true}).fill('Corrected after first upload');await page.getByRole('checkbox').check();const download=page.waitForEvent('download');await page.getByRole('button',{name:'下载这件作品的更新文件'}).click();const packet=JSON.parse(await fs.readFile((await(await download).path())!,'utf8'));expect(packet.id).toBe(id);expect(packet.imageDataUrl).toBe(original.imageDataUrl);
 }
 await page.goto('/works?series=now');await expect(page.locator('.archive-work')).toHaveCount(31);await expect(page.getByText('Local editor test fixture',{exact:true})).toBeVisible();
});
