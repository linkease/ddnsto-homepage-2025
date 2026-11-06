import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { existsSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
register('./jsx-loader.mjs', import.meta.url);
process.env.NODE_ENV = 'development';
const { LanguageProvider } = await import('../src/contexts/LanguageContext.jsx');
const { default: Hero } = await import('../src/components/Hero.jsx');
const { default: Navbar } = await import('../src/components/Navbar.jsx');
test('homepage retains tutorials and console without client installation entry', () => {
    const render = Component => renderToStaticMarkup(React.createElement(LanguageProvider, null, React.createElement(Component)));
    for (const html of [render(Hero), render(Navbar)]) {
        assert.doesNotMatch(html, /href="\/install|安装客户端|installer-debug/);
        assert.ok(html.includes('href="/app/#/devices"'));
    }
    assert.match(render(Hero), /guide-markdown/);
});
test('both former installation routes and their UI are removed', () => {
    for (const path of ['src/app/install/page.debug.jsx', 'src/app/install/debug/page.debug.jsx', 'src/install/InstallPage.jsx', 'src/install/InstallToolsPage.jsx']) {
        assert.equal(existsSync(new URL('../' + path, import.meta.url)), false, path);
    }
});
