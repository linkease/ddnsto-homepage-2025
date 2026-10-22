import React, { useRef, useState } from 'react';
import { Copy, Terminal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { buildInstallCommand, buildDebugCommand, debugActions, dockerActions, nativeLifecycleActions, debugMethods, copyInstallCommand } from './installer.js';
import { installRelease } from './release.js';

// eslint-disable-next-line react/prop-types -- Internal platform ID is validated by the install route registry; React 19 does not run propTypes.
const CommandOutput = ({ platform, command, base, published }) => {
    const { t } = useLanguage();
    const [copyState, setCopyState] = useState('idle');
    const commandField = useRef(null);
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
                    <a href={`${base}/install.${platform === 'windows' ? 'ps1' : 'sh'}`} target="_blank" rel="noopener noreferrer" className="text-brand-accent underline underline-offset-4">{t('install.scriptLink')}</a>
                    <a href={`${base}/SHA256SUMS`} target="_blank" rel="noopener noreferrer" className="text-brand-accent underline underline-offset-4">{t('install.checksumList')}</a>
                </div>
                <p>{t('install.checksum')}</p>
                {published && <code className="block break-all font-mono text-gray-300">{installRelease.sha256[platform === 'windows' ? 'powershell' : 'shell']}</code>}
            </div>
        </details>
    </>
    );
};

