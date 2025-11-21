import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-brand-dark border-t border-white/5 pt-16 pb-8">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-2xl font-bold text-white mb-4">DDNSTO</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {t('footer.desc')}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">{t('footer.product')}</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#features" className="hover:text-brand-primary transition-colors">{t('footer.link_features')}</a></li>
                            <li><a href="#pricing" className="hover:text-brand-primary transition-colors">{t('footer.link_pricing')}</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">{t('footer.link_download')}</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">{t('footer.link_changelog')}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">{t('footer.resources')}</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="https://doc.linkease.com/zh/guide/ddnsto/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">{t('footer.link_docs')}</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">{t('footer.link_api')}</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">{t('footer.link_community')}</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">{t('footer.link_help')}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">{t('footer.legal')}</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-brand-primary transition-colors">{t('footer.link_privacy')}</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">{t('footer.link_terms')}</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">{t('footer.link_cookie')}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} DDNSTO. {t('footer.rights')}
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
