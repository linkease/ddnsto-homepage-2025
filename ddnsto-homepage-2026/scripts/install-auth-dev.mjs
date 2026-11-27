import { readFileSync } from 'node:fs';
import { createInstallAuthMiddleware } from '../server/install-auth.mjs';

/** The same isolated session handler is used locally and by the production sidecar. */
export function installAuthDevConfig() {
  const html = readFileSync(
    new URL('./install-auth-check.html', import.meta.url),
    'utf8',
  );
  return {
    plugins: [
      {
        name: 'install-auth-development-check',
        apply: 'serve',
        configureServer(server) {
          const auth = createInstallAuthMiddleware();
          server.middlewares.use(auth);
          server.httpServer?.once('close', () => auth.close());
          server.middlewares.use(async (req, res, next) => {
            const path = new URL(req.url || '/', 'http://localhost').pathname;
            if (
              path.startsWith('/api/') ||
              path.startsWith('/__install-sso/')
            ) {
              res.writeHead(404).end('Not found');
              return;
            }
            if (path !== '/__install-auth/') {
              next();
              return;
            }
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('X-Robots-Tag', 'noindex, nofollow');
            res.setHeader('Referrer-Policy', 'no-referrer');
            res.end(await server.transformIndexHtml(path, html));
          });
        },
      },
    ],
  };
}
