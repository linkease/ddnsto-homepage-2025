import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

test('Google commands use native Arguments and queue events before SDK loads', () => {
  const scripts = [];
  const context = vm.createContext({
    window: {},
    document: {
      createElement: () => ({}),
      head: { appendChild: (s) => scripts.push(s) },
    },
  });
  vm.runInContext(
    readFileSync(
      new URL('../public/script/google-analytics.js', import.meta.url),
      'utf8',
    ),
    context,
  );
  vm.runInContext(
    "gtag('event', 'click_login_console', {section: 'hero', language: 'zh'})",
    context,
  );
  const queue = context.window.dataLayer;
  assert.equal(queue.length, 3);
  for (const command of queue) {
    assert.equal(Object.prototype.toString.call(command), '[object Arguments]');
    assert.equal(Array.isArray(command), false);
  }
  assert.equal(queue[1][0], 'config');
  assert.equal(queue[1][1], 'G-1QGR1XG068');
  assert.equal(queue[2][1], 'click_login_console');
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].async, true);
});

test('every rendered control-panel link has attribution and retains its destination', () => {
  const root = new URL('../dist/', import.meta.url);
  let count = 0;
  let purchases = 0;
  for (const path of readdirSync(root, { recursive: true }).filter((p) =>
    p.endsWith('.html'),
  )) {
    const html = readFileSync(new URL(path, root), 'utf8');
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const url = new URL(
        match[1].replaceAll('&amp;', '&'),
        'https://web.ddnsto.com',
      );
      if (
        url.hostname !== 'web.ddnsto.com' ||
        !url.pathname.startsWith('/app/')
      )
        continue;
      count++;
      assert.equal(url.searchParams.get('utm_source'), 'website', path);
      assert.equal(url.searchParams.get('utm_medium'), 'website', path);
      assert.ok(
        ['#/devices', '#/plans?entry=purchase'].includes(url.hash),
        path,
      );
      if (url.hash.startsWith('#/plans')) purchases++;
    }
  }
  assert.ok(count > 10);
  assert.ok(purchases > 0);
});

test('all pages load statistics exactly once in production and never in preview', () => {
  const root = new URL('../dist/', import.meta.url);
  const expected = process.env.SITE_ENV === 'production' ? 1 : 0;
  for (const path of readdirSync(root, { recursive: true }).filter((p) =>
    p.endsWith('.html'),
  )) {
    const html = readFileSync(new URL(path, root), 'utf8');
    for (const script of ['analytics.js', 'google-analytics.js']) {
      assert.equal(
        html.split(`src="/script/${script}"`).length - 1,
        expected,
        path,
      );
    }
    assert.equal(
      html.includes('data-analytics-enabled="true"'),
      expected === 1,
      path,
    );
  }
});
