import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
register('./jsx-loader.mjs', import.meta.url);
process.env.NODE_ENV = 'development';
const { LanguageProvider } = await import('../src/contexts/LanguageContext.jsx');
const { default: CommandPanel } = await import('../src/install/CommandPanel.jsx');
const { buildDebugCommand } = await import('../src/install/installer.js');
const base = 'https://web.toany.net/ddnsto-install/0.2.1/20261103-a80245f87de8';
test('tools can open the current tested source with all native maintenance actions', () => {
    const html = renderToStaticMarkup(React.createElement(LanguageProvider, null,
        React.createElement(CommandPanel, { platform: 'linux', initialSource: 'candidate', initialBase: base, initialMethod: 'native' })));
    assert.match(html, /id="installer-base"/);
    assert.ok(html.includes(base));
    for (const action of ['status', 'start', 'stop', 'restart', 'repair', 'configure', 'uninstall']) assert.ok(html.includes(`>${action}</option>`));
});
test('current tested 0.2.1 supports Synology and Docker contracts', () => {
    assert.match(buildDebugCommand({ base, platform: 'synology', action: 'download' }) ?? '', /--action download/);
    assert.match(buildDebugCommand({ base, platform: 'linux', method: 'docker', architecture: 'amd64', action: 'stop' }) ?? '', /--action stop/);
});
