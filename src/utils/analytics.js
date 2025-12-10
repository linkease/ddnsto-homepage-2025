export const trackEvent = (eventName, params = {}) => {
    if (typeof window === 'undefined') return;

    const gtag = window.gtag;
    if (typeof gtag !== 'function') return;

    gtag('event', eventName, params);
};

