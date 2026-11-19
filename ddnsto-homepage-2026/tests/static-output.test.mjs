import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../dist/', import.meta.url);
test('首页正文直接输出为 HTML，未验收全站保持禁止索引', () => {
  const html = readFileSync(new URL('index.html', root), 'utf8');
  assert.match(html, /<h1[^>]*>远程访问，如此简单。<\/h1>/);
  assert.match(html, /href="#devices"/);
  assert.match(html, /交互演示 · 模拟数据/);
  for (const scene of ['apps', 'tcp', 'files', 'device']) {
    assert.match(html, new RegExp(`id="${scene}-scenario"`));
  }
  assert.doesNotMatch(html, /场景交互演示将在 M3 接入/);
  assert.match(html, /content="noindex,nofollow"/);
  assert.doesNotMatch(
    html,
    /192\.168\.9\.3|16002|ddnsto-homepage-2025|\/projects\//,
  );
});
test('自有品牌资源与 404 已输出，参考快照不进入产物', () => {
  assert.ok(existsSync(new URL('images/brand/ddnsto-logo.png', root)));
  assert.ok(existsSync(new URL('404.html', root)));
  assert.ok(!existsSync(new URL('reference/', root)));
});
