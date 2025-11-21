import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Zap, Server, Lock, Smartphone } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, className, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className={`p-6 rounded-2xl bg-brand-surface border border-white/5 hover:border-brand-primary/30 transition-colors group ${className}`}
    >
        <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:bg-brand-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-brand-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
);

const Features = () => {
    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Why Choose <span className="text-brand-primary">ddnsto</span>?
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Everything you need for secure, reliable remote access without the technical headaches.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Large Card 1 */}
                    <FeatureCard
                        icon={Globe}
                        title="No Public IP Required"
                        description="Forget about calling your ISP. ddnsto works behind NATs, firewalls, and 4G/5G networks instantly."
                        className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-brand-surface to-brand-surface-highlight"
                        delay={0.1}
                    />

                    {/* Regular Card */}
                    <FeatureCard
                        icon={Zap}
                        title="Plug & Play"
                        description="Setup takes less than 1 minute. Just install the agent and bind your device."
                        delay={0.2}
                    />

                    {/* Regular Card */}
                    <FeatureCard
                        icon={Lock}
                        title="Bank-Grade Security"
                        description="All connections are encrypted via TLS 1.3. Your data remains private and secure."
                        delay={0.3}
                    />

                    {/* Large Card 2 */}
                    <FeatureCard
                        icon={Server}
                        title="Cross-Platform Support"
                        description="Works seamlessly on Synology, QNAP, Docker, OpenWrt, Windows, Mac, and Linux."
                        className="md:col-span-2 md:row-span-1 bg-gradient-to-bl from-brand-surface to-brand-surface-highlight"
                        delay={0.4}
                    />

                    {/* Regular Card */}
                    <FeatureCard
                        icon={Smartphone}
                        title="Mobile Friendly"
                        description="Responsive design ensures your services look great on any device."
                        delay={0.5}
                    />
                </div>
            </div>
        </section>
    );
};

export default Features;
