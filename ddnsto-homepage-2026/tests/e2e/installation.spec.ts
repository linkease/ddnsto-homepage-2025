import { test, expect } from '@playwright/test';
import { buildInstallCommand } from '../../src/config/install-command';
import { platforms } from '../../src/content/homeInstallation';

const installCommand = buildInstallCommand(process.env.SITE_ENV);

test('all design platforms have matching illustrations, steps, links and reset state', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const requests: string[] = [];
  page.on('request', (r) => {
    if (!new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))
      requests.push(r.url());
  });
  await page.goto('/#devices');
  for (const p of platforms) {
    await page.locator(`#platforms [data-platform="${p.id}"]`).click();
    const panel = page.locator(`[data-guide="${p.id}"]`);
    await expect(page.locator('[data-guide]:visible')).toHaveCount(1);
    await expect(panel.locator('h3')).toHaveText(p.label);
    await expect(panel.getByRole('link', { name: '更多教程' })).toHaveAttribute(
      'href',
      p.url,
    );
    await expect(panel.locator('[data-step-panel="0"]')).toBeVisible();
    for (const b of p.branches) {
      await panel.locator('select').selectOption(b.id);
      await expect(panel.locator('[data-branch-note]')).toHaveText(b.note);
      await expect(panel.locator('[data-step-panel="0"]')).toBeVisible();
    }
    for (const [i, s] of p.steps.entries()) {
      await panel.locator(`[data-install-step="${i}"]`).click();
      await expect(panel.locator('[data-step-panel]:visible')).toHaveCount(1);
      await expect(panel.locator('[data-step-panel]:visible h4')).toHaveText(
        s.title,
      );
      await expect(
        panel.locator('[data-step-panel]:visible .si-copy p'),
      ).toHaveText(s.text);
    }
  }
  await page.locator('[data-platform="openwrt"]').click();
  await expect(page.locator('[data-guide="openwrt"] .si-steps')).toContainText(
    '扫码配置',
  );
  await page.locator('[data-guide="openwrt"] [data-install-step="1"]').click();
  await expect(
    page.locator('[data-guide="openwrt"] [data-step-panel]:visible .si-window'),
  ).toContainText('微信扫码');
  await page.locator('[data-guide="openwrt"] [data-install-step="2"]').click();
  await expect(
    page.locator('[data-guide="openwrt"] [data-step-panel]:visible .si-window'),
  ).toContainText('生成远程链接');
  await page.locator('[data-platform="easepi"]').click();
  await expect(
    page.locator('[data-guide="easepi"] [data-step-panel="0"]'),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test('query selection and legacy platform links recover predictably', async ({
  page,
}) => {
  for (const query of [
    'platform=',
    'platform=not-a-device',
    'platform=%3Cscript%3E',
  ]) {
    await page.goto(`/?${query}#devices`);
    await expect(page.locator('[data-guide="easepi"]')).toBeVisible();
    await expect(page.locator('[data-selection-status]')).toContainText(
      '未识别设备参数',
    );
  }
  await page.goto('/?platform=istoreos#devices');
  await expect(page.locator('[data-guide="istoreos"]')).toBeVisible();
  await page.goto('/?platform=asusgo-legacy#devices');
  await expect(page.locator('[data-guide="asusgo"]')).toBeVisible();
  await page.goto('/?platform=linux&variant=arm64#devices');
  await expect(page.locator('[data-guide="linux"]')).toBeVisible();
  await expect(page.locator('.install-branches')).toHaveCount(0);
  await page.locator('[data-platform="windows"]').click();
  await expect(page.locator('[data-selection-status]')).toBeHidden();
});

test('command clipboard success and manual fallback preserve the exact command', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as unknown as { copied: string }).copied = value;
        },
      },
    }),
  );
  await page.goto('/#devices');
  await page.locator('[data-copy-command]').click();
  await expect(page.locator('.si-copy-status')).toContainText('已复制');
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe(installCommand);
  await expect(page.locator('[data-manual-copy]')).toBeHidden();
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException('Denied', 'NotAllowedError');
        },
      },
    }),
  );
  await page.evaluate(() => {
    document.execCommand = () => false;
  });
  await page.locator('[data-copy-command]').click();
  const manual = page.locator('#manual-install-command');
  await expect(manual).toBeVisible();
  await expect(manual).toBeFocused();
  await expect(manual).toHaveValue(installCommand);
  expect(
    await manual.evaluate(
      (n: HTMLTextAreaElement) => n.selectionEnd - n.selectionStart,
    ),
  ).toBe(installCommand.length);
  await expect(page.locator('.si-copy-status')).toContainText('手动复制');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    }),
  );
  await page.locator('[data-copy-command]').click();
  await expect(manual).toBeVisible();
  expect(
    await page
      .locator('.si-command')
      .evaluate((n) => n.scrollWidth >= n.clientWidth),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('keyboard selection, step focus and scene installation intent', async ({
  page,
}) => {
  await page.goto('/#devices');
  const button = page.locator('[data-platform="linux"]');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  const step = page.locator('[data-guide="linux"] [data-install-step="1"]');
  await step.focus();
  await page.keyboard.press('Space');
  await expect(step).toBeFocused();
  await expect(step).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/#files');
  await page.locator('#experience-cta').click();
  await expect(page.locator('#install-intent')).toContainText('远程访问文件');
  await expect(page).toHaveURL(/#devices$/);
});

test('without JavaScript all design platform steps remain readable', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:16208/#devices');
  for (const p of platforms) {
    const panel = page.locator(`[data-guide="${p.id}"]`);
    await expect(panel).toBeVisible();
    for (const s of p.steps)
      await expect(
        panel.getByRole('heading', { name: s.title, exact: true }),
      ).toBeVisible();
  }
  await expect(page.locator('.si-command')).toHaveText(installCommand);
  await context.close();
});
