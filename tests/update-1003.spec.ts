import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for(const width of [390,1440]){
 test(`October publication scans, collection pairs and studio feature at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  await page.goto('/reviews');
  await expect(page.locator('.review-front-scans img')).toHaveCount(3);
  await expect(page.locator('.review-sheet h2')).toHaveText('Yi Kai at Dolly Fiterman');
  if(width>767){await expect(page.locator('.review-index')).toContainText('ARTnews');await expect(page.locator('.review-index')).not.toContainText('Mary Abbe');}
  await page.locator('.review-front-scans button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(()=>page.getByRole('dialog').locator('img').evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);
  await page.getByRole('button',{name:'Zoom image',exact:true}).click();
  await expect(page.getByRole('button',{name:'Fit image',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.review-front-scans button').first()).toBeFocused();
  await page.goto('/reviews?review=asian-art-news');
  await expect(page.locator('.review-front-scans img')).toHaveCount(4);
  await expect(page.locator('.review-sheet h2')).toHaveText('The Spirit That Links');
  await page.locator('.review-sheet').screenshot({path:`test-results/1003-asian-${width}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.goto('/collections');
  await expect(page.locator('.archive-document-rail .collection-document')).toHaveCount(6);
  for(const title of ['Shepherd Girl','Impressions of Id Kah Square']){
   await page.getByRole('button',{name:`View archive ${title}: an exhibition certificate`,exact:true}).click();
   await expect(page.locator('.archive-companion-image img')).toBeVisible();
   await page.locator('.archive-companion-image').click();
   await page.getByRole('dialog').getByRole('button',{name:title,exact:true}).click();
   await expect(page.locator('.collection-image-viewport img')).toHaveAttribute('alt',new RegExp(title));
   await page.keyboard.press('Escape');
  }
  await page.locator('#from-the-archive').screenshot({path:`test-results/1003-collections-${width}.png`});
  await page.goto('/about#studio');
  await page.locator('.studio-feature').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading',{name:'A home made for art.'})).toBeVisible();
  await page.locator('.studio-feature').screenshot({path:`test-results/1003-studio-${width}.png`});
  await page.getByRole('link',{name:'Read the feature',exact:true}).click();
  await expect(page.locator('#studio-full-article')).toHaveAttribute('open','');
  await expect(page.locator('.studio-feature-fulltext p')).toHaveCount(30);
  await expect(page.locator('.studio-feature-photoarchive img')).toHaveCount(17);
  await expect(page.getByRole('link',{name:'Open original PDF'})).toHaveAttribute('href','/documents/la-times-2025.pdf');
  await page.locator('.studio-feature-photoarchive button').first().click();
  await expect(page.getByRole('dialog',{name:'Los Angeles Times photographs'})).toBeVisible();
  await page.getByRole('button',{name:'Next feature photograph'}).click();
  await expect(page.locator('.studio-feature-photo-nav')).toContainText('2 / 17');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
 });
}
test('Fragmented Self has ten ordered works and teaching history retains the moved entries',async({page})=>{
 await page.goto('/works?series=now');
 await expect(page.locator('.archive-work')).toHaveCount(30);
 const titles=await page.locator('.archive-work').allTextContents();
 const numbered=titles.filter(t=>t.includes('The Fragmented Self'));
 expect(numbered).toHaveLength(10);
 for(let i=1;i<=10;i++)expect(numbered[i-1]).toContain(`The Fragmented Self #${i}`);
 await page.goto('/about');
 await expect(page.locator('#teaching li').nth(-3)).toContainText('1991');
 await expect(page.locator('#teaching li').nth(-2)).toContainText('1988 – 1990');
 await expect(page.locator('#teaching li').last()).toContainText('1983 – 1985');
});
test('All four publications move to Reviews and old collection links still reach their text and scan',async({page})=>{
 for(const id of ['archive-historic-preservation','archive-gallery-guide-west','archive-china-times','archive-gallery-guide-midwest']){
  await page.goto(`/collections?collection=${id}`);
  await expect(page).toHaveURL(new RegExp(`/reviews\\?review=${id}&read=1`));
  const reader=page.getByRole('dialog');
  await expect(reader.locator('.review-front-scans img')).toHaveCount(1);
  await expect.poll(()=>reader.locator('.review-front-scans img').evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);
  await expect(reader.locator('.review-article-text>p')).not.toBeEmpty();
 }
});
