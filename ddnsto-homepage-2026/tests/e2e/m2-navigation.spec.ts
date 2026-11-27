import { test, expect } from '@playwright/test';
test('首屏正文、菜单、锚点和固定栏定位', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page).toHaveTitle('DDNSTO · 远程访问，如此简单');
  await expect(page.locator('.hero h1')).toHaveText('远程访问，如此简单。');
  await expect(page.locator('[data-download=windows]')).toHaveAttribute(
    'href',
    /ddnsto_windows_gui_4\.2\.9\.zip$/,
  );
  if (await page.locator('#open-menu').isVisible()) {
    await page.locator('#open-menu').click();
    await expect(page.locator('#menu-dialog')).toBeVisible();
    await expect(page.locator('.menu-close')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-dialog')).not.toBeVisible();
    await expect(page.locator('#open-menu')).toBeFocused();
    await page.locator('#open-menu').click();
    await page
      .getByRole('navigation', { name: '手机导航', exact: true })
      .getByRole('link', { name: '设备' })
      .click();
    await expect(page.locator('#menu-dialog')).not.toBeVisible();
  } else {
    await page
      .getByRole('navigation', { name: '主要导航' })
      .getByRole('link', { name: '设备' })
      .click();
  }
  await expect(page).toHaveURL(/#devices$/);
  await expect(page.locator('.desktop-nav a[href="#devices"]')).toHaveAttribute(
    'aria-current',
    'location',
  );
  const position = await page.evaluate(() => ({
    target: document.querySelector('#devices')!.getBoundingClientRect().top,
    bottom: document.querySelector('.site-header')!.getBoundingClientRect()
      .bottom,
  }));
  expect(position.target).toBeGreaterThanOrEqual(position.bottom);
  if (await page.locator('#open-menu').isVisible())
    await page.locator('#open-menu').click();
  await page
    .locator(
      '.desktop-nav a[href="#scenarios"], #menu-dialog[open] a[href="#scenarios"]',
    )
    .filter({ visible: true })
    .click();
  await expect(
    page.locator('.desktop-nav a[href="#scenarios"]'),
  ).toHaveAttribute('aria-current', 'location');
});
test('无 JavaScript 时正文、原生链接和手机导航仍可读取', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:16208/');
  await expect(page.locator('h1')).toHaveText('远程访问，如此简单。');
  await expect(page.locator('.noscript-nav')).toBeVisible();
  await page
    .locator('.hero-install-links')
    .getByRole('link', { name: '其他设备' })
    .click();
  await expect(page).toHaveURL(/#devices$/);
  await context.close();
});
