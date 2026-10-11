import * as T from './vendor/three.module.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const container=document.querySelector('.world'),sections=[...document.querySelectorAll('.scene')],mode=document.querySelector('#view-mode'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
 let renderer,staticMode=reduced.matches,frame,last=0,progress=0,sceneReadyTime=0;
function setMode(value){staticMode=value;document.body.classList.remove('scene-loading');document.body.classList.toggle('static-story',value);document.querySelector('.scene-loader').hidden=true;container.hidden=value;if(value){sections.forEach(section=>section.querySelector('.scene-copy').inert=false);cancelAnimationFrame(frame)}else if(renderer){last=0;frame=requestAnimationFrame(tick)}}

let scene,camera,building,factory,truck,crane,wallBlock,roofTile,panel,hybridFace,hybridParts,highlights,rain,waterMaterial,channel,sky,reflection,reflectionCamera,roofItems=[],hoist=[],facade=[],workers=[],truckWheels=[];
const reflectionMatrix=new T.Matrix4();
let wetRoad,inspectionLight;const puddles=[];
let treeCount=0,wallHome,roofHome,activeIndex=0;
const timeOf=id=>sections.findIndex(section=>Number(section.dataset.scene)===id),smooth=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10)},stage=(a,b)=>smooth((progress-a)/(b-a));
const floors=[],v=new T.Vector3(),target=new T.Vector3();
let seed=719;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
function concreteTexture(){const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d'),pixels=ctx.createImageData(1024,1024);for(let i=0;i<pixels.data.length;i+=4){const value=194+random()*24;pixels.data[i]=value;pixels.data[i+1]=value;pixels.data[i+2]=value-2;pixels.data[i+3]=255}ctx.putImageData(pixels,0,0);const map=new T.CanvasTexture(c);map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(4,4);map.colorSpace=T.SRGBColorSpace;return map}
const mat={};
function box(w,h,d,x,y,z,material,parent=scene){const geometry=new T.BoxGeometry(w,h,d);if(material.userData.tileMeters){const uv=geometry.attributes.uv,dimensions=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let i=0;i<uv.count;i++){const size=dimensions[Math.floor(i/4)];uv.setXY(i,uv.getX(i)*size[0]/material.userData.tileMeters,uv.getY(i)*size[1]/material.userData.tileMeters)}}const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cylinder(r,length,x,y,z,material,parent=scene){const m=new T.Mesh(new T.CylinderGeometry(r,r,length,48),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function line(a,b,r,material,parent=scene){const aa=new T.Vector3(...a),bb=new T.Vector3(...b),m=cylinder(r,aa.distanceTo(bb),0,0,0,material,parent);m.position.copy(aa.clone().add(bb).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bb.sub(aa).normalize());return m}
function label(vertical=false){const c=document.createElement('canvas');c.width=vertical?512:2048;c.height=vertical?2048:512;const ctx=c.getContext('2d');ctx.fillStyle='#1b5278';ctx.textAlign='center';ctx.font=vertical?'600 180px Arial':'600 260px Arial';if(vertical){[...'NANOLITE'].forEach((letter,i)=>ctx.fillText(letter,256,240+i*225))}else{ctx.drawImage(mat.logoSource.image,50,120,300,240);ctx.fillText('NANOLITE',1200,355)}const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.08,roughness:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})}
async function loadMaterials(){
 const loader=new T.TextureLoader(),names=['concrete_floor_worn_001',innerWidth<700?'rough_concrete_mobile':'rough_concrete','leafy_grass','rocky_terrain','brown_mud_02'];
 const materials=await Promise.all(names.map(async name=>{const [map,normalMap,roughnessMap]=await Promise.all(['Diffuse','nor_gl','Rough'].map(type=>loader.loadAsync(`assets/materials/${name}_${type}.jpg`)));map.colorSpace=T.SRGBColorSpace;for(const texture of [map,normalMap,roughnessMap]){texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())}return new T.MeshStandardMaterial({map,normalMap,roughnessMap,roughness:1,normalScale:new T.Vector2(.55,.55)})}));
 [mat.floor,mat.surface,mat.ground,mat.rock,mat.soil]=materials;materials.forEach((m,i)=>m.userData.tileMeters=[3,2,2,20,3][i]);
 const panorama=await loader.loadAsync('assets/materials/night-panorama.png');panorama.mapping=T.EquirectangularReflectionMapping;panorama.colorSpace=T.SRGBColorSpace;scene.background=panorama;scene.backgroundIntensity=.8;scene.backgroundRotation.y=.8;const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(panorama).texture;pmrem.dispose();scene.environmentIntensity=.3;scene.environment.userData.background=panorama;
 mat.logoSource=await loader.loadAsync('assets/logo.png');
 mat.packaging=await loader.loadAsync('assets/materials/packaging-atlas.png');mat.packaging.colorSpace=T.SRGBColorSpace;mat.packaging.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
}
async function init(){
 scene=new T.Scene();scene.background=new T.Color('#c38c64');scene.fog=new T.Fog('#0d1725',110,340);camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.1,700);
 renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.5:2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.localClippingEnabled=true;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;container.append(renderer.domElement);renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();setMode(true)});
 const texture=concreteTexture();for(const [name,color]of Object.entries({concrete:'#d4d0c4',clc:'#e4e4df',earth:'#77674e',grass:'#566353',dark:'#25343b',blue:'#225c7a',white:'#eeeede',yellow:'#e8ae34',brick:'#a55b3d',skin:'#947763',vest:'#b8ce5a',glass:'#446678'}))mat[name]=new T.MeshStandardMaterial({color,roughness:name==='glass'?.18:.8,metalness:['blue','yellow','dark'].includes(name)?.3:0,...(['concrete','clc'].includes(name)?{map:texture,bumpMap:texture,bumpScale:.008}:{})});
 await loadMaterials();
 mat.concrete=mat.surface.clone();mat.concrete.color.set('#9da4aa');mat.concrete.normalScale.set(.13,.13);mat.clc=mat.surface.clone();mat.clc.color.set('#ffffff');const poreCanvas=document.createElement('canvas');poreCanvas.width=poreCanvas.height=1024;const poreContext=poreCanvas.getContext('2d');poreContext.fillStyle='#eeeeea';poreContext.fillRect(0,0,1024,1024);for(let i=0;i<8500;i++){poreContext.fillStyle=i%3?'#cacac3':'#d9d9d2';poreContext.beginPath();poreContext.ellipse(random()*1024,random()*1024,.4+random()*1.5,.3+random()*1.1,random()*Math.PI,0,Math.PI*2);poreContext.fill()}const poreMap=new T.CanvasTexture(poreCanvas);poreMap.colorSpace=T.SRGBColorSpace;poreMap.wrapS=poreMap.wrapT=T.RepeatWrapping;mat.clc.map=mat.clc.bumpMap=poreMap;mat.clc.bumpScale=.004;mat.clc.normalMap=null;mat.clc.userData.tileMeters=.5;mat.grass=mat.ground;mat.earth=mat.soil;mat.grass.color.set('#9eafa0');
 mat.panel=mat.floor.clone();mat.panel.color.set('#d9dcda');mat.panel.normalScale.set(.08,.08);mat.panel.userData.tileMeters=1.5;mat.panel.emissive.set('#bbc8d4');mat.panel.emissiveIntensity=.08;
 for(const name of ['blue','white','yellow','dark']){mat[name].roughness=.38;mat[name].metalness=name==='white'?.1:.65;mat[name].normalMap=mat.floor.normalMap;mat[name].normalScale=new T.Vector2(.025,.025)}
 inspectionLight=new T.PointLight('#e4efff',45,22,2);scene.add(inspectionLight);
 scene.add(new T.HemisphereLight('#bfd4ff','#25312d',1.25));const sun=new T.DirectionalLight('#c5d6ff',2.3);sun.position.set(-55,32,50);sun.castShadow=true;sun.shadow.mapSize.set(innerWidth>700?4096:2048,innerWidth>700?4096:2048);Object.assign(sun.shadow.camera,{left:-65,right:165,top:65,bottom:-60,near:1,far:240});sun.shadow.bias=-.00015;sun.shadow.normalBias=.045;sun.shadow.radius=3;sun.target.position.set(45,0,0);scene.add(sun,sun.target);
 sky=new T.Mesh(new T.SphereGeometry(360,32,16),new T.ShaderMaterial({side:T.BackSide,uniforms:{top:{value:new T.Color('#556f87')},bottom:{value:new T.Color('#ecc497')}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform vec3 top;uniform vec3 bottom;void main(){float h=clamp(normalize(p).y*.8,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.7)),1.);}'}));sky.visible=false;
 // Rolling terrain stays outside the site and drainage corridor.
 function terrainHeight(x,z){const distance=Math.max(0,Math.min((Math.abs(z)-36)/35,(Math.abs(x-55)-95)/35+1));return -.45+distance*(2.8+Math.sin(x*.035)*Math.cos(z*.025)*2.2)}
 for(const [depth,center]of [[2020,-992],[2000,1026]]){const geometry=new T.PlaneGeometry(2000,depth,120,120);geometry.rotateX(-Math.PI/2);const pos=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<pos.count;i++){pos.setY(i,terrainHeight(pos.getX(i)+70,pos.getZ(i)+center));uv.setXY(i,uv.getX(i)*1000,uv.getY(i)*depth/2)}geometry.computeVertexNormals();const ground=new T.Mesh(geometry,mat.grass);ground.position.set(70,0,center);ground.receiveShadow=true;scene.add(ground)}
 box(145,.5,8,-62.5,-.7,22,mat.grass);box(165,.5,8,212.5,-.7,22,mat.grass);
 const excavation=new T.Mesh(new T.CircleGeometry(19,80),mat.soil);excavation.rotation.x=-Math.PI/2;excavation.scale.y=.77;excavation.position.y=-.38;excavation.receiveShadow=true;scene.add(excavation);
 for(let i=0;i<18;i++){const a=random()*Math.PI*2,mound=new T.Mesh(new T.IcosahedronGeometry(.8+random()*.8,3),mat.soil);mound.position.set(Math.cos(a)*18,-.42,Math.sin(a)*14);mound.scale.set(1+random(),.25+random()*.45,.8+random());mound.receiveShadow=mound.castShadow=true;scene.add(mound)}
 for(const z of [-9,9])box(24,.12,1.1,0,-.33,z,mat.soil);for(const x of [-12,12])box(1.1,.12,19,x,-.33,0,mat.soil);
 for(const x of [-28,34,70,115,155]){line([x,0,16],[x,7,16],.065,mat.dark);line([x,7,16],[x,7,19],.045,mat.dark);box(.65,.1,.35,x,7,19,new T.MeshBasicMaterial({color:'#dfeeff'}));const light=new T.PointLight('#d5e7ff',110,32,2);light.position.set(x,6.8,19);scene.add(light)}
 const siteLight=new T.PointLight('#e7efff',220,42,2);siteLight.position.set(0,16,12);scene.add(siteLight);

 waterMaterial=new T.MeshPhysicalMaterial({color:'#526c71',roughness:.08,metalness:.6});
 const treeAsset=await new GLTFLoader().loadAsync('assets/models/tree.gltf');
 const treePositions=[],treeInstances=innerWidth<700?70:135;
 while(treePositions.length<treeInstances){const x=-100+random()*310,z=-110+random()*240;if(Math.abs(x)<32&&Math.abs(z)<35||x>40&&x<151&&z>-42&&z<40||z>10&&z<48||x>-18&&x<48&&z>30&&z<58)continue;treePositions.push([x,z,1.8+random()*1.5,random()*Math.PI*2])}
 treeAsset.scene.traverse(source=>{if(!source.isMesh)return;const trees=new T.InstancedMesh(source.geometry,source.material,treeInstances),dummy=new T.Object3D();trees.castShadow=true;trees.receiveShadow=true;source.material.roughness=.95;treePositions.forEach(([x,z,scale,angle],i)=>{dummy.position.set(x,terrainHeight(x,z),z);dummy.scale.setScalar(scale);dummy.rotation.set(0,angle,0);dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix)});scene.add(trees)});treeCount=treeInstances;
 for(let n=0;n<55;n++){const rock=new T.Mesh(new T.IcosahedronGeometry(.12+random()*.3,1),mat.rock);rock.position.set(-85+random()*255,-.33,-58.5+random()*2.5);rock.scale.set(1,.5,1.2);rock.receiveShadow=true;scene.add(rock)}
 building=new T.Group();scene.add(building);
 for(const x of [-9,-3,3,9])for(const z of [-6,0,6]){box(1.5,.8,1.5,x,.25,z,mat.concrete,building);for(let n=0;n<4;n++)cylinder(.025,1.2,x+(n%2)*.15-.075,1.1,z+Math.floor(n/2)*.15-.075,mat.dark,building)}
 for(const z of [-6,0,6])box(20,.5,.6,0,.1,z,mat.concrete,building);for(const x of [-9,-3,3,9])box(.6,.5,13,x,.1,0,mat.concrete,building);
 mat.mortar=new T.MeshStandardMaterial({color:'#c8c4b8',roughness:1});mat.glass=new T.MeshPhysicalMaterial({color:'#bacbd0',roughness:.09,metalness:.3,envMapIntensity:1.3,clearcoat:1});
 function masonry(length,courses,x,y,z,rotation,parent,extract=false){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);for(let row=0;row<courses;row++){let left=-length/2;let col=0;while(left<length/2-.001){const width=Math.min(row%2&&col===0?.45:.9,length/2-left),block=box(width-.008,.352,.28,left+width/2,row*.36+.18,0,mat.clc,g);if(extract&&row===courses-1&&col===3){wallBlock=block;wallHome=block.position.clone()}else{if(row<courses-1)box(width,.008,.275,left+width/2,(row+1)*.36,0,mat.mortar,g);if(left+width<length/2-.001)box(.008,.36,.275,left+width,row*.36+.18,0,mat.mortar,g)}left+=width;col++}}return g}
 for(let floor=0;floor<8;floor++){
  const g=new T.Group();g.position.y=floor*3.4;building.add(g);floors.push(g);g.userData.final=[];
  for(const x of [-9,-3,3,9])for(const z of [-6,0,6])box(.55,3.4,.55,x,1.7,z,mat.concrete,g);
  box(20,.25,14,0,3.4,0,mat.concrete,g);for(const z of [-6,6])box(20,.5,.5,0,3.14,z,mat.concrete,g);
  for(let step=0;step<12;step++)box(2,.14,.52,7,.2+step*.265,-4+step*.43,mat.concrete,g);
  box(2,.18,2,7,3.25,1.5,mat.concrete,g);const stairSupport=box(2,.16,6,7,1.65,-1.45,mat.concrete,g);stairSupport.rotation.x=-.55;
  for(const z of [-6,6])for(const x of [-6,0,6])masonry(5.45,3,x,.12,z,0,g,floor===1&&z===6&&x===-6);
  for(const x of [-9,9])for(const z of [-3,3])masonry(5.45,3,x,.12,z,Math.PI/2,g);
  function windowBay(x,z,angle){const frame=new T.Group();frame.position.set(x,2.08,z);frame.rotation.y=angle;g.add(frame);for(const xx of [-2.42,2.42])box(.065,1.86,.14,xx,0,0,mat.dark,frame);for(const yy of [-.93,.93])box(4.9,.07,.14,0,yy,0,mat.dark,frame);for(const xx of [-1.22,0,1.22])box(.035,1.8,.1,xx,0,.025,mat.dark,frame);box(4.75,1.77,.045,0,0,0,mat.glass,frame);g.userData.final.push(frame)}
  for(const z of [-6.17,6.17])for(const x of [-6,0,6])windowBay(x,z,0);for(const x of [-9.17,9.17])for(const z of [-3,3])windowBay(x,z,Math.PI/2);
 }
 const tiledRoof=new T.Group();building.add(tiledRoof);roofItems.push(tiledRoof);const insulation=mat.clc.clone();insulation.color.set('#d8cfad');const backing=mat.concrete.clone();backing.color.set('#bcc4cb');
 for(let x=0;x<16;x++)for(let z=0;z<11;z++){const tile=new T.Group();tile.position.set((x-7.5)*1.2,27.45,(z-5)*1.2);tiledRoof.add(tile);box(1.192,.07,1.192,0,.065,0,mat.panel,tile);box(1.188,.12,1.188,0,-.03,0,insulation,tile);box(1.188,.04,1.188,0,-.11,0,backing,tile);if(x===4&&z===7){roofTile=tile;roofHome=tile.position.clone()}}
 for(const z of [-6.8,6.8])roofItems.push(box(20,.65,.16,0,27.7,z,mat.concrete,building));for(const x of [-9.8,9.8])roofItems.push(box(.16,.65,13.6,x,27.7,0,mat.concrete,building));
 crane=new T.Group();crane.position.set(13,0,-7);scene.add(crane);const height=35;for(let y=0;y<height;y+=2){for(const x of [-.6,.6])for(const z of [-.6,.6])line([x,y,z],[x,y+2,z],.045,mat.yellow,crane);for(const z of [-.6,.6])line([-.6,y,z],[.6,y+2,z],.035,mat.yellow,crane)}line([-20,height,0],[7,height,0],.13,mat.yellow,crane);line([-20,height+1,0],[7,height+1,0],.09,mat.yellow,crane);for(let x=-20;x<7;x+=2)line([x,height,0],[x+2,height+1,0],.035,mat.yellow,crane);
 panel=box(2.5,4,.16,3,30,-7,mat.panel);hoist.push(line([3,35,-7],[3,33,-7],.025,mat.dark));hoist.push(line([3,33,-7],[2.1,32,-7],.025,mat.dark));hoist.push(line([3,33,-7],[3.9,32,-7],.025,mat.dark));box(2.3,1.6,1.6,0,34,0,mat.yellow,crane);box(2.1,1.1,.035,0,34.15,.82,mat.glass,crane);box(.035,1.1,1.45,-1.17,34.15,0,mat.glass,crane);box(3,1.2,2,5,35,0,mat.concrete,crane);box(3,.12,2.5,0,33.1,0,mat.dark,crane);for(let y=0;y<34;y+=.4)line([-.3,y,-.66],[.3,y,-.66],.018,mat.dark,crane);
 for(const x of [-.32,.32])line([x,0,-.7],[x,34,-.7],.028,mat.dark,crane);
 for(let y=2;y<34;y+=2){const cage=new T.Mesh(new T.TorusGeometry(.43,.018,8,24,Math.PI),mat.yellow);cage.rotation.x=Math.PI/2;cage.position.set(0,y,-.68);crane.add(cage)}
 for(const x of [-.6,.6])for(const z of [-.6,.6]){box(.35,.06,.35,x,.08,z,mat.dark,crane);for(const xx of [-.1,.1])for(const zz of [-.1,.1])cylinder(.025,.09,x+xx,.13,z+zz,mat.dark,crane)}

 highlights=new T.Group();building.add(highlights);const edgeMaterial=new T.LineBasicMaterial({color:'#d4edff',depthTest:true,transparent:false});
 function structuralEdge(w,h,d,x,y,z){const edge=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(w,h,d)),edgeMaterial);edge.position.set(x,y,z);edge.renderOrder=0;highlights.add(edge)}
 for(let f=0;f<3;f++){
  for(const x of [-9,-3,3,9])for(const z of [-6,6])structuralEdge(.58,3.4,.58,x,f*3.4+1.7,z);
  for(const z of [-6,6])structuralEdge(20,.52,.55,0,f*3.4+3.14,z);
  for(const x of [-9,9])structuralEdge(.55,.52,14,x,f*3.4+3.14,0);
 }
 const roadCurve=new T.CatmullRomCurve3([new T.Vector3(-15,0,22),new T.Vector3(20,0,22),new T.Vector3(70,0,22),new T.Vector3(130,0,22)]);
 const roadShape=new T.Shape();roadShape.moveTo(-1000,-4);roadShape.lineTo(1000,-4);roadShape.lineTo(1000,4);roadShape.lineTo(-1000,4);roadShape.closePath();for(const x of [25,112]){const hole=new T.Path();hole.absarc(x,0,1.5,0,Math.PI*2,true);roadShape.holes.push(hole)}
 const roadGeometry=new T.ExtrudeGeometry(roadShape,{depth:.45,bevelEnabled:false,curveSegments:32}),roadUV=roadGeometry.attributes.uv;for(let i=0;i<roadUV.count;i++)roadUV.setXY(i,roadUV.getX(i)/2,roadUV.getY(i)/2);wetRoad=new T.MeshPhysicalMaterial({map:mat.floor.map,normalMap:mat.floor.normalMap,normalScale:new T.Vector2(.12,.12),color:'#666f79',roughness:.2,metalness:.15,clearcoat:1,clearcoatRoughness:.09});const road=new T.Mesh(roadGeometry,wetRoad);road.rotation.x=-Math.PI/2;road.position.set(0,-.45,22);road.receiveShadow=true;scene.add(road);
 const covers=[];for(const x of [25,112]){const cover=new T.Mesh(new T.CircleGeometry(1.48,40),x===25?mat.clc:mat.dark);cover.rotation.x=-Math.PI/2;cover.position.set(x,.008,22);scene.add(cover);covers.push(cover)}
 window.nanoliteCovers=covers;
 for(const z of [17.85,26.15])box(2000,.22,.3,0,.05,z,mat.concrete);
 const stripeMaterial=new T.MeshStandardMaterial({color:'#f1eee2',roughness:.3,metalness:.15}),dummyRoad=new T.Object3D();
 const markings=new T.InstancedMesh(new T.BoxGeometry(3,.009,.1),stripeMaterial,200),eyes=new T.InstancedMesh(new T.BoxGeometry(.13,.025,.09),new T.MeshPhysicalMaterial({color:'#fff5b5',emissive:'#c2aa60',emissiveIntensity:.4,roughness:.08,metalness:.8}),200);
 let stripeCount=0,eyeCount=0;for(let i=0;i<200;i++){const x=-600+i*6;if([25,112].every(shaft=>Math.abs(x-shaft)>3.2)){dummyRoad.position.set(x,.013,22);dummyRoad.updateMatrix();markings.setMatrixAt(stripeCount++,dummyRoad.matrix)}if([25,112].every(shaft=>Math.abs(x+3.4-shaft)>1.9)){dummyRoad.position.set(x+3.4,.026,22);dummyRoad.updateMatrix();eyes.setMatrixAt(eyeCount++,dummyRoad.matrix)}}markings.count=stripeCount;eyes.count=eyeCount;scene.add(markings,eyes);
 for(const z of [18.4,25.6])box(2000,.009,.08,0,.012,z,stripeMaterial);
 for(let i=0;i<22;i++){const puddle=new T.Mesh(new T.CircleGeometry(.45+random()*.5,48),new T.MeshPhysicalMaterial({color:'#263948',roughness:.03,metalness:.6,transparent:true,opacity:.55,clearcoat:1,envMapIntensity:2}));const positions=puddle.geometry.attributes.position;for(let j=1;j<positions.count;j++){const factor=.82+random()*.27;positions.setXY(j,positions.getX(j)*factor,positions.getY(j)*factor)}puddle.geometry.computeVertexNormals();puddle.rotation.x=-Math.PI/2;puddle.scale.set(2,.55,1);puddle.position.set(5+random()*135,.015,i%2?24.5:19.5);scene.add(puddle);puddles.push(puddle)}

 const tunnel=new T.Group();tunnel.position.set(70,-3.85,22);scene.add(tunnel);
 const tunnelMaterial=mat.floor.clone();tunnelMaterial.side=T.DoubleSide;tunnelMaterial.color.set('#989d99');
 // Round concrete bore with real shaft gaps and continuous canal beneath the camera.
 for(const [left,right]of [[-60,-46.5],[-43.5,40.5],[43.5,60]]){const shell=new T.Mesh(new T.CylinderGeometry(3.3,3.3,right-left,64,1,true),tunnelMaterial);shell.rotation.z=Math.PI/2;shell.position.x=(left+right)/2;tunnel.add(shell)}
 const walkway=box(120,.16,.8,0,-2.25,2.3,mat.floor,tunnel);
 for(const x of [-60,60]){const end=new T.Mesh(new T.CircleGeometry(3.3,64),tunnelMaterial);end.rotation.y=Math.PI/2;end.position.x=x;tunnel.add(end)}
 for(let x=-57;x<=57;x+=12){const lamp=new T.PointLight('#d5e6ff',12,16,2);lamp.position.set(x,2.35,1.9);tunnel.add(lamp);box(.65,.08,.22,x,2.5,1.9,new T.MeshBasicMaterial({color:'#e9f4ff'}),tunnel);const ring=new T.Mesh(new T.TorusGeometry(3.28,.035,8,64),mat.dark);ring.rotation.y=Math.PI/2;ring.position.x=x;tunnel.add(ring)}
 window.nanoliteRoad=road;window.nanoliteTunnel=tunnel;
 reflection=new T.WebGLRenderTarget(innerWidth<700?512:1024,innerWidth<700?512:1024);reflectionCamera=new T.PerspectiveCamera();
 const channelMaterial=new T.MeshPhysicalMaterial({color:'#537888',roughness:.07,metalness:.4});
 channelMaterial.onBeforeCompile=shader=>{shader.uniforms.reflectionMap={value:reflection.texture};shader.uniforms.reflectionMatrix={value:reflectionMatrix};shader.uniforms.waveTime={value:0};channelMaterial.userData.shader=shader;
  shader.vertexShader='uniform mat4 reflectionMatrix;uniform float waveTime;varying vec4 reflectedPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z+=sin(position.x*.65-waveTime*3.8)*.025+sin(position.y*1.4+waveTime)*.015;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nreflectedPosition=reflectionMatrix*modelMatrix*vec4(transformed,1.);');
  shader.fragmentShader='uniform sampler2D reflectionMap;uniform float waveTime;varying vec4 reflectedPosition;\n'+shader.fragmentShader.replace('#include <opaque_fragment>','vec2 reflectionUV=reflectedPosition.xy/reflectedPosition.w*.5+.5;reflectionUV+=vec2(sin(vViewPosition.x*2.+waveTime),cos(vViewPosition.z*2.-waveTime))*.004;vec3 reflected=texture2D(reflectionMap,clamp(reflectionUV,0.,1.)).rgb;outgoingLight=mix(outgoingLight,reflected,.6);\n#include <opaque_fragment>');
 };
 channel=new T.Mesh(new T.PlaneGeometry(120,4.5,160,24),channelMaterial);channel.rotation.x=-Math.PI/2;channel.position.y=-2.4;tunnel.add(channel);
 // shortcut: the water surface is a procedural illustration; replace with simulated flow for film-quality output.
 for(const x of [25,112]){const shaft=new T.Mesh(new T.CylinderGeometry(1.5,1.5,.9,48,1,true),tunnelMaterial);shaft.position.set(x,-.42,22);scene.add(shaft);const rim=new T.Mesh(new T.TorusGeometry(1.5,.08,8,40),mat.dark);rim.rotation.x=Math.PI/2;rim.position.set(x,.04,22);scene.add(rim)}
 const rusty=mat.rock.clone();rusty.color.set('#8b553b');for(let y=-5;y<3;y+=.38)line([111.1,y,21],[111.7,y,21],.028,rusty);for(const x of [111.1,111.7])line([x,-5,21],[x,3,21],.03,rusty);
 const exitLight=new T.PointLight('#ffe0a8',65,18,2);exitLight.position.set(112,-.5,22);scene.add(exitLight);
 factory=new T.Group();factory.position.set(90,0,-10);scene.add(factory);const yardMaterial=mat.floor.clone();yardMaterial.normalScale.set(.045,.045);yardMaterial.color.set('#9ea7ae');yardMaterial.userData.tileMeters=6;box(80,.25,48,0,-.1,0,yardMaterial,factory);
 const installed=(x,z,count)=>{const g=new T.Group();g.position.set(x,0,z);factory.add(g);for(let i=0;i<count;i++){cylinder(1.5,8.4,-8+i*4,6,0,mat.white,g);cylinder(1.52,.6,-8+i*4,10.3,0,mat.blue,g);const hopper=new T.Mesh(new T.ConeGeometry(1.5,1.8,32),mat.blue);hopper.rotation.z=Math.PI;hopper.position.set(-8+i*4,1.1,0);g.add(hopper);const brand=new T.Mesh(new T.PlaneGeometry(1.2,6.2),label(true));brand.position.set(-8+i*4,6.5,1.52);g.add(brand);const rearBrand=brand.clone();rearBrand.position.z=-1.52;rearBrand.rotation.y=Math.PI;g.add(rearBrand);const guard=new T.Mesh(new T.TorusGeometry(1.48,.035,8,40),mat.blue);guard.rotation.x=Math.PI/2;guard.position.set(-8+i*4,11.15,0);g.add(guard);for(let n=0;n<8;n++){const a=n*Math.PI/4;line([-8+i*4+Math.cos(a)*1.48,10.6,Math.sin(a)*1.48],[-8+i*4+Math.cos(a)*1.48,11.15,Math.sin(a)*1.48],.025,mat.blue,g)}for(const xx of [-1,1])for(const zz of [-1,1])line([-8+i*4+xx,0,zz],[-8+i*4+xx,2,zz],.06,mat.dark,g)}for(const x of [-2,2])for(const z of [-2,2])line([x,0,z],[x,12,z],.1,mat.blue,g);for(let i=0;i<3;i++){const y=3+i*3,tank=cylinder(1.15,4.5,0,y,0,mat.white,g);tank.rotation.z=Math.PI/2;for(const x of [-2.35,2.35]){const cap=cylinder(1.18,.18,x,y,0,mat.blue,g);cap.rotation.z=Math.PI/2}const motor=cylinder(.35,.6,2.8,y,0,mat.blue,g);motor.rotation.z=Math.PI/2;const face=new T.Mesh(new T.PlaneGeometry(2.6,.65),label());face.position.set(0,y,1.16);g.add(face)}box(5,2.5,3,7,1.25,0,mat.white,g);box(2,1.2,.06,7,1.8,1.53,mat.glass,g);const conveyor=box(12,.4,1.5,-6,3,6,mat.dark,g);conveyor.rotation.z=.4;return g};installed(-15,-10,2);installed(17,-9,4);
 for(let row=0;row<6;row++)for(let col=0;col<8;col++)box(2.4,.6,1.2,12+col*3,.3,4+row*2.3,mat.clc,factory);
 for(const z of [5,14]){box(22,.25,6,-22,4.2,z,mat.blue,factory);for(const x of [-32,-12])for(const zz of [z-2.5,z+2.5])line([x,0,zz],[x,4,zz],.08,mat.dark,factory)}
 for(const z of [5,14]){for(let n=0;n<75;n++)box(.06,.07,6,-33+n*.3,4.37,z,mat.blue,factory);for(const x of [-32,-22,-12]){line([x,3.65,z-2.7],[x,4.1,z],.035,mat.dark,factory);line([x,4.1,z],[x,3.65,z+2.7],.035,mat.dark,factory)}}
 function packaging(kind){const map=mat.packaging.clone();map.needsUpdate=true;map.repeat.set(.5,1);map.offset.set(kind==='bag'?0:.5,0);return new T.MeshStandardMaterial({map,roughness:kind==='bag'?.92:.48,metalness:0})}
 mat.timber=new T.MeshStandardMaterial({color:'#967047',roughness:.95});
 function pallet(w,d,x,z,parent){for(const xx of [-w*.36,0,w*.36])box(.16,.13,d,xx+x,.12,z,mat.timber,parent);for(let i=0;i<7;i++)box(w,.07,d/7-.025,x,.22,z-d/2+(i+.5)*d/7,mat.timber,parent)}
 const sackMaterial=new T.MeshStandardMaterial({color:'#ece8dd',roughness:.94,normalMap:mat.floor.normalMap,normalScale:new T.Vector2(.025,.025)}),bagFace=packaging('bag');
 pallet(4.4,3.4,-27,4.3,factory);
 function sack(x,y,z,upright){const dimensions=upright?[.75,1.2,.3]:[.88,.23,.72],geometry=new T.BoxGeometry(...dimensions,12,8,8),pos=geometry.attributes.position;for(let n=0;n<pos.count;n++){const px=pos.getX(n),py=pos.getY(n),pz=pos.getZ(n);pos.setY(n,py+Math.sin(px*29+pz*22)*.007);pos.setZ(n,pz*(.95+.05*Math.cos(px*5)))}geometry.computeVertexNormals();const bag=new T.Mesh(geometry,sackMaterial);bag.position.set(x,y,z);bag.castShadow=bag.receiveShadow=true;factory.add(bag);const front=geometry.clone(),indices=[];for(let k=0;k<front.index.count;k+=3){const ids=[front.index.getX(k),front.index.getX(k+1),front.index.getX(k+2)];if(ids.every(j=>upright?front.attributes.normal.getZ(j)>.8:front.attributes.normal.getY(j)>.8))indices.push(...ids)}front.setIndex(indices);const face=new T.Mesh(front,bagFace);if(upright)face.position.z=.002;else face.position.y=.002;bag.add(face);for(const side of [-1,1])box(dimensions[0]*.96,.016,.028,0,upright?side*.58:side*.105,upright?0:dimensions[2]*.46,sackMaterial,bag)}
 for(let level=0;level<6;level++)for(let col=0;col<4;col++)for(let row=0;row<3;row++)sack(-28.45+col*.96,.38+level*.235,3.05+row*.77,false);
 for(let col=0;col<5;col++)sack(-28.6+col*.8,.87,5.65,true);
 pallet(3.8,2.5,-26.9,13.5,factory);const drumFace=packaging('drum');
 const drumProfile=[[-.46,.29],[-.44,.32],[-.39,.32],[-.37,.335],[-.34,.32],[-.17,.32],[-.15,.335],[-.12,.32],[.12,.32],[.15,.335],[.18,.32],[.34,.32],[.37,.335],[.4,.32],[.44,.32],[.46,.29]].map(([y,r])=>new T.Vector2(r,y));
 for(let i=0;i<12;i++){const x=-28.15+(i%4)*.83,z=12.75+Math.floor(i/4)*.74,drum=new T.Mesh(new T.LatheGeometry(drumProfile,64),mat.white);drum.position.set(x,.72,z);drum.castShadow=drum.receiveShadow=true;factory.add(drum);cylinder(.295,.025,x,1.195,z,mat.white,factory);for(const [dx,dz,r]of [[.14,.1,.035],[-.13,-.1,.02]]){cylinder(r,.025,x+dx,1.22,z+dz,mat.dark,factory);cylinder(r*.85,.027,x+dx,1.23,z+dz,mat.white,factory)}const face=new T.Mesh(new T.CylinderGeometry(.337,.337,.76,64,1,true,-Math.PI/3,Math.PI*2/3),drumFace);face.position.y=.01;drum.add(face)}
 // Portable equipment remains in adjacent service bays throughout the tour.
 for(let i=0;i<3;i++){
  const g=new T.Group();g.position.set(-28+i*9,0,-1);factory.add(g);
  const paint=mat.white,trim=mat.blue,length=3.3;
  box(length+1,.22,2.2,0,.85,0,trim,g);
  for(const z of [-.8,.8])box(length+.8,.18,.12,0,.6,z,mat.dark,g);
  const tank=cylinder(.8,length,0,1.95,0,paint,g);tank.rotation.z=Math.PI/2;
  for(const x of [-length/2,length/2]){const end=new T.Mesh(new T.SphereGeometry(.8,32,24),paint);end.scale.x=.23;end.position.set(x,1.95,0);g.add(end)}
  const motor=cylinder(.27,.7,-length/2-.45,1.9,0,trim,g);motor.rotation.z=Math.PI/2;
  for(let n=0;n<6;n++)box(.04,.45,.5,-length/2-.7+n*.08,1.9,0,trim,g);
  box(.75,1.2,.7,1.3,1.5,-1,trim,g);box(.63,.85,.04,1.3,1.58,-1.37,mat.white,g);
  box(.4,.26,.025,1.3,1.78,-1.4,mat.glass,g);
  for(let n=0;n<4;n++)cylinder(.04,.025,1.1+n*.13,1.48,-1.42,n===3?mat.yellow:mat.dark,g).rotation.x=Math.PI/2;
  box(length+1,.1,2.5,0,3.2,0,trim,g);
  for(const x of [-length/2,length/2])for(const z of [-1.1,1.1])line([x,.85,z],[x,3.15,z],.045,trim,g);
  for(const z of [-1.15,1.15])for(const x of [-.65,.65]){
   const tire=new T.Mesh(new T.TorusGeometry(.42,.14,12,32),mat.dark);tire.position.set(x,.56,z);g.add(tire);
   const rim=cylinder(.31,.2,x,.56,z,mat.white,g);rim.rotation.x=Math.PI/2;
   for(let n=0;n<8;n++){const a=n*Math.PI/4;const bolt=cylinder(.025,.03,x+Math.cos(a)*.2,.56+Math.sin(a)*.2,z+(z>0?.13:-.13),mat.dark,g);bolt.rotation.x=Math.PI/2}
  }
  for(const z of [-.8,.8])line([length/2,.8,z],[length/2+1.6,.6,0],.08,trim,g);
  cylinder(.06,.65,length/2+1.3,.4,0,mat.dark,g);box(.35,.05,.3,length/2+1.3,.08,0,mat.dark,g);
  for(const x of [-length/2,length/2])for(const z of [-.9,.9]){cylinder(.05,.55,x,.3,z,mat.dark,g);box(.25,.05,.25,x,.06,z,mat.dark,g)}
  for(const z of [-.7,.7]){const hose=new T.CatmullRomCurve3([new T.Vector3(-length/2,1.9,z),new T.Vector3(-length/2-.3,.9,z),new T.Vector3(1,.65,z),new T.Vector3(1.5,1.3,z)]);g.add(new T.Mesh(new T.TubeGeometry(hose,32,.045,8,false),mat.dark))}
  const brand=new T.Mesh(new T.PlaneGeometry(1.75,.45),label());brand.position.set(0,1.95,.81);g.add(brand);const scale=[.82,1,1.28][i];g.scale.setScalar(scale);
 }
 // Service access, silo ladders, bracing and hopper divisions belong to the installed plants.
 for(const plant of [factory.children[1],factory.children[2]]){
  box(7.6,.12,4.5,.6,11,0,mat.dark,plant);
  for(let level=0;level<3;level++){
   const y=2+level*3;box(7.6,.12,4.5,.6,y,0,mat.dark,plant);
   for(const z of [-2.2,2.2]){line([-2.6,y+.1,z],[2.6,y+.1,z],.035,mat.blue,plant);line([-2.6,y+1,z],[2.6,y+1,z],.035,mat.blue,plant)}
   for(const x of [-2,2])line([x,y,-2],[x,y+3,2],.06,mat.blue,plant);
   for(let step=0;step<10;step++)box(1,.07,.35,3.1,y+.15+step*.3,-1.6+step*.35,mat.dark,plant);box(1.4,.1,.8,3.1,y+3,1.9,mat.dark,plant);line([3.1,y,-1.6],[3.1,y+3,1.9],.075,mat.blue,plant);for(const x of [2.6,3.6]){line([x,y,-1.6],[x,y+3,1.9],.06,mat.blue,plant);line([x,y+1,-1.6],[x,y+4,1.9],.03,mat.blue,plant)}
  }
  for(let hopper=0;hopper<3;hopper++){
   const x=-7+hopper*3;box(2.7,1.2,3,x,1.5,6,mat.white,plant);const gravel=new T.Mesh(new T.ConeGeometry(1.1,.7,12),mat.rock);gravel.position.set(x,2.2,6);gravel.scale.z=1.2;plant.add(gravel);for(const xx of [-1.25,0,1.25])box(.04,1.2,.08,x+xx,1.5,7.53,mat.blue,plant);
   for(const z of [4.5,7.5])line([x-1.3,.2,z],[x-1.3,1.4,z],.06,mat.blue,plant);
  }
  for(let y=1;y<10;y+=.4)line([-9,y,1.6],[-8.3,y,1.6],.025,mat.dark,plant);
  for(const x of [-9,-8.3])line([x,.5,1.6],[x,10,1.6],.025,mat.dark,plant);
  for(const z of [-.8,.8])line([-7,2,z],[0,2,z],.06,mat.blue,plant);
 }
 // Installed plants share the yard; their inspection views include the complete installation.
 // Curing pallets, covered service routes, fences and production connections.
 for(let row=0;row<6;row++)for(let col=0;col<8;col++){
  const x=12+col*3,z=4+row*2.3;pallet(2.5,1.3,x,z,factory);
  for(const band of [-.65,.65])box(.035,.65,1.22,x+band,.39,z,mat.dark,factory);
 }
 for(const z of [-24,24]){for(let x=-39;x<40;x+=4){if(z===24&&Math.abs(x)<6)continue;line([x,0,z],[x,2,z],.045,mat.dark,factory)}for(const y of [.6,1.2,1.8]){line([-39,y,z],[-6,y,z],.02,mat.dark,factory);line([6,y,z],[39,y,z],.02,mat.dark,factory)}}
 for(const x of [-35,-5,25]){const lamp=new T.PointLight('#e7f2ff',90,24,2);lamp.position.set(x,4.6,5);factory.add(lamp);box(.5,.07,.25,x,4.4,5,new T.MeshBasicMaterial({color:'#ffdfad'}),factory)}
 for(const x of [-15,17])for(let n=0;n<3;n++)line([x,1,-10+n*.6],[x+9,1,-10+n*.6],.055,mat.blue,factory);

 // A proportioned rigid flatbed replaces the mismatched tractor and trailer asset.
 truck=new T.Group();scene.add(truck);box(7.6,.22,2.2,.05,.85,0,mat.dark,truck);box(5.6,.2,2.35,-1.05,1.08,0,mat.blue,truck);
 const cabShape=new T.Shape();cabShape.moveTo(1.9,1.05);cabShape.lineTo(4.05,1.05);cabShape.quadraticCurveTo(4.18,1.05,4.18,1.2);cabShape.lineTo(4.18,2.25);cabShape.lineTo(3.76,3.05);cabShape.quadraticCurveTo(3.7,3.2,3.52,3.2);cabShape.lineTo(2.1,3.2);cabShape.quadraticCurveTo(1.9,3.2,1.9,3);cabShape.closePath();const cab=new T.Mesh(new T.ExtrudeGeometry(cabShape,{depth:2.05,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:3,steps:1}),mat.white);cab.position.z=-1.025;cab.castShadow=cab.receiveShadow=true;truck.add(cab);
 const windshield=box(.045,.8,1.86,3.96,2.55,0,mat.glass,truck);windshield.rotation.z=.48;
 for(const z of [-1.087,1.087]){box(1.26,.76,.025,2.65,2.62,z,mat.glass,truck);box(.6,.05,.035,2.35,1.95,z,mat.dark,truck);line([3.68,2.3,z],[3.9,2.35,z*1.28],.025,mat.dark,truck);box(.14,.4,.24,3.87,2.34,z*1.28,mat.dark,truck);const logo=new T.Mesh(new T.PlaneGeometry(1.25,.31),label());logo.position.set(2.65,1.62,z);if(z<0)logo.rotation.y=Math.PI;truck.add(logo)}
 box(.12,.34,2.16,4.2,1.15,0,mat.dark,truck);for(let y=0;y<5;y++)box(.035,.025,1.25,4.23,1.55+y*.08,0,mat.dark,truck);for(const z of [-.76,.76])box(.035,.19,.4,4.26,1.48,z,new T.MeshBasicMaterial({color:'#e9f4ff'}),truck);
 for(const x of [-3.15,-1.92,2.98])for(const z of [-1.16,1.16]){const tire=new T.Mesh(new T.TorusGeometry(.37,.15,20,48),mat.dark);tire.position.set(x,.52,z);truck.add(tire);truckWheels.push(tire);const rim=cylinder(.31,.21,x,.52,z,mat.white,truck);rim.rotation.x=Math.PI/2;for(let n=0;n<8;n++){const a=n*Math.PI/4;const bolt=cylinder(.028,.025,x+Math.cos(a)*.2,.52+Math.sin(a)*.2,z+(z>0?.12:-.12),mat.dark,truck);bolt.rotation.x=Math.PI/2}box(1.12,.07,.32,x,1.04,z,mat.blue,truck)}
 for(const z of [-1.2,1.2]){box(5.6,.08,.055,-1.05,1.23,z,mat.white,truck);for(const x of [-3.6,-2.2,-.8,.6,1.6])box(.08,.07,.025,x,1.11,z,new T.MeshBasicMaterial({color:'#dba54d'}),truck)}
 for(let x=-3.05;x<1;x+=1.45){box(1.4,.12,2.15,x,1.3,0,mat.timber,truck);for(let y=0;y<3;y++)box(1.38,.38,2.05,x,1.55+y*.385,0,mat.clc,truck);for(const z of [-1.035,1.035])box(.035,1.2,.025,x,1.95,z,mat.dark,truck)}
 const billboard=new T.Group();billboard.position.set(0,0,-25);factory.add(billboard);for(const x of [-10,10])line([x,0,0],[x,12,0],.14,mat.blue,billboard);box(26,4.5,.3,0,10,0,mat.white,billboard);const billboardLogo=new T.Mesh(new T.PlaneGeometry(23,4),label());billboardLogo.position.set(0,10,.16);billboard.add(billboardLogo);
 const rainPositions=new Float32Array(5400);for(let i=0;i<rainPositions.length;i+=6){const x=10+random()*140,y=random()*30,z=17+random()*10;rainPositions.set([x,y,z,x-.04,y+.7,z],i)}const rg=new T.BufferGeometry();rg.setAttribute('position',new T.BufferAttribute(rainPositions,3));rain=new T.LineSegments(rg,new T.LineBasicMaterial({color:'#cee7ff',transparent:true,opacity:.65,depthWrite:false}));scene.add(rain);
 function batch(parent,exclude=new Set()){parent.updateWorldMatrix(true,true);const inverse=parent.matrixWorld.clone().invert(),buckets=new Map();parent.traverse(mesh=>{if(!mesh.isMesh||mesh.isInstancedMesh||exclude.has(mesh)||!mesh.visible||Array.isArray(mesh.material))return;const geometry=mesh.geometry.clone().applyMatrix4(inverse.clone().multiply(mesh.matrixWorld));const key=mesh.material.id;if(!buckets.has(key))buckets.set(key,{material:mesh.material,geometries:[],meshes:[]});buckets.get(key).geometries.push(geometry);buckets.get(key).meshes.push(mesh)});for(const {material,geometries,meshes}of buckets.values()){if(geometries.length<2)continue;const merged=mergeGeometries(geometries.map(g=>g.index?g.toNonIndexed():g),false);if(!merged)continue;const mesh=new T.Mesh(merged,material);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);meshes.forEach(m=>{for(const child of [...m.children])parent.attach(child);m.removeFromParent()});geometries.forEach(g=>g.dispose())}}
 for(const floor of floors){const excluded=new Set([wallBlock]);floor.userData.final.forEach(frame=>frame.traverse(m=>excluded.add(m)));batch(floor,excluded);floor.userData.final.forEach(frame=>batch(frame));floor.userData.clipPlane=new T.Plane(new T.Vector3(0,-1,0),0);const materials=new Map();floor.traverse(mesh=>{if(!mesh.isMesh)return;const original=mesh.material;if(!materials.has(original)){const material=original.clone();material.clippingPlanes=[floor.userData.clipPlane];material.clipShadows=true;materials.set(original,material)}mesh.material=materials.get(original)})}const roofExclude=new Set();roofTile.traverse(m=>roofExclude.add(m));batch(tiledRoof,roofExclude);batch(factory);batch(crane);batch(truck,new Set(truckWheels));
 resize();addEventListener('resize',resize,{passive:true});sceneReadyTime=performance.now();document.body.classList.add('webgl-ready');setMode(reduced.matches);addEventListener('pagehide',()=>{cancelAnimationFrame(frame);reflection.dispose();renderer.dispose()},{once:true});reduced.addEventListener('change',()=>setMode(reduced.matches));
}

