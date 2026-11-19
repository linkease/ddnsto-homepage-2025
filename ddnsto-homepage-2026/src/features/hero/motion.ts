const scenes = [
  { key: 'computer', word: '电脑', target: 'tcp-scenario', duration: 8000 },
  { key: 'software', word: '软件', target: 'apps-scenario', duration: 6000 },
  { key: 'files', word: '文件', target: 'files-scenario', duration: 8000 },
  { key: 'device', word: '设备', target: 'device-scenario', duration: 8000 },
] as const;

export function initializeHero(hero: HTMLElement) {
  const word = hero.querySelector<HTMLAnchorElement>('#remote-word')!;
  const toggle = hero.querySelector<HTMLButtonElement>('.motion-toggle')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Read the preference at startup, then update it atomically from change events.
  // Polling MediaQueryList.matches during animation frames can race event delivery.
  let reducedMotion = reduced.matches;
  let index = 0,
    elapsed = 0,
    last = 0,
    frame = 0,
    inView = false,
    manualPause = false,
    hover = false,
    focus = false;
  const canRun = () =>
    inView &&
    !document.hidden &&
    !reducedMotion &&
    !manualPause &&
    !hover &&
    !focus;
  type Point = { x: number; y: number };
  let geometry:
    { key: string; start: Point; target: Point; download: Point } | undefined;
  function positionCursor(key: string) {
    const panel = hero.querySelector<HTMLElement>(`[data-visual="${key}"]`)!;
    const pointer = panel.querySelector<HTMLElement>('.pointer');
    if (!pointer) return;
    if (geometry?.key !== key) {
      const parent = pointer.offsetParent as HTMLElement;
      const origin = parent.getBoundingClientRect();
      const point = (selector: string): Point => {
        const r = panel.querySelector(selector)!.getBoundingClientRect();
        return {
          x: r.left - origin.left - parent.clientLeft + r.width / 2,
          y: r.top - origin.top - parent.clientTop + r.height / 2,
        };
      };
      geometry = {
        key,
        start: { x: parent.clientWidth * 0.65, y: parent.clientHeight * 0.65 },
        target: point(
          key === 'computer'
            ? '.pc > span'
            : key === 'files'
              ? '.file-row:nth-child(2) > span:first-child'
              : '.toggle',
        ),
        download: key === 'files' ? point('.file-menu span') : { x: 0, y: 0 },
      };
    }
    const mix = (a: Point, b: Point, progress: number) => {
      const t = Math.max(0, Math.min(1, progress));
      const ease = t * t * (3 - 2 * t);
      return { x: a.x + (b.x - a.x) * ease, y: a.y + (b.y - a.y) * ease };
    };
    let pos = mix(geometry.start, geometry.target, elapsed / 1500);
    if (key === 'files' && elapsed >= 2600)
      pos = mix(geometry.target, geometry.download, (elapsed - 2600) / 900);
    // Cursor SVG tip is at (4,4) in its 24px viewBox, rendered at 14px.
    pointer.style.transform = `translate(${pos.x - 14 / 6}px, ${pos.y - 14 / 6}px)`;
    pointer.dataset.clicking = String(
      key === 'software'
        ? elapsed >= 1550 && elapsed < 1850
        : key === 'files'
          ? elapsed >= 3500 && elapsed < 3900
          : elapsed >= 1800 && elapsed < 2300,
    );
  }
  const resizeObserver = new ResizeObserver(() => {
    geometry = undefined;
    render();
  });
  resizeObserver.observe(hero.querySelector('.hero-visual')!);
  function render() {
    const scene = scenes[index];
    hero.dataset.scene = scene.key;
    hero.dataset.phase = String(Math.min(3, Math.floor(elapsed / 2000)));
    word.href = '#' + scene.target;
    word.setAttribute('aria-label', scene.word + '，查看对应使用场景');
    if (word.firstElementChild!.textContent !== scene.word)
      word.firstElementChild!.textContent = scene.word;
    hero
      .querySelectorAll<HTMLElement>('[data-visual]')
      .forEach((panel) => (panel.hidden = panel.dataset.visual !== scene.key));
    const light = hero.querySelector('.light-status')!,
      home = hero.querySelector('.home-status')!;
    light.textContent = elapsed >= 1700 ? '已开启 · 亮度 75%' : '已关闭';
    home.textContent =
      elapsed < 1700
        ? '远程连接家中的 Home Assistant'
        : elapsed < 4300
          ? '客厅灯已开启'
          : '家里的设备，出门也能管理';
    hero.dataset.lightOn = String(elapsed >= 1700);
    hero.dataset.fileMenu = String(
      scene.key === 'files' && elapsed >= 2200 && elapsed < 4000,
    );
    hero.dataset.downloadComplete = String(elapsed >= 7000);
    const transfer = hero.querySelector<HTMLElement>('.file-transfer')!;
    transfer.querySelector('span')!.textContent =
      elapsed >= 7000 ? '下载完成' : '正在下载…';
    transfer.querySelector<HTMLElement>('i')!.style.transform =
      `scaleX(${Math.max(0, Math.min(1, (elapsed - 4000) / 2800))})`;
    if (scene.key === 'device') {
      hero.querySelectorAll<HTMLElement>('.status-bars b').forEach((bar, i) => {
        bar.style.transform = `scaleX(${0.56 + i * 0.08 + Math.sin(elapsed / 1100 + i) * 0.1})`;
      });
    }
    positionCursor(scene.key);
  }
  function tick(now: number) {
    frame = 0;
    if (!canRun()) {
      sync();
      return;
    }
    if (last) elapsed += Math.min(now - last, 100);
    last = now;
    if (elapsed >= scenes[index].duration) {
      elapsed = 0;
      index = (index + 1) % scenes.length;
    }
    render();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (reducedMotion) {
      index = 0;
      elapsed = 0;
      render();
    }
    const running = canRun();
    hero.dataset.running = String(running);
    hero.getAnimations({ subtree: true }).forEach((animation) => {
      if (!running) animation.pause();
      else if (animation.playState === 'paused') animation.play();
    });
    toggle.hidden = reducedMotion;
    toggle.textContent = manualPause ? '播放' : '暂停';
    toggle.setAttribute(
      'aria-label',
      manualPause ? '播放首屏动画' : '暂停首屏动画',
    );
    toggle.setAttribute('aria-pressed', String(manualPause));
    if (running) frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener('click', () => {
    manualPause = !manualPause;
    sync();
  });
  word.addEventListener('pointerenter', () => {
    hover = true;
    sync();
  });
  word.addEventListener('pointerleave', () => {
    hover = false;
    sync();
  });
  word.addEventListener('focus', () => {
    focus = true;
    sync();
  });
  word.addEventListener('blur', () => {
    focus = false;
    sync();
  });
  const observer = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    sync();
  });
  observer.observe(hero);
  const onVisibility = () => sync();
  document.addEventListener('visibilitychange', onVisibility);
  const onReduced = (event: MediaQueryListEvent) => {
    reducedMotion = event.matches;
    sync();
  };
  reduced.addEventListener('change', onReduced);
  addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    reduced.removeEventListener('change', onReduced);
  });
  addEventListener('pageshow', (event) => {
    if (event.persisted) {
      reducedMotion = reduced.matches;
      observer.observe(hero);
      resizeObserver.observe(hero.querySelector('.hero-visual')!);
      document.addEventListener('visibilitychange', onVisibility);
      reduced.addEventListener('change', onReduced);
      sync();
    }
  });
  render();
  sync();
}
