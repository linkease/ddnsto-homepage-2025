/** Restore manual reload positions after WebKit restores the history entry. */
export function preserveReloadScroll() {
  const key = '__ddnstoReloadScroll';
  window.addEventListener(
    'pageshow',
    (event) => {
      const navigation = performance.getEntriesByType('navigation')[0] as
        PerformanceNavigationTiming | undefined;
      const saved = history.state?.[key];
      if (
        event.persisted ||
        navigation?.type !== 'reload' ||
        saved?.url !== location.href ||
        !Number.isFinite(saved.x) ||
        !Number.isFinite(saved.y)
      )
        return;
      // WebKit can apply its fragment scroll in the first frame after pageshow.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          scrollTo({ left: saved.x, top: saved.y, behavior: 'instant' });
        }),
      );
    },
    { once: true },
  );
  window.addEventListener('pagehide', () => {
    try {
      history.replaceState(
        {
          ...history.state,
          [key]: {
            url: location.href,
            x: scrollX,
            y: scrollY,
          },
        },
        '',
      );
    } catch {
      // Keep native restoration if state writes are unavailable.
    }
  });
}
