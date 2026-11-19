import { test, expect } from '@playwright/test';
test('首屏正文、菜单、锚点和固定栏定位', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page).toHaveTitle('DDNSTO · 远程访问，如此简单');
  await expect(page.locator('.hero h1')).toHaveText('远程访问，如此简单。');
  await expect(page.locator('#remote-word')).toHaveAttribute(
    'href',
    '#tcp-scenario',
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
      .getByRole('link', { name: '支持设备' })
      .click();
    await expect(page.locator('#menu-dialog')).not.toBeVisible();
  } else {
    await page
      .getByRole('navigation', { name: '主要导航' })
      .getByRole('link', { name: '支持设备' })
      .click();
  }
  await expect(page).toHaveURL(/#devices$/);
  await expect(page.locator('[data-section-link="devices"]')).toHaveAttribute(
    'aria-current',
    'location',
  );
  const position = await page.evaluate(() => ({
    target: document.querySelector('#devices')!.getBoundingClientRect().top,
    bottom: document.querySelector('.intent-band')!.getBoundingClientRect()
      .bottom,
  }));
  expect(position.target).toBeGreaterThanOrEqual(position.bottom);
  await page.locator('[data-section-link="scenarios"]').click();
  await expect(page.locator('[data-section-link="scenarios"]')).toHaveAttribute(
    'aria-current',
    'location',
  );
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
    .locator('.actions')
    .getByRole('link', { name: '查看我的设备怎么用' })
    .click();
  await expect(page).toHaveURL(/#devices$/);
  await context.close();
});
test('动画与关键词同步、离屏暂停和减少动效', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const hero = page.locator('.hero');
  await expect(hero).toHaveAttribute('data-running', 'true');
  await page.clock.runFor(8200);
  await expect(hero).toHaveAttribute('data-scene', 'software');
  await expect(page.locator('#remote-word')).toHaveText('软件');
  await expect(page.locator('#remote-word')).toHaveAttribute(
    'href',
    '#apps-scenario',
  );
  await page.clock.runFor(6100);
  await expect(hero).toHaveAttribute('data-scene', 'files');
  await expect(page.locator('#remote-word')).toHaveAttribute(
    'href',
    '#files-scenario',
  );
  await page.clock.runFor(8100);
  await expect(hero).toHaveAttribute('data-scene', 'device');
  await expect(page.locator('#remote-word')).toHaveAttribute(
    'href',
    '#device-scenario',
  );
  await page.locator('#devices').scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute('data-running', 'false');
  const scene = await hero.getAttribute('data-scene');
  await page.clock.runFor(10000);
  await expect(hero).toHaveAttribute('data-scene', scene!);
  await page.evaluate(() => scrollTo(0, 0));
  await page.clock.runFor(1000);
  await expect(hero).toHaveAttribute('data-running', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Media-query change delivery uses a rendering opportunity; advance the installed clock.
  await page.clock.runFor(100);
  await expect(hero).toHaveAttribute('data-running', 'false');
  await expect(hero).toHaveAttribute('data-scene', 'computer');
  await page.clock.runFor(12000);
  await expect(page.locator('#remote-word')).toHaveText('电脑');
});
test('手动暂停、焦点暂停及页面后台暂停', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.hero');
  await expect(hero).toHaveAttribute('data-running', 'true');
  await page.locator('#remote-word').focus();
  await expect(hero).toHaveAttribute('data-running', 'false');
  await page.locator('.motion-toggle').focus();
  await page.locator('.motion-toggle').click();
  await expect(hero).toHaveAttribute('data-running', 'false');
  await expect(page.locator('.motion-toggle')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.locator('.motion-toggle').click();
  await expect(hero).toHaveAttribute('data-running', 'true');
  // Browser background events are nondeterministic in headless mode; explicitly exercise the visibility handler.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(hero).toHaveAttribute('data-running', 'false');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(hero).toHaveAttribute('data-running', 'true');
});
