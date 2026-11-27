import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createInstallAuthMiddleware } from '../server/install-auth.mjs';

async function setup(t, options = {}) {
  const calls = [];
  const logged = new Set();
  let next = 0;
  const middleware = createInstallAuthMiddleware({
    fetchUpstream: async (url, init) => {
      const u = new URL(url);
      calls.push({ url: u, headers: init.headers });
      const cookies = init.headers.Cookie || '';
      assert.ok(!cookies.includes('console-fixture'));
      if (u.origin === 'https://sso.ddnsto.com') {
        assert.equal(init.headers.Cookie, undefined);
        if (u.pathname.includes('wechat'))
          return new Response(
            'installQr(' +
              JSON.stringify({
                status: 'not_logined',
                image: 'https://example.invalid/qr',
                event_id: 'event',
              }) +
              ')',
            { headers: { 'Set-Cookie': 'sessionid=sso-cookie; Path=/' } },
          );
        return Response.json({ events: [{ data: { token: 'proof' } }] });
      }
      if (u.pathname.includes('login_status')) {
        const id = cookies.match(/sessionid=(\w+)/)?.[1] || 'id' + ++next;
        const headers = new Headers();
        headers.append('Set-Cookie', 'sessionid=' + id + '; Path=/; HttpOnly');
        headers.append('Set-Cookie', 'csrftoken=csrf; Path=/');
        return Response.json(
          {
            status: logged.has(id) ? 'logined' : 'not_logined',
            state: 'state-' + id,
          },
          { headers },
        );
      }
      if (u.pathname.includes('signal_login')) {
        assert.equal(init.headers['X-CSRFToken'], 'csrf');
        assert.equal(JSON.parse(init.body).token, 'proof');
        const id = cookies.match(/sessionid=(\w+)/)[1];
        logged.add(id);
        return Response.json({});
      }
      if (u.pathname.includes('profile'))
        return Response.json([
          { id: 1, token: 'device-fixture', private_field: 'must-not-return' },
        ]);
      throw new Error('Unexpected upstream');
    },
    ...options,
  });
  const server = createServer((req, res) => void middleware(req, res));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    middleware.close();
    server.closeAllConnections();
    server.close();
  });
  const origin = 'http://127.0.0.1:' + server.address().port;
  const request = (action, id, data = {}, headers = {}) =>
    fetch(origin + '/__install-auth-api/' + action, {
      method: 'POST',
      headers: {
        'X-Install-Request': '1',
        'Content-Type': 'application/json',
        Cookie: 'sessionid=console-fixture',
        ...(id ? { 'X-Install-Session': id } : {}),
        ...headers,
      },
      body: JSON.stringify(data),
    });
  const create = async () => (await (await request('create')).json()).id;
  return { request, create, calls, origin };
}

test('independent QR cycles ignore browser cookies, isolate SSO, extract once and retain no browser session', async (t) => {
  const { request, create, calls } = await setup(t);
  const a = await create(),
    b = await create();
  assert.notEqual(a, b);
  const first = await request('status', a);
  assert.equal(first.headers.get('set-cookie'), null);
  const firstStatus = await first.json();
  const secondStatus = await (await request('status', b)).json();
  assert.equal(firstStatus.status, 'not_logined');
  assert.notEqual(firstStatus.state, secondStatus.state);
  assert.equal((await request('profile', a)).status, 409);
  await request('qr', a);
  await request('poll', a);
  await request('confirm', a, { proof: 'proof' });
  assert.equal((await (await request('status', a)).json()).status, 'logined');
  const result = await request('profile', a);
  assert.equal(result.headers.get('set-cookie'), null);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await result.json(), [{ id: 1, token: 'device-fixture' }]);
  assert.equal((await request('status', a)).status, 410);
  assert.equal(
    (await (await request('status', b)).json()).status,
    'not_logined',
  );
  const c = await create();
  assert.equal(
    (await (await request('status', c)).json()).status,
    'not_logined',
  );
  assert.equal(
    calls.some((c) => c.url.pathname.includes('logout')),
    false,
  );
  assert.ok(
    calls
      .filter((c) => c.url.pathname.includes('login_status'))
      .some((c) => c.headers.Cookie.includes('id1')),
  );
});

test('close is idempotent, expired sessions fail, and capacity is released', async (t) => {
  const { request, create } = await setup(t, { lifetime: 80, limit: 1 });
  const id = await create();
  assert.equal((await request('create')).status, 429);
  await request('close', id);
  await request('close', id);
  assert.equal((await request('status', id)).status, 410);
  const fresh = await create();
  await new Promise((r) => setTimeout(r, 100));
  assert.equal((await request('status', fresh)).status, 410);
  assert.equal((await request('create')).status, 200);
});

test('reject cross-origin calls, missing custom header and arbitrary endpoints', async (t) => {
  const { request, origin } = await setup(t);
  assert.equal(
    (await request('create', undefined, {}, { Origin: 'https://evil.invalid' }))
      .status,
    403,
  );
  assert.equal(
    (await fetch(origin + '/__install-auth-api/create', { method: 'POST' }))
      .status,
    403,
  );
  assert.equal((await request('logout')).status, 404);
  assert.equal((await request('status', 'unknown')).status, 410);
});
