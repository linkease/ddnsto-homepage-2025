'use client';
import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CommandPanel from './CommandPanel';
import ServiceHelp from './ServiceHelp';

const testedBase = 'https://web.toany.net/ddnsto-install/0.2.1/20261103-a80245f87de8';
const targets = ['linux', 'openwrt', 'macos', 'windows', 'synology', 'docker'];

function Tools() {
    const { language } = useLanguage();
    const zh = language === 'zh';
    const [platform, setPlatform] = useState('linux');
    return <main className="mx-auto max-w-4xl px-5 pb-20 pt-32 sm:px-8">
        <a href="/install" className="text-sm text-brand-accent underline underline-offset-4">{zh ? '← 返回添加设备入口' : '← Back to onboarding'}</a>
        <p className="mt-8 font-mono text-xs tracking-widest text-brand-accent">DEVELOPMENT / INSTALLER TOOLS</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{zh ? '安装调试工具' : 'Installer tools'}</h1>
        <p className="mt-4 text-sm leading-7 text-gray-400">{zh ? '面向开发、测试和故障排查。页面只生成命令，不会操作当前设备；普通安装请使用控制台“添加设备”。Token 只在目标终端输入，不从控制台传入。' : 'For development, testing and troubleshooting. This page only generates commands; it does not operate devices. Use the console for normal installation. Enter Tokens on the target terminal only.'}</p>
        <p className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">{zh ? 'stop 会中断连接，configure 会更改配置，repair 会修复服务，uninstall 会移除托管安装。执行前确认目标机器、权限和安装归属；远程维护可能导致失联。' : 'stop interrupts connectivity; configure changes settings; repair repairs the service; uninstall removes the managed installation. Verify the target, permissions and ownership. Remote maintenance may disconnect you.'}</p>
        <details className="mt-6 rounded-xl border border-white/10 p-4 text-sm text-gray-300">
            <summary className="cursor-pointer">{zh ? '当前测试发布与适用范围' : 'Current test release and scope'}</summary>
            <p className="mt-3 break-all font-mono text-xs">{testedBase}</p>
            <p className="mt-3 leading-6">{zh ? '安装器 0.2.1：Linux/OpenWrt/Windows/macOS 4.2.8；群晖 4.2.8-7 仅下载并手动安装；Docker 仍固定 4.2.6。测试入口已回读核验，不代表所有平台已完成真机验收。旧 0.1.10 入口仅供历史兼容对照。' : 'Installer 0.2.1: Linux/OpenWrt/Windows/macOS 4.2.8; Synology 4.2.8-7 download/manual install; Docker pinned to 4.2.6. Verified test files do not imply native acceptance on every platform. The older 0.1.10 entry is for compatibility comparisons.'}</p>
            <a href={`${testedBase}/SHA256SUMS`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-brand-accent underline">SHA256SUMS</a>
        </details>
        <label className="mt-6 block text-sm text-gray-300" htmlFor="tools-platform">{zh ? '目标设备平台' : 'Target platform'}
            <select id="tools-platform" value={platform} onChange={event => setPlatform(event.target.value)} className="mt-2 block w-full rounded-lg border border-white/20 bg-brand-dark p-3 text-white">
                {targets.map(target => <option key={target} value={target}>{target}</option>)}
            </select>
        </label>
        <div className="mt-6 space-y-5">
            <CommandPanel key={platform} platform={platform} initialSource="candidate" initialBase={testedBase} initialMethod={platform === 'docker' ? 'docker' : platform === 'synology' ? 'auto' : 'native'} />
            {['linux', 'openwrt', 'macos', 'windows'].includes(platform) && <ServiceHelp key={`help-${platform}`} platform={platform} />}
        </div>
    </main>;
}

export default function InstallToolsPage() {
    return <LanguageProvider><div className="min-h-screen bg-brand-dark font-sans text-white"><Navbar /><Tools /><Footer /></div></LanguageProvider>;
}
