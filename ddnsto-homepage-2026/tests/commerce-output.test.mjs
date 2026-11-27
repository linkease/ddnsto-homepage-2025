import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
test('commercial facts and design FAQ answers are emitted as HTML with local media', async () => {
  const html = await readFile(
    new URL('../dist/index.html', import.meta.url),
    'utf8',
  );
  for (const fact of [
    '¥2.20',
    '¥6.50',
    '限时免费20G/月/台',
    '粤ICP备20024441号',
    '粤B2-20251165',
    '44030002008017',
    '工作日 13:30–18:00',
  ])
    assert.ok(html.includes(fact), fact);
  const faq = html.match(/<section id="faq"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.equal((faq.match(/<details\b/g) || []).length, 7);
  assert.doesNotMatch(
    html,
    /faq-browser|faq-library|faq-search|interactive-experience|scenario-demo|manual-workflow|images\/faq\//,
  );
  assert.doesNotMatch(html, /<img[^>]+src="https?:/);
  assert.doesNotMatch(html, /[￥¥]2\.00/);
  assert.match(html, /noindex/);
});
