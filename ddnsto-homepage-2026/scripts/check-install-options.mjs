import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const output = '/tmp/ddnsto-install-options';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const results = [];
try {
  for (const width of [360, 390, 768, 1024, 1440]) {
    const states = [];
    for (const [name, url] of [
      ['reference', 'http://127.0.0.1:6002/v2/?v=install-options-1&ui=minimal'],
      ['new', 'http://127.0.0.1:16209/'],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        reducedMotion: 'reduce',
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.locator('#install-options').scrollIntoViewIfNeeded();
      await page.addStyleTag({
        content:
          'body>header,.site-header,.intent-band,.review,.theme-label,.tcp-gift,#customer-launcher{visibility:hidden!important}',
      });
      states.push(
        await page.locator('#install-options').evaluate((el) => {
          const box = el.getBoundingClientRect();
          return [
            ...el.querySelectorAll(
              '.si-options,article,h3,p,a,button,pre,code',
            ),
          ].map((node) => {
            const rect = node.getBoundingClientRect(),
              css = getComputedStyle(node);
            return {
              text: node.innerText.trim(),
              x: rect.x - box.x,
              y: rect.y - box.y,
              width: rect.width,
              height: rect.height,
              font: css.font,
              color: css.color,
              background: css.backgroundColor,
              whiteSpace: css.whiteSpace,
            };
          });
        }),
      );
      await page
        .locator('#install-options')
        .screenshot({ path: `${output}/${name}-${width}.png` });
      await page.close();
    }
    const issues = [];
    for (let i = 0; i < states[0].length; i++) {
      const a = states[0][i],
        b = states[1][i];
      if (!b) {
        issues.push({ i, missing: true });
        continue;
      }
      for (const key of Object.keys(a)) {
        const different =
          typeof a[key] === 'number'
            ? Math.abs(a[key] - b[key]) > 1
            : a[key].replace(/\s+/g, ' ') !== b[key].replace(/\s+/g, ' ');
        if (different)
          issues.push({ i, key, reference: a[key], actual: b[key] });
      }
    }
    results.push({ width, issues });
  }
} finally {
  await browser.close();
}
await writeFile(`${output}/comparison.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some((r) => r.issues.length)) process.exitCode = 1;
