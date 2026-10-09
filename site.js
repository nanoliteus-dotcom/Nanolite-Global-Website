const menu=document.querySelector('.menu'),nav=document.querySelector('.nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu.focus()}});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
