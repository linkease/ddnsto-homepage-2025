import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import * as installer from '../src/install/installer.js';

process.env.NODE_ENV = 'development';
const base = 'https://preview.example/ddnsto-install/0.2.0/20261021-test';
const build = options => installer.buildDebugCommand?.({ base, platform: 'linux', ...options });

test('candidate maps validated targets, methods and actions to literal arguments', async () => {
    assert.equal(typeof installer.buildDebugCommand, 'function');
    const directory = await mkdtemp(join(tmpdir(), 'ddnsto-debug-'));
    try {
        await writeFile(join(directory, 'curl'), '#!/bin/sh\nprintf "%s" "$TEST_ENTRY"\nexit "${TEST_EXIT:-0}"\n', { mode: 0o700 });
        for (const platform of ['auto', 'linux', 'openwrt', 'macos']) {
            for (const method of ['auto', 'native']) {
                for (const action of ['install', 'update', 'status', 'start', 'stop', 'restart']) {
                    const command = build({ platform, method, action });
                    assert.equal(typeof command, 'string');
                    const result = spawnSync('sh', ['-c', command], { encoding: 'utf8', env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, TEST_ENTRY: '#!/bin/sh\nprintf "%s\\n" "$@"' } });
                    assert.equal(result.status, 0, result.stderr);
                    assert.equal(result.stdout, `--platform\n${platform}\n--method\n${method}\n--action\n${action}\n`);
                    assert.doesNotMatch(command, /token/i);
                }
            }
        }
        for (const [entry, exit] of [['echo EXECUTED', '0'], ['<html>EXECUTED', '0'], ['#!/bin/sh\necho EXECUTED', '22'], ['', '0']]) {
            const result = spawnSync('sh', ['-c', build({})], { encoding: 'utf8', env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, TEST_ENTRY: entry, TEST_EXIT: exit } });
            assert.notEqual(result.status, 0);
            assert.doesNotMatch(result.stdout, /EXECUTED/);
        }
    } finally { await rm(directory, { recursive: true, force: true }); }
});

test('candidate rejects unsupported executors, actions and unsafe/unpinned URLs', () => {
    assert.equal(typeof installer.buildDebugCommand, 'function');
    for (const platform of ['synology', 'qnap', 'unraid', 'docker', '__proto__', 'linux;echo BAD']) assert.equal(build({ platform }), null);
    assert.equal(build({ action: 'install;echo BAD' }), null);
    assert.equal(build({ method: 'docker' }), null);
    for (const url of ['', 'http://preview.example/ddnsto-install/0.1.11/build', `${base}?token=secret`, `${base}/install.sh`, `${base}'`, base.replace('preview.example', 'user:pass@preview.example'), 'https://preview.example/latest']) assert.equal(build({ base: url }), null);
});

