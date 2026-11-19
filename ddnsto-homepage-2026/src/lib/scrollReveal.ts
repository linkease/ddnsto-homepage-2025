/** Progressive enhancement: content remains visible without scripts or animation support. */
export function setupScrollReveal() {
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new WeakSet<Element>();
  const running = new Map<HTMLElement, Animation>();
  const targets = document.querySelectorAll<HTMLElement>(
    '#scenarios .section-head, .scenario-workspace, #devices .section-head, .device-layout, .si-options, #pricing .section-head, .binding-rule, .package-card, .feature-heading, .feature-card, #manual-workflow, #faq .section-head, .faq-controls, #faqs, .footer-grid',
  );
  const cancel = (element: HTMLElement) => {
    running.get(element)?.cancel();
    running.delete(element);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        if (seen.has(element)) continue;
        seen.add(element);
        if (
          media.matches ||
          document.hidden ||
          element.contains(document.activeElement)
        )
          continue;
        const cards = element.matches('.package-card, .feature-card')
          ? [...element.parentElement!.children]
          : [];
        const animation = element.animate(
          [
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: 500,
            delay: Math.max(0, cards.indexOf(element)) * 80,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'backwards',
          },
        );
        running.set(element, animation);
        animation.onfinish = () => cancel(element);
      }
    },
    { threshold: 0 },
  );
  const observe = () => {
    for (const element of targets) {
      if (seen.has(element)) continue;
      const bounds = element.getBoundingClientRect();
      // Do not animate content already visible after initial navigation or scroll restoration.
      if (bounds.top < innerHeight && bounds.bottom > 0) seen.add(element);
      else observer.observe(element);
    }
  };
  const cancelAll = () => {
    for (const element of running.keys()) cancel(element);
  };
  media.addEventListener('change', () => {
    if (media.matches) cancelAll();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAll();
  });
  document.addEventListener('focusin', (event) => {
    for (const element of running.keys()) {
      if (element.contains(event.target as Node)) cancel(element);
    }
  });
  addEventListener('pagehide', () => {
    observer.disconnect();
    cancelAll();
  });
  addEventListener('pageshow', () => requestAnimationFrame(observe));
  if (document.readyState === 'complete') requestAnimationFrame(observe);
}
