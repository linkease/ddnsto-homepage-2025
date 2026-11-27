import { test, expect } from '@playwright/test';
import {
  prepareAuthenticatedCommand,
  TEST_DEVICE_TOKEN,
  mockInstallScan,
} from './install-helpers';

test('homepage QR login renders the device token, clears on cancel and does not persist credentials', async ({
  page,
}) => {
  const calls = await mockInstallScan(page);
  let finishPoll: () => void = () => {};
  const scanned = new Promise<void>((resolve) => {
    finishPoll = resolve;
  });
  await page.context().addCookies([
    {
      name: 'sessionid',
      value: 'console-fixture',
      url: 'http://127.0.0.1:16208',
    },
  ]);
  await page.route('**/__install-auth-api/poll', async (route) => {
    await scanned;
    await route.fulfill({
      json: { events: [{ data: { token: 'proof-fixture' } }] },
    });
  });
  await page.goto('/#devices');
  await expect(page.locator('[data-copy-id=primary]')).toBeDisabled();
  await page.getByRole('tab', { name: /一键脚本/ }).click();
  await page
    .getByRole('button', { name: '扫码获取安装命令', exact: true })
    .click();
  await expect(page.locator('[data-login-qr]')).toBeVisible();
  await expect(page.locator('[data-login-qr]')).toHaveAttribute(
    'src',
    /^data:image\/png/,
  );
  finishPoll();
  await expect(page.locator('[data-scan-state=ready]')).toBeVisible();
  await expect(page.locator('.si-command')).toContainText(TEST_DEVICE_TOKEN);
  expect(await page.locator('body').textContent()).not.toContain(
    'proof-fixture',
  );
  const persisted = await page.evaluate(() =>
    JSON.stringify({
      local: { ...localStorage },
      session: { ...sessionStorage },
      url: location.href,
    }),
  );
  expect(persisted).not.toContain(TEST_DEVICE_TOKEN);
  await page.getByRole('button', { name: '清除本页令牌' }).click();
  await expect(page.locator('.si-command')).toBeEmpty();
  await expect(page.locator('#manual-primary')).toHaveValue('');
  await expect(page.locator('[data-copy-id=primary]')).toBeDisabled();
  expect(
    (await page.context().cookies()).find((c) => c.name === 'sessionid')?.value,
  ).toBe('console-fixture');
  // A second click must allocate another session and show QR before polling finishes.
  await page.unroute('**/__install-auth-api/poll');
  await page.route('**/__install-auth-api/poll', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ json: { events: [] } }).catch(() => {});
  });
  await page
    .getByRole('button', { name: '扫码获取安装命令', exact: true })
    .click();
  await expect(page.locator('[data-login-qr]')).toBeVisible();
  expect(calls.filter((c) => c === 'create')).toHaveLength(2);
  await expect(page.locator('.si-command')).toBeEmpty();
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await page.reload();
  await page.getByRole('tab', { name: /一键脚本/ }).click();
  await page
    .getByRole('button', { name: '扫码获取安装命令', exact: true })
    .click();
  await expect(page.locator('[data-login-qr]')).toBeVisible();
  expect(calls.filter((c) => c === 'create')).toHaveLength(3);
  await expect(page.locator('.si-command')).toBeEmpty();
  await page.getByRole('button', { name: '取消', exact: true }).click();
});

test('invalid token cannot enable commands; retry and platform change clear credentials', async ({
  page,
}) => {
  await page.goto('/#devices');
  await prepareAuthenticatedCommand(page);
  await page.locator('[data-platform=terminal-unix]').click();
  await expect(page.locator('.si-command')).toBeEmpty();
  await page.route('**/__install-auth-api/profile', (route) =>
    route.fulfill({ json: [{ id: 1, token: 'bad\ntoken' }] }),
  );
  await page
    .getByRole('button', { name: '扫码获取安装命令', exact: true })
    .click();
  await expect(page.locator('[data-auth-status]')).toContainText(
    '设备令牌格式异常',
  );
  await expect(page.locator('[data-copy-id=primary]')).toBeDisabled();
  await expect(page.locator('[data-scan-state=ready]')).toBeHidden();
  await page.route('**/__install-auth-api/profile', (route) =>
    route.fulfill({ json: [{ id: 1, token: TEST_DEVICE_TOKEN }] }),
  );
  await page.getByRole('button', { name: '刷新二维码', exact: true }).click();
  await expect(page.locator('[data-scan-state=ready]')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await expect(page.locator('.si-command')).toBeEmpty();
  await expect(page.locator('#manual-primary')).toHaveValue('');
});

test('leaving the platform during profile fetch discards late credentials', async ({
  page,
}) => {
  await mockInstallScan(page);
  let release: () => void = () => {};
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
  await page.goto('/?platform=terminal-unix#devices');
  await page
    .getByRole('button', { name: '扫码获取安装命令', exact: true })
    .click();
  await expect.poll(() => requested).toBe(true);
  await page.locator('[data-platform=terminal-windows]').click();
  release();
  await page.waitForTimeout(200);
  await expect(page.locator('[data-scan-state=idle]')).toBeVisible();
  await expect(page.locator('.si-command')).toBeEmpty();
  await expect(page.locator('[data-copy-id=primary]')).toBeDisabled();
});
