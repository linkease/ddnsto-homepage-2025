import React, { useState, useEffect } from 'react';
import { Download, Link, Globe, Lock, Check, MousePointer2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const CYCLE_DURATION = 3000; // 2.5s animation + 0.5s wait
const ANIMATION_DURATION = 2.5;

const Step1Diagram = ({ copy }) => {
    return (
        <div className="w-full max-w-md bg-[#1e1e1e] rounded-lg border border-white/10 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="ml-2 text-sm text-gray-400">{copy.clientTitle}</span>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">{copy.tokenLabel}</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono flex items-center h-[38px] overflow-hidden">
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2, delay: 0.2, repeat: Infinity, repeatDelay: CYCLE_DURATION / 1000 - 0.2 }}
                            >
                                ade32hnb-1481-3ks5-b446-ks6d313920ca
                            </motion.span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <motion.div
                            className="w-2 h-2 rounded-full"
                            animate={{ backgroundColor: ["#6b7280", "#22c55e", "#22c55e", "#22c55e"] }}
                            transition={{ times: [0, 0.6, 0.9, 1], duration: ANIMATION_DURATION, repeat: Infinity, repeatDelay: CYCLE_DURATION / 1000 - ANIMATION_DURATION }}
                        />
                        <div className="relative h-4 w-24">
                            <motion.span
                                className="absolute left-0 top-0 text-xs text-gray-500 whitespace-nowrap"
                                animate={{ opacity: [1, 0, 0, 0] }}
                                transition={{ times: [0, 0.5, 0.6, 1], duration: ANIMATION_DURATION, repeat: Infinity, repeatDelay: CYCLE_DURATION / 1000 - ANIMATION_DURATION }}
                            >
                                {copy.statusStopped}
                            </motion.span>
                            <motion.span
                                className="absolute left-0 top-0 text-xs text-green-500 whitespace-nowrap"
                                animate={{ opacity: [0, 1, 1, 1] }}
                                transition={{ times: [0, 0.6, 0.9, 1], duration: ANIMATION_DURATION, repeat: Infinity, repeatDelay: CYCLE_DURATION / 1000 - ANIMATION_DURATION }}
                            >
                                {copy.statusRunning}
                            </motion.span>
                        </div>
                    </div>
                    <motion.button
                        className="px-4 py-1.5 bg-brand-primary text-brand-dark text-sm font-bold rounded transition-colors relative z-10"
                        animate={{ scale: [1, 0.95, 1] }}
                        transition={{ times: [0, 0.5, 1], duration: 0.3, delay: 1.5, repeat: Infinity, repeatDelay: CYCLE_DURATION / 1000 - 0.3 }}
                    >
                        {copy.startService}
                    </motion.button>
                </div>
            </div>

            {/* Mouse Cursor Animation */}
            <motion.div
                className="absolute z-50 pointer-events-none"
                initial={{ x: 150, y: 100, opacity: 0 }}
                animate={{
                    x: [150, 150, 320, 320, 150],
                    y: [100, 100, 145, 145, 100],
                    opacity: [0, 1, 1, 0, 0],
                    scale: [1, 1, 0.8, 1, 1]
                }}
                transition={{
                    duration: ANIMATION_DURATION,
                    times: [0, 0.1, 0.6, 0.7, 1],
                    repeat: Infinity,
                    repeatDelay: CYCLE_DURATION / 1000 - ANIMATION_DURATION,
                    ease: "easeInOut"
                }}
            >
                <MousePointer2 className="w-6 h-6 text-white fill-black drop-shadow-lg" />
            </motion.div>
        </div>
    );
};