test('Windows uses pinned PowerShell entry, strict header and named arguments', () => {
    const command = build({ platform: 'windows', action: 'restart', method: 'native' });
    assert.equal(typeof command, 'string');
    assert.match(command, /install\.ps1/);
    assert.match(command, /-Platform windows -Method native -Action restart/);
    assert.match(command, /# Engineering candidate/);
    assert.doesNotMatch(command, /[\r\n]/, 'a one-line command must not depend on textarea newline normalization');
    assert.match(command, /-MaximumRedirection 0/);
    assert.match(command, /\$ErrorActionPreference='Stop'/);
    assert.doesNotMatch(command, /token/i);
    for (const action of ['install', 'update', 'status', 'start', 'stop', 'restart']) {
        assert.ok(build({ platform: 'windows', action }).endsWith(`-Platform windows -Method auto -Action ${action}`));
    }
});

test('published older build cannot be used as a candidate with new action arguments', () => {
    assert.equal(build({ base: 'https://web.toany.net/ddnsto-install/0.1.10/20261015-6c624972f4c9' }), null);
});

test('confirmed native lifecycle is available only for explicit candidate device and native method', () => {
    for (const platform of ['linux', 'openwrt', 'macos', 'windows']) {
        for (const action of ['repair', 'configure', 'uninstall']) {
            const command = build({ platform, method: 'native', action });
            assert.equal(typeof command, 'string');
            assert.ok(command.includes(platform === 'windows' ? `-Action ${action}` : `--action ${action}`));
            assert.doesNotMatch(command, /token/i);
            assert.equal(build({ platform, method: 'auto', action }), null);
        }
    }
    assert.equal(build({ platform: 'auto', method: 'native', action: 'uninstall' }), null);
});

test('candidate cannot bypass production gating', () => {
    process.env.NODE_ENV = 'production';
    try { assert.equal(build({}), null); } finally { process.env.NODE_ENV = 'development'; }
});

test('Synology verified download and experimental Docker forward only supported literal arguments', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ddnsto-handoff-'));
    try {
        await writeFile(join(directory, 'curl'), '#!/bin/sh\nprintf \'#!/bin/sh\\nprintf "%%s\\\\n" "$@"\\n\'\n', { mode: 0o700 });
        const cases = [[{ platform: 'synology', action: 'download' }, ['--platform', 'synology', '--action', 'download']]];
        for (const network of ['bridge', 'host']) {
            cases.push([{ method: 'docker', architecture: 'amd64', installMode: 'first', deviceName: 'My_NAS-01', network }, ['--platform', 'linux', '--method', 'docker', '--action', 'install', '--device-name', 'My_NAS-01', '--network', network]]);
        }
        for (const action of ['install', 'update', 'status', 'start', 'stop', 'restart', 'uninstall']) {
            cases.push([{ method: 'docker', architecture: 'amd64', installMode: 'existing', action }, ['--platform', 'linux', '--method', 'docker', '--action', action]]);
        }
        for (const [options, args] of cases) {
            const command = build(options);
            assert.equal(typeof command, 'string');
            const result = spawnSync('sh', ['-c', command], { encoding: 'utf8', env: { ...process.env, PATH: `${directory}:${process.env.PATH}` } });
            assert.equal(result.status, 0, result.stderr);
            assert.equal(result.stdout, args.join('\n') + '\n');
            assert.doesNotMatch(command, /token|output-dir/i);
        }
    } finally { await rm(directory, { recursive: true, force: true }); }
});

test('new candidate routes reject unsafe names, unsupported hardware/method/action and old contracts', () => {
    const docker = { method: 'docker', architecture: 'amd64', installMode: 'first', deviceName: 'device_1', network: 'bridge' };
    for (const deviceName of ['', '-option', 'with space', 'a.b', 'x;id', "x'", '$(id)', 'x\ny', 'x'.repeat(129)]) assert.equal(build({ ...docker, deviceName }), null);
    for (const platform of ['auto', 'openwrt', 'macos', 'windows', 'synology', 'qnap', 'unraid']) assert.equal(build({ ...docker, platform }), null);
    for (const architecture of ['', 'arm64', 'aarch64', '386', undefined]) assert.equal(build({ ...docker, architecture }), null);
    for (const action of ['repair', 'configure', 'download']) assert.equal(build({ ...docker, action }), null);
    for (const network of ['', 'none', 'bridge;id', undefined]) assert.equal(build({ ...docker, network }), null);
    for (const action of ['update', 'status', 'start', 'stop', 'restart', 'uninstall']) assert.equal(build({ ...docker, action }), null, 'existing actions must reject first-install fields');
    assert.equal(build({ ...docker, installMode: 'existing' }), null);
    assert.equal(build({ ...docker, installMode: undefined }), null);
    for (const action of ['install', 'update', 'uninstall', 'status', 'repair', 'configure']) assert.equal(build({ platform: 'synology', action }), null);
    assert.equal(build({ platform: 'synology', action: 'download', method: 'native' }), null);
    assert.equal(build({ action: 'download' }), null);
    for (const options of [docker, { platform: 'synology', action: 'download' }]) {
        assert.equal(build({ ...options, base: base.replace('0.2.0', '0.1.11') }), null);
        process.env.NODE_ENV = 'production';
        try { assert.equal(build(options), null); } finally { process.env.NODE_ENV = 'development'; }
    }
});
