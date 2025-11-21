import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Terminal, Home, Database, Monitor } from 'lucide-react';

const scenarios = [
    {
        id: 'nas',
        label: 'NAS User',
        icon: Database,
        title: 'Access Your Private Cloud Anywhere',
        description: 'Whether it\'s Synology DSM, QNAP QTS, or Unraid, access your file server securely without exposing it to the public internet.',
        features: ['Photo Backup', 'File Management', 'Media Streaming'],
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'it',
        label: 'IT Engineer',
        icon: Terminal,
        title: 'Remote Maintenance Made Easy',
        description: 'Manage servers, SSH into remote machines, and access internal dashboards without complex VPN setups.',
        features: ['SSH Access', 'RDP/VNC', 'Internal Web Apps'],
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'home',
        label: 'Smart Home',
        icon: Home,
        title: 'Control Your Home Remotely',
        description: 'Access Home Assistant, Node-RED, or your router\'s admin panel securely from outside your home network.',
        features: ['Home Assistant', 'Router Admin', 'IoT Dashboard'],
        color: 'from-green-500 to-emerald-500'
    }
];

const Scenarios = () => {
    const [activeTab, setActiveTab] = useState(scenarios[0].id);
    const activeScenario = scenarios.find(s => s.id === activeTab);

    return (
        <section className="py-24 bg-brand-dark relative">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Built for <span className="text-brand-secondary">Everyone</span>
                    </h2>
                    <p className="text-gray-400">
                        From home users to professional engineers, ddnsto fits your workflow.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Tabs Navigation */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        {scenarios.map((scenario) => (
                            <button
                                key={scenario.id}
                                onClick={() => setActiveTab(scenario.id)}
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
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative h-full rounded-2xl bg-brand-surface border border-white/10 p-8 md:p-12 overflow-hidden"
                            >
                                {/* Background Gradient */}
                                <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${activeScenario.color} opacity-10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2`} />

                                <div className="relative z-10">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-mono mb-6 text-gray-300`}>
                                        <activeScenario.icon className="w-4 h-4" />
                                        {activeScenario.label} Mode
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
                                    <div className="mt-12 p-4 rounded-lg bg-black/40 border border-white/5 font-mono text-sm text-gray-400">
                                        <div className="flex gap-2 mb-4">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <p>$ connecting to <span className="text-brand-primary">{activeScenario.id}.ddnsto.com</span>...</p>
                                            <p className="text-green-400">✓ Connection established (TLS 1.3)</p>
                                            <p>$ Access granted. Welcome back.</p>
                                            <span className="animate-pulse">_</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Scenarios;
