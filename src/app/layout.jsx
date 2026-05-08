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
      <body>{children}</body>
    </html>
  );
}
