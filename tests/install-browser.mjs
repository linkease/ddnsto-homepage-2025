// Start the local development homepage first. No credentials or installation.
import { execFileSync } from 'node:child_process';
const base = process.env.DDNSTO_PREVIEW_URL || 'http://127.0.0.1:4189';
const session = 'ddnsto-handoff-' + process.pid;
const browser = (...args) => execFileSync('agent-browser', ['--session', session, ...args], { encoding: 'utf8', timeout: 60000 });
try {
    browser('open', base + '/install');
    browser('wait', 'main a');
    for (const width of [375, 768, 1280]) {
        browser('set', 'viewport', String(width), '844');
        browser('eval', `(() => {
            const link = document.querySelector('main a');
            if (link.href !== 'https://web.toany.net:9445/app/#/workbench?action=install-device') throw new Error('Wrong console handoff');
            if (document.querySelector('main textarea, main input')) throw new Error('Old installer still exposed');
            if (document.documentElement.scrollWidth > innerWidth) throw new Error('Horizontal overflow');
            return 'PASS';
        })()`);
        console.log('PASS handoff viewport ' + width);
    }
    browser('open', base + '/install/debug');
    browser('wait', '#installer-action');
    for (const platform of ['linux', 'openwrt', 'macos', 'windows']) {
        browser('select', '#tools-platform', platform);
        for (const action of ['status', 'start', 'stop', 'restart', 'repair', 'configure', 'uninstall']) {
            browser('select', '#installer-action', action);
            browser('eval', `(() => {
                const value = document.querySelector('#install-command').value;
                if (!value.includes('${platform === 'windows' ? '-Action' : '--action'} ${action}')) throw new Error('Missing action');
                if (/--token|-Token /.test(value)) throw new Error('Unexpected Token parameter');
                return 'PASS';
            })()`);
        }
    }
    browser('select', '#tools-platform', 'synology');
    browser('eval', `(() => { if (!document.querySelector('#install-command').value.includes('--action download')) throw new Error('Missing Synology handoff'); return 'PASS'; })()`);
    browser('select', '#tools-platform', 'docker');
    browser('select', '#installer-architecture', 'amd64');
    browser('select', '#installer-action', 'stop');
    browser('wait', '#install-command');
    browser('fill', '#installer-base', 'http://unsafe.example/test');
    browser('eval', `(() => { if (document.querySelector('#install-command')) throw new Error('Unsafe URL generated command'); return 'PASS'; })()`);
    console.log('PASS debug tools: platform lifecycle, Synology, Docker and unsafe URL rejection');
} finally { browser('close'); }