// Fixed world-space camera stops; images are references, never camera frames.
const stops=[
 [0,10,40,0,1,0],[0,13,34,0,5,0],[-4.7,5.6,12,-5.3,4.5,6.3],[-2.9,5.4,10.6,-5.575,4.8,6.3],[0,14,34,0,5,0],[0,14,34,0,5,0],[18,31,20,0,25,0],[17,36,17,0,28,0],[3,31,2,3,30,-7],[-1,31,9,-4,27.4,2],[-1.5,29.5,7,-4,27.5,2],[39,32,46,0,14,0],[-6,12.2,1,-6,12,-5.2],[-6,12.2,.5,-6,12,-5.2],[35,29,40,0,14,0],[25,12,28,0,8,0],[22,2.2,22,40,.1,22],[25,1.8,22,45,.1,22],[28,-3.8,22,45,-4,22],[112,23,38,90,3,-10],[64,1.55,-1.5,63,.9,-5],[63.4,1.55,7.7,63,.8,3.6],[62,2.6,-4,62,1.8,-11],[71,2.6,-4,71,1.8,-11],[80,2.8,-3,80,1.8,-11],[97,16,2,75,5,-18],[123,16,-41,107,5,-19],[136,38,40,90,4,-10],[109,7,34,90,1.8,15],[75,8,42,57,1.5,22],[22,10,42,5,3,22],[38,27,43,0,13,0]
];
const deliveryRoute=new T.CurvePath();deliveryRoute.add(new T.CubicBezierCurve3(new T.Vector3(90,0,15),new T.Vector3(90,0,19),new T.Vector3(87,0,22),new T.Vector3(83,0,22)));deliveryRoute.add(new T.LineCurve3(new T.Vector3(83,0,22),new T.Vector3(2,0,22)));
const cameraKeys=[];
const framing={1:[0,15,19,0,0,0],2:[0,13,30,0,5,0],3:[-5.575,5.35,8.35,-5.12,5.08,6.65],4:[-5.575,5.35,8.35,-5.12,5.08,6.65],5:[0,14,30,0,5,0],6:[0,14,30,0,5,0],7:[0,32,27,0,24,0],8:[0,35,23,0,28,0],9:[3,30.4,-2.4,3.95,30,-7],10:[-4.2,29,5.2,-3.8,28.3,2.4],11:[-4.2,29,5.2,-3.8,28.3,2.4],16:[16,3,22,40,.4,22],17:[22,2.2,22,40,.1,22],18:[25,1.8,22,45,.1,22],23:[62,2.4,-6.9,62.8,1.5,-11],24:[71,2.8,-6,71.9,1.8,-11],25:[80,3.1,-4.5,81.1,2,-11]};
sections.forEach((section,index)=>{const id=Number(section.dataset.scene),p=framing[id]||stops[id-1];cameraKeys.push({time:index+(index===0?0:.2),p},{time:index+.65,p})});
function addCamera(id,fraction,p){cameraKeys.push({time:timeOf(id)+fraction,p})}
function clearCamera(id){const index=timeOf(id);for(let i=cameraKeys.length-1;i>=0;i--)if(cameraKeys[i].time>=index&&cameraKeys[i].time<index+1)cameraKeys.splice(i,1)}
clearCamera(5);addCamera(5,.2,framing[4]);addCamera(5,.65,framing[5]);addCamera(5,.85,framing[5]);
clearCamera(12);addCamera(12,.2,framing[11]);addCamera(12,.7,stops[11]);addCamera(12,.9,stops[11]);
clearCamera(18);addCamera(18,.2,framing[18]);addCamera(18,.52,framing[18]);addCamera(18,.76,[25,.15,22,32,-2,22]);
clearCamera(19);addCamera(19,.2,[25,-3.8,22,45,-3.8,22]);addCamera(19,.3,[28,-3.8,22,45,-3.8,22]);addCamera(19,.66,[109,-3.8,22,112,-3.8,22]);addCamera(19,.78,[112,-3.8,22,112,1,21.8]);addCamera(19,.94,[112,5,22,112,8,21.8]);
clearCamera(26);addCamera(26,.2,stops[25]);addCamera(26,.48,[53,18,-40,75,5,-20]);addCamera(26,.8,[92,18,-43,75,5,-20]);
cameraKeys.sort((a,b)=>a.time-b.time);
function sampleCamera(value){const i=Math.max(0,cameraKeys.findLastIndex(k=>k.time<=value)),a=cameraKeys[i],b=cameraKeys[Math.min(i+1,cameraKeys.length-1)];const t=b.time===a.time?0:smooth((value-a.time)/(b.time-a.time));return a.p.map((x,n)=>lerp(x,b.p[n],t))}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
function tick(now){
 if(staticMode||document.hidden){if(!staticMode)frame=requestAnimationFrame(tick);return}
 const sectionIndex=Math.max(0,sections.findLastIndex(s=>scrollY>=s.offsetTop)),raw=clamp(sectionIndex+(scrollY-sections[sectionIndex].offsetTop)/sections[sectionIndex].offsetHeight,0,sections.length-.01),dt=last?Math.min(now-last,100):16;progress=last?lerp(progress,raw,1-Math.exp(-dt/280)):raw;last=now;
 const pose=sampleCamera(progress);camera.position.fromArray(pose);target.fromArray(pose,3);inspectionLight.position.copy(camera.position);
 window.nanoliteCovers[0].visible=progress<timeOf(18)+.58||progress>timeOf(20)+.3;window.nanoliteCovers[1].visible=progress<timeOf(19)+.6||progress>timeOf(20)+.3;
 const candidate=Math.min(sections.length-1,Math.floor(progress)),inJourney=scrollY<sections.at(-1).offsetTop+sections.at(-1).offsetHeight;
 // Hysteresis prevents tiny wheel reversals from retriggering a caption at a boundary.
 if(candidate>activeIndex&&progress>=activeIndex+1.08||candidate<activeIndex&&progress<activeIndex-.08)activeIndex=candidate;
 const active=activeIndex;
 sections.forEach((section,i)=>{const id=Number(section.dataset.scene),local=progress-i,on=i===active&&inJourney;const arrival=[5,12].includes(id)?.71:.24;const silent=[3,7,10,15,16].includes(id);const presenting=on&&!silent&&(id===1?local<.55:local>=arrival&&local<([5,12].includes(id)?.94:section.classList.contains('product')?.73:.64));section.classList.toggle('active',on);section.classList.toggle('copy-hidden',!presenting);section.classList.toggle('departing',on&&section.classList.contains('product')&&local>.73);section.querySelector('.scene-copy').inert=!presenting});
 const construction=progress<timeOf(3)?lerp(0,3,stage(.68,timeOf(3))):progress<timeOf(7)?3:lerp(3,8,stage(timeOf(7),timeOf(8)));
 floors.forEach((floor,i)=>{const amount=clamp(construction-i);floor.visible=amount>.001;floor.scale.y=1;floor.userData.clipPlane.constant=i*3.4+amount*3.65;floor.userData.final.forEach(m=>{const finish=stage(timeOf(31)+i*.06,timeOf(32));m.visible=finish>.001;m.scale.y=Math.max(.001,finish)})});
 const blockLift=stage(timeOf(3),timeOf(4))*(1-stage(timeOf(4)+.76,timeOf(5)+.14));wallBlock.position.copy(wallHome);wallBlock.position.y+=blockLift*.7;wallBlock.position.z+=blockLift*.65;wallBlock.rotation.y=blockLift*.15;
 roofItems.forEach((m,i)=>{const amount=stage(timeOf(7)+.6+i*.002,timeOf(8)+.15+i*.002);m.visible=amount>.001;m.scale.y=Math.max(.001,amount)});roofTile.position.copy(roofHome);const tileLift=stage(timeOf(10),timeOf(11))*(1-stage(timeOf(11)+.76,timeOf(12)+.14));roofTile.position.y+=tileLift*.85;roofTile.children[0].position.y=.065+tileLift*.2;roofTile.children[2].position.y=-.11-tileLift*.12;
 panel.visible=true;panel.position.y=30+.25*Math.sin(now/2200);hoist.forEach((m,i)=>{m.visible=true;const points=i===0?[[3,35,-7],[3,panel.position.y+3,-7]]:i===1?[[3,panel.position.y+3,-7],[2.1,panel.position.y+2,-7]]:[[3,panel.position.y+3,-7],[3.9,panel.position.y+2,-7]];const a=new T.Vector3(...points[0]),b=new T.Vector3(...points[1]);m.position.copy(a.clone().add(b).multiplyScalar(.5));m.scale.y=a.distanceTo(b)/m.geometry.parameters.height;m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize())});crane.visible=true;
 highlights.visible=progress>=timeOf(6)&&progress<timeOf(7);
 const rainAmount=stage(timeOf(16)+.5,timeOf(18)+.4)*(1-stage(timeOf(19),timeOf(19)+.3));rain.material.opacity=rainAmount*.7;rain.visible=rainAmount>.001;rain.geometry.setDrawRange(0,Math.floor(rainAmount*900)*2);wetRoad.roughness=lerp(.8,.17,rainAmount);puddles.forEach(p=>p.material.opacity=rainAmount*.55);const time=now/1000;if(rain.visible){const data=rain.geometry.attributes.position;for(let i=0;i<data.array.length;i+=6){const y=(data.array[i+1]-dt*lerp(.006,.036,rainAmount)+30)%30;data.array[i+1]=y;data.array[i+4]=y+.7};data.needsUpdate=true}
 const delivery=stage(timeOf(29),timeOf(31)+.3),truckPoint=deliveryRoute.getPointAt(delivery),direction=deliveryRoute.getTangentAt(delivery);truck.position.copy(truckPoint);truck.rotation.y=Math.atan2(-direction.z,direction.x);truckWheels.forEach(wheel=>wheel.rotation.z=-delivery*90);truck.visible=true;
 if(progress>=timeOf(29)&&progress<timeOf(31)+.7){const follow=stage(timeOf(29),timeOf(29)+.3)*(1-stage(timeOf(31)+.3,timeOf(31)+.7));camera.position.lerp(new T.Vector3(truckPoint.x+11,truckPoint.y+7,truckPoint.z+13),follow);target.lerp(truckPoint.clone().add(new T.Vector3(0,1.6,0)),follow)}camera.lookAt(target);
 const underground=camera.position.y<0;const depth=smooth(clamp(-camera.position.y/2));scene.background=scene.environment.userData.background;scene.fog.color.copy(new T.Color('#0d1725').lerp(new T.Color('#1b262a'),depth));scene.fog.near=lerp(110,25,depth);scene.fog.far=lerp(340,100,depth);
 if(underground){
  const waterY=-6.25;reflectionCamera.copy(camera);reflectionCamera.position.y=waterY*2-camera.position.y;const reflectedTarget=target.clone();reflectedTarget.y=waterY*2-target.y;reflectionCamera.up.set(0,-1,0);reflectionCamera.lookAt(reflectedTarget);reflectionCamera.updateMatrixWorld();reflectionMatrix.multiplyMatrices(reflectionCamera.projectionMatrix,reflectionCamera.matrixWorldInverse);
  channel.visible=false;renderer.setRenderTarget(reflection);renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,1,0),-waterY)];renderer.render(scene,reflectionCamera);renderer.clippingPlanes=[];renderer.setRenderTarget(null);channel.visible=true;
  if(channel.material.userData.shader)channel.material.userData.shader.uniforms.waveTime.value=time;
 }
 renderer.render(scene,camera);window.nanoliteWorld={scene:Number(sections[active].dataset.scene),progress,cameraAt:sampleCamera,buildingFloors:floors.filter(f=>f.visible).length,worldIdentity:'nanolite-fixed-world',referenceFrames:false,truckHeading:truck.rotation.y,truckPosition:truck.position.toArray(),cameraPosition:camera.position.toArray(),treeCount,humanCount:0,blockPosition:wallBlock.position.toArray(),blockHome:wallHome.toArray(),tilePosition:roofTile.position.toArray(),tileHome:roofHome.toArray(),panelVisible:panel.visible,panelBottom:panel.position.y-2,tunnelLength:120,tunnelShape:'round',craneVisible:crane.visible,construction,roofTileCount:176,tileLayers:roofTile.children.length,bagCount:77,drumCount:12,rainAmount,projectionOffset:camera.view?.offsetX||0,cameraTarget:target.toArray(),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};frame=requestAnimationFrame(tick);
}
if(reduced.matches){setMode(true)}else{init().catch(error=>{setMode(true);console.warn('3D scene unavailable; static journey remains accessible.',error.message)})}
