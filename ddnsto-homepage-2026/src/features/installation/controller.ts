import {
  installCommand,
  wgetCommand,
  downloadCommand,
  windowsCommand,
  aiPrompt,
  terminalPlatforms,
  scriptSupport,
  preparation,
} from '@/content/installMethods';
import { trackEvent } from '@/lib/analytics';
import { platforms } from '@/content/homeInstallation';
import { createInstallAuthApi } from '../install-auth/api';
import { InstallAuthSession, type AuthState } from '../install-auth/session';
import { buildInstallCommand } from '../install-auth/commands.mjs';

/** Static guides plus opt-in authentication; commands are never executed here. */
export class InstallationGuide extends HTMLElement {
  private active = 'easepi';
  private copyVersion = 0;
  private auth?: InstallAuthSession;
  private qrVersion = 0;
  private scanState = 'idle';
  private scanOpenTracked = false;
  private scanCopyTracked = false;
  private get windows() {
    return ['windows', 'terminal-windows'].includes(this.active);
  }
  private listeners?: AbortController;

  connectedCallback() {
    this.listeners?.abort();
    this.listeners = new AbortController();
    const { signal } = this.listeners;
    this.auth = new InstallAuthSession(
      createInstallAuthApi(),
      this.onAuthState,
    );
    window.addEventListener('pagehide', () => this.auth?.cancel(), { signal });
    this.addEventListener('click', this.onClick, { signal });
    this.addEventListener('change', this.onChange, { signal });
    this.addEventListener('keydown', this.onKeydown, { signal });
    window.addEventListener('popstate', this.readLocation, { signal });
    document.addEventListener('click', this.onIntent, { signal });
    this.readLocation();
  }
  disconnectedCallback() {
    this.auth?.cancel();
    this.listeners?.abort();
    this.copyVersion++;
  }
  private get panel() {
    return this.querySelector<HTMLElement>(`[data-guide="${this.active}"]`)!;
  }
  private readLocation = () => {
    const params = new URLSearchParams(location.search);
    const requested = params.get('platform');
    // The legacy reference exposed both ASUS labels; preserve those inbound links.
    const legacy =
      requested === 'asusgo-legacy' || requested === 'ASUSGO 固件 <386';
    const candidate = legacy ? 'asusgo' : requested?.toLowerCase();
    const platform = [...platforms, ...terminalPlatforms].find(
      (p) => p.id === candidate || p.name.toLowerCase() === candidate,
    );
    this.select(
      platform?.id ??
        (location.hash === '#install-options' ? 'terminal-unix' : 'easepi'),
    );
    const status = this.querySelector<HTMLElement>('[data-selection-status]')!;
    status.hidden = !params.has('platform') || Boolean(platform);
    status.textContent = status.hidden
      ? ''
      : '未识别设备参数，已显示 EasePi。请在下方选择你的设备。';
  };
  private select(id: string) {
    this.active = id;
    const item = [...platforms, ...terminalPlatforms].find((p) => p.id === id)!;
    this.querySelector<HTMLElement>('[data-platform-title]')!.textContent =
      id === 'asusgo' ? 'ASUSGO/KoolCenter 官改/梅林' : item.label;
    const tutorial = this.querySelector<HTMLAnchorElement>(
      '[data-platform-tutorial]',
    )!;
    tutorial.hidden = !item.url;
    if (item.url) tutorial.href = item.url;
    else tutorial.removeAttribute('href');
    tutorial.target = '_blank';
    this.querySelector<HTMLElement>('.install-method-tabs')!.hidden =
      id.startsWith('terminal-');
    const methods =
      id === 'fnos'
        ? ['compose', 'docker']
        : ['docker', 'unraid', 'terramaster'].includes(id)
          ? ['docker', 'compose', 'ai']
          : ['zspace', 'ugreen'].includes(id)
            ? ['docker', 'ai']
            : ['linux', 'macos'].includes(id)
              ? ['script', 'ai']
              : id.startsWith('terminal-')
                ? ['script']
                : id === 'windows'
                  ? [
                      'software',
                      // 暂时隐藏 Windows 一键脚本标签；取消下一行注释即可恢复。
                      // 'script',
                      'ai',
                    ]
                  : [
                      'software',
                      ...(scriptSupport(id) ? ['script'] : []),
                      'ai',
                    ];
    const tabs = this.querySelector<HTMLElement>('.install-method-tabs')!;
    const buttons = Array.from(
      tabs.querySelectorAll<HTMLElement>('[data-method]'),
    );
    for (const tab of buttons) {
      tab.hidden = !methods.includes(tab.dataset.method!);
      const badge = tab.querySelector<HTMLElement>('small');
      if (badge)
        badge.hidden = tab.dataset.method === 'compose' && id !== 'fnos';
    }
    for (const method of [
      ...methods,
      ...buttons
        .map((b) => b.dataset.method!)
        .filter((m) => !methods.includes(m)),
    ]) {
      tabs.append(buttons.find((b) => b.dataset.method === method)!);
    }
    this.querySelector<HTMLElement>(
      '[data-method="software"] [data-method-label]',
    )!.textContent = id === 'ikuai' ? '视频/文档教程' : '软件安装';
    this.querySelector<HTMLElement>(
      '[data-method="docker"] [data-method-label]',
    )!.textContent =
      id === 'docker'
        ? '命令安装'
        : id === 'zspace'
          ? '镜像安装'
          : id === 'fnos'
            ? '常规 Docker'
            : 'Docker 安装';
    this.querySelectorAll<HTMLElement>('[data-container-platform]').forEach(
      (panel) => {
        panel.hidden = panel.dataset.containerPlatform !== id;
      },
    );
    this.setMethod(methods[0]);
    this.querySelectorAll<HTMLElement>('[data-guide]').forEach(
      (p) => (p.hidden = p.dataset.guide !== id),
    );
    this.querySelectorAll<HTMLElement>('[data-platform]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.platform === id)),
    );
    this.setStep(0);
    const select = this.panel?.querySelector<HTMLSelectElement>('select');
    if (select) {
      select.selectedIndex = 0;
      this.updateBranch();
    }
  }
  private setStep(index: number) {
    this.panel
      ?.querySelectorAll<HTMLElement>('[data-step-panel]')
      .forEach((p) => (p.hidden = Number(p.dataset.stepPanel) !== index));
    this.panel
      ?.querySelectorAll<HTMLElement>('[data-install-step]')
      .forEach((b) =>
        b.setAttribute(
          'aria-pressed',
          String(Number(b.dataset.installStep) === index),
        ),
      );
  }
  private updateBranch() {
    const select = this.panel.querySelector<HTMLSelectElement>('select');
    const note = this.panel.querySelector<HTMLElement>('[data-branch-note]');
    const branch = platforms
      .find((p) => p.id === this.active)
      ?.branches.find((b) => b.id === select?.value);
    if (note && branch) note.textContent = branch.note;
    this.setStep(0);
  }
  private onChange = (event: Event) => {
    if ((event.target as HTMLElement).matches('[data-branch]'))
      this.updateBranch();
  };
  private onClick = (event: MouseEvent) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      'button',
    );
    if (!button) return;
    if (button.hasAttribute('data-copy-template')) {
      void this.copyTemplate(button);
      return;
    }
    if (button.dataset.method) {
      this.setMethod(button.dataset.method);
      return;
    }
    if (
      button.hasAttribute('data-auth-retry') ||
      button.dataset.scan === 'scanning'
    ) {
      if (scriptSupport(this.active)) {
        if (!button.hasAttribute('data-auth-retry')) this.resetScanTracking();
        void this.auth?.start();
      }
      return;
    }
    if (button.dataset.scan === 'idle') {
      this.auth?.cancel();
      return;
    }
    if (button.hasAttribute('data-software')) {
      this.setMethod('software');
      this.querySelector<HTMLElement>('#method-software')?.focus();
      return;
    }
    if (button.dataset.platform) {
      this.select(button.dataset.platform);
      this.querySelector<HTMLElement>('[data-selection-status]')!.hidden = true;
      this.querySelector<HTMLElement>('[data-step-status]')!.textContent =
        `已选择 ${[...platforms, ...terminalPlatforms].find((p) => p.id === this.active)!.label}，显示第 1 步。`;
    } else if (button.dataset.installStep !== undefined) {
      this.setStep(Number(button.dataset.installStep));
      this.querySelector<HTMLElement>('[data-step-status]')!.textContent =
        `第 ${Number(button.dataset.installStep) + 1} 步：${button.textContent?.slice(1)}`;
    } else if (button.hasAttribute('data-copy-id'))
      void this.copyCommand(button);
  };
  private async copyTemplate(button: HTMLButtonElement) {
    const block = button.closest<HTMLElement>('[data-template-block]')!;
    const text = block.querySelector('code')!.textContent!;
    const status = block.querySelector<HTMLElement>('[data-template-status]')!;
    const fallback = block.querySelector<HTMLTextAreaElement>(
      '[data-template-fallback]',
    )!;
    button.disabled = true;
    fallback.hidden = true;
    let copied = false;
    try {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          copied = true;
        }
      } catch {}
      if (!copied) copied = this.copyWithSelection(text);
      if (!this.isConnected) return;
      status.textContent = copied
        ? block.dataset.copySuccess ||
          '已复制模板，请替换用户令牌，并为设备设置唯一名称。复制不会执行安装。'
        : '复制失败，请手动选择并复制。';
      if (!copied) {
        fallback.value = text;
        fallback.hidden = false;
      }
    } finally {
      button.disabled = false;
    }
  }
  private async copyCommand(button: HTMLButtonElement) {
    if (button.dataset.copyId !== 'ai' && this.scanState !== 'ready') return;
    if (button.dataset.copyId !== 'ai')
      this.trackScan('copy', button.dataset.copyId);
    const version = ++this.copyVersion;
    const block = button.closest<HTMLElement>('[data-command-block]')!;
    const status = block.querySelector<HTMLElement>('[data-copy-status]')!;
    const fallback = block.querySelector<HTMLElement>('[data-manual-copy]')!;
    const text = this.command(button.dataset.copyId!);
    status.textContent = '';
    fallback.hidden = true;
    button.disabled = true;
    let copied = false;
    try {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          copied = true;
        }
      } catch {
        /* Try selection-based copying for HTTP or denied access. */
      }
      if (version !== this.copyVersion || !this.isConnected) return;
      if (!copied) copied = this.copyWithSelection(text);
      status.textContent = copied
        ? button.dataset.copyId === 'ai'
          ? 'AI 安装提示词已复制，请替换 token 后交给 Agent。'
          : '安装命令已复制，请到目标设备终端运行。'
        : '未能自动复制，请选中下方内容手动复制。';
      status.classList.toggle(
        'command-copy-success',
        copied && button.dataset.copyId !== 'ai',
      );
      const help = block.querySelector<HTMLElement>('[data-copy-help]');
      if (help) help.hidden = !copied;
      if (!copied) {
        fallback.hidden = false;
        const field = fallback.querySelector('textarea')!;
        field.value = text;
        field.focus({ preventScroll: true });
        field.select();
      }
    } finally {
      if (version === this.copyVersion) button.disabled = false;
      if (copied && version === this.copyVersion && this.isConnected)
        button.focus({ preventScroll: true });
    }
  }
  private command(key: string) {
    if (key === 'ai') return aiPrompt;
    const token = this.auth?.getDeviceToken();
    if (!token) return '';
    return buildInstallCommand(
      key === 'primary'
        ? this.windows
          ? windowsCommand
          : installCommand
        : key === 'wget'
          ? wgetCommand
          : downloadCommand,
      token,
      key === 'primary' && this.windows,
    );
  }
  private resetCopy() {
    this.copyVersion++;
    this.querySelectorAll<HTMLElement>('[data-copy-status]').forEach((n) => {
      n.textContent = '';
      n.classList.remove('command-copy-success');
    });
    this.querySelectorAll<HTMLElement>(
      '[data-manual-copy],[data-copy-help]',
    ).forEach((n) => (n.hidden = true));
    this.querySelectorAll<HTMLButtonElement>('[data-copy-id]').forEach(
      (n) =>
        (n.disabled = n.dataset.copyId !== 'ai' && this.scanState !== 'ready'),
    );
  }
  private setScan(state: string) {
    this.scanState = state;
    this.resetCopy();
    this.querySelectorAll<HTMLElement>(
      '[data-command-block]:not([data-command-block=ai])',
    ).forEach((block) => {
      const command =
        state === 'ready' ? this.command(block.dataset.commandBlock!) : '';
      block.querySelector('code')!.textContent = command;
      block.querySelector('textarea')!.value = command;
    });
    this.querySelectorAll<HTMLElement>('[data-scan-state]').forEach(
      (n) => (n.hidden = n.dataset.scanState !== state),
    );
    this.querySelectorAll<HTMLElement>('[data-ready-only]').forEach(
      (n) =>
        (n.hidden =
          state !== 'ready' ||
          (this.windows && n.dataset.readyOnly !== 'primary')),
    );
    this.querySelectorAll<HTMLDetailsElement>('.method-details').forEach(
      (n) => (n.open = false),
    );
  }
  private onAuthState = (state: AuthState) => {
    const version = ++this.qrVersion;
    const qr = this.querySelector<HTMLImageElement>('[data-login-qr]')!;
    qr.hidden = true;
    qr.removeAttribute('src');
    if (state.phase === 'cancelled') {
      this.resetScanTracking();
      this.setScan('idle');
      return;
    }
    if (state.phase === 'authenticated') {
      this.setScan('ready');
      return;
    }
    this.setScan('scanning');
    const messages = {
      loading: '正在检查登录状态并获取二维码…',
      scanning: '请用微信扫码确认账号；微信内可长按二维码识别。',
      syncing: '正在确认登录并获取设备令牌…',
      expired: '二维码已过期，请刷新二维码。',
      error: state.phase === 'error' ? state.message : '',
    };
    this.querySelector<HTMLElement>('[data-auth-status]')!.textContent =
      messages[state.phase];
    this.querySelector<HTMLElement>('[data-auth-retry]')!.hidden = ![
      'error',
      'expired',
    ].includes(state.phase);
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
          if (version !== this.qrVersion || !this.isConnected) return;
          qr.src = url;
          await qr.decode();
          if (version !== this.qrVersion || !this.isConnected) return;
          qr.hidden = false;
          this.trackScan('open');
        })
        .catch(() => {
          if (version !== this.qrVersion) return;
          this.auth?.cancel();
          this.onAuthState({
            phase: 'error',
            message: '二维码绘制失败，请重试',
          });
        });
    }
  };
  private resetScanTracking() {
    this.scanOpenTracked = false;
    this.scanCopyTracked = false;
  }
  private trackScan(kind: 'open' | 'copy', variant?: string) {
    try {
      const platform =
        this.active === 'terminal-windows'
          ? 'windows'
          : this.active === 'terminal-unix'
            ? 'macos_linux'
            : null;
      if (
        !platform ||
        (kind === 'open' ? this.scanOpenTracked : this.scanCopyTracked)
      )
        return;
      if (kind === 'open') this.scanOpenTracked = true;
      else this.scanCopyTracked = true;
      const name =
        kind === 'open'
          ? (`click_${platform}_scan_open` as const)
          : (`click_${platform}_install_copy` as const);
      trackEvent(name, {
        section: 'installation',
        platform,
        ...(kind === 'copy'
          ? {
              command_variant:
                variant === 'wget' || variant === 'download'
                  ? variant
                  : 'primary',
            }
          : {}),
      });
    } catch {
      /* Observation must not alter QR rendering or command copying. */
    }
  }
  private setMethod(method: string) {
    this.auth?.cancel();
    this.querySelectorAll<HTMLElement>('[data-method]').forEach((n) => {
      const selected = n.dataset.method === method;
      n.setAttribute('aria-selected', String(selected));
      n.tabIndex = selected ? 0 : -1;
    });
    this.querySelectorAll<HTMLElement>('[data-method-panel]').forEach(
      (n) => (n.hidden = n.dataset.methodPanel !== method),
    );
    this.querySelector<HTMLElement>('[data-unsupported]')!.hidden =
      scriptSupport(this.active);
    this.querySelector<HTMLElement>('[data-script-guide]')!.hidden =
      !scriptSupport(this.active);
    this.querySelector<HTMLElement>('[data-preparation]')!.textContent =
      preparation(this.active);
    this.querySelector<HTMLElement>('[data-preparation-title]')!.textContent =
      this.windows ? '以管理员身份打开 PowerShell' : '打开目标设备终端 / SSH';
    this.querySelectorAll<HTMLElement>('[data-windows-only]').forEach(
      (n) => (n.hidden = !this.windows),
    );
    this.querySelectorAll<HTMLElement>('[data-unix-only]').forEach(
      (n) => (n.hidden = this.windows),
    );
    this.querySelector<HTMLElement>('[data-command-title]')!.textContent = this
      .windows
      ? 'PowerShell'
      : 'Terminal / SSH · curl';
    this.querySelector<HTMLElement>('[data-copy-command]')!.textContent = this
      .windows
      ? '复制 Windows CLI 安装命令'
      : '复制安装命令';
    this.querySelector<HTMLElement>('.si-command code')!.textContent =
      this.command('primary');
    const requirements = this.querySelector<HTMLElement>(
      '[data-platform-requirements]',
    )!;
    const notes: Record<string, string> = {
      asusgo:
        '必须有兼容的软件中心并开启 SSH；原厂固件不代表支持，脚本不会刷机或安装软件中心。rogsoft RT-AX86U 已完成实机验证，其他渠道和机型尚未全部验收。需要受支持的 JFFS 挂载、至少 96 MiB 可用空间及 HTTPS / SHA256 校验工具。安装时不要同时在软件中心修改 Token。不满足条件请用手动安装，不要强制重装。',
      synology:
        '群晖已验证 DS220j / DSM 7.1。ARM64 仅支持已验证的 DS220j 兼容路径，其他机型尚未完成实机验收。脚本使用默认安装卷；旧配置残留或账号不匹配时停止，不自动删除配置。',
    };
    requirements.textContent = notes[this.active] || '';
    requirements.hidden = !requirements.textContent;
  }
  private onKeydown = (event: KeyboardEvent) => {
    const tabs = [
      ...this.querySelectorAll<HTMLButtonElement>(
        '[data-method]:not([hidden])',
      ),
    ];
    const i = tabs.indexOf(event.target as HTMLButtonElement);
    if (i < 0) return;
    const next: Record<string, number> = {
      ArrowRight: (i + 1) % tabs.length,
      ArrowLeft: (i + tabs.length - 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (next[event.key] === undefined) return;
    event.preventDefault();
    this.setMethod(tabs[next[event.key]].dataset.method!);
    tabs[next[event.key]].focus();
  };
  private copyWithSelection(text: string): boolean {
    const input = document.createElement('textarea');
    input.value = text;
    input.readOnly = true;
    input.style.cssText =
      'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;font-size:16px';
    this.append(input);
    try {
      input.focus({ preventScroll: true });
      input.select();
      input.setSelectionRange(0, input.value.length);
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      input.remove();
    }
  }

  private onIntent = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href="#devices"], a[href="#install-options"], a[data-install-platform]',
    );
    if (!link) return;
    if (link.getAttribute('href') === '#install-options') {
      event.preventDefault();
      this.select('terminal-unix');
      history.pushState(null, '', '#install-options');
      document.getElementById('install-title')?.scrollIntoView();
      return;
    }
    if (link.getAttribute('href') === '#devices' && link.closest('.hero')) {
      event.preventDefault();
      history.pushState(null, '', '#devices');
      document.getElementById('install-title')?.scrollIntoView();
      return;
    }
    if (link.dataset.installPlatform) {
      const id = link.dataset.installPlatform;
      if (platforms.some((platform) => platform.id === id)) {
        event.preventDefault();
        history.pushState(null, '', link.href);
        this.readLocation();
        document.getElementById('install-title')?.scrollIntoView();
      }
    }
  };
}
