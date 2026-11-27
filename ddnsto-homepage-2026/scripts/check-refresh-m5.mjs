import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
await mkdir('artifacts/refresh-m5', { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const report = [];
const sections = [
  [
    'pricing',
    '#pricing',
    {
      heading: ['h2', 'h2'],
      cards: ['.pricing-card', '.package-card'],
      titles: ['.pricing-card h3', '.package-card h3'],
    },
  ],
  [
    'faq',
    '#faq',
    {
      heading: ['h2', '.faq-heading h2'],
      groups: ['.space-y-12>div>h3', '.faq-highlight-group>h3'],
      panels: ['.space-y-12>div>div', '.faq-highlight-panel'],
    },
  ],
  [
    'footer',
    'footer',
    {
      brand: ['h3', '.footer-wordmark'],
      groups: ['.grid.grid-cols-2', '.footer-groups'],
      legal: ['.border-t', '.footer-legal'],
    },
  ],
];
for (const width of [360, 390, 768, 1024, 1440])
  for (const [site, url] of [
    'http://127.0.0.1:6002/original-preview/',
    process.env.M5_URL || 'http://127.0.0.1:16216/',
  ].entries()) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      locale: 'zh-CN',
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    if (site) {
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });
      page.on('requestfailed', (r) =>
        errors.push(r.url() + ': ' + r.failure()?.errorText),
      );
    }
    await page.goto(url);
    await page.waitForTimeout(1000);
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content: '.skip-link,.site-header,nav.fixed{visibility:hidden!important}',
    });
    const hide = await page.addStyleTag({
      content:
        '.customer-launcher,.tcp-gift,.support-launchers{visibility:hidden!important}',
    });
    for (const [name, selector, selectors] of sections) {
      const root = page.locator(selector);
      await root.screenshot({
        path: `artifacts/refresh-m5/${site ? 'current' : 'reference'}-${name}-${width}.png`,
      });
      const metrics = await root.evaluate(
        (el, selectors) => {
          const base = el.getBoundingClientRect();
          return Object.fromEntries(
            Object.entries(selectors).map(([key, sel]) => [
              key,
              [...el.querySelectorAll(sel)].map((n) => {
                const r = n.getBoundingClientRect(),
                  s = getComputedStyle(n);
                return {
                  x: r.x,
                  y: r.y - base.y,
                  w: r.width,
                  h: r.height,
                  color: s.color,
                  font: s.fontSize,
                };
              }),
            ]),
          );
        },
        Object.fromEntries(
          Object.entries(selectors).map(([k, v]) => [k, v[site]]),
        ),
      );
      report.push({
        site: site ? 'current' : 'reference',
        width,
        state: name,
        metrics,
        errors: [...errors],
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      });
    }
    await page
      .locator(
        site ? '.faq-highlight-panel summary' : '#faq .space-y-12 button',
      )
      .first()
      .click();
    await page.waitForTimeout(350);
    await page.locator('#faq').screenshot({
      path: `artifacts/refresh-m5/${site ? 'current' : 'reference'}-faq-open-${width}.png`,
    });
    await hide.evaluate((n) => n.remove());
    for (const [name, trigger, panel] of [
      ['customer', '.customer-launcher', '#customer-panel'],
      ['gift', '.gift-toggle', '#tcp-gift-offer'],
    ]) {
      await page.locator(trigger).click();
      await page.locator(panel).screenshot({
        path: `artifacts/refresh-m5/${site ? 'current' : 'reference'}-${name}-${width}.png`,
      });
      const health = await page.locator(panel).evaluate((n) => {
        const r = n.getBoundingClientRect();
        return {
          inside:
            r.x >= 0 &&
            r.right <= innerWidth &&
            r.y >= 0 &&
            r.bottom <= innerHeight,
          overflow: n.scrollWidth > n.clientWidth,
          width: r.width,
          height: r.height,
        };
      });
      report.push({
        site: site ? 'current' : 'reference',
        width,
        state: name,
        health,
        errors: [...errors],
      });
      await page.keyboard.press('Escape');
      await page.mouse.move(0, 0);
    }
    await page.close();
  }
await browser.close();
const failures = [];
for (const current of report.filter((r) => r.site === 'current')) {
  if (
    current.errors.length ||
    current.overflow ||
    current.health?.overflow ||
    current.health?.inside === false
  )
    failures.push({
      width: current.width,
      state: current.state,
      health: current.health,
      errors: current.errors,
    });
  if (!current.metrics) continue;
  const ref = report.find(
    (r) =>
      r.site === 'reference' &&
      r.width === current.width &&
      r.state === current.state,
  );
  for (const [key, list] of Object.entries(current.metrics))
    list.forEach((item, index) => {
      const original = ref.metrics[key][index];
      if (!original) {
        failures.push({ missing: key, width: current.width });
        return;
      }
      for (const dim of ['x', 'y', 'w', 'h'])
        if (Math.abs(item[dim] - original[dim]) > 4)
          failures.push({
            width: current.width,
            state: current.state,
            key,
            index,
            dim,
            delta: item[dim] - original[dim],
          });
    });
}
await writeFile(
  'artifacts/refresh-m5/visual.json',
  JSON.stringify(report, null, 2),
);
await writeFile(
  'artifacts/refresh-m5/comparison.json',
  JSON.stringify(failures, null, 2),
);
console.log(JSON.stringify({ samples: report.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
