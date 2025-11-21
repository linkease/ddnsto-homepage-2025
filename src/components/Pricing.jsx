import React from 'react';
import { Check } from 'lucide-react';

const PricingCard = ({ title, price, features, recommended = false, buttonText = "Get Started" }) => (
    <div className={`relative p-8 rounded-2xl border ${recommended ? 'bg-brand-surface border-brand-primary' : 'bg-brand-surface/50 border-white/5'} flex flex-col`}>
        {recommended && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-brand-dark font-bold px-4 py-1 rounded-full text-sm">
                Most Popular
            </div>
        )}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <div className="mb-6">
            <span className="text-4xl font-bold text-white">{price}</span>
            {price !== 'Free' && <span className="text-gray-400">/year</span>}
        </div>
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-brand-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                </li>
            ))}
        </ul>
        <button className={`w-full py-3 rounded-lg font-bold transition-all ${recommended
                ? 'bg-brand-primary text-brand-dark hover:bg-brand-primary/90'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}>
            {buttonText}
        </button>
    </div>
);

const Pricing = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Simple, Transparent <span className="text-brand-primary">Pricing</span>
                    </h2>
                    <p className="text-gray-400">
                        Start for free, upgrade when you need more power.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <PricingCard
                        title="Free Trial"
                        price="Free"
                        features={[
                            '7-day full access',
                            '5 tunnels included',
                            'Unlimited bandwidth',
                            'Community support'
                        ]}
                        buttonText="Start Trial"
                    />

                    <PricingCard
                        title="Annual Plan"
                        price="¥26"
                        features={[
                            '12 months access',
                            '5 tunnels included',
                            'Unlimited bandwidth',
                            'Priority support',
                            'Custom domains'
                        ]}
                        recommended={true}
                        buttonText="Subscribe Now"
                    />

                    <PricingCard
                        title="Professional"
                        price="¥58"
                        features={[
                            'Everything in Annual',
                            '12 tunnels included',
                            'Commercial use',
                            'Dedicated IP options',
                            'SLA Guarantee'
                        ]}
                        buttonText="Contact Sales"
                    />
                </div>
            </div>
        </section>
    );
};

export default Pricing;
