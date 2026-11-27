import { test, expect } from '@playwright/test';
test('真实时钟：首屏轮播、减少动效复位及恢复', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('hero-onboarding');
  await expect(hero).toHaveAttribute('data-running', 'true');
  await expect(hero).toHaveAttribute('data-hero-active', '1', {
    timeout: 8000,
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(hero).toHaveAttribute('data-running', 'false');
  await expect(hero).toHaveAttribute('data-hero-active', '0');
  await expect(page.locator('.story-generated')).toBeVisible();
  await expect(page.locator('.story-scan')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(hero).toHaveAttribute('data-running', 'true');
});