const Step2Diagram = ({ copy }) => {
    const domainText = "myrouter";

    return (
        <div className="w-full max-w-md bg-[#1e1e1e] rounded-lg border border-white/10 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <span className="text-sm font-bold text-white">{copy.addDomain}</span>
                <Globe className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">{copy.customDomain}</label>
                    <div className="flex overflow-hidden rounded">
                        <div className="bg-black/30 border border-white/10 border-r-0 rounded-none rounded-l px-3 pr-1.5 py-2 text-sm text-white w-full outline-none flex items-center h-[38px]">
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: "auto" }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "linear", repeat: Infinity, repeatDelay: CYCLE_DURATION / 1000 - 0.8 - 0.2 }}
                                className="overflow-hidden whitespace-nowrap border-r-2 border-brand-primary pr-1"
                            >
                                {domainText}
                            </motion.span>
                        </div>
                        <div className="-ml-px bg-white/5 border border-white/10 border-l-0 rounded-none rounded-r px-2.5 py-2 text-sm text-gray-400 flex items-center">
                            .ddnsto.com
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">{copy.internalAddr}</label>
                    <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded px-3 py-2">
                        <span className="text-xs text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">HTTP</span>
                        <span className="text-sm text-white font-mono">http://127.0.0.1</span>
                    </div>
                </div>
                <motion.button
                    className="w-full py-2 bg-brand-primary text-brand-dark text-sm font-bold rounded mt-2 transition-colors flex items-center justify-center gap-2 relative z-10"
                    animate={{ scale: [1, 0.98, 1] }}
                    transition={{ duration: 0.2, delay: 1.8, repeat: Infinity, repeatDelay: CYCLE_DURATION / 1000 - 0.2 }}
                >
                    <Check className="w-4 h-4" />
                    {copy.submit}
                </motion.button>
            </div>

            {/* Mouse Cursor Animation */}
            <motion.div
                className="absolute z-50 pointer-events-none"
                initial={{ x: 100, y: 100, opacity: 0 }}
                animate={{
                    x: [100, 100, 200, 200, 100],
                    y: [100, 100, 220, 220, 100],
                    opacity: [0, 1, 1, 0, 0],
                    scale: [1, 1, 0.8, 1, 1]
                }}
                transition={{
                    duration: ANIMATION_DURATION,
                    times: [0, 0.1, 0.7, 0.8, 1],
                    repeat: Infinity,
                    repeatDelay: CYCLE_DURATION / 1000 - ANIMATION_DURATION,
                    ease: "easeInOut"
                }}
            >
                <MousePointer2 className="w-6 h-6 text-white fill-black drop-shadow-lg" />
            </motion.div>
        </div>
    );
};

const Step3Diagram = ({ copy }) => {
    const urlText = "https://myrouter.ddnsto.com";

    return (
        <div className="w-full max-w-md bg-[#1e1e1e] rounded-lg border border-white/10 overflow-hidden shadow-xl flex flex-col h-48">
            {/* Browser Bar */}
            <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-3 border-b border-black/20">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 bg-[#1e1e1e] rounded-md px-3 py-1.5 flex items-center gap-2 text-xs text-gray-300 border border-white/5 shadow-inner h-[28px]">
                    <Lock className="w-3 h-3 text-green-500" />
                    <motion.span
                        className="text-white overflow-hidden whitespace-nowrap"
                        initial={{ width: 0 }}
                        animate={{ width: "auto" }}
                        transition={{ duration: 1.0, delay: 0.2, ease: "linear", repeat: Infinity, repeatDelay: CYCLE_DURATION / 1000 - 1.2 }}
                    >
                        {urlText}
                    </motion.span>
                </div>
            </div>
            {/* Browser Content */}
            <div className="flex-1 bg-[#1a1b26] p-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent" />

                {/* Loading State */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-[#1a1b26] z-20"
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: ANIMATION_DURATION, times: [0, 0.5, 0.7, 0.8], repeat: Infinity, repeatDelay: CYCLE_DURATION / 1000 - ANIMATION_DURATION }}
                >
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                </motion.div>

                {/* Success State */}
                <motion.div
                    className="text-center z-10"
                    animate={{ opacity: [0, 0, 1, 1] }}
                    transition={{ duration: ANIMATION_DURATION, times: [0, 0.75, 0.85, 1], repeat: Infinity, repeatDelay: CYCLE_DURATION / 1000 - ANIMATION_DURATION }}
                >
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-green-500" />
                    </div>
                    <h4 className="text-white font-bold mb-1">{copy.connected}</h4>
                    <p className="text-xs text-gray-500">{copy.tunnel}</p>
                </motion.div>
            </div>
        </div>
    );
};

