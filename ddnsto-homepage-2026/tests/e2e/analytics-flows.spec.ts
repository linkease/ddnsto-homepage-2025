import { test, expect, type Page } from '@playwright/test';
import { mockInstallScan, TEST_DEVICE_TOKEN } from './install-helpers';

async function observe(page: Page, mode = 'record') {
  await page.evaluate((mode) => {
    document.documentElement.dataset.analyticsEnabled = 'true';
    (window as any).observed = [];
    (window as any).gtag =
      mode === 'missing'
        ? undefined
        : (...args: unknown[]) => {
            if (mode === 'throw') throw new Error('SDK failed');
            if (mode === 'reject')
              return Promise.reject(new Error('SDK rejected'));
            (window as any).observed.push(args);
          };
  }, mode);
}
const events = (page: Page) =>
  page.evaluate(
    () =>
      (window as any).observed as [string, string, Record<string, string>][],
  );
async function controlledPoll(page: Page) {
  let finish: ((success: boolean) => void) | undefined;
  await page.route('**/__install-auth-api/poll', async (route) => {
    const success = await new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    await route
      .fulfill({
        status: success ? 200 : 502,
        json: { events: [{ data: { token: 'proof-fixture' } }] },
      })
      .catch(() => {});
  });
  return async (success = true) => {
    await expect.poll(() => Boolean(finish)).toBe(true);
    const done = finish!;
    finish = undefined;
    done(success);
  };
}

test.beforeEach(async ({ context }) => {
  await context.route('https://www.googletagmanager.com/**', (r) =>
    r.fulfill({ body: '' }),
  );
  await context.route('https://hm.baidu.com/**', (r) =>
    r.fulfill({ body: '' }),
  );
});

test('every console/download/purchase link is classified once, with plan and section; homepage links do not count', async ({
  page,
}) => {
  await page.goto('/');
  await observe(page);
  // Block only test navigation; use each real link and its native click path.
  const links = page.locator(
    'a[href*="web.ddnsto.com/app"], a[href*="fw.koolcenter.com/binary/ddnsto/windows/"], a[href*="fw.koolcenter.com/binary/ddnsto/pc/"]',
  );
  const count = await links.count();
  expect(count).toBeGreaterThan(10);
  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    const href = await link.getAttribute('href');
    const plan = await link.getAttribute('data-purchase-plan');
    await link.evaluate((a) => {
      a.addEventListener('click', (e) => e.preventDefault(), { once: true });
      (a as HTMLAnchorElement).click();
    });
    await expect.poll(async () => (await events(page)).length).toBe(i + 1);
    const current = (await events(page))[i];
    expect(current[1]).toBe(
      href!.includes('entry=purchase')
        ? 'click_purchase'
        : href!.includes('fw.koolcenter.com')
          ? 'click_windows_download'
          : 'click_login_console',
    );
    expect(current[2]).toMatchObject({
      source: 'website',
      language: 'zh',
      send_to: 'G-1QGR1XG068',
    });
    if (plan) expect(current[2].plan).toBe(plan);
  }
  await page
    .locator('footer a[href="https://web.ddnsto.com/"]')
    .evaluate((a) => {
      a.addEventListener('click', (e) => e.preventDefault(), { once: true });
      (a as HTMLAnchorElement).click();
    });
  await page.waitForTimeout(50);
  expect((await events(page)).length).toBe(count);
  await page.goto('/devices/windows/');
  await observe(page);
  const download = page
    .locator('a[href="https://fw.koolcenter.com/binary/ddnsto/pc/"]')
    .first();
  await download.evaluate((a) => {
    a.addEventListener('click', (e) => e.preventDefault(), { once: true });
    (a as HTMLAnchorElement).click();
  });
  await expect.poll(async () => (await events(page)).length).toBe(1);
  expect((await events(page))[0][2].section).toBe('device_guide');
});

