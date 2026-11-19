/* Reuse the official site's actual React components and animation timelines.
   Only these two modules are mounted; no original page/analytics entry runs. */
(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[99999],{},require=>{
 const React=require(2115),DOM=require(9248),source=require(1237);
 for(const [id,Component] of [['features',source.Features],['getting-started',source.Workflow]]){
  const host=document.getElementById(id),shadow=host.attachShadow({mode:'open'});
  for(const href of ['assets/original-modules/original.css','assets/original-modules/qinglan-adapter.css']){const css=document.createElement('link');css.rel='stylesheet';css.href=href;shadow.append(css)}
  const mount=document.createElement('div');shadow.append(mount);if(id==='getting-started'){const observer=new MutationObserver(()=>{const walker=document.createTreeWalker(mount,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode()){if(n.textContent.trim()==='3 分钟')n.textContent='手动配置';else if(n.textContent==='开始使用')n.textContent='流程参考';else if(n.textContent==='简单 3 步，实现完全自由。')n.textContent='适用于手动安装与令牌配置；快捷扫码请看对应设备教程。'}});observer.observe(mount,{childList:true,subtree:true})}DOM.createRoot(mount).render(React.createElement(source.Language,null,React.createElement(Component)));
 }
}]);
