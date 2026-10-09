(async()=>{
 const target=document.querySelector('#product-detail');
 try{
  const response=await fetch('products.json');if(!response.ok)throw Error('Product data unavailable');
  const products=await response.json(),id=new URLSearchParams(location.search).get('id'),p=products[id];
  if(!p){target.textContent='Choose a product from the product directory.';return}
  document.title=p.name+' | Nanolite';
  const image=document.createElement('img');image.src=`assets/scene-${String(p.scene).padStart(2,'0')}.webp`;image.alt=p.name+' illustrative reference';
  const copy=document.createElement('div'),heading=document.createElement('h1'),description=document.createElement('p'),link=document.createElement('a');
  heading.textContent=p.name;description.textContent=p.description;link.className='action';link.href=`request.html?type=${p.flow}&product=${id}`;link.textContent={order:'Order Materials',quote:'Request a Quote',plant:'Submit Plant Inquiry'}[p.flow];
  copy.append(heading,description,link);
  const details=document.createElement('details'),summary=document.createElement('summary'),note=document.createElement('p');summary.textContent='Specifications and project suitability';note.textContent=p.flow==='plant'?'Ask our team for the approved equipment specification, utility requirements and site layout. Capacity is not inferred from the model name.':'Ask our team for approved technical data, application guidance and the current catalog. The scene is illustrative and is not a dimensioned specification.';details.append(summary,note);copy.append(details);
  if(id==='readymix'){const notice=document.createElement('p');notice.className='notice';notice.textContent='Current supply specification: 40 kg per bag. The reference packaging image contains older artwork and is pending replacement.';copy.append(notice)}
  target.replaceChildren(image,copy);
 }catch{document.querySelector('#product-error').textContent='Product details could not load. Please return to the product directory or contact our team.'}
})();
