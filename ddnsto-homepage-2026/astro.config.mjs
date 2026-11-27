import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { publishedPaths } from './src/config/publishing.mjs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { installAuthDevConfig } from './scripts/install-auth-dev.mjs';

if (existsSync('.env')) loadEnvFile('.env');

const production = process.env.SITE_ENV === 'production';
const origin = process.env.SITE_URL;
if (origin) {
  const url = new URL(origin);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.hostname.endsWith('.invalid')
  ) {
    throw new Error('SITE_URL 必须是 HTTPS 主域名，不含路径、凭据、查询或片段');
  }
}
if (production && !origin)
  throw new Error('生产构建必须设置经过确认的 HTTPS SITE_URL');
export default defineConfig({
  site: origin || 'https://preview.invalid',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [
    react(),
    ...(production && publishedPaths.length
      ? [
          sitemap({
            filter: (url) => publishedPaths.includes(new URL(url).pathname),
          }),
        ]
      : []),
  ],
  vite: process.env.INSTALL_AUTH_CHECK === '1' ? installAuthDevConfig() : {},
  trailingSlash: 'always',
});
