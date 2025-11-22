import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, Globe, Bot } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { language, toggleLanguage, t } = useLanguage();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/80 backdrop-blur-md border-b border-white/5">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-brand-surface-highlight border border-white/10 flex items-center justify-center overflow-hidden">
                        <img src="/favicon.svg" alt="DDNSTO" className="w-6 h-6" />
                    </div>
                    <span className="text-white">DDNSTO</span>
                </a>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="https://doc.linkease.com/zh/guide/ddnsto/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.docs')}</a>
                    <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.features')}</a>
                    <a href="#scenarios" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.scenarios')}</a>
                    <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.pricing')}</a>
                    <a href="#faq" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.faq')}</a>
                </div>

                {/* Right Side Actions */}
                <div className="hidden md:flex items-center gap-6">
                    {/* AI Assistant */}
                    <a
                        href="https://ai.koolcenter.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
                    >
                        <Bot className="w-4 h-4" />
                        <span>{t('nav.ai_assistant')}</span>
                    </a>

                    {/* Language Switcher */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        <span>{language === 'en' ? 'EN' : '中文'}</span>
                    </button>

                    {/* CTA Button */}
                    <a
                        href="/app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 rounded-lg bg-brand-primary text-brand-dark font-bold hover:bg-brand-primary-hover transition-colors shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                    >
                        {t('nav.login')}
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-brand-surface border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl">
                    <a href="https://doc.linkease.com/zh/guide/ddnsto/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.docs')}</a>
                    <a href="#features" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.features')}</a>
                    <a href="#scenarios" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.scenarios')}</a>
                    <a href="#pricing" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.pricing')}</a>
                    <a href="#faq" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.faq')}</a>
                    <a href="https://ai.koolcenter.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-primary-hover flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                        <Bot className="w-4 h-4" />
                        {t('nav.ai_assistant')}
                    </a>

                    <div className="flex items-center justify-between py-2 border-t border-white/10 mt-2">
                        <span className="text-gray-400">Language</span>
                        <button
                            onClick={toggleLanguage}
                            className="text-white font-medium"
                        >
                            {language === 'en' ? 'English' : '中文'}
                        </button>
                    </div>

                    <a
                        href="/app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-lg bg-brand-primary text-brand-dark font-bold text-center"
                    >
                        {t('nav.login')}
                    </a>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
