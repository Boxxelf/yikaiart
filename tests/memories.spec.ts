import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const errors: string[]=[];
test.beforeEach(async({page})=>{errors.length=0;page.on('pageerror',e=>errors.push(e.message));});
test.afterEach(()=>expect(errors).toEqual([]));

test('One album click inserts a photo, reveals English copy, and supports enlargement and replay',async({page})=>{
 await page.goto('/memories');
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();
 await expect(page.getByRole('dialog',{name:'The photo album'})).toBeVisible();
 await expect(page.getByRole('button',{name:'All 28',exact:true})).toBeVisible();
 await expect(page.locator('.memory-photo-card')).toHaveCount(4);
 await expect(page.locator('.memory-webgl canvas')).toBeVisible();
 await expect(page.getByRole('button',{name:'Place in memory box'})).toHaveCount(0);
 await page.getByRole('button',{name:'Load An opening in Taiwan',exact:true}).click();
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','inserting');
 await page.getByRole('button',{name:'Skip animation'}).click();
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','viewing');
 await expect(page.locator('.memory-display h2')).toHaveText('An opening in Taiwan');
 await page.getByRole('button',{name:'Enlarge An opening in Taiwan',exact:true}).click();
 await expect(page.getByRole('dialog').locator('img')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'Enlarge An opening in Taiwan',exact:true})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Return to the desk'}).click();
 await page.getByRole('button',{name:'Replay',exact:true}).click();
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','inserting');
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','viewing');
 await page.reload();
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','viewing');
 await expect(page.locator('.memory-display h2')).toHaveText('An opening in Taiwan');
});

test('Album paging reaches all 28 items and keyboard activation loads the right caption',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/memories');
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();
 const titles=new Set<string>();
 for(let i=0;i<7;i++){
  await page.getByRole('combobox',{name:'Album pages'}).selectOption(String(i));
  for(const title of await page.locator('.memory-photo-title').allTextContents())titles.add(title);
 }
 expect(titles.size).toBe(28);
 expect([...titles].some(t=>t.includes('Handwritten'))).toBe(false);
 await page.getByRole('button',{name:'Photographs 27',exact:true}).click();
 await page.getByRole('button',{name:'Load An opening in Taiwan',exact:true}).focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('.memory-display h2')).toHaveText('An opening in Taiwan');
 await expect(page.locator('.memory-display img')).toHaveAttribute('src',/taiwan-1988-display/);
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();
 await page.getByRole('button',{name:'Exhibition material 1',exact:true}).click();
 await expect(page.locator('.memory-photo-card')).toHaveCount(1);
 await page.getByRole('button',{name:'Load Selected paintings and works on paper'}).click();
 await expect(page.locator('.memory-display h2')).toHaveText('Selected paintings and works on paper');
 await page.goBack();
 await expect(page.locator('.memory-display h2')).toHaveText('An opening in Taiwan');
});

test('A failed image preserves the previous memory and permits retry',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/taiwan-1988-display.webp',route=>route.abort());
 await page.goto('/memories?photo=houston-2026');
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();
 await expect(page.locator('.memory-display h2')).toHaveText('A family gathering');
 await page.getByRole('combobox',{name:'Album pages'}).selectOption('0');
 await page.getByRole('button',{name:'Load An opening in Taiwan',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('could not be loaded');
 await expect(page.locator('.memory-display h2')).toHaveText('A family gathering');
 await page.unroute('**/taiwan-1988-display.webp');
 await page.getByRole('button',{name:'Try again'}).click();
 await expect(page.locator('.memory-display h2')).toHaveText('An opening in Taiwan');
});

test('Mobile and missing WebGL preserve album, screen reading and page width',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){return type.includes('webgl')?null:original.call(this,type as '2d',...args);} as typeof original;});
 await page.goto('/memories?photo=houston-2026');
 await expect(page.locator('.memory-stage')).toHaveClass(/is-fallback/);
 await expect(page.locator('.memory-display h2')).toHaveText('A family gathering');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Read closer'}).click();
 await expect(page.getByRole('dialog').locator('p').first()).toContainText('National ACE');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();
 await page.getByRole('button',{name:'Load In the museum collection',exact:true}).click();
 await expect(page.locator('.memory-display h2')).toHaveText('In the museum collection');
});

