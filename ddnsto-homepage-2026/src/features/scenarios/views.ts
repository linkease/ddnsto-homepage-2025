// View markup adapted from reference/design/v2/assets/scenario-tabs.js.
// Pure renderers: no timers, event handlers, network requests or mutable global state.
import type { DemoState } from './state';
import { services } from './state';
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
function steps(labels: string[], n: number) {
  return (
    '<div class="lab-steps">' +
    labels
      .map(
        (x, i) =>
          `<span class="${i === n ? 'current' : ''}">${i + 1} · ${x}</span>`,
      )
      .join('') +
    '</div>'
  );
}
const btn = (action: string, text: string, secondary = false) =>
  `<button type="button" class="btn${secondary ? ' secondary' : ''}" data-action="${action}">${text}</button>`;
const copyIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg>';
export function renderApps(s: DemoState['apps']) {
  let html = steps(
    ['发现应用', '选择服务', '添加并访问'],
    Math.max(0, s.step - 1),
  );
  if (s.step === 0)
    return (
      html +
      `<div class="lab-center"><div class="lab-symbol" aria-hidden="true">⌕</div><h3>发现你家里的应用</h3><p>示例设备「家里的 iStoreOS」已在线。<br>扫描它所在的局域网，找到可添加的 Web 服务。</p>${btn('scan', '开始发现应用')}</div>`
    );
  if (s.step === 1)
    return (
      html +
      `<div class="lab-center"><h3>正在发现设备上的 Web 应用</h3><p>正在演示扫描过程，不会访问你的网络。</p><div class="lab-progress">${['检测当前设备网段', '检测 HTTP / HTTPS 端口', '识别服务名称', '生成域名候选'].map((x, i) => `<div class="${i < s.progress ? 'done' : ''}">${i < s.progress ? '✓' : '○'} ${x}</div>`).join('')}</div>${btn('cancel-scan', '取消发现', true)}</div>`
    );
  if (s.step === 2)
    return (
      html +
      `<div class="lab-note">已发现 3 个示例服务。勾选需要远程访问的应用，再一键添加。</div><label class="lab-prefix">设备前缀 <input id="lab-prefix" maxlength="20" value="${escape(s.prefix)}" aria-label="设备前缀"></label><label class="lab-service"><input type="checkbox" id="lab-all" ${s.selected.length === 3 ? 'checked' : ''}>全选</label><div class="lab-list">${services.map((v, i) => `<label class="lab-service"><input type="checkbox" data-service="${i}" ${s.selected.includes(i) ? 'checked' : ''}><span><strong>${v.name}</strong><small>HTTP · ${v.ip}</small></span><em>可能可访问</em></label>`).join('')}</div><div class="lab-actions"><button class="btn" data-action="add" ${s.selected.length ? '' : 'disabled'}>一键添加${s.selected.length ? '（' + s.selected.length + '）' : ''}</button>${btn('scan', '重新发现', true)}<span>只添加你认识、需要访问的服务。</span></div><p id="lab-error" class="lab-error" role="status"></p>`
    );
  return (
    html +
    `<div class="domain-success" role="status"><span aria-hidden="true">✓</span><div><strong>域名添加成功</strong><small>已添加 ${s.selected.length} 个域名，点击蓝色外网域名即可访问。</small></div></div><div class="domain-toolbar"><strong>外网域名 <span>${s.selected.length}</span></strong><label>访问协议 <select id="domain-protocol"><option value="https" ${s.protocol === 'https' ? 'selected' : ''}>HTTPS</option><option value="http" ${s.protocol === 'http' ? 'selected' : ''}>HTTP</option></select></label></div><div class="domain-table-scroll" tabindex="0" role="region" aria-label="已添加的示例域名列表"><table class="domain-table"><thead><tr><th>外网域名</th><th>内网地址</th><th>备注</th><th>操作</th></tr></thead><tbody>${s.selected.map((i) => `<tr><td><div class="domain-address"><button class="domain-url" data-open-service="${i}" title="访问 ${escape(s.prefix)}-${services[i].slug}（模拟）">${s.protocol}://${escape(s.prefix)}-${services[i].slug}.example.com</button><button class="domain-icon" data-copy-domain="${i}" aria-label="复制${services[i].name}的外网域名" title="复制外网域名">${copyIcon}</button></div></td><td><span class="domain-target">http://${services[i].ip}</span></td><td>${services[i].name}</td><td><button class="domain-icon" data-bookmark="${i}" aria-label="${s.bookmarks.includes(i) ? '取消' : '添加'}${services[i].name}书签" aria-pressed="${s.bookmarks.includes(i)}" title="${s.bookmarks.includes(i) ? '取消' : '添加'}书签"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg></button></td></tr>`).join('')}</tbody></table></div><p id="domain-action-status" class="lab-status" role="status"></p>${s.opened !== null ? `<div class="lab-preview"><strong>${services[s.opened].name} · 模拟页面</strong><p>${['下载任务：旅行照片.zip · 已完成<br>你可以在外查看家里的下载进度。', '家庭文件：照片、文档、视频<br>你可以在外打开家里的文件服务。', '客厅温度：24°C · 灯光已关闭<br>你可以在外查看家里的设备状态。'][s.opened]}</p></div>` : ''}`
  );
}
export const pcFolders: Record<string, Record<string, string>> = {
  工作文档: {
    '项目计划.txt':
      '项目计划（示例）\n\n1. 整理本周需求\n2. 完成官网方案\n3. 与同事确认下一步计划',
    '会议纪要.txt':
      '会议纪要（示例）\n\n讨论事项：远程访问与设备管理。\n下一步：整理教程，验证访问流程。',
  },
  个人文件: {
    '旅行清单.txt':
      '旅行清单（示例）\n\n相机、充电器、身份证。\n文件留在家中，也能远程查看。',
    '读书笔记.txt': '读书笔记（示例）\n\n把灵感整理下来，下次继续。',
  },
  项目资料: {
    '产品需求.txt': '产品需求（示例）\n\n让用户快速找到自己的设备和使用场景。',
    '更新记录.txt': '更新记录（示例）\n\n已完成：官网场景交互演示。',
  },
};
const pcIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8M12 16v5"/></svg>';
const folderIcon =
  '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M3 9a4 4 0 0 1 4-4h12l5 5h17a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#e8ad32"/><path d="M3 15h42v18a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#ffcf65"/></svg>';
