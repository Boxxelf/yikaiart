import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const archive=JSON.parse(fs.readFileSync(new URL('../src/content/collection-archive.json',import.meta.url),'utf8'));
import { reviews } from '../src/content/reviews';

test('Reviews: every author, reader navigation, deep links and focus restoration', async ({page})=>{
 await page.goto('/reviews');
 await expect(page.locator('.review-index button')).toHaveCount(13);
 for(const review of reviews){
  await page.locator('.review-index').getByRole('button',{name:new RegExp(review.author)}).click();
  await expect(page.locator('.review-sheet-author h2')).toHaveText(review.author);
  await expect(page.locator('.review-sheet-body')).toContainText(review.quote??review.summary);
 }
 const open=page.getByRole('button',{name:'Read perspective'});
 await open.click();
 await expect(page.getByRole('dialog')).toContainText('Translated summary');
 await page.reload();
 await expect(page.getByRole('dialog')).toContainText('Liu Haisu');
 await page.getByRole('button',{name:'Next review in reader'}).click();
 await expect(page.getByRole('dialog')).toContainText('Tammi J. Schneider');
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await open.click(); await page.keyboard.press('Escape'); await expect(open).toBeFocused();
 await page.goto('/reviews?review=missing');
 await expect(page.getByRole('status')).toContainText('could not be found');
});

test('Collections: filters, full image, deep-link refresh and return focus',async({page})=>{
 await page.goto('/collections');
 await expect(page.locator('.holding-card')).toHaveCount(16);
 await expect(page.locator('.collection-document')).toHaveCount(10);
 for(const [name,count] of [['Museums & Universities',4],['Galleries',1],['Corporate & Hospitality',8],['Private',3]] as const){
  await page.getByRole('button',{name:new RegExp('^'+name)}).click();
  await expect(page.locator('.holding-card')).toHaveCount(count);
  await expect(page.locator('.collection-document')).toHaveCount(10);
 }
 await page.reload();await expect(page.locator('.holding-card')).toHaveCount(3);
 const opener=page.locator('.holding-card').first();await opener.click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Zoom image'}).click();
 await expect(page.getByRole('button',{name:'Fit image'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Next collection item'}).click();
 await expect(page.getByRole('button',{name:'Zoom image'})).toBeVisible();
 await page.reload();await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');await opener.click();await page.keyboard.press('Escape');await expect(opener).toBeFocused();
});

test('All ten supplied archive images have readable English captions and valid large assets',async({page})=>{
 for(const item of archive){
  await page.goto(`/collections?collection=${item.id}`);
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('heading',{level:1})).toHaveText(item.title);
  await expect(dialog.locator('.collection-description')).toHaveText(item.description);
  await expect.poll(()=>dialog.locator('img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  expect(await dialog.innerText()).not.toMatch(/[\u3400-\u9fff]/);
 }
 await page.goto('/collections?collection=missing');
 await expect(page.getByRole('status')).toContainText('could not be found');
});

test('Mobile menu, review selection and image reader fit narrow screens',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/reviews');
 const menu=page.getByRole('button',{name:'Menu'});await menu.click();
 await expect(page.getByRole('dialog',{name:'Site menu'}).getByRole('link')).toHaveCount(5);
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await page.keyboard.press('Escape');await expect(menu).toBeFocused();
 await page.getByRole('combobox').selectOption('alice-king');
 await expect(page.locator('.review-sheet')).toContainText('Translated summary');
 await page.screenshot({path:'test-results/reviews-mobile.png',fullPage:true});
 await menu.click();await page.getByRole('link',{name:'Collections',exact:true}).click();
 await expect(page.getByRole('dialog')).not.toBeVisible();
 await expect(page.getByRole('heading',{name:'Collections.',exact:true})).toBeVisible();
 await page.screenshot({path:'test-results/collections-mobile.png'});
 await page.locator('.collection-document').first().click();
 await expect(page.getByRole('dialog')).toContainText(archive[0].description);
 for(const width of [390,320]){await page.setViewportSize({width,height:844});expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);}
 await page.keyboard.press('Escape');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Editorial pages and readers have accessible English interfaces',async({page})=>{
 for(const route of ['/reviews','/collections','/reviews?review=david-pagel&read=1','/collections?collection=archive-mitch-miller']){
  await page.goto(route);await expect(page.locator('.editorial-page')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  expect(await page.locator('body').innerText()).not.toMatch(/[\u3400-\u9fff]/);
 }
});

test('Missing photographs preserve captions and permit browsing onward',async({page})=>{
 await page.route('**/collections/archive-mitch-miller-display.webp',route=>route.abort());
 await page.goto('/collections?collection=archive-mitch-miller');
 await expect(page.getByRole('dialog')).toContainText('Image unavailable');
 await expect(page.locator('.collection-description')).toHaveText(archive[0].description);
 await page.getByRole('button',{name:'Next collection item'}).click();
 await expect.poll(()=>page.getByRole('dialog').locator('img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
});
