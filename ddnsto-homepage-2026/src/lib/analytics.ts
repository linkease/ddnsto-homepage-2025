export type AnalyticsEvent =
  | 'click_token_scan_open'
  | 'click_token_copy'
  | 'click_login_console'
  | 'click_purchase'
  | 'click_windows_download'
  | 'click_windows_scan_open'
  | 'click_windows_install_copy'
  | 'click_macos_linux_scan_open'
  | 'click_macos_linux_install_copy';
export type TokenPlatform =
  'fnos' | 'unraid' | 'terramaster' | 'zspace' | 'ugreen' | 'docker';
export type Section =
  | 'navbar_desktop'
  | 'navbar_mobile'
  | 'hero'
  | 'installation'
  | 'pricing'
  | 'support'
  | 'device_guide'
  | 'guide'
  | 'footer'
  | 'other';
type Params = {
  section: Section;
  plan?: 'free' | 'standard' | 'advanced' | 'unspecified';
  platform?: 'windows' | 'macos_linux' | TokenPlatform;
  method?: 'docker' | 'compose';
  command_variant?: 'primary' | 'wget' | 'download';
};

/** Best-effort telemetry only: callers never await or inspect the result. */
export function trackEvent(name: AnalyticsEvent, params: Params): void {
  try {
    if (
      typeof window === 'undefined' ||
      document.documentElement.dataset.analyticsEnabled !== 'true'
    )
      return;
    const payload = {
      send_to: 'G-1QGR1XG068',
      source: 'website',
      language: 'zh',
      ...params,
    };
    // Let the business handler and native browser action run first.
    window.setTimeout(() => {
      try {
        const gtag = (
          window as Window & { gtag?: (...args: unknown[]) => unknown }
        ).gtag;
        if (typeof gtag === 'function')
          void Promise.resolve(gtag('event', name, payload)).catch(() => {});
      } catch {
        /* Includes SDK getters and synchronous SDK errors. */
      }
    }, 0);
  } catch {
    /* Telemetry setup must never escape into business logic. */
  }
}

function sectionOf(link: HTMLAnchorElement): Section {
  if (link.closest('#menu-dialog')) return 'navbar_mobile';
  if (link.closest('.site-header')) return 'navbar_desktop';
  if (link.closest('.hero')) return 'hero';
  if (link.closest('#devices')) return 'installation';
  if (link.closest('#pricing')) return 'pricing';
  if (link.closest('support-hub')) return 'support';
  if (link.closest('footer')) return 'footer';
  if (location.pathname.startsWith('/devices/')) return 'device_guide';
  if (link.closest('.guide')) return 'guide';
  return 'other';
}
let installed = false;
export function installLinkAnalytics() {
  try {
    if (installed) return;
    installed = true;
    const onClick = (event: MouseEvent) => {
      try {
        if (event.type === 'auxclick' ? event.button !== 1 : event.button !== 0)
          return;
        const link =
          event.target instanceof Element
            ? event.target.closest<HTMLAnchorElement>('a[href]')
            : null;
        if (!link) return;
        const url = new URL(link.href);
        const section = sectionOf(link);
        if (
          ['web.ddnsto.com', 'www.ddnsto.com'].includes(url.hostname) &&
          /^\/app(?:\/|$)/.test(url.pathname)
        ) {
          const purchase =
            url.hash.startsWith('#/plans') &&
            new URLSearchParams(url.hash.split('?')[1]).get('entry') ===
              'purchase';
          if (purchase) {
            const id = link.dataset.purchasePlan;
            const plan =
              id === 'free' || id === 'standard' || id === 'advanced'
                ? id
                : 'unspecified';
            trackEvent('click_purchase', { section, plan });
          } else trackEvent('click_login_console', { section });
        } else if (
          url.hostname === 'fw.koolcenter.com' &&
          /^\/binary\/ddnsto\/(?:windows|pc)(?:\/|$)/.test(url.pathname)
        ) {
          trackEvent('click_windows_download', {
            section,
            platform: 'windows',
          });
        }
      } catch {
        /* Parsing or event inspection failures do not affect navigation. */
      }
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onClick, true);
  } catch {
    /* Optional listener setup. */
  }
}
