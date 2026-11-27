import { trackEvent, type TokenPlatform } from '../../lib/analytics';
import { createInstallAuthApi } from '../install-auth/api';
import { InstallAuthSession, type AuthState } from '../install-auth/session';

/** A fresh isolated scan per opening; no credentials in persistence or analytics payloads. */
export class TokenScanDialog extends HTMLElement {
  private session?: InstallAuthSession;
  private listeners?: AbortController;
  private version = 0;
  private scanCounted = false;
  private copyCounted = false;
  private attribution?: {
    platform: TokenPlatform;
    method: 'docker' | 'compose';
  };
  private track(name: 'click_token_scan_open' | 'click_token_copy') {
    if (this.attribution)
      trackEvent(name, { section: 'installation', ...this.attribution });
  }
  private opener?: HTMLButtonElement;
  private get dialog() {
    return this.querySelector('dialog')!;
  }
  private node<T extends HTMLElement = HTMLElement>(key: string) {
    return this.querySelector<T>(`[data-token-${key}]`)!;
  }
  connectedCallback() {
    this.listeners?.abort();
    this.listeners = new AbortController();
    const { signal } = this.listeners;
    this.session = new InstallAuthSession(createInstallAuthApi(), this.render);
    document.addEventListener('click', this.onPageClick, { signal });
    this.addEventListener('click', this.onClick, { signal });
    this.dialog.addEventListener(
      'cancel',
      (event) => {
        event.preventDefault();
        this.dismiss();
      },
      { signal },
    );
    this.dialog.addEventListener(
      'close',
      () => {
        if (!this.dialog.open) this.reset();
      },
      { signal },
    );
    window.addEventListener('pagehide', this.dismiss, { signal });
    window.addEventListener('popstate', this.dismiss, { signal });
  }
  disconnectedCallback() {
    this.dismiss();
    this.listeners?.abort();
  }
  private onPageClick = (event: MouseEvent) => {
    const target = event.target as Element;
    const opener = target.closest<HTMLButtonElement>('[data-token-scan]');
    if (opener) {
      this.reset();
      this.opener = opener;
      const platform = opener.dataset.tokenPlatform;
      const method = opener.dataset.tokenMethod;
      if (
        [
          'fnos',
          'unraid',
          'terramaster',
          'zspace',
          'ugreen',
          'docker',
        ].includes(platform || '') &&
        (method === 'docker' || method === 'compose')
      )
        this.attribution = { platform: platform as TokenPlatform, method };
      this.dialog.showModal();
      void this.session?.start();
    } else if (
      target.closest('[data-platform],[data-method],a[data-install-platform]')
    )
      this.dismiss();
  };
  private onClick = (event: MouseEvent) => {
    const target = event.target as Element;
    if (target.closest('[data-token-close]')) this.dismiss();
    else if (target.closest('[data-token-retry]')) void this.session?.start();
    else if (target.closest('[data-token-copy]')) void this.copy();
    else if (target === this.dialog) {
      const r = this.dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        this.dismiss();
    }
  };
  private reset() {
    this.session?.cancel();
    this.scanCounted = false;
    this.copyCounted = false;
    this.attribution = undefined;
  }
  private dismiss = () => {
    this.reset();
    if (this.dialog.open) {
      this.dialog.close();
      if (this.opener?.isConnected) this.opener.focus({ preventScroll: true });
    }
    this.opener = undefined;
  };
  private render = (state: AuthState) => {
    const version = ++this.version;
    const qr = this.node<HTMLImageElement>('qr');
    qr.hidden = true;
    qr.removeAttribute('src');
    const ready = state.phase === 'authenticated';
    this.node('ready').hidden = !ready;
    this.node('scanning').hidden = ready;
    this.node('value').textContent = ready
      ? this.session?.getDeviceToken() || ''
      : '';
    this.node<HTMLButtonElement>('copy').disabled = !ready;
    this.node('copy-status').textContent = '';
    const fallback = this.node<HTMLTextAreaElement>('fallback');
    fallback.hidden = true;
    fallback.value = '';
    this.node('retry').hidden = !['error', 'expired'].includes(state.phase);
    this.node('auth-status').textContent =
      state.phase === 'loading'
        ? '正在获取二维码…'
        : state.phase === 'scanning'
          ? '请用微信扫码确认账号；微信内可长按二维码识别。'
          : state.phase === 'syncing'
            ? '正在获取设备令牌…'
            : state.phase === 'expired'
              ? '二维码已过期，请刷新二维码。'
              : state.phase === 'error'
                ? state.message
                : '';
    if (state.phase === 'scanning') {
      void import('qrcode')
        .then((module) =>
          module.default.toDataURL(state.qrValue, {
            margin: 2,
            width: 224,
            errorCorrectionLevel: 'M',
          }),
        )
        .then(async (url) => {
          if (
            version !== this.version ||
            !this.dialog.open ||
            !this.isConnected
          )
            return;
          qr.src = url;
          await qr.decode();
          if (
            version === this.version &&
            this.dialog.open &&
            this.isConnected
          ) {
            qr.hidden = false;
            if (!this.scanCounted) {
              this.scanCounted = true;
              this.track('click_token_scan_open');
            }
          }
        })
        .catch(() => {
          if (version !== this.version || !this.dialog.open) return;
          this.node('auth-status').textContent =
            '二维码生成失败，请刷新二维码。';
          this.node('retry').hidden = false;
        });
    }
  };
  private async copy() {
    const token = this.session?.getDeviceToken();
    if (!token || !this.dialog.open) return;
    if (!this.copyCounted) {
      this.copyCounted = true;
      this.track('click_token_copy');
    }
    const version = this.version;
    const button = this.node<HTMLButtonElement>('copy');
    button.disabled = true;
    let copied = false;
    try {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(token);
          copied = true;
        }
      } catch {
        /* HTTP and denied clipboard use selection below. */
      }
      if (version !== this.version || !this.dialog.open || !this.isConnected)
        return;
      if (!copied) {
        const input = document.createElement('textarea');
        input.value = token;
        input.readOnly = true;
        input.style.cssText =
          'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;font-size:16px';
        this.dialog.append(input);
        try {
          input.focus({ preventScroll: true });
          input.select();
          copied = document.execCommand('copy');
        } catch {
          /* Keep manual copy available. */
        } finally {
          input.remove();
        }
      }
      this.node('copy-status').textContent = copied
        ? '令牌已复制，请填写到设备配置中。'
        : '复制失败，请手动选择令牌复制。';
      if (!copied) {
        const field = this.node<HTMLTextAreaElement>('fallback');
        field.value = token;
        field.hidden = false;
        field.focus();
        field.select();
      } else button.focus({ preventScroll: true });
    } finally {
      if (version === this.version) button.disabled = false;
    }
  }
}
