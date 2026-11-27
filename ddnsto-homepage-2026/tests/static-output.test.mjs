import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../dist/', import.meta.url);
test('首页正文直接输出为 HTML，未验收全站保持禁止索引', () => {
  const html = readFileSync(new URL('index.html', root), 'utf8');
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  assert.equal(heading?.replace(/<[^>]+>/g, '').trim(), '远程访问，如此简单。');
  assert.match(html, /href="#devices"/);
  for (const audience of ['nas', 'it', 'home', 'ai']) {
    assert.match(html, new RegExp(`id="audience-panel-${audience}"`));
  }
  assert.match(html, /content="noindex,nofollow"/);
  assert.doesNotMatch(
    html,
    /192\.168\.9\.3|16002|ddnsto-homepage-2025|\/projects\//,
  );
});
test('自有品牌资源与 404 已输出，参考快照和删除的 FAQ 图片不进入产物', () => {
  assert.equal(existsSync(new URL('images/faq/', root)), false);
  assert.equal(
    existsSync(new URL('images/brand/ddnsto-logo.png', root)),
    false,
  );
  assert.ok(existsSync(new URL('images/brand/ddnsto-mark.svg', root)));
  assert.ok(existsSync(new URL('404.html', root)));
  assert.ok(!existsSync(new URL('reference/', root)));
});
