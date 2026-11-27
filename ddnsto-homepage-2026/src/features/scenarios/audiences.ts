/** Automatic previews stop on user selection; no account or device requests. */
export class AudienceTabs extends HTMLElement {
  private lifetime?: AbortController;
  private observer?: IntersectionObserver;
  private timer?: ReturnType<typeof setInterval>;
  private active = 0;
  private transition?: Animation;
  private manual = false;
  private visible = false;
  private hovered = false;
  private motion = matchMedia('(prefers-reduced-motion: reduce)');
  private get tabs() {
    return [...this.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  }
  connectedCallback() {
    if (this.lifetime) return;
    this.lifetime = new AbortController();
    const options = { signal: this.lifetime.signal };
    this.addEventListener(
      'click',
      (event) => {
        const tab = (event.target as Element).closest<HTMLButtonElement>(
          '[role="tab"]',
        );
        if (tab) {
          this.manual = true;
          this.select(this.tabs.indexOf(tab));
          this.sync();
        }
      },
      options,
    );
    this.addEventListener(
      'keydown',
      (event) => {
        const index = this.tabs.indexOf(event.target as HTMLButtonElement);
        if (index < 0) return;
        const next: Record<string, number> = {
          ArrowDown: (index + 1) % 4,
          ArrowRight: (index + 1) % 4,
          ArrowUp: (index + 3) % 4,
          ArrowLeft: (index + 3) % 4,
          Home: 0,
          End: 3,
        };
        if (next[event.key] === undefined) return;
        event.preventDefault();
        this.manual = true;
        this.select(next[event.key]);
        this.tabs[this.active].focus();
        this.sync();
      },
      options,
    );
    this.addEventListener(
      'mouseenter',
      () => {
        this.hovered = true;
        this.sync();
      },
      options,
    );
    this.addEventListener(
      'mouseleave',
      () => {
        this.hovered = false;
        this.sync();
      },
      options,
    );
    this.addEventListener('focusin', this.sync, options);
    this.addEventListener('focusout', () => queueMicrotask(this.sync), options);
    document.addEventListener('visibilitychange', this.sync, options);
    this.motion.addEventListener('change', this.sync, options);
    window.addEventListener(
      'pagehide',
      () => clearInterval(this.timer),
      options,
    );
    window.addEventListener('pageshow', this.sync, options);
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        this.sync();
      },
      { threshold: 0.2 },
    );
    this.observer.observe(this);
  }
  disconnectedCallback() {
    clearInterval(this.timer);
    this.settle();
    this.observer?.disconnect();
    this.lifetime?.abort();
    this.lifetime = undefined;
  }
  private get panels() {
    return [...this.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
  }
  private settle() {
    if (this.transition) {
      this.transition.onfinish = null;
      this.transition.cancel();
      this.transition = undefined;
    }
    this.panels.forEach((panel, i) => (panel.hidden = i !== this.active));
  }
  private select(index: number) {
    if (index === this.active) return;
    const outgoing = this.panels.find((panel) => !panel.hidden);
    const opacity = outgoing ? getComputedStyle(outgoing).opacity : '1';
    if (this.transition) {
      this.transition.onfinish = null;
      this.transition.cancel();
      this.transition = undefined;
    }
    this.active = index;
    this.tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    if (!outgoing || this.motion.matches || document.hidden || !this.visible) {
      this.settle();
      return;
    }
    const incoming = this.panels[index];
    const enter = () => {
      this.settle();
      const animation = incoming.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 400,
        easing: 'ease-in-out',
      });
      this.transition = animation;
      animation.onfinish = () => this.settle();
    };
    if (outgoing === incoming) {
      enter();
      return;
    }
    const animation = outgoing.animate([{ opacity }, { opacity: 0 }], {
      duration: 400,
      easing: 'ease-in-out',
      fill: 'forwards',
    });
    this.transition = animation;
    animation.onfinish = enter;
  }
  private sync = () => {
    clearInterval(this.timer);
    if (this.motion.matches || document.hidden || !this.visible) this.settle();
    if (
      !this.isConnected ||
      this.manual ||
      this.hovered ||
      !this.visible ||
      document.hidden ||
      this.motion.matches ||
      this.contains(document.activeElement)
    )
      return;
    this.timer = setInterval(() => this.select((this.active + 1) % 4), 2000);
  };
}
