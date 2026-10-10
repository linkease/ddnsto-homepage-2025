import React from 'react';
import App from '../App';
import { homeStructuredData, site } from '../seo';

// Page-specific URLs must not be inherited by future routes or the 404 page.
export const metadata = {
  title: { absolute: site.name },
  alternates: { canonical: site.url },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [{ url: site.logo, width: 512, height: 512, alt: site.name }],
  },
  twitter: {
    card: 'summary',
    title: site.name,
    description: site.description,
    images: [{ url: site.logo, alt: site.name }],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeStructuredData).replace(/</g, '\\u003c'),
        }}
      />
      <App />
    </>
  );
}
