import { test, expect } from '@playwright/test';
import { publishedPaths } from '../../src/config/publishing.mjs';
test('无 JS 内容页可读，链接、锚点和资源存在，未知路由返回 404', async ({
  browser,
  baseURL,
  viewport,
}) => {
  const context = await browser.newContext({
    viewport,
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  for (const path of publishedPaths) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>('a[href]')]
        .map((a) => new URL(a.href))
        .filter(
          (u) =>
            u.origin === location.origin &&
            u.pathname === location.pathname &&
            u.hash &&
            !document.getElementById(decodeURIComponent(u.hash.slice(1))),
        )
        .map((u) => u.href),
    );
    expect(missing, path).toEqual([]);
    const links = await page
      .locator('a[href],img[src]')
      .evaluateAll((nodes) =>
        nodes
          .map((n) => n.getAttribute(n.tagName === 'IMG' ? 'src' : 'href')!)
          .filter((s) => s.startsWith('/') && !s.startsWith('//')),
      );
    for (const link of new Set(links)) {
      const r = await page.request.get(link);
      expect(r.status(), link).toBe(200);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      path,
    ).toBe(false);
  }
  const response = await page.goto('/m6-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await context.close();
});
test('设备内容页返回所选设备的交互指南', async ({ page }) => {
  await page.goto('/devices/istoreos/');
  await expect(page).toHaveURL(/\/devices\/istoreos\/$/);
  await page.getByRole('link', { name: '打开交互安装指南' }).click();
  await expect(page).toHaveURL(/platform=istoreos/);
  await expect(page.locator('#devices')).toContainText('iStoreOS');
});
