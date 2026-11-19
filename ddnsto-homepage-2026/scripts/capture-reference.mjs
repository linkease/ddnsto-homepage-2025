import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { startReferenceServer } from './reference-server.mjs';

const destination = resolve(
  process.env.REFERENCE_OUTPUT || '/tmp/ddnsto-2026-m1-reference',
);
await mkdir(destination, { recursive: true });
const { server, url } = await startReferenceServer();
const browser = await chromium.launch({ channel: 'chromium' });
const report = {
  capturedAt: new Date().toISOString(),
  browser: browser.version(),
  referenceManifestSha256: createHash('sha256')
    .update(
      await readFile(new URL('../reference/manifest.json', import.meta.url)),
    )
    .digest('hex'),
  sourcePath: '/v2/?v=install-options-1&ui=minimal',
  screenshotMode:
    'reduced motion; animations disabled; fresh context per viewport',
  viewports: [],
  interactions: [],
  findings: [],
};
try {
  for (const width of [360, 390, 768, 1024, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [],
      failed = [],
      logs = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (['warning', 'error'].includes(message.type()))
        logs.push({ type: message.type(), text: message.text() });
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        failed.push({
          url: response.url().replace(url, ''),
          status: response.status(),
        });
    });
    page.on('requestfailed', (request) =>
      failed.push({
        url: request.url().replace(url, ''),
        error: request.failure()?.errorText,
      }),
    );
    await page.goto(url + report.sourcePath, { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute(
      'data-ui-theme',
      'minimal',
    );
    await expect(page.locator('h1')).toContainText('远程访问');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: resolve(destination, `home-${width}.png`),
      animations: 'disabled',
    });
    const measured = await page.evaluate(() => {
      const css = getComputedStyle(document.documentElement);
      const rootTokens = Object.fromEntries(
        [...css]
          .filter((name) => name.startsWith('--le-'))
          .map((name) => [name, css.getPropertyValue(name).trim()]),
      );
      const elements = Object.fromEntries(
        [
          'body',
          'header',
          '.wrap',
          '.hero',
          'h1',
          '.btn',
          '.scenario-workspace',
          '.prices',
        ].map((selector) => {
          const element = document.querySelector(selector);
          if (!element) return [selector, null];
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return [
            selector,
            {
              width: rect.width,
              height: rect.height,
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
              color: style.color,
              background: style.backgroundColor,
              borderRadius: style.borderRadius,
              gap: style.gap,
              display: style.display,
            },
          ];
        }),
      );
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        rootTokens,
        elements,
        sections: [...document.querySelectorAll('main section[id]')].map(
          (element) => ({
            id: element.id,
            heading: element.querySelector('h2')?.textContent,
          }),
        ),
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')]
          .map((a) => a.getAttribute('href'))
          .filter(
            (href) =>
              href.length > 1 && !document.getElementById(href.slice(1)),
          ),
      };
    });
    const viewport = {
      width,
      title: await page.title(),
      ...measured,
      errors,
      failed,
      logs,
    };
    report.viewports.push(viewport);
    if (measured.scrollWidth > width)
      report.findings.push({
        width,
        issue: 'horizontal overflow',
        actual: measured.scrollWidth,
      });
    if ([390, 1440].includes(width)) {
      for (const scene of ['apps', 'tcp', 'files', 'device']) {
        await page.locator(`#${scene}-scenario`).click();
        await expect(page.locator(`#${scene}-scenario`)).toHaveAttribute(
          'aria-selected',
          'true',
        );
        await expect(page.locator('#experience-panel')).toHaveAttribute(
          'aria-labelledby',
          `${scene}-scenario`,
        );
        await page.locator('#experience-reset').click();
        await page.locator('#scenarios').scrollIntoViewIfNeeded();
        await page.screenshot({
          path: resolve(destination, `scene-${scene}-${width}.png`),
          animations: 'disabled',
        });
        report.interactions.push({
          width,
          action: `select/reset ${scene}`,
          title: await page.locator('#experience-title').innerText(),
          cta: await page.locator('#experience-cta').getAttribute('href'),
        });
      }
      const platforms = page.locator('#platforms button');
      const second = platforms.nth(1);
      await second.click();
      await expect(second).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#platform-guide')).not.toBeEmpty();
      report.interactions.push({
        width,
        action: 'select device',
        selected: await second.innerText(),
        guide: (await page.locator('#platform-guide').innerText()).slice(
          0,
          220,
        ),
      });
      await page.locator('#faq-search').fill('__m1_no_matching_question__');
      await expect(page.locator('#faq-empty')).toBeVisible();
      await page.locator('#faq-search').fill('');
      const question = page.locator('#faqs details').first();
      await question.locator('summary').click();
      await expect(question).toHaveAttribute('open', '');
      report.interactions.push({
        width,
        action: 'FAQ no results → clear → expand',
        question: await question.locator('summary').innerText(),
      });
      if (width === 390) {
        await page.locator('#open-menu').click();
        await expect(page.locator('#menu-dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('#menu-dialog')).not.toBeVisible();
        report.interactions.push({
          width,
          action: 'mobile menu open → Escape',
          passed: true,
        });
      }
    }
    await context.close();
    if (errors.length || failed.length || logs.length)
      report.findings.push({
        width,
        issue: 'runtime or resource warnings',
        errors,
        failed,
        logs,
      });
  }
} finally {
  await browser.close();
  await new Promise((accept) => server.close(accept));
  await writeFile(
    resolve(destination, 'report.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
}
if (report.viewports.length !== 5)
  throw new Error('Incomplete reference capture');
console.log(
  JSON.stringify(
    {
      destination,
      viewports: report.viewports.length,
      interactions: report.interactions.length,
      findings: report.findings,
    },
    null,
    2,
  ),
);
