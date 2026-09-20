import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const errors: string[] = [];
test.beforeEach(async ({ page }) => { errors.length = 0; page.on('pageerror', error => errors.push(error.message)); });
test.afterEach(() => { expect(errors).toEqual([]); });

test('Works: renders art, navigation, metadata and complete original detail', async ({ page }) => {
  await page.goto('/works');
  await expect(page.getByRole('heading', { name: 'The Fragmented Self', exact: true })).toBeVisible();
  await expect(page.locator('.works-canvas canvas')).toBeVisible();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'test-results/works-desktop.png' });
  await page.getByRole('button', { name: 'Next featured work' }).click();
  await expect(page.locator('.work-label h2')).toHaveText('Couple in Red');
  await expect(page.locator('.work-dimensions')).toHaveText('60 × 52 in');
  await page.getByRole('button', { name: 'View work', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const image = page.locator('.detail-art img');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: 'test-results/work-detail.png' });
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.detail-info h1')).toContainText('Mickey Opera Players');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View work', exact: true })).toBeFocused();
});

test('Works opening completes, replays on entry, and preserves direct artwork links', async ({ page }) => {
  await page.goto('/works');
  const ring = page.locator('.works-canvas');
  await expect(ring).toHaveAttribute('data-intro', 'true');
  await expect(page.getByRole('button', { name: 'Next featured work' })).toBeHidden();
  await expect(ring).toHaveAttribute('data-intro', 'false');
  await expect(page.locator('.works-intro-title')).toHaveCSS('opacity', '0');
  await page.getByRole('button', { name: 'Next featured work' }).click();
  await expect(page.locator('.work-label h2')).toHaveText('Couple in Red');
  await page.getByRole('button', { name: 'View work', exact: true }).click();
  const artworkUrl = page.url();
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(ring).toHaveAttribute('data-intro', 'false');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await page.getByRole('link', { name: 'Works', exact: true }).click();
  await expect(ring).toHaveAttribute('data-intro', 'true');
  await expect(ring).toHaveAttribute('data-intro', 'false');
  expect(artworkUrl).toContain('work=');
});

test('Archive: 113 works, six complete collections, fractional and feet dimensions', async ({ page }) => {
  await page.goto('/works?view=archive');
  await expect(page.locator('.archive-work')).toHaveCount(113);
  for (const [id, count] of [['now',26],['robot-ai',18],['opera-players',18],['agree-to-disagree',14],['tibet',18],['land',19]] as const) {
    await page.goto(`/works?series=${id}`);
    await expect(page.locator('.archive-work')).toHaveCount(count);
  }
  await page.goto('/works?series=now');
  await expect.poll(() => page.locator('.archive-image img').first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.screenshot({path:'test-results/archive-desktop.png'});
  await page.getByRole('button', { name: 'View Anxious Head', exact: true }).click();
  await expect(page.locator('.detail-info p')).toHaveText('61 × 21 in');
  await expect.poll(() => page.locator('.detail-art img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('About: seven physical books, all chapters open and close, readable biography', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('.bookshelf-canvas canvas')).toBeVisible();
  await page.waitForTimeout(1800);
  await page.screenshot({path:'test-results/about-desktop.png'});
  for (const id of ['ORIGIN','STUDY','CROSSING','DIALOGUE','HAND','UNRESOLVED','INDEX']) {
    await page.getByRole('button', { name: new RegExp(`Select ${id}:`) }).click();
    await page.waitForTimeout(1100);
    if (id === 'DIALOGUE') await page.screenshot({path:'test-results/about-cover.png'});
    await page.getByRole('button', { name: 'Open chapter' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    if (id === 'DIALOGUE') { await expect(page.locator('.biography-paragraph')).toHaveCount(9); await page.screenshot({path:'test-results/about-reader.png'}); }
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: new RegExp(`Select ${id}:`) })).toBeFocused();
    await page.waitForTimeout(950);
  }
  await page.getByRole('button', {name:'Read full biography'}).click();
  await expect(page.locator('.biography-paragraph')).toHaveCount(28);
});

test('Index links and browser history preserve routes', async ({ page }) => {
  await page.goto('/about?chapter=index');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('.reader-index').getByRole('link', {name:/TIBET/}).click();
  await expect(page).toHaveURL(/works\?series=tibet/);
  await expect(page.locator('.archive-work')).toHaveCount(18);
  await page.reload();
  await expect(page.locator('.archive-work')).toHaveCount(18);
});

test('Mobile: real works, swiping, books, reading, no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/works');
  await expect(page.locator('.static-work img')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.screenshot({path:'test-results/works-mobile.png'});
  await page.getByRole('button',{name:'Next featured work'}).click();
  await expect(page.locator('.work-label h2')).toHaveText('Couple in Red');
  await page.locator('.static-ring').evaluate(el => {
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [new Touch({ identifier: 1, target: el, clientX: 300, clientY: 300 })] }));
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [new Touch({ identifier: 1, target: el, clientX: 100, clientY: 300 })] }));
  });
  await expect(page.locator('.work-label h2')).toHaveText('Mickey Opera Players with Masker');
  await page.getByRole('button',{name:'Series',exact:false}).first().click();
  await page.locator('.mobile-series').getByRole('button',{name:/LAND/}).click();
  await expect(page.locator('.archive-work')).toHaveCount(19);
  await page.getByRole('button',{name:'Menu'}).click();
  await page.getByRole('link',{name:'About',exact:true}).click();
  await expect(page.locator('.book-catalogue-item')).toHaveCount(7);
  await expect.poll(() => page.locator('.book-cover').first().evaluate(el => el.tagName)).toBe('IMG');
  await page.screenshot({path:'test-results/about-mobile.png',fullPage:true});
  await page.getByRole('button',{name:/Open ORIGIN/}).click();
  await expect(page.locator('.biography-paragraph')).toHaveCount(3);
  await expect(page.locator('.reader-content h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/reader-mobile.png'});
});

test('Reduced motion and no WebGL: all content remains accessible', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/works');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.goto('/about');
  await expect(page.locator('.book-catalogue-item')).toHaveCount(7);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) { return type.includes('webgl') ? null : getContext.call(this, type as '2d', ...args); } as typeof getContext;
  });
  await page.goto('/works');
  await expect(page.locator('.static-work')).toBeVisible();
  await page.goto('/about');
  await expect(page.locator('.book-catalogue-item')).toHaveCount(7);
});

test('English-only UI and accessibility', async ({ page }) => {
  await page.goto('/works?series=tibet');
  expect(await page.locator('body').innerText()).not.toMatch(/[\u3400-\u9FFF]/);
  let audit = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(audit.violations).toEqual([]);
  await page.goto('/about?chapter=origin');
  await expect(page.getByRole('dialog')).toBeVisible();
  audit = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(audit.violations).toEqual([]);
});
