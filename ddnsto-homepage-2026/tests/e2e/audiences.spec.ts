import { test, expect } from '@playwright/test';
test('new section order, keyboard/touch tabs without legacy demo', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#scenarios');
  const order = await page
    .locator('main > section')
    .evaluateAll((nodes) =>
      nodes.map((n) => n.id || (n.classList.contains('hero') ? 'hero' : '')),
    );
  expect(order).toEqual([
    'hero',
    'features',
    'scenarios',
    'devices',
    'pricing',
    'faq',
  ]);
  await expect(
    page.locator(
      '#interactive-experience, scenario-demo, #manual-workflow, .faq-library',
    ),
  ).toHaveCount(0);
  const tabs = page.locator('audience-tabs [role=tab]');
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(page.locator('#audience-panel-it')).toBeVisible();
  await page.keyboard.press('End');
  await expect(tabs.nth(3)).toBeFocused();
  await expect(page.locator('#audience-panel-ai')).toContainText(
    '我的 AI 工作台',
  );
  for (let i = 0; i < 4; i++) {
    await tabs.nth(i).click();
    await expect(
      page.locator('audience-tabs [role=tabpanel]:visible'),
    ).toHaveCount(1);
  }
  await page.locator('#audience-panel-ai a').click();
  await expect(page).toHaveURL(/#devices$/);
  expect(errors).toEqual([]);
});
test('automatic audience rotation pauses when focused, offscreen, hidden or reduced; manual choice persists', async ({
  page,
}) => {
  await page.goto('/');
  await page.clock.install();
  const root = page.locator('audience-tabs');
  const tabs = root.getByRole('tab');
  await root.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);
  await page.clock.runFor(2100);
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await tabs.nth(1).focus();
  await page.clock.runFor(4200);
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await page.locator('.logo').first().focus();
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(100);
  await page.clock.runFor(4200);
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await root.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(4200);
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  // Media changes are native browser events, not controlled by page.clock.
  await page.evaluate(() => {
    document.documentElement.dataset.motionChanged = 'false';
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener(
      'change',
      () => {
        document.documentElement.dataset.motionChanged = 'true';
      },
      { once: true },
    );
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute(
    'data-motion-changed',
    'true',
  );
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(4200);
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await tabs.nth(3).click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.mouse.move(0, 0);
  await page.clock.runFor(8400);
  await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
});
test('without JavaScript all audience content remain readable', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:16208/#scenarios');
  for (const id of ['nas', 'it', 'home', 'ai'])
    await expect(page.locator(`#audience-panel-${id}`)).toBeVisible();
  await context.close();
});

// A real clock independently verifies the media/visibility behavior behind the simulated test.
test('real clock preserves audience selection when reduced motion resumes from background', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await expect(page).toHaveTitle(/DDNSTO/);
  await expect(page.locator('h1')).toContainText('远程访问');
  const root = page.locator('audience-tabs');
  await root.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(root.locator('[aria-selected=true]')).toHaveAttribute(
    'id',
    'audience-it',
  );
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  // Observe two complete 2s rotation periods without a synthetic clock.
  await page.waitForTimeout(4200);
  await expect(root.locator('[aria-selected=true]')).toHaveAttribute(
    'id',
    'audience-it',
  );
  await expect(root.locator('#audience-panel-it')).toBeVisible();
  expect(
    await page.locator('html').evaluate((e) => e.scrollWidth > innerWidth),
  ).toBe(false);
  await expect(
    page.locator('astro-error-overlay, vite-error-overlay'),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `artifacts/refresh-m6-followup/${testInfo.project.name}-reduced.png`,
    scale: 'css',
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(root.locator('[aria-selected=true]')).not.toHaveAttribute(
    'id',
    'audience-it',
  );
});

test('audience panels fade out then in; rapid selection and reduced motion settle correctly', async ({
  page,
}) => {
  await page.goto('/#scenarios');
  const root = page.locator('audience-tabs');
  await root.scrollIntoViewIfNeeded();
  await page.locator('#audience-nas').click();
  await page.locator('#audience-it').click();
  const old = page.locator('#audience-panel-nas');
  await expect
    .poll(() => old.evaluate((n) => n.getAnimations().length))
    .toBe(1);
  await old.evaluate((n) => n.getAnimations()[0].pause());
  await old.evaluate((n) => {
    n.getAnimations()[0].currentTime = 200;
  });
  const opacity = await old.evaluate((n) =>
    Number(getComputedStyle(n).opacity),
  );
  expect(opacity).toBeGreaterThan(0.1);
  expect(opacity).toBeLessThan(0.9);
  await old.evaluate((n) => n.getAnimations()[0].finish());
  const incoming = page.locator('#audience-panel-it');
  await expect(incoming).toBeVisible();
  await incoming.evaluate((n) => {
    const a = n.getAnimations()[0];
    a.pause();
    a.currentTime = 200;
  });
  expect(
    await incoming.evaluate((n) => Number(getComputedStyle(n).opacity)),
  ).toBeCloseTo(0.5, 1);
  await page.locator('#audience-home').click();
  await page.locator('#audience-ai').click();
  await expect(page.locator('#audience-panel-ai')).toBeVisible();
  await expect
    .poll(() => root.evaluate((n) => n.getAnimations({ subtree: true }).length))
    .toBe(0);
  await expect(root.locator('[role=tabpanel]:visible')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#audience-nas').click();
  await expect(old).toBeVisible();
  await expect
    .poll(() => root.evaluate((n) => n.getAnimations({ subtree: true }).length))
    .toBe(0);
});
