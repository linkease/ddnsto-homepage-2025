import { expect, test } from '@playwright/test';

test('首页刷新保留浏览位置和锚点，导航仍正常', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?device=istoreos#devices');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await page.reload();
  await expect(page).toHaveURL(/\?device=istoreos#devices$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await page.waitForTimeout(300);
  // Test native restoration at an arbitrary position without a fragment.
  await page.evaluate(() => {
    history.replaceState(history.state, '', '/?device=istoreos');
    scrollTo({ top: 1500, behavior: 'instant' });
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1500);
  await page.reload();
  await expect(page).toHaveURL(/\?device=istoreos$/);
  await expect
    .poll(() => page.evaluate(() => Math.abs(scrollY - 1500)))
    .toBeLessThan(5);
  await page.locator('.intent-nav a[href="#devices"]').click();
  await expect(page).toHaveURL(/#devices$/);
  await expect(page.locator('#devices h2')).toBeInViewport();
  // Keeping a fragment must not force a manually scrolled page back to it.
  await page.evaluate(() => scrollTo({ top: 800, behavior: 'instant' }));
  await page.waitForTimeout(200);
  await page.reload();
  await expect(page).toHaveURL(/#devices$/);
  await expect
    .poll(() => page.evaluate(() => Math.abs(scrollY - 800)))
    .toBeLessThan(5);
});
