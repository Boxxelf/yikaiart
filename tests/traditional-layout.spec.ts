import {test,expect} from '@playwright/test';
for(const width of [320,390,768,1024,1440])test(`All 18 Traditional Chinese reviews keep prose in the reading column at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/reviews?lang=zh-Hant');
 await expect(page.locator('.review-mobile-select option')).toHaveCount(18);
 const ids=await page.locator('.review-mobile-select option').evaluateAll(items=>items.map(item=>(item as HTMLOptionElement).value));
 expect(ids).toHaveLength(18);
 for(const id of ids){
  await page.goto(`/reviews?review=${id}&lang=zh-Hant`);
  await expect(page.locator('.review-article-text>.translation-note')).toBeVisible();
  const dimensions=await page.locator('.review-article-layout').evaluate(e=>{
   const text=e.querySelector('.review-article-text')!.getBoundingClientRect();const portrait=e.querySelector('.review-portrait')?.getBoundingClientRect();const layout=e.getBoundingClientRect();
   return {textWidth:text.width,layoutWidth:layout.width,textTop:text.top,portraitTop:portrait?.top,portraitRight:portrait?.right,textLeft:text.left,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  expect(dimensions.overflow,id).toBe(false);
  if(width>=768&&dimensions.portraitTop!==undefined){
   expect(Math.abs(dimensions.textTop-dimensions.portraitTop),id).toBeLessThan(2);
   expect(dimensions.textLeft,id).toBeGreaterThan(dimensions.portraitRight!);
   expect(dimensions.textWidth,id).toBeGreaterThan(dimensions.layoutWidth*.5);
  }else expect(dimensions.textWidth,id).toBeCloseTo(dimensions.layoutWidth,0);
 }
});
for(const width of [390,1440])test(`Chinese review readers with and without portraits at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
 for(const id of ['ruth-appelhof','mary-abbe','alice-king','archive-china-times']){
  await page.goto(`/reviews?review=${id}&read=1&lang=zh-Hant`);
  const dialog=page.getByRole('dialog');await expect(dialog.locator('.translation-note')).toBeVisible();
  const widths=await dialog.locator('.review-article-layout').evaluate(e=>({layout:e.clientWidth,text:e.querySelector('.review-article-text')!.clientWidth,portrait:!!e.querySelector('.review-portrait')}));
  expect(widths.text).toBeGreaterThan(widths.layout*(width>=768&&widths.portrait ? .5 : .95));
  await dialog.getByRole('button',{name:'Switch to English',exact:true}).click();
  await expect(dialog.locator('.translation-note')).toHaveCount(0);
  await expect(dialog.locator('.review-article-text')).toBeVisible();
 }
});

for(const width of [320,390,768,1440])test(`Biography toolbar remains usable at ${width}px`,async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 for(const chapter of ['origin','study','crossing','dialogue','hand','unresolved','index']){
  await page.goto(`/about?chapter=${chapter}&lang=zh-Hant`);
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  await dialog.getByRole('button',{name:'Switch to English',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await dialog.getByRole('button',{name:'切換至繁體中文',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','zh-Hant');
  const overlap=await dialog.locator('.chapter-reader-top').evaluate(e=>{const a=e.querySelector('.language-switch')!.getBoundingClientRect(),b=e.querySelector('.reader-close')!.getBoundingClientRect();return a.right>b.left;});
  expect(overlap).toBe(false);
  expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 }
});
