import { test, expect } from '@playwright/test';
import { commerce, support } from '../../src/content/commerce';
import { faqs, faqGroups } from '../../src/content/faqs';

test('design-confirmed plans, prices, purchase links and FAQ category handoff', async ({
  page,
}) => {
  await page.goto('/#pricing');
  for (const plan of commerce.plans) {
    const card = page.locator(`.package-${plan.id}`);
    await expect(card.locator('h3')).toHaveText(plan.title);
    await expect(card.locator('.package-price')).toHaveText(plan.price);
    await expect(card.locator('.package-buy')).toHaveAttribute(
      'href',
      commerce.purchase,
    );
  }
  await expect(page.locator('.package-tcp')).toHaveText(commerce.tcpOffer.text);
  await page.locator('[data-faq-target]').click();
  await expect(page).toHaveURL(/#faq$/);
  await expect(page.locator('[data-faq-group="套餐类"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('#faq-count')).toContainText('9 个问题');
  await expect(page.locator('[data-faq-item]:visible')).toHaveCount(6);
  await page.locator('[data-faq-more]').click();
  await expect(page.locator('[data-faq-item]:visible')).toHaveCount(9);
  await page.locator('[data-faq-more]').click();
  await expect(page.locator('[data-faq-item]:visible')).toHaveCount(6);
});

test('FAQ category counts, global search, empty state, clear, exclusive expansion and keyboard', async ({
  page,
}) => {
  await page.goto('/#faq');
  for (const group of faqGroups) {
    await page.locator(`[data-faq-group="${group}"]`).click();
    await expect(page.locator('[data-faq-item]:visible')).toHaveCount(
      Math.min(6, faqs.filter((f) => f.group === group).length),
    );
  }
  await page.locator('#faq-search').fill('配置');
  await expect(page.locator('#faq-count')).toContainText('搜索全部 39 个问题');
  const expected = faqs.filter((f) =>
    (f.question + f.answer + f.answerHtml).includes('配置'),
  ).length;
  await expect(page.locator('#faq-count')).toContainText(`找到 ${expected} 项`);
  await page.locator('#faq-search').fill('not-a-result-123');
  await expect(page.locator('#faq-empty')).toBeVisible();
  await expect(page.locator('[data-faq-item]:visible')).toHaveCount(0);
  await page.locator('#faq-empty [data-faq-clear]').click();
  await expect(page.locator('#faq-search')).toBeFocused();
  await expect(page.locator('#faq-search')).toHaveValue('');
  await page.locator('[data-faq-group="开始前想知道"]').click();
  const summaries = page.locator('[data-faq-item]:visible summary');
  await summaries.nth(0).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-faq-item][open]')).toHaveCount(1);
  await summaries.nth(1).click();
  await expect(page.locator('[data-faq-item][open]')).toHaveCount(1);
  await expect(page.locator('#faq-2')).toHaveAttribute('open', '');
  await page.locator('[data-faq-group="套餐类"]').click();
  await expect(page.locator('[data-faq-item][open]')).toHaveCount(0);
  await page.locator('#faq-search').fill('ＲＤＰ');
  await expect(page.locator('[data-faq-item]:visible')).not.toHaveCount(0);
});

test('customer, help and TCP dialogs close and return focus; help links navigate', async ({
  page,
}) => {
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
  await page.locator('#faq-search').fill('no-result');
  const help = page.locator('#faq-empty [data-help]');
  await help.click();
  await expect(page.locator('#help-dialog')).toBeVisible();
  await page.locator('#help-dialog details summary').click();
  await expect(page.locator('#help-dialog .qr')).toBeVisible();
  await page.locator('[data-help-faq]').click();
  await expect(page.locator('#help-dialog')).not.toBeVisible();
  await expect(page.locator('#faq-search')).toBeFocused();
  await page.locator('#faq-search').fill('no-result');
  await page.locator('#faq-empty [data-help]').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#faq-empty [data-help]')).toBeFocused();
  const gift = page.locator('#tcp-gift-toggle');
  await gift.click();
  await expect(page.locator('#tcp-gift-offer')).toBeVisible();
  await expect(gift).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(gift).toBeFocused();
  await expect(gift).toHaveAttribute('aria-expanded', 'false');
  await gift.click();
  await page.locator('[data-offer-plan]').click();
  await expect(page.locator('#tcp-gift-offer')).not.toBeVisible();
  await expect(page).toHaveURL(/#advanced-plan$/);
});

test('dialog fallback works without showModal, and mobile support uses a compact bottom toolbar', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      value: undefined,
      configurable: true,
    }),
  );
  await page.goto('/');
  await page.locator('#customer-launcher').click();
  await expect(page.locator('#customer-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#customer-panel')).not.toBeVisible();
  if ((page.viewportSize()?.width ?? 1440) < 768) {
    const toolbar = page.locator('.support-launchers');
    expect(await toolbar.evaluate((n) => getComputedStyle(n).position)).toBe(
      'static',
    );
    expect((await toolbar.boundingBox())!.height).toBeLessThanOrEqual(80);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(toolbar).not.toBeInViewport();
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

test('local FAQ and QR images decode; runtime is healthy and no horizontal overflow', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  expect(await page.title()).toContain('DDNSTO');
  await expect(page.locator('#pricing')).toBeVisible();
  await expect(page.locator('astro-error-overlay')).toHaveCount(0);
  const images = await page
    .locator('#faq img,#site-support img')
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
  expect(images.length).toBeGreaterThan(20);
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

test('no JavaScript: prices, all FAQs, footer contacts and QR remain readable', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:16208/');
  await expect(page.locator('.package-card')).toHaveCount(4);
  await expect(page.locator('[data-faq-item]:visible')).toHaveCount(39);
  await page.locator('#faq-3 summary').click();
  await expect(page.locator('#faq-3 .faq-answer')).toContainText(
    commerce.tcpOffer.text,
  );
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

test('opening the console closes the gift offer before returning to the homepage', async ({
  page,
  context,
}) => {
  await context.route('https://web.ddnsto.com/app/', (route) =>
    route.fulfill({ body: 'Console navigation test' }),
  );
  await page.goto('/');
  await page.locator('#tcp-gift-toggle').click();
  const popupPromise = page.waitForEvent('popup');
  await page
    .getByRole('link', { name: '新功能 TCP 上线', exact: true })
    .click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  await expect(popup).toHaveURL('https://web.ddnsto.com/app/');
  await popup.close();
  await page.bringToFront();
  await expect(page.locator('#tcp-gift-offer')).not.toBeVisible();
  await expect(page.locator('#tcp-gift-toggle')).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(page.locator('.tcp-gift')).not.toHaveClass(/is-open/);
  await page.locator('#tcp-gift-toggle').click();
  await expect(page.locator('#tcp-gift-offer')).toBeVisible();
});
