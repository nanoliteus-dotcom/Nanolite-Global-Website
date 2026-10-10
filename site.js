const menu=document.querySelector('.menu'),nav=document.querySelector('.nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu.focus()}});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});

const resources=document.querySelector('.nav-resources');
document.addEventListener('click',event=>{if(resources&&!resources.contains(event.target))resources.open=false});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&resources)resources.open=false});
