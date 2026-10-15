import React, { useRef, useState } from 'react';
import { Copy, Terminal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { buildInstallCommand, copyInstallCommand } from './installer.js';
import { installRelease } from './release.js';

// eslint-disable-next-line react/prop-types -- Internal platform ID is validated by the install route registry; React 19 does not run propTypes.
const CommandPanel = ({ platform }) => {
    const { t } = useLanguage();
    const [copyState, setCopyState] = useState('idle');
    const commandField = useRef(null);
    const command = buildInstallCommand(platform);
    if (!command) return <p className="rounded-xl border border-amber-300/20 p-5 text-amber-200">{t('install.pending')}</p>;

    const copy = async () => {
        const result = await copyInstallCommand(command, navigator.clipboard);
        setCopyState(result);
        if (result === 'manual') {
            commandField.current?.focus();
            commandField.current?.select();
        }
    };

    return (<>
        <div className="min-w-0 rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <span className="flex items-center gap-2 font-mono text-xs text-gray-400"><Terminal size={16} aria-hidden="true" />{platform === 'windows' ? 'PowerShell' : 'Terminal / SSH'}</span>
                <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2 text-sm font-bold text-brand-dark hover:bg-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent">
                    <Copy size={16} aria-hidden="true" />{t('install.copy')}
                </button>
            </div>
            <label htmlFor="install-command" className="sr-only">{t('install.commandLabel')}</label>
            <textarea id="install-command" ref={commandField} readOnly value={command} spellCheck={false} rows={9}
                className="block w-full resize-y break-all bg-transparent p-4 font-mono text-xs leading-6 text-emerald-100 outline-offset-[-3px] focus-visible:outline-brand-accent sm:text-sm" />
            <div role="status" aria-live="polite" className={copyState === 'idle' ? 'sr-only' : 'border-t border-white/10 px-4 py-3 text-sm text-emerald-200'}>
                {copyState === 'copied' && t('install.copied')}
                {copyState === 'manual' && <>
                    <p>{t('install.manual')}</p>
                    <button type="button" className="mt-2 underline underline-offset-4" onClick={() => { commandField.current?.focus(); commandField.current?.select(); }}>{t('install.select')}</button>
                </>}
            </div>
        </div>
        <details className="rounded-xl border border-white/10 px-4 py-3 text-xs text-gray-400">
            <summary className="cursor-pointer text-gray-300">{t('install.scriptDetails')}</summary>
            <div className="mt-4 space-y-3 leading-6">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                    <a href={`${installRelease.base}/install.${platform === 'windows' ? 'ps1' : 'sh'}`} target="_blank" rel="noopener noreferrer" className="text-brand-accent underline underline-offset-4">{t('install.scriptLink')}</a>
                    <a href={`${installRelease.base}/SHA256SUMS`} target="_blank" rel="noopener noreferrer" className="text-brand-accent underline underline-offset-4">{t('install.checksumList')}</a>
                </div>
                <p>{t('install.checksum')}</p>
                <code className="block break-all font-mono text-gray-300">{installRelease.sha256[platform === 'windows' ? 'powershell' : 'shell']}</code>
            </div>
        </details>
    </>
    );
};

export default CommandPanel;
