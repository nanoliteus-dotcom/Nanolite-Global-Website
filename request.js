(async()=>{
 const form=document.querySelector('#request-form'),type=document.querySelector('#request-type'),product=document.querySelector('#request-product'),review=document.querySelector('#review'),error=document.querySelector('#request-error');
 try{
  const response=await fetch('products.json');if(!response.ok)throw Error('Unavailable');const products=await response.json(),params=new URLSearchParams(location.search);
  if(['order','quote','plant'].includes(params.get('type')))type.value=params.get('type');
  function refresh(){
   const selected=product.value||params.get('product');product.replaceChildren();
   for(const p of Object.values(products).filter(p=>p.flow===type.value)){const option=document.createElement('option');option.value=p.id;option.textContent=p.name;product.append(option)}
   if([...product.options].some(o=>o.value===selected))product.value=selected;
   document.querySelector('#request-title').textContent={order:'Order materials.',quote:'Tell us about your build.',plant:'Start manufacturing.'}[type.value];document.querySelector('#plant-interest').hidden=type.value!=='plant';
   const ready=product.value==='readymix',quantity=document.querySelector('#quantity');quantity.type=ready?'number':'text';quantity.min=ready?'1':'';quantity.step=ready?'1':'any';quantity.value='';document.querySelector('#quantity-help').textContent=ready?'Number of 40 kg bags. Whole bags only.':product.value==='agent'?'Tell us the litres or drums you need. Our team will confirm the available sales unit.':'An estimate is fine. You can write "not sure".';review.hidden=true;price();
  }
  function price(){const pakistan=form.elements.country.value.trim().toLowerCase()==='pakistan',quantity=Number(form.elements.quantity.value),ready=product.value==='readymix';document.querySelector('#price-summary').textContent=ready&&pakistan&&Number.isInteger(quantity)&&quantity>0?`Material subtotal: PKR ${(quantity*600).toLocaleString('en')}. ${quantity} bags, ${quantity*40} kg. Freight and tax pending confirmation.`:product.value==='agent'&&pakistan?'Pakistan material price: PKR 1,000/litre. Total quantity, sales unit, freight and tax are confirmed by our team.':'Price, availability, freight and tax will be quoted for your market.'}
  refresh();type.addEventListener('change',refresh);product.addEventListener('change',refresh);form.addEventListener('input',()=>{review.hidden=true;price()});
  form.addEventListener('submit',e=>{
   e.preventDefault();if(!form.reportValidity())return;
   const fields=[...new FormData(form)].filter(([key])=>key!=='franchise'||type.value==='plant'),dl=document.querySelector('#review-details'),lines=[];dl.replaceChildren();
   for(const [key,value]of fields){const label={type:'Request',product:'Product',country:'Country',location:'Location',quantity:'Quantity / requirement',delivery:'Pickup / delivery',details:'Project details',franchise:'Franchise interest',name:'Name',company:'Company',email:'Email',phone:'Phone'}[key];const display=key==='product'?products[value].name:value;const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=display||'Not provided';dl.append(dt,dd);lines.push(label+': '+display)}
   lines.push(document.querySelector('#price-summary').textContent);document.querySelector('#send-request').href='mailto:management@nanolite.co?subject='+encodeURIComponent('Nanolite '+type.value+' request: '+products[product.value].name)+'&body='+encodeURIComponent(lines.join('\n'));review.hidden=false;review.scrollIntoView({block:'center',behavior:'auto'});
  });document.querySelector('#edit-request').addEventListener('click',()=>{review.hidden=true;product.focus()});
 }catch{error.textContent='The product list could not load. Please contact management@nanolite.co to discuss your request.';form.querySelector('button[type=submit]').disabled=true}
})();
