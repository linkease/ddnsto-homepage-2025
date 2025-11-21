import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        category: "Product & Principles",
        items: [
            {
                q: "What is DDNSTO and what problem does it solve?",
                a: "DDNSTO is a remote access tool that requires no public IP. It allows you to access your home NAS, router dashboard, Home Assistant, and self-hosted services from anywhere."
            },
            {
                q: "How is it different from Port Forwarding / DMZ / VPN?",
                a: "No public IP needed, no port opening required (safer), simpler configuration for beginners, no changes to home network structure, and no need to mess with dynamic DNS or reverse proxies."
            },
            {
                q: "Is the access speed fast?",
                a: "In a typical home broadband environment, speed depends on your upload bandwidth. DDNSTO does not limit traffic, but plans have bandwidth caps (Free 4 Mbps, Paid 8 Mbps)."
            }
        ]
    },
    {
        category: "Plans & Billing",
        items: [
            {
                q: "Is billing per account or per device?",
                a: "Billing is per **device**. Each device needs a plan. If you unbind a device, the plan remains in your account and can be bound to a new device."
            },
            {
                q: "I set up a device for a client, what if they stop using it?",
                a: "You can unbind the device in the console at any time. The plan remains yours and can be used for the next client device. Perfect for IT engineers."
            }
        ]
    },
    {
        category: "Privacy & Security",
        items: [
            {
                q: "Can I access via mobile?",
                a: "Yes, all access is done via HTTPS domains, so it works on any device with a browser, including mobile phones."
            },
            {
                q: "Does DDNSTO read my data?",
                a: "No. Your page data is rendered in your browser. DDNSTO does not store your NAS/Router content. The entire link is secured via an encrypted tunnel."
            }
        ]
    }
];

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/5 last:border-0">
            <button
                className="w-full py-6 flex items-center justify-between text-left hover:text-brand-primary transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-lg text-white">{question}</span>
                {isOpen ? <Minus className="w-5 h-5 text-brand-primary" /> : <Plus className="w-5 h-5 text-gray-500" />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-400 leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

const FAQ = () => {
    return (
        <section id="faq" className="py-24 bg-brand-dark">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Frequently Asked <span className="text-brand-primary">Questions</span>
                    </h2>
                </div>

                <div className="space-y-12">
                    {faqs.map((category, idx) => (
                        <div key={idx}>
                            <h3 className="text-xl font-bold text-brand-secondary mb-6 uppercase tracking-wider text-sm">{category.category}</h3>
                            <div className="bg-brand-surface/50 rounded-2xl p-8 border border-white/5">
                                {category.items.map((item, i) => (
                                    <FAQItem key={i} question={item.q} answer={item.a} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
