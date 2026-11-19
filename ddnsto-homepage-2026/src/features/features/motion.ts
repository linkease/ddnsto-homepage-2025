/** Visible decorative previews loop locally; pause offscreen and in the background. */
export class FeatureMotion extends HTMLElement {
  private observer?: IntersectionObserver;
  private abort?: AbortController;
  connectedCallback() {
    this.abort?.abort();
    this.observer?.disconnect();
    this.abort = new AbortController();
    const sync = () => this.toggleAttribute('data-background', document.hidden);
    document.addEventListener('visibilitychange', sync, {
      signal: this.abort.signal,
    });
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries)
        entry.target.toggleAttribute('data-visible', entry.isIntersecting);
    });
    this.querySelectorAll('.feature-card').forEach((card) =>
      this.observer!.observe(card),
    );
    sync();
  }
  disconnectedCallback() {
    this.abort?.abort();
    this.observer?.disconnect();
  }
}
