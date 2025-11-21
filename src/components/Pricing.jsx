import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const PricingCard = ({ title, price, period, description, features, recommended = false, buttonText, onButtonClick }) => (
    <div className={`relative p-8 rounded-2xl border ${recommended ? 'bg-brand-surface border-brand-primary' : 'bg-brand-surface/50 border-white/5'} flex flex-col h-full`}>
        {recommended && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-primary text-brand-dark text-sm font-bold rounded-full">
                Recommended
            </div>
        )}
        <div className="mb-2">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
        <div className="mb-6">
            <span className="text-4xl font-bold text-white">{price}</span>
            {period && <span className="text-gray-400">{period}</span>}
        </div>
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-brand-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                </li>
            ))}
        </ul>
        {buttonText && (
            <button
                onClick={onButtonClick}
                className={`w-full py-3 rounded-lg font-bold transition-all ${recommended
                    ? 'bg-brand-primary text-brand-dark hover:bg-brand-primary/90'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
            >
                {buttonText}
            </button>
        )}
    </div>
);

const Pricing = () => {
    const { t } = useLanguage();

    return (
        <section id="pricing" className="py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        {t('pricing.title_1')} <span className="text-brand-primary">{t('pricing.title_2')}</span>
                    </h2>
                    <p className="text-gray-400">
                        {t('pricing.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Free Plan */}
                    <PricingCard
                        title={t('pricing.free_plan')}
                        price={t('pricing.free_price')}
                        period={t('pricing.free_period')}
                        features={[
                            t('pricing.feature_1_device'),
                            t('pricing.feature_5_domains'),
                            t('pricing.feature_ssh')
                        ]}
                    />

                    {/* Standard Plan */}
                    <PricingCard
                        title={t('pricing.standard_plan')}
                        price={t('pricing.standard_price')}
                        period={t('pricing.standard_period')}
                        description={t('pricing.standard_desc')}
                        recommended={true}
                        features={[
                            t('pricing.feature_1_device'),
                            t('pricing.feature_4mbps'),
                            t('pricing.feature_12_domains'),
                            t('pricing.feature_ssh_rdp_vnc'),
                            t('pricing.feature_web_file')
                        ]}
                    />

                    {/* Advanced Plan */}
                    <PricingCard
                        title={t('pricing.advanced_plan')}
                        price={t('pricing.advanced_price')}
                        period={t('pricing.advanced_period')}
                        description={t('pricing.advanced_desc')}
                        features={[
                            t('pricing.feature_1_device'),
                            t('pricing.feature_8mbps'),
                            t('pricing.feature_20_domains'),
                            t('pricing.feature_ssh_rdp_vnc'),
                            t('pricing.feature_web_file')
                        ]}
                    />

                    {/* Batch Plan */}
                    <PricingCard
                        title={t('pricing.batch_plan')}
                        price=""
                        period=""
                        description={t('pricing.batch_desc')}
                        features={[
                            t('pricing.contact_support')
                        ]}
                        buttonText={t('pricing.contact_support')}
                        onButtonClick={() => window.location.href = 'mailto:support@ddnsto.com'} // Assuming mailto for now
                    />
                </div>
            </div>
        </section>
    );
};

export default Pricing;
