import type { APIRoute } from 'astro';
import { publishedPaths } from '@/config/publishing.mjs';
import { isProduction } from '@/config/site';
export const GET: APIRoute = ({ site }) =>
  new Response(
    isProduction && publishedPaths.length > 0
      ? `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap-index.xml', site)}\n`
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
