import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
    const { t } = useLanguage();

    const faqs = [
        {
            category: t('faq.cat_product'),
            items: [
                {
                    q: t('faq.q1'),
                    a: t('faq.a1')
                },
                {
                    q: t('faq.q2'),
                    a: t('faq.a2')
                },
                {
                    q: t('faq.q3'),
                    a: t('faq.a3')
                }
            ]
        },
        {
            category: t('faq.cat_billing'),
            items: [
                {
                    q: t('faq.q_billing_device'),
                    a: t('faq.a_billing_device')
                },
                {
                    q: t('faq.q_client_device'),
                    a: t('faq.a_client_device')
                }
            ]
        },
        {
            category: t('faq.cat_security'),
            items: [
                {
                    q: t('faq.q_mobile'),
                    a: t('faq.a_mobile')
                },
                {
                    q: t('faq.q_data'),
                    a: t('faq.a_data')
                }
            ]
        }
    ];

    return (
        <section id="faq" className="py-24 bg-brand-dark">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        {t('faq.title_1')} <span className="text-brand-primary">{t('faq.title_2')}</span>
                    </h2>
                    <p className="text-gray-400">
                        {t('faq.subtitle')}
                    </p>
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
