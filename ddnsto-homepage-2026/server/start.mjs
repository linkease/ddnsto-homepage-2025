import { createServer } from 'node:http';
import { createInstallAuthMiddleware } from './install-auth.mjs';

const origin = process.env.INSTALL_AUTH_ORIGIN;
if (
  !origin ||
  new URL(origin).origin !== origin ||
  !origin.startsWith('https://')
)
  throw new Error('Set INSTALL_AUTH_ORIGIN to the public HTTPS origin');
const middleware = createInstallAuthMiddleware({ origin });
const server = createServer((req, res) => {
  void middleware(req, res, () => {
    res.writeHead(404).end();
  });
});
server.requestTimeout = 45_000;
server.listen(Number(process.env.INSTALL_AUTH_PORT || 16209), '127.0.0.1');
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => {
    middleware.close();
    server.close();
  });
