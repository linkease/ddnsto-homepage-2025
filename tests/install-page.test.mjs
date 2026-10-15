import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

register('./jsx-loader.mjs', import.meta.url);
process.env.NODE_ENV = 'development';
const page = await import('../src/install/InstallPage.jsx').catch(error => {
    if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
    throw error;
});
const { LanguageProvider } = await import('../src/contexts/LanguageContext.jsx');
const { default: Hero } = await import('../src/components/Hero.jsx');
const { translations } = await import('../src/i18n/translations.js');

test('install page renders three real steps, a readonly command and no Token field', () => {
    assert.equal(typeof page.default, 'function');
    const html = renderToStaticMarkup(React.createElement(page.default));
    assert.match(html, /data-install-step="1"/);
    assert.match(html, /data-install-step="2"/);
    assert.match(html, /data-install-step="3"/);
    assert.match(html, /<textarea[^>]*readOnly=""/);
    assert.doesNotMatch(html, /<input|PENDING|progressbar/);
    assert.match(html, /20261015-6c624972f4c9/);
    assert.match(html, /https:\/\/web\.ddnsto\.com\/app\/#\/devices/);
    assert.doesNotMatch(html, /href="\/app\//);
});

test('homepage installation CTA and platform cards deep link to preselection', () => {
    const html = renderToStaticMarkup(React.createElement(LanguageProvider, null, React.createElement(Hero)));
    for (const id of ['linux', 'windows', 'macos', 'openwrt', 'synology', 'docker', 'qnap', 'istoreos', 'asusgo', 'unraid', 'others']) {
        assert.ok(html.includes(`href="/install?platform=${id}"`), `missing ${id} deep link`);
    }
});

test('homepage does not offer legacy HTTP installers or obsolete macOS availability', () => {
    const html = renderToStaticMarkup(React.createElement(LanguageProvider, null, React.createElement(Hero)));
    assert.ok(!/https?:\/\/[^\s<"]*(?:install_ddnsto|install\.sh)/i.test(html), 'homepage must link to the unified install flow, not offer old installers');
    assert.ok(!/开发中|under development|coming soon/i.test(html), 'obsolete macOS availability must not be shown');
    assert.ok(!/curl|wget/.test(html), 'installation commands belong on the install page');
});

test('installation translations have matching, nonempty English and Chinese keys', () => {
    assert.ok(translations.en.install, 'installation translations must exist');
    const visit = (en, zh) => {
        assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort());
        for (const key of Object.keys(en)) {
            if (typeof en[key] === 'object') visit(en[key], zh[key]);
            else {
                assert.ok(en[key].trim());
                assert.ok(zh[key].trim());
            }
        }
    };
    visit(translations.en.install, translations.zh.install);
});

test('client versions and supported architectures are explicit in both languages', () => {
    for (const language of ['en', 'zh']) {
        const specs = translations[language].install.specs;
        assert.ok(specs, 'client specs must exist');
        for (const value of ['4.2.3', 'x86_64', 'aarch64']) assert.ok(specs.linux.includes(value));
        for (const value of ['4.2.6', '4.2.2', 'x86_64', 'aarch64', 'armv7', 'mipsel', 'opkg', 'apk']) assert.ok(specs.openwrt.includes(value));
        for (const value of ['4.2.1', 'x64', 'ARM64']) assert.ok(specs.windows.includes(value));
        assert.match(specs.windows, /not supported|未支持/);
        for (const value of ['4.2.1', 'Intel', 'Apple Silicon']) assert.ok(specs.macos.includes(value));
    }
    const html = renderToStaticMarkup(React.createElement(page.default));
    assert.match(html, /data-client-specs="linux"/);
    assert.match(html, /4\.2\.3/);
});

test('script inspection links and release checksum are available without execution', () => {
    const html = renderToStaticMarkup(React.createElement(page.default));
    assert.match(html, /href="https:\/\/web\.toany\.net\/ddnsto-install\/0\.1\.10\/20261015-6c624972f4c9\/install\.sh" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /href="https:\/\/web\.toany\.net\/ddnsto-install\/0\.1\.10\/20261015-6c624972f4c9\/SHA256SUMS"/);
    assert.ok(html.includes('62ceb9fe0f753af5a1a742f7255de284c1583db51a1f49240501841f08f7bc5c'));
});
