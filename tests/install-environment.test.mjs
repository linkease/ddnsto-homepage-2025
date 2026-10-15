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

test('production rejects the direct install route and cannot generate a test command', () => {
    const result = inspect('production');
    assert.equal(result.routeStatus, 404);
    assert.equal(result.command, null);
    assert.equal(result.overrideCommand, null);
    assert.equal(result.release.ready, false);
    assert.equal(result.release.base, '');
});

test('development keeps the install route, platform links and confirmed test command', () => {
    const result = inspect('development');
    assert.equal(result.routeStatus, 200);
    assert.ok(result.hero.includes('href="/install?platform=macos"'));
    assert.ok(result.navbar.includes('href="/install?platform=linux"'));
    assert.ok(result.command.includes('/0.1.10/20261015-6c624972f4c9/install.sh'));
});
