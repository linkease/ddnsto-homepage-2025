import './globals.css';

export const metadata = {
  title: 'DDNSTO',
  description: 'DDNS management homepage',
  icons: {
    icon: '/favicon.svg',
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
