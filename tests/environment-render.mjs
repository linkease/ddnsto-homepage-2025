import { register } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

register('./jsx-loader.mjs', import.meta.url);
const { LanguageProvider } = await import('../src/contexts/LanguageContext.jsx');
const { default: Hero } = await import('../src/components/Hero.jsx');
const { default: Navbar } = await import('../src/components/Navbar.jsx');
const render = component => renderToStaticMarkup(React.createElement(LanguageProvider, null, React.createElement(component)));
console.log(JSON.stringify({
    hero: render(Hero), navbar: render(Navbar),
}));
