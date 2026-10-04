import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Replacement NOW paintings have full-size images and stable links', async ({ page }) => {
  await page.goto('/works?series=now');
  await expect(page.locator('.archive-work')).toHaveCount(30);
  await expect(page.getByRole('button', { name: 'View The Fragmented Self #3', exact: true })).toBeVisible();
  for (let n = 7; n <= 10; n++) {
    await page.getByRole('button', { name: `View The Fragmented Self #${n}`, exact: true }).click();
    await expect(page.locator('.detail-info h1')).toHaveText(`The Fragmented Self #${n}`);
    await expect.poll(() => page.locator('.detail-art img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    if (n === 10) { await page.reload(); await expect(page.locator('.detail-info h1')).toHaveText('The Fragmented Self #10'); }
    await page.getByRole('button', { name: 'Close artwork' }).click();
  }
});

test('Mobile intro settles on Mickey, skips cleanly, and respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.mobile-gallery')).toHaveAttribute('data-intro', 'true');
  await expect(page.locator('.mobile-gallery')).toHaveAttribute('data-intro', 'false');
  await expect(page.locator('.work-label h2')).toHaveText('Mickey Opera Players with Masker');
  await page.reload();
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.locator('.mobile-gallery')).toHaveAttribute('data-intro', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Skip intro' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View work', exact: true })).toBeVisible();
});

test('Mobile books navigate, open, preserve position and reset chapter scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about');
  await page.getByRole('button', { name: 'Next book', exact: true }).click();
  await expect(page.locator('.mobile-shelf-navigation')).toContainText('02');
  await page.getByRole('button', { name: /Open STUDY/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('.reader-text').evaluate(el => el.scrollTo(0, el.scrollHeight));
  await page.getByRole('button', { name: 'Next chapter' }).click();
  await expect(page.locator('.reader-content h1')).toHaveText('Beginning again');
  await expect.poll(() => page.locator('.reader-text').evaluate(el => el.scrollTop)).toBe(0);
  await expect(page.locator('.biography-photo figcaption')).toContainText('Ping Hsin-tao and Chiung Yao');
  await page.getByRole('button', { name: 'Return to shelf' }).click();
  await expect(page.getByRole('button', { name: /Open STUDY/ })).toBeFocused();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
});

for (const width of [390, 1440]) test(`Memory reset controls clear the desk at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto('/memories?photo=taiwan-1988');
  await expect(page.locator('.memory-display')).toBeVisible();
  const desk = await page.locator('.memory-desk').boundingBox();
  const controls = await page.locator('.memory-stage-controls').boundingBox();
  expect(controls!.y).toBeGreaterThanOrEqual(desk!.y + desk!.height);
  await page.getByRole('button', { name: 'Rotate computer right' }).click();
  await page.getByRole('button', { name: 'Reset view' }).click();
  await expect(page.locator('.memory-display')).toHaveAttribute('data-facing', 'front');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
