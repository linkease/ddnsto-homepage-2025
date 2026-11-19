import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { startReferenceServer } from './reference-server.mjs';
const out = process.env.M3_OUTPUT || '/tmp/ddnsto-2026-m3';
await mkdir(out, { recursive: true });
const reference = await startReferenceServer();
const browser = await chromium.launch({ channel: 'chromium' });
const report = [];
try {
  for (const width of [360, 390, 768, 1024, 1440]) {
    for (const [kind, url] of [
      ['reference', `${reference.url}/v2/?ui=minimal`],
      ['render', process.env.M3_URL || 'http://127.0.0.1:16206/'],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        reducedMotion: 'reduce',
      });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      if (kind === 'reference')
        await page
          .locator('.review,.theme-label,.tcp-gift,#customer-launcher')
          .evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
      const capture = async (name) => {
        const workspace = page.locator('.scenario-workspace');
        // Keep sticky chrome outside the component crop, consistently for reference and render.
        await page.addStyleTag({
          content:
            'body > header, .site-header, .intent-band, .skip, .skip-link {visibility:hidden!important}',
        });
        await page.mouse.move(0, 0);
        await workspace.screenshot({
          path: `${out}/${kind}-${width}-${name}.png`,
        });
        const metrics = await page.evaluate(() => {
          const base = document
            .querySelector('.scenario-workspace')
            .getBoundingClientRect();
          const selectors = [
            '.scenario-workspace',
            '.scenario-sidebar',
            '#experience-panel',
            '.experience-chrome',
            '#experience-body',
            '.lab-steps',
            '.lab-center',
            '.lab-center h3',
            '.lab-center .btn',
            '.asus-software',
            '.rd-form',
            '.fm-config',
          ];
          return Object.fromEntries(
            selectors.flatMap((selector) => {
              const node = document.querySelector(selector);
              if (!node) return [];
              const box = node.getBoundingClientRect(),
                style = getComputedStyle(node);
              return [
                [
                  selector,
                  {
                    x: box.x - base.x,
                    y: box.y - base.y,
                    width: box.width,
                    height: box.height,
                    fontSize: style.fontSize,
                    lineHeight: style.lineHeight,
                    color: style.color,
                  },
                ],
              ];
            }),
          );
        });
        report.push({
          kind,
          width,
          state: name,
          overflow: await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          errors: [...errors],
          metrics,
        });
      };
      for (const scene of ['apps', 'tcp', 'files', 'device']) {
        await page.locator(`#${scene}-scenario`).click();
        await page.locator('#experience-reset').click();
        await capture(`${scene}-initial`);
        if (width !== 390 && width !== 1440) continue;
        const click = async (action) =>
          page.locator(`[data-action="${action}"]`).first().click();
        if (scene === 'apps') {
          await click('scan');
          await page.locator('#lab-all').check();
          await capture('apps-select');
          await click('add');
          await page.locator('[data-open-service="0"]').click();
          await capture('apps-result');
        } else if (scene === 'tcp') {
          await click('rd-start');
          await capture('tcp-config');
          await click('rd-add');
          await click('rd-web');
          await page.locator('[data-pc-folder="工作文档"]').click();
          await page.locator('[data-pc-file="项目计划.txt"]').click();
          await capture('tcp-desktop');
        } else if (scene === 'files') {
          await click('fm-start');
          await capture('files-config');
          await click('fm-save');
          await click('fm-access');
          await click('fm-open');
          await click('files-folder');
          await page.locator('[data-file="项目计划.txt"]').click();
          await capture('files-preview');
        } else {
          await click('asus-enable');
          await page.locator('[data-action="asus-console"]').waitFor();
          await capture('device-link');
          await click('asus-console');
          await capture('device-console');
        }
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => reference.server.close(resolve));
}
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2) + '\n');
console.log(
  JSON.stringify(
    {
      captures: report.length,
      failures: report
        .filter((row) => row.overflow || row.errors.length)
        .map(({ kind, width, state, overflow, errors }) => ({
          kind,
          width,
          state,
          overflow,
          errors,
        })),
    },
    null,
    2,
  ),
);
