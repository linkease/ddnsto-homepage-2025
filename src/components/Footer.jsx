import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-brand-dark border-t border-white/5 pt-16 pb-8">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-2xl font-bold text-white mb-4">ddnsto</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            The simplest way to access your home devices from anywhere. Secure, fast, and reliable.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-brand-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">Download</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-brand-primary transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">API Reference</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">Help Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} ddnsto. All rights reserved.
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
