type Section = 'navbar_desktop' | 'navbar_mobile' | 'hero' | 'intent_nav';
type Gtag = (
  command: 'event',
  name: string,
  params: Record<string, string>,
) => void;

export function trackConsoleClick(section: Section) {
  if (
    typeof window === 'undefined' ||
    document.documentElement.dataset.analyticsEnabled !== 'true'
  )
    return;
  const events: { name: string; params: Record<string, string> }[] = [
    {
      name: section === 'hero' ? 'click_free_use' : 'click_login_console',
      params: { section, language: 'zh' },
    },
    {
      name: 'ddnsto_outbound_click',
      params: { send_to: 'G-1QGR1XG068', source: 'website', type: 'console' },
    },
  ];
  for (const event of events) {
    try {
      const gtag = (window as Window & { gtag?: Gtag }).gtag;
      if (typeof gtag === 'function') gtag('event', event.name, event.params);
    } catch {
      // Statistics must never interrupt native navigation or menu closing.
    }
  }
}
