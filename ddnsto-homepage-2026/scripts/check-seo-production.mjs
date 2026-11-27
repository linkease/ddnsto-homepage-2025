import { readFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { publishedPaths } from '../src/config/publishing.mjs';
// Isolated simulation only. Never deploys or changes the preview build.
mkdirSync('artifacts/seo', { recursive: true });
const out = mkdtempSync(join('artifacts/seo', 'production-'));
const origin = new URL(
  process.env.SEO_TEST_ORIGIN || 'https://seo-validation.example.com',
).origin;
try {
  const result = spawnSync(
    process.execPath,
    ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', out],
    {
      env: { ...process.env, SITE_ENV: 'production', SITE_URL: origin },
      encoding: 'utf8',
    },
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const sitemap = readFileSync(join(out, 'sitemap-0.xml'), 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, publishedPaths.length);
  for (const path of publishedPaths) {
    const html = readFileSync(join(out, path, 'index.html'), 'utf8');
    assert.ok(html.includes(`href="${origin}${path}"`), path);
    assert.match(html, /content="index,follow"/);
    const data = JSON.parse(
      html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
    );
    assert.equal(data['@graph'][0].url, origin + path);
    assert.ok(sitemap.includes(origin + path), path);
    assert.ok(html.includes(`${origin}/images/brand/share.png`), path);
  }
  const notFound = readFileSync(join(out, '404.html'), 'utf8');
  assert.match(notFound, /noindex,nofollow/);
  assert.doesNotMatch(notFound, /rel="canonical"/);
  assert.ok(!sitemap.includes('/404'));
  assert.ok(
    readFileSync(join(out, 'robots.txt'), 'utf8').includes(
      `${origin}/sitemap-index.xml`,
    ),
  );
  for (const bad of [
    '',
    'http://example.com',
    'https://example.com/path/',
    'https://user:pass@example.com/',
  ]) {
    const rejected = spawnSync(
      process.execPath,
      ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', out],
      {
        env: { ...process.env, SITE_ENV: 'production', SITE_URL: bad },
        encoding: 'utf8',
      },
    );
    assert.notEqual(
      rejected.status,
      0,
      `Unsafe production origin accepted: ${bad}`,
    );
  }
  console.log(
    `PASS: ${publishedPaths.length} production routes, canonical, JSON-LD, sitemap, social image, robots, 404 exclusion and invalid-origin rejection (${origin})`,
  );
} finally {
  rmSync(out, { recursive: true, force: true });
}
