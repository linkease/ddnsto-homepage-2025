import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-dark pt-20">
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

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="group relative px-8 py-4 bg-brand-primary text-brand-dark font-bold rounded-lg overflow-hidden transition-all hover:scale-105">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center gap-2">
                                Get Started Free <ArrowRight className="w-5 h-5" />
                            </span>
                        </button>

                        <button className="px-8 py-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white font-medium flex items-center gap-2">
                            <Zap className="w-5 h-5 text-brand-primary" />
                            View Live Demo
                        </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder for logos, using text for now */}
                        <span className="text-lg font-bold font-display">Synology</span>
                        <span className="text-lg font-bold font-display">QNAP</span>
                        <span className="text-lg font-bold font-display">Docker</span>
                        <span className="text-lg font-bold font-display">OpenWrt</span>
                        <span className="text-lg font-bold font-display">Unraid</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
