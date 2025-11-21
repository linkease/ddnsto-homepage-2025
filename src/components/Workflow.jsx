import React from 'react';
import { UserPlus, Download, Link, Globe } from 'lucide-react';

const steps = [
    {
        icon: Download,
        title: "Install Agent",
        description: "Install the lightweight client on your NAS or Router."
    },
    {
        icon: Link,
        title: "Create Domain",
        description: "Select a domain to bind to your internal web service."
    },
    {
        icon: Globe,
        title: "Access Anywhere",
        description: "Open your browser and access your device securely."
    }
];

const Workflow = () => {
    return (
        <section className="py-24 bg-brand-dark relative">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Get Started in <span className="text-brand-primary">Minutes</span>
                    </h2>
                    <p className="text-gray-400">
                        Four simple steps to total freedom.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary/0 via-brand-primary/50 to-brand-primary/0" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative flex flex-col items-center text-center group">
                                <div className="w-24 h-24 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:border-brand-primary transition-colors shadow-lg shadow-black/50">
                                    <div className="absolute inset-0 bg-brand-primary/5 rounded-2xl blur-xl group-hover:bg-brand-primary/10 transition-colors" />
                                    <step.icon className="w-10 h-10 text-white group-hover:text-brand-primary transition-colors" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-surface-highlight border border-white/10 flex items-center justify-center font-mono font-bold text-sm text-gray-400">
                                        {idx + 1}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-gray-400 text-sm">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Workflow;
