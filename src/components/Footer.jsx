import React from 'react';
import { ShieldCheck } from 'lucide-react';
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

                    <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div>
                            <h4 className="font-bold text-white mb-3">{t('footer.all_products_title')}</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="https://app.linkease.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">{t('footer.product_easecloud')}</a></li>
                                <li><a href="https://www.ddnsto.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">{t('footer.product_ddnsto')}</a></li>
                                <li><a href="https://doc.linkease.com/zh/guide/istore/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">{t('footer.product_istore')}</a></li>
                                <li><a href="https://easepi.linkease.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">{t('footer.product_easepi')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-3">{t('footer.purchase_title')}</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="https://koolcenter.taobao.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">{t('footer.purchase_koolcenter')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-3">{t('footer.help_title')}</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="https://github.com/linkease/ddnsto/issues" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">{t('footer.help_issue')}</a></li>
                                <li><a href="mailto:admin@linkease.com" className="hover:text-brand-primary transition-colors">{t('footer.help_business')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-3">{t('footer.about_title')}</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="https://www.linkease.com/about/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">{t('footer.about_us')}</a></li>
                                <li><a href="mailto:admin@linkease.com" className="hover:text-brand-primary transition-colors">{t('footer.about_contact')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-3">{t('footer.partner_title')}</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="https://www.koolcenter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">{t('footer.partner_koolcenter')}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-sm text-gray-400 space-y-3">
                    <p
                        className="text-gray-400"
                        title={`Copyright © 2019-${new Date().getFullYear()} 深圳市易有云网络科技有限责任公司 版权所有 备案号： 粤ICP备20024441号 增值电信业务经营许可 粤B2-20251165 公司地址：深圳市南山区高新南环路29号留学生创业大厦一期 2001 联系电话：13316474667`}
                    >
                        Copyright © 2019-{new Date().getFullYear()} 深圳市易有云网络科技有限责任公司 版权所有
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-400">
                        <a
                            href="https://beian.miit.gov.cn/#/Integrated/index"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-brand-primary transition-colors"
                        >
                            备案号： 粤ICP备20024441号
                        </a>
                        <a
                            href="https://assets.koolcenter.com/linkease/VTBOL.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-brand-primary transition-colors"
                        >
                            增值电信业务经营许可 粤B2-20251165
                        </a>
                        <a
                            href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44030002008017"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-gray-300 hover:text-brand-primary transition-colors"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            粤公网安备44030002008017号
                        </a>
                    </div>
                    <p className="text-gray-400">
                        公司地址：深圳市南山区高新南环路29号留学生创业大厦一期 2001    联系电话：13316474667
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
