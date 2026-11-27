import { test, expect } from '@playwright/test';
import {
  aiPrompt,
  installCommand,
  windowsCommand,
  wgetCommand,
  downloadCommand,
} from '../../src/content/installMethods';
import {
  prepareAuthenticatedCommand,
  authenticatedCommand,
} from './install-helpers';
test('method keyboard selection, unsupported platform recovery and terminal entries reset scan state', async ({
  page,
}) => {
  await page.route('**/__install-auth-api/create', (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  const requests: string[] = [];
  page.on('request', (r) => {
    if (!['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname))
      requests.push(r.url());
  });
  await page.goto('/#devices');
  const tabs = page.locator('[data-method]');
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await page
    .getByRole('button', { name: '扫码获取安装命令', exact: true })
    .click();
  await expect(page.locator('[data-scan-state=scanning]')).toContainText(
    '请求失败',
  );
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.locator('[data-scan-state=idle]')).toBeVisible();
  await prepareAuthenticatedCommand(page);
  await expect(page.locator('.si-command')).toContainText(
    'device-token-fixture',
  );
  await tabs.nth(2).click();
  await expect(
    page.getByRole('textbox', { name: 'AI 安装提示词' }),
  ).toHaveValue(aiPrompt);
  await tabs.nth(1).click();
  await expect(page.locator('[data-scan-state=idle]')).toBeVisible();
  await page.locator('[data-platform=docker]').click();
  await expect(page.locator('[data-method=script]')).toBeHidden();
  await expect(tabs.first()).toHaveText('命令安装');
  await expect(page.locator('[data-method-panel=docker]')).toBeVisible();
  await expect(page.locator('[data-platform=terminal-windows]')).toHaveCount(0);
  await expect(page.locator('[data-platform=windows]')).toBeVisible();
  // The entry is temporarily commented out; its installation flow is retained.
  await page.goto('/?platform=terminal-windows#devices');
  await expect(page.locator('.install-method-tabs')).toBeHidden();
  await expect(page.locator('[data-preparation]')).toContainText('管理员');
  await page
    .getByRole('button', { name: '扫码获取安装命令', exact: true })
    .click();
  await expect(page.locator('[data-scan-state=ready]')).toBeVisible();
  await expect(page.locator('.si-command')).toHaveText(
    authenticatedCommand(windowsCommand),
  );
  await page.locator('[data-platform=terminal-unix]').click();
  await expect(page.locator('[data-scan-state=idle]')).toBeVisible();
  await expect(page.locator('[data-preparation]')).toContainText('不要加 sudo');
  await page.locator('[data-platform=macos]').click();
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  expect(requests).toEqual([]);
});
test('all commands and AI prompt copy exact text; asynchronous clipboard result cannot alter another platform', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).copied = text;
        },
      },
    }),
  );
  await page.goto('/#devices');
  await prepareAuthenticatedCommand(page);
  for (const [key, value] of [
    ['primary', installCommand],
    ['wget', wgetCommand],
    ['download', downloadCommand],
  ]) {
    const block = page.locator(`[data-command-block=${key}]`);
    if (key === 'wget')
      await page
        .getByText('其他下载方式（wget / 下载后执行）', { exact: true })
        .click();
    await block.locator('[data-copy-id]').click();
    expect(await page.evaluate(() => (window as any).copied)).toBe(
      authenticatedCommand(value),
    );
    await expect(block.locator('[data-copy-status]')).toContainText('已复制');
  }
  await page.locator('#method-ai').click();
  await page.locator('[data-copy-id=ai]').click();
  expect(await page.evaluate(() => (window as any).copied)).toBe(aiPrompt);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('denied')) },
    });
    document.execCommand = () => false;
  });
  await page.locator('[data-copy-id=ai]').click();
  await expect(page.locator('#manual-ai')).toBeFocused();
  await expect(page.locator('#manual-ai')).toHaveValue(aiPrompt);
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () =>
          new Promise((resolve) => ((window as any).resolveCopy = resolve)),
      },
    }),
  );
  await page.locator('[data-copy-id=ai]').click();
  await page.locator('[data-platform=windows]').click();
  await page.evaluate(() => (window as any).resolveCopy());
  await expect(page.locator('[data-platform=windows]')).toBeFocused();
  await expect(
    page.locator('[data-command-block=ai] [data-copy-status]'),
  ).toBeEmpty();
  await expect(page.locator('[data-copy-id=ai]')).toBeEnabled();
});
