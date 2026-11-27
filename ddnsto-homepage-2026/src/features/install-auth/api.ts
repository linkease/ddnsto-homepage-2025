/** Installation authentication uses a fresh, cookie-free isolated server session. */
export interface LoginStatus {
  status?: string;
  state?: string;
}
export interface OauthQr {
  status?: string;
  image?: string;
  event_id?: string;
}
export interface PollResponse {
  events?: unknown;
  timeout?: unknown;
}
export interface DeviceProfile {
  id: number;
  token?: string;
}
export interface InstallAuthApi {
  close(): void;
  status(signal: AbortSignal): Promise<LoginStatus>;
  qr(state: string, signal: AbortSignal): Promise<OauthQr>;
  poll(eventId: string, signal: AbortSignal): Promise<PollResponse>;
  confirm(state: string, proof: string, signal: AbortSignal): Promise<void>;
  profile(signal: AbortSignal): Promise<DeviceProfile[]>;
}

export type InstallAuthFactory = (
  signal: AbortSignal,
) => Promise<InstallAuthApi>;

export function createInstallAuthApi(): InstallAuthFactory {
  return async (signal) => {
    const request = async <T>(
      action: string,
      currentSignal?: AbortSignal,
      id?: string,
      body = {},
    ) => {
      const response = await fetch('/__install-auth-api/' + action, {
        method: 'POST',
        credentials: 'omit',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-Install-Request': '1',
          ...(id ? { 'X-Install-Session': id } : {}),
        },
        body: JSON.stringify(body),
        signal: currentSignal
          ? AbortSignal.any([currentSignal, AbortSignal.timeout(40_000)])
          : AbortSignal.timeout(5_000),
        keepalive: action === 'close',
      });
      if (!response.ok)
        throw new Error(
          response.status === 410
            ? '二维码已过期，请重新扫码'
            : '扫码服务请求失败，请重试',
        );
      return (await response.json()) as T;
    };
    const { id } = await request<{ id: string }>('create', signal);
    let closed = false;
    return {
      close: () => {
        if (closed) return;
        closed = true;
        // A successful profile response already destroys the server session.
        void request('close', undefined, id).catch(() => {});
      },
      status: (signal) => request<LoginStatus>('status', signal, id),
      qr: (_state, signal) => request<OauthQr>('qr', signal, id),
      poll: (_event, signal) => request<PollResponse>('poll', signal, id),
      confirm: async (_state, proof, signal) => {
        await request('confirm', signal, id, { proof });
      },
      profile: (signal) => request<DeviceProfile[]>('profile', signal, id),
    };
  };
}
