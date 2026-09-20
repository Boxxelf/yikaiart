import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {reviews} from '../src/content/reviews';

test('Full reader shows the longest article and resets to the beginning when changing authors',async({page})=>{
 await page.goto('/reviews?review=david-pagel&read=1');
 const dialog=page.getByRole('dialog');const pagel=reviews.find(r=>r.id==='david-pagel')!;
 await expect(dialog.locator('.review-article-text > p')).toHaveText(pagel.paragraphs);
 await expect(dialog).not.toContainText(/Editorial summary|Translated summary/);
 await page.getByRole('button',{name:'Next review in reader'}).click();
 await expect(dialog.locator('.review-sheet-author h2')).toHaveText('Andi Campognone');
 await expect(dialog.locator('.review-sheet-author h2')).toBeInViewport();
 await expect(dialog.locator('.review-sheet-author h2')).toBeFocused();
 expect(await dialog.evaluate(e=>e.scrollTop)).toBe(0);
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 await expect(page.locator('a[href*="yikaistudio.com"]')).toHaveCount(0);
});

test('Chinese originals remain complete and readable on narrow screens and in the reader',async({page})=>{
 await page.setViewportSize({width:320,height:844});
 for(const review of reviews.filter(r=>r.language.startsWith('zh'))){
  await page.goto(`/reviews?review=${review.id}&read=1`);const dialog=page.getByRole('dialog');
  await expect(dialog.locator('.review-article-text > p')).toHaveText(review.paragraphs);
  await expect(dialog.locator('.review-article-text')).toHaveAttribute('lang',review.language);
  await expect(dialog.locator('.review-signature strong')).toHaveText(review.byline);
  expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
 }
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});

for(const width of [1440,390])test(`Reader navigation masks the entire top edge while scrolling at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.goto('/reviews?review=david-pagel&read=1');
 const dialog=page.getByRole('dialog'),bar=dialog.locator('.editorial-dialog-top');await expect(bar).toBeVisible();
 for(const top of [120,650,1200]){
  await dialog.evaluate((el,y)=>el.scrollTo(0,y),top);
  const rect=await bar.boundingBox();expect(rect!.y).toBe(0);expect(rect!.x).toBe(0);expect(rect!.width).toBeGreaterThanOrEqual(width-20);
  expect(await bar.evaluate(el=>[.1,.5,.9].every(f=>el.contains(document.elementFromPoint(innerWidth*f,2))))).toBe(true);
 }
 await bar.getByRole('button',{name:'Return'}).click();await expect(dialog).toHaveCount(0);
});
