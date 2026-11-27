import { test, expect } from '@playwright/test';
import { commerce, support } from '../../src/content/commerce';

test('design-confirmed plans, prices, purchase links and FAQ navigation', async ({
  page,
}) => {
  await page.goto('/#pricing');
  for (const plan of commerce.plans) {
    const card = page.locator(`.package-${plan.id}`);
    await expect(card.locator('h3')).toHaveText(plan.title);
    await expect(card.locator('.package-price')).toHaveText(plan.price);
    if (plan.id === 'bulk') {
      await expect(card.locator('.package-buy')).toHaveCount(0);
      await expect(
        card.getByRole('button', { name: '联系客服' }),
      ).toBeVisible();
    } else {
      await expect(card.locator('.package-buy')).toHaveAttribute(
        'href',
        commerce.purchase,
      );
    }
  }
  await expect(page.locator('.package-tcp')).toHaveText(commerce.tcpOffer.text);
  await expect(page.locator('.pricing-footnote')).toHaveCount(0);
  await expect(page.locator('.faq-highlight-panel details')).toHaveCount(7);
});

test('customer and TCP dialogs close and return focus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('#customer-launcher');
  await trigger.click();
  const customer = page.locator('#customer-panel');
  await expect(customer).toBeVisible();
  await expect(customer.locator('img')).toHaveAttribute('src', support.qr);
  await expect(customer).toContainText(support.hours);
  await expect(customer.locator('h2')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(customer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await customer.locator('[data-support-close]').click();
  await expect(trigger).toBeFocused();
  const gift = page.locator('#tcp-gift-toggle');
  await gift.click();
  await expect(page.locator('#tcp-gift-offer')).toBeVisible();
  await expect(gift).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(gift).toBeFocused();
  await expect(gift).toHaveAttribute('aria-expanded', 'false');
  await gift.click();
  await page.getByRole('link', { name: '高级套餐专享 · 查看套餐' }).click();
  await expect(page.locator('#tcp-gift-offer')).not.toBeVisible();
  await expect(page).toHaveURL(/#advanced-plan$/);
});

test('nonmodal customer dialog and mobile support stay reachable in a compact fixed bottom toolbar', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#customer-launcher').click();
  await expect(page.locator('#customer-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#customer-panel')).not.toBeVisible();
  if ((page.viewportSize()?.width ?? 1440) < 768) {
    const toolbar = page.locator('.support-launchers');
    expect(await toolbar.evaluate((n) => getComputedStyle(n).position)).toBe(
      'fixed',
    );
    expect((await toolbar.boundingBox())!.height).toBeLessThanOrEqual(80);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(toolbar).toBeInViewport();
    await toolbar.scrollIntoViewIfNeeded();
    await expect(toolbar).toBeInViewport();
    for (const selector of ['#customer-launcher', '#tcp-gift-toggle']) {
      const box = (await page.locator(selector).boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(
      await page
        .locator('#customer-launcher')
        .evaluate((n) => getComputedStyle(n).position),
    ).toBe('static');
    expect(
      await page
        .locator('.tcp-gift')
        .evaluate((n) => getComputedStyle(n).position),
    ).toBe('static');
  }
});

test('local customer and QR images decode; runtime is healthy and no horizontal overflow', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  expect(await page.title()).toContain('DDNSTO');
  await expect(page.locator('#pricing')).toBeVisible();
  await expect(page.locator('astro-error-overlay')).toHaveCount(0);
  const images = await page
    .locator('#site-support img')
    .evaluateAll(async (nodes) =>
      Promise.all(
        nodes.map(async (n) => {
          const image = n as HTMLImageElement;
          image.loading = 'eager';
          await image.decode();
          return {
            local: image.src.startsWith(location.origin),
            width: image.naturalWidth,
          };
        }),
      ),
    );
  expect(images).toHaveLength(3);
  expect(images.every((i) => i.local && i.width > 0)).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page
      .locator('.puppy-head')
      .evaluate((n) => getComputedStyle(n).animationName),
  ).toBe('none');
});

test('no JavaScript: prices, design FAQs, footer contacts and QR remain readable', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:16208/');
  await expect(page.locator('.package-card')).toHaveCount(4);
  await expect(page.locator('.faq-highlight-panel details')).toHaveCount(7);
  const first = page.locator('.faq-highlight-panel details').first();
  await first.locator('summary').click();
  await expect(first.locator('p')).toBeVisible();
  await expect(page.locator('.support-static')).toBeVisible();
  await expect(page.locator('.support-static img')).toHaveAttribute(
    'src',
    support.qr,
  );
  await context.close();
});

test('gift hover opens with motion and both floating panels are nonmodal', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  const gift = page.locator('#tcp-gift-toggle');
  const offer = page.locator('#tcp-gift-offer');
  if (!isMobile) {
    const lid = page.locator('.gift-lid');
    const closed = await lid.evaluate((n) => getComputedStyle(n).transform);
    await gift.hover();
    await expect(offer).toBeVisible();
    await expect
      .poll(() => lid.evaluate((n) => getComputedStyle(n).transform))
      .not.toBe(closed);
    expect(
      await lid.evaluate((n) => getComputedStyle(n).transitionDuration),
    ).not.toBe('0s');
    await offer.hover();
    await expect(offer).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(offer).not.toBeVisible();
  }
  await gift.click();
  await expect(offer).toBeVisible();
  expect(await offer.evaluate((n) => n.matches(':modal'))).toBe(false);
  expect(await offer.evaluate((n) => n.scrollWidth <= n.clientWidth)).toBe(
    true,
  );
  await page.locator('#customer-launcher').click();
  await expect(offer).not.toBeVisible();
  const customer = page.locator('#customer-panel');
  await expect(customer).toBeVisible();
  expect(await customer.evaluate((n) => n.matches(':modal'))).toBe(false);
  await page.locator('h1').click();
  await expect(customer).not.toBeVisible();
});

test('TCP announcement locates the plan without opening a console or sending analytics', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.dataset.analyticsEnabled = 'true';
    (window as any).trackedEvents = [];
    (window as any).gtag = (...args: unknown[]) =>
      (window as any).trackedEvents.push(args);
  });
  await page.locator('#tcp-gift-toggle').click();
  await page
    .getByRole('link', { name: '新功能 TCP 上线', exact: true })
    .click();
  await expect(page).toHaveURL(/#advanced-plan$/);
  await expect(page.locator('#advanced-plan')).toBeFocused();
  await expect(page.locator('.pricing-flash-ring')).toBeVisible();
  await expect(page.locator('#tcp-gift-offer')).not.toBeVisible();
  await page.waitForTimeout(100);
  expect(context.pages()).toHaveLength(1);
  expect(await page.evaluate(() => (window as any).trackedEvents)).toEqual([]);
  await expect(page.locator('#tcp-gift-toggle')).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await page.locator('#tcp-gift-toggle').click();
  await expect(page.locator('#tcp-gift-offer')).toBeVisible();
});