const Workflow = () => {
    const { t, language } = useLanguage();
    const [activeStep, setActiveStep] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-cycle steps
    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3);
        }, CYCLE_DURATION);

        return () => clearInterval(interval);
    }, [isHovered]);

    const copy = language === 'zh'
        ? {
            clientTitle: 'DDNSTO 客户端配置',
            tokenLabel: '令牌 Token',
            statusStopped: '状态：已停止',
            statusRunning: '状态：运行中',
            startService: '启动服务',
            addDomain: '添加域名映射',
            customDomain: '自定义域名',
            internalAddr: '内网地址',
            submit: '提交',
            connected: '连接成功',
            tunnel: '安全隧道已建立'
        }
        : {
            clientTitle: 'DDNSTO Client Setup',
            tokenLabel: 'Token',
            statusStopped: 'Status: Stopped',
            statusRunning: 'Status: Running',
            startService: 'Start Service',
            addDomain: 'Add Domain Mapping',
            customDomain: 'Custom Domain',
            internalAddr: 'Internal Address',
            submit: 'Submit',
            connected: 'Connected Successfully',
            tunnel: 'Secure tunnel established'
        };

    const steps = [
        {
            icon: Download,
            title: t('workflow.step_1_title'),
            description: t('workflow.step_1_desc')
        },
        {
            icon: Link,
            title: t('workflow.step_2_title'),
            description: t('workflow.step_2_desc')
        },
        {
            icon: Globe,
            title: t('workflow.step_3_title'),
            description: t('workflow.step_3_desc')
        }
    ];

    return (
        <section className="py-24 bg-brand-dark relative">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        {t('workflow.title_1')} <span className="text-brand-primary">{t('workflow.title_2')}</span>
                    </h2>
                    <p className="text-gray-400">
                        {t('workflow.subtitle')}
                    </p>
                </div>

                <div
                    className="relative mb-16"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary/0 via-brand-primary/20 to-brand-primary/0" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, idx) => (
                            <div
                                key={idx}
                                className="relative flex flex-col items-center text-center group cursor-pointer"
                                onMouseEnter={() => setActiveStep(idx)}
                            >
                                <div className={`w-24 h-24 rounded-2xl bg-brand-surface border flex items-center justify-center mb-6 relative z-10 transition-all duration-300 shadow-lg shadow-black/50 ${activeStep === idx ? 'border-brand-primary scale-110' : 'border-white/10 group-hover:border-brand-primary/50'}`}>
                                    <div className={`absolute inset-0 rounded-2xl blur-xl transition-colors duration-300 ${activeStep === idx ? 'bg-brand-primary/20' : 'bg-transparent'}`} />
                                    <step.icon className={`w-10 h-10 transition-colors duration-300 ${activeStep === idx ? 'text-brand-primary' : 'text-white group-hover:text-brand-primary'}`} />
                                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border flex items-center justify-center font-mono font-bold text-sm transition-colors duration-300 ${activeStep === idx ? 'bg-brand-primary text-brand-dark border-brand-primary' : 'bg-brand-surface-highlight border-white/10 text-gray-400'}`}>
                                        {idx + 1}
                                    </div>
                                </div>
                                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${activeStep === idx ? 'text-brand-primary' : 'text-white'}`}>{step.title}</h3>
                                <p className="text-gray-400 text-sm">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dynamic Diagram Area */}
                <div
                    className="relative max-w-3xl mx-auto h-[300px] bg-brand-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="absolute inset-0 bg-grid-white/[0.02]" />
                    <AnimatePresence mode="wait">
                        {activeStep === 0 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex items-center justify-center p-8"
                            >
                                <Step1Diagram copy={copy} />
                            </motion.div>
                        )}

                        {activeStep === 1 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex items-center justify-center p-8"
                            >
                                <Step2Diagram copy={copy} />
                            </motion.div>
                        )}

                        {activeStep === 2 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex items-center justify-center p-8"
                            >
                                <Step3Diagram copy={copy} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default Workflow;
