import { expect, test } from '@playwright/test';

test('scroll reveals cards once with reference timing and restores final styles', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForTimeout(100);
  const card = page.locator('.feature-card').first();
  await card.evaluate((element) =>
    scrollTo({
      top: scrollY + element.getBoundingClientRect().top - innerHeight + 120,
      behavior: 'instant',
    }),
  );
  await expect
    .poll(() => card.evaluate((element) => element.getAnimations().length))
    .toBeGreaterThan(0);
  const frames = await card.evaluate((element) => {
    const effect = element.getAnimations()[0].effect as KeyframeEffect;
    return {
      duration: effect.getTiming().duration,
      frames: effect.getKeyframes(),
    };
  });
  expect(frames.duration).toBe(500);
  expect(frames.frames[0].transform).toBe('translateY(20px)');
  await expect
    .poll(() => card.evaluate((element) => element.getAnimations().length))
    .toBe(0);
  await expect(card).toHaveCSS('opacity', '1');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(100);
  await card.scrollIntoViewIfNeeded();
  expect(await card.evaluate((element) => element.getAnimations().length)).toBe(
    0,
  );
});

test('reduced motion keeps scrolled content immediately readable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForTimeout(100);
  const card = page.locator('.feature-card').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS('opacity', '1');
  expect(await card.evaluate((element) => element.getAnimations().length)).toBe(
    0,
  );
});
