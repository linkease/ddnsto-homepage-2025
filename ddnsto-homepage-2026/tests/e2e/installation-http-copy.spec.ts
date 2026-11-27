import { test, expect } from '@playwright/test';
import { installCommand as template } from '../../src/content/installMethods';
import {
  prepareAuthenticatedCommand,
  authenticatedCommand,
} from './install-helpers';
const installCommand = authenticatedCommand(template);

test('HTTP preview copies the complete command without the secure clipboard API', async ({
  page,
  baseURL,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('http://preview.ddnsto.test/**', async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({
      url: `${baseURL}${url.pathname}${url.search}`,
      headers: { ...route.request().headers(), host: new URL(baseURL!).host },
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
  await prepareAuthenticatedCommand(page);
  await page.locator('[data-copy-command]').click();
  await expect(
    page.locator('[data-command-block=primary] .si-copy-status'),
  ).toContainText('已复制');
  expect(
    await page.evaluate(
      () => (window as unknown as { copiedSelection: string }).copiedSelection,
    ),
  ).toBe(installCommand);
  await expect(
    page.locator('[data-command-block=primary] [data-manual-copy]'),
  ).toBeHidden();
  await expect(page.locator('[data-copy-command]')).toBeFocused();
});
