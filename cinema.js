// shortcut: this preview dissolves between supplied still renders; replace the film for continuous camera motion.
const sections=[...document.querySelectorAll('.scene')],world=document.querySelector('.world'),loader=document.querySelector('.scene-loader'),poster=document.querySelector('.film-poster'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
let films=[],manifest,frame=0,progress=0,last=0,currentPart=-1,disposed=false;

function reveal(){document.body.classList.remove('scene-loading');loader.hidden=true}
function staticStory(){cancelAnimationFrame(frame);document.body.classList.add('static-story');world.hidden=true;sections.forEach(section=>{section.classList.remove('transitioning');section.querySelector('.scene-copy').inert=false});reveal()}

// Keep one outstanding seek per decoder; a rapid scroll replaces its destination.
function seek(film,time){film.targetTime=clamp(time,0,Math.max(0,film.duration-1/24));if(film.readyState<2||film.seeking)return;if(Math.abs(film.currentTime-film.targetTime)>1/48)film.currentTime=film.targetTime}
function ready(film){if(Math.abs(film.currentTime-film.targetTime)>1/12){seek(film,film.targetTime);return}film.decoded=true;if(film.partIndex===currentPart){films.forEach(other=>other.classList.toggle('ready',other===film));poster.hidden=true;reveal()}if(Math.abs(film.currentTime-film.targetTime)>1/48)seek(film,film.targetTime)}

async function init(){
 if(reduced.matches){staticStory();return}
 manifest=await fetch('film-manifest.json').then(response=>{if(!response.ok)throw Error('Film manifest unavailable');return response.json()});
 const mobile=innerWidth<700;
 films=manifest.parts.map((part,index)=>{const film=index===0?world.querySelector('video'):document.createElement('video');film.className='cinema-video';film.muted=true;film.playsInline=true;film.preload=index===0?'auto':'metadata';film.disablePictureInPicture=true;film.setAttribute('aria-hidden','true');film.partIndex=index;film.targetTime=0;film.src=mobile?part.mobile:part.desktop;if(index)world.append(film);film.addEventListener('loadeddata',()=>ready(film));film.addEventListener('seeked',()=>ready(film));film.addEventListener('error',()=>{if(index===currentPart)staticStory()});return film});
 currentPart=0;
 // A readable poster remains available when a connection stalls before video decoding.
 poster.decode().then(reveal).catch(()=>{});
 frame=requestAnimationFrame(tick);
}

function tick(now){
 if(disposed||document.body.classList.contains('static-story'))return;
 const index=Math.max(0,sections.findLastIndex(section=>scrollY>=section.offsetTop)),raw=clamp(index+(scrollY-sections[index].offsetTop)/sections[index].offsetHeight,0,31.999),dt=last?Math.min(now-last,100):16;last=now;
 progress=Math.abs(progress-raw)>2?raw:progress+(raw-progress)*(1-Math.exp(-dt/100));
 const active=Math.floor(progress),fraction=progress-active,part=Math.floor(active/8),film=films[part],local=(progress-part*8)*manifest.secondsPerScene;
 if(currentPart!==part){currentPart=part;film.preload='auto';poster.src=sections[active].querySelector('img').src;poster.hidden=false;films.forEach(other=>other.classList.remove('ready'));seek(film,local);if(film.readyState>=2&&!film.seeking)ready(film)}
 seek(film,local);
 // Prefetch the adjacent chapter in the direction of travel without playing audio.
 const adjacent=part+(raw>=progress?1:-1);if(films[adjacent]&&fraction>.35)films[adjacent].preload='auto';
 sections.forEach((section,i)=>{section.classList.toggle('active',i===active);section.classList.toggle('transitioning',i===active&&fraction>.73&&active<31);section.querySelector('.scene-copy').inert=i!==active||fraction>.73&&active<31});
 window.nanoliteCinema={scene:active+1,progress,part:part+1,targetTime:film.targetTime,currentTime:film.currentTime,source:'supplied-render-film',preview:true};
 frame=requestAnimationFrame(tick);
}

reduced.addEventListener('change',()=>{if(reduced.matches)staticStory();else location.reload()});
addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frame);films.forEach(film=>{film.pause();film.removeAttribute('src');film.load()})},{once:true});
init().catch(error=>{console.warn('Cinematic preview unavailable; accessible scenes remain available.',error.message);staticStory()});

