// Uses the existing agent-browser installation. Start the local preview first.
import { execFileSync } from 'node:child_process';

const base = process.env.DDNSTO_PREVIEW_URL || 'http://127.0.0.1:4189';
const session = `ddnsto-install-test-${process.pid}`;
const browser = (...args) => execFileSync('agent-browser', ['--session', session, ...args], { encoding: 'utf8', timeout: 60000 });
const check = (name, code) => {
    browser('eval', `(async () => {
        const assert = (condition, message) => { if (!condition) throw new Error(message); };
        const settle = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await settle();
        ${code}
        return 'PASS';
    })()`);
    console.log(`PASS ${name}`);
};

try {
    browser('open', `${base}/install?platform=windows`);
    browser('wait', '[data-platform="windows"][aria-pressed="true"]');
    check('query preselection and safe console links', `
        assert(document.querySelector('#install-command').value.includes('Invoke-WebRequest'), 'Windows command missing');
        assert(!document.querySelector('main input'), 'Unexpected Token input');
        assert([...document.querySelectorAll('a[href*="/app/"]')].every(a => a.href === 'https://web.ddnsto.com/app/#/devices'), 'Unsafe console destination');
    `);
    check('clipboard denial selects the full command for manual copying', `
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } });
        document.querySelector('[data-install-step="2"] button').click();
        await settle();
        const command = document.querySelector('#install-command');
        assert(/Clipboard unavailable|未能访问剪贴板/.test(document.querySelector('[role="status"]').textContent), 'Fallback not displayed');
        assert(command.selectionStart === 0 && command.selectionEnd === command.value.length, 'Full command not selected');
    `);
    check('switching platforms clears fallback and stale async copy results', `
        document.querySelector('[data-platform="macos"]').click(); await settle();
        assert(document.querySelector('[role="status"]').textContent === '', 'Fallback survived platform switch');
        navigator.clipboard.writeText = () => new Promise(resolve => { window.resolveCopy = resolve; });
        document.querySelector('[data-install-step="2"] button').click();
        document.querySelector('[data-platform="linux"]').click(); await settle();
        window.resolveCopy(); await settle();
        assert(document.querySelector('[role="status"]').textContent === '', 'Stale copy state leaked');
    `);
    check('successful copy does not claim installation or online success', `
        navigator.clipboard.writeText = async text => { window.copiedCommand = text; };
        document.querySelector('[data-install-step="2"] button').click(); await settle();
        assert(window.copiedCommand === document.querySelector('#install-command').value, 'Wrong command copied');
        assert(/Copied\. Run it in the terminal on your target device\.|复制成功。请在目标设备终端执行。/.test(document.querySelector('[role="status"]').textContent), 'Incorrect success message');
        assert(!document.querySelector('[role="progressbar"]'), 'False installation progress');
        document.querySelector('[data-platform="windows"]').click(); await settle();
        assert(document.querySelector('[role="status"]').textContent === '', 'Copied state survived platform switch');
    `);
    check('NAS, Docker and vendor routers expose real tutorials without commands', `
        for (const id of ['synology', 'qnap', 'docker', 'unraid', 'asusgo', 'istoreos', 'others']) {
            document.querySelector('[data-platform="' + id + '"]').click(); await settle();
            assert(!document.querySelector('#install-command'), id + ' exposes a script');
            assert(document.querySelector('[data-install-step="2"] a').href.startsWith('https://doc.linkease.com/zh/guide/ddnsto/'), id + ' tutorial missing');
        }
    `);
    browser('open', `${base}/install?platform=__proto__`);
    browser('wait', '[data-platform="linux"][aria-pressed="true"]');
    check('invalid platform defaults to Linux without an exception', `assert(document.querySelector('#install-command').value.includes('/install.sh'), 'Invalid platform failed');`);
    for (const width of [320, 375, 768, 1280]) {
        browser('set', 'viewport', String(width), '844');
        check(`both languages fit viewport ${width}px`, `
            for (let language = 0; language < 2; language++) {
                for (const id of ['linux', 'windows', 'macos', 'docker']) {
                    document.querySelector('[data-platform="' + id + '"]').click(); await settle();
                    assert(document.documentElement.scrollWidth <= innerWidth, 'Horizontal overflow: ' + document.documentElement.lang + '/' + id + '/' + innerWidth);
                    const active = document.querySelector('[data-platform="' + id + '"]').getBoundingClientRect();
                    assert(active.width >= 44 && active.height >= 44, 'Target too small');
                    const command = document.querySelector('#install-command');
                    if (command) assert(command.getBoundingClientRect().right <= innerWidth, 'Command exceeds viewport');
                }
                const languageButton = [...document.querySelectorAll('nav button')].find(button => ['EN', '中文'].includes(button.textContent.trim()));
                assert(languageButton, 'Language control missing'); languageButton.click(); await settle();
                assert(!/install[.][a-zA-Z]/.test(document.querySelector('main').innerText), 'Untranslated key');
            }
        `);
    }
    check('no automatic device status requests', `
        const requests = performance.getEntriesByType('resource').filter(entry => ['fetch', 'xmlhttprequest'].includes(entry.initiatorType));
        assert(!requests.some(entry => entry.name.includes('devices') || entry.name.includes('healthz') || entry.name.includes('/app/')), 'Unexpected device request');
    `);
} finally {
    browser('close');
}
