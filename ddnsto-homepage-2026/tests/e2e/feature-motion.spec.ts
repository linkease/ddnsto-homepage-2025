import { test, expect } from '@playwright/test';
test('功能图示可见时循环，后台暂停，减少动效保持静态', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#features .feature-card').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute('data-visible', '');
  await page.mouse.move(0, 0);
  const meter = card.locator('.meters b').first();
  await expect
    .poll(() =>
      meter.evaluate((n) =>
        n.getAnimations().some((a) => a.playState === 'running'),
      ),
    )
    .toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect
    .poll(() =>
      meter.evaluate((n) =>
        n.getAnimations().every((a) => a.playState === 'paused'),
      ),
    )
    .toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => meter.evaluate((n) => n.getAnimations().length))
    .toBe(0);
  await page.locator('.logo').first().focus();
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(card).not.toHaveAttribute('data-visible', '');
});

test('四张卡片按设计在新标签打开官方教程，悬停与聚焦显示覆盖层', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  const cards = page.locator('#features .feature-card');
  const urls = [
    'https://doc.linkease.com/zh/guide/ddnsto/start.html',
    'https://doc.linkease.com/zh/guide/ddnsto/remote_control.html',
    'https://doc.linkease.com/zh/guide/ddnsto/cloudapp.html#_2-%E7%8E%A9%E8%BD%AC%E8%BF%9C%E7%A8%8Bssh',
    'https://doc.linkease.com/zh/guide/ddnsto/ddnstofile.html#%E6%96%87%E4%BB%B6%E7%AE%A1%E7%90%86',
  ];
  const homeURL = page.url();
  await page.context().route('https://doc.linkease.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Tutorial destination</title>',
    }),
  );
  for (let i = 0; i < 4; i++) {
    const card = cards.nth(i),
      link = card.locator('.feature-link');
    await card.scrollIntoViewIfNeeded();
    await expect(link).toHaveAttribute('href', urls[i]);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toContainText('查看教程');
    if (!isMobile) {
      await page.mouse.move(0, 0);
      await expect(link).toHaveCSS('opacity', '0');
      await card.hover();
      await expect(link).toHaveCSS('opacity', '1');
      const c = await card.boundingBox(),
        l = await link.boundingBox();
      expect(Math.abs(c!.width - l!.width)).toBeLessThanOrEqual(2);
      expect(Math.abs(c!.height - l!.height)).toBeLessThanOrEqual(2);
    }
    await link.focus();
    await expect(link).toHaveCSS('opacity', '1');
    const popupPromise = page.waitForEvent('popup');
    await link.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(urls[i]);
    expect(await popup.evaluate(() => window.opener === null)).toBe(true);
    await expect(page).toHaveURL(homeURL);
    await popup.close();
    await page.locator('.logo').first().focus();
  }
});

test('远程桌面和文件鼠标轨迹、菜单时序及终端滚动与设计一致', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.feature-grid').scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const desktop = page.locator('.desktop-pointer');
  await expect
    .poll(() => desktop.evaluate((n) => n.getAnimations().length))
    .toBe(1);
  const freeze = async (selector: string, time: number) =>
    page.locator(selector).evaluate((n, time) => {
      for (const a of n.getAnimations()) {
        a.pause();
        a.currentTime = time;
      }
    }, time);
  await freeze('.desktop-pointer', 1400);
  await expect(desktop).toHaveCSS('left', '40px');
  await expect(desktop).toHaveCSS('top', '40px');
  await freeze('.desktop-pointer', 3200);
  await expect(desktop).toHaveCSS('left', '112px');
  await freeze('.file-pointer', 1400);
  await expect(page.locator('.file-pointer')).toHaveCSS('left', '80px');
  await expect(page.locator('.file-pointer')).toHaveCSS('top', '60px');
  await freeze('.demo-menu', 1000);
  await expect(page.locator('.demo-menu')).toHaveCSS('opacity', '0');
  await freeze('.demo-menu', 2200);
  await expect(page.locator('.demo-menu')).toHaveCSS('opacity', '1');
  await freeze('.terminal-log', 7500);
  const offset = await page
    .locator('.terminal-log')
    .evaluate((n) => new DOMMatrix(getComputedStyle(n).transform).m42);
  expect(offset).toBeLessThan(-100);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('鼠标打开教程返回后移开即隐藏遮罩，键盘聚焦仍可查看教程', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, '触屏端使用常显按钮，不使用悬停遮罩');
  await page.context().route('https://doc.linkease.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<title>Tutorial</title>',
    }),
  );
  await page.goto('/');
  for (const link of await page.locator('.feature-link').all()) {
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    const popupPromise = page.waitForEvent('popup');
    await link.click();
    const popup = await popupPromise;
    await popup.close();
    await page.bringToFront();
    await page.mouse.move(0, 0);
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('opacity', '0');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('opacity', '1');
    await page.locator('.logo').first().click();
  }
});
