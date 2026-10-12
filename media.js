const film=document.querySelector('#clc-film'),sound=document.querySelector('.sound-toggle'),water=document.querySelector('.hero-water');
function play(video){video.play().catch(()=>{});}
if(film&&sound){
 sound.addEventListener('click',()=>{film.muted=!film.muted;const on=!film.muted;sound.setAttribute('aria-pressed',String(on));sound.setAttribute('aria-label',on?'Mute video':'Unmute video');sound.querySelector('span').textContent=on?'Mute':'Unmute';play(film)});
 film.addEventListener('error',()=>{document.querySelector('.film-error').hidden=false;sound.disabled=true});
}
const videos=[...document.querySelectorAll('video')],visible=new Set();
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){visible.add(entry.target);if(!document.hidden)play(entry.target)}else{visible.delete(entry.target);entry.target.pause()}}},{threshold:.05});videos.forEach(v=>observer.observe(v))}else{videos.forEach(v=>{visible.add(v);play(v)})}
document.addEventListener('visibilitychange',()=>{for(const video of videos){if(document.hidden)video.pause();else if(visible.has(video))play(video)}});
