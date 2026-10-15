import { register } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

register('./jsx-loader.mjs', import.meta.url);
const { LanguageProvider } = await import('../src/contexts/LanguageContext.jsx');
const { default: Hero } = await import('../src/components/Hero.jsx');
const { default: Navbar } = await import('../src/components/Navbar.jsx');
const { default: Page } = await import('../src/app/install/page.debug.jsx');
const { buildInstallCommand } = await import('../src/install/installer.js');
const { installRelease } = await import('../src/install/release.js');
const render = component => renderToStaticMarkup(React.createElement(LanguageProvider, null, React.createElement(component)));
let routeStatus = 200;
try { await Page(); } catch (error) {
    if (error.digest === 'NEXT_HTTP_ERROR_FALLBACK;404') routeStatus = 404;
    else throw error;
}
console.log(JSON.stringify({
    hero: render(Hero), navbar: render(Navbar), routeStatus,
    command: buildInstallCommand('macos'), release: installRelease,
    overrideCommand: buildInstallCommand('macos', { ...installRelease, ready: true }),
}));
