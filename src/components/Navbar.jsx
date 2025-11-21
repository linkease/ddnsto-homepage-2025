import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-dark/80 backdrop-blur-lg border-b border-white/5 py-4' : 'bg-transparent py-6'
            }`}>
            <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="text-2xl font-bold font-display tracking-tighter flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                        <span className="text-white font-mono text-lg">d</span>
                    </div>
                    <span className="text-white">DDNSTO</span>
                </a>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="https://doc.linkease.com/zh/guide/ddnsto/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Docs</a>
                    <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</a>
                    <a href="#scenarios" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Use Cases</a>
                    <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</a>
                    <a href="#faq" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">FAQ</a>
                </div>

                {/* CTA Button */}
                <div className="hidden md:block">
                    <button className="px-5 py-2 rounded-lg bg-brand-primary text-brand-dark font-bold hover:bg-brand-primary-hover transition-colors shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                        Console Login
                    </button>
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
                    <a href="https://doc.linkease.com/zh/guide/ddnsto/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Docs</a>
                    <a href="#features" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                    <a href="#scenarios" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Use Cases</a>
                    <a href="#pricing" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                    <a href="#faq" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
                    <hr className="border-white/10" />
                    <button className="w-full py-3 rounded-lg bg-brand-primary text-brand-dark font-bold">
                        Console Login
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
