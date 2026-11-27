import type { InstallAuthApi, InstallAuthFactory } from './api';

export type AuthState =
  | { phase: 'loading' | 'syncing' | 'cancelled' | 'expired' }
  | { phase: 'scanning'; qrValue: string }
  | { phase: 'authenticated' }
  | { phase: 'error'; message: string };

function proofFrom(payload: unknown): string {
  if (typeof payload === 'string') {
    try {
      return proofFrom(JSON.parse(payload));
    } catch {
      return payload;
    }
  }
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const proof = proofFrom(item);
      if (proof) return proof;
    }
  } else if (payload && typeof payload === 'object') {
    if ('data' in payload) return proofFrom(payload.data);
    if ('token' in payload && typeof payload.token === 'string')
      return payload.token;
  }
  return '';
}
function eventsPresent(events: unknown) {
  return Array.isArray(events)
    ? events.length > 0
    : typeof events === 'string'
      ? Boolean(events.trim())
      : Boolean(events);
}
function delay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}

/** Owns one scan cycle. Raw account token is private memory, never in UI state. */
export class InstallAuthSession {
  private controller?: AbortController;
  private token: string | null = null;
  constructor(
    private open: InstallAuthFactory,
    private onState: (state: AuthState) => void,
  ) {}
  getDeviceToken() {
    return this.token;
  }
  cancel() {
    this.controller?.abort();
    this.controller = undefined;
    this.token = null;
    this.onState({ phase: 'cancelled' });
  }
  async start() {
    this.controller?.abort();
    this.token = null;
    const controller = new AbortController();
    this.controller = controller;
    const signal = controller.signal;
    // A cycle must expire even when the server repeatedly returns immediate empty results.
    const deadline = setTimeout(
      () => controller.abort(new DOMException('Expired', 'TimeoutError')),
      190_000,
    );
    const emit = (state: AuthState) => {
      signal.throwIfAborted();
      this.onState(state);
    };
    let api: InstallAuthApi | undefined;
    try {
      emit({ phase: 'loading' });
      api = await this.open(signal);
      signal.throwIfAborted();
      const status = await api.status(signal);
      signal.throwIfAborted();
      if (status.status !== 'not_logined' || !status.state)
        throw new Error('登录状态异常，请重试');
      const state = status.state;
      const qr = await api.qr(state, signal);
      signal.throwIfAborted();
      if (qr.status !== 'not_logined')
        throw new Error('需要重新扫码，请刷新二维码');
      if (!qr.image || !qr.event_id)
        throw new Error('二维码数据不完整，请重试');
      emit({ phase: 'scanning', qrValue: qr.image });
      for (let count = 0; count < 6; count++) {
        let response;
        try {
          response = await api.poll(qr.event_id, signal);
        } catch {
          signal.throwIfAborted();
          // A successful scan may have established the session despite a polling failure.
          if ((await api.status(signal)).status === 'logined') {
            await this.complete(signal, emit, api);
            return;
          }
          throw new Error('扫码状态读取失败，请刷新二维码');
        }
        signal.throwIfAborted();
        const proof = proofFrom(response.events);
        if (proof || eventsPresent(response.events)) {
          emit({ phase: 'syncing' });
          if (proof) {
            try {
              await api.confirm(state, proof, signal);
            } catch {
              signal.throwIfAborted();
            } // login_status is authoritative, as in console-2026.
          }
          for (let attempt = 0; attempt < 8; attempt++) {
            signal.throwIfAborted();
            if ((await api.status(signal)).status === 'logined') {
              await this.complete(signal, emit, api);
              return;
            }
            await delay(500, signal);
          }
          throw new Error('扫码后登录状态未同步，请刷新二维码');
        }
        // Avoid a hot loop when the long-poll server returns immediately.
        await delay(500, signal);
      }
      if ((await api.status(signal)).status === 'logined')
        await this.complete(signal, emit, api);
      else emit({ phase: 'expired' });
    } catch (error) {
      if (this.controller !== controller) return;
      this.token = null;
      if (signal.aborted) {
        if (signal.reason?.name === 'TimeoutError')
          this.onState({ phase: 'expired' });
        return;
      }
      // Never expose backend response bodies (which can contain credentials).
      this.onState({
        phase: 'error',
        message: error instanceof Error ? error.message : '认证失败，请重试',
      });
    } finally {
      clearTimeout(deadline);
      api?.close();
    }
  }
  private async complete(
    signal: AbortSignal,
    emit: (state: AuthState) => void,
    api: InstallAuthApi,
  ) {
    emit({ phase: 'syncing' });
    for (let attempt = 0; attempt < 8; attempt++) {
      signal.throwIfAborted();
      let profiles;
      try {
        profiles = await api.profile(signal);
      } catch {
        signal.throwIfAborted();
      }
      signal.throwIfAborted();
      const profile = Array.isArray(profiles) ? profiles[0] : undefined;
      if (
        profile?.id &&
        typeof profile.token === 'string' &&
        profile.token.trim()
      ) {
        this.token = profile.token.trim();
        emit({ phase: 'authenticated' });
        return;
      }
      await delay(500, signal);
    }
    throw new Error('已登录，但未取得设备令牌，请重试');
  }
}
