import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('The album lifts from a small desktop object, preserves its spread and puts itself back to load a photo',async({page})=>{
 await page.goto('/memories?photo=taiwan-1988');
 const cover=page.getByRole('button',{name:'Pick up and open photo album'}),small=await cover.boundingBox();expect(small!.width).toBeLessThan(280);
 await cover.click();const album=page.getByRole('dialog',{name:'The photo album'});await expect(album).toBeVisible();
 await expect.poll(()=>page.locator('.album-lift-panel').evaluate(el=>el.getAnimations().length)).toBe(0);
 expect((await page.locator('.album-lift-panel').boundingBox())!.width).toBeGreaterThan(small!.width*2);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.getByRole('button',{name:'Next album page',exact:true}).click();await expect(page.getByRole('combobox',{name:'Album pages'})).toHaveValue('1');
 await page.keyboard.press('Escape');await expect(album).not.toBeVisible();await expect(cover).toBeFocused();
 await cover.press('Enter');await expect(page.getByRole('combobox',{name:'Album pages'})).toHaveValue('1');
 const card=page.locator('.memory-photo-card').first();const title=(await card.getAttribute('aria-label'))!.replace('Load ','');await card.click();await expect(album).not.toBeVisible();await expect(page.locator('.memory-display h2')).toHaveText(title);
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','viewing');
});
test('Compact mobile cover and reduced-motion pickup remain usable without overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/memories');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();await expect(page.getByRole('dialog',{name:'The photo album'})).toBeVisible();
 expect(await page.getByRole('dialog',{name:'The photo album'}).evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
 await page.getByRole('button',{name:'Load An opening in Taiwan',exact:true}).click();await expect(page.getByRole('dialog',{name:'The photo album'})).not.toBeVisible();await expect(page.locator('.memory-display h2')).toHaveText('An opening in Taiwan');
});