for (const platform of ['windows', 'macos_linux'] as const)
  test(`${platform}: QR view and first copy only; retries dedupe, new rounds reset`, async ({
    page,
  }) => {
    await mockInstallScan(page);
    const complete = await controlledPoll(page);
    await page.goto(
      '/?platform=' +
        (platform === 'windows' ? 'terminal-windows' : 'terminal-unix') +
        '#devices',
    );
    await observe(page);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
      document.execCommand = () => false;
    });
    await page
      .getByRole('button', { name: '扫码获取安装命令', exact: true })
      .click();
    await expect(page.locator('[data-login-qr]')).toBeVisible();
    await expect.poll(async () => (await events(page)).length).toBe(1);
    await complete(false);
    await expect(page.locator('[data-auth-retry]')).toBeVisible();
    await page.locator('[data-auth-retry]').click();
    await expect(page.locator('[data-login-qr]')).toBeVisible();
    await page.waitForTimeout(50);
    expect((await events(page)).length).toBe(1);
    await complete();
    await expect(page.locator('[data-scan-state=ready]')).toBeVisible();
    expect((await events(page)).length).toBe(1); // Authentication alone is not the conversion.
    await page.locator('[data-copy-id=primary]').click();
    await expect(page.locator('#manual-primary')).toBeVisible();
    await page.locator('[data-copy-id=primary]').click();
    await expect.poll(async () => (await events(page)).length).toBe(2);
    const recorded = await events(page);
    expect(recorded.map((e) => e[1])).toEqual([
      `click_${platform}_scan_open`,
      `click_${platform}_install_copy`,
    ]);
    expect(recorded[1][2]).toMatchObject({
      section: 'installation',
      platform,
      command_variant: 'primary',
    });
    expect(JSON.stringify(recorded)).not.toMatch(
      /device-token-fixture|proof-fixture|fixture-1|install\.sh/,
    );
    await expect(page.locator('#manual-primary')).toHaveValue(
      new RegExp(TEST_DEVICE_TOKEN),
    );
    await page.getByRole('button', { name: '清除本页令牌' }).click();
    await page
      .getByRole('button', { name: '扫码获取安装命令', exact: true })
      .click();
    await expect(page.locator('[data-login-qr]')).toBeVisible();
    await expect.poll(async () => (await events(page)).length).toBe(3);
    await page.getByRole('button', { name: '取消', exact: true }).click();
    await complete();
  });

test('QR acquisition failure does not count, and other platform scripts do not enter terminal funnel', async ({
  page,
}) => {
  await mockInstallScan(page, { failQr: true });
  await page.goto('/?platform=terminal-unix#devices');
  await observe(page);
  await page
    .getByRole('button', { name: '扫码获取安装命令', exact: true })
    .click();
  await expect(page.locator('[data-auth-retry]')).toBeVisible();
  expect(await events(page)).toEqual([]);
  await mockInstallScan(page);
  await page.locator('[data-platform=easepi]').click();
  await page.getByRole('tab', { name: /一键脚本/ }).click();
  await page
    .getByRole('button', { name: '扫码获取安装命令', exact: true })
    .click();
  await expect(page.locator('[data-scan-state=ready]')).toBeVisible();
  await page.locator('[data-copy-id=primary]').click();
  await page.waitForTimeout(100);
  expect(await events(page)).toEqual([]);
});

for (const mode of ['missing', 'throw', 'reject'])
  test(`SDK ${mode}: QR/copy, purchase and Windows download still complete`, async ({
    page,
    context,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await mockInstallScan(page);
    const complete = await controlledPoll(page);
    await context.route('https://web.ddnsto.com/app/**', (r) =>
      r.fulfill({ body: '<title>Purchase</title>' }),
    );
    await context.route(
      'https://fw.koolcenter.com/binary/ddnsto/windows/**',
      (r) =>
        r.fulfill({
          contentType: 'application/octet-stream',
          headers: { 'Content-Disposition': 'attachment; filename="test.zip"' },
          body: 'test fixture',
        }),
    );
    await page.goto('/?platform=terminal-windows#devices');
    await observe(page, mode);
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            (window as any).copied = text;
          },
        },
      }),
    );
    await page
      .getByRole('button', { name: '扫码获取安装命令', exact: true })
      .click();
    await expect(page.locator('[data-login-qr]')).toBeVisible();
    await complete();
    await expect(page.locator('[data-scan-state=ready]')).toBeVisible();
    await page.locator('[data-copy-id=primary]').click();
    await expect(
      page.locator('[data-command-block=primary] [data-copy-status]'),
    ).toContainText('已复制');
    expect(await page.evaluate(() => (window as any).copied)).toContain(
      TEST_DEVICE_TOKEN,
    );
    const popupPromise = page.waitForEvent('popup');
    await page.locator('[data-purchase-plan=standard]').click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(/entry=purchase/);
    await popup.close();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-download=windows]').click();
    const download = await downloadPromise;
    await download.cancel();
    await page.waitForTimeout(100);
    expect(errors).toEqual([]);
  });
