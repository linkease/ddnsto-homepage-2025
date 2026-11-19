import { test, expect } from '@playwright/test';
test('独立工程入口和返回首页', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '远程访问，如此简单。',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto('/404.html');
  await page.getByRole('link', { name: '返回首页' }).click();
  await expect(page).toHaveURL('/');
  expect(errors).toEqual([]);
});
