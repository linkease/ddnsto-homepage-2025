import React from 'react';
/* global process -- Build-time exclusion matches the existing debug install route. */
import { notFound } from 'next/navigation.js';

export const metadata = {
    title: '安装调试工具 · Installer tools',
    robots: { index: false, follow: false },
};

export default async function Page() {
    if (process.env.NODE_ENV === 'development') {
        const { default: InstallToolsPage } = await import('../../../install/InstallToolsPage');
        return <InstallToolsPage />;
    }
    notFound();
}
