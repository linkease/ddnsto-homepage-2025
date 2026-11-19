/** Local illustration only: no form submission, token storage, or network calls. */
export class ManualWorkflow extends HTMLElement {
  private abort?: AbortController;
  private observer?: IntersectionObserver;
  private timer?: ReturnType<typeof setTimeout>;
  private active = 0;
  private visible = false;
  private transitionTimer?: ReturnType<typeof setTimeout>;
  connectedCallback() {
    this.abort?.abort();
    this.observer?.disconnect();
    this.abort = new AbortController();
    const options = { signal: this.abort.signal };
    const details = this.closest('details')!;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      clearTimeout(this.timer);
      const paused =
        !details.open || !this.visible || document.hidden || media.matches;
      this.toggleAttribute('data-paused', paused);
      if (paused) this.finishTransition();
      if (!paused) {
        this.timer = setTimeout(() => {
          this.select((this.active + 1) % 3);
          sync();
        }, 3000);
      }
    };
    details.addEventListener('toggle', sync, options);
    document.addEventListener('visibilitychange', sync, options);
    media.addEventListener('change', sync, options);
    this.querySelectorAll<HTMLButtonElement>('[data-step]').forEach(
      (button, index) => {
        const select = () => {
          this.select(index);
          sync();
        };
        button.addEventListener('pointerenter', select, options);
        button.addEventListener('click', select, options);
        button.addEventListener('focus', select, options);
        button.addEventListener(
          'keydown',
          (event) => {
            const directions: Record<string, number> = {
              ArrowRight: 1,
              ArrowDown: 1,
              ArrowLeft: -1,
              ArrowUp: -1,
            };
            if (!(event.key in directions)) return;
            event.preventDefault();
            this.querySelectorAll<HTMLButtonElement>('[data-step]')[
              (index + directions[event.key] + 3) % 3
            ].focus();
          },
          options,
        );
      },
    );
    this.observer = new IntersectionObserver((entries) => {
      this.visible = entries[0].isIntersecting;
      sync();
    });
    this.observer.observe(this);
    sync();
  }
  private select(index: number) {
    if (this.active === index) return;
    const previous = this.active;
    this.finishTransition();
    this.active = index;
    this.dataset.active = String(index);
    this.querySelectorAll('[data-step]').forEach((button, i) =>
      button.setAttribute('aria-pressed', String(i === index)),
    );
    const animated =
      !matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !this.hasAttribute('data-paused');
    this.querySelectorAll<HTMLElement>('[data-scene]').forEach((scene, i) => {
      scene.hidden = i !== index && !(animated && i === previous);
      scene.toggleAttribute('data-leaving', animated && i === previous);
      scene.toggleAttribute('data-entering', animated && i === index);
    });
    if (animated)
      this.transitionTimer = setTimeout(() => this.finishTransition(), 450);
  }
  private finishTransition() {
    clearTimeout(this.transitionTimer);
    this.querySelectorAll<HTMLElement>('[data-scene]').forEach((scene, i) => {
      scene.hidden = i !== this.active;
      scene.removeAttribute('data-leaving');
      scene.removeAttribute('data-entering');
    });
  }
  disconnectedCallback() {
    this.finishTransition();
    clearTimeout(this.timer);
    this.abort?.abort();
    this.observer?.disconnect();
  }
}
