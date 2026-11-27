/** Local three-step illustration. No installation, scanning or remote requests. */
export class HeroOnboarding extends HTMLElement {
  private step = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private abort?: AbortController;
  private observer?: IntersectionObserver;
  private visible = false;
  private hovered = false;
  private paused = false;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  private tabs: HTMLButtonElement[] = [];

  connectedCallback() {
    this.abort?.abort();
    this.abort = new AbortController();
    const { signal } = this.abort;
    this.tabs = Array.from(this.querySelectorAll('[data-hero-step]'));
    const toggle = this.querySelector<HTMLButtonElement>(
      '.hero-motion-toggle',
    )!;
    toggle.hidden = false;
    this.addEventListener(
      'click',
      (event) => {
        const target = (event.target as Element).closest<HTMLElement>(
          'button,a',
        );
        if (target?.dataset.heroStep !== undefined)
          this.select(Number(target.dataset.heroStep));
        if (target === toggle) {
          this.paused = !this.paused;
          toggle.setAttribute('aria-pressed', String(this.paused));
          toggle.setAttribute(
            'aria-label',
            this.paused ? '播放首屏动画' : '暂停首屏动画',
          );
          toggle.textContent = this.paused ? '播放' : '暂停';
          this.sync();
        }
      },
      { signal },
    );
    this.addEventListener(
      'keydown',
      (event) => {
        const index = this.tabs.indexOf(event.target as HTMLButtonElement);
        if (index < 0) return;
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? 2
              : event.key === 'ArrowRight'
                ? (index + 1) % 3
                : event.key === 'ArrowLeft'
                  ? (index + 2) % 3
                  : -1;
        if (next < 0) return;
        event.preventDefault();
        this.select(next);
        this.tabs[next].focus();
      },
      { signal },
    );
    this.addEventListener(
      'pointerenter',
      (event) => {
        if (event.pointerType === 'mouse') {
          this.hovered = true;
          this.sync();
        }
      },
      { signal },
    );
    this.addEventListener(
      'pointerleave',
      () => {
        this.hovered = false;
        this.sync();
      },
      { signal },
    );
    this.addEventListener('focusin', () => this.sync(), { signal });
    this.addEventListener('focusout', () => queueMicrotask(() => this.sync()), {
      signal,
    });
    document.addEventListener('visibilitychange', () => this.sync(), {
      signal,
    });
    window.addEventListener(
      'pagehide',
      () => {
        this.visible = false;
        this.sync();
      },
      { signal },
    );
    window.addEventListener(
      'pageshow',
      () => {
        this.observer?.unobserve(this);
        this.observer?.observe(this);
      },
      { signal },
    );
    this.reduced.addEventListener(
      'change',
      () => {
        if (this.reduced.matches) this.select(0);
        this.sync();
      },
      { signal },
    );
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        this.sync();
      },
      { threshold: 0.15 },
    );
    this.observer.observe(this);
    this.select(0);
  }
  disconnectedCallback() {
    clearTimeout(this.timer);
    this.abort?.abort();
    this.observer?.disconnect();
  }
  private select(step: number) {
    this.step = step;
    this.dataset.heroActive = String(step);
    this.tabs.forEach((tab, index) => {
      tab.setAttribute('aria-selected', String(index === step));
      tab.tabIndex = index === step ? 0 : -1;
    });
    this.querySelectorAll<HTMLElement>('[data-hero-panel]').forEach(
      (panel, index) => (panel.hidden = index !== step),
    );
    this.querySelector('[role="tabpanel"]')?.setAttribute(
      'aria-labelledby',
      `hero-step-${step}`,
    );
    this.sync();
  }
  private sync() {
    clearTimeout(this.timer);
    const focused = this.contains(document.activeElement);
    const animating =
      this.isConnected &&
      this.visible &&
      !document.hidden &&
      !this.reduced.matches &&
      !this.paused;
    // Hover/focus holds the selected step without freezing its illustration.
    const running = animating && !this.hovered && !focused;
    this.dataset.animating = String(animating);
    this.dataset.running = String(running);
    if (running)
      this.timer = setTimeout(() => this.select((this.step + 1) % 3), 5000);
  }
}
