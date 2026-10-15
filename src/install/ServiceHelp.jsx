import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { guides } from '../guides';

// Names verified read-only against zsetup-scripts/ddnsto/{linux-service.sh,
// install.ps1,install-macos.sh}. Windows uses a scheduled task, not a service.
const commands = {
    linux: [
        ['stop', 'sudo systemctl stop com.linkease.ddnstoshell', 'systemd'],
        ['start', 'sudo systemctl start com.linkease.ddnstoshell', 'systemd'],
        ['stop', 'sudo rc-service com.linkease.ddnstoshell stop', 'OpenRC'],
        ['start', 'sudo rc-service com.linkease.ddnstoshell start', 'OpenRC'],
    ],
    windows: [
        ['stop', "Stop-ScheduledTask -TaskPath '\\' -TaskName 'DDNSTO'"],
        ['start', "Start-ScheduledTask -TaskPath '\\' -TaskName 'DDNSTO'"],
    ],
    macos: [
        ['stop', 'launchctl bootout gui/$(id -u)/com.ddnsto.client'],
        ['disable', 'launchctl disable gui/$(id -u)/com.ddnsto.client'],
        ['enable', 'launchctl enable gui/$(id -u)/com.ddnsto.client\nlaunchctl bootstrap gui/$(id -u) "$HOME/Library/LaunchAgents/com.ddnsto.client.plist"'],
        ['loaded', 'launchctl enable gui/$(id -u)/com.ddnsto.client\nlaunchctl kickstart -k gui/$(id -u)/com.ddnsto.client'],
    ],
};

// eslint-disable-next-line react/prop-types -- Internal platform ID is validated by the install route registry; React 19 does not run propTypes.
const ServiceHelp = ({ platform }) => {
    const { t } = useLanguage();
    const manager = { linux: 'linuxManager', windows: 'windowsManager', macos: 'macManager' }[platform];
    const reinstall = platform === 'linux' ? 'reinstallLinux' : platform === 'openwrt' ? 'reinstallOpenwrt' : 'reinstallDesktop';
    return (
        <details className="rounded-2xl border border-white/10 bg-brand-surface/60 px-5 py-4">
            <summary className="cursor-pointer font-medium text-gray-200 focus-visible:outline-brand-accent">{t('install.help')}</summary>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-400">
                <p>{t('install.helpHint')}</p>
                {manager && <p>{t(`install.${manager}`)}</p>}
                {commands[platform]?.map(([label, command, group]) => <div key={command}>
                    <p className="mb-2 text-gray-300">{group && `${group} · `}{t(`install.${label}`)}</p>
                    <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs leading-6 text-emerald-100"><code>{command}</code></pre>
                </div>)}
                <h3 className="font-semibold text-white">{t('install.reinstall')}</h3>
                <p>{t(`install.${reinstall}`)}</p>
                {platform === 'openwrt' && <a className="inline-block text-brand-accent underline underline-offset-4" href={guides.openwrt.url} target="_blank" rel="noopener noreferrer">{t('install.tutorialLink')}</a>}
            </div>
        </details>
    );
};

export default ServiceHelp;