export function renderTcp(s: DemoState['tcp']) {
  let html = steps(['立即使用', '添加桌面', '访问桌面'], Math.min(s.step, 2));

  if (s.step === 0)
    return (
      html +
      `<div class="lab-center"><div class="lab-symbol">${pcIcon}</div><h3>远程桌面 · 已启用</h3><p>此处模拟浏览器桌面；TCP 转发需配合本地 RDP / VNC 客户端。</p>${btn('rd-start', '立即使用')}</div>`
    );
  if (s.step === 1)
    return (
      html +
      `<div class="rd-form-head"><h3>添加远程桌面</h3><p>配置新的远程桌面连接 · 示例已填好</p></div><div class="rd-form rd-form-compact"><label>桌面名称<input readonly value="家里 Windows" aria-label="桌面名称"></label><fieldset><legend>桌面类型</legend><div class="rd-types"><button data-action="rd-rdp" aria-pressed="${s.protocol === 'RDP'}">远程 RDP</button><button data-action="rd-vnc" aria-pressed="${s.protocol === 'VNC'}">远程 VNC</button></div></fieldset><label>网页服务器<select aria-label="网页服务器"><option>kooldns.cn（示例）</option></select></label>${s.protocol === 'RDP' ? '<label>RDP security<select aria-label="RDP security"><option>自动协商</option></select></label>' : '<div class="rd-vnc-info">VNC 使用默认连接设置</div>'}<label>目标 IP<input readonly value="192.168.1.100" aria-label="目标 IP"></label><label>端口<input readonly value="${s.protocol === 'RDP' ? '3389' : '5900'}" aria-label="端口"></label><label>用户名<input readonly value="demo-user" aria-label="用户名" autocomplete="off"></label><label>密码<input readonly type="password" value="Demo-Only-2026" aria-label="示例密码" autocomplete="off"></label><div class="rd-full rd-tcp-option"><label class="rd-check"><input type="checkbox" id="rd-create-tcp" ${s.tcp ? 'checked' : ''}>同时创建 TCP 转发</label><small class="rd-helper">仅演示 TCP 转发选项，实际能力与套餐以官方说明为准。</small></div></div><div class="lab-actions">${btn('rd-cancel', '取消', true)}${btn('rd-add', '添加桌面')}</div>`
    );
  if (s.step === 2)
    return (
      html +
      `<div class="rd-card"><div class="rd-card-title"><span class="lab-symbol">${pcIcon}</span><div><strong>家里 Windows</strong><small>远程桌面 · ${s.protocol}</small></div><button class="lab-link" data-action="rd-edit">编辑</button></div><div class="rd-card-target"><div><span>目标地址</span><strong>192.168.1.100:${s.protocol === 'RDP' ? '3389' : '5900'}</strong></div><div><span>网页服务器</span><strong>kooldns.cn</strong></div>${btn('rd-web', '网页访问', true)}</div></div>`
    );
  return (
    html +
    `<div class="pc-desktop"><div class="pc-session"><span>${pcIcon} 家里 Windows · ${s.connection}（模拟）</span><button data-action="rd-disconnect" aria-label="断开模拟连接">断开</button></div><div class="pc-icons">${Object.keys(
      pcFolders,
    )
      .map(
        (name) =>
          `<button data-pc-folder="${name}">${folderIcon}<span>${name}</span></button>`,
      )
      .join('')}</div>${
      s.folder
        ? `<div class="pc-window"><div class="pc-window-title"><strong>${s.file ? s.file : s.folder}</strong><button data-action="pc-close" aria-label="关闭文件窗口">×</button></div><div class="pc-breadcrumb"><button data-action="pc-back">${s.file ? '返回文件夹' : '此电脑'}</button><span> / ${s.folder}</span></div>${
            s.file
              ? `<pre class="pc-document">${escape(pcFolders[s.folder][s.file])}</pre>`
              : `<div class="pc-file-list"><div><span>名称</span><span>类型</span></div>${Object.keys(
                  pcFolders[s.folder],
                )
                  .map(
                    (file) =>
                      `<button data-pc-file="${file}"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5zM9 11h6M9 15h6"/></svg>${file}</span><small>文本文档</small></button>`,
                  )
                  .join('')}</div>`
          }</div>`
        : '<div class="pc-desktop-hint">点击文件夹，查看远处电脑里的文件</div>'
    }<div class="pc-taskbar"><span class="pc-start" aria-hidden="true">⊞</span><span>${folderIcon}</span><small>远程桌面演示</small><span>09:41</span></div></div>`
  );
}
const fileServerIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="7" rx="2"/><rect x="4" y="14" width="16" height="7" rx="2"/><path d="M8 6.5h.01M8 17.5h.01"/></svg>';
export function renderFiles(s: DemoState['files']) {
  const head = steps(
    ['立即使用', '配置文件应用', '访问文件'],
    Math.min(s.step, 2),
  );
  if (s.step === 0)
    return (
      head +
      `<div class="lab-center"><div class="lab-symbol">${folderIcon}</div><h3>文件管理 · 已启用</h3><p>在浏览器中直接浏览、上传、下载设备文件，无需本地工具</p>${btn('fm-start', '立即使用')}</div>`
    );
  if (s.step === 1)
    return (
      head +
      `<div class="rd-form-head"><h3>编辑文件管理应用</h3><p>修改文件管理应用配置信息 · 示例已填好</p></div><div class="fm-config"><label>类型<select aria-label="文件管理类型"><option>WebDav</option></select></label><label>名称<input readonly value="家里文件" aria-label="文件应用名称"></label><label class="rd-full">URL<input readonly value="http://127.0.0.1:3033/webdav" aria-label="WebDAV URL"></label><label>账号<input readonly value="demo-user" aria-label="WebDAV 账号" autocomplete="off"></label><label>密码<span class="fm-password"><input readonly type="password" id="fm-password" value="Demo-Only-2026" aria-label="WebDAV 示例密码" autocomplete="off"><button type="button" data-action="fm-show-password" aria-label="显示示例密码">显示</button></span></label><fieldset class="rd-full fm-remember"><legend>记住密码</legend><label><input type="radio" name="fm-remember" value="no" ${!s.remember ? 'checked' : ''}>不保存</label><label><input type="radio" name="fm-remember" value="yes" ${s.remember ? 'checked' : ''}>仅本次演示记住</label></fieldset></div><div class="fm-help"><a href="https://doc.linkease.com/zh/guide/ddnsto/ddnstofile.html" target="_blank" rel="noopener">遇到困难？点击查看教程</a><button class="btn secondary" data-action="fm-diagnose">高级诊断</button></div><p id="fm-diagnostic" class="lab-status" role="status"></p><div class="lab-actions">${btn('fm-save', '保存')}${btn('fm-cancel', '取消', true)}</div>`
    );
  if (s.step === 2)
    return (
      head +
      `<div class="fm-app-card"><div class="fm-app-title"><span class="lab-symbol">${fileServerIcon}</span><div><strong>家里文件</strong><div class="fm-badges"><span>WebDAV</span><span>可打开</span></div></div></div><div class="fm-app-address"><span>内网地址</span><strong>http://127.0.0.1:3033/webdav</strong></div><div class="fm-card-actions"><button class="btn secondary" data-action="fm-bookmark" aria-pressed="${s.bookmarked}">${s.bookmarked ? '已收藏' : '添加收藏'}</button>${btn('fm-edit', '编辑', true)}${btn('fm-delete', '删除', true)}${btn('fm-access', '访问')}</div></div><p id="fm-card-status" class="lab-status" role="status"></p>`
    );
  return (
    head +
    `<div class="nas-desktop"><div class="nas-top"><span>家里文件 · NAS 桌面（模拟）</span><button data-action="fm-return">返回应用</button></div><div class="nas-icons"><button data-action="fm-open"><span class="nas-folder">${folderIcon}</span><span>文件管理</span></button><button data-action="fm-storage"><span class="nas-storage">${fileServerIcon}</span><span>存储管理器</span></button><button data-action="fm-ddnsto"><img src="/images/brand/ddnsto-logo.png" alt=""><span>DDNSTO</span></button></div>${s.window ? `<div class="nas-window"><div class="nas-window-head"><strong>文件管理</strong><button data-action="fm-close" aria-label="关闭文件管理">×</button></div><div class="nas-file-layout"><aside><strong>我的文件</strong><button data-action="files-root">家里文件</button><span>WebDAV · 已连接</span></aside><div class="nas-file-content"><div class="nas-breadcrumb"><button data-action="files-root">家里文件</button>${s.folder ? '<span> / 工作文档</span>' : ''}</div><div class="nas-file-table"><div class="nas-file-columns"><span>名称</span><span>类型</span><span>大小</span></div>${s.folder ? ['项目计划.txt', '会议纪要.txt'].map((f) => `<button data-file="${f}"><span>${f}</span><small>文本</small><small>1 KB</small></button>`).join('') : '<button data-action="files-folder"><span>▰ 工作文档</span><small>文件夹</small><small>—</small></button>'}</div>${s.file ? `<div class="fm-file-preview"><strong>${s.file}</strong><p>${s.file === '项目计划.txt' ? '项目计划（演示）<br>1. 整理本周需求<br>2. 完成官网方案<br>3. 与同事分享进度' : '会议纪要（演示）<br>议题：远程访问需求<br>下一步：体验设备与文件管理流程'}</p>${btn('files-download', '下载示例文件')}<p id="download-status" class="lab-status" role="status"></p></div>` : ''}</div></div></div>` : '<div class="nas-desktop-tip">点击「文件管理」，打开远处设备上的文件。</div>'}<div class="nas-dock"><button data-action="fm-open" aria-label="打开文件管理">${folderIcon}</button><span id="nas-status" role="status">示例桌面</span></div></div>`
  );
}
export function renderDevice(s: DemoState['device']) {
  const top = steps(['开启远程访问', '生成设备链接', '控制台查看设备'], s.step);
  if (s.step === 2)
    return (
      top +
      `<div class="asus-console"><div class="asus-console-head"><img src="/images/brand/ddnsto-logo.png" alt="DDNSTO"><strong>DDNSTO 控制台</strong><span>模拟界面</span></div><div class="asus-console-page"><h3>我的设备 <small>1 台设备</small></h3><article class="asus-console-card"><div class="asus-console-device"><span class="lab-symbol">${pcIcon}</span><div><strong>华硕 RT-AX86U</strong><span class="asus-online">在线</span><small>设备 ID：asus-demo-86u · 客户端已连接</small></div></div><div class="asus-console-tabs"><span class="selected">外网域名 (1)</span><span>远程应用</span><span>文件管理</span><span>远程桌面</span></div><div class="asus-console-domain"><div><small>外网域名</small><strong>https://device-home.example.com</strong></div><div><small>内网地址</small><span>http://192.168.50.1:80</span></div><div><small>备注</small><span>华硕路由器管理页面</span></div></div></article><p class="asus-console-success" role="status">设备已出现在控制台，远程访问链接已关联（模拟）。</p></div></div>`
    );
  return (
    top +
    `<div class="asus-software"><div class="asus-router-bar"><strong>ASUS <span>RT-AX86U</span></strong><span>Asuswrt-Merlin</span></div><div class="asus-software-content"><div class="asus-software-title"><h3>ASUSGO for RT-AX86U</h3><span>软件中心 <b>V1.9.60</b></span></div><div class="asus-ddnsto"><div class="asus-ddnsto-title"><img src="/images/brand/ddnsto-logo.png" alt=""><strong>DDNSTO 远程访问</strong><span>${s.step === 1 ? '域名 1/5' : '域名待确认'}</span>${s.step === 1 ? '<b class="asus-enabled">已启用</b>' : ''}</div>${s.step === 0 ? `<div class="asus-enable-row"><p>在外也能管理这台设备。</p><button class="asus-primary" data-action="asus-enable" ${s.generating ? 'disabled' : ''}>${s.generating ? '正在生成链接…' : '启用远程访问'}</button></div>` : `<div class="asus-generated"><span class="asus-device-chip">本设备</span><div><small>已为本设备生成远程链接</small><code>https://device-home.example.com</code><small>内网地址：192.168.50.1:80</small></div></div><div class="asus-next"><span>下一步，在控制台查看这台设备</span><button class="asus-primary" data-action="asus-console">去控制台看设备</button></div>`}<p class="asus-live" role="status">${s.generating ? '正在演示启用与自动生成链接，不连接真实路由器。' : s.step === 1 ? '示例链接仅用于展示，不连接真实设备。' : ''}</p></div></div></div>`
  );
}
