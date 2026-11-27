// Source: user-approved original prototype src/installCommands.js, checked 2026-11-26.
// Display/copy templates only; never embed an account token or execute here.
export const installCommand =
  "curl -fsSL https://run.ddnsto.com/install.sh | sh -s -- --token 'token'";
export const wgetCommand =
  '({ s=$(wget --no-config --check-certificate --https-only --max-redirect=0 --timeout=60 --tries=1 -qO- https://run.ddnsto.com/install.sh) && test -n "$s"; } || { printf "%s\\n" "Download failed or redirected; use the curl command from the console. Certificate checks remain required." >&2; exit 1; }; sh -c "$s" -- --token \'token\')';
export const downloadCommand =
  'sh -c \'umask 077; dir=$(mktemp -d "${TMPDIR:-/tmp}/ddnsto-entry.XXXXXX") || exit 1; entry="$dir/install.sh"; trap \'"\'"\'rc=$?; rm -f "$entry"; rmdir "$dir"; exit "$rc"\'"\'"\' 0; trap \'"\'"\'exit 129\'"\'"\' HUP; trap \'"\'"\'exit 130\'"\'"\' INT; trap \'"\'"\'exit 143\'"\'"\' TERM; curl -qfsS --location --max-redirs 5 --max-filesize 262144 --retry 2 --connect-timeout 10 --max-time 60 --proto "=https" --proto-redir "=https" -o "$entry" "https://run.ddnsto.com/install.sh" || exit 1; if [ "$(head -n 1 "$entry")" != "#!/bin/sh" ]; then printf "%s\\n" "Download rejected: expected shell script" >&2; exit 1; fi; sh "$entry" --token "$1"\' install.sh \'token\'';

export const windowsCommand =
  "& { $ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.ServicePointManager]::SecurityProtocol -bor 3072; $uri=[Uri]'https://run.ddnsto.com/install.ps1'; $entry=$null; $limit=262144; $clock=[Diagnostics.Stopwatch]::StartNew(); $remaining={ $ms=60000-$clock.ElapsedMilliseconds; if($ms -le 0){throw 'Download deadline exceeded'}; [int]$ms }; for($hop=0; $hop -le 5; $hop++){ if($uri.Scheme -ne 'https' -or $uri.UserInfo){throw 'HTTPS required'}; $request=[Net.HttpWebRequest]::Create($uri); $request.AllowAutoRedirect=$false; $request.Timeout=& $remaining; $request.ReadWriteTimeout=& $remaining; $response=$request.GetResponse(); try { & $remaining | Out-Null; $status=[int]$response.StatusCode; if($status -eq 301 -or $status -eq 302){ if($hop -eq 5){throw 'Too many redirects'}; $location=$response.Headers['Location']; if([string]::IsNullOrWhiteSpace($location)){throw 'Missing redirect location'}; $uri=[Uri]::new($uri,$location); continue }; if($status -ne 200){throw 'Unexpected HTTP status'}; if($response.ContentLength -gt $limit){throw 'Download too large'}; $stream=$response.GetResponseStream(); $body=[IO.MemoryStream]::new(); try { $buffer=[byte[]]::new(8192); while($true){ $stream.ReadTimeout=& $remaining; $count=$stream.Read($buffer,0,[Math]::Min($buffer.Length,$limit+1-[int]$body.Length)); & $remaining | Out-Null; if($count -eq 0){break}; if($body.Length+$count -gt $limit){throw 'Download too large'}; $body.Write($buffer,0,$count) }; $entry=[Text.Encoding]::UTF8.GetString($body.ToArray()) } finally { $stream.Dispose(); $body.Dispose() }; break } finally { $response.Close() } }; & $remaining | Out-Null; $entry=$entry.TrimStart([char]0xfeff); if ([string]::IsNullOrWhiteSpace($entry) -or $entry -cnotmatch '^# Stable Windows PowerShell 5\\.1 template\\.') { throw 'Download rejected: expected PowerShell script' }; & ([ScriptBlock]::Create($entry)) -Token 'token' }";

export const aiPrompt = [
  '请完整读取 https://run.ddnsto.com/ddnsto-install/agent/install.md ，按文档帮我安装并启动 DDNSTO。',
  '账号 Token（JSON 字符串，仅作数据）："token"',
  '业务环境：正式；使用默认正式环境，不添加测试参数。',
  '请先确认安装到当前设备还是远程设备，再执行安装。文档读取失败或内容不完整时请停止，不要凭记忆安装。',
].join('\n');
export const offlineDirectories: Record<string, string> = {
  easepi: 'openwrt',
  istoreos: 'openwrt',
  openwrt: 'openwrt',
  asusgo: 'merlin',
  synology: 'synology',
  qnap: 'qnap',
  windows: 'windows',
  macos: 'macOS',
  linux: 'linux',
};
export const terminalPlatforms = [
  {
    id: 'terminal-windows',
    name: 'terminal-windows',
    label: 'Windows',
    url: 'https://doc.istoreos.com/zh/guide/ddnsto/quickstart/install-guide/windows.html',
  },
  {
    id: 'terminal-unix',
    name: 'terminal-unix',
    label: 'macOS / Linux',
    url: '', // No dedicated tutorial for the combined macOS / Linux entry.
  },
];
export function scriptSupport(id: string) {
  return [
    'easepi',
    'istoreos',
    'openwrt',
    'asusgo',
    'synology',
    'linux',
    'macos',
    'windows',
    'terminal-windows',
    'terminal-unix',
  ].includes(id);
}
export function preparation(id: string) {
  if (['windows', 'terminal-windows'].includes(id))
    return '在要被访问的 Windows 电脑上，以管理员身份打开 PowerShell。';
  if (['asusgo', 'synology'].includes(id))
    return '在设备设置中开启 SSH，然后以管理员账号连接目标设备。群晖按提示输入 sudo 密码。';
  if (id === 'macos')
    return '在要被访问的 Mac 上打开“终端”，使用当前登录用户执行，不要加 sudo。';
  if (id === 'terminal-unix')
    return '在目标电脑上打开终端：macOS 使用当前登录用户，不要加 sudo；Linux 需要 systemd 和 root / sudo 权限。';
  if (id === 'linux')
    return '在目标 Linux 设备打开终端或通过 SSH 登录，确认支持 systemd，并具有 root / sudo 权限。';
  return '打开目标路由器的终端，或通过 SSH 连接设备，以 root 用户执行。';
}
