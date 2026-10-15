import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Allow the initial red run to report missing behavior as assertions.
process.env.NODE_ENV = 'development';
const installer = await import('../src/install/installer.js').catch(error => {
    if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
    throw error;
});
const readyRelease = {
    version: '0.1.10', ready: true,
    base: 'https://web.toany.net/ddnsto-install/0.1.10/test-fixture',
};

test('platform query accepts known targets and safely defaults unknown targets', () => {
    assert.equal(typeof installer.platformFromSearch, 'function');
    for (const id of ['linux', 'openwrt', 'macos', 'windows', 'synology', 'docker', 'others']) {
        assert.equal(installer.platformFromSearch(`?platform=${id}`), id);
        assert.equal(installer.installHref(id), `/install?platform=${id}`);
    }
    for (const search of ['', '?platform=javascript:alert(1)', '?platform=__proto__', '?platform=Linux']) {
        assert.equal(installer.platformFromSearch(search), 'linux');
    }
});

test('unconfirmed release and PENDING URLs never yield executable commands', () => {
    assert.equal(typeof installer.buildInstallCommand, 'function');
    for (const platform of ['linux', 'openwrt', 'macos', 'windows']) {
        assert.equal(installer.buildInstallCommand(platform, { ...readyRelease, ready: false }), null);
        assert.equal(installer.buildInstallCommand(platform, { ...readyRelease, base: readyRelease.base.replace('test-fixture', 'PENDING') }), null);
    }
});

test('default commands point only to the confirmed 0.1.10 build', () => {
    assert.equal(typeof installer.buildInstallCommand, 'function');
    for (const platform of ['linux', 'openwrt', 'macos', 'windows']) {
        assert.ok(installer.buildInstallCommand(platform).includes('https://web.toany.net/ddnsto-install/0.1.10/20261015-6c624972f4c9/install.'));
    }
});

test('NAS, Docker and vendor routers offer tutorials, never generic Linux commands', () => {
    assert.equal(typeof installer.buildInstallCommand, 'function');
    for (const id of ['synology', 'qnap', 'docker', 'unraid', 'asusgo', 'istoreos', 'others', '__proto__']) {
        assert.equal(installer.buildInstallCommand(id, readyRelease), null);
    }
});

test('release URLs reject HTTP, credentials, wrong versions and command injection', () => {
    assert.equal(typeof installer.buildInstallCommand, 'function');
    for (const base of [
        'http://web.toany.net/ddnsto-install/0.1.10/final',
        'https://web.toany.net/ddnsto-install/0.1.8/final',
        'https://user:password@web.toany.net/ddnsto-install/0.1.10/final',
        `${readyRelease.base}'$(touch injected)`, `${readyRelease.base}?query=1`,
    ]) assert.equal(installer.buildInstallCommand('linux', { ...readyRelease, base }), null);
});

test('POSIX download retains stdin and refuses failed, empty or HTML responses', async () => {
    assert.equal(typeof installer.buildInstallCommand, 'function');
    const command = installer.buildInstallCommand('linux', readyRelease);
    assert.match(command, /--proto "=https"/);
    assert.match(command, /--proto-redir "=https"/);
    assert.match(command, /--retry 2/);
    assert.match(command, /--connect-timeout 10/);
    assert.match(command, /--max-time 60/);
    assert.doesNotMatch(command, /curl[^\n]*\|\s*(?:ba)?sh/);
    const directory = await mkdtemp(join(tmpdir(), 'ddnsto-command-test-'));
    try {
        await writeFile(join(directory, 'curl'), '#!/bin/sh\nprintf "%s" "$TEST_ENTRY"\nexit "${TEST_CURL_EXIT:-0}"\n', { mode: 0o700 });
        const run = (entry, code = '0') => spawnSync('sh', ['-c', command], {
            encoding: 'utf8', input: 'terminal-input\n',
            env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, TEST_ENTRY: entry, TEST_CURL_EXIT: code },
        });
        const valid = run('#!/bin/sh\nread -r value\nprintf "EXECUTED:%s" "$value"\n');
        assert.equal(valid.status, 0, valid.stderr);
        assert.equal(valid.stdout, 'EXECUTED:terminal-input');
        for (const [entry, code] of [['', '0'], ['<html>error</html>\necho EXECUTED', '0'], ['echo EXECUTED', '0'], ['#!/bin/sh\necho EXECUTED', '22']]) {
            const result = run(entry, code);
            assert.notEqual(result.status, 0);
            assert.doesNotMatch(result.stdout, /EXECUTED/);
        }
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});

test('Windows uses HTTPS with no redirects and a bounded timeout', () => {
    assert.equal(typeof installer.buildInstallCommand, 'function');
    const command = installer.buildInstallCommand('windows', readyRelease);
    assert.match(command, /Invoke-WebRequest/);
    assert.match(command, /-MaximumRedirection 0/);
    assert.match(command, /-TimeoutSec 60/);
    assert.match(command, /Tls12/);
    assert.match(command, /install\.ps1/);
    assert.doesNotMatch(command, /-ExecutionPolicy Bypass|http:\/\//);
});

test('copy reports only copied or manual fallback, and never copies an absent command', async () => {
    assert.equal(typeof installer.copyInstallCommand, 'function');
    let copied;
    assert.equal(await installer.copyInstallCommand('test command', { writeText: async value => { copied = value; } }), 'copied');
    assert.equal(copied, 'test command');
    assert.equal(await installer.copyInstallCommand('test command', { writeText: async () => { throw new Error('denied'); } }), 'manual');
    assert.equal(await installer.copyInstallCommand('test command', undefined), 'manual');
    assert.equal(await installer.copyInstallCommand(null, { writeText: async () => { assert.fail('must not copy'); } }), 'idle');
});

test('console destination is HTTPS even when the homepage runs on localhost', () => {
    assert.equal(installer.consoleUrl, 'https://web.ddnsto.com/app/#/devices');
});
