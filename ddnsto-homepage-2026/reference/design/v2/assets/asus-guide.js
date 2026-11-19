(()=>{
const doc='https://doc.linkease.com/zh/guide/ddnsto/quickstart/install-guide/koolcenter_merlin.html';
const paths=[
 {name:'全新用户',badge:'推荐',intro:'想在外管理路由器？从「启用远程访问」开始，无需先去找 DDNSTO 插件。',steps:[
 ['启用远程访问','在路由器的软件中心，点击 DDNSTO 区域的「启用远程访问」。选择本设备，确认地址后点击「确定」；新版流程会按需安装 DDNSTO。','new-entry.png'],
 ['首次打开，扫码确认','链接生成后点击「立即体验」，用微信扫码确认账号、域名与可用额度，按提示完成绑定。无需手动复制令牌。','scan.png']],end:'绑定并就绪后，打开或复制远程链接即可访问路由器；进入管理页面仍需使用路由器原有账号登录。'},
 {name:'已有软件',intro:'FileBrowser、Aria2 等适配插件已安装？直接为想用的软件添加远程访问。',steps:[
 ['找到软件，添加远程访问','在已安装的适配插件卡片或安装完成提示中点击「添加远程访问」。也可点击 DDNSTO 区域的「发现可远程服务」，选择目标并确认生成链接。','installed-entry.png'],
 ['打开链接，按需完成绑定','点击「立即体验」或新生成的链接。设备尚未绑定时扫码确认；已绑定的设备按页面提示启用链接，无需重复绑定。等待就绪后访问。','link.png']],end:'只有 DDNSTO 已安装？未绑定时仍从设备远程访问入口继续；已绑定且已有链接，直接打开。没有「添加远程访问」的插件不属于当前支持范围。'},
 {name:'传统安装',intro:'软件中心没有新版远程访问入口？沿用官方手动安装步骤。',steps:[
 ['搜索并安装 DDNSTO','进入软件中心，在全部软件中搜索 DDNSTO 并安装；已经安装的用户直接打开插件。','legacy-install.png'],
 ['填写令牌并启用','扫码登录 DDNSTO 控制台获取 Token，回到路由器 DDNSTO 配置页填写令牌并启用，按页面提示保存。','legacy-config.png'],
 ['到控制台配置访问域名','确认设备在线，为路由器或目标服务配置外网域名及内网地址，再打开生成的链接验证访问。',null]],end:'软件中心无法更新时，可按官方文档使用离线安装包；选择与你的设备和固件匹配的版本。'}
];
let active=0,step=0;
window.renderAsusGuide=()=>{active=0;step=0;return html()};
function html(){const p=paths[active],s=p.steps[step];return `<div class="asus-guide"><h3>华硕 / ASUSGO 安装与使用</h3><p class="asus-scope">适用于支持软件中心的 ASUSGO / KoolCenter 官改及梅林固件。先按你看到的界面选择路径。</p><div class="asus-paths" aria-label="选择安装路径">${paths.map((p,i)=>`<button type="button" data-asus-path="${i}" aria-pressed="${active===i}">${p.name}${p.badge?`<small>${p.badge}</small>`:''}</button>`).join('')}</div><p>${p.intro}</p><div class="asus-step-nav" aria-label="安装步骤">${p.steps.map((s,i)=>`<button type="button" data-asus-step="${i}" aria-pressed="${step===i}"><b>${i+1}</b>${s[0]}</button>`).join('')}</div><div class="asus-step"><h4>${step+1}. ${s[0]}</h4><p>${s[1]}</p>${s[2]?`<button type="button" class="asus-image" data-asus-zoom aria-label="放大步骤截图"><img src="assets/asus/${s[2]}" alt="${s[0]}的界面截图"><span>点击查看大图</span></button><p class="asus-caption">${active===2?'官方安装文档原始截图':'新版软件中心交互原型实截 · 示例数据，非实机截图'}</p>`:''}</div><p class="asus-outcome">${p.end}</p><div class="asus-links">${active===2?`<a href="https://web.ddnsto.com/app/" target="_blank" rel="noopener">获取账号令牌</a><a href="${doc}#离线安装" target="_blank" rel="noopener">离线安装说明</a>`:''}<a href="${doc}#安装步骤" target="_blank" rel="noopener">官方完整图文教程</a></div>${active!==2?'<p class="asus-scope">新版路径依赖对应软件中心版本；未看到这些入口，请切换「传统安装」。生成链接不代表已激活，以扫码确认和实际就绪状态为准。</p>':''}</div>`}
document.addEventListener('click',e=>{const path=e.target.closest('[data-asus-path]'),st=e.target.closest('[data-asus-step]');if(path||st){if(path){active=+path.dataset.asusPath;step=0}else step=+st.dataset.asusStep;const version=document.querySelector('.asus-version-label');document.querySelector('#platform-guide').innerHTML=html();if(version)document.querySelector('#platform-guide').prepend(version);document.querySelector(path?`[data-asus-path="${active}"]`:`[data-asus-step="${step}"]`).focus({preventScroll:true})}if(e.target.closest('[data-asus-zoom]')){let d=document.getElementById('asus-image-dialog');if(!d){d=document.createElement('dialog');d.id='asus-image-dialog';d.innerHTML='<button type="button" autofocus aria-label="关闭大图">关闭</button><img alt="安装步骤大图">';d.querySelector('button').onclick=()=>d.close();d.addEventListener('click',ev=>{if(ev.target===d)d.close()});document.body.append(d)}d.querySelector('img').src=`assets/asus/${paths[active].steps[step][2]}`;d.showModal()}});
if(new URLSearchParams(location.search).get('platform')==='asus')addEventListener('DOMContentLoaded',()=>{document.querySelector('#platforms button[data-name="ASUSGO 固件 ≥386"]')?.click()});
})();
