import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.argv[2]?.replace(/\/$/,'');
if(!base)throw Error('Pass the complete site base URL.');
const reviews=JSON.parse(await fs.readFile(new URL('../src/content/review-texts.json',import.meta.url),'utf8'));
const browser=await chromium.launch({channel:'chrome',args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),failures=[];
 page.on('pageerror',e=>failures.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))failures.push(`${r.status()} ${r.url()}`);});
 await page.goto(`${base}/reviews/`);await page.locator('.review-index').waitFor();
 for(const review of reviews){
  await page.locator('.review-index').getByRole('button',{name:new RegExp(review.author)}).click();
  await expect(page.locator('.review-article-text > p')).toHaveText(review.paragraphs);
  await page.waitForFunction(()=>{const i=document.querySelector('.review-portrait img');return i?.complete&&i.naturalWidth>0;});
 }
 await page.goto(`${base}/reviews/?review=david-pagel&read=1`);
 const reader=page.getByRole('dialog');await reader.waitFor();await reader.evaluate(el=>el.scrollTo(0,600));
 const bar=await reader.locator('.editorial-dialog-top').boundingBox();assert.equal(bar.y,0);assert.equal(bar.x,0);
 assert(await reader.locator('.editorial-dialog-top').evaluate(el=>el.contains(document.elementFromPoint(innerWidth/2,2))));
 assert.equal(await page.locator('a[href*="yikaistudio.com"]').count(),0);
 await page.goto(`${base}/about/`);await page.locator('.artist-profile').waitFor();assert.equal(await page.locator('.career-records li').count(),90);
 assert.equal(await page.locator('.about-page').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(252, 250, 245)');
 await page.goto(`${base}/collections/`);await page.locator('.archive-front').waitFor();assert.equal(await page.locator('.holding-card').count(),16);assert.equal(await page.locator('.collection-document').count(),10);
 assert.equal(await page.locator('a[href*="yikaistudio.com"]').count(),0);
 await page.goto(`${base}/memories/?photo=taiwan-1988`);const cover=page.getByRole('button',{name:'Pick up and open photo album'});await cover.waitFor();
 assert(!(await page.locator('.desk-album-caption').innerText()).includes('The photo album'));
 await cover.click();await page.getByRole('dialog',{name:'The photo album'}).waitFor();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Read closer'}).click();await page.getByLabel('Simulated browser address').waitFor();assert.match(await page.getByLabel('Simulated browser address').inputValue(),/taiwan-1988/);
 assert.deepEqual(failures,[]);
 console.log(`Verified ${base}: all 13 full reviews and images, reader scroll fix, 90 About records, 16 holdings, 10 archive documents, album and CRT browser, no first-party resource errors.`);
}finally{await browser.close();}
