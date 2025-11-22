import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe, Lock, Router, Wifi, LayoutGrid, Box, Server, HardDrive, Terminal, Monitor, Layers } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { guides } from '../guides';
import { markdownToHtml } from '../utils/markdown';

const systems = [
    { id: "openwrt", name: "OpenWrt", icon: Router },
    { id: "asusgo", name: "ASUSGO", icon: Wifi },
    { id: "istoreos", name: "iStoreOS", icon: LayoutGrid },
    { id: "docker", name: "Docker", icon: Box },
    { id: "synology", name: "Synology", icon: Server },
    { id: "qnap", name: "QNAP", icon: HardDrive },
    { id: "linux", name: "Linux", icon: Terminal },
    { id: "macos", name: "macOS", icon: Monitor },
    { id: "windows", name: "Windows", icon: Monitor },
    { id: "unraid", name: "Unraid", icon: Layers },
    { id: "others", name: "其他", icon: Globe },
];

const Hero = () => {
    const { t, language } = useLanguage();
    const [selectedPlatform, setSelectedPlatform] = useState(systems[0]);
    const [userInteracted, setUserInteracted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isGuideHovered, setIsGuideHovered] = useState(false);

    const currentGuide = guides[selectedPlatform.id] || {};
    const guideUrl = currentGuide.url || "https://doc.linkease.com/zh/guide/ddnsto/";
    const guideText = currentGuide[language] || "Guide not available.";
    const guideHtml = markdownToHtml(guideText);

    useEffect(() => {
        if (userInteracted || isGuideHovered) return;

        const interval = setInterval(() => {
            setSelectedPlatform((prev) => {
                const currentIndex = systems.findIndex((sys) => sys.id === prev.id);
                const nextIndex = (currentIndex + 1) % systems.length;
                return systems[nextIndex];
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [userInteracted, isGuideHovered]);

    const handlePlatformClick = (sys) => {
        setSelectedPlatform(sys);
        setUserInteracted(true);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-dark pt-32 pb-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-secondary/20 rounded-full blur-[100px] opacity-20" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >


                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        {t('hero.title_1')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary text-glow">
                            {t('hero.title_2')}
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t('hero.subtitle_1')} <span className="text-white font-semibold">{t('hero.subtitle_2')}</span>
                        <br />
                        {t('hero.description')}
                    </p>

                    {/* Domain Visualization */}
                    <div className="max-w-md mx-auto mb-12 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-brand-surface border border-white/10 rounded-xl p-4 flex items-center gap-3 shadow-2xl">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="flex-1 bg-black/50 rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-mono text-gray-400">
                                <Lock className="w-3 h-3 text-brand-accent" />
                                <span className="text-gray-500">https://</span>
                                <span className="text-white flex items-center gap-0.5">
                                    myrouter<span className="text-brand-primary">.ddnsto.com</span>
                                </span>
                            </div>
                            <Globe className="w-4 h-4 text-brand-primary animate-pulse" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://doc.linkease.com/zh/guide/ddnsto/start.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative px-8 py-4 bg-brand-primary text-brand-dark font-bold rounded-lg overflow-hidden transition-all hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center gap-2">
                                {t('hero.cta')} <ArrowRight className="w-5 h-5" />
                            </span>
                        </a>
                    </div>

                    {/* Supported Systems Marquee */}
                    <div className="mt-20 pt-10 border-t border-white/5 relative">
                        <a
                            href="https://doc.linkease.com/zh/guide/ddnsto/support.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm text-gray-500 mb-6 font-mono uppercase tracking-widest hover:text-brand-primary transition-colors"
                        >
                            {t('hero.trusted')}
                        </a>

                        {/* Marquee Container */}
                        <div
                            className="relative flex overflow-hidden cursor-pointer"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            <div className="flex animate-marquee whitespace-nowrap gap-12" style={{ animationPlayState: isPaused ? 'paused' : 'running' }}>
                                {[...systems, ...systems].map((sys, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handlePlatformClick(sys)}
                                        className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand-primary/50 transition-all"
                                    >
                                        <sys.icon className="w-5 h-5 text-brand-primary" />
                                        <span className="text-lg font-bold font-display text-gray-300">
                                            {sys.name}
                                        </span>
                                    </div>
                                ))}
                                {/* Spacer to prevent sticking */}
                                <div className="w-0" />
                            </div>
                            <div className="absolute flex top-0 animate-marquee2 whitespace-nowrap gap-12" style={{ animationPlayState: isPaused ? 'paused' : 'running' }}>
                                {[...systems, ...systems].map((sys, idx) => (
                                    <div
                                        key={`clone-${idx}`}
                                        onClick={() => handlePlatformClick(sys)}
                                        className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand-primary/50 transition-all"
                                    >
                                        <sys.icon className="w-5 h-5 text-brand-primary" />
                                        <span className="text-lg font-bold font-display text-gray-300">
                                            {sys.name}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Fade Edges */}
                            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-brand-dark to-transparent pointer-events-none" />
                            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-brand-dark to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Installation Guide Panel */}
                    <div
                        className="mt-10 max-w-3xl mx-auto text-left"
                        onMouseEnter={() => setIsGuideHovered(true)}
                        onMouseLeave={() => setIsGuideHovered(false)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedPlatform.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                        <selectedPlatform.icon className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">{t('install_guide.title')}</p>
                                        <h3 className="text-2xl font-bold text-white">{selectedPlatform.name}</h3>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                            <a
                                href={guideUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-lg bg-brand-primary text-brand-dark font-bold text-center hover:bg-brand-primary/90 transition-colors"
                            >
                                {t('install_guide.btn_guide')}
                            </a>
                        </div>

                        <div className="bg-brand-surface border border-white/10 rounded-2xl p-6 shadow-2xl min-h-[160px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedPlatform.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-gray-300 leading-relaxed guide-markdown space-y-2"
                                    dangerouslySetInnerHTML={{ __html: guideHtml }}
                                />
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div >
        </section >
    );
};

export default Hero;
