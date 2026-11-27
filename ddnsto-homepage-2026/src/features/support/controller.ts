export class SupportHub extends HTMLElement {
  private abort?: AbortController;
  private observer?: IntersectionObserver;
  private active: HTMLDialogElement | null = null;
  private returnFocus: HTMLElement | null = null;
  private visible = true;
  private highlightTimer?: ReturnType<typeof setTimeout>;
  private planScrollFrame = 0;
  private hideTimer?: ReturnType<typeof setTimeout>;
  connectedCallback() {
    this.abort?.abort();
    this.abort = new AbortController();
    const { signal } = this.abort;
    document.addEventListener('click', this.onClick, { signal });
    document.addEventListener('keydown', this.onKey, { signal });
    if (location.hash === '#advanced-plan') this.highlightPlan();
    const toggle = this.querySelector<HTMLElement>('#tcp-gift-toggle');
    for (const region of this.querySelectorAll<HTMLElement>(
      '.tcp-gift, #tcp-gift-offer',
    )) {
      region.addEventListener(
        'pointerenter',
        (event) => {
          if (event.pointerType === 'touch') return;
          clearTimeout(this.hideTimer);
          if (toggle && (!this.active || this.active.id === 'tcp-gift-offer'))
            this.open('tcp-gift-offer', toggle, false);
        },
        { signal },
      );
      region.addEventListener(
        'pointerleave',
        () => {
          this.hideTimer = setTimeout(() => {
            if (
              this.active?.id === 'tcp-gift-offer' &&
              !this.active.contains(document.activeElement)
            )
              this.close(false);
          }, 160);
        },
        { signal },
      );
    }
    document.addEventListener(
      'pointerdown',
      (event) => {
        const target = event.target as Element;
        if (
          this.active &&
          !this.active.contains(target) &&
          !target.closest('[data-offer], [data-customer]')
        )
          this.close(false);
      },
      { signal },
    );
    document.addEventListener('visibilitychange', this.syncMotion, { signal });
    this.querySelectorAll('dialog').forEach((dialog) => {
      dialog.addEventListener('close', () => this.restore(dialog), { signal });
      dialog.addEventListener(
        'cancel',
        (event) => {
          event.preventDefault();
          this.close();
        },
        { signal },
      );
    });
    this.observer = new IntersectionObserver((entries) => {
      this.visible = entries[0].isIntersecting;
      this.syncMotion();
    });
    this.observer.observe(this.querySelector('.puppy')!);
    this.syncMotion();
  }
  disconnectedCallback() {
    cancelAnimationFrame(this.planScrollFrame);
    clearTimeout(this.hideTimer);
    this.close();
    clearTimeout(this.highlightTimer);
    this.abort?.abort();
    this.observer?.disconnect();
  }
  private syncMotion = () => {
    this.toggleAttribute(
      'data-motion-paused',
      document.hidden || !this.visible,
    );
  };
  private open(id: string, trigger: HTMLElement, focus = true) {
    clearTimeout(this.hideTimer);
    if (this.active?.id === id) {
      if (focus) {
        this.returnFocus = trigger;
        this.active.querySelector<HTMLElement>('h2')?.focus();
      }
      return;
    }
    if (this.active) this.close(false);
    const dialog = this.querySelector<HTMLDialogElement>(`#${id}`);
    if (!dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    this.active = dialog;
    this.returnFocus = focus ? trigger : null;
    dialog.show();
    if (focus) dialog.querySelector<HTMLElement>('h2')?.focus();
    else {
      if (dialog.contains(document.activeElement))
        (document.activeElement as HTMLElement).blur();
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    }
    const isOffer = id === 'tcp-gift-offer';
    this.querySelector('.tcp-gift')?.classList.toggle('is-open', isOffer);
    this.querySelector('#tcp-gift-toggle')?.setAttribute(
      'aria-expanded',
      String(isOffer),
    );
  }
  private close(restore = true) {
    clearTimeout(this.hideTimer);
    const dialog = this.active;
    if (!dialog) return;
    if (!restore) this.returnFocus = null;
    dialog.close();
    this.restore(dialog);
  }
  private restore(dialog: HTMLDialogElement) {
    if (dialog !== this.active) return;
    this.active = null;
    this.querySelector('.tcp-gift')?.classList.remove('is-open');
    this.querySelector('#tcp-gift-toggle')?.setAttribute(
      'aria-expanded',
      'false',
    );
    const trigger = this.returnFocus;
    this.returnFocus = null;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }
  private onClick = (event: MouseEvent) => {
    const el = (event.target as Element).closest<HTMLElement>('button,a');
    if (!el) return;
    if (el.hasAttribute('data-customer')) {
      event.preventDefault();
      this.open('customer-panel', el);
    } else if (el.hasAttribute('data-offer')) {
      this.open('tcp-gift-offer', el);
    } else if (el.hasAttribute('data-support-close')) this.close();
    else if (el.hasAttribute('data-offer-plan')) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      const plan = document.getElementById('advanced-plan');
      this.close(false);
      // Guide pages keep their native navigation back to the homepage.
      if (!plan) return;
      event.preventDefault();
      if (location.hash !== '#advanced-plan')
        history.pushState(history.state, '', '#advanced-plan');
      this.highlightPlan();
      // Replace any in-flight smooth scroll. A fragment navigation also emits
      // popstate, which unnecessarily resets the installation panel above us.
      cancelAnimationFrame(this.planScrollFrame);
      window.scrollTo({ top: window.scrollY, behavior: 'instant' });
      // Start the new scroll after cancellation, not alongside the old one.
      this.planScrollFrame = requestAnimationFrame(() => {
        this.planScrollFrame = 0;
        if (!this.isConnected || location.hash !== '#advanced-plan') return;
        const offset = parseFloat(getComputedStyle(plan).scrollMarginTop) || 0;
        window.scrollTo({
          top: window.scrollY + plan.getBoundingClientRect().top - offset,
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
        });
      });
    }
  };
  private highlightPlan = () => {
    const heading = document.querySelector<HTMLElement>('#advanced-plan');
    if (heading) {
      const markers = document.querySelectorAll<HTMLElement>(
        '#advanced-plan .pricing-flash-ring, #advanced-plan .pricing-target-label',
      );
      clearTimeout(this.highlightTimer);
      markers.forEach((n) => {
        n.hidden = false;
        n.getAnimations().forEach((a) => {
          a.currentTime = 0;
          a.play();
        });
      });
      this.highlightTimer = setTimeout(
        () => markers.forEach((n) => (n.hidden = true)),
        3600,
      );
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  };
  private onKey = (event: KeyboardEvent) => {
    if (!this.active) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
  };
}
