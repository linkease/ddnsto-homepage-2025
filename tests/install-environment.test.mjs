import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const inspect = mode => {
    const result = spawnSync(process.execPath, [new URL('./environment-render.mjs', import.meta.url).pathname], {
        env: { ...process.env, NODE_ENV: mode }, encoding: 'utf8', timeout: 30000,
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
};

test('production retains original homepage guides and relative console links', () => {
    const { hero, navbar } = inspect('production');
    assert.ok(!hero.includes('href="/install'), 'production Hero must not link to test installation');
    assert.ok(!navbar.includes('href="/install'), 'production Navbar must not link to test installation');
    assert.ok(hero.includes('guide-markdown'), 'restore the original inline platform guide');
    assert.ok(hero.includes('href="/app/#/devices"'));
    assert.ok(navbar.includes('href="/app/#/devices"'));
    assert.ok(navbar.includes('href="#features"'));
    assert.ok(navbar.includes('hidden md:flex items-center gap-8'));
});

test('development also retains original tutorials with no installer entry', () => {
    const result = inspect('development');
    assert.doesNotMatch(result.hero + result.navbar, /href="\/install|安装客户端|installer-debug/);
    assert.ok(result.hero.includes('guide-markdown'));
    assert.ok(result.navbar.includes('href="/app/#/devices"'));
});
