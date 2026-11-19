import { test, expect } from '@playwright/test';

test('真实时钟：减少动效切换同步画面、关键词和入口，并可恢复播放', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.locator('.hero');
  // Exercise the live animation-frame path, without Playwright's simulated clock.
  await page.waitForFunction(
    () =>
      document.querySelector<HTMLElement>('.hero')?.dataset.scene ===
      'software',
    {},
    { timeout: 12000 },
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(hero).toHaveAttribute('data-running', 'false');
  await expect(hero).toHaveAttribute('data-scene', 'computer');
  await expect(hero).toHaveAttribute('data-phase', '0');
  await expect(page.locator('#remote-word')).toHaveText('电脑');
  await expect(page.locator('#remote-word')).toHaveAttribute(
    'href',
    '#tcp-scenario',
  );
  await expect(hero.locator('[data-visual="computer"]')).toBeVisible();
  await expect(hero.locator('[data-visual="software"]')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(hero).toHaveAttribute('data-running', 'true');
});
