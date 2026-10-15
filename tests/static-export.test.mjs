import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import nextConfig from '../next.config.js';

test('production retains the original static export URL layout', () => {
    assert.equal(nextConfig.output, 'export');
    assert.notEqual(nextConfig.trailingSlash, true, 'debug-only install must not alter production URL layout');
});

test('debug page files are discovered only by the development server', () => {
    assert.ok(!nextConfig.pageExtensions?.includes('debug.jsx'));
    const result = spawnSync(process.execPath, ['--input-type=module', '-e',
        `import config from ${JSON.stringify(new URL('../next.config.js', import.meta.url).href)}; console.log(JSON.stringify(config));`], {
        env: { ...process.env, NODE_ENV: 'development' }, encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(JSON.parse(result.stdout).pageExtensions?.includes('debug.jsx'));
});
