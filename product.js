(async()=>{
 const target=document.querySelector('#product-detail');
 try{
  const response=await fetch('products.json');if(!response.ok)throw Error('Product data unavailable');
  const products=await response.json(),id=new URLSearchParams(location.search).get('id'),p=products[id];
  if(!p){target.textContent='Choose a product from the product directory.';return}
  document.title=p.name+' | Nanolite';
  const image=document.createElement('img');image.src=p.image;image.alt=p.name;
  const copy=document.createElement('div'),heading=document.createElement('h1'),description=document.createElement('p'),link=document.createElement('a');
  heading.textContent=p.name;description.textContent=p.description;link.className='action';link.href=`request.html?type=${p.flow}&product=${id}`;link.textContent={order:'Order Materials',quote:'Request a Quote',plant:'Submit Plant Inquiry'}[p.flow];
  copy.append(heading,description);copy.append(link);if(p.applications?.length){const section=document.createElement("section"),title=document.createElement("h2"),body=document.createElement("p");title.textContent="Applications";body.textContent=p.applications.join(" · ");section.append(title,body);copy.append(section)}
  const details=document.createElement('details'),summary=document.createElement('summary'),note=document.createElement('p');summary.textContent='Specifications and project suitability';note.textContent=p.flow==='plant'?'Ask our team for the approved equipment specification, utility requirements and site layout. Capacity is not inferred from the model name.':'Ask our team for approved technical data, application guidance and the current catalog. Product photography is shown for identification; dimensions and performance are confirmed in the approved technical data.';details.append(summary,note);copy.append(details);
  if(id==='readymix'){const notice=document.createElement('p');notice.className='notice';notice.textContent='Supply specification: 40 kg per bag at PKR 600 in Pakistan. Supplied artwork may show a different bag size; your order uses the confirmed 40 kg specification.';copy.append(notice)}
  target.replaceChildren(image,copy);
 }catch{document.querySelector('#product-error').textContent='Product details could not load. Please return to the product directory or contact our team.'}
})();
