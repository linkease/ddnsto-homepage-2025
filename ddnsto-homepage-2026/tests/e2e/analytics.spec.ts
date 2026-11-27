import { test, expect } from '@playwright/test';
const production = process.env.SITE_ENV === 'production';
const destination =
  'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices';

test('statistics initialization and corresponding CTA events preserve navigation', async ({
  page,
  context,
  isMobile,
}) => {
  await context.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ body: '' }),
  );
  await context.route('https://hm.baidu.com/**', (route) =>
    route.fulfill({ body: '' }),
  );
  await context.route('https://web.ddnsto.com/app/**', (route) =>
    route.fulfill({ body: '<title>Console destination</title>' }),
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/DDNSTO/);
  await expect(page.locator('h1')).toContainText('远程访问');
  await expect(
    page.locator('script[src="/script/google-analytics.js"]'),
  ).toHaveCount(production ? 1 : 0);
  await expect(page.locator('script[src="/script/analytics.js"]')).toHaveCount(
    production ? 1 : 0,
  );
  const sections = isMobile
    ? ['hero', 'navbar_mobile']
    : ['hero', 'navbar_desktop'];
  for (const section of sections) {
    if (section === 'hero') await page.locator('[data-hero-step="1"]').click();
    if (section === 'navbar_mobile') await page.locator('#open-menu').click();
    const popupPromise = page.waitForEvent('popup');
    await page.locator(`[data-console-section="${section}"]`).click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(destination);
    await popup.close();
    if (section === 'navbar_mobile')
      await expect(page.locator('#menu-dialog')).not.toBeVisible();
  }
  const commands = await page.evaluate(() => {
    const queue =
      (window as Window & { dataLayer?: IArguments[] }).dataLayer || [];
    return queue.map((command) => ({
      kind: Object.prototype.toString.call(command),
      values: Array.from(command),
    }));
  });
  if (production) {
    expect(commands).toHaveLength(2 + sections.length);
    expect(
      commands.every((command) => command.kind === '[object Arguments]'),
    ).toBe(true);
    expect(commands[1].values).toEqual(['config', 'G-1QGR1XG068']);
    for (const [i, section] of sections.entries()) {
      expect(commands[2 + i].values).toEqual([
        'event',
        'click_login_console',
        { send_to: 'G-1QGR1XG068', source: 'website', section, language: 'zh' },
      ]);
    }
  } else expect(commands).toEqual([]);
  // Missing or throwing SDKs must not block any tracked link.
  for (const failure of ['missing', 'throw', 'reject'] as const) {
    await page.evaluate((mode) => {
      (window as any).gtag =
        mode === 'missing'
          ? undefined
          : () => {
              if (mode === 'reject')
                return Promise.reject(new Error('SDK rejected'));
              throw new Error('SDK unavailable');
            };
    }, failure);
    for (const section of sections) {
      if (section === 'hero')
        await page.locator('[data-hero-step="1"]').click();
      if (section === 'navbar_mobile') await page.locator('#open-menu').click();
      const popupPromise = page.waitForEvent('popup');
      await page.locator(`[data-console-section="${section}"]`).click();
      const popup = await popupPromise;
      await expect(popup).toHaveURL(destination);
      await popup.close();
      if (section === 'navbar_mobile')
        await expect(page.locator('#menu-dialog')).not.toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});
