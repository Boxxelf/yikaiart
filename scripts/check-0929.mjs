import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const page = await browser.newPage({viewport:{width:390,height:844}});
page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
for (const [name,width,height] of [['mobile',390,844],['desktop',1440,1000]]) {
 await page.setViewportSize({width,height});
 for (const route of ['','works','about','memories']) {
  await page.goto(`${base}/${route}`);
  if (route === '') await expect(page.locator(name === 'mobile' ? '.mobile-gallery' : '.works-canvas')).toHaveAttribute('data-intro', 'false', {timeout:30000});
  if (route === 'about') await expect(page.locator(name === 'mobile' ? '.book-cover' : '.bookshelf-canvas canvas').first()).toBeVisible({timeout:30000});
  if (route === 'memories') await expect(page.locator('.memory-webgl canvas')).toBeVisible({timeout:30000});
  await page.waitForTimeout(500);
  await page.screenshot({path:`test-results/update-${route || 'home'}-${name}.png`});
  console.log(name,route,await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth, text:document.body.innerText.slice(0,200)})));
 }
}
} finally { await browser.close(); }
