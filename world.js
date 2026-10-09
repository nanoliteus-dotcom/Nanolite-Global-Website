import * as T from './vendor/three.module.js';

const container=document.querySelector('.world'),sections=[...document.querySelectorAll('.scene')],mode=document.querySelector('#view-mode'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
 let renderer,staticMode=reduced.matches,frame,last=0,progress=0;
const descriptions={plaster:'The finished surface of the wall assembly.',brick:'Terracotta masonry forms part of the wall system.',clc:'Cellular Lightweight Concrete infill is illustrated within the assembly.',bond:'A concrete bond beam connects the masonry assembly.',column:'The reinforced-concrete column is part of the building frame.',beam:'The concrete beam belongs to the main structural frame.'};
document.querySelectorAll('[data-component]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-component]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('.component-description').textContent=descriptions[button.dataset.component];window.nanoliteWallComponent=button.dataset.component}));
document.querySelectorAll('button[data-scene]').forEach(button=>button.addEventListener('click',()=>document.querySelector('#scene-'+button.dataset.scene).scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'})));
function setMode(value){staticMode=value;document.body.classList.toggle('static-story',value);mode.setAttribute('aria-pressed',String(value));mode.textContent=value?'Explore 3D scene':'View scene references';document.querySelector('.machine-controls')?.setAttribute('hidden','');container.hidden=value;if(value){sections.forEach(section=>section.querySelector('.scene-copy').inert=false);document.querySelector('.journey-tools').style.visibility='visible'}if(renderer&&value)cancelAnimationFrame(frame);if(renderer&&!value){last=0;frame=requestAnimationFrame(tick)}}
mode.addEventListener('click',()=>{if(!renderer){mode.textContent='3D is unavailable on this device';return}const i=sections.findIndex(s=>s.classList.contains('active'));setMode(!staticMode);sections[Math.max(0,i)].scrollIntoView({behavior:'instant',block:'start'})});

let scene,camera,building,factory,truck,crane,wallBlock,roofTile,panel,hybridFace,hybridParts,highlights,rain,waterMaterial,channel,sky,reflection,reflectionCamera,workers=[],truckWheels=[];
const reflectionMatrix=new T.Matrix4();
let inspectionYaw=0,inspectionPitch=0,inspectionZoom=1,drag=null,inspectionScene=-1;
const floors=[],v=new T.Vector3(),target=new T.Vector3();
let seed=719;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
function concreteTexture(){const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d'),pixels=ctx.createImageData(1024,1024);for(let i=0;i<pixels.data.length;i+=4){const value=194+random()*24;pixels.data[i]=value;pixels.data[i+1]=value;pixels.data[i+2]=value-2;pixels.data[i+3]=255}ctx.putImageData(pixels,0,0);const map=new T.CanvasTexture(c);map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(4,4);map.colorSpace=T.SRGBColorSpace;return map}
const mat={};
function box(w,h,d,x,y,z,material,parent=scene){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cylinder(r,length,x,y,z,material,parent=scene){const m=new T.Mesh(new T.CylinderGeometry(r,r,length,24),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function line(a,b,r,material,parent=scene){const aa=new T.Vector3(...a),bb=new T.Vector3(...b),m=cylinder(r,aa.distanceTo(bb),0,0,0,material,parent);m.position.copy(aa.clone().add(bb).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bb.sub(aa).normalize());return m}
function label(text,weight=''){const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#f2f3ef';ctx.fillRect(0,0,512,512);ctx.fillStyle='#112329';ctx.font='bold 32px Arial';ctx.textAlign='center';ctx.fillText('NANOLITE',256,100);ctx.font='bold 27px Arial';text.split('|').forEach((s,i)=>ctx.fillText(s,256,220+i*40));ctx.font='24px Arial';ctx.fillText(weight,256,440);ctx.strokeStyle='#246087';ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(28,320);ctx.lineTo(484,320);ctx.stroke();const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:texture,roughness:.9})}
function person(x,y,z,parent=scene){const g=new T.Group();g.position.set(x,y,z);box(.42,.65,.24,0,1.05,0,mat.vest,g);const head=new T.Mesh(new T.SphereGeometry(.17,12,8),mat.skin);head.position.y=1.55;g.add(head);const helmet=new T.Mesh(new T.SphereGeometry(.21,12,8,0,Math.PI*2,0,Math.PI/2),mat.yellow);helmet.position.y=1.62;g.add(helmet);for(const side of [-1,1]){line([side*.12,.15,0],[side*.12,.8,0],.075,mat.dark,g);line([side*.24,1.35,0],[side*.32,.8,.15],.065,mat.skin,g)}parent.add(g);workers.push(g);return g}
function init(){
 scene=new T.Scene();scene.background=new T.Color('#c38c64');scene.fog=new T.Fog('#c9b8a0',85,280);camera=new T.PerspectiveCamera(45,innerWidth/innerHeight,.1,700);
 renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;container.append(renderer.domElement);
 const texture=concreteTexture();for(const [name,color]of Object.entries({concrete:'#d4d0c4',clc:'#e4e4df',earth:'#77674e',grass:'#566353',dark:'#25343b',blue:'#225c7a',white:'#eeeede',yellow:'#e8ae34',brick:'#a55b3d',skin:'#947763',vest:'#b8ce5a',glass:'#446678'}))mat[name]=new T.MeshStandardMaterial({color,roughness:name==='glass'?.18:.8,metalness:['blue','yellow','dark'].includes(name)?.3:0,...(['concrete','clc'].includes(name)?{map:texture,bumpMap:texture,bumpScale:.008}:{})});
 scene.add(new T.HemisphereLight('#ffefdb','#68757e',2));const sun=new T.DirectionalLight('#ffd3a0',3.5);sun.position.set(-55,65,-80);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-65,right:165,top:65,bottom:-60,near:1,far:240});sun.shadow.bias=-.0003;sun.target.position.set(45,0,0);scene.add(sun,sun.target);
 sky=new T.Mesh(new T.SphereGeometry(360,32,16),new T.ShaderMaterial({side:T.BackSide,uniforms:{top:{value:new T.Color('#556f87')},bottom:{value:new T.Color('#ecc497')}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform vec3 top;uniform vec3 bottom;void main(){float h=clamp(normalize(p).y*.8,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.7)),1.);}'}));scene.add(sky);
 // The terrain leaves a real opening around the drainage corridor.
 box(430,.5,168,70,-.7,-66,mat.grass);box(430,.5,118,70,-.7,85,mat.grass);
 box(145,.5,8,-62.5,-.7,22,mat.grass);box(165,.5,8,212.5,-.7,22,mat.grass);
 box(32,.4,26,0,-.2,0,mat.earth);
 // One fixed landscape and footprint serve every camera stop.
 // Layered terrain uses a continuous ridge rather than isolated cone mountains.
 for(let layer=0;layer<3;layer++){
  const geometry=new T.PlaneGeometry(520,110,130,35),positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),depth=(positions.getY(i)+55)/110,ridge=22+13*Math.sin(x*.032+layer*1.3)+7*Math.sin(x*.075+.4)+3*Math.sin(x*.18);positions.setZ(i,Math.max(0,ridge)*Math.sin(depth*Math.PI)*(.7+layer*.3))}
  geometry.computeVertexNormals();const terrain=new T.Mesh(geometry,new T.MeshStandardMaterial({color:['#657c6e','#728880','#82928d'][layer],roughness:1}));terrain.rotation.x=-Math.PI/2;terrain.position.set(70,-1,-92-layer*65);terrain.receiveShadow=true;scene.add(terrain);
 }
 waterMaterial=new T.MeshPhysicalMaterial({color:'#849d9d',roughness:.17,metalness:.25,transparent:true,opacity:.9});waterMaterial.onBeforeCompile=shader=>{shader.uniforms.waveTime={value:0};waterMaterial.userData.shader=shader;shader.vertexShader='uniform float waveTime;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += sin(position.x*.22+waveTime*.7)*.07+sin(position.y*.35-waveTime*.5)*.05;')};const lake=new T.Mesh(new T.PlaneGeometry(300,65,100,32),waterMaterial);lake.rotation.x=-Math.PI/2;lake.position.set(50,-.25,-65);scene.add(lake);
 const crownGeometry=new T.IcosahedronGeometry(1,1),crownMaterial=new T.MeshStandardMaterial({color:'#3f5941',roughness:1}),crowns=new T.InstancedMesh(crownGeometry,crownMaterial,1350),trunks=new T.InstancedMesh(new T.CylinderGeometry(.12,.2,2.4,7),mat.earth,450),dummy=new T.Object3D();
 for(let i=0;i<450;i++){
  let x=-120+random()*340,z=-42+random()*150;
  if(Math.abs(x)<24&&Math.abs(z)<28||x>45&&x<145&&z>-36&&z<32||z>16&&z<28){i--;continue}
  const scale=.65+random()*.9;dummy.position.set(x,scale,z);dummy.scale.set(scale,scale,scale);dummy.rotation.set(0,0,0);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
  for(let branch=0;branch<3;branch++){dummy.position.set(x+(branch-1)*scale*.65,2.3*scale+random()*scale,z+(random()-.5)*scale);dummy.scale.set(1.2*scale,1.5*scale,1.1*scale);dummy.rotation.set(random(),random(),random());dummy.updateMatrix();crowns.setMatrixAt(i*3+branch,dummy.matrix);crowns.setColorAt(i*3+branch,new T.Color().setHSL(.25+random()*.05,.2+random()*.15,.16+random()*.1))}
 }
 crowns.castShadow=true;crowns.receiveShadow=true;scene.add(crowns,trunks);
 building=new T.Group();scene.add(building);
 for(const x of [-9,-3,3,9])for(const z of [-6,0,6]){box(1.5,.8,1.5,x,.25,z,mat.concrete,building);for(let n=0;n<4;n++)cylinder(.025,1.2,x+(n%2)*.15-.075,1.1,z+Math.floor(n/2)*.15-.075,mat.dark,building)}
 for(const z of [-6,0,6])box(20,.5,.6,0,.1,z,mat.concrete,building);for(const x of [-9,-3,3,9])box(.6,.5,13,x,.1,0,mat.concrete,building);
 for(let floor=0;floor<8;floor++){const g=new T.Group();g.position.y=floor*3.4;building.add(g);floors.push(g);for(const x of [-9,-3,3,9])for(const z of [-6,0,6])box(.55,3.4,.55,x,1.7,z,mat.concrete,g);box(20,.25,14,0,3.4,0,mat.concrete,g);for(const z of [-6,6])box(20,.5,.5,0,3.14,z,mat.concrete,g);for(let step=0;step<12;step++)box(2,.15,1.5,7,.18+step*.27,-4+step*.55,mat.concrete,g);for(let bay=0;bay<3;bay++){box(5.2,1.1,.22,-6+bay*6,.7,-6,mat.clc,g);box(5.2,1.1,.22,-6+bay*6,.7,6,mat.clc,g)}g.userData.final=[];for(const z of [-6.13,6.13])for(const x of [-6,0,6]){const glazing=box(4.5,1.8,.04,x,2.05,z,mat.glass,g);g.userData.final.push(glazing)}}
 for(let course=0;course<3;course++)for(let col=0;col<6;col++)box(.86,.34,.25,-7+col*.92+(course%2)*.46,3.7+course*.36,3,mat.clc,building);
 wallBlock=box(.86,.34,.25,-4.2,4.8,3,mat.clc,building);person(-5.5,3.5,1.8,building);
 roofTile=box(1.2,.12,1.2,-4,27.4,2,mat.clc,building);for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++)box(1.15,.12,1.15,x*1.2-4,27.32,z*1.2+2,mat.clc,building);
 crane=new T.Group();crane.position.set(13,0,-7);scene.add(crane);const height=35;for(let y=0;y<height;y+=2){for(const x of [-.6,.6])for(const z of [-.6,.6])line([x,y,z],[x,y+2,z],.045,mat.yellow,crane);for(const z of [-.6,.6])line([-.6,y,z],[.6,y+2,z],.035,mat.yellow,crane)}line([-20,height,0],[7,height,0],.13,mat.yellow,crane);line([-20,height+1,0],[7,height+1,0],.09,mat.yellow,crane);for(let x=-20;x<7;x+=2)line([x,height,0],[x+2,height+1,0],.035,mat.yellow,crane);
 panel=box(2.5,4,.16,3,29.5,-1,mat.clc);line([3,35,-1],[3,32.5,-1],.025,mat.dark);line([3,32.5,-1],[2.1,31.5,-1],.025,mat.dark);line([3,32.5,-1],[3.9,31.5,-1],.025,mat.dark);person(1,27.35,-2,building);person(-6,27.35,3,building);
 hybridParts={};hybridParts.brick=box(5,2.8,.18,-6,12,-5.7,mat.brick,building);hybridParts.clc=box(3.5,2,.22,-6.6,11.6,-5.4,mat.clc,building);hybridParts.bond=box(5,.25,.35,-6,11.65,-5.3,mat.concrete,building);hybridFace=box(5,2.8,.1,-6,12,-5.15,mat.white,building);hybridParts.plaster=hybridFace;hybridParts.column=box(.58,3.4,.58,-9,12,-5.5,mat.concrete,building);hybridParts.beam=box(6,.45,.6,-6,13.5,-5.5,mat.concrete,building);
 highlights=new T.Group();building.add(highlights);const glow=new T.MeshBasicMaterial({color:'#b5e9f2',transparent:true,opacity:.7});for(let f=0;f<3;f++)for(const x of [-9,-3,3,9])for(const z of [-6,6]){const edge=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(.58,3.4,.58)),new T.LineBasicMaterial({color:'#c3f4ff'}));edge.position.set(x,f*3.4+1.7,z);highlights.add(edge)}
 const roadCurve=new T.CatmullRomCurve3([new T.Vector3(-15,0,22),new T.Vector3(20,0,22),new T.Vector3(70,0,22),new T.Vector3(130,0,22)]);
 const road=box(160,.45,8,55,-.225,22,mat.concrete);
 for(const z of [17.85,26.15])box(160,.22,.3,55,.05,z,mat.concrete);
 const tunnel=new T.Group();tunnel.position.set(70,-3.2,22);scene.add(tunnel);
 box(120,.35,7.8,0,-2.7,0,mat.concrete,tunnel);box(120,.3,7.8,0,2.55,0,mat.concrete,tunnel);
 for(const z of [-3.75,3.75])box(120,5.4,.35,0,0,z,mat.concrete,tunnel);
 for(let x=-58;x<=58;x+=6){
  for(const z of [-3.5,3.5])box(.18,5,.18,x,0,z,mat.concrete,tunnel);
  box(.18,.16,7,x,2.2,0,mat.concrete,tunnel);
  const lamp=new T.PointLight('#f2c986',4,12,2);lamp.position.set(x,1.9,0);tunnel.add(lamp);
  box(.3,.04,.5,x,2.1,0,new T.MeshBasicMaterial({color:'#fff0c5'}),tunnel);
 }
 window.nanoliteRoad=road;window.nanoliteTunnel=tunnel;
 reflection=new T.WebGLRenderTarget(innerWidth<700?512:1024,innerWidth<700?512:1024);reflectionCamera=new T.PerspectiveCamera();
 const channelMaterial=new T.MeshPhysicalMaterial({color:'#2b4249',roughness:.13,metalness:.35});
 channelMaterial.onBeforeCompile=shader=>{shader.uniforms.reflectionMap={value:reflection.texture};shader.uniforms.reflectionMatrix={value:reflectionMatrix};shader.uniforms.waveTime={value:0};channelMaterial.userData.shader=shader;
  shader.vertexShader='uniform mat4 reflectionMatrix;uniform float waveTime;varying vec4 reflectedPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z+=sin(position.x*.65-waveTime*1.8)*.025+sin(position.y*1.4+waveTime)*.015;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nreflectedPosition=reflectionMatrix*modelMatrix*vec4(transformed,1.);');
  shader.fragmentShader='uniform sampler2D reflectionMap;uniform float waveTime;varying vec4 reflectedPosition;\n'+shader.fragmentShader.replace('#include <opaque_fragment>','vec2 reflectionUV=reflectedPosition.xy/reflectedPosition.w*.5+.5;reflectionUV+=vec2(sin(vViewPosition.x*2.+waveTime),cos(vViewPosition.z*2.-waveTime))*.004;vec3 reflected=texture2D(reflectionMap,clamp(reflectionUV,0.,1.)).rgb;outgoingLight=mix(outgoingLight,reflected,.6);\n#include <opaque_fragment>');
 };
 channel=new T.Mesh(new T.PlaneGeometry(120,7,160,24),channelMaterial);channel.rotation.x=-Math.PI/2;channel.position.y=-2.45;tunnel.add(channel);
 // shortcut: the water surface is a procedural illustration; replace with simulated flow for film-quality output.
 const shaft=new T.Group();shaft.position.set(112,-1.3,22);scene.add(shaft);
 for(const z of [-1.4,1.4])box(3.2,8,.25,0,0,z,mat.concrete,shaft);
 for(let y=-4;y<3;y+=.45)line([-1,y,-1.1],[1,y,-1.1],.04,mat.dark,shaft);
 const exitLight=new T.PointLight('#ffe0a8',45,18,2);exitLight.position.set(112,2,22);scene.add(exitLight);
 factory=new T.Group();factory.position.set(90,0,-10);scene.add(factory);box(80,.25,48,0,-.1,0,mat.concrete,factory);
 const installed=(x,z,count)=>{const g=new T.Group();g.position.set(x,0,z);factory.add(g);for(let i=0;i<count;i++){cylinder(1.5,10,-8+i*4,5.4,0,mat.white,g);cylinder(1.52,.6,-8+i*4,8.5,0,mat.blue,g);for(const xx of [-1,1])for(const zz of [-1,1])line([-8+i*4+xx,0,zz],[-8+i*4+xx,2,zz],.06,mat.dark,g)}for(const x of [-2,2])for(const z of [-2,2])line([x,0,z],[x,12,z],.1,mat.blue,g);for(let i=0;i<3;i++)cylinder(1.2,2.3,0,3+i*3,0,mat.white,g);box(5,2.5,3,7,1.25,0,mat.white,g);box(2,1.2,.06,7,1.8,1.53,mat.glass,g);const conveyor=box(12,.4,1.5,-6,3,6,mat.dark,g);conveyor.rotation.z=.4;return g};installed(-15,-10,2);installed(17,-9,4);
 for(let row=0;row<6;row++)for(let col=0;col<8;col++)box(2.4,.6,1.2,12+col*3,.3,4+row*2.3,mat.clc,factory);
 for(const z of [5,14]){box(22,.25,6,-22,4.2,z,mat.blue,factory);for(const x of [-32,-12])for(const zz of [z-2.5,z+2.5])line([x,0,zz],[x,4,zz],.08,mat.dark,factory)}
 for(let i=0;i<8;i++){const bag=box(.75,1.2,.35,-28+(i%4)*.82,.6,4+Math.floor(i/4)*.5,mat.white,factory);if(i===0){const face=new T.Mesh(new T.PlaneGeometry(.75,1.2),label('NANO|READY MIX','40 KG'));face.position.z=.18;bag.add(face)}}
 for(let i=0;i<6;i++){const drum=cylinder(.45,1.4,-28+(i%3)*1.05,.7,13+Math.floor(i/3)*1.05,mat.white,factory);cylinder(.47,.06,drum.position.x,1.36,drum.position.z,mat.white,factory);if(i===0){const face=new T.Mesh(new T.PlaneGeometry(.67,1),label('READY FOAMING|AGENT','200 L'));face.position.z=.455;drum.add(face)}}
 // Portable equipment remains in adjacent service bays throughout the tour.
 for(let i=0;i<3;i++){
  const g=new T.Group();g.position.set(-28+i*9,0,-4);factory.add(g);
  const paint=i===0?mat.yellow:mat.white,trim=i===0?mat.dark:mat.blue,length=i===2?4.5:3.3;
  box(length+1,.22,2.2,0,.85,0,trim,g);
  for(const z of [-.8,.8])box(length+.8,.18,.12,0,.6,z,mat.dark,g);
  const tank=cylinder(i===2?1:.8,length,0,1.95,0,paint,g);tank.rotation.z=Math.PI/2;
  for(const x of [-length/2,length/2]){const end=new T.Mesh(new T.SphereGeometry(i===2?1:.8,32,24),paint);end.scale.x=.23;end.position.set(x,1.95,0);g.add(end)}
  const motor=cylinder(.27,.7,-length/2-.45,1.9,0,trim,g);motor.rotation.z=Math.PI/2;
  for(let n=0;n<6;n++)box(.04,.45,.5,-length/2-.7+n*.08,1.9,0,trim,g);
  box(.75,1.2,.7,1.3,1.5,-1,trim,g);box(.63,.85,.04,1.3,1.58,-1.37,mat.white,g);
  box(.4,.26,.025,1.3,1.78,-1.4,mat.glass,g);
  for(let n=0;n<4;n++)cylinder(.04,.025,1.1+n*.13,1.48,-1.42,n===3?mat.yellow:mat.dark,g).rotation.x=Math.PI/2;
  box(length+1,.1,2.5,0,3.2,0,trim,g);
  for(const x of [-length/2,length/2])for(const z of [-1.1,1.1])line([x,.85,z],[x,3.15,z],.045,trim,g);
  for(const z of [-1.15,1.15])for(const x of i===2?[-.65,.65]:[0]){
   const tire=new T.Mesh(new T.TorusGeometry(.42,.14,12,32),mat.dark);tire.position.set(x,.56,z);g.add(tire);
   const rim=cylinder(.31,.2,x,.56,z,mat.white,g);rim.rotation.x=Math.PI/2;
   for(let n=0;n<8;n++){const a=n*Math.PI/4;const bolt=cylinder(.025,.03,x+Math.cos(a)*.2,.56+Math.sin(a)*.2,z+(z>0?.13:-.13),mat.dark,g);bolt.rotation.x=Math.PI/2}
  }
  for(const z of [-.8,.8])line([length/2,.8,z],[length/2+1.6,.6,0],.08,trim,g);
  cylinder(.06,.65,length/2+1.3,.4,0,mat.dark,g);box(.35,.05,.3,length/2+1.3,.08,0,mat.dark,g);
  for(const x of [-length/2,length/2])for(const z of [-.9,.9]){cylinder(.05,.55,x,.3,z,mat.dark,g);box(.25,.05,.25,x,.06,z,mat.dark,g)}
  for(const z of [-.7,.7]){const hose=new T.CatmullRomCurve3([new T.Vector3(-length/2,1.9,z),new T.Vector3(-length/2-.3,.9,z),new T.Vector3(1,.65,z),new T.Vector3(1.5,1.3,z)]);g.add(new T.Mesh(new T.TubeGeometry(hose,32,.045,8,false),mat.dark))}
  const brand=new T.Mesh(new T.PlaneGeometry(1.25,.7),label('T-'+[500,1000,5000][i]));brand.position.set(0,1.95,i===2?1.01:.81);g.add(brand);
 }
 // Service access, silo ladders, bracing and hopper divisions belong to the installed plants.
 for(const plant of [factory.children[1],factory.children[2]]){
  for(let level=0;level<3;level++){
   const y=2+level*3;box(5.4,.12,4.5,0,y,0,mat.dark,plant);
   for(const z of [-2.2,2.2]){line([-2.6,y+.1,z],[2.6,y+.1,z],.035,mat.blue,plant);line([-2.6,y+1,z],[2.6,y+1,z],.035,mat.blue,plant)}
   for(const x of [-2,2])line([x,y,-2],[x,y+3,2],.06,mat.blue,plant);
   for(let step=0;step<10;step++)box(1,.07,.35,3.1,y+step*.3,-1.6+step*.35,mat.dark,plant);
  }
  for(let hopper=0;hopper<3;hopper++){
   const x=-7+hopper*3;box(2.7,1.2,3,x,1.5,6,mat.white,plant);
   for(const z of [4.5,7.5])line([x-1.3,.2,z],[x-1.3,1.4,z],.06,mat.blue,plant);
  }
  for(let y=1;y<10;y+=.4)line([-9,y,1.6],[-8.3,y,1.6],.025,mat.dark,plant);
  for(const x of [-9,-8.3])line([x,.5,1.6],[x,10,1.6],.025,mat.dark,plant);
  for(const z of [-.8,.8])line([-7,2,z],[0,2,z],.06,mat.blue,plant);
 }
 // Installed plants share the yard; their inspection views include the complete installation.
 // Curing pallets, covered service routes, fences and production connections.
 for(let row=0;row<6;row++)for(let col=0;col<8;col++){
  const x=12+col*3,z=4+row*2.3;box(2.5,.12,1.3,x,.12,z,mat.earth,factory);
  for(const band of [-.65,.65])box(.035,.65,1.22,x+band,.39,z,mat.dark,factory);
 }
 for(const z of [-24,24]){for(let x=-39;x<40;x+=4){if(z===24&&Math.abs(x)<6)continue;line([x,0,z],[x,2,z],.045,mat.dark,factory)}for(const y of [.6,1.2,1.8]){line([-39,y,z],[-6,y,z],.02,mat.dark,factory);line([6,y,z],[39,y,z],.02,mat.dark,factory)}}
 for(const x of [-35,-5,25]){const lamp=new T.PointLight('#ffd29a',24,18,2);lamp.position.set(x,4.6,5);factory.add(lamp);box(.5,.07,.25,x,4.4,5,new T.MeshBasicMaterial({color:'#ffdfad'}),factory)}
 for(const x of [-15,17])for(let n=0;n<3;n++)line([x,1,-10+n*.6],[x+9,1,-10+n*.6],.055,mat.blue,factory);
 person(-15,0,4,factory);person(-29,0,7,factory);person(8,0,5,factory);
 truck=new T.Group();scene.add(truck);box(7,.4,2.5,0,1,0,mat.dark,truck);box(2,2.2,2.4,4,1.6,0,mat.white,truck);box(.05,.8,2.1,5.04,2,0,mat.glass,truck);for(const x of [-2.3,1.7,4])for(const z of [-1.22,1.22]){const wheel=new T.Mesh(new T.TorusGeometry(.4,.15,12,32),mat.dark);wheel.position.set(x,.55,z);truck.add(wheel);const hub=cylinder(.3,.25,x,.55,z,mat.white,truck);hub.rotation.x=Math.PI/2;truckWheels.push(wheel)}for(let x=-2;x<=1;x+=1.5)for(let y=0;y<3;y++)box(1.3,.4,2,x,1.4+y*.44,0,mat.clc,truck);
 for(const z of [-1.18,1.18]){box(1.3,.7,.06,4,2,z,mat.glass,truck);box(.14,.22,.08,4.9,1.3,z,mat.yellow,truck);line([4,2.6,z],[4.5,2.6,z*1.3],.04,mat.dark,truck)}
 box(.22,.45,2.35,5.08,1,0,mat.dark,truck);
 for(const x of [-2,0,1.5])box(.05,1.5,2.05,x,2,0,mat.dark,truck);
 const rainPositions=new Float32Array(1800);for(let i=0;i<rainPositions.length;i+=3){rainPositions[i]=-20+random()*170;rainPositions[i+1]=random()*30;rainPositions[i+2]=5+random()*30}const rg=new T.BufferGeometry();rg.setAttribute('position',new T.BufferAttribute(rainPositions,3));rain=new T.Points(rg,new T.PointsMaterial({color:'#e1f0f0',size:.045,transparent:true,opacity:.5}));scene.add(rain);
 resize();addEventListener('resize',resize,{passive:true});document.body.classList.add('webgl-ready');setMode(false);addEventListener('pagehide',()=>{cancelAnimationFrame(frame);reflection.dispose();renderer.dispose()},{once:true});reduced.addEventListener('change',()=>setMode(reduced.matches));
}

// Fixed world-space camera stops; images are references, never camera frames.
const stops=[
 [27,18,33,0,1,0],[23,15,28,0,5,0],[-2,6.3,8,-5.3,4.5,3],[-1,6.3,7,-4.2,5,3],[27,16,34,0,5,0],[26,15,33,0,5,0],[18,27,20,0,23,0],[17,36,17,0,28,0],[9,31,9,3,29.5,-1],[-1,31,9,-4,27.4,2],[-1.5,29.5,7,-4,27.5,2],[39,32,46,0,14,0],[-2,12,2,-6,12,-5.2],[-2,12,1,-6,12,-5.2],[35,29,40,0,14,0],[36,22,-25,0,13,0],[22,2.2,22,40,.1,22],[25,1.8,22,45,.1,22],[28,-3.4,22,45,-3.8,22],[112,23,38,90,3,-10],[64,2.5,-1,62,.8,-6],[64,2.3,8,62,.7,3],[69,4,1,62,1.6,-14],[78,4,1,71,1.6,-14],[89,4.5,3,80,1.8,-14],[138,25,15,107,5,-19],[104,30,12,75,5,-20],[136,38,40,90,4,-10],[92,4,27,90,1.8,15],[73,6,38,70,1,22],[22,7,40,0,5,12],[38,27,43,0,13,0]
];
const deliveryRoute=new T.CatmullRomCurve3([new T.Vector3(90,0,15),new T.Vector3(90,0,22),new T.Vector3(72,0,22),new T.Vector3(30,0,22),new T.Vector3(2,0,22)]);
const controls=document.createElement('div');controls.className='machine-controls';controls.hidden=true;controls.innerHTML='<span>Inspect the plant</span><button type="button" data-orbit="-1" aria-label="Rotate plant view left">&#8592;</button><button type="button" data-orbit="1" aria-label="Rotate plant view right">&#8594;</button><button type="button" data-zoom="0.85" aria-label="Zoom in on plant">+</button><button type="button" data-zoom="1.15" aria-label="Zoom out from plant">&#8722;</button><button type="button" data-reset>Reset view</button><button type="button" data-reference>Design render</button><small>Drag to rotate &#183; scroll to continue</small>';document.querySelector('main').append(controls);
const referenceDialog=document.createElement('dialog');referenceDialog.className='reference-dialog';referenceDialog.setAttribute('aria-labelledby','reference-title');referenceDialog.innerHTML='<button type="button" aria-label="Close design render">Close</button><h2 id="reference-title"></h2><img alt=""><p>Supplied design reference. The interactive 3D model is a conceptual reconstruction.</p>';document.querySelector('main').append(referenceDialog);referenceDialog.querySelector('button').addEventListener('click',()=>referenceDialog.close());
controls.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.hasAttribute('data-reference')){const section=sections[inspectionScene],photo=section.querySelector('img'),image=referenceDialog.querySelector('img');image.src=photo.src;image.alt=photo.alt;referenceDialog.querySelector('h2').textContent=section.querySelector('h2').textContent;referenceDialog.showModal()}if(b.dataset.orbit)inspectionYaw+=Number(b.dataset.orbit)*.25;if(b.dataset.zoom)inspectionZoom=clamp(inspectionZoom*Number(b.dataset.zoom),.7,1.4);if(b.hasAttribute('data-reset')){inspectionYaw=inspectionPitch=0;inspectionZoom=1}});
container.addEventListener('pointerdown',event=>{if(inspectionScene<22||inspectionScene>26||staticMode)return;drag={x:event.clientX,y:event.clientY,id:event.pointerId};container.setPointerCapture(event.pointerId)});
container.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;inspectionYaw+=(event.clientX-drag.x)*.006;inspectionPitch+=(event.clientY-drag.y)*.003;drag.x=event.clientX;drag.y=event.clientY});
for(const name of ['pointerup','pointercancel','lostpointercapture'])container.addEventListener(name,()=>drag=null);
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
function tick(now){
 if(staticMode||document.hidden||referenceDialog.open){if(!staticMode)frame=requestAnimationFrame(tick);return}
 const sectionIndex=Math.max(0,sections.findLastIndex(s=>scrollY>=s.offsetTop)),raw=clamp(sectionIndex+(scrollY-sections[sectionIndex].offsetTop)/sections[sectionIndex].offsetHeight,0,31),dt=last?Math.min(now-last,100):16;last=now;progress=Math.abs(progress-raw)>3?raw:lerp(progress,raw,1-Math.exp(-dt/90));const index=Math.floor(progress),next=Math.min(31,index+1),fraction=progress-index,t=fraction*fraction*(3-2*fraction),a=stops[index],b=stops[next];
 camera.position.set(lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t));target.set(lerp(a[3],b[3],t),lerp(a[4],b[4],t),lerp(a[5],b[5],t));camera.lookAt(target);
 // The tunnel hold consumes three normal scene lengths without inserting empty scenes.
 if(index===17&&fraction>.5){const dive=(fraction-.5)*2;camera.position.set(25+3*dive,lerp(1.8,-3.4,dive),22);target.set(45,lerp(.1,-3.8,dive),22)}
 if(index===18){const travel=clamp(fraction/.82),x=lerp(28,112,travel*travel*(3-2*travel));camera.position.set(x,-3.4,22);target.set(x+12,-3.7,22);if(fraction>.82){const rise=(fraction-.82)/.18;camera.position.set(112,lerp(-3.4,23,rise),lerp(22,38,rise));target.set(lerp(124,90,rise),lerp(-3.7,3,rise),lerp(22,-10,rise))}}
 window.nanoliteRoad.visible=!(progress>17.65&&progress<18.99);
 const active=Math.floor(raw+0.12);sections.forEach((s,i)=>{s.classList.toggle('active',i===active);const copy=s.querySelector('.scene-copy');copy.inert=i!==active});
 const machineInspection=active>=22&&active<=26;
 document.body.classList.toggle('inspecting-plant',machineInspection);
 document.querySelector('.machine-controls').hidden=!machineInspection;
 if(active!==inspectionScene){inspectionYaw=inspectionPitch=0;inspectionZoom=1;inspectionScene=active}
 if(machineInspection&&(inspectionYaw||inspectionPitch||inspectionZoom!==1)){
  const stop=stops[active],focus=new T.Vector3(stop[3],stop[4],stop[5]),offset=new T.Vector3(stop[0],stop[1],stop[2]).sub(focus),spherical=new T.Spherical().setFromVector3(offset);
  spherical.theta+=inspectionYaw;spherical.phi=clamp(spherical.phi+inspectionPitch,.35,Math.PI/2-.06);spherical.radius*=inspectionZoom;camera.position.copy(focus).add(new T.Vector3().setFromSpherical(spherical));target.copy(focus);camera.lookAt(target);
 }
 camera.lookAt(target);
 const inspection=sections[active].classList.contains('product'),mobilePlant=machineInspection&&innerWidth<700;
 const fieldOfView=mobilePlant?55:45;if(camera.fov!==fieldOfView){camera.fov=fieldOfView;camera.updateProjectionMatrix()}
 camera.setViewOffset(innerWidth,innerHeight,inspection&&innerWidth>700?innerWidth*.16:0,innerWidth<700?(mobilePlant?innerHeight*.2:-innerHeight*.12):0,innerWidth,innerHeight);
 document.querySelector('.scroll-cue').style.opacity=clamp(1-scrollY/120);document.querySelector('.progress-label').textContent=sections[active].querySelector('h1,h2').textContent+' / '+String(active+1).padStart(2,'0');document.querySelector('.journey-tools').style.visibility=scrollY>sections.at(-1).offsetTop+sections.at(-1).offsetHeight?'hidden':'visible';
 const construction=progress<1?lerp(.01,3,progress):progress<6?3:progress<11?lerp(3,8,clamp(progress-6)):8;
 for(const child of building.children){if(!floors.includes(child)&&child!==highlights&&child.position.y>3)child.visible=child.position.y<=construction*3.4+.1}
 floors.forEach((floor,i)=>{floor.visible=i<Math.ceil(construction);floor.scale.y=clamp(construction-i,.001,1);floor.userData.final.forEach(m=>m.visible=progress>30.3)});
 const blockLift=progress<2?0:progress<3?clamp(progress-2):progress<4?clamp(4-progress):0;wallBlock.position.set(-4.2,4.65+blockLift*.4,3+blockLift*.5);wallBlock.rotation.y=blockLift*.3;wallBlock.visible=progress>1.2;workers[0].visible=progress>1;workers[1].visible=workers[2].visible=progress>6.7;
 roofTile.position.y=27.4+(progress>=9&&progress<=11?Math.sin((progress-9)*Math.PI/2)*.65:0);panel.visible=progress>=7&&progress<11.5;crane.visible=progress<30.7;
 hybridFace.visible=progress>11.5&&progress<14.3&&!(progress>12.7&&progress<13.8);for(const [key,m]of Object.entries(hybridParts)){if(key!=='plaster')m.visible=progress>11.5&&progress<14.3;m.material.emissive?.set(key===window.nanoliteWallComponent&&active===13?'#315f65':'#000000')};highlights.visible=active===5;
 rain.visible=progress>16.3&&progress<19;const time=now/1000;if(waterMaterial.userData.shader)waterMaterial.userData.shader.uniforms.waveTime.value=time;if(rain.visible){const data=rain.geometry.attributes.position;for(let i=1;i<data.array.length;i+=3)data.array[i]=(data.array[i]-dt*.012+30)%30;data.needsUpdate=true}
 const delivery=clamp((progress-28)/2.3),truckPoint=deliveryRoute.getPointAt(delivery),direction=deliveryRoute.getTangentAt(delivery);truck.position.copy(truckPoint);truck.rotation.y=Math.atan2(-direction.z,direction.x);truckWheels.forEach(wheel=>wheel.rotation.z=-delivery*90);truck.visible=progress>27&&progress<30.9;
 if(progress>=29&&progress<30.5){camera.position.set(truckPoint.x+18,7,truckPoint.z+20);target.set(truckPoint.x-4,2,truckPoint.z);camera.lookAt(target)}
 const underground=progress>17.8&&progress<18.95;sky.visible=!underground;scene.fog.color.set(underground?'#1b262a':'#c9b8a0');scene.fog.near=underground?25:85;scene.fog.far=underground?100:280;
 if(underground){
  const waterY=-5.65;reflectionCamera.copy(camera);reflectionCamera.position.y=waterY*2-camera.position.y;const reflectedTarget=target.clone();reflectedTarget.y=waterY*2-target.y;reflectionCamera.up.set(0,-1,0);reflectionCamera.lookAt(reflectedTarget);reflectionCamera.updateMatrixWorld();reflectionMatrix.multiplyMatrices(reflectionCamera.projectionMatrix,reflectionCamera.matrixWorldInverse);
  channel.visible=false;renderer.setRenderTarget(reflection);renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,1,0),-waterY)];renderer.render(scene,reflectionCamera);renderer.clippingPlanes=[];renderer.setRenderTarget(null);channel.visible=true;
  if(channel.material.userData.shader)channel.material.userData.shader.uniforms.waveTime.value=time;
 }
 renderer.render(scene,camera);window.nanoliteWorld={scene:active+1,progress,buildingFloors:8,worldIdentity:'nanolite-fixed-world',referenceFrames:false,truckHeading:truck.rotation.y,truckPosition:truck.position.toArray(),cameraPosition:camera.position.toArray(),inspectionYaw,tunnelLength:120};frame=requestAnimationFrame(tick);
}
if(reduced.matches){setMode(true)}else{try{init()}catch(error){setMode(true);mode.textContent='Scene references';mode.disabled=true;console.warn('3D scene unavailable; static journey remains accessible.',error.message)}}
