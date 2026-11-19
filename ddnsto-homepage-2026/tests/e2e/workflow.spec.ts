import { test, expect } from '@playwright/test';

test('手动流程默认折叠，三步可选择且不显示额外指南区域', async ({ page }) => {
  await page.goto('/');
  const details = page.locator('#manual-workflow'),
    flow = page.locator('manual-workflow');
  await expect(details).not.toHaveAttribute('open');
  await details.locator(':scope > summary').click();
  await expect(flow).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await flow.locator('[data-step]').nth(i).click();
    await expect(flow).toHaveAttribute('data-active', String(i));
    await expect(flow.locator('[data-scene]').nth(i)).toBeVisible();
    await expect(flow.locator('[data-scene]:visible')).toHaveCount(1);
  }
  await flow.locator('[data-step]').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(flow).toHaveAttribute('data-active', '1');
  await expect(flow.locator('[data-step]').nth(1)).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('.workflow-guides')).toHaveCount(0);
  await expect(page.getByText('按需求阅读指南', { exact: true })).toHaveCount(
    0,
  );
  await details.locator(':scope > summary').click();
  await expect(flow).toHaveAttribute('data-paused');
});

test('流程每三秒轮播，关闭/后台/减少动效暂停，展开恢复', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const flow = page.locator('manual-workflow'),
    summary = page.locator('#manual-workflow > summary');
  await summary.click();
  await flow.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(flow).not.toHaveAttribute('data-paused');
  await page.clock.fastForward(3100);
  await expect(flow).toHaveAttribute('data-active', '1');
  await page.clock.fastForward(3100);
  await expect(flow).toHaveAttribute('data-active', '2');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(flow).toHaveAttribute('data-paused');
  await page.clock.fastForward(4000);
  await expect(flow).toHaveAttribute('data-active', '2');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(flow).toHaveAttribute('data-paused');
  await page.clock.fastForward(4000);
  await expect(flow).toHaveAttribute('data-active', '2');
  await expect
    .poll(() =>
      flow.evaluate((el) => el.getAnimations({ subtree: true }).length),
    )
    .toBe(0);
  await summary.click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.fastForward(4000);
  await expect(flow).toHaveAttribute('data-active', '2');
  await summary.click();
  await flow.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(flow).not.toHaveAttribute('data-paused');
  await page.clock.fastForward(3100);
  await expect(flow).toHaveAttribute('data-active', '0');
});

test('点击或悬停后保留鼠标与焦点也会继续轮播', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.locator('#manual-workflow > summary').click();
  const flow = page.locator('manual-workflow');
  await flow.locator('[data-step="1"]').click();
  await expect(flow).toHaveAttribute('data-active', '1');
  await page.clock.fastForward(3100);
  await expect(flow).toHaveAttribute('data-active', '2');
  await page.clock.fastForward(3100);
  await expect(flow).toHaveAttribute('data-active', '0');
  await expect(flow.locator('.demo-pointer')).toHaveCount(0);
});

test('步骤过渡中没有空白，两幅画面同步交叉淡入淡出', async ({ page }) => {
  await page.goto('/');
  await page.locator('#manual-workflow > summary').click();
  const flow = page.locator('manual-workflow');
  await flow.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const samples = await flow.evaluate((el) => {
    (el.querySelector('[data-step="1"]') as HTMLButtonElement).click();
    const scenes = [...el.querySelectorAll<HTMLElement>('[data-scene]')].slice(
      0,
      2,
    );
    return [100, 225, 300].map((time) => {
      scenes.forEach((scene) =>
        scene.getAnimations().forEach((animation) => {
          animation.pause();
          animation.currentTime = time;
        }),
      );
      return scenes.map((scene) => Number(getComputedStyle(scene).opacity));
    });
  });
  for (const [oldOpacity, newOpacity] of samples) {
    expect(oldOpacity + newOpacity).toBeGreaterThanOrEqual(0.95);
    expect(oldOpacity).toBeGreaterThan(0);
    expect(newOpacity).toBeGreaterThan(0);
  }
});

test('三步选中图标、编号和标题使用一致样式', async ({ page }) => {
  await page.goto('/');
  await page.locator('#manual-workflow > summary').click();
  const snapshots = [];
  for (let i = 0; i < 3; i++) {
    const step = page.locator('[data-step]').nth(i);
    await step.click();
    await expect
      .poll(() =>
        step
          .locator('.step-icon')
          .evaluate((el) => getComputedStyle(el).transform),
      )
      .toBe('matrix(1.1, 0, 0, 1.1, 0, 0)');
    await page.waitForTimeout(400);
    snapshots.push(
      await step.evaluate((el) =>
        ['.step-icon', '.step-icon b', 'strong'].map((selector) => {
          const node = el.querySelector(selector)!,
            s = getComputedStyle(node);
          return {
            width: s.width,
            height: s.height,
            background: s.backgroundColor,
            color: s.color,
            border: s.borderColor,
            fontWeight: s.fontWeight,
            transition: s.transitionProperty,
          };
        }),
      ),
    );
  }
  // Titles have different text widths; compare the shared visual properties.
  for (const snapshot of snapshots)
    delete (snapshot[2] as Partial<(typeof snapshot)[2]>).width;
  expect(snapshots[1]).toEqual(snapshots[0]);
  expect(snapshots[2]).toEqual(snapshots[0]);
});
