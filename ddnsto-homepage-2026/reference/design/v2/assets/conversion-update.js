(()=>{'use strict';
// Keep the destination honest: until the console supports scene routing, display the path on the page.
document.addEventListener('click',e=>{const a=e.target.closest('[data-install-intent],[data-faq-target]');if(!a)return;if(a.dataset.installIntent){const hint=document.getElementById('install-intent');hint.hidden=false;hint.textContent=`你想使用：${a.dataset.installIntent}。先选择运行 DDNSTO 的设备。`}if(a.dataset.faqTarget){const search=document.getElementById('faq-search');search.value='';search.dispatchEvent(new Event('input'));document.querySelector(`[data-faq-group="${a.dataset.faqTarget}"]`)?.click()}});

})();
