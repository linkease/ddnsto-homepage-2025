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
    check('candidate actions require a pinned URL and clear pending clipboard state', `
        const change = async (selector, value) => {
            const element = document.querySelector(selector);
            const prototype = element.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
            Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
            element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
            await settle();
        };
        await change('#installer-source', 'candidate');
        assert(!document.querySelector('#install-command'), 'Candidate must not default to a fictional publication');
        await change('#installer-base', 'https://preview.example/ddnsto-install/0.1.11/20261021-test');
        assert(document.querySelector('#install-command').value.includes('-Platform windows'), 'Windows constraint missing');
        navigator.clipboard.writeText = () => new Promise(resolve => { window.resolveCopy = resolve; });
        document.querySelector('[data-install-step="2"] button').click();
        await change('#installer-action', 'restart');
        window.resolveCopy(); await settle();
        assert(document.querySelector('[role="status"]').textContent === '', 'Old clipboard completion leaked into new action');
        assert(document.querySelector('#install-command').value.includes('-Action restart'), 'Action not forwarded');
        assert(![...document.querySelector('#installer-method').options].some(o => o.value === 'docker'), 'Unverified Docker exposed');
        assert(![...document.querySelector('#installer-action').options].some(o => o.value === 'uninstall'), 'Lifecycle requires explicit native method');
        await change('#installer-method', 'native');
        await change('#installer-action', 'uninstall');
        assert(document.querySelector('#install-command').value.includes('-Method native -Action uninstall'), 'Native lifecycle missing');
        assert(document.querySelector('[role="note"]').textContent.includes('0.2.0'), 'Candidate requirements missing');
        await change('#installer-method', 'auto');
        assert(document.querySelector('#installer-action').value === 'install', 'Invalid action survived method switch');
        await change('#installer-base', 'http://preview.example/latest');
        assert(!document.querySelector('#install-command'), 'Invalid candidate URL accepted');
        await change('#installer-source', 'published');
        assert(document.querySelector('#install-command').value.includes('20261015-6c624972f4c9'), 'Published default changed');
        assert(!document.querySelector('#install-command').value.includes('-Action'), 'Candidate parameters leaked into published script');
    `);
    browser('set', 'viewport', '320', '844');
    check('candidate Synology download and Linux Docker remain separate from published capabilities', `
        const change = async (selector, value) => {
            const element = document.querySelector(selector);
            assert(element, 'Missing control: ' + selector);
            const prototype = element.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
            Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
            element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
            await settle();
        };
        document.querySelector('[data-platform="synology"]').click(); await settle();
        assert(!document.querySelector('#install-command') && !document.querySelector('#installer-action'), 'Published Synology exposes candidate capabilities');
        await change('#installer-source', 'candidate');
        await change('#installer-base', 'https://preview.example/ddnsto-install/0.2.0/test-build');
        assert(document.querySelector('#install-command').value.endsWith("--platform synology --action download'"), 'Synology download mapping missing');
        assert(document.querySelector('#installer-action').options.length === 1, 'Synology must only offer download');
        assert(!document.querySelector('#installer-method'), 'Synology must not offer native/Docker methods');
        assert(/DSM.*手动|manually.*DSM/.test(document.querySelector('[data-candidate-handoff]').textContent), 'Manual DSM handoff missing');
        assert(document.documentElement.scrollWidth <= innerWidth, 'Synology candidate overflows narrow viewport');
        await change('#installer-source', 'published');
        assert(!document.querySelector('#install-command'), 'Download leaked into published');
        document.querySelector('[data-platform="docker"]').click(); await settle();
        assert(!document.querySelector('#installer-device-name'), 'Published Docker exposes candidate fields');
        await change('#installer-source', 'candidate');
        await change('#installer-base', 'https://preview.example/ddnsto-install/0.2.0/test-build');
        assert(!document.querySelector('#install-command'), 'Docker must require explicit hardware/name/network');
        await change('#installer-architecture', 'amd64');
        await change('#installer-device-name', 'my_device-1');
        await change('#installer-network', 'bridge');
        assert(document.querySelector('#install-command').value.includes('--platform linux --method docker --action install --device-name my_device-1 --network bridge'), 'Docker mapping incorrect');
        assert(document.documentElement.scrollWidth <= innerWidth, 'Docker candidate overflows narrow viewport');
        assert(![...document.querySelector('#installer-action').options].some(o => ['repair', 'configure'].includes(o.value)), 'Unsupported Docker lifecycle exposed');
        assert(/自动迁移|automatic migration/.test(document.querySelector('[data-docker-requirements]').textContent), 'Migration limitation missing');
        await change('#installer-network', 'host');
        assert(document.querySelector('#install-command').value.includes('--network host'), 'Host networking missing');
        await change('#installer-device-name', 'bad;name');
        assert(!document.querySelector('#install-command'), 'Unsafe Docker name accepted');
        await change('#installer-install-mode', 'existing');
        assert(document.querySelector('#install-command').value.includes('--action install'), 'Repeated install missing');
        assert(!/--device-name|--network|--token/.test(document.querySelector('#install-command').value), 'Repeated install sends fresh-install parameters');
        assert(!document.querySelector('#installer-device-name'), 'Repeated install still asks for device name');
        for (const action of ['update', 'status', 'start', 'stop', 'restart', 'uninstall']) {
            await change('#installer-action', action);
            assert(document.querySelector('#install-command').value.includes('--action ' + action), 'Docker action missing: ' + action);
            assert(!/--device-name|--network|--token/.test(document.querySelector('#install-command').value), 'Existing action sends fresh-install parameters');
        }
        assert(/4.2.6/.test(document.querySelector('[data-docker-requirements]').textContent), 'Pinned no-op update requirements missing');
        document.querySelector('[data-platform="linux"]').click(); await settle();
        await change('#installer-source', 'candidate');
        await change('#installer-method', 'docker');
        assert(document.querySelector('#installer-target').value === 'linux' && document.querySelector('#installer-target').options.length === 1, 'Docker cannot use auto/NAS detection');
        await change('#installer-method', 'native');
        assert(!document.querySelector('#installer-device-name'), 'Docker fields leaked into native');
    `);
    check('NAS, Docker and vendor routers expose real tutorials without commands', `
        for (const id of ['synology', 'qnap', 'docker', 'unraid', 'asusgo', 'istoreos', 'others']) {
            document.querySelector('[data-platform="' + id + '"]').click(); await settle();
            assert(!document.querySelector('#install-command'), id + ' exposes a script');
            assert(/no verified one-click executor|暂无已验证的一键安装执行器/.test(document.querySelector('[data-install-step="2"]').textContent), id + ' does not disclose unavailable executor');
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
