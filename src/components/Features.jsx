import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Monitor, Terminal, Folder, Lock, FileText, Image, Film, Cpu, Trash2, MousePointer2, Activity, Wifi } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FeatureCard = ({ icon: Icon, title, description, className, delay, visual }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className={`p-6 rounded-2xl bg-brand-surface border border-white/5 hover:border-brand-primary/30 transition-colors group ${className}`}
    >
        <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <p className="text-gray-400 leading-relaxed">{description}</p>
                </div>
            </div>
            <Lock className="w-5 h-5 text-brand-primary/60" />
        </div>
        <div className="relative rounded-xl border border-white/5 bg-black/30 p-4 overflow-hidden">
            {visual}
            <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-brand-primary/5 opacity-60" />
        </div>
    </motion.div>
);

const Features = () => {
    const { t } = useLanguage();

    return (
        <section id="features" className="py-24 px-6 relative overflow-hidden bg-brand-dark">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        {t('features.title_1')} <span className="text-brand-primary">{t('features.title_2')}</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        {t('features.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FeatureCard
                        icon={Globe}
                        title={t('features.card_1_title')}
                        description={t('features.card_1_desc')}
                        className="bg-gradient-to-br from-brand-surface to-brand-surface-highlight"
                        delay={0.1}
                        visual={
                            <div className="relative z-10 rounded-lg border border-white/10 bg-brand-surface shadow-inner overflow-hidden h-full flex flex-col">
                                {/* Browser Header */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                                    </div>
                                    <div className="flex-1 ml-3 flex items-center gap-2 rounded bg-black/20 px-3 py-1 border border-white/5">
                                        <Lock className="w-3 h-3 text-green-400" />
                                        <span className="text-[10px] text-gray-400">https://</span>
                                        <span className="text-[10px] text-white">myrouter.ddnsto.com</span>
                                    </div>
                                </div>
                                {/* Router UI */}
                                <div className="flex-1 flex bg-[#1a1b26] p-3 gap-3">
                                    {/* Sidebar */}
                                    <div className="w-12 bg-white/5 rounded-lg flex flex-col items-center py-3 gap-3 border border-white/5">
                                        <Activity className="w-5 h-5 text-brand-primary" />
                                        <Wifi className="w-5 h-5 text-gray-500" />
                                        <Globe className="w-5 h-5 text-gray-500" />
                                        <Terminal className="w-5 h-5 text-gray-500" />
                                    </div>
                                    {/* Main Content */}
                                    <div className="flex-1 grid grid-cols-2 gap-3 content-start">
                                        <div className="col-span-2 bg-white/5 p-3 rounded-lg border border-white/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-gray-300">System Status</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <div className="text-[9px] text-gray-500 mb-1">CPU Load</div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full w-[12%] bg-brand-primary rounded-full" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[9px] text-gray-500 mb-1">Memory</div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full w-[45%] bg-brand-secondary rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                            <div className="text-[9px] text-gray-500 mb-1">WAN IP</div>
                                            <div className="text-[10px] font-mono text-white">192.168.1.2</div>
                                            <div className="text-[9px] text-green-400 mt-1">Connected</div>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                            <div className="text-[9px] text-gray-500 mb-1">Wireless</div>
                                            <div className="text-[10px] font-mono text-white">DDNSTO_5G</div>
                                            <div className="text-[9px] text-blue-400 mt-1">5 Clients</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    />

                    <FeatureCard
                        icon={Monitor}
                        title={t('features.card_2_title')}
                        description={t('features.card_2_desc')}
                        className="bg-gradient-to-bl from-brand-surface to-brand-surface-highlight"
                        delay={0.2}
                        visual={
                            <div className="relative z-10 rounded-xl border border-white/10 bg-[#1e1e1e] shadow-2xl overflow-hidden h-48 flex flex-col">
                                {/* Desktop Area */}
                                <div className="flex-1 relative bg-[#0078d7] p-4">
                                    {/* Desktop Icons */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col items-center gap-1 w-12">
                                            <Monitor className="w-8 h-8 text-white drop-shadow-md" />
                                            <span className="text-[10px] text-white drop-shadow text-center leading-tight">This PC</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 w-12">
                                            <Trash2 className="w-8 h-8 text-white drop-shadow-md" />
                                            <span className="text-[10px] text-white drop-shadow text-center leading-tight">Recycle Bin</span>
                                        </div>
                                    </div>
                                    {/* Mouse Cursor */}
                                    <MousePointer2 className="absolute top-1/2 left-1/2 w-4 h-4 text-white drop-shadow-lg fill-black transform -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                {/* Taskbar */}
                                <div className="h-8 bg-[#101010] flex items-center px-3 gap-3 border-t border-white/5">
                                    <div className="flex items-center justify-center w-6 h-6 hover:bg-white/10 rounded-sm">
                                        <div className="grid grid-cols-2 gap-[1px]">
                                            <div className="w-1.5 h-1.5 bg-blue-400"></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400"></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400"></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1"></div>
                                    <div className="text-[10px] text-white font-mono">10:24 AM</div>
                                </div>
                            </div>
                        }
                    />

                    <FeatureCard
                        icon={Terminal}
                        title={t('features.card_3_title')}
                        description={t('features.card_3_desc')}
                        className="bg-gradient-to-tr from-brand-surface to-brand-surface-highlight"
                        delay={0.3}
                        visual={
                            <div className="relative z-10 font-mono text-xs text-gray-300 space-y-2">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <div className="w-2 h-2 rounded-full bg-brand-primary/80" />
                                    <span>ssh root@edge</span>
                                    <span className="text-green-400">✓ tunnel secured</span>
                                </div>
                                <div className="bg-black/50 rounded-lg border border-white/10 p-3 space-y-1">
                                    <p className="text-brand-primary">$ tail -f /var/log/access.log</p>
                                    <p>[03:12:09] GET /service/status 200</p>
                                    <p className="text-green-400">[03:12:11] sync completed</p>
                                    <p className="text-yellow-300">[03:12:14] warning: high load (0.82)</p>
                                    <p className="text-gray-400">[03:12:18] session alive 00:12:44</p>
                                </div>
                            </div>
                        }
                    />

                    <FeatureCard
                        icon={Folder}
                        title={t('features.card_4_title')}
                        description={t('features.card_4_desc')}
                        className="bg-gradient-to-tl from-brand-surface to-brand-surface-highlight"
                        delay={0.4}
                        visual={
                            <div className="relative z-10 rounded-xl border border-white/10 bg-brand-surface overflow-hidden shadow-inner h-full flex flex-col">
                                {/* Header */}
                                <div className="bg-white/5 px-4 py-2 flex items-center gap-3 border-b border-white/10 text-xs text-gray-300">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                                    </div>
                                    <span className="font-semibold text-white ml-2">File Manager</span>
                                </div>
                                {/* Content */}
                                <div className="flex-1 p-2">
                                    <div className="grid grid-cols-1 gap-1">
                                        {/* Header Row */}
                                        <div className="grid grid-cols-12 px-2 py-1 text-[10px] text-gray-500 border-b border-white/5 mb-1">
                                            <div className="col-span-6">Name</div>
                                            <div className="col-span-3">Type</div>
                                            <div className="col-span-3 text-right">Size</div>
                                        </div>
                                        {/* File Rows */}
                                        {[
                                            { name: 'Photos', type: 'Folder', icon: Folder, color: 'text-yellow-400', size: '-' },
                                            { name: 'Project.doc', type: 'Document', icon: FileText, color: 'text-blue-400', size: '2.4 MB' },
                                            { name: 'Holiday.mp4', type: 'Video', icon: Film, color: 'text-red-400', size: '1.2 GB' },
                                            { name: 'Setup.exe', type: 'Program', icon: Cpu, color: 'text-gray-400', size: '45 MB' },
                                            { name: 'Design.png', type: 'Image', icon: Image, color: 'text-purple-400', size: '3.1 MB' },
                                        ].map((file, idx) => (
                                            <div key={idx} className="grid grid-cols-12 items-center px-2 py-1.5 rounded hover:bg-white/5 group cursor-default">
                                                <div className="col-span-6 flex items-center gap-2">
                                                    <file.icon className={`w-3.5 h-3.5 ${file.color}`} />
                                                    <span className="text-[11px] text-gray-300 group-hover:text-white transition-colors">{file.name}</span>
                                                </div>
                                                <div className="col-span-3 text-[10px] text-gray-500">{file.type}</div>
                                                <div className="col-span-3 text-[10px] text-gray-500 text-right">{file.size}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Footer - Removed Speed */}
                                <div className="px-3 py-1 bg-black/20 border-t border-white/5 flex justify-between text-[10px] text-gray-500">
                                    <span>5 items</span>
                                    <span>Free space: 450 GB</span>
                                </div>
                            </div>
                        }
                    />
                </div>
            </div>
        </section>
    );
};

export default Features;
