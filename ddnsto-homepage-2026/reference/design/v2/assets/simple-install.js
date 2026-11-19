(()=>{'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const doc='https://doc.linkease.com/zh/guide/ddnsto/install/device/';
const software=['EasePi','iStoreOS','Koolcenter Lede','OpenWrt'];
const docker=['Docker','飞牛','爱快','Unraid','铁威马','极空间','绿联NAS'];
const make=(title,text,kind,fields=[])=>({title,text,kind,fields,links:[]});
const field=(label,value)=>`<div class="si-field"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
function illustration(step,p,i){
 const isDocker=docker.includes(p.name),label=p.name.startsWith('ASUSGO')?'华硕 / ASUSGO':p.label;
 let content='';
 if(step.kind==='store')content=`<div class="si-search">搜索应用 <strong>DDNSTO</strong></div><div class="si-app"><div class="si-app-logo">D</div><div><b>DDNSTO</b><span>远程访问你的设备</span></div><span class="si-action">安装</span></div><div class="si-placeholder"></div><div class="si-placeholder short"></div>`;
 else if(step.kind==='scan')content=`<div class="si-caption">DDNSTO 远程控制</div><div class="si-scan-card"><strong>自动扫码配置 <small>推荐</small></strong><b>微信扫码，自动完成配置</b><p>账号、令牌和访问域名自动关联</p><span class="si-action">扫码自动配置</span></div>`;
 else if(step.kind==='domain')content=`<div class="si-domain-card"><div class="si-caption">为服务生成远程链接</div><small>内网地址：192.168.100.1:80</small><div class="si-choice">◉ 默认地址</div><div class="si-domain-value">https://home-demo.gd.ddnsto.com</div><div class="si-choice muted">○ 自定义地址</div><span class="si-action">确定，生成链接</span></div>`;
 else if(step.kind==='console')content=`<div class="si-caption">设备工作台</div><div class="si-console-summary"><strong>1 <small>台设备</small></strong><span class="si-online">1 在线</span></div><div class="si-device-card"><div><strong>${esc(label)}</strong><span class="si-online">在线</span></div><small>ID：demo••••01　服务器：gd.ddnsto.com</small><div class="si-device-nav">外网域名（1） · 远程应用 · 文件管理</div><div class="si-domain-value">home-demo.gd.ddnsto.com</div></div>`;
 else if(step.kind==='token')content=`<div class="si-caption">DDNSTO · 设备配置</div>${field('账号令牌','••••••••-••••-••••-••••-••••••••••••')}${field('设备名称',isDocker?'my-device':label)}<div class="si-hint">从 DDNSTO 控制台获取令牌，填写到设备</div>`;
 else if(step.kind==='download')content=`<div class="si-file-icon">↓</div><div class="si-file-name">${esc(p.name==='Windows'?'ddnsto.exe':p.name==='Linux'?'DDNSTO · Linux 程序包':p.name==='Synology'?'DDNSTO · SPK 套件':p.name==='QNAP'?'DDNSTO · QPKG 安装包':'DDNSTO · DEB 安装包')}</div><div class="si-hint">${p.name==='Windows'?'下载 → 解压 → 运行':'选择与你的设备版本及架构匹配的安装包'}</div>`;
 else if(step.kind==='upload')content=`<div class="si-caption">${p.name==='Synology'?'套件中心':p.name==='QNAP'?'App Center':'应用程序'}</div><div class="si-upload"><span>↑</span><b>DDNSTO 安装包</b><small>手动安装</small></div><span class="si-action si-right">下一步</span>`;
 else if(step.kind==='docker')content=`<div class="si-caption">Docker · 创建容器</div>${field('镜像','linkease/ddnsto')}${field('TOKEN','••••••••••••••••')}${field('设备名称','my-device')}`;
 else if(step.kind==='terminal')content=`<div class="si-caption">${esc(label)} · 终端</div><div class="si-terminal"><span>DDNSTO</span><p>${i===0?'准备安装程序':'使用账号令牌启动服务'}</p><small>命令及参数见对应平台文档</small></div>`;
 else if(step.kind==='ready')content=`<div class="si-caption">${isDocker?'Docker · DDNSTO':'DDNSTO'}</div><div class="si-ready"><span>✓</span><strong>${isDocker?'容器运行中':'服务已启用'}</strong><small>在控制台查看已关联的设备</small></div>`;
 else content=`<div class="si-caption">${esc(label)} · ${esc(step.title)}</div>${field('应用','DDNSTO')}${field('位置',p.name==='Padavan'?'扩展功能 → 花生壳内网':isDocker?'Docker':'服务 → DDNSTO')}<span class="si-action si-right">${p.name==='Padavan'?'DDNSTO':'打开应用'}</span>`;
 return `<div class="si-window" role="img" aria-label="${esc(label+'：'+step.title+'，界面示意')}"><div class="si-window-bar"><span class="si-dots">● ● ●</span><span>${esc(label)}</span><small>界面示意</small></div><div class="si-window-content">${content}</div></div>`;
}
function workflow(p){
 if(software.includes(p.name)||p.name.startsWith('ASUSGO'))return [make('安装软件','在软件中心搜索并安装 DDNSTO；已安装可直接打开。','store'),make('扫码配置','打开 DDNSTO，选择「自动扫码配置」，点击「扫码自动配置」。','scan'),make('生成域名','选择默认或自定义地址，生成链接后用微信扫码确认添加。','domain'),make('查看设备','登录 DDNSTO 控制台，在设备工作台确认设备已添加、状态在线。','console')];
 if(p.name==='Linux'){const first=make('下载程序包','下载与 CPU 架构匹配的 Linux 程序包，解压到目标设备。','download');first.links=[{label:'下载 Linux 程序包',url:'https://fw.koolcenter.com/binary/ddnsto/linux/'}];return [first,make('填写令牌并启动','按文档将账号令牌传入启动命令，设置后台运行。','terminal'),make('确认运行状态','日志出现 client init ok 后，到控制台查看设备。','ready')];}
 return p.steps.map((s,i)=>{let kind='open';if(/下载|确认型号/.test(s.title))kind='download';if(/手动安装|上传安装/.test(s.title))kind='upload';if(/令牌|配置/.test(s.title))kind='token';if(/启动容器|确认运行/.test(s.title))kind='ready';if(/创建/.test(s.title))kind='docker';if(p.name==='Linux')kind=i===2?'ready':'terminal';if(p.name==='Windows')kind=['download','token','ready'][i];return {...s,kind}});
}
let active,steps,index=0;
function render(){const p=active,s=steps[index],root=document.getElementById('platform-guide');
 const more={Unraid:'unraid.html','铁威马':'terra_master.html','极空间':'zspace.html'};
 const url=more[p.name]?doc+more[p.name]:p.url;
 const caption=p.name==='OpenWrt'?'适用于带 iStore 软件中心的固件；其他固件见「更多教程」。':p.name==='Koolcenter Lede'?'旧版固件请先查看文档中的版本说明。':'';
 root.innerHTML=`<div class="si-heading"><h3>${esc(p.name.startsWith('ASUSGO')?'华硕 / ASUSGO':p.label)}</h3><a href="${esc(url)}" target="_blank" rel="noopener">更多教程</a></div>${illustration(s,p,index)}<div class="si-copy"><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p>${s.links.filter(l=>!/详情|教程|配置|安装方法|准备步骤|版本对应/.test(l.label)).map(l=>`<a href="${esc(l.url.replace('http://fw.','https://fw.'))}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(' ')}${s.kind==='token'&&software.concat(['ASUSGO 固件 ≥386','ASUSGO 固件 <386']).includes(p.name)?'<a href="https://web.ddnsto.com/app/" target="_blank" rel="noopener">获取账号令牌</a>':''}</div><div class="si-steps" style="--si-step-count:${steps.length}" role="group" aria-label="安装步骤">${steps.map((x,i)=>`<button type="button" data-install-step="${i}" aria-pressed="${index===i}"><span>${i+1}</span><b>${esc(x.title)}</b></button>`).join('')}</div>${caption?`<p class="si-note">${caption}</p>`:''}`;
 root.onclick=e=>{const b=e.target.closest('[data-install-step]');if(!b)return;index=Number(b.dataset.installStep);render();root.querySelector(`[data-install-step="${index}"]`).focus({preventScroll:true})};
}
window.renderSimpleInstallGuide=p=>{active=p;steps=workflow(p);index=0;render()};
const installCommand = `(s=$(curl -qfsS --max-time 60 https://web.toany.net/i) && test -n "$s" && sh -c "$s" -- --token '用户令牌')`;
window.renderInstallOptions=()=>{
 const wrap=document.getElementById('install-options');
 wrap.innerHTML=`<div class="si-options"><article><div><h3>离线安装包</h3><p>在线升级失败？下载对应平台的离线包，按设备文档安装。</p></div><a href="https://fw.koolcenter.com/binary/ddnsto/" target="_blank" rel="noopener">下载离线包</a></article><article class="si-script"><div class="si-script-heading"><h3>一键脚本安装</h3><button type="button" class="btn secondary" id="copy-install-command">复制命令</button></div><p>将“用户令牌”替换为你的 DDNSTO 令牌，在目标设备终端执行。</p><pre class="si-command" tabindex="0" aria-label="一键安装命令"><code></code></pre><span class="si-copy-status" role="status" aria-live="polite"></span></article></div>`;
 wrap.querySelector('code').textContent=installCommand;
 wrap.querySelector('#copy-install-command').onclick=async()=>{
  const status=wrap.querySelector('.si-copy-status');let copied=false;
  try{await navigator.clipboard.writeText(installCommand);copied=true}catch{
   const input=document.createElement('textarea');input.value=installCommand;input.setAttribute('readonly','');input.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(input);input.select();try{copied=document.execCommand('copy')}catch{}input.remove();
  }
  status.textContent=copied?'已复制，请替换“用户令牌”后执行。':'未能自动复制，请选中上方命令手动复制。';
 };
};
})();
