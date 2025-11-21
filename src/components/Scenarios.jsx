import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Home, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const SCENARIO_ORDER = ['nas', 'it', 'home'];

const Scenarios = () => {
    const { t } = useLanguage();

    const scenarios = useMemo(() => ([
        {
            id: 'nas',
            label: t('scenarios.nas_label'),
            icon: Database,
            title: t('scenarios.nas_title'),
            description: t('scenarios.nas_desc'),
            features: ['Photo Backup', 'File Management', 'Media Streaming'],
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'it',
            label: t('scenarios.it_label'),
            icon: Terminal,
            title: t('scenarios.it_title'),
            description: t('scenarios.it_desc'),
            features: ['SSH Access', 'RDP/VNC', 'Internal Web Apps'],
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: 'home',
            label: t('scenarios.home_label'),
            icon: Home,
            title: t('scenarios.home_title'),
            description: t('scenarios.home_desc'),
            features: ['Home Assistant', 'Router Admin', 'IoT Dashboard'],
            color: 'from-green-500 to-emerald-500'
        }
    ]), [t]);

    const [activeTab, setActiveTab] = useState(SCENARIO_ORDER[0]);
    const [userInteracted, setUserInteracted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const activeScenario = scenarios.find(s => s.id === activeTab) || scenarios[0];

    useEffect(() => {
        if (userInteracted || isHovered) return;

        const interval = setInterval(() => {
            setActiveTab((prev) => {
                const currentIndex = SCENARIO_ORDER.indexOf(prev);
                const nextIndex = (currentIndex + 1) % SCENARIO_ORDER.length;
                return SCENARIO_ORDER[nextIndex];
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [userInteracted, isHovered]);

    const handleTabClick = (scenarioId) => {
        setActiveTab(scenarioId);
        setUserInteracted(true);
    };

    return (
        <section id="scenarios" className="py-24 bg-brand-dark relative">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        {t('scenarios.title_1')} <span className="text-brand-secondary">{t('scenarios.title_2')}</span>
                    </h2>
                    <p className="text-gray-400">
                        {t('scenarios.subtitle')}
                    </p>
                </div>

                <div
                    className="flex flex-col lg:flex-row gap-12 items-start"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Tabs Navigation */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        {scenarios.map((scenario) => (
                            <button
                                key={scenario.id}
                                onClick={() => handleTabClick(scenario.id)}
                                className={`group relative p-6 rounded-xl text-left transition-all duration-300 border ${activeTab === scenario.id
                                    ? 'bg-white/5 border-brand-primary/50'
                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                    }`}
                            >
                                {activeTab === scenario.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${scenario.color} bg-opacity-20`}>
                                        <scenario.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${activeTab === scenario.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                            {scenario.label}
                                        </h3>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="w-full lg:w-2/3 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeScenario.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="relative h-full rounded-2xl bg-brand-surface border border-white/10 p-8 md:p-12 overflow-hidden"
                            >
                                {/* Background Gradient */}
                                <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${activeScenario.color} opacity-10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2`} />

                                <div className="relative z-10">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-mono mb-6 text-gray-300`}>
                                        <activeScenario.icon className="w-4 h-4" />
                                        {activeScenario.id === 'nas' && t('scenarios.nas_mode')}
                                        {activeScenario.id === 'it' && t('scenarios.it_mode')}
                                        {activeScenario.id === 'home' && t('scenarios.home_mode')}
                                    </div>

                                    <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                                        {activeScenario.title}
                                    </h3>

                                    <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                        {activeScenario.description}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {activeScenario.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-black/20 border border-white/5">
                                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeScenario.color}`} />
                                                <span className="font-medium text-gray-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mock UI Element */}
                                    <div className="mt-12 rounded-lg border border-white/5 overflow-hidden bg-black/40 shadow-2xl">
                                        {/* Window Controls */}
                                        <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                            <div className="ml-4 text-xs text-gray-500 font-mono flex-1 text-center">
                                                {activeScenario.id === 'nas' && 'File Station'}
                                                {activeScenario.id === 'it' && 'root@server:~'}
                                                {activeScenario.id === 'home' && 'Home Assistant'}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 min-h-[200px] flex flex-col justify-center">
                                            {activeScenario.id === 'nas' && (
                                                <div className="grid grid-cols-4 gap-4">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div key={i} className="aspect-square rounded-lg bg-white/5 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                                                            <div className="w-8 h-8 rounded bg-blue-500/20" />
                                                            <div className="w-12 h-2 rounded bg-gray-700" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {activeScenario.id === 'it' && (
                                                <div className="font-mono text-sm text-gray-400 space-y-2">
                                                    <p>$ ssh root@remote-server</p>
                                                    <p className="text-green-400">✓ Authenticated via DDNSTO-tunnel</p>
                                                    <p>$ htop</p>
                                                    <div className="mt-2 p-2 bg-white/5 rounded">
                                                        <div className="flex justify-between text-xs text-gray-500"><span>PID</span><span>USER</span><span>CPU%</span><span>MEM%</span></div>
                                                        <div className="flex justify-between text-xs text-green-400"><span>1284</span><span>root</span><span>2.4</span><span>1.8</span></div>
                                                        <div className="flex justify-between text-xs text-white"><span>1342</span><span>www</span><span>0.8</span><span>4.2</span></div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeScenario.id === 'home' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
                                                        <span className="text-orange-200">Living Room</span>
                                                        <div className="w-8 h-4 rounded-full bg-orange-500/50 relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" /></div>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                                                        <span className="text-blue-200">Temperature</span>
                                                        <span className="text-xl font-bold text-white">24°C</span>
                                                    </div>
                                                    <div className="col-span-2 p-4 rounded-xl bg-white/5 flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">⚡</div>
                                                        <div>
                                                            <div className="text-sm text-gray-400">Energy Usage</div>
                                                            <div className="text-lg font-bold text-white">1.2 kW</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default Scenarios;
