export const trackEvent = (eventName, params = {}) => {
    if (typeof window === 'undefined') return;

    try {
        const gtag = window.gtag;
        if (typeof gtag !== 'function') return;

        gtag('event', eventName, {
            ...params,
            send_to: 'G-1QGR1XG068',
        });
    } catch {
        // Analytics failures must never interrupt navigation.
    }
};

export const trackDdnstoOutboundClick = (type) => {
    trackEvent('ddnsto_outbound_click', {
        source: 'website',
        type,
    });
};
