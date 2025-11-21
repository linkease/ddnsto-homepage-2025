import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Lock, Router, Wifi, LayoutGrid, Box, Server, HardDrive, Terminal, Monitor, Layers } from 'lucide-react';

const systems = [
    { name: "OpenWrt", icon: Router },
    { name: "ASUSGO", icon: Wifi },
    { name: "iStoreOS", icon: LayoutGrid },
    { name: "Docker", icon: Box },
    { name: "Synology", icon: Server },
    { name: "QNAP", icon: HardDrive },
    { name: "Linux", icon: Terminal },
    { name: "Windows", icon: Monitor },
    { name: "Unraid", icon: Layers },
];

const Hero = () => {
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
                        </span>
                        <span className="text-sm text-gray-300 font-mono">v4.0 Stable Release</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Remote Access, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary text-glow">
                            Redefined.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        No Public IP? No Port Forwarding? <span className="text-white font-semibold">No Problem.</span>
                        <br />
                        Securely access your NAS, Router, and Desktop from anywhere with a single link.
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
                                <span className="text-white">myrouter</span>
                                <span className="text-brand-primary">.ddnsto.com</span>
                            </div>
                            <Globe className="w-4 h-4 text-brand-primary animate-pulse" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="group relative px-8 py-4 bg-brand-primary text-brand-dark font-bold rounded-lg overflow-hidden transition-all hover:scale-105">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center gap-2">
                                Get Started Free <ArrowRight className="w-5 h-5" />
                            </span>
                        </button>
                    </div>

                    {/* Supported Systems Marquee */}
                    <div className="mt-20 pt-10 border-t border-white/5 relative">
                        <p className="text-sm text-gray-500 mb-6 font-mono uppercase tracking-widest">Trusted on any platform</p>

                        <div className="relative flex overflow-hidden group">
                            <div className="flex animate-marquee whitespace-nowrap gap-12 hover:[animation-play-state:paused]">
                                {[...systems, ...systems].map((sys, idx) => (
                                    <div key={idx} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors cursor-default">
                                        <sys.icon className="w-5 h-5 text-brand-primary" />
                                        <span className="text-lg font-bold font-display text-gray-300">
                                            {sys.name}
                                        </span>
                                    </div>
                                ))}
                                {/* Spacer to prevent sticking */}
                                <div className="w-0" />
                            </div>
                            <div className="absolute flex top-0 animate-marquee2 whitespace-nowrap gap-12 hover:[animation-play-state:paused]">
                                {[...systems, ...systems].map((sys, idx) => (
                                    <div key={`clone-${idx}`} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors cursor-default">
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
                </motion.div>
            </div >
        </section >
    );
};

export default Hero;
