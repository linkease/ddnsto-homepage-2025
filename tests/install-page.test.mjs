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
