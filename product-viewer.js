const host=document.querySelector('[data-product-tilt]');
if(host){
 let angle=0,startX=0,startAngle=0,dragging=false;
 host.tabIndex=0;host.setAttribute('role','group');host.setAttribute('aria-label',host.dataset.productName+'. Drag left or right, or use the left and right arrow keys, to tilt the picture.');
 host.querySelector('img').draggable=false;const hint=document.createElement('span');hint.className='view-hint';hint.textContent='Drag left or right';host.append(hint);
 function tilt(value){angle=Math.max(-16,Math.min(16,value));host.style.setProperty('--view-angle',angle+'deg');host.dataset.viewAngle=String(angle)}
 host.addEventListener('pointerdown',event=>{if(event.button!==0)return;dragging=true;startX=event.clientX;startAngle=angle;host.setPointerCapture(event.pointerId)});
 host.addEventListener('pointermove',event=>{if(dragging)tilt(startAngle+(event.clientX-startX)*.12)});
 for(const event of ['pointerup','pointercancel'])host.addEventListener(event,()=>{dragging=false});
 host.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();tilt(angle+(event.key==='ArrowLeft'?-4:4))});
}
