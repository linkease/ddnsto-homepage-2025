import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
await mkdir('artifacts/refresh-m4', { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const report = [];
for (const width of [360, 390, 768, 1024, 1440])
  for (const [i, url] of [
    'http://127.0.0.1:6002/original-preview/',
    process.env.M4_URL || 'http://127.0.0.1:16216/',
  ].entries()) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      locale: 'zh-CN',
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    let releaseScan;
    if (i) {
      let logged = false;
      await page.route('**/__install-auth-api/**', async (route) => {
        const action = new URL(route.request().url()).pathname.split('/').pop();
        let json = {};
        if (action === 'create') {
          logged = false;
          json = { id: 'visual-session' };
        }
        if (action === 'status')
          json = {
            status: logged ? 'logined' : 'not_logined',
            state: 'fixture',
          };
        if (action === 'qr')
          json = {
            status: 'not_logined',
            event_id: 'fixture',
            image: 'https://example.invalid/qr',
          };
        if (action === 'poll') {
          await new Promise((resolve) => {
            releaseScan = resolve;
          });
          json = { events: [{ data: { token: 'proof' } }] };
        }
        if (action === 'confirm') logged = true;
        if (action === 'profile')
          json = [{ id: 1, token: 'visual-test-fixture' }];
        await route.fulfill({ json });
      });
    }
    await page.goto(url);
    await page.waitForTimeout(1000);
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator(i ? '#devices' : '#supported-platforms');
    await root.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      for (const n of document.querySelectorAll('body *'))
        if (
          getComputedStyle(n).position === 'fixed' ||
          n.matches('.site-header')
        )
          n.style.visibility = 'hidden';
      document.getAnimations().forEach((a) => {
        if (a.effect?.getTiming().iterations === Infinity) {
          a.pause();
          a.currentTime = 0;
        } else a.finish();
      });
    });
    for (const state of [
      'software',
      'script',
      'scanning',
      'ready',
      'ai',
      'windows',
    ]) {
      if (['script', 'ai'].includes(state))
        await root
          .getByRole('tab', {
            name: state === 'script' ? /一键脚本/ : 'AI 帮我装',
          })
          .click();
      if (state === 'scanning')
        await root
          .getByRole('button', { name: '扫码获取安装命令', exact: true })
          .click();
      if (state === 'ready') {
        if (i) {
          releaseScan?.();
          await root.locator('[data-scan-state=ready]').waitFor();
        } else
          await root
            .getByRole('button', { name: '模拟扫码成功', exact: true })
            .click();
      }
      if (state === 'windows') {
        if (i) await root.locator('[data-platform="terminal-windows"]').click();
        else
          await root.locator('.install-terminal-grid button').first().click();
      }
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
      await root.screenshot({
        path: `artifacts/refresh-m4/${i ? 'current' : 'reference'}-${width}-${state}.png`,
      });
      const metrics = await root.evaluate((el) =>
        Object.fromEntries(
          [
            '.install-title',
            '.install-layout',
            '.install-platforms',
            '.install-guide',
            '.install-method-tabs',
            '.si-window',
            '.si-copy',
            '.si-steps',
            '.script-guide',
            '.ai-install-guide',
          ].map((sel) => [
            sel,
            [...el.querySelectorAll(sel)]
              .filter(
                (n) =>
                  n.getBoundingClientRect().width &&
                  n.getBoundingClientRect().height,
              )
              .map((n) => {
                const r = n.getBoundingClientRect(),
                  s = getComputedStyle(n),
                  base = el.getBoundingClientRect();
                return {
                  x: r.x,
                  y: r.y - base.y,
                  w: r.width,
                  h: r.height,
                  font: s.fontSize,
                  line: s.lineHeight,
                };
              }),
          ]),
        ),
      );
      report.push({
        width,
        site: i ? 'current' : 'reference',
        state,
        metrics,
        errors,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      });
    }
    await page.close();
  }
await browser.close();
await writeFile(
  'artifacts/refresh-m4/visual.json',
  JSON.stringify(report, null, 2),
);
console.log(report.filter((r) => r.errors.length || r.overflow));

const failures = [];
for (const current of report.filter((r) => r.site === 'current')) {
  const reference = report.find(
    (r) =>
      r.site === 'reference' &&
      r.width === current.width &&
      r.state === current.state,
  );
  if (current.errors.length || current.overflow)
    failures.push({
      width: current.width,
      state: current.state,
      errors: current.errors,
      overflow: current.overflow,
    });
  for (const key of [
    '.install-title',
    '.install-guide',
    '.install-method-tabs',
    '.si-window',
    '.si-copy',
    '.si-steps',
    '.script-guide',
    '.ai-install-guide',
  ]) {
    const a = reference.metrics[key][0],
      b = current.metrics[key][0];
    if (!a || !b) continue;
    // Compatibility device disclosure adds 42px before the guide on narrow layouts.
    const offset = current.width <= 900 && key !== '.install-title' ? 42 : 0;
    for (const dim of ['x', 'y', 'w', 'h']) {
      const delta = b[dim] - a[dim] - (dim === 'y' ? offset : 0);
      if (Math.abs(delta) > 4)
        failures.push({
          width: current.width,
          state: current.state,
          key,
          dim,
          delta,
        });
    }
  }
}
await writeFile(
  'artifacts/refresh-m4/comparison.json',
  JSON.stringify(failures, null, 2),
);
console.log(JSON.stringify({ samples: report.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
