export class SupportHub extends HTMLElement {
  private abort?: AbortController;
  private observer?: IntersectionObserver;
  private active: HTMLDialogElement | null = null;
  private returnFocus: HTMLElement | null = null;
  private visible = true;
  private hideTimer?: ReturnType<typeof setTimeout>;
  connectedCallback() {
    this.abort?.abort();
    this.abort = new AbortController();
    const { signal } = this.abort;
    document.addEventListener('click', this.onClick, { signal });
    document.addEventListener('keydown', this.onKey, { signal });
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
          this.active?.id !== 'help-dialog' &&
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
    clearTimeout(this.hideTimer);
    this.close();
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
    const modal = id === 'help-dialog';
    if (!modal) dialog.show();
    else if (typeof dialog.showModal === 'function') dialog.showModal();
    else {
      dialog.setAttribute('open', '');
      dialog.setAttribute('aria-modal', 'true');
      dialog.dataset.fallback = 'true';
    }
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
    if (dialog.dataset.fallback) {
      dialog.removeAttribute('open');
      delete dialog.dataset.fallback;
      this.restore(dialog);
    } else {
      dialog.close();
      this.restore(dialog);
    }
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
    } else if (el.hasAttribute('data-help')) {
      event.preventDefault();
      this.open('help-dialog', el);
    } else if (el.hasAttribute('data-offer')) {
      this.open('tcp-gift-offer', el);
    } else if (el.hasAttribute('data-support-close')) this.close();
    else if (el.hasAttribute('data-help-faq')) {
      this.close(false);
      const search = document.querySelector<HTMLInputElement>('#faq-search');
      if (search) {
        location.hash = 'faq';
        search.focus();
      } else location.assign('/#faq');
    } else if (el.hasAttribute('data-offer-console')) {
      this.close(false);
    } else if (el.hasAttribute('data-offer-plan')) {
      this.close(false);
      const heading = document.querySelector<HTMLElement>('#advanced-plan h3');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  };
  private onKey = (event: KeyboardEvent) => {
    if (!this.active) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab' || this.active.id !== 'help-dialog') return;
    const items = [
      ...this.active.querySelectorAll<HTMLElement>(
        'button,a[href],input,summary,[tabindex="0"]',
      ),
    ].filter((n) => n.getClientRects().length && !n.hasAttribute('disabled'));
    const first = items[0],
      last = items.at(-1),
      focused = document.activeElement;
    if (
      event.shiftKey &&
      (focused === first || !items.includes(focused as HTMLElement))
    ) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      (focused === last || !items.includes(focused as HTMLElement))
    ) {
      event.preventDefault();
      first?.focus();
    }
  };
}
