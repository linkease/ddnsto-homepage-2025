import { installRelease } from './release.js';
/* global process -- NODE_ENV is replaced by Next.js at build time. */

export const consoleUrl = 'https://web.ddnsto.com/app/#/devices';
export const platforms = [
    { id: 'linux', name: 'Linux', script: true },
    { id: 'openwrt', name: 'OpenWrt', script: true },
    { id: 'windows', name: 'Windows', script: true },
    { id: 'macos', name: 'macOS', script: true },
    { id: 'synology', name: 'Synology' },
    { id: 'qnap', name: 'QNAP' },
    { id: 'docker', name: 'Docker' },
    { id: 'unraid', name: 'Unraid' },
    { id: 'istoreos', name: 'iStoreOS' },
    { id: 'asusgo', name: 'ASUSGO' },
    { id: 'others', name: 'Other' },
];

export const platformFromSearch = search => {
    const id = new URLSearchParams(search).get('platform');
    return platforms.some(platform => platform.id === id) ? id : 'linux';
};

export const installHref = id => `/install?platform=${platformFromSearch(`?platform=${encodeURIComponent(id)}`)}`;

export const buildInstallCommand = (id, release = installRelease) => {
    if (process.env.NODE_ENV !== 'development') return null;
    if (!platforms.some(platform => platform.id === id && platform.script)) return null;
    if (!release.ready || release.base.includes('PENDING')) return null;
    // Strict URL characters keep either shell's quoting intact. Only this fixed
    // release's distribution directory is accepted; no credentials or queries.
    const match = /^https:\/\/web\.toany\.net\/ddnsto-install\/([0-9.]+)\/([A-Za-z0-9-]+)$/.exec(release.base);
    if (!match || match[1] !== release.version) return null;
    if (id === 'windows') {
        return `$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12; $entry=(Invoke-WebRequest -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 60 '${release.base}/install.ps1').Content; if ([string]::IsNullOrWhiteSpace($entry) -or $entry.TrimStart().StartsWith('<')) { throw 'Download rejected: expected PowerShell script' }; & ([ScriptBlock]::Create($entry))`;
    }
    return `sh -c 'entry=$(curl -fsSL --retry 2 --connect-timeout 10 --max-time 60 --proto "=https" --proto-redir "=https" "${release.base}/install.sh") || exit 1; if [ "$(printf "%s\\n" "$entry" | head -n 1)" != "#!/bin/sh" ]; then printf "%s\\n" "Download rejected: expected shell script" >&2; exit 1; fi; sh -c "$entry" install.sh'`;
};

export const copyInstallCommand = async (command, clipboard) => {
    if (!command) return 'idle';
    try {
        await clipboard.writeText(command);
        return 'copied';
    } catch {
        return 'manual';
    }
};

// Candidate contract only. Never infer these capabilities for the published release.
export const debugActions = ['install', 'update', 'status', 'start', 'stop', 'restart'];
export const nativeLifecycleActions = ['repair', 'configure', 'uninstall'];
export const debugMethods = ['auto', 'native'];
export const dockerActions = [...debugActions, 'uninstall'];
export const buildDebugCommand = ({ base, platform = 'auto', method = 'auto', action = 'install', architecture, installMode, deviceName, network } = {}) => {
    if (process.env.NODE_ENV !== 'development') return null;
    const synology = platform === 'synology';
    const docker = method === 'docker';
    const firstInstall = docker && action === 'install' && installMode === 'first';
    if (synology) {
        if (action !== 'download' || method !== 'auto') return null;
    } else if (docker) {
        if (platform !== 'linux' || architecture !== 'amd64' || !dockerActions.includes(action)) return null;
        if (action === 'install' && !['first', 'existing'].includes(installMode)) return null;
        if (firstInstall) {
            if (typeof deviceName !== 'string' || !/^[A-Za-z0-9_][A-Za-z0-9_-]{0,127}$/.test(deviceName)
                || !['bridge', 'host'].includes(network)) return null;
        } else if (deviceName !== undefined || network !== undefined) return null;
    } else if (!['auto', 'linux', 'openwrt', 'macos', 'windows'].includes(platform)
        || !debugMethods.includes(method)
        || !(debugActions.includes(action) || (method === 'native' && platform !== 'auto' && nativeLifecycleActions.includes(action)))) return null;
    // A fixed version/build directory, with no shell metacharacters, credentials,
    // query, fragment or floating aliases. Entrypoint filenames are never editable.
    if (typeof base !== 'string' || !/^https:\/\/[A-Za-z0-9.-]+(?::[0-9]+)?\/ddnsto-install\/[0-9]+\.[0-9]+\.[0-9]+\/[A-Za-z0-9-]+$/.test(base)) return null;
    if (/\/(?:latest|current|PENDING)$/i.test(base) || base.endsWith(`/${installRelease.version}/${installRelease.build}`)) return null;
    if ((synology || docker) && !base.includes('/ddnsto-install/0.2.0/')) return null;
    if (platform === 'windows') {
        return `$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12; $entry=(Invoke-WebRequest -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 60 '${base}/install.ps1').Content; if ([string]::IsNullOrWhiteSpace($entry) -or ($entry -split "\\r?\\n",2)[0] -ne '# Engineering candidate. Automatic zsetup bootstrap; native canary pending.') { throw 'Download rejected: expected PowerShell script' }; & ([ScriptBlock]::Create($entry)) -Platform ${platform} -Method ${method} -Action ${action}`;
    }
    const args = synology ? '--platform synology --action download'
        : `--platform ${platform} --method ${method} --action ${action}${firstInstall ? ` --device-name ${deviceName} --network ${network}` : ''}`;
    return `sh -c 'entry=$(curl -fsSL --retry 2 --connect-timeout 10 --max-time 60 --proto "=https" --proto-redir "=https" "${base}/install.sh") || exit 1; if [ "$(printf "%s\\n" "$entry" | head -n 1)" != "#!/bin/sh" ]; then printf "%s\\n" "Download rejected: expected shell script" >&2; exit 1; fi; sh -c "$entry" install.sh ${args}'`;
};
