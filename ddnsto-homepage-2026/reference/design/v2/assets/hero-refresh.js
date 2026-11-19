(()=>{'use strict';
 const gift=document.querySelector('.tcp-gift'),toggle=document.getElementById('tcp-gift-toggle'),offer=document.getElementById('tcp-gift-offer');let hideTimer;
 function open(){clearTimeout(hideTimer);offer.hidden=false;gift.classList.add('is-open');toggle.setAttribute('aria-expanded','true')}
 function close(){clearTimeout(hideTimer);offer.hidden=true;gift.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')}
 gift.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')open()});gift.addEventListener('pointerleave',()=>{hideTimer=setTimeout(()=>{if(!gift.contains(document.activeElement))close()},160)});
 toggle.addEventListener('click',()=>{if(offer.hidden)open();else if(matchMedia('(hover:none)').matches)close()});gift.addEventListener('focusin',e=>{if(e.target!==toggle||!matchMedia('(hover:none)').matches)open()});gift.addEventListener('focusout',e=>{if(!gift.contains(e.relatedTarget))close()});gift.querySelector('.gift-dismiss').addEventListener('click',close);offer.querySelector('a').addEventListener('click',close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});document.addEventListener('pointerdown',e=>{if(!gift.contains(e.target))close()});
})();
