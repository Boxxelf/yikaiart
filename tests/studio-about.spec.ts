import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [390, 1440]) test(`About embeds four complete studio photographs at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/about#studio');
  const gallery = page.getByRole('region', { name: 'In the studio.' });
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.locator('.studio-photograph')).toHaveCount(4);
  for (const photo of await gallery.locator('.studio-photograph img').all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await photo.evaluate((img: HTMLImageElement) => Math.abs(img.clientWidth / img.clientHeight - img.naturalWidth / img.naturalHeight))).toBeLessThan(.015);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await gallery.getByRole('button').first().click();
  const reader = page.getByRole('dialog', { name: 'Studio photographs' });
  await expect(reader).toBeVisible();
  await expect.poll(() => reader.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(reader.locator('figcaption')).toHaveText('Among the paintings.');
  await reader.getByRole('button', { name: 'Next studio photograph' }).click();
  await expect(reader.locator('figcaption')).toHaveText('With Mickey Opera Players with Masker.');
  await page.keyboard.press('ArrowLeft');
  await expect(reader.locator('figcaption')).toHaveText('Among the paintings.');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(reader).toHaveCount(0);
  await expect(gallery.getByRole('button').first()).toBeFocused();
  await gallery.screenshot({ path: `test-results/studio-about-${width}.png` });
  await page.goto('/memories');
  await expect(page.getByText(/Waiting for a moment/i)).toHaveCount(0);
  await expect(page.locator('.memory-stage-caption')).toBeEmpty();
});
