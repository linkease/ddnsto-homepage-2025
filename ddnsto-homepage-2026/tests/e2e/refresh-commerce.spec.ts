import { test, expect } from '@playwright/test';
import { faqHighlights } from '../../src/content/faqHighlights';

test('new FAQ groups expand with keyboard without the removed search library', async ({
  page,
}) => {
  await page.goto('/#faq');
  const items = page.locator('.faq-highlight-panel details');
  await expect(items).toHaveCount(7);
  for (const [index, item] of faqHighlights.flatMap((g) => g.items).entries()) {
    const entry = items.nth(index);
    await entry.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(entry.locator('p')).toBeVisible();
    await expect(entry.locator('p')).toHaveText(item.answer);
    await page.keyboard.press('Enter');
    await expect(entry.locator('p')).not.toBeVisible();
  }
  await expect(
    page.locator('.faq-library, faq-browser, #faq-search'),
  ).toHaveCount(0);
  await expect(page.locator('.pricing-footnote')).toHaveCount(0);
});

test('batch contact opens customer and TCP target highlights repeatedly then clears', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/#advanced-plan');
  await page.reload();
  await expect(page.locator('#advanced-plan')).toBeFocused();
  await expect(page.locator('#advanced-plan')).toHaveCSS(
    'outline-style',
    'none',
  );
  await expect(page.locator('.pricing-target-label')).toBeVisible();
  await page.clock.runFor(3601);
  await expect(page.locator('.pricing-target-label')).not.toBeVisible();
  await page.locator('.package-contact').click();
  await expect(page.locator('#customer-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.package-contact')).toBeFocused();
  for (let i = 0; i < 2; i++) {
    await page.locator('#tcp-gift-toggle').click();
    await page.getByRole('link', { name: '高级套餐专享 · 查看套餐' }).click();
    await expect(page.locator('#advanced-plan')).toBeFocused();
    await expect(page.locator('.pricing-target-label')).toBeVisible();
    await expect(page.locator('.pricing-flash-ring')).toBeVisible();
    await expect(page.locator('#tcp-gift-offer')).not.toBeVisible();
    await page.clock.runFor(3601);
    await expect(page.locator('.pricing-target-label')).not.toBeVisible();
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#tcp-gift-toggle').click();
  await page.getByRole('link', { name: '高级套餐专享 · 查看套餐' }).click();
  expect(
    await page
      .locator('.pricing-flash-ring')
      .evaluate((n) => getComputedStyle(n).animationName),
  ).toBe('none');
});

test('TCP plan link scrolls to the advanced plan and pulses three times', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#tcp-gift-toggle').click();
  await page.getByRole('link', { name: '高级套餐专享 · 查看套餐' }).click();
  await expect(page).toHaveURL(/#advanced-plan$/);
  await expect
    .poll(() => page.locator('#pricing').evaluate((n) => n.scrollTop))
    .toBe(0);
  const headingInset = await page
    .locator('#pricing')
    .evaluate(
      (n) =>
        n.querySelector('h2')!.getBoundingClientRect().top -
        n.getBoundingClientRect().top,
    );
  expect(headingInset).toBeGreaterThanOrEqual(56);
  const ring = page.locator('.pricing-flash-ring');
  await expect(ring).toBeVisible();
  const timing = await ring.evaluate((n) => {
    const style = getComputedStyle(n);
    return [
      style.animationDuration,
      style.animationIterationCount,
      style.borderTopColor,
    ];
  });
  expect(timing).toEqual(['1.2s', '3', 'rgb(0, 220, 229)']);
  await expect
    .poll(() =>
      page
        .locator('#advanced-plan')
        .evaluate((n) => n.getBoundingClientRect().top),
    )
    .toBeLessThan(140);
  // Observe real animation frames: each cycle must include both dim and bright states.
  const samples = await ring.evaluate(async (n) => {
    const animation = n.getAnimations()[0];
    const values: { cycle: number; opacity: number }[] = [];
    while (!n.hasAttribute('hidden')) {
      values.push({
        cycle: Math.floor(Number(animation.currentTime) / 1200),
        opacity: Number(getComputedStyle(n).opacity),
      });
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    return values;
  });
  // The initial smooth scroll can overlap the first cycle; the remaining cycles are fully visible.
  for (const cycle of [1, 2]) {
    const values = samples
      .filter((s) => s.cycle === cycle)
      .map((s) => s.opacity);
    expect(Math.max(...values)).toBeGreaterThan(0.9);
    expect(Math.min(...values)).toBeLessThan(0.1);
  }
  await expect(ring).not.toBeVisible();
  await expect(page.locator('.pricing-target-label')).not.toBeVisible();
});

test('TCP links settle on the plan while an installation scroll is in progress', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'macOS 安装', exact: true }).click();
  for (const name of ['新功能 TCP 上线', '高级套餐专享 · 查看套餐']) {
    await page.locator('#tcp-gift-toggle').click();
    // Start a competing navigation just before the real link activation.
    await page.getByRole('link', { name, exact: true }).evaluate((link) => {
      document
        .querySelector('#devices')!
        .scrollIntoView({ behavior: 'smooth' });
      (link as HTMLAnchorElement).click();
      return document.querySelector('#advanced-plan')!.getBoundingClientRect()
        .top;
    });
    await expect(page).toHaveURL(/#advanced-plan$/);
    await expect(page.locator('#advanced-plan')).toBeFocused();
    await page.waitForTimeout(1500);
    const settledTop = await page
      .locator('#advanced-plan')
      .evaluate((n) => n.getBoundingClientRect().top);
    expect(settledTop).toBeGreaterThanOrEqual(80);
    expect(settledTop).toBeLessThan(160);
  }
});

test('rapid installation then TCP clicks settle below the header without resetting the selected platform', async ({
  page,
  isMobile,
}) => {
  if (!isMobile) await page.setViewportSize({ width: 2560, height: 1271 });
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto('/');
    await page.getByRole('link', { name: 'macOS 安装', exact: true }).click();
    await page.locator('#tcp-gift-toggle').click();
    await page
      .getByRole('link', { name: '新功能 TCP 上线', exact: true })
      .click();
    await page.waitForTimeout(1500);
    const top = await page
      .locator('#advanced-plan')
      .evaluate((n) => n.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(80);
    expect(top).toBeLessThan(160);
  }
  await page.locator('[data-platform="terminal-unix"]').click();
  await page.locator('#tcp-gift-toggle').click();
  await page
    .getByRole('link', { name: '高级套餐专享 · 查看套餐', exact: true })
    .click();
  await expect(page.locator('[data-platform="terminal-unix"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('TCP navigation visibly scrolls before reaching the plan', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#tcp-gift-toggle').click();
  await page
    .getByRole('link', { name: '新功能 TCP 上线', exact: true })
    .click();
  await page.waitForTimeout(100);
  const during = await page
    .locator('#advanced-plan')
    .evaluate((n) => n.getBoundingClientRect().top);
  expect(during).toBeGreaterThan(200);
  await expect
    .poll(() =>
      page
        .locator('#advanced-plan')
        .evaluate((n) =>
          Math.abs(
            n.getBoundingClientRect().top -
              parseFloat(getComputedStyle(n).scrollMarginTop),
          ),
        ),
    )
    .toBeLessThan(2);
});
