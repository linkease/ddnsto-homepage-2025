import { test, expect } from '@playwright/test';
import { mockInstallScan, TEST_DEVICE_TOKEN } from './install-helpers';

test('every container token entry opens a fresh scan dialog, copies and clears', async ({
  page,
  context,
}) => {
  const calls = await mockInstallScan(page);
  await page.goto('/?platform=fnos#devices');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).copiedToken = text;
        },
      },
    }),
  );
  const dialog = page.locator('.token-scan-dialog');
  let openings = 0;
  for (const platform of [
    'fnos',
    'unraid',
    'terramaster',
    'zspace',
    'ugreen',
    'docker',
  ]) {
    await page.locator(`[data-platform=${platform}]`).click();
    for (const method of platform === 'fnos'
      ? ['compose', 'docker']
      : ['unraid', 'terramaster', 'docker'].includes(platform)
        ? ['docker', 'compose']
        : ['docker']) {
      await page.locator(`[data-method=${method}]`).click();
      const opener = page.locator('[data-token-scan]:visible');
      await expect(opener).toHaveCount(1);
      await opener.click();
      openings++;
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('[data-token-value]')).toHaveText(
        TEST_DEVICE_TOKEN,
      );
      await dialog
        .getByRole('button', { name: '复制令牌', exact: true })
        .click();
      expect(await page.evaluate(() => (window as any).copiedToken)).toBe(
        TEST_DEVICE_TOKEN,
      );
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(dialog.locator('[data-token-value]')).toBeEmpty();
      await expect(opener).toBeFocused();
    }
  }
  expect(calls.filter((x) => x === 'create')).toHaveLength(openings);
  expect(calls).not.toContain('logout');
  expect(context.pages()).toHaveLength(1);
  expect(
    await page.evaluate(
      () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage),
    ),
  ).not.toContain(TEST_DEVICE_TOKEN);
});

test('QR renders, close cancels polling and late credentials cannot reappear', async ({
  page,
}) => {
  await mockInstallScan(page, { emptyPoll: true });
  await page.goto('/?platform=unraid#devices');
  const dialog = page.locator('.token-scan-dialog');
  await page.locator('[data-token-scan]:visible').click();
  await expect(dialog.locator('[data-token-qr]')).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
  await expect(dialog.locator('[data-token-qr]')).not.toHaveAttribute('src');
  await mockInstallScan(page);
  let release!: () => void;
  let requested = false;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/__install-auth-api/profile', async (route) => {
    requested = true;
    await pending;
    await route
      .fulfill({ json: [{ id: 1, token: TEST_DEVICE_TOKEN }] })
      .catch(() => {});
  });
  await page.locator('[data-token-scan]:visible').click();
  await expect.poll(() => requested).toBe(true);
  await dialog.getByRole('button', { name: '关闭令牌弹窗' }).click();
  release();
  await page.waitForTimeout(150);
  await expect(dialog.locator('[data-token-value]')).toBeEmpty();
  await expect(dialog).not.toBeVisible();
});

test('retry, failed clipboard fallback and pagehide clear token state', async ({
  page,
}) => {
  await mockInstallScan(page, { failQr: true });
  await page.goto('/?platform=docker#devices');
  const dialog = page.locator('.token-scan-dialog');
  await page.locator('[data-token-scan]:visible').click();
  await expect(dialog.locator('[data-token-retry]')).toBeVisible();
  await expect(dialog.locator('[data-token-copy]')).toBeDisabled();
  await mockInstallScan(page);
  await dialog.locator('[data-token-retry]').click();
  await expect(dialog.locator('[data-token-value]')).toHaveText(
    TEST_DEVICE_TOKEN,
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('denied')) },
    });
    document.execCommand = () => false;
  });
  await dialog.locator('[data-token-copy]').click();
  await expect(dialog.locator('[data-token-fallback]')).toBeVisible();
  await expect(dialog.locator('[data-token-fallback]')).toHaveValue(
    TEST_DEVICE_TOKEN,
  );
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await expect(dialog).not.toBeVisible();
  await expect(dialog.locator('[data-token-value]')).toBeEmpty();
  await expect(dialog.locator('[data-token-fallback]')).toHaveValue('');
});

test('a delayed clipboard result cannot update a reopened token dialog', async ({
  page,
}) => {
  await mockInstallScan(page);
  await page.goto('/?platform=fnos#devices');
  const dialog = page.locator('.token-scan-dialog');
  await page.locator('[data-token-scan]:visible').click();
  await expect(dialog.locator('[data-token-value]')).toHaveText(
    TEST_DEVICE_TOKEN,
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () =>
          new Promise<void>((resolve) => {
            (window as any).releaseTokenCopy = resolve;
          }),
      },
    }),
  );
  await dialog.locator('[data-token-copy]').click();
  await page.keyboard.press('Escape');
  await page.locator('[data-token-scan]:visible').click();
  await expect(dialog.locator('[data-token-copy]')).toBeEnabled();
  await page.evaluate(() => (window as any).releaseTokenCopy());
  await expect(dialog.locator('[data-token-copy-status]')).toBeEmpty();
  await page.evaluate(() =>
    window.dispatchEvent(new PopStateEvent('popstate')),
  );
  await expect(dialog).not.toBeVisible();
  await expect(dialog.locator('[data-token-value]')).toBeEmpty();
});
