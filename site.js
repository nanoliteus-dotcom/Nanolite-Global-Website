const menu=document.querySelector('.menu'),nav=document.querySelector('.nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();if(innerWidth<901)menu.focus()}});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
const resources=document.querySelector('.nav-resources');
document.addEventListener('click',e=>{if(resources&&!resources.contains(e.target))resources.open=false});

const exploreCue=document.querySelector('.hero-scroll');
if(exploreCue){const cueState=()=>{const hidden=scrollY>0;exploreCue.style.opacity=hidden?'0':'1';exploreCue.style.pointerEvents=hidden?'none':'auto';exploreCue.tabIndex=hidden?-1:0};addEventListener('scroll',cueState,{passive:true});cueState()}
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}},{threshold:.12});document.querySelectorAll('[data-reveal]').forEach(el=>revealObserver.observe(el))}
