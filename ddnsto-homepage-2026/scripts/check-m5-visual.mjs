import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { startReferenceServer } from './reference-server.mjs';
const out = process.env.M5_OUTPUT || '/tmp/ddnsto-2026-m5';
await mkdir(out, { recursive: true });
const ref = await startReferenceServer();
const browser = await chromium.launch({ channel: 'chromium' });
const report = [];
try {
  for (const width of [360, 390, 768, 1024, 1440]) {
    for (const [kind, url] of [
      ['reference', `${ref.url}/v2/?ui=minimal`],
      ...(process.env.REFERENCE_ONLY
        ? []
        : [['render', process.env.M5_URL || 'http://127.0.0.1:16206/']]),
    ]) {
      const page = await browser.newPage({
          viewport: { width, height: 1000 },
          reducedMotion: 'reduce',
        }),
        errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('response', (r) => {
        if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.addStyleTag({
        content:
          '.review,.theme-label,.skip,.skip-link,body>header,.site-header,.intent-band {visibility:hidden!important}',
      });
      for (const selector of ['#pricing', '#faq', '.site-footer']) {
        await page.locator(selector).screenshot({
          path: `${out}/${kind}-${width}-${selector.replace(/[.#]/g, '')}.png`,
        });
        const metrics = await page.locator(selector).evaluate((n) => {
          const box = n.getBoundingClientRect();
          return [
            ...n.querySelectorAll(
              'h2,h3,.binding-rule,.package-card,.faq-categories,#faq-search,.footer-grid',
            ),
          ].map((x) => {
            const r = x.getBoundingClientRect(),
              s = getComputedStyle(x);
            return {
              tag: x.tagName,
              class: x.className,
              text: x.textContent.slice(0, 40),
              x: r.x - box.x,
              y: r.y - box.y,
              width: r.width,
              height: r.height,
              font: s.font,
              color: s.color,
              background: s.backgroundColor,
            };
          });
        });
        report.push({
          kind,
          width,
          selector,
          metrics,
          errors: [...errors],
          overflow: await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        });
      }
      if ([390, 1440].includes(width)) {
        await page.locator('#customer-launcher').click();
        await page
          .locator('#customer-panel')
          .screenshot({ path: `${out}/${kind}-${width}-customer.png` });
      }
      await page.close();
    }
  }
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      captures: report.length,
      issues: report.filter((r) => r.errors.length || r.overflow),
    }),
  );
} finally {
  await browser.close();
  ref.server.close();
}
