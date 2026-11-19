import { installCommand } from '@/content/installation';
import { platforms } from '@/content/homeInstallation';

/** SSR owns content; enhancement only selects existing panels. No network or device execution. */
export class InstallationGuide extends HTMLElement {
  private active = 'easepi';
  private copyVersion = 0;
  private listeners?: AbortController;

  connectedCallback() {
    this.listeners?.abort();
    this.listeners = new AbortController();
    const { signal } = this.listeners;
    this.addEventListener('click', this.onClick, { signal });
    this.addEventListener('change', this.onChange, { signal });
    window.addEventListener('popstate', this.readLocation, { signal });
    document.addEventListener('click', this.onIntent, { signal });
    this.readLocation();
  }
  disconnectedCallback() {
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
    const platform = platforms.find(
      (p) => p.id === candidate || p.name.toLowerCase() === candidate,
    );
    this.select(platform?.id ?? 'easepi');
    const status = this.querySelector<HTMLElement>('[data-selection-status]')!;
    status.hidden = !params.has('platform') || Boolean(platform);
    status.textContent = status.hidden
      ? ''
      : '未识别设备参数，已显示 EasePi。请在下方选择你的设备。';
  };
  private select(id: string) {
    this.active = id;
    this.querySelectorAll<HTMLElement>('[data-guide]').forEach(
      (p) => (p.hidden = p.dataset.guide !== id),
    );
    this.querySelectorAll<HTMLElement>('[data-platform]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.platform === id)),
    );
    this.setStep(0);
    const select = this.panel.querySelector<HTMLSelectElement>('select');
    if (select) {
      select.selectedIndex = 0;
      this.updateBranch();
    }
  }
  private setStep(index: number) {
    this.panel
      .querySelectorAll<HTMLElement>('[data-step-panel]')
      .forEach((p) => (p.hidden = Number(p.dataset.stepPanel) !== index));
    this.panel
      .querySelectorAll<HTMLElement>('[data-install-step]')
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
    if (button.dataset.platform) {
      this.select(button.dataset.platform);
      this.querySelector<HTMLElement>('[data-selection-status]')!.hidden = true;
      this.querySelector<HTMLElement>('[data-step-status]')!.textContent =
        `已选择 ${platforms.find((p) => p.id === this.active)!.label}，显示第 1 步。`;
    } else if (button.dataset.installStep !== undefined) {
      this.setStep(Number(button.dataset.installStep));
      this.querySelector<HTMLElement>('[data-step-status]')!.textContent =
        `第 ${Number(button.dataset.installStep) + 1} 步：${button.textContent?.slice(1)}`;
    } else if (button.hasAttribute('data-copy-command'))
      void this.copyCommand(button);
  };
  private async copyCommand(button: HTMLButtonElement) {
    const version = ++this.copyVersion;
    const status = this.querySelector<HTMLElement>('.si-copy-status')!;
    const fallback = this.querySelector<HTMLElement>('[data-manual-copy]')!;
    status.textContent = '';
    fallback.hidden = true;
    button.disabled = true;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(installCommand);
          copied = true;
        } catch {
          // A denied modern API may still allow copying during the user gesture.
        }
      }
      if (version !== this.copyVersion || !this.isConnected) return;
      if (!copied) copied = this.copyWithSelection();
      if (copied) {
        status.textContent = '已复制，请替换“用户令牌”后执行。';
      } else {
        status.textContent = '未能自动复制，请选中下方命令手动复制。';
        fallback.hidden = false;
        const input = fallback.querySelector('textarea')!;
        input.focus({ preventScroll: true });
        input.select();
      }
    } finally {
      button.disabled = false;
      if (copied && this.isConnected) button.focus({ preventScroll: true });
    }
  }
  private copyWithSelection(): boolean {
    const input = document.createElement('textarea');
    input.value = installCommand;
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
      'a[href="#devices"]',
    );
    if (!link) return;
    const scene = document.querySelector(
      '[role="tab"][aria-selected="true"]',
    )?.id;
    const intents: Record<string, string> = {
      'apps-scenario': '添加外网域名',
      'tcp-scenario': '远程访问电脑',
      'files-scenario': '远程访问文件',
      'device-scenario': '远程管理设备',
    };
    const intent = document.querySelector<HTMLElement>('#install-intent')!;
    intent.hidden = !link.closest('#scenarios');
    intent.textContent = !intent.hidden
      ? `接下来：选择运行 DDNSTO 的设备，安装后${intents[scene ?? ''] ?? '开始远程访问'}。`
      : '';
  };
}
