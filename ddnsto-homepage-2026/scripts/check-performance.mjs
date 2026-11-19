import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
const out = process.env.LAB_OUTPUT || '/tmp/ddnsto-m7';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const runs = [];
for (const path of ['/', '/scenarios/tcp/', '/devices/istoreos/']) {
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: 1600000 / 8,
      uploadThroughput: 750000 / 8,
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.__lab = { lcp: 0, cls: 0, longTasks: 0 };
      let start = 0,
        last = 0,
        value = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.__lab.lcp = e.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.hadRecentInput) continue;
          if (e.startTime - last > 1000 || e.startTime - start > 5000) {
            start = e.startTime;
            value = 0;
          }
          last = e.startTime;
          value += e.value;
          window.__lab.cls = Math.max(window.__lab.cls, value);
        }
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          window.__lab.longTasks += Math.max(0, e.duration - 50);
      }).observe({ type: 'longtask', buffered: true });
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const r = await page.goto(
      (process.env.LAB_URL || 'http://127.0.0.1:16209') + path,
      { waitUntil: 'load' },
    );
    await page.waitForTimeout(5000);
    const metrics = await page.evaluate(() => ({
      ...window.__lab,
      resources: performance.getEntriesByType('resource').length,
      bytes: performance
        .getEntriesByType('resource')
        .reduce((n, e) => n + e.transferSize, 0),
    }));
    runs.push({ path, run, status: r.status(), ...metrics, errors });
    console.log(JSON.stringify(runs.at(-1)));
    await context.close();
  }
}
const median = (xs) => xs.sort((a, b) => a - b)[1];
const summary = [...new Set(runs.map((x) => x.path))].map((path) => ({
  path,
  lcp: median(runs.filter((x) => x.path === path).map((x) => x.lcp)),
  cls: median(runs.filter((x) => x.path === path).map((x) => x.cls)),
}));
await writeFile(
  out + '/performance.json',
  JSON.stringify(
    {
      environment: {
        browser: browser.version(),
        viewport: '390x844',
        cpuSlowdown: 4,
        latencyMs: 150,
        downloadMbps: 1.6,
        uploadMbps: 0.75,
        cache: 'disabled/new context per run',
        server: 'Astro preview of static dist on loopback; no CDN compression',
        observeAfterLoadMs: 5000,
        INP: 'not measured; requires field data',
      },
      runs,
      summary,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(summary));
await browser.close();
