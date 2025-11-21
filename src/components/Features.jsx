import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Zap, Server, Lock, Smartphone, Monitor, Terminal, Folder } from 'lucide-react';

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
        <section id="features" className="py-24 px-6 relative overflow-hidden bg-brand-dark">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Powerful <span className="text-brand-primary">Capabilities</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        More than just a tunnel. A complete toolkit for remote management.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feature 1: Custom Domain */}
                    <FeatureCard
                        icon={Globe}
                        title="Custom Domain Access"
                        description="Bind your own domain names to internal services. Access your NAS, router, or blog via a professional, memorable URL."
                        className="bg-gradient-to-br from-brand-surface to-brand-surface-highlight"
                        delay={0.1}
                    />

                    {/* Feature 2: Remote Desktop */}
                    <FeatureCard
                        icon={Monitor}
                        title="VNC & RDP Remote Desktop"
                        description="Access your Windows or Linux desktop directly from the browser. No client installation required on the viewing device."
                        className="bg-gradient-to-bl from-brand-surface to-brand-surface-highlight"
                        delay={0.2}
                    />

                    {/* Feature 3: SSH Terminal */}
                    <FeatureCard
                        icon={Terminal}
                        title="Web-based SSH Terminal"
                        description="Execute commands on your servers from anywhere. A full-featured terminal emulator right in your browser."
                        className="bg-gradient-to-tr from-brand-surface to-brand-surface-highlight"
                        delay={0.3}
                    />

                    {/* Feature 4: File Manager */}
                    <FeatureCard
                        icon={Folder}
                        title="File Management"
                        description="Browse, upload, and download files using WebDAV, Samba, or SFTP protocols. Your private cloud, accessible everywhere."
                        className="bg-gradient-to-tl from-brand-surface to-brand-surface-highlight"
                        delay={0.4}
                    />
                </div>
            </div>
        </section>
    );
};

export default Features;
