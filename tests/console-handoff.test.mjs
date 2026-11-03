import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
register('./jsx-loader.mjs', import.meta.url);
process.env.NODE_ENV = 'development';
const { default: InstallPage } = await import('../src/install/InstallPage.jsx');
test('debug page delegates installation to the test console', () => {
    const html = renderToStaticMarkup(React.createElement(InstallPage));
    assert.match(html, /https:\/\/web\.toany\.net:9445\/app\/#\/workbench\?action=install-device/);
    assert.doesNotMatch(html, /<textarea|<input|install\.sh|ddnsto-install|installer-source/);
    assert.match(html, /href="\/install\/debug"/);
});
