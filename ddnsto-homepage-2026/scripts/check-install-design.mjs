import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const output = process.env.INSTALL_OUTPUT || '/tmp/ddnsto-install-design';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const failures = [];
let states = 0;
try {
  for (const width of [360, 390, 768, 1024, 1440]) {
    const pages = [];
    for (const url of [
      process.env.REFERENCE_URL ||
        'http://127.0.0.1:6002/v2/?v=install-options-1&ui=minimal',
      process.env.INSTALL_URL || 'http://127.0.0.1:16209/',
    ]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        reducedMotion: 'reduce',
      });
      page.on('pageerror', (e) =>
        failures.push({ width, url, error: e.message }),
      );
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.addStyleTag({
        content:
          'body>header,.site-header,.intent-band,.review,.theme-label,.tcp-gift,#customer-launcher,.skip,.skip-link{visibility:hidden!important}',
      });
      pages.push(page);
    }
    for (let platform = 0; platform < 18; platform++) {
      for (const page of pages)
        await page.locator('#platforms button').nth(platform).click();
      const counts = await Promise.all(
        pages.map((p) => p.locator('.si-steps:visible button').count()),
      );
      if (counts[0] !== counts[1]) failures.push({ width, platform, counts });
      for (let step = 0; step < Math.min(...counts); step++) {
        const snapshots = [];
        for (const [i, page] of pages.entries()) {
          await page.locator('.si-steps:visible button').nth(step).click();
          await page.mouse.move(0, 0);
          snapshots.push(
            await page.evaluate(() => {
              const parent = document
                .querySelector('.device-layout')
                .getBoundingClientRect();
              const data = {};
              for (const selector of [
                '.device-layout',
                '#platforms',
                '.si-heading',
                '.si-window',
                '.si-copy',
                '.si-steps',
                '.si-note',
              ]) {
                const el = [...document.querySelectorAll(selector)].find(
                  (el) => el.getClientRects().length,
                );
                if (!el) {
                  data[selector] = null;
                  continue;
                }
                const r = el.getBoundingClientRect();
                const css = getComputedStyle(el);
                data[selector] = {
                  text: el.textContent.replace(/\s+/g, '').trim(),
                  box: [r.x - parent.x, r.y - parent.y, r.width, r.height],
                  font: css.font,
                  color: css.color,
                  background: css.backgroundColor,
                };
              }
              return data;
            }),
          );
          if ([390, 1440].includes(width) && platform === 4)
            await page.locator('.device-layout').screenshot({
              path: `${output}/${i ? 'new' : 'reference'}-${width}-openwrt-${step}.png`,
            });
        }
        for (const selector of Object.keys(snapshots[0])) {
          const a = snapshots[0][selector],
            b = snapshots[1][selector];
          if (!a || !b) {
            if (a !== b)
              failures.push({ width, platform, step, selector, a, b });
            continue;
          }
          const delta = Math.max(
            ...a.box.map((x, i) => Math.abs(x - b.box[i])),
          );
          // Whole-layout text includes additional accessibility-only announcements.
          const textMismatch =
            !['.device-layout', '#platforms'].includes(selector) &&
            a.text !== b.text;
          if (
            delta > 4 ||
            textMismatch ||
            a.font !== b.font ||
            a.color !== b.color ||
            a.background !== b.background
          )
            failures.push({
              width,
              platform,
              step,
              selector,
              delta,
              textMismatch,
              a,
              b,
            });
        }
        states++;
      }
    }
    for (const page of pages) await page.close();
    console.log(JSON.stringify({ width, states, failures: failures.length }));
  }
} finally {
  await browser.close();
}
await writeFile(
  `${output}/comparison.json`,
  JSON.stringify({ states, failures }, null, 2),
);
if (failures.length) process.exitCode = 1;
