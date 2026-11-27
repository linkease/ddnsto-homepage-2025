import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
await mkdir('artifacts/refresh-m3', { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const report = [];
const sels = {
  features: ['#features', '#features'],
  heading: ['#features h2', '#features h2'],
  cards: ['#features .group.relative', '#features .feature-card'],
  visuals: ['#features [data-nosnippet]', '#features .feature-demo'],
  scenarios: ['#scenarios', '#scenarios'],
  scenarioHeading: ['#scenarios h2', '#scenarios .audience-heading h2'],
  tabs: ['#scenarios .scenario-tabs', '#scenarios .audience-tabs'],
  panel: [
    '#scenarios .scenario-card',
    '#scenarios .audience-card:not([hidden])',
  ],
};
for (const width of [360, 390, 768, 1024, 1440]) {
  for (const [i, url] of [
    'http://127.0.0.1:6002/original-preview/?v=tcp-plan',
    process.env.M3_URL || 'http://127.0.0.1:16216/',
  ].entries()) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
      locale: 'zh-CN',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content:
        '.site-header,nav.fixed,.tcp-gift,.floating-support,.support-widget{visibility:hidden!important}',
    });
    const tabs = page.locator(
      i ? 'audience-tabs [role=tab]' : '#scenarios .scenario-tabs button',
    );
    await tabs.first().click();
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('body *'))
        if (getComputedStyle(el).position === 'fixed')
          el.style.visibility = 'hidden';
    });
    await page.addStyleTag({
      content:
        '#features .group.relative { transform:none!important;opacity:1!important; }',
    });
    await page.locator('#features').scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(700);
    await page.evaluate(() =>
      document.getAnimations().forEach((a) => {
        if (a.effect?.getTiming().iterations === Infinity) {
          a.pause();
          a.currentTime = 0;
        } else a.finish();
      }),
    );
    await page.locator('#features').screenshot({
      path: `artifacts/refresh-m3/${i ? 'current' : 'reference'}-${width}-features.png`,
    });
    const features = {};
    for (const key of ['features', 'heading', 'cards', 'visuals'])
      features[key] = await page.locator(sels[key][i]).evaluateAll((nodes) =>
        nodes.map((n) => {
          const r = n.getBoundingClientRect(),
            s = getComputedStyle(n);
          return {
            x: r.x,
            y: r.y + scrollY,
            w: r.width,
            h: r.height,
            font: s.fontSize,
            line: s.lineHeight,
            color: s.color,
            bg: s.background,
          };
        }),
      );
    for (let step = 0; step < 4; step++) {
      await tabs.nth(step).click();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(850);
      await page
        .locator(i ? '.audience-layout' : '.scenario-layout')
        .screenshot({
          path: `artifacts/refresh-m3/${i ? 'current' : 'reference'}-${width}-scenario-${step}.png`,
        });
      const scenario = {};
      for (const key of ['scenarios', 'scenarioHeading', 'tabs', 'panel'])
        scenario[key] = await page.locator(sels[key][i]).evaluateAll((nodes) =>
          nodes.map((n) => {
            const r = n.getBoundingClientRect(),
              s = getComputedStyle(n);
            return {
              x: r.x,
              y: r.y + scrollY,
              w: r.width,
              h: r.height,
              font: s.fontSize,
              line: s.lineHeight,
              color: s.color,
              bg: s.background,
            };
          }),
        );
      report.push({
        site: i ? 'current' : 'reference',
        width,
        step,
        features,
        scenario,
        errors,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      });
    }
    await page.close();
  }
}
await browser.close();
await writeFile(
  'artifacts/refresh-m3/visual.json',
  JSON.stringify(report, null, 2),
);
console.log(
  'Captured 50 screenshots; ' +
    report.filter((r) => r.errors.length || r.overflow).length +
    ' error states',
);

const differences = [];
for (const width of [360, 390, 768, 1024, 1440])
  for (let step = 0; step < 4; step++) {
    const ref = report.find(
      (r) => r.width === width && r.step === step && r.site === 'reference',
    );
    const cur = report.find(
      (r) => r.width === width && r.step === step && r.site === 'current',
    );
    for (const [group, keys, section] of [
      ['features', ['heading', 'cards', 'visuals'], 'features'],
      ['scenario', ['scenarioHeading', 'tabs', 'panel'], 'scenarios'],
    ]) {
      if (group === 'features' && step) continue;
      for (const key of keys) {
        if (ref[group][key].length !== cur[group][key].length)
          throw new Error(`Missing ${key} at ${width}`);
        ref[group][key].forEach((rect, index) => {
          for (const dimension of ['x', 'y', 'w', 'h']) {
            let delta = rect[dimension] - cur[group][key][index][dimension];
            if (dimension === 'y')
              delta -= ref[group][section][0].y - cur[group][section][0].y;
            if (Math.abs(delta) > 4)
              differences.push({ width, step, key, index, dimension, delta });
          }
        });
      }
    }
  }
const errors = report
  .filter((r) => r.errors.length || r.overflow)
  .map(({ site, width, step, errors, overflow }) => ({
    site,
    width,
    step,
    errors,
    overflow,
  }));
await writeFile(
  'artifacts/refresh-m3/comparison.json',
  JSON.stringify({ differences, errors }, null, 2) + '\n',
);
console.log(JSON.stringify({ differences, errors }, null, 2));
if (differences.length || errors.length) process.exitCode = 1;
