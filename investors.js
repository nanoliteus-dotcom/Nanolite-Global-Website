(()=>{
 const chart=document.querySelector('#market-chart');
 if(chart){
  const ctx=chart.getContext('2d'),random=new Uint32Array(1);crypto.getRandomValues(random);let seed=random[0],period='1D',hover=-1;
  const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const series={};for(const key of ['1D','1W','1M','1Y']){let value=3.08+rng()*.35;series[key]=Array.from({length:64},(_,i)=>{value+= (rng()-.47)*.045;return Math.max(.5,value)})}
  function draw(){
   const w=chart.clientWidth,h=chart.clientHeight,dpr=Math.min(devicePixelRatio,2);chart.width=w*dpr;chart.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
   const values=series[period],min=Math.min(...values)-.035,max=Math.max(...values)+.035,left=16,right=w-58,top=24,bottom=h-34;
   const x=i=>left+i*(right-left)/(values.length-1),y=v=>bottom-(v-min)/(max-min)*(bottom-top);
   ctx.font='11px Segoe UI';ctx.textBaseline='middle';ctx.setLineDash([]);
   for(let i=0;i<5;i++){const yy=top+(bottom-top)*i/4;ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(right,yy);ctx.strokeStyle='#282d2f';ctx.lineWidth=.7;ctx.stroke();ctx.fillStyle='#929b9f';ctx.fillText((max-(max-min)*i/4).toFixed(2),right+10,yy)}
   const fill=ctx.createLinearGradient(0,top,0,bottom);fill.addColorStop(0,'rgba(165,211,187,.17)');fill.addColorStop(1,'rgba(165,211,187,0)');ctx.beginPath();values.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));ctx.lineTo(right,bottom);ctx.lineTo(left,bottom);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
   ctx.beginPath();values.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));ctx.strokeStyle='#b4d6c2';ctx.lineWidth=1.8;ctx.stroke();
   const labels=period==='1D'?['09:30','12:00','16:00']:period==='1W'?['Mon','Wed','Fri']:period==='1M'?['Week 1','Week 2','Week 4']:['Jan','Jun','Dec'];ctx.fillStyle='#929b9f';ctx.textBaseline='top';labels.forEach((s,i)=>ctx.fillText(s,left+i*(right-left)/2- (i===2?20:0),bottom+15));
   if(hover>=0){const i=Math.round(hover*(values.length-1));ctx.beginPath();ctx.moveTo(x(i),top);ctx.lineTo(x(i),bottom);ctx.setLineDash([3,4]);ctx.strokeStyle='#8d969b';ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(x(i),y(values[i]),4,0,Math.PI*2);ctx.fillStyle='#d2eadc';ctx.fill();document.querySelector('.chart-readout').textContent=`${period} preview · Sample ${i+1} · $${values[i].toFixed(2)}`}
   else document.querySelector('.chart-readout').textContent='Move across the chart to explore.';
   const last=values.at(-1),change=(last-values[0])/values[0]*100;document.querySelector('#market-value').textContent='$'+last.toFixed(2);document.querySelector('#market-change').textContent=`${change>=0?'+':''}${change.toFixed(2)}% · ${period} sample`;
   window.nanoliteMarket={illustrative:true,period,values:[...values],display:last.toFixed(2),hover};
  }
  document.querySelectorAll('[data-period]').forEach(button=>button.addEventListener('click',()=>{period=button.dataset.period;hover=-1;document.querySelectorAll('[data-period]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));draw()}));
  chart.addEventListener('pointermove',e=>{const box=chart.getBoundingClientRect();hover=Math.max(0,Math.min(1,(e.clientX-box.left-16)/(box.width-74)));draw()});chart.addEventListener('pointerleave',()=>{hover=-1;draw()});addEventListener('resize',draw);draw();
 }

})();
