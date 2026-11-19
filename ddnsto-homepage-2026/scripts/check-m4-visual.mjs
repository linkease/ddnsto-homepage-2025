import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { startReferenceServer } from './reference-server.mjs';
const out = process.env.M4_OUTPUT || '/tmp/ddnsto-2026-m4';
await mkdir(out, { recursive: true });
const ref = await startReferenceServer();
const browser = await chromium.launch({ channel: 'chromium' });
const report = [];
try {
  for (const width of [360, 390, 768, 1024, 1440]) {
    for (const [kind, url] of [
      ['reference', `${ref.url}/v2/?ui=minimal`],
      ['render', process.env.M4_URL || 'http://127.0.0.1:16206/'],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        reducedMotion: 'reduce',
      });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('response', (r) => {
        if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.addStyleTag({
        content:
          'body>header,.site-header,.intent-band,.review,.theme-label,.tcp-gift,#customer-launcher,.skip,.skip-link {visibility:hidden!important}',
      });
      const capture = async (name) => {
        await page.mouse.move(0, 0);
        await page
          .locator('#devices')
          .screenshot({ path: `${out}/${kind}-${width}-${name}.png` });
        const metrics = await page.evaluate(() => {
          const base = document
            .querySelector('.device-layout')
            .getBoundingClientRect();
          return Object.fromEntries(
            [
              '.device-layout',
              '#platforms',
              '#platform-guide',
              '.si-heading',
              '.si-window',
              '.si-copy',
              '.si-steps',
              '#install-options',
            ].map((s) => {
              const n = [...document.querySelectorAll(s)].find(
                  (node) => node.getClientRects().length,
                ),
                r = n.getBoundingClientRect(),
                c = getComputedStyle(n);
              return [
                s,
                {
                  x: r.x - base.x,
                  y: r.y - base.y,
                  width: r.width,
                  height: r.height,
                  font: c.font,
                  color: c.color,
                  background: c.backgroundColor,
                },
              ];
            }),
          );
        });
        report.push({
          kind,
          width,
          name,
          title: await page.title(),
          metrics,
          overflow: await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          errors: [...errors],
        });
      };
      await capture('easepi');
      if ([390, 1440].includes(width)) {
        await page
          .locator('#platforms button')
          .filter({ hasText: 'Windows' })
          .click();
        await capture('windows');
        await page
          .locator('#platforms button')
          .filter({ hasText: '华硕' })
          .click();
        await capture('asusgo');
        await page.locator('.si-steps:visible button').nth(1).click();
        await capture('token');
      }
      await page.close();
    }
  }
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      captures: report.length,
      issues: report.filter((x) => x.errors.length || x.overflow),
    }),
  );
} finally {
  await browser.close();
  ref.server.close();
}
