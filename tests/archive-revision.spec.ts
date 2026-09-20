import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('Cloth album opens, turns a physical leaf, closes and opens at the same spread',async({page})=>{
 await page.goto('/memories');const cover=page.getByRole('button',{name:'Pick up and open photo album'});
 await expect(cover).toBeVisible();await expect(page.getByRole('button',{name:'Load An opening in Taiwan',exact:true})).not.toBeVisible();
 await cover.click();await expect(page.locator('.album-object')).toHaveAttribute('data-open','true');
 await page.getByRole('button',{name:'Next album page',exact:true}).click();await expect(page.locator('.album-turn-leaf')).toBeVisible();
 await expect(page.getByRole('combobox',{name:'Album pages'})).toHaveValue('1');await expect(page.locator('.album-turn-leaf')).toHaveCount(0);
 await page.getByRole('button',{name:'Put album back'}).click();await expect(cover).toBeFocused();
 await cover.press('Enter');await expect(page.getByRole('combobox',{name:'Album pages'})).toHaveValue('1');
 await expect.poll(()=>page.locator('.album-lift-panel').evaluate(e=>e.getAnimations().length)).toBe(0);
 const edge=page.getByRole('button',{name:'Drag to turn album page forward'});const bounds=await edge.boundingBox();if(!bounds)throw Error('Missing leaf edge');
 await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);await page.mouse.down();await page.mouse.move(bounds.x-140,bounds.y+bounds.height/2,{steps:10});await page.mouse.up();
 await expect(page.getByRole('combobox',{name:'Album pages'})).toHaveValue('2');
});
test('Memory browser has local address, photo navigation, directory and history',async({page})=>{
 await page.goto('/memories?photo=taiwan-1988');await page.getByRole('button',{name:'Read closer'}).click();
 const dialog=page.getByRole('dialog');await expect(dialog.getByLabel('Simulated browser address')).toHaveValue(/taiwan-1988/);
 await dialog.getByRole('button',{name:'Next photograph in browser'}).click();await expect(dialog.locator('.memory-screen-copy h2')).not.toHaveText('An opening in Taiwan');
 await dialog.getByRole('button',{name:'Browser back',exact:true}).click();await expect(dialog.locator('.memory-screen-copy h2')).toHaveText('An opening in Taiwan');
 await dialog.getByRole('button',{name:'Browser forward',exact:true}).click();
 await dialog.getByRole('button',{name:'All photos',exact:true}).click();await expect(dialog.locator('.memory-browser-directory button')).toHaveCount(28);
 await dialog.getByRole('button',{name:'Browse A family gathering',exact:true}).click();await expect(dialog.getByLabel('Simulated browser address')).toHaveValue(/houston-2026/);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.keyboard.press('Escape');await expect(page.locator('.memory-display h2')).toHaveText('A family gathering');await expect(page).toHaveURL(/photo=houston-2026/);
});
test('Collections opens with the archive, changes its full text and has no old-site links',async({page})=>{
 await page.goto('/collections');
 const archive=await page.locator('.archive-front').boundingBox(),feature=await page.locator('.collection-feature').boundingBox();expect(archive!.y).toBeLessThan(feature!.y);
 await page.getByRole('button',{name:'View archive Portrait of Mitch Miller',exact:true}).click();await expect(page.locator('.archive-front-copy')).toContainText('30 × 40 inches');
 await page.getByRole('button',{name:'Enlarge archive Portrait of Mitch Miller'}).click();await expect(page.getByRole('dialog')).toContainText('Mitch Miller');
 await expect(page.locator('a[href*="yikaistudio.com"]')).toHaveCount(0);
 await page.goto('/reviews?review=ruth-appelhof');await expect(page.locator('.review-clipping img')).toBeVisible();await expect(page.locator('.newspaper')).toContainText('MIXTURE FOREVER. (Oil on canvas, 244 X 304 cm)');await expect(page.locator('a[href*="yikaistudio.com"]')).toHaveCount(0);
});
test('Mobile and reduced motion preserve the book and virtual browser',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/memories?photo=taiwan-1988');
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();await page.getByRole('button',{name:'Next album page',exact:true}).click();await expect(page.getByRole('combobox',{name:'Album pages'})).toHaveValue('1');await expect(page.locator('.album-turn-leaf')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Put album back'}).click();await page.getByRole('button',{name:'Read closer'}).click();await page.getByRole('button',{name:'All photos',exact:true}).click();await page.getByRole('button',{name:'Browse A family gathering',exact:true}).click();
 await expect(page.locator('.memory-browser-document')).toContainText('National ACE');expect(await page.getByRole('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
});
