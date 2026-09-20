import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Desk album moves without opening, stays bounded, then opens and returns to its new position',async({page})=>{
 await page.goto('/memories?photo=taiwan-1988');
 const dock=page.locator('.memory-album-dock'),cover=page.getByRole('button',{name:'Pick up and open photo album'});
 await expect(page.locator('.desk-album-caption')).not.toContainText('The photo album');
 const start=await dock.boundingBox();await cover.hover();await expect.poll(()=>cover.evaluate(e=>e.getAnimations().length)).toBe(0);
 const b=await cover.boundingBox();if(!start||!b)throw Error('Missing cover');
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+125,b.y+b.height/2-90,{steps:12});await page.mouse.up();
 await expect(page.locator('.album-lift-dialog')).not.toBeVisible();
 const moved=await dock.boundingBox();expect(moved!.x-start.x).toBeCloseTo(125,0);expect(moved!.y-start.y).toBeCloseTo(-90,0);
 await cover.click();await expect(page.getByRole('dialog',{name:'The photo album'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('.album-lift-dialog')).not.toBeVisible();expect((await dock.boundingBox())!.x).toBeCloseTo(moved!.x,0);
 await cover.press('ArrowLeft');expect((await dock.boundingBox())!.x).toBeCloseTo(moved!.x-20,0);
 await cover.press('Home');expect((await dock.boundingBox())!.x).toBeCloseTo(start.x,0);
 await cover.press('Enter');await expect(page.getByRole('dialog',{name:'The photo album'})).toBeVisible();
});
test('About shows the supplied statement and all 90 career entries with working anchors',async({page})=>{
 await page.goto('/about');await expect(page.locator('.bookshelf-canvas canvas')).toBeVisible();
 await expect(page.locator('.about-page')).toHaveCSS('background-color','rgb(252, 250, 245)');
 await page.getByRole('link',{name:'Artist statement & career'}).click();
 await expect(page.getByRole('heading',{name:'Across two worlds.'})).toBeVisible();
 await expect(page.locator('.artist-statement blockquote p')).toHaveCount(3);
 await expect(page.locator('.artist-statement')).toContainText('34 years in China and the 36 years');
 await expect(page.locator('.artist-collecting')).toContainText('Rockefeller family');
 await expect(page.locator('.career-records li')).toHaveCount(90);
 await page.getByRole('link',{name:'06 Teaching'}).click();await expect(page).toHaveURL(/#teaching/);await expect(page.getByRole('heading',{name:'Teaching',exact:true})).toBeInViewport();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});
test('Mobile About remains readable and the album supports touch repositioning',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/about');
 await expect(page.locator('.book-catalogue-item')).toHaveCount(7);await expect(page.locator('.career-records li')).toHaveCount(90);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/memories');const cover=page.getByRole('button',{name:'Pick up and open photo album'});await cover.scrollIntoViewIfNeeded();const b=await cover.boundingBox();if(!b)throw Error('Missing album');
 const client=await page.context().newCDPSession(page);const x=b.x+b.width/2,y=b.y+b.height/2;
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+45,y:y-40}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect(page.locator('.memory-album-dock')).toHaveAttribute('style',/--album-offset-x: 45px/);await expect(page.locator('.album-lift-dialog')).not.toBeVisible();
 await cover.click();await expect(page.getByRole('dialog',{name:'The photo album'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
