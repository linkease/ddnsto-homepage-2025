import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { startReferenceServer } from './reference-server.mjs';
const output = resolve(process.env.M2_OUTPUT || '/tmp/ddnsto-2026-m2');
await mkdir(output, { recursive: true });
const { server, url } = await startReferenceServer();
const browser = await chromium.launch({ channel: 'chromium' });
const report = {
  referenceAdjustments: [
    'Remove design preview banner and theme selector',
    'Remove deferred M5 floating widgets',
  ],
  threshold: 4,
  viewports: [],
};
const selectors = [
  '.header-inner',
  '.logo',
  '.brand-logo',
  'h1',
  '.hero-message',
  '.remote-sentence',
  '#remote-word',
  '.actions',
  '.actions .btn',
  '.actions .secondary',
  '#hero-animation',
  '.intent-band',
  '.intent-local a',
  '.intent-console .btn',
  '#scenarios .section-head',
];
try {
  for (const width of [360, 390, 768, 1024, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    const pages = [];
    for (const kind of ['reference', 'render']) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });
      page.on('response', (r) => {
        if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
      });
      await page.goto(
        kind === 'reference'
          ? url + '/v2/?ui=minimal'
          : process.env.M2_URL || 'http://127.0.0.1:16206',
        { waitUntil: 'networkidle' },
      );
      if (kind === 'reference')
        await page.evaluate(() =>
          document
            .querySelectorAll(
              '.review,.theme-label,.tcp-gift,#customer-launcher',
            )
            .forEach((e) => e.remove()),
        );
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(
        () =>
          new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r)),
          ),
      );
      await page.screenshot({
        path: resolve(output, `${kind}-${width}.png`),
        animations: 'disabled',
      });
      const metrics = await page.evaluate(
        (selectors) =>
          Object.fromEntries(
            selectors.map((s) => {
              const el = document.querySelector(s);
              if (!el) return [s, null];
              const r = el.getBoundingClientRect(),
                c = getComputedStyle(el);
              return [
                s,
                {
                  x: r.x,
                  y: r.y,
                  width: r.width,
                  height: r.height,
                  fontSize: c.fontSize,
                  lineHeight: c.lineHeight,
                  fontWeight: c.fontWeight,
                  color: c.color,
                },
              ];
            }),
          ),
        selectors,
      );
      pages.push({
        kind,
        metrics,
        errors,
        scrollWidth: await page.evaluate(
          () => document.documentElement.scrollWidth,
        ),
      });
    }
    const [reference, render] = pages;
    const differences = selectors.flatMap((selector) => {
      const a = reference.metrics[selector],
        b = render.metrics[selector];
      return ['x', 'y', 'width', 'height']
        .filter((k) => Math.abs(a[k] - b[k]) > 4)
        .map((k) => ({
          selector,
          property: k,
          reference: a[k],
          render: b[k],
          difference: b[k] - a[k],
        }));
    });
    report.viewports.push({ width, reference, render, differences });
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  await writeFile(
    resolve(output, 'visual-report.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
}
console.log(
  JSON.stringify(
    report.viewports.map((v) => ({
      width: v.width,
      overflow: v.render.scrollWidth > v.width,
      errors: v.render.errors,
      differences: v.differences,
    })),
    null,
    2,
  ),
);
if (
  report.viewports.some(
    (v) =>
      v.render.errors.length ||
      v.render.scrollWidth > v.width ||
      ([390, 1440].includes(v.width) && v.differences.length),
  )
)
  process.exitCode = 1;
