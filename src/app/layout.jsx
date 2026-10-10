import React from 'react';
import './globals.css';
import { site } from '../seo';

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  icons: {
    icon: [
      { url: '/favicon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <script src="/script/analytics.js"></script>
        <script src="/script/google-analytics.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
