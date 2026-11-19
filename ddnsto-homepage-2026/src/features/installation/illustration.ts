import type { InstallStep, InstallPlatform } from '@/content/installation';
const esc = (s: string) =>
  s.replace(
    /[&<>\"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\"': '&quot;',
        "'": '&#39;',
      })[c] ?? c,
  );
const docker = [
  'Docker',
  '飞牛',
  '爱快',
  'Unraid',
  '铁威马',
  '极空间',
  '绿联NAS',
];
const field = (label: string, value: string) =>
  `<div class="si-field"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
export function illustration(step: InstallStep, p: InstallPlatform, i: number) {
  if (step.illustrationHtml) return step.illustrationHtml;
  const isDocker = docker.includes(p.name),
    label = p.name.startsWith('ASUSGO') ? '华硕 / ASUSGO' : p.label;
  let content = '';
  if (step.kind === 'store')
    content = `<div class="si-search">搜索应用 <strong>DDNSTO</strong></div><div class="si-app"><div class="si-app-logo">D</div><div><b>DDNSTO</b><span>远程访问你的设备</span></div><span class="si-action">安装</span></div><div class="si-placeholder"></div><div class="si-placeholder short"></div>`;
  else if (step.kind === 'scan')
    content = `<div class="si-caption">DDNSTO 远程控制</div><div class="si-scan-card"><strong>自动扫码配置 <small>推荐</small></strong><b>微信扫码，自动完成配置</b><p>账号、令牌和访问域名自动关联</p><span class="si-action">扫码自动配置</span></div>`;
  else if (step.kind === 'domain')
    content = `<div class="si-domain-card"><div class="si-caption">为服务生成远程链接</div><small>内网地址：192.168.100.1:80</small><div class="si-choice">◉ 默认地址</div><div class="si-domain-value">https://home-demo.example.com</div><div class="si-choice muted">○ 自定义地址</div><span class="si-action">确定，生成链接</span></div>`;
  else if (step.kind === 'console')
    content = `<div class="si-caption">设备工作台</div><div class="si-console-summary"><strong>1 <small>台设备</small></strong><span class="si-online">1 在线</span></div><div class="si-device-card"><div><strong>${esc(label)}</strong><span class="si-online">在线</span></div><small>ID：demo••••01　服务器：示例服务器</small><div class="si-device-nav">外网域名（1） · 远程应用 · 文件管理</div><div class="si-domain-value">home-demo.example.com</div></div>`;
  else if (step.kind === 'token')
    content = `<div class="si-caption">DDNSTO · 设备配置</div>${field('账号令牌', '••••••••-••••-••••-••••-••••••••••••')}${field('设备名称', isDocker ? 'my-device' : label)}<div class="si-hint">从 DDNSTO 控制台获取令牌，填写到设备</div>`;
  else if (step.kind === 'download')
    content = `<div class="si-file-icon">↓</div><div class="si-file-name">${esc(p.name === 'Windows' ? 'ddnsto.exe' : p.name === 'Linux' ? 'DDNSTO · Linux 程序包' : p.name === 'Synology' ? 'DDNSTO · SPK 套件' : p.name === 'QNAP' ? 'DDNSTO · QPKG 安装包' : 'DDNSTO · DEB 安装包')}</div><div class="si-hint">${p.name === 'Windows' ? '下载 → 解压 → 运行' : '选择与你的设备版本及架构匹配的安装包'}</div>`;
  else if (step.kind === 'upload')
    content = `<div class="si-caption">${p.name === 'Synology' ? '套件中心' : p.name === 'QNAP' ? 'App Center' : '应用程序'}</div><div class="si-upload"><span>↑</span><b>DDNSTO 安装包</b><small>手动安装</small></div><span class="si-action si-right">下一步</span>`;
  else if (step.kind === 'docker')
    content = `<div class="si-caption">Docker · 创建容器</div>${field('镜像', 'linkease/ddnsto')}${field('TOKEN', '••••••••••••••••')}${field('设备名称', 'my-device')}`;
  else if (step.kind === 'terminal')
    content = `<div class="si-caption">${esc(label)} · 终端</div><div class="si-terminal"><span>DDNSTO</span><p>${i === 0 ? '准备安装程序' : '使用账号令牌启动服务'}</p><small>命令及参数见对应平台文档</small></div>`;
  else if (step.kind === 'ready')
    content = `<div class="si-caption">${isDocker ? 'Docker · DDNSTO' : 'DDNSTO'}</div><div class="si-ready"><span>✓</span><strong>${isDocker ? '容器运行中' : '服务已启用'}</strong><small>在控制台查看已关联的设备</small></div>`;
  else
    content = `<div class="si-caption">${esc(label)} · ${esc(step.title)}</div>${field('应用', 'DDNSTO')}${field('位置', p.name === 'Padavan' ? '扩展功能 → 花生壳内网' : isDocker ? 'Docker' : '服务 → DDNSTO')}<span class="si-action si-right">${p.name === 'Padavan' ? 'DDNSTO' : '打开应用'}</span>`;
  return `<div class="si-window" role="img" aria-label="${esc(label + '：' + step.title + '，界面示意')}"><div class="si-window-bar"><span class="si-dots">● ● ●</span><span>${esc(label)}</span><small>界面示意</small></div><div class="si-window-content">${content}</div></div>`;
}
