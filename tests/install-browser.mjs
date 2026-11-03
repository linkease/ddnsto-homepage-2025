// Start the local homepage first. No credentials or client execution.
import { execFileSync } from 'node:child_process';
const base = process.env.DDNSTO_PREVIEW_URL || 'http://127.0.0.1:4189';
const session = 'ddnsto-home-' + process.pid;
const browser = (...args) => execFileSync('agent-browser', ['--session', session, ...args], { encoding: 'utf8', timeout: 60000 });
try {
    browser('open', base + '/');
    browser('wait', 'nav');
    for (const width of [375, 768, 1280]) {
        browser('set', 'viewport', String(width), '844');
        browser('eval', `(() => {
            if (document.querySelector('a[href^="/install"]')) throw new Error('Installer link remains');
            if (!document.querySelector('.guide-markdown')) throw new Error('Platform guide missing');
            if (!document.querySelector('a[href="/app/#/devices"]')) throw new Error('Console link missing');
            return 'PASS';
        })()`);
        console.log('PASS homepage without install entry at ' + width);
    }
    for (const path of ['/install', '/install/debug']) {
        const response = await fetch(base + path);
        if (response.status !== 404) throw new Error(path + ' must return 404');
        console.log('PASS removed route 404: ' + path);
    }
} finally { browser('close'); }
