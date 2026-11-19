import { expect, test } from '@playwright/test';

test('首屏鼠标命中实际目标，灯光同步，下载经过菜单并完成', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-19T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-19T00:00:01Z'));
  await page.goto('/');
  const hero = page.locator('.hero');
  await expect(hero).toHaveAttribute('data-running', 'true');
  const hits = async (scene: string, target: string) => {
    const panel = page.locator(`[data-visual="${scene}"]`);
    const pointer = await panel.locator('.pointer').boundingBox();
    const box = await panel.locator(target).boundingBox();
    expect(pointer).not.toBeNull();
    expect(box).not.toBeNull();
    const tip = { x: pointer!.x + 14 / 6, y: pointer!.y + 14 / 6 };
    expect(tip.x).toBeGreaterThanOrEqual(box!.x);
    expect(tip.x).toBeLessThanOrEqual(box!.x + box!.width);
    expect(tip.y).toBeGreaterThanOrEqual(box!.y);
    expect(tip.y).toBeLessThanOrEqual(box!.y + box!.height);
  };
  await page.clock.runFor(2500);
  await hits('computer', '.pc > span');
  await page.clock.runFor(2000);
  await expect(page.locator('.pc-window')).toHaveCSS('opacity', '1');
  await page.clock.runFor(5500);
  await expect(hero).toHaveAttribute('data-scene', 'software');
  await hits('software', '.toggle');
  await expect(hero).toHaveAttribute('data-light-on', 'true');
  await expect(page.locator('.light-status')).toContainText('已开启');
  await page.clock.runFor(6400);
  await expect(hero).toHaveAttribute('data-scene', 'files');
  await hits('files', '.file-row:nth-child(2) > span:first-child');
  await expect(hero).toHaveAttribute('data-file-menu', 'true');
  await page.clock.runFor(1300);
  await hits('files', '.file-menu span:first-child');
  await page.clock.runFor(3500);
  await expect(page.locator('.file-transfer > span')).toHaveText('下载完成');
  await expect(page.locator('.file-transfer > i')).toHaveCSS(
    'transform',
    'matrix(1, 0, 0, 1, 0, 0)',
  );
  await page.locator('#remote-word').focus();
  await page.setViewportSize({ width: 360, height: 900 });
  await page.clock.runFor(100);
  await hits('files', '.file-menu span:first-child');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
