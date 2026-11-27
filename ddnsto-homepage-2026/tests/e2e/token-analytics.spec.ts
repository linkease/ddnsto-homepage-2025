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

test('container events carry all entry dimensions, deduplicate copies and reset on reopen', async ({
  page,
}) => {
  await mockInstallScan(page);
  const finish = await controlledPoll(page);
  await page.goto('/?platform=fnos#devices');
  await observe(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error('denied')),
      },
    });
    document.execCommand = () => false;
  });
  const dialog = page.locator('.token-scan-dialog');
  let count = 0;
  for (const platform of [
    'fnos',
    'unraid',
    'terramaster',
    'zspace',
    'ugreen',
    'docker',
    'fnos',
  ]) {
    await page.locator('[data-platform=' + platform + ']').click();
    for (const method of ['zspace', 'ugreen'].includes(platform)
      ? ['docker']
      : ['docker', 'compose']) {
      await page.locator('[data-method=' + method + ']').click();
      await page.locator('[data-token-scan]:visible').click();
      await expect(dialog.locator('[data-token-qr]')).toBeVisible();
      await expect.poll(async () => (await events(page)).length).toBe(++count);
      expect((await events(page)).at(-1)).toEqual([
        'event',
        'click_token_scan_open',
        {
          send_to: 'G-1QGR1XG068',
          source: 'website',
          language: 'zh',
          section: 'installation',
          platform,
          method,
        },
      ]);
      await finish();
      await expect(dialog.locator('[data-token-value]')).toHaveText(
        TEST_DEVICE_TOKEN,
      );
      await dialog.locator('[data-token-copy]').click();
      await expect(dialog.locator('[data-token-fallback]')).toHaveValue(
        TEST_DEVICE_TOKEN,
      );
      await dialog.locator('[data-token-copy]').click();
      await expect.poll(async () => (await events(page)).length).toBe(++count);
      expect((await events(page)).at(-1)).toEqual([
        'event',
        'click_token_copy',
        {
          send_to: 'G-1QGR1XG068',
          source: 'website',
          language: 'zh',
          section: 'installation',
          platform,
          method,
        },
      ]);
      await page.keyboard.press('Escape');
    }
  }
  expect(JSON.stringify(await events(page))).not.toContain(TEST_DEVICE_TOKEN);
});

test('QR failure does not count, retry within an opening counts only once', async ({
  page,
}) => {
  await mockInstallScan(page, { failQr: true });
  await page.goto('/?platform=docker#devices');
  await observe(page);
  await page.locator('[data-token-scan]:visible').click();
  const dialog = page.locator('.token-scan-dialog');
  await expect(dialog.locator('[data-token-retry]')).toBeVisible();
  expect(await events(page)).toEqual([]);
  await mockInstallScan(page);
  const finish = await controlledPoll(page);
  await dialog.locator('[data-token-retry]').click();
  await expect(dialog.locator('[data-token-qr]')).toBeVisible();
  await expect.poll(async () => (await events(page)).length).toBe(1);
  await finish(false);
  await expect(dialog.locator('[data-token-retry]')).toBeVisible();
  await dialog.locator('[data-token-retry]').click();
  await expect(dialog.locator('[data-token-qr]')).toBeVisible();
  await finish();
  await expect(dialog.locator('[data-token-copy]')).toBeEnabled();
  expect((await events(page)).map((e) => e[1])).toEqual([
    'click_token_scan_open',
  ]);
});

test('missing, throwing and rejecting SDK never block scan, copy or close', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await mockInstallScan(page);
  const finish = await controlledPoll(page);
  await page.goto('/?platform=fnos#devices');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => {} },
    }),
  );
  for (const mode of ['missing', 'throw', 'reject']) {
    await observe(page, mode);
    await page.locator('[data-token-scan]:visible').click();
    const dialog = page.locator('.token-scan-dialog');
    await expect(dialog.locator('[data-token-qr]')).toBeVisible();
    await finish();
    await expect(dialog.locator('[data-token-copy]')).toBeEnabled();
    await dialog.locator('[data-token-copy]').click();
    await expect(dialog.locator('[data-token-copy-status]')).toContainText(
      '令牌已复制',
    );
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  }
  expect(errors).toEqual([]);
});
