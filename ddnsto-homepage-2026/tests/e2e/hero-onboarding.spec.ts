import { test, expect } from '@playwright/test';

test('首屏三步键盘与快速切换保持单一面板，模拟不发业务请求', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const requests: string[] = [];
  page.on('request', (r) => {
    if (['fetch', 'xhr'].includes(r.resourceType()) && !r.url().includes('/@'))
      requests.push(r.url());
  });
  const tabs = page.locator('[data-hero-step]');
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.story-console')).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.locator('.access-pair')).toBeVisible();
  await page.keyboard.press('Home');
  await expect(page.locator('.install-story')).toBeVisible();
  for (const i of [2, 0, 1, 2]) await tabs.nth(i).click();
  await expect(page.locator('[data-hero-panel]:visible')).toHaveCount(1);
  await expect(page.locator('[data-hero-panel="2"]')).toBeVisible();
  expect(requests).toEqual([]);
});

test('首屏安装入口选择正确设备，脚本入口可达', async ({ page }) => {
  await page.goto('/');
  for (const id of ['macos', 'asusgo', 'openwrt']) {
    await page.locator(`.hero [data-install-platform="${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`platform=${id}#devices$`));
    await expect(page.locator(`[data-platform="${id}"]`)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator(`[data-guide="${id}"]`)).toBeVisible();
  }
  await page.locator('.hero-install-links a[href="#install-options"]').click();
  await expect(page).toHaveURL(/#install-options$/);
  await expect(page.locator('[data-platform=terminal-unix]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    page.getByRole('button', { name: '扫码获取安装命令', exact: true }),
  ).toBeVisible();
});

test('轮播在离屏、焦点、手动暂停和后台停止', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('hero-onboarding');
  await expect(hero).toHaveAttribute('data-running', 'true');
  await page.locator('[data-hero-step="0"]').focus();
  await expect(hero).toHaveAttribute('data-running', 'false');
  await page.locator('.hero-motion-toggle').click();
  await expect(page.locator('.hero-motion-toggle')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.locator('.hero h1').click();
  await page.mouse.move(0, 0);
  await expect(hero).toHaveAttribute('data-running', 'false');
  await page.locator('.hero-motion-toggle').focus();
  await page.locator('.hero-motion-toggle').click();
  await page.locator('.hero h1').click();
  await page.mouse.move(0, 0);
  await expect(hero).toHaveAttribute('data-running', 'true');
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
  await page.locator('#devices').scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute('data-running', 'false');
});

test('macOS 优先安装，iPad 不误判为 Mac', async ({ browser, baseURL }) => {
  for (const touch of [0, 5]) {
    const context = await browser.newContext();
    await context.addInitScript((value) => {
      Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => value });
    }, touch);
    const page = await context.newPage();
    await page.goto(baseURL!);
    await expect(page.locator('.hero-download.primary')).toHaveAttribute(
      'data-download',
      touch ? 'windows' : 'macos',
    );
    await context.close();
  }
});

test('第三步电脑和手机加载圆环在选中后旋转，显式暂停与后台仍停止', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-hero-step="2"]').click();
  const hero = page.locator('hero-onboarding');
  const spinners = page.locator('.access-loading .animate-spin');
  await expect(spinners).toHaveCount(2);
  // Keep focus on the step: autoplay pauses, but the selected illustration must play.
  await page.locator('[data-hero-step="2"]').focus();
  await expect(hero).toHaveAttribute('data-running', 'false');
  for (const spinner of await spinners.all()) {
    await expect
      .poll(() => spinner.evaluate((e) => getComputedStyle(e).animationName))
      .toBe('hero-access-spin');
    const before = await spinner.evaluate((e) => getComputedStyle(e).transform);
    await expect
      .poll(() => spinner.evaluate((e) => getComputedStyle(e).transform))
      .not.toBe(before);
  }
  await page.locator('.hero-motion-toggle').click();
  for (const spinner of await spinners.all()) {
    await expect
      .poll(() =>
        spinner.evaluate((e) => getComputedStyle(e).animationPlayState),
      )
      .toBe('paused');
  }
  await page.locator('.hero-motion-toggle').click();
  await expect(hero).toHaveAttribute('data-animating', 'true');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(hero).toHaveAttribute('data-animating', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('[data-hero-step="2"]').click();
  await expect(page.locator('.access-loading').first()).toBeHidden();
});
