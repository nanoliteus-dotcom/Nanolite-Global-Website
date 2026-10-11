const menu=document.querySelector('.menu'),nav=document.querySelector('.nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();if(innerWidth<901)menu.focus()}});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
const resources=document.querySelector('.nav-resources');
document.addEventListener('click',e=>{if(resources&&!resources.contains(e.target))resources.open=false});
