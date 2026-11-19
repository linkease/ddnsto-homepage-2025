import {
  freshState,
  isScene,
  scenes,
  services,
  validPrefix,
  type SceneKey,
} from './state';
import {
  renderApps,
  renderTcp,
  renderFiles,
  renderDevice,
  pcFolders,
} from './views';

/** One local demo session. Async work belongs to a scene and is cancelled on exit/reset. */
export class ScenarioDemo extends HTMLElement {
  private state = freshState();
  private active: SceneKey = 'apps';
  private lifetime?: AbortController;
  private timer?: ReturnType<typeof setTimeout>;
  private revision = 0;
  private get content() {
    return this.querySelector<HTMLElement>('.scene-content')!;
  }
  private get tabs() {
    return [...this.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  }
  connectedCallback() {
    if (this.lifetime) return;
    this.lifetime = new AbortController();
    const options = { signal: this.lifetime.signal };
    this.addEventListener('click', this.onClick, options);
    this.addEventListener('keydown', this.onKeydown, options);
    this.addEventListener('input', this.onInput, options);
    this.addEventListener('change', this.onChange, options);
    window.addEventListener('hashchange', this.fromHash, options);
    document.addEventListener('click', this.onAnchor, options);
    window.addEventListener('pagehide', this.cancelPending, options);
    window.addEventListener('pageshow', () => this.render(), options);
    document.addEventListener('visibilitychange', this.onVisibility, options);
    this.fromHash();
  }
  disconnectedCallback() {
    this.cancelPending();
    this.lifetime?.abort();
    this.lifetime = undefined;
  }
  private announce(message: string) {
    this.querySelector<HTMLElement>('[data-demo-status]')!.textContent =
      message;
  }
  private status(selector: string, message: string) {
    const node = this.querySelector(selector);
    if (node) node.textContent = message;
  }
  private cancelPending = () => {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.revision++;
    if (this.state.apps.step === 1)
      this.state.apps = { ...this.state.apps, step: 0, progress: 0 };
    this.state.device.generating = false;
  };
  private onVisibility = () => {
    if (document.hidden && this.timer) {
      this.cancelPending();
      this.render();
      this.announce('未完成的模拟任务已取消，可重新开始。');
    }
  };
  private later(callback: () => void, delay: number) {
    const version = this.revision,
      scene = this.active;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (
        !this.isConnected ||
        this.revision !== version ||
        this.active !== scene
      )
        return;
      callback();
    }, delay);
  }
  private select(scene: SceneKey) {
    if (scene !== this.active) this.cancelPending();
    this.active = scene;
    this.render();
  }
  private fromHash = () => {
    const key = location.hash.slice(1).replace(/-scenario$/, '');
    if (isScene(key)) this.select(key);
  };
  private onAnchor = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    const key = link
      ?.getAttribute('href')
      ?.slice(1)
      .replace(/-scenario$/, '');
    if (key && isScene(key)) this.select(key);
  };
  private onKeydown = (event: KeyboardEvent) => {
    const index = this.tabs.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const next = (
      {
        ArrowDown: (index + 1) % 4,
        ArrowRight: (index + 1) % 4,
        ArrowUp: (index + 3) % 4,
        ArrowLeft: (index + 3) % 4,
        Home: 0,
        End: 3,
      } as Record<string, number>
    )[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.select(scenes[next].key);
    this.tabs[next].focus();
  };
  private render(moveFocus = false) {
    const focused = this.content.contains(document.activeElement)
      ? (document.activeElement as HTMLElement)
      : null;
    const identity = focused?.id
      ? `#${CSS.escape(focused.id)}`
      : focused?.dataset.action
        ? `[data-action="${CSS.escape(focused.dataset.action)}"]`
        : null;
    this.content.innerHTML = {
      apps: () => renderApps(this.state.apps),
      tcp: () => renderTcp(this.state.tcp),
      files: () => renderFiles(this.state.files),
      device: () => renderDevice(this.state.device),
    }[this.active]();
    this.dataset.activeScene = this.active;
    this.tabs.forEach((tab) => {
      const selected = tab.dataset.scene === this.active;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    this.querySelector('#experience-panel')!.setAttribute(
      'aria-labelledby',
      `${this.active}-scenario`,
    );
    this.querySelector('#experience-title')!.textContent = scenes.find(
      (scene) => scene.key === this.active,
    )!.panelTitle;
    const cta = this.querySelector<HTMLAnchorElement>('#experience-cta')!;
    cta.href = this.active === 'tcp' ? '#pricing' : '#devices';
    cta.textContent = this.active === 'tcp' ? '查看高级套餐' : '选择你的设备';
    this.querySelector<HTMLElement>('.experience-bottom')!.hidden =
      this.active === 'device';
    if (focused || moveFocus) {
      const replacement = identity
        ? this.content.querySelector<HTMLElement>(identity)
        : null;
      const destination =
        replacement && !replacement.matches(':disabled')
          ? replacement
          : this.content.querySelector<HTMLElement>('h3') || this.content;
      if (!destination.matches('button,input,select,a'))
        destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
    }
  }
  private onInput = (event: Event) => {
    if ((event.target as HTMLElement).id === 'lab-prefix')
      this.state.apps.prefix = (event.target as HTMLInputElement).value;
  };
  private onChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.name === 'fm-remember')
      this.state.files.remember = input.value === 'yes';
    if (input.id === 'rd-create-tcp') this.state.tcp.tcp = input.checked;
    if (input.id === 'domain-protocol') {
      this.state.apps.protocol = input.value === 'http' ? 'http' : 'https';
      this.render();
    }
    if (input.dataset.service !== undefined || input.id === 'lab-all') {
      const selected = new Set(this.state.apps.selected),
        index = Number(input.dataset.service);
      if (input.id === 'lab-all')
        this.state.apps.selected = input.checked ? [0, 1, 2] : [];
      else {
        if (input.checked) selected.add(index);
        else selected.delete(index);
        this.state.apps.selected = [...selected];
      }
      this.querySelectorAll<HTMLInputElement>('[data-service]').forEach(
        (box) =>
          (box.checked = this.state.apps.selected.includes(
            Number(box.dataset.service),
          )),
      );
      const all = this.querySelector<HTMLInputElement>('#lab-all')!;
      all.checked = this.state.apps.selected.length === services.length;
      all.indeterminate = this.state.apps.selected.length > 0 && !all.checked;
      const add = this.querySelector<HTMLButtonElement>('[data-action="add"]')!;
      add.disabled = !this.state.apps.selected.length;
      add.textContent = `一键添加${this.state.apps.selected.length ? `（${this.state.apps.selected.length}）` : ''}`;
    }
  };
  private scan() {
    this.cancelPending();
    this.state.apps = {
      ...this.state.apps,
      step: 1,
      progress: 0,
      opened: null,
      selected: [],
    };
    this.render();
    const tick = () => {
      this.state.apps.progress++;
      if (this.state.apps.progress === 4) {
        this.state.apps.step = 2;
        this.announce('发现完成，3 个示例服务可供选择。');
      }
      this.render();
      if (this.state.apps.step === 1) this.later(tick, 550);
    };
    this.later(tick, 550);
  }
  private async copyDomain(index: number) {
    const revision = this.revision;
    const url = `${this.state.apps.protocol}://${this.state.apps.prefix}-${services[index].slug}.example.com`;
    let message = '示例地址已复制。';
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      message = `无法自动复制，请选中以下示例地址手动复制：${url}`;
    }
    if (revision === this.revision && this.active === 'apps')
      this.status('#domain-action-status', message);
  }
  private download() {
    const file = this.state.files.file;
    if (!file || !pcFolders['工作文档'][file]) return;
    const text = `DDNSTO 模拟文件，不包含真实设备数据。\n\n${pcFolders['工作文档'][file]}`;
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `DDNSTO演示-${file}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.status('#download-status', '已生成示例文件下载，不包含真实设备数据。');
  }
  private onClick = (event: MouseEvent) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      'button',
    );
    if (!button || !this.contains(button)) return;
    if (button.dataset.scene && isScene(button.dataset.scene)) {
      this.select(button.dataset.scene);
      return;
    }
    if (button.id === 'experience-reset') {
      this.cancelPending();
      const fresh = freshState();
      switch (this.active) {
        case 'apps':
          this.state.apps = fresh.apps;
          break;
        case 'tcp':
          this.state.tcp = fresh.tcp;
          break;
        case 'files':
          this.state.files = fresh.files;
          break;
        case 'device':
          this.state.device = fresh.device;
      }
      this.render();
      this.announce('当前场景已重置。');
      return;
    }
    const {
      action,
      openService,
      bookmark,
      copyDomain,
      pcFolder,
      pcFile,
      file,
    } = button.dataset;
    if (copyDomain !== undefined) {
      void this.copyDomain(Number(copyDomain));
      return;
    }
    if (openService !== undefined) this.state.apps.opened = Number(openService);
    if (bookmark !== undefined) {
      const i = Number(bookmark);
      this.state.apps.bookmarks = this.state.apps.bookmarks.includes(i)
        ? this.state.apps.bookmarks.filter((n) => n !== i)
        : [...this.state.apps.bookmarks, i];
    }
    if (pcFolder && pcFolders[pcFolder]) {
      this.state.tcp.folder = pcFolder;
      this.state.tcp.file = null;
    }
    if (
      pcFile &&
      this.state.tcp.folder &&
      pcFolders[this.state.tcp.folder][pcFile]
    )
      this.state.tcp.file = pcFile;
    if (file && pcFolders['工作文档'][file]) this.state.files.file = file;
    const tcp = this.state.tcp,
      files = this.state.files;
    switch (action) {
      case 'scan':
        this.scan();
        return;
      case 'cancel-scan':
        this.cancelPending();
        break;
      case 'add':
        if (!validPrefix(this.state.apps.prefix)) {
          this.status(
            '#lab-error',
            '前缀请使用 1–20 位小写字母、数字或中间连字符。',
          );
          const field = this.querySelector<HTMLInputElement>('#lab-prefix')!;
          field.setAttribute('aria-invalid', 'true');
          field.setAttribute('aria-describedby', 'lab-error');
          field.focus();
          return;
        }
        if (!this.state.apps.selected.length) return;
        this.state.apps.step = 3;
        break;
      case 'rd-start':
      case 'rd-edit':
        tcp.step = 1;
        break;
      case 'rd-cancel':
        tcp.step = 0;
        break;
      case 'rd-rdp':
        tcp.protocol = 'RDP';
        break;
      case 'rd-vnc':
        tcp.protocol = 'VNC';
        break;
      case 'rd-add':
        tcp.step = 2;
        break;
      case 'rd-web':
        tcp.step = 3;
        tcp.folder = null;
        tcp.file = null;
        break;
      case 'rd-disconnect':
        tcp.step = 2;
        tcp.folder = null;
        tcp.file = null;
        break;
      case 'pc-close':
        tcp.folder = null;
        tcp.file = null;
        break;
      case 'pc-back':
        if (tcp.file) tcp.file = null;
        else tcp.folder = null;
        break;
      case 'fm-start':
      case 'fm-edit':
        files.step = 1;
        break;
      case 'fm-cancel':
        files.step = 0;
        break;
      case 'fm-save':
        files.step = 2;
        break;
      case 'fm-delete':
        this.state.files = freshState().files;
        break;
      case 'fm-bookmark':
        files.bookmarked = !files.bookmarked;
        break;
      case 'fm-access':
        files.step = 3;
        files.window = false;
        files.folder = false;
        files.file = null;
        break;
      case 'fm-return':
        files.step = 2;
        break;
      case 'fm-open':
        files.window = true;
        break;
      case 'fm-close':
        files.window = false;
        break;
      case 'fm-show-password': {
        const input = this.querySelector<HTMLInputElement>('#fm-password')!;
        const hidden = input.type === 'password';
        input.type = hidden ? 'text' : 'password';
        button.textContent = hidden ? '隐藏' : '显示';
        button.setAttribute(
          'aria-label',
          hidden ? '隐藏示例密码' : '显示示例密码',
        );
        return;
      }
      case 'fm-diagnose':
        this.status(
          '#fm-diagnostic',
          '模拟诊断完成：示例配置可用，未发起网络检测。',
        );
        return;
      case 'fm-storage':
        this.status('#nas-status', '存储状态（模拟）：已用 120 GB / 1 TB');
        return;
      case 'fm-ddnsto':
        this.status('#nas-status', 'DDNSTO 已连接（模拟）');
        return;
      case 'files-folder':
        files.folder = true;
        files.file = null;
        break;
      case 'files-root':
        files.folder = false;
        files.file = null;
        files.window = true;
        break;
      case 'files-download':
        this.download();
        return;
      case 'asus-enable':
        if (this.state.device.generating) return;
        this.state.device.generating = true;
        this.render();
        this.later(() => {
          this.state.device.generating = false;
          this.state.device.step = 1;
          this.render();
          this.announce('示例设备链接已生成。');
        }, 900);
        return;
      case 'asus-console':
        this.state.device.step = 2;
        break;
    }
    this.render(true);
  };
}
