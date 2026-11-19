import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const panel = (page: Page) => page.locator('#experience-panel');
const action = (page: Page, name: string) =>
  panel(page).locator(`[data-action="${name}"]`);
async function choose(page: Page, key: string) {
  await page.locator(`#${key}-scenario`).click();
  await expect(page.locator(`#${key}-scenario`)).toHaveAttribute(
    'aria-selected',
    'true',
  );
}
async function reset(page: Page) {
  await page.getByRole('button', { name: '重新体验', exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#scenarios');
});
test.afterEach(async ({ page }) => {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('应用：发现、选择、无效前缀恢复、域名预览、收藏和复制失败回退', async ({
  page,
}) => {
  await action(page, 'scan').click();
  await expect(page.locator('#lab-prefix')).toBeVisible();
  await expect(action(page, 'add')).toBeDisabled();
  await page.locator('[data-service="0"]').check();
  await expect(page.locator('#lab-all')).toHaveJSProperty(
    'indeterminate',
    true,
  );
  await page.locator('#lab-prefix').fill('-invalid');
  await action(page, 'add').click();
  await expect(page.locator('#lab-error')).toContainText('1–20');
  await expect(page.locator('#lab-prefix')).toBeFocused();
  await page.locator('#lab-prefix').fill('my-house');
  await page.locator('#lab-all').check();
  await action(page, 'add').click();
  await expect(page.locator('.domain-table tbody tr')).toHaveCount(3);
  await page.locator('#domain-protocol').selectOption('http');
  await expect(page.locator('[data-open-service="0"]')).toHaveText(
    'http://my-house-download.example.com',
  );
  await page.locator('[data-open-service="0"]').click();
  await expect(page.locator('.lab-preview')).toContainText('下载任务');
  await page.locator('[data-bookmark="0"]').click();
  await expect(page.locator('[data-bookmark="0"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('denied')) },
    }),
  );
  await page.locator('[data-copy-domain="0"]').click();
  await expect(page.locator('#domain-action-status')).toContainText(
    '手动复制：http://my-house-download.example.com',
  );
  await reset(page);
  await expect(action(page, 'scan')).toBeVisible();
});

test('TCP：协议切换、配置、模拟桌面文件、返回与断开', async ({ page }) => {
  await choose(page, 'tcp');
  await action(page, 'rd-start').click();
  await action(page, 'rd-vnc').click();
  await expect(
    page.getByRole('textbox', { name: '端口', exact: true }),
  ).toHaveValue('5900');
  await action(page, 'rd-rdp').click();
  await expect(
    page.getByRole('textbox', { name: '端口', exact: true }),
  ).toHaveValue('3389');
  await page.locator('#rd-create-tcp').check();
  await action(page, 'rd-add').click();
  await action(page, 'rd-edit').click();
  await expect(page.locator('#rd-create-tcp')).toBeChecked();
  await action(page, 'rd-add').click();
  await action(page, 'rd-web').click();
  await expect(page.locator('.pc-session')).toContainText('模拟');
  await page.locator('[data-pc-folder="工作文档"]').click();
  await page.locator('[data-pc-file="项目计划.txt"]').click();
  await expect(page.locator('.pc-document')).toContainText('整理本周需求');
  await action(page, 'pc-back').click();
  await expect(page.locator('.pc-file-list')).toBeVisible();
  await action(page, 'pc-close').click();
  await expect(panel(page).locator('.pc-window')).toHaveCount(0);
  await action(page, 'rd-disconnect').click();
  await expect(action(page, 'rd-web')).toBeVisible();
  await reset(page);
  await expect(action(page, 'rd-start')).toBeVisible();
});

test('文件：配置、诊断、收藏、NAS 浏览预览、真实示例下载和返回', async ({
  page,
}) => {
  await choose(page, 'files');
  await action(page, 'fm-start').click();
  await action(page, 'fm-show-password').click();
  await expect(page.locator('#fm-password')).toHaveAttribute('type', 'text');
  await action(page, 'fm-diagnose').click();
  await expect(page.locator('#fm-diagnostic')).toContainText('未发起网络检测');
  await page.locator('input[name="fm-remember"][value="yes"]').check();
  await action(page, 'fm-save').click();
  await action(page, 'fm-bookmark').click();
  await expect(action(page, 'fm-bookmark')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await action(page, 'fm-edit').click();
  await expect(
    page.locator('input[name="fm-remember"][value="yes"]'),
  ).toBeChecked();
  await action(page, 'fm-save').click();
  await action(page, 'fm-access').click();
  await action(page, 'fm-storage').click();
  await expect(page.locator('#nas-status')).toContainText('120 GB');
  await action(page, 'fm-open').first().click();
  await action(page, 'files-folder').click();
  await page.locator('[data-file="项目计划.txt"]').click();
  await expect(page.locator('.fm-file-preview')).toContainText('整理本周需求');
  const downloadEvent = page.waitForEvent('download');
  await action(page, 'files-download').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('DDNSTO演示-项目计划.txt');
  expect(await readFile((await download.path())!, 'utf8')).toContain(
    '不包含真实设备数据',
  );
  await page.locator('.nas-breadcrumb [data-action=files-root]').click();
  await expect(page.locator('.fm-file-preview')).toHaveCount(0);
  await action(page, 'fm-close').click();
  await expect(page.locator('.nas-window')).toHaveCount(0);
  await action(page, 'fm-return').click();
  await action(page, 'fm-delete').click();
  await expect(action(page, 'fm-start')).toBeVisible();
});

test('设备：生成链接、进入模拟控制台、完成后重置', async ({ page }) => {
  await choose(page, 'device');
  await action(page, 'asus-enable').click();
  await expect(action(page, 'asus-enable')).toBeDisabled();
  await expect(page.locator('.asus-generated')).toContainText(
    'device-home.example.com',
  );
  await action(page, 'asus-console').click();
  await expect(page.locator('.asus-console-success')).toContainText('模拟');
  await expect(page.locator('.asus-console-domain')).toContainText(
    'http://192.168.50.1:80',
  );
  await reset(page);
  await expect(action(page, 'asus-enable')).toBeVisible();
});

test('键盘标签、深链接和场景状态保留，交互后不会自动切走', async ({ page }) => {
  await page.clock.install();
  await page.locator('#apps-scenario').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tcp-scenario')).toBeFocused();
  await expect(panel(page)).toHaveAttribute('aria-labelledby', 'tcp-scenario');
  await page.keyboard.press('End');
  await expect(page.locator('#device-scenario')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator('#apps-scenario')).toBeFocused();
  await choose(page, 'tcp');
  await action(page, 'rd-start').click();
  await action(page, 'rd-vnc').click();
  await choose(page, 'files');
  await choose(page, 'tcp');
  await expect(action(page, 'rd-vnc')).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(15000);
  await expect(page.locator('#tcp-scenario')).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.goto('/#files-scenario');
  await expect(page.locator('#files-scenario')).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(action(page, 'fm-start')).toBeVisible();
});

test('处理中重置或切换不会残留过期结果；四场景中间状态可重置', async ({
  page,
}) => {
  await page.clock.install();
  await action(page, 'scan').click();
  await page.clock.runFor(600);
  await reset(page);
  await page.clock.runFor(3000);
  await expect(action(page, 'scan')).toBeVisible();
  await action(page, 'scan').click();
  await choose(page, 'device');
  await page.clock.runFor(3000);
  await action(page, 'asus-enable').click();
  await reset(page);
  await page.clock.runFor(1000);
  await expect(action(page, 'asus-enable')).toBeEnabled();
  await action(page, 'asus-enable').click();
  await choose(page, 'apps');
  await page.clock.runFor(3000);
  await expect(action(page, 'scan')).toBeVisible();
  await choose(page, 'device');
  await expect(action(page, 'asus-enable')).toBeEnabled();
  for (const [scene, start] of [
    ['tcp', 'rd-start'],
    ['files', 'fm-start'],
  ] as const) {
    await choose(page, scene);
    await action(page, start).click();
    await reset(page);
    await expect(action(page, start)).toBeVisible();
  }
});

test('场景交互只处理本地数据，没有真实扫描、连接或提交请求', async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    if (['fetch', 'xhr', 'websocket'].includes(request.resourceType()))
      requests.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await action(page, 'scan').click();
  await expect(page.locator('#lab-prefix')).toBeVisible();
  await choose(page, 'tcp');
  await action(page, 'rd-start').click();
  await action(page, 'rd-add').click();
  await action(page, 'rd-web').click();
  await choose(page, 'files');
  await action(page, 'fm-start').click();
  await action(page, 'fm-diagnose').click();
  await action(page, 'fm-save').click();
  await action(page, 'fm-access').click();
  await choose(page, 'device');
  await action(page, 'asus-enable').click();
  await action(page, 'asus-console').click();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
