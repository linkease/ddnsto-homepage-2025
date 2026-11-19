import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { publishedPaths } from '../src/config/publishing.mjs';
test('all published routes contain distinct static content and complete preview metadata', () => {
  const titles = new Set(),
    descriptions = new Set();
  for (const path of publishedPaths) {
    const html = readFileSync(
      new URL(`../dist${path}index.html`, import.meta.url),
      'utf8',
    );
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const description = html.match(/name="description" content="([^"]+)"/)?.[1];
    assert.ok(title && description, path);
    assert.ok(!titles.has(title), path);
    titles.add(title);
    assert.ok(!descriptions.has(description), path);
    descriptions.add(description);
    assert.match(html, /property="og:image"/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.match(html, /noindex,nofollow/);
    assert.doesNotMatch(
      html,
      /阶段待实现|将在 M6 接入|preview\.invalid|rel="canonical"/,
    );
    if (path.startsWith('/devices/')) assert.match(html, /安装与配置步骤/);
    if (path.startsWith('/scenarios/')) assert.match(html, /能力与使用边界/);
  }
  assert.equal(publishedPaths.length, 23);
  assert.ok(
    existsSync(new URL('../dist/images/brand/share.png', import.meta.url)),
  );
});
