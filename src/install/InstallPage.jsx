'use client';

import React, { useSyncExternalStore } from 'react';
import { ArrowUpRight, Check, Monitor, BookOpen } from 'lucide-react';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { guides } from '../guides';
import { consoleUrl, installHref, platforms, platformFromSearch } from './installer.js';
import { installRelease } from './release.js';
import CommandPanel from './CommandPanel';
import ServiceHelp from './ServiceHelp';

const subscribePlatform = callback => {
    window.addEventListener('popstate', callback);
    return () => window.removeEventListener('popstate', callback);
};
const getPlatform = () => platformFromSearch(window.location.search);
const getServerPlatform = () => 'linux';
const selectPlatform = id => {
    window.history.replaceState(null, '', installHref(id));
    window.dispatchEvent(new PopStateEvent('popstate'));
};

const InstallFlow = () => {
    const { t, language } = useLanguage();
    const selected = useSyncExternalStore(subscribePlatform, getPlatform, getServerPlatform);
    const platform = platforms.find(item => item.id === selected);
    return (
        <main className="relative mx-auto max-w-6xl px-5 pb-20 pt-32 sm:px-8 sm:pt-40">
            <header className="mb-12 max-w-3xl">
                <p className="mb-5 font-mono text-xs tracking-[0.2em] text-brand-accent">{t('install.eyebrow')}</p>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">{t('install.title')}</h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">{t('install.subtitle')}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
                    <span className="rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1.5 text-brand-accent">{installRelease.ready ? t('install.candidate') : t('install.pending')}</span>
                    <span className="font-mono text-gray-400">{t('install.release')} {installRelease.version} / {installRelease.build}</span>
                </div>
                <p className="mt-3 text-xs leading-6 text-gray-500">{t('install.fixed')}</p>
            </header>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-10">
                <section data-install-step="1" aria-labelledby="target-title" className="min-w-0 rounded-3xl border border-white/10 bg-brand-surface/70 p-5 sm:p-6">
                    <p className="mb-4 font-mono text-sm text-brand-accent">01 /</p>
                    <h2 id="target-title" className="text-xl font-semibold">{t('install.target')}</h2>
                    <p className="mb-6 mt-3 text-sm leading-6 text-gray-400">{t('install.targetHint')}</p>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-label={t('install.target')}>
                        {platforms.map(item => <button type="button" key={item.id} data-platform={item.id} aria-pressed={selected === item.id} onClick={() => selectPlatform(item.id)}
                            className={`relative min-h-20 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${selected === item.id ? 'border-brand-accent/60 bg-brand-accent/10 text-white' : 'border-white/10 bg-white/[0.02] text-gray-300 hover:border-white/30'}`}>
                            {selected === item.id && <Check size={13} className="absolute right-2 top-2 text-brand-accent" aria-hidden="true" />}
                            <span className="block pr-2 text-sm font-semibold">{item.id === 'others' ? t('install.others') : item.name}</span>
                            <span className="mt-1.5 block text-[11px] text-gray-400">{t(item.script ? 'install.script' : 'install.tutorial')}</span>
                        </button>)}
                    </div>
                </section>

                <section data-install-step="2" aria-labelledby="command-title" className="min-w-0 space-y-5 py-1">
                    <div>
                        <p className="mb-4 font-mono text-sm text-brand-accent">02 / {platform.id === 'others' ? t('install.others') : platform.name}</p>
                        <h2 id="command-title" className="text-2xl font-semibold">{t(platform.script ? 'install.commandTitle' : 'install.tutorialTitle')}</h2>
                        <p className="mt-3 text-sm leading-7 text-gray-400">{t(platform.script ? 'install.commandHint' : 'install.tutorialHint')}</p>
                    </div>
                    {platform.script ? <>
                        <div className="border-l-2 border-amber-200/50 pl-4 text-sm leading-6 text-amber-100/80">{t(`install.evidence.${selected}`)}</div>
                        <p data-client-specs={selected} className="rounded-lg bg-white/5 px-4 py-3 text-xs leading-6 text-emerald-100">{t(`install.specs.${selected}`)}</p>
                        <p className="text-sm leading-6 text-gray-300">{t(`install.permission.${selected}`)}</p>
                        {/* A new platform gets a fresh copy state, including pending clipboard requests. */}
                        <CommandPanel key={selected} platform={selected} />
                        <div className="space-y-2 text-sm leading-6 text-gray-400">
                            <h3 className="font-semibold text-gray-200">{t('install.tokenTitle')}</h3>
                            <p>{t('install.token')}</p>
                            {selected === 'macos' && <p className="text-amber-100/80">{t('install.macToken')}</p>}
                            <a href={consoleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-accent underline underline-offset-4">{t('install.getToken')}<ArrowUpRight size={15} aria-hidden="true" /></a>
                        </div>
                        <ServiceHelp key={`help-${selected}`} platform={selected} />
                    </> : <><div className="rounded-2xl border border-white/10 bg-brand-surface p-6 sm:p-8">
                        <BookOpen className="mb-6 text-brand-accent" size={32} aria-hidden="true" />
                        <p className="mb-5 text-sm leading-7 text-amber-200">{language === 'zh' ? '已发布入口暂无已验证的一键安装执行器。请按平台教程手动操作；群晖套件下载完成后仍需在 DSM 套件中心安装，下载不代表安装完成。' : 'The published entry has no verified one-click executor. Follow the platform guide manually; a downloaded Synology package still requires installation in DSM Package Center. Downloading does not mean installation is complete.'}</p>
                        <a href={guides[selected].url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-3 text-sm font-bold text-brand-dark">{t('install.tutorialLink')}<ArrowUpRight size={17} aria-hidden="true" /></a>
                        <p className="mt-4 text-xs leading-6 text-gray-400">{t('install.chineseGuide')}</p>
                    </div>{['synology', 'docker'].includes(selected) && <CommandPanel key={selected} platform={selected} />}</>}
                </section>
            </div>

            <section data-install-step="3" aria-labelledby="confirm-title" className="mt-10 flex flex-col gap-6 rounded-3xl border border-brand-accent/20 bg-brand-accent/[0.04] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                    <p className="mb-4 font-mono text-sm text-brand-accent">03 /</p>
                    <h2 id="confirm-title" className="text-2xl font-semibold">{t('install.confirm')}</h2>
                    <p className="mt-3 text-sm leading-7 text-gray-400">{t('install.confirmHint')}</p>
                    <p className="mt-3 text-xs leading-6 text-gray-500">{t('install.verifyNote')}</p>
                </div>
                <a href={consoleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-4 text-sm font-bold text-brand-dark hover:bg-emerald-200"><Monitor size={17} aria-hidden="true" />{t('install.console')}<ArrowUpRight size={17} aria-hidden="true" /></a>
            </section>
        </main>
    );
};

const InstallPage = () => <LanguageProvider>
    <div className="min-h-screen bg-brand-dark font-sans text-white selection:bg-brand-accent/30">
        <Navbar />
        <InstallFlow />
        <Footer />
    </div>
</LanguageProvider>;

export default InstallPage;
