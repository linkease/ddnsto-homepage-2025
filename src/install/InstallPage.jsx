'use client';
import React from 'react';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
function ConsoleHandoff() {
    const { language } = useLanguage();
    const zh = language === 'zh';
    return <main className="mx-auto min-h-[70vh] max-w-3xl px-6 pb-20 pt-40">
        <p className="text-sm text-brand-accent">{zh ? '测试环境' : 'Test environment'}</p>
        <h1 className="mt-4 text-4xl font-semibold">{zh ? '前往控制台添加设备' : 'Add your device in the console'}</h1>
        <p className="mt-6 leading-8 text-gray-400">{zh ? '一键安装已移入控制台的“添加设备”。登录后选择设备平台，复制包含账号 Token 的安装命令，在目标设备执行，再返回控制台确认上线。' : 'One-click installation now lives in Add device. Sign in, select a platform, copy the command with your account Token, run it on the target device, then return to confirm it is online.'}</p>
        <a className="mt-8 inline-block rounded-xl bg-brand-accent px-6 py-4 font-semibold text-brand-dark" href="https://web.toany.net:9445/app/#/workbench?action=install-device">{zh ? '打开测试控制台 · 添加设备' : 'Open test console · Add device'}</a>
        <p className="mt-4 text-sm text-gray-500">{zh ? '正式官网与正式控制台仍保留原来的安装入口。' : 'Production keeps the existing installation flow.'}</p>
        <div className="mt-10 border-t border-white/10 pt-6">
            <a href="/install/debug" className="text-brand-accent underline underline-offset-4">{zh ? '安装调试工具（开发环境）' : 'Installer tools (development only)'}</a>
            <p className="mt-3 text-sm leading-6 text-gray-400">{zh ? '查看脚本来源和测试地址，生成启停、修复、配置和卸载命令。与普通添加设备流程分开，操作前请确认目标设备。' : 'Inspect sources and test URLs; generate service, repair, configuration and uninstall commands separately from onboarding.'}</p>
        </div>
    </main>;
}
export default function InstallPage() {
    return <LanguageProvider><div className="min-h-screen bg-brand-dark font-sans text-white"><Navbar /><ConsoleHandoff /><Footer /></div></LanguageProvider>;
}
