let studies=[];
// Keep each hourly selection stable across visitors; alternate shuffled cycles without consecutive repeats.
function featuredIndex(hour,count){if(count<2)return 0;const cycle=Math.floor(hour/count),offset=hour%count;let hash=Math.imul(cycle^(cycle>>>16),0x45d9f3b);hash=Math.imul(hash^(hash>>>16),0x45d9f3b);return offset*((hash^(hash>>>16))&1?1:count-1)%count}
function updateStudy(now=Date.now()){if(!studies.length)return;const item=studies[featuredIndex(Math.floor(now/3600000),studies.length)];document.querySelector('#study-standard').textContent=item.standard;document.querySelector('#study-title').textContent=item.title;document.querySelector('#study-source').textContent=item.source;document.querySelector('#study-link').href=item.url}
fetch('studies.json').then(r=>{if(!r.ok)throw Error('Studies unavailable');return r.json()}).then(data=>{studies=data;updateStudy()}).catch(()=>{});
setInterval(updateStudy,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateStudy()});
