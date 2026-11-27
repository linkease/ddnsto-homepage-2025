import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const output = new URL('../artifacts/refresh-m2/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const selectors = {
  header: ['nav.fixed', '.site-header'],
  container: ['.prototype-hero-container', '.hero-grid'],
  heading: ['.prototype-hero-copy h1', '.hero h1'],
  copy: ['.prototype-hero-value', '.hero-value'],
  downloads: ['.prototype-downloads', '.hero-downloads'],
  workflow: ['.hero-workflow', '.hero-workflow'],
  panel: ['.hero-workflow-panel', '.hero-workflow-panel'],
};
const report = { browser: browser.version(), viewports: [], differences: [] };
try {
  for (const width of [360, 390, 768, 1024, 1440]) {
    const pair = [];
    for (const [index, url] of [
      'http://127.0.0.1:6002/original-preview/?v=tcp-plan',
      process.env.M2_URL || 'http://127.0.0.1:16216/',
    ].entries()) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        locale: 'zh-CN',
        reducedMotion: 'reduce',
      });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      const metrics = {};
      for (const [name, sels] of Object.entries(selectors))
        metrics[name] = await page.locator(sels[index]).evaluate((el) => {
          const r = el.getBoundingClientRect(),
            s = getComputedStyle(el);
          return {
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            font: s.fontFamily,
            size: s.fontSize,
            lineHeight: s.lineHeight,
            color: s.color,
          };
        });
      for (let step = 0; step < 3; step++) {
        await page.locator('.hero-workflow-steps button').nth(step).click();
        await page.waitForTimeout(450);
        await page.evaluate(() => {
          document.documentElement.style.scrollBehavior = 'auto';
          scrollTo(0, 0);
        });
        await page.mouse.move(0, 0);
        await page.screenshot({
          path: new URL(
            `${index ? 'current' : 'reference'}-${width}-step-${step}.png`,
            output,
          ).pathname,
        });
      }
      const state = {
        width,
        site: index ? 'current' : 'reference',
        metrics,
        errors,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      };
      pair.push(state);
      report.viewports.push(state);
      await page.close();
    }
    for (const key of Object.keys(selectors))
      for (const dimension of ['x', 'y', 'width', 'height']) {
        const delta = Math.abs(
          pair[0].metrics[key][dimension] - pair[1].metrics[key][dimension],
        );
        if (delta > 4)
          report.differences.push({ width, key, dimension, delta });
      }
  }
} finally {
  await browser.close();
  await writeFile(
    new URL('visual.json', output),
    JSON.stringify(report, null, 2) + '\n',
  );
}
console.log(
  JSON.stringify(
    {
      differences: report.differences,
      errors: report.viewports.filter((v) => v.errors.length || v.overflow),
    },
    null,
    2,
  ),
);
if (
  report.differences.length ||
  report.viewports.some((v) => v.errors.length || v.overflow)
)
  process.exitCode = 1;
