import React from 'react';
/* global process -- NODE_ENV is replaced by Next.js at build time. */
import { notFound } from 'next/navigation.js';

export const metadata = {
    title: '安装客户端 · Install client',
    description: '选择目标设备，获取固定版本安装命令或现有教程，在目标设备输入 Token 后到 DDNSTO 控制台确认在线。',
    alternates: { canonical: 'https://web.ddnsto.com/install' },
};

export default async function Page() {
    // Build-time gate: query strings, hostnames and browser storage cannot enable it.
    if (process.env.NODE_ENV === 'development') {
        const { default: InstallPage } = await import('../../install/InstallPage');
        return <InstallPage />;
    }
    notFound();
}
