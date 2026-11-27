import { chromium, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Read-only browser inspection. Never builds, serves or writes the reference.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'artifacts/refresh-m1');
const referenceRoot =
  process.env.REFERENCE_ROOT ||
  '/projects/workspace-codex/linkease/ddnsto-meta/.site-design/ddnsto-original-prototype';
const referenceUrl =
  process.env.REFERENCE_URL ||
  'http://127.0.0.1:6002/original-preview/?v=tcp-plan';
const currentUrl = process.env.CURRENT_URL || 'http://127.0.0.1:16216/';
const hash = (value) => createHash('sha256').update(value).digest('hex');
async function inventory(base, folders) {
  const files = [];
  async function walk(path) {
    for (const entry of (await readdir(path, { withFileTypes: true })).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      const child = resolve(path, entry.name);
      if (entry.isDirectory()) await walk(child);
      else if (entry.isFile())
        files.push({
          path: relative(base, child).split(sep).join('/'),
          sha256: hash(await readFile(child)),
        });
      else throw new Error(`Unexpected link: ${child}`);
    }
  }
  for (const folder of folders) await walk(resolve(base, folder));
  return files;
}
await mkdir(output, { recursive: true });
const sourceBefore = await inventory(referenceRoot, ['src', 'public']);
const currentBefore = await inventory(root, ['src', 'public', 'tests']);
const html = await fetch(referenceUrl);
if (!html.ok) throw new Error(`Reference HTTP ${html.status}`);
const report = {
  capturedAt: new Date().toISOString(),
  referenceUrl,
  referenceRoot,
  currentUrl,
  referenceHtmlSha256: hash(await html.text()),
  sourceFiles: sourceBefore,
  currentBusinessSha256: hash(JSON.stringify(currentBefore)),
  mode: 'zh-CN; Linux; reduced motion; same browser; scroll reveal settled; hero first step selected; screenshots disable CSS animations. JS demo contents are sampled, not pixel-stable.',
  viewports: [],
  interactions: [],
};
const browser = await chromium.launch({ channel: 'chromium' });
report.browser = browser.version();
try {
  for (const [site, url] of [
    ['reference', referenceUrl],
    ['current', currentUrl],
  ]) {
    for (const width of [360, 390, 768, 1024, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        locale: 'zh-CN',
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      const errors = [],
        consoleMessages = [],
        failedRequests = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (['error', 'warning'].includes(m.type()))
          consoleMessages.push({ type: m.type(), text: m.text() });
      });
      page.on('requestfailed', (r) =>
        failedRequests.push({ url: r.url(), error: r.failure()?.errorText }),
      );
      page.on('response', (r) => {
        if (r.status() >= 400)
          failedRequests.push({ url: r.url(), status: r.status() });
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      await expect(page.locator('h1')).toContainText('远程访问');
      await page.evaluate(() => document.fonts.ready);
      for (
        let y = 0;
        y < (await page.evaluate(() => document.documentElement.scrollHeight));
        y += 650
      ) {
        await page.evaluate((y) => scrollTo(0, y), y);
        await page.waitForTimeout(100);
      }
      await page.waitForTimeout(700);
      if (site === 'reference')
        await page.locator('.hero-workflow-steps button').first().click();
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        scrollTo(0, 0);
      });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: resolve(output, `${site}-${width}-hero.png`),
        animations: 'disabled',
      });
      await page.screenshot({
        path: resolve(output, `${site}-${width}-full.png`),
        fullPage: true,
        animations: 'disabled',
      });
      // Hidden FAQ/popover images are lazy: explicitly load them before judging decode.
      await page.evaluate(async () => {
        await Promise.all(
          Array.from(document.images).map(async (img) => {
            img.loading = 'eager';
            try {
              await img.decode();
            } catch {
              /* Recorded below as a broken image. */
            }
          }),
        );
      });
      const metrics = await page.evaluate(() => {
        const selectors = [
          'nav',
          'h1',
          'h2',
          '.prototype-hero-grid',
          '.hero',
          '.hero-workflow-panel',
          '#features',
          '#scenarios',
          '#supported-platforms',
          '#devices',
          '#pricing',
          '#faq',
          'footer',
        ];
        const elements = selectors.flatMap((selector) =>
          Array.from(document.querySelectorAll(selector))
            .filter((el) => el.getBoundingClientRect().height > 0)
            .map((el) => {
              const r = el.getBoundingClientRect(),
                s = getComputedStyle(el);
              return {
                selector,
                text: el.matches('h1,h2') ? el.textContent.trim() : undefined,
                x: r.x,
                y: r.y + scrollY,
                width: r.width,
                height: r.height,
                font: s.fontFamily,
                fontSize: s.fontSize,
                lineHeight: s.lineHeight,
                color: s.color,
                background: s.backgroundColor,
                borderRadius: s.borderRadius,
              };
            }),
        );
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          elements,
          links: Array.from(document.querySelectorAll('a[href]')).map((a) => ({
            text: a.textContent.trim(),
            href: a.getAttribute('href'),
          })),
          brokenImages: Array.from(document.images)
            .filter((i) => !i.complete || i.naturalWidth === 0)
            .map((i) => i.src),
        };
      });
      report.viewports.push({
        site,
        width,
        title: await page.title(),
        url: page.url(),
        errors,
        consoleMessages,
        failedRequests,
        ...metrics,
      });
      if (site === 'reference' && [390, 1440].includes(width)) {
        const capture = async (name) => {
          await page.screenshot({
            path: resolve(output, `reference-${width}-${name}.png`),
            animations: 'disabled',
          });
          report.interactions.push({ width, name, passed: true });
        };
        await page.getByRole('tab', { name: 'AI 帮我装', exact: true }).click();
        await expect(
          page.getByRole('textbox', { name: 'AI 安装提示词' }),
        ).toBeVisible();
        await capture('ai');
        await page.getByRole('tab', { name: /一键脚本/ }).click();
        await page
          .getByRole('button', { name: '扫码获取安装命令', exact: true })
          .click();
        await expect(
          page.getByText('原型演示：此处为二维码占位，尚未接入真实扫码服务。'),
        ).toBeVisible();
        await capture('scan-placeholder');
        await page
          .getByRole('button', { name: '模拟扫码成功', exact: true })
          .click();
        await expect(page.locator('.script-command').first()).toContainText(
          'DEMO_TOKEN_NOT_VALID',
        );
        await capture('scan-demo');
        await page
          .getByRole('button', {
            name: '联系客服，显示微信二维码',
            exact: true,
          })
          .click();
        await expect(page.locator('#customer-panel')).toBeVisible();
        await capture('support');
        await page.keyboard.press('Escape');
        await expect(page.locator('#customer-panel')).not.toBeVisible();
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  report.referenceUnchanged =
    JSON.stringify(sourceBefore) ===
    JSON.stringify(await inventory(referenceRoot, ['src', 'public']));
  report.currentBusinessUnchanged =
    JSON.stringify(currentBefore) ===
    JSON.stringify(await inventory(root, ['src', 'public', 'tests']));
  report.referenceHttpAfter = (await fetch(referenceUrl)).status;
  await writeFile(
    resolve(output, 'baseline.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
}
if (!report.referenceUnchanged || !report.currentBusinessUnchanged)
  throw new Error('Source changed during capture');
if (
  report.viewports.some(
    (v) =>
      v.site === 'current' &&
      (v.overflow ||
        v.errors.length ||
        v.failedRequests.length ||
        v.brokenImages.length),
  )
)
  throw new Error(
    'Current baseline has rendering or resource failures; inspect baseline.json',
  );
console.log(
  JSON.stringify(
    {
      viewports: report.viewports.length,
      interactions: report.interactions.length,
      referenceUnchanged: report.referenceUnchanged,
      currentBusinessUnchanged: report.currentBusinessUnchanged,
      referenceHttpAfter: report.referenceHttpAfter,
      findings: report.viewports
        .filter(
          (v) =>
            v.overflow ||
            v.errors.length ||
            v.failedRequests.length ||
            v.brokenImages.length,
        )
        .map((v) => ({
          site: v.site,
          width: v.width,
          overflow: v.overflow,
          errors: v.errors,
          failed: v.failedRequests,
          broken: v.brokenImages,
        })),
    },
    null,
    2,
  ),
);
