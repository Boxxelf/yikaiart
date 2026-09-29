import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) test(`Home and Works have separate entries at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page).toHaveTitle('Home — Yi Kai');
  await expect(page.locator('.work-label h2')).toHaveText('Mickey Opera Players with Masker');
  if (width < 900) await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('link', { name: 'Works', exact: true }).click();
  await expect(page).toHaveURL(/\/works$/);
  await expect(page.getByRole('heading', { name: 'The archive', exact: true })).toBeVisible();
  await expect(page.locator('.archive-work')).toHaveCount(121);
  await expect(page.locator('.ring-surface')).toHaveCount(0);
  await page.reload();
  await expect(page).toHaveTitle('Works — Yi Kai');
  await expect(page.locator('.archive-work')).toHaveCount(121);
  await page.getByRole('link', { name: 'Yi Kai — Home', exact: true }).click();
  await expect(page.locator('.work-label h2')).toHaveText('Mickey Opera Players with Masker');
  await page.getByRole('button', { name: /View all works/ }).click();
  await expect(page.locator('.archive-work')).toHaveCount(121);
  await page.getByRole('link', { name: 'Back to Home' }).click();
  await expect(page.locator('.work-label h2')).toHaveText('Mickey Opera Players with Masker');
  await page.goto('/works?view=archive');
  await expect(page.locator('.archive-work')).toHaveCount(121);
});
