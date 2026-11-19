import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    const info = lstatSync(path);
    assert.ok(
      !info.isSymbolicLink(),
      `项目资源不能使用软链接: ${relative(root, path)}`,
    );
    return info.isDirectory() ? files(path) : [path];
  });
}
test('参考副本完整且与已固定清单一致', () => {
  const manifest = JSON.parse(
    readFileSync(resolve(root, 'reference/manifest.json'), 'utf8'),
  );
  const reference = resolve(root, 'reference/design');
  const actual = files(reference)
    .map((path) => relative(reference, path).split(sep).join('/'))
    .sort();
  assert.deepEqual(actual, manifest.files.map((file) => file.path).sort());
  for (const file of manifest.files) {
    assert.equal(
      createHash('sha256')
        .update(readFileSync(resolve(reference, file.path)))
        .digest('hex'),
      file.sha256,
      file.path,
    );
  }
});
test('源码导入不越过独立项目边界，依赖不使用父目录包', () => {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  for (const [name, value] of Object.entries({
    ...pkg.dependencies,
    ...pkg.devDependencies,
  })) {
    assert.doesNotMatch(value, /^(file:|link:|workspace:)|^\.\./, name);
  }
  for (const path of files(resolve(root, 'src'))) {
    if (!/\.(astro|[cm]?[jt]sx?|css)$/.test(path)) continue;
    const source = readFileSync(path, 'utf8');
    assert.doesNotMatch(
      source,
      /192\.168\.9\.3|\/projects\/workspace-codex|ddnsto-homepage-2025/,
      path,
    );
    for (const match of source.matchAll(
      /(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g,
    )) {
      if (!match[1].startsWith('.')) continue;
      assert.ok(
        resolve(path, '..', match[1]).startsWith(resolve(root) + sep),
        `${path}: ${match[1]}`,
      );
    }
  }
  files(resolve(root, 'public'));
});
test('构建产物不加载参考服务、父项目或参考打包模块', () => {
  for (const path of files(resolve(root, 'dist'))) {
    if (!/\.(html|css|js|json|xml|txt)$/.test(path)) continue;
    assert.doesNotMatch(
      readFileSync(path, 'utf8'),
      /192\.168\.9\.3|localhost:6002|127\.0\.0\.1:(?:6002|16002|16207)|ddnsto-homepage-2025|original-modules|\/reference\/design\//,
      relative(root, path),
    );
  }
});
test('默认预览禁止索引且不输出占位规范域名', () => {
  assert.match(
    readFileSync(resolve(root, 'dist/robots.txt'), 'utf8'),
    /Disallow: \/\s*$/,
  );
  for (const path of files(resolve(root, 'dist')).filter((path) =>
    path.endsWith('.html'),
  )) {
    const html = readFileSync(path, 'utf8');
    assert.match(html, /name="robots"\s+content="noindex,nofollow"/, path);
    assert.doesNotMatch(html, /rel="canonical"|preview\.invalid/, path);
  }
});
