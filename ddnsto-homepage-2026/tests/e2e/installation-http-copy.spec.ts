import { test, expect } from '@playwright/test';
import { buildInstallCommand } from '../../src/config/install-command';

const installCommand = buildInstallCommand(process.env.SITE_ENV);

test('HTTP preview copies the complete command without the secure clipboard API', async ({
  page,
  baseURL,
}) => {
  await page.route('http://preview.ddnsto.test/**', async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({
      url: `${baseURL}${url.pathname}${url.search}`,
    });
    await route.fulfill({ response });
  });
  await page.goto('http://preview.ddnsto.test/');
  expect(await page.evaluate(() => window.isSecureContext)).toBe(false);
  expect(await page.evaluate(() => typeof navigator.clipboard)).toBe(
    'undefined',
  );
  await page.evaluate(() =>
    document.addEventListener('copy', () => {
      const el = document.activeElement as HTMLTextAreaElement;
      (window as unknown as { copiedSelection: string }).copiedSelection =
        el.value.substring(el.selectionStart, el.selectionEnd);
    }),
  );
  await page.locator('[data-copy-command]').click();
  await expect(page.locator('.si-copy-status')).toContainText('已复制');
  expect(
    await page.evaluate(
      () => (window as unknown as { copiedSelection: string }).copiedSelection,
    ),
  ).toBe(installCommand);
  await expect(page.locator('[data-manual-copy]')).toBeHidden();
  await expect(page.locator('[data-copy-command]')).toBeFocused();
});