// eslint-disable-next-line react/prop-types -- Validated platform from the route registry.
const CommandPanel = ({ platform }) => {
    const { language } = useLanguage();
    const zh = language === 'zh';
    const [source, setSource] = useState('published');
    const [base, setBase] = useState('');
    const synology = platform === 'synology';
    const initialTarget = platform === 'docker' ? 'linux' : platform;
    const [target, setTarget] = useState(initialTarget);
    const [method, setMethod] = useState(platform === 'docker' ? 'docker' : 'auto');
    const [action, setAction] = useState(synology ? 'download' : 'install');
    const [architecture, setArchitecture] = useState('');
    const [installMode, setInstallMode] = useState('first');
    const [deviceName, setDeviceName] = useState('');
    const [network, setNetwork] = useState('');
    const published = source === 'published';
    const docker = method === 'docker';
    const firstInstall = docker && action === 'install' && installMode === 'first';
    const actions = synology ? ['download'] : docker ? dockerActions : method === 'native' && target !== 'auto' ? [...debugActions, ...nativeLifecycleActions] : debugActions;
    const methods = platform === 'docker' ? ['docker'] : target === 'linux' ? [...debugMethods, 'docker'] : debugMethods;
    const command = published ? buildInstallCommand(platform) : buildDebugCommand({ base, platform: target, method, action, architecture, installMode,
        ...(firstInstall ? { deviceName, network } : {}) });
    const fieldClass = 'mt-2 block w-full rounded-lg border border-white/20 bg-brand-dark p-3 text-sm text-white';
    return <>
        <div className="space-y-4 rounded-xl border border-white/10 p-4 text-sm text-gray-300">
            <label htmlFor="installer-source">{zh ? '脚本来源' : 'Script source'}
                <select id="installer-source" className={fieldClass} value={source} onChange={event => setSource(event.target.value)}>
                    <option value="published">{zh ? '已发布旧入口 · 原有安装流程' : 'Published older entry · original installation flow'}</option>
                    <option value="candidate">{zh ? '本地候选契约 · 自行指定测试地址（未发布）' : 'Local candidate contract · explicit test URL (unpublished)'}</option>
                </select>
            </label>
            {published && <p>{zh ? '已发布 0.1.10 的 Docker / Synology / QNAP / Unraid 不提供一键执行器，请使用对应平台教程。' : 'Published 0.1.10 has no one-click executor for Docker / Synology / QNAP / Unraid. Use their platform guides.'}</p>}
            {!published && <>
                <label htmlFor="installer-base">{zh ? '固定版本 HTTPS 目录' : 'Pinned HTTPS version directory'}
                    <input id="installer-base" type="url" className={fieldClass} value={base} onChange={event => setBase(event.target.value)} placeholder="https://host/ddnsto-install/0.2.0/build-id" autoComplete="off" spellCheck={false} aria-describedby="candidate-hint" />
                </label>
                <p id="candidate-hint">{zh ? '仅用于承载当前候选脚本的测试服务器；填写地址不代表已发布或可用。下载失败或脚本头不匹配会停止。校验清单需自行核对。' : 'Use a test server hosting the current candidate. A URL does not establish publication or availability. Fetch failures or header mismatches stop execution. Verify the checksum list separately.'}</p>
                <label htmlFor="installer-target">{zh ? '目标约束' : 'Target constraint'}
                    <select id="installer-target" className={fieldClass} value={target} onChange={event => { setTarget(event.target.value); setAction('install'); }}>
                        <option value={initialTarget}>{initialTarget}</option>
                        {!synology && !docker && platform !== 'windows' && <option value="auto">{zh ? 'auto · 自动识别 Unix 设备' : 'auto · detect Unix device'}</option>}
                    </select>
                </label>
                <p>{zh ? '设备选项是约束，不会强制覆盖检测结果；Windows 必须使用 PowerShell。' : 'Device selection constrains detection; it does not override it. Windows requires PowerShell.'}</p>
                {!synology && <label htmlFor="installer-method">{zh ? '安装方式' : 'Installation method'}
                    <select id="installer-method" className={fieldClass} value={method} onChange={event => { setMethod(event.target.value); setAction('install'); if (event.target.value === 'docker') setTarget('linux'); }}>{methods.map(value => <option key={value} value={value}>{value === 'docker' ? (zh ? 'docker · 实验候选' : 'docker · experimental candidate') : value}</option>)}</select>
                </label>}
                <label htmlFor="installer-action">{zh ? '操作' : 'Action'}
                    <select id="installer-action" className={fieldClass} value={action} onChange={event => setAction(event.target.value)}>{actions.map(value => <option key={value}>{value}</option>)}</select>
                </label>
                {synology ? <p data-candidate-handoff className="text-amber-200">{zh ? '候选 0.2.0：只下载并校验匹配的 SPK 套件，不执行安装。请在 DSM 套件中心手动安装并完成向导；下载成功不代表安装完成或设备在线。仅支持执行器核验的 DSM 6/7 与 x86_64/armv7 套件，不支持 ARM64。' : 'Candidate 0.2.0 downloads and verifies the matching SPK only; it does not install it. Install manually in DSM Package Center and complete the wizard. Download success means neither installation nor online status. Only executor-verified DSM 6/7 and x86_64/armv7 packages are supported, not ARM64.'}</p> : docker ? <>
                    <label htmlFor="installer-architecture">{zh ? '目标主机架构' : 'Target host architecture'}
                        <select id="installer-architecture" className={fieldClass} value={architecture} onChange={event => setArchitecture(event.target.value)}><option value="">{zh ? '选择架构' : 'Select architecture'}</option><option value="amd64">Linux amd64 / x86_64</option></select>
                    </label>
                    {action === 'install' && <label htmlFor="installer-install-mode">{zh ? '安装情形' : 'Installation scenario'}
                        <select id="installer-install-mode" className={fieldClass} value={installMode} onChange={event => setInstallMode(event.target.value)}><option value="first">{zh ? '首次安装（从未安装）' : 'First installation (never installed)'}</option><option value="existing">{zh ? '重复运行（已有完整托管容器）' : 'Repeat run (complete owned container exists)'}</option></select>
                    </label>}
                    {firstInstall && <>
                        <label htmlFor="installer-device-name">{zh ? '设备名（1–128 位字母、数字、_、-；不能以 - 开头）' : 'Device name (1–128 letters, digits, _, -; cannot start with -)'}
                            <input id="installer-device-name" className={fieldClass} value={deviceName} onChange={event => setDeviceName(event.target.value)} maxLength={128} autoComplete="off" spellCheck={false} />
                        </label>
                        <label htmlFor="installer-network">{zh ? '容器网络' : 'Container network'}
                            <select id="installer-network" className={fieldClass} value={network} onChange={event => setNetwork(event.target.value)}><option value="">{zh ? '选择网络' : 'Select network'}</option><option value="bridge">bridge</option><option value="host">host</option></select>
                        </label>
                        <p>{zh ? 'bridge 使用独立容器网络（容器内 localhost 不是宿主机）；host 共享宿主机网络。首次 Token 由目标设备终端提示输入。' : 'bridge uses a separate container network (localhost inside it is not the host); host shares host networking. The target terminal prompts for the first Token.'}</p>
                    </>}
                    <p data-docker-requirements className="text-amber-200">{zh ? '候选 0.2.0 实验执行器可用，但 docker_installable=false，尚未生产验收。仅通用 Linux amd64 + 本地 Docker Engine；不支持 NAS/OpenWrt、远程引擎、Docker Desktop 或 rootless。不支持 native/docker 自动迁移。update 只核验固定 4.2.6 摘要后不做变更；身份持久化未验收，拒绝替换升级、丢失容器重建和卸载后重装。uninstall 保留私有状态。已有容器操作不携带设备名、网络或 Token；status 不代表云端在线。' : 'Candidate 0.2.0 experimental executor is available, but docker_installable=false: production acceptance is pending. Requires generic Linux amd64 and a local Docker Engine; no NAS/OpenWrt, remote engine, Docker Desktop or rootless. No automatic migration between native and Docker. update only verifies the pinned 4.2.6 digest and makes no changes. Identity persistence is unverified: replacement upgrades, missing-container rebuilds and reinstall after uninstall are rejected. uninstall retains private state. Existing-container operations send no device name, network or Token; status does not prove cloud connectivity.'}</p>
                    <p className="text-amber-200">{zh ? 'Docker 写操作必须在 root shell 中运行：先执行 sudo -i，再在该 shell 中执行候选命令。仅具备 docker 组权限不足以执行这些操作。' : 'Docker write operations require a root shell: run sudo -i first, then run the candidate command in that shell. Docker group membership alone is insufficient.'}</p>
                </> : <p>{zh ? 'update 保留现有配置；status 只检查本地服务，不代表云端在线。选择具体设备和 native 后可管理已托管安装。Linux 的 start/stop/restart 仅支持已验证归属的 systemd 服务；OpenRC 仅支持只读 status，拒绝服务写操作。Token 仅在目标设备输入。不支持 native/docker 自动迁移。' : 'update preserves configuration; status checks the local service, not cloud connectivity. Select a specific device and native to manage an owned installation. Linux start/stop/restart require a systemd service with verified ownership; OpenRC supports read-only status and rejects service write operations. Enter the Token only on the target device. No automatic migration between native and Docker.'}</p>}
                {!docker && nativeLifecycleActions.includes(action) && <p className="text-amber-200" role="note">{zh ? '要求候选 0.2.0 生命周期执行器及可验证的安装归属：Linux / 桌面需托管标记，OpenWrt 需包归属。Linux 的 repair/configure/uninstall 仅支持 systemd，不支持 OpenRC。configure 会更改配置（Linux 还需 jq）；repair 修复服务；uninstall 会移除该托管安装。请先确认终端中的影响与权限要求。' : 'Requires the candidate 0.2.0 lifecycle executor and verified installation ownership: managed markers on Linux/desktop, package ownership on OpenWrt. Linux repair/configure/uninstall require systemd; OpenRC is not supported. configure changes configuration (Linux also requires jq); repair repairs the service; uninstall removes the owned installation. Review terminal impact and permission requirements first.'}</p>}
            </>}
        </div>
        {command ? <CommandOutput key={command} platform={platform} command={command} base={published ? installRelease.base : base} published={published} /> : <p role="status" className="text-amber-200">{published ? (zh ? '已发布入口仅提供上方平台教程。' : 'The published entry offers the platform guide above.') : (zh ? '请填写有效的固定版本 HTTPS 测试目录及所需选项；新下载/Docker 能力要求 0.2.0。当前没有可复制命令。' : 'Enter a valid pinned HTTPS test directory and required options; download/Docker require 0.2.0. No command is available to copy.')}</p>}
    </>;
};

export default CommandPanel;
