import { randomBytes } from 'node:crypto';

const prefix = '/__install-auth-api/';
const web = 'https://web.ddnsto.com';
const sso = 'https://sso.ddnsto.com';

/** Same-origin, memory-only installation sessions. Never use browser cookies. */
export function createInstallAuthMiddleware({
  fetchUpstream = fetch,
  origin,
  lifetime = 240_000,
  limit = 200,
} = {}) {
  const sessions = new Map();
  function remove(id) {
    const session = sessions.get(id);
    if (!session) return;
    sessions.delete(id);
    clearTimeout(session.timer);
    session.abort.abort();
    session.cookies.clear();
  }
  function reply(res, status, value) {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    });
    res.end(JSON.stringify(value));
  }
  async function body(req) {
    let text = '';
    for await (const chunk of req) {
      text += chunk;
      if (Buffer.byteLength(text) > 8192) throw new Error('Invalid request');
    }
    return text ? JSON.parse(text) : {};
  }
  async function upstream(session, url, signal, init = {}) {
    const business = new URL(url).origin === web;
    const headers = {
      Accept: 'application/json',
      Origin: web,
      Referer: web + '/',
    };
    if (business) {
      headers.Cookie = [...session.cookies]
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
      headers['X-CSRFToken'] = session.cookies.get('csrftoken') || '';
      headers.KSERVERAUTH = 'koolshare';
    }
    if (init.body) headers['Content-Type'] = 'application/json';
    const response = await fetchUpstream(url, {
      ...init,
      headers,
      redirect: 'error',
      signal: AbortSignal.any([
        signal,
        session.abort.signal,
        AbortSignal.timeout(35_000),
      ]),
    });
    // Only the business cookie jar is retained; SSO cannot overwrite it.
    if (business)
      for (const value of response.headers.getSetCookie()) {
        const pair = value.split(';', 1)[0];
        const at = pair.indexOf('=');
        const name = pair.slice(0, at);
        if (['sessionid', 'csrftoken'].includes(name)) {
          if (/max-age=0(?:;|$)/i.test(value) || !pair.slice(at + 1))
            session.cookies.delete(name);
          else session.cookies.set(name, pair.slice(at + 1));
        }
      }
    if (!response.ok) throw new Error('Upstream failed');
    return response;
  }
  const middleware = async (req, res, next = () => reply(res, 404, {})) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (!path.startsWith(prefix)) return next();
    const action = path.slice(prefix.length);
    if (
      ![
        'create',
        'status',
        'qr',
        'poll',
        'confirm',
        'profile',
        'close',
      ].includes(action)
    )
      return reply(res, 404, {});
    // Custom header + same-origin policy prevents cross-site session operations.
    const expected = origin || `http://${req.headers.host}`;
    if (
      req.method !== 'POST' ||
      req.headers['x-install-request'] !== '1' ||
      (req.headers.origin && req.headers.origin !== expected) ||
      req.headers['sec-fetch-site'] === 'cross-site'
    )
      return reply(res, 403, {});
    if (action === 'create') {
      if (sessions.size >= limit) return reply(res, 429, {});
      const id = randomBytes(32).toString('hex');
      const session = {
        cookies: new Map(),
        abort: new AbortController(),
        busy: false,
        state: '',
        event: '',
        scanned: false,
        verified: false,
      };
      session.timer = setTimeout(() => remove(id), lifetime);
      session.timer.unref();
      sessions.set(id, session);
      return reply(res, 200, { id });
    }
    const id = req.headers['x-install-session'];
    const session = sessions.get(id);
    if (action === 'close') {
      remove(id);
      return reply(res, 200, {});
    }
    if (!session) return reply(res, 410, {});
    if (session.busy) return reply(res, 409, {});
    session.busy = true;
    const requestAbort = new AbortController();
    const cancel = () => requestAbort.abort();
    res.once('close', cancel);
    try {
      let result;
      const data = await body(req);
      const call = (url, init) =>
        upstream(session, url, requestAbort.signal, init);
      if (action === 'status') {
        const value = await (await call(web + '/api/login_status/')).json();
        if (
          !session.state &&
          value.status === 'not_logined' &&
          typeof value.state === 'string'
        )
          session.state = value.state;
        session.verified = session.scanned && value.status === 'logined';
        result = { status: value.status, state: session.state };
      } else if (action === 'qr') {
        if (!session.state || session.event) return reply(res, 409, {});
        const url = new URL('/wechat/oauth/login/sso/', sso);
        url.search = new URLSearchParams({
          from: 'ddnsto',
          state: session.state,
          callback: 'installQr',
        }).toString();
        const text = await (await call(url.href)).text();
        const match = text.trim().match(/^installQr\(([\s\S]*)\);?$/);
        if (!match) throw new Error('Invalid QR response');
        const qr = JSON.parse(match[1]);
        if (
          qr.status !== 'not_logined' ||
          typeof qr.image !== 'string' ||
          typeof qr.event_id !== 'string'
        )
          throw new Error('Fresh QR required');
        session.event = qr.event_id;
        result = { status: qr.status, image: qr.image, event_id: qr.event_id };
      } else if (action === 'poll') {
        if (!session.event) return reply(res, 409, {});
        const url = new URL('/longpoll/events', sso);
        url.search = new URLSearchParams({
          category: 'weixinoauth-' + session.event,
          since_time: '0',
          timeout: '30',
        }).toString();
        result = await (await call(url.href)).json();
        if (Array.isArray(result.events) ? result.events.length : result.events)
          session.scanned = true;
      } else if (action === 'confirm') {
        if (
          !session.scanned ||
          typeof data.proof !== 'string' ||
          !data.proof ||
          data.proof.length > 4096
        )
          return reply(res, 409, {});
        await call(
          web + '/api/signal_login/?state=' + encodeURIComponent(session.state),
          {
            method: 'POST',
            body: JSON.stringify({
              openid: 'frontend-fallback',
              token: data.proof,
            }),
          },
        );
        result = {};
      } else if (action === 'profile') {
        if (!session.verified) return reply(res, 409, {});
        const profiles = await (await call(web + '/api/profile/')).json();
        const profile = Array.isArray(profiles) ? profiles[0] : undefined;
        result =
          profile?.id &&
          typeof profile.token === 'string' &&
          profile.token.trim()
            ? [{ id: profile.id, token: profile.token }]
            : [];
        // Successful extraction is one-shot: discard the server-side login session.
        if (result.length) remove(id);
      }
      if (!res.destroyed) reply(res, 200, result);
    } catch {
      if (!res.destroyed)
        reply(res, 502, { message: '扫码服务请求失败，请重试' });
    } finally {
      session.busy = false;
      res.off('close', cancel);
    }
  };
  middleware.close = () => {
    for (const id of sessions.keys()) remove(id);
  };
  return middleware;
}