test('Memory interface and enlarged reader remain accessible and English-only',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/memories?photo=houston-2026');
 await expect(page.locator('.memory-display h2')).toHaveText('A family gathering');
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 expect(audit.violations).toEqual([]);
 await expect(page.getByRole('button',{name:/export|download|film|reconstruct|Handwritten notes|Original description|Chinese description/i})).toHaveCount(0);
 expect(await page.locator('main').innerText()).not.toMatch(/[\u3400-\u9fff]/u);
 await expect(page.locator('.memory-stage')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 await page.getByRole('button',{name:'Enlarge A family gathering'}).click();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});

test('Dragging an album photograph into the slot still opens that memory',async({page})=>{
 await page.goto('/memories');
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();
 await expect(page.locator('.memory-webgl canvas')).toBeVisible();
 const source=page.getByRole('button',{name:'Load An opening in Taiwan',exact:true});
 const dragPhoto=async(target:string)=>{
  await expect.poll(()=>page.locator('.album-lift-panel').evaluate(e=>e.getAnimations().length)).toBe(0);
  const box=await source.boundingBox();if(!box)throw Error('Missing photograph');
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+20,box.y+box.height/2,{steps:5});
  await expect(page.locator('.album-lift-dialog')).not.toBeVisible();
  const dest=await page.locator(target).boundingBox();if(!dest)throw Error('Missing drop target');
  await page.mouse.move(dest.x+dest.width/2,dest.y+dest.height/2,{steps:8});await page.mouse.up();
 };
 await dragPhoto('.memories-intro');
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','idle');
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();
 await dragPhoto('.memory-slot-target');
 await expect(page).toHaveURL(/photo=taiwan-1988/);
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','viewing');
 await expect(page.locator('.memory-display h2')).toHaveText('An opening in Taiwan');
});

test('Drag rotation hides the rear screen, resets, and never opens the reader by accident',async({page})=>{
 await page.goto('/memories?photo=houston-2026');
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','viewing');
 const display=page.locator('.memory-display');
 const screen=await display.boundingBox();
 if(!screen)throw new Error('Missing projected screen');
 const before=await display.getAttribute('style');
 await page.mouse.move(screen.x+screen.width/2,screen.y+screen.height/2);
 await page.mouse.down();
 await page.mouse.move(screen.x+screen.width/2+350,screen.y+screen.height/2+30,{steps:18});
 await page.mouse.up();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(display).toHaveAttribute('data-facing','back');
 await expect(display).toBeHidden();
 await page.getByRole('button',{name:'Reset view'}).click();
 await expect(display).toHaveAttribute('data-facing','front');
 await expect(display).toBeVisible();
 expect(await display.getAttribute('style')).not.toBe(before);
 await page.getByRole('button',{name:'Enlarge A family gathering'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
});

test('Rapid photo choices finish the current insertion then load only the latest choice',async({page})=>{
 await page.goto('/memories');
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();
 await page.getByRole('button',{name:'Load An opening in Taiwan',exact:true}).click();
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','inserting');
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();
 await page.getByRole('button',{name:'Load An opening in St. Paul',exact:true}).click();
 await page.getByRole('button',{name:'Pick up and open photo album'}).click();
 await page.getByRole('button',{name:'Load Friends at the opening',exact:true}).click();
 // Pickup/return motion can outlast the current insertion, so the latest choice may start directly.
 // Verify the final photograph rather than requiring a transient queue label.
 await expect(page.locator('.memory-display h2')).toHaveText('Friends at the opening');
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','viewing');
 await expect(page.getByRole('status')).not.toContainText('Up next:');
 await expect(page.locator('.memory-display img')).toHaveAttribute('src',/st-paul-03-display/);
});

test('Touch drag rotates the computer while vertical swipes can still scroll the page',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const page=await context.newPage();
 await page.goto('/memories?photo=taiwan-1988');
 await expect(page.locator('.memory-stage')).toHaveAttribute('data-phase','viewing');
 const display=page.locator('.memory-display');
 const screen=await display.boundingBox();
 if(!screen)throw new Error('Missing screen');
 const before=await display.getAttribute('style');
 const client=await context.newCDPSession(page);
 const x=screen.x+screen.width*.3,y=screen.y+screen.height*.45;
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=12;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*9,y}]});
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(()=>display.getAttribute('style')).not.toBe(before);
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Reset view'}).click();
 const scrollBefore=await page.evaluate(()=>window.scrollY);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:550}]});
 for(let i=1;i<=10;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:550-i*18}]});
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(scrollBefore+40);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await context.close();
});
