import * as T from './vendor/three.module.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const container=document.querySelector('.world'),sections=[...document.querySelectorAll('.scene')],mode=document.querySelector('#view-mode'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
 let renderer,staticMode=reduced.matches,frame,last=0,progress=0,sceneReadyTime=0;
function setMode(value){staticMode=value;document.body.classList.remove('scene-loading');document.body.classList.toggle('static-story',value);document.querySelector('.scene-loader').hidden=true;container.hidden=value;if(value){sections.forEach(section=>section.querySelector('.scene-copy').inert=false);cancelAnimationFrame(frame)}else if(renderer){last=0;frame=requestAnimationFrame(tick)}}

let scene,camera,building,factory,truck,crane,wallBlock,roofTile,panel,hybridFace,hybridParts,highlights,rain,waterMaterial,channel,sky,reflection,reflectionCamera,roofItems=[],hoist=[],facade=[],workers=[],truckWheels=[];
const reflectionMatrix=new T.Matrix4();
let treeCount=0,wallHome,roofHome;
const floors=[],v=new T.Vector3(),target=new T.Vector3();
let seed=719;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
function concreteTexture(){const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d'),pixels=ctx.createImageData(1024,1024);for(let i=0;i<pixels.data.length;i+=4){const value=194+random()*24;pixels.data[i]=value;pixels.data[i+1]=value;pixels.data[i+2]=value-2;pixels.data[i+3]=255}ctx.putImageData(pixels,0,0);const map=new T.CanvasTexture(c);map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(4,4);map.colorSpace=T.SRGBColorSpace;return map}
const mat={};
function box(w,h,d,x,y,z,material,parent=scene){const geometry=new T.BoxGeometry(w,h,d);if(material.userData.tileMeters){const uv=geometry.attributes.uv,dimensions=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let i=0;i<uv.count;i++){const size=dimensions[Math.floor(i/4)];uv.setXY(i,uv.getX(i)*size[0]/material.userData.tileMeters,uv.getY(i)*size[1]/material.userData.tileMeters)}}const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cylinder(r,length,x,y,z,material,parent=scene){const m=new T.Mesh(new T.CylinderGeometry(r,r,length,24),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function line(a,b,r,material,parent=scene){const aa=new T.Vector3(...a),bb=new T.Vector3(...b),m=cylinder(r,aa.distanceTo(bb),0,0,0,material,parent);m.position.copy(aa.clone().add(bb).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bb.sub(aa).normalize());return m}
function label(text,weight=''){const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#f2f3ef';ctx.fillRect(0,0,512,512);ctx.fillStyle='#112329';ctx.font='bold 32px Arial';ctx.textAlign='center';ctx.fillText('NANOLITE',256,100);ctx.font='bold 27px Arial';text.split('|').forEach((s,i)=>ctx.fillText(s,256,220+i*40));ctx.font='24px Arial';ctx.fillText(weight,256,440);ctx.strokeStyle='#246087';ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(28,320);ctx.lineTo(484,320);ctx.stroke();const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:texture,roughness:.9})}
async function loadMaterials(){
 const loader=new T.TextureLoader(),names=['concrete_floor_worn_001',innerWidth<700?'rough_concrete_mobile':'rough_concrete','leafy_grass','rocky_terrain','brown_mud_02'];
 const materials=await Promise.all(names.map(async name=>{const [map,normalMap,roughnessMap]=await Promise.all(['Diffuse','nor_gl','Rough'].map(type=>loader.loadAsync(`assets/materials/${name}_${type}.jpg`)));map.colorSpace=T.SRGBColorSpace;for(const texture of [map,normalMap,roughnessMap]){texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())}return new T.MeshStandardMaterial({map,normalMap,roughnessMap,roughness:1,normalScale:new T.Vector2(.55,.55)})}));
 [mat.floor,mat.surface,mat.ground,mat.rock,mat.soil]=materials;materials.forEach((m,i)=>m.userData.tileMeters=[3,2,2,20,3][i]);
 const panorama=await loader.loadAsync('assets/materials/landscape-panorama.png');panorama.mapping=T.EquirectangularReflectionMapping;panorama.colorSpace=T.SRGBColorSpace;scene.background=panorama;scene.backgroundIntensity=1;scene.backgroundRotation.y=.8;const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(panorama).texture;pmrem.dispose();scene.environmentIntensity=1.1;scene.environment.userData.background=panorama;
 mat.packaging=await loader.loadAsync('assets/materials/packaging-atlas.png');mat.packaging.colorSpace=T.SRGBColorSpace;mat.packaging.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
}
async function init(){
 scene=new T.Scene();scene.background=new T.Color('#c38c64');scene.fog=new T.Fog('#788b81',140,420);camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.1,700);
 renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.5:2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;container.append(renderer.domElement);renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();setMode(true)});
 const texture=concreteTexture();for(const [name,color]of Object.entries({concrete:'#d4d0c4',clc:'#e4e4df',earth:'#77674e',grass:'#566353',dark:'#25343b',blue:'#225c7a',white:'#eeeede',yellow:'#e8ae34',brick:'#a55b3d',skin:'#947763',vest:'#b8ce5a',glass:'#446678'}))mat[name]=new T.MeshStandardMaterial({color,roughness:name==='glass'?.18:.8,metalness:['blue','yellow','dark'].includes(name)?.3:0,...(['concrete','clc'].includes(name)?{map:texture,bumpMap:texture,bumpScale:.008}:{})});
 await loadMaterials();
 mat.concrete=mat.surface.clone();mat.concrete.color.set('#efede7');mat.concrete.normalScale.set(.22,.22);mat.clc=mat.surface.clone();mat.clc.color.set('#ffffff');const poreCanvas=document.createElement('canvas');poreCanvas.width=poreCanvas.height=1024;const poreContext=poreCanvas.getContext('2d');poreContext.drawImage(mat.surface.map.image,0,0,1024,1024);for(let i=0;i<14000;i++){poreContext.fillStyle=i%3?'#86837b':'#aaa79f';poreContext.beginPath();poreContext.ellipse(random()*1024,random()*1024,.4+random()*1.5,.3+random()*1.1,random()*Math.PI,0,Math.PI*2);poreContext.fill()}const poreMap=new T.CanvasTexture(poreCanvas);poreMap.colorSpace=T.SRGBColorSpace;poreMap.wrapS=poreMap.wrapT=T.RepeatWrapping;mat.clc.map=mat.clc.bumpMap=poreMap;mat.clc.bumpScale=.004;mat.clc.normalMap=null;mat.clc.userData.tileMeters=.5;mat.grass=mat.ground;mat.earth=mat.soil;mat.grass.color.set('#c6cfb9');
 for(const name of ['blue','white','yellow','dark']){mat[name].roughness=.38;mat[name].metalness=name==='white'?.1:.65}
 scene.add(new T.HemisphereLight('#b8cedf','#594230',.9));const sun=new T.DirectionalLight('#ffe1bb',3.1);sun.position.set(-55,32,50);sun.castShadow=true;sun.shadow.mapSize.set(innerWidth>700?4096:2048,innerWidth>700?4096:2048);Object.assign(sun.shadow.camera,{left:-65,right:165,top:65,bottom:-60,near:1,far:240});sun.shadow.bias=-.00015;sun.shadow.normalBias=.045;sun.shadow.radius=3;sun.target.position.set(45,0,0);scene.add(sun,sun.target);
 sky=new T.Mesh(new T.SphereGeometry(360,32,16),new T.ShaderMaterial({side:T.BackSide,uniforms:{top:{value:new T.Color('#556f87')},bottom:{value:new T.Color('#ecc497')}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform vec3 top;uniform vec3 bottom;void main(){float h=clamp(normalize(p).y*.8,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.7)),1.);}'}));sky.visible=false;
 // The terrain leaves a real opening around the drainage corridor.
 box(430,.5,78,70,-.7,-21,mat.grass);box(430,.5,118,70,-.7,85,mat.grass);
 box(145,.5,8,-62.5,-.7,22,mat.grass);box(165,.5,8,212.5,-.7,22,mat.grass);
 box(32,.1,26,0,-.4,0,mat.earth);
 waterMaterial=new T.MeshPhysicalMaterial({color:'#526c71',roughness:.08,metalness:.6});
 const treeAsset=await new GLTFLoader().loadAsync('assets/models/tree.gltf');
 const treePositions=[],treeInstances=innerWidth<700?50:85;
 while(treePositions.length<treeInstances){const x=-65+random()*245,z=-56+random()*142;if(Math.abs(x)<32&&Math.abs(z)<35||x>40&&x<151&&z>-42&&z<40||z>10&&z<48||x>-18&&x<48&&z>30&&z<58)continue;treePositions.push([x,z,1.8+random()*1.5,random()*Math.PI*2])}
 treeAsset.scene.traverse(source=>{if(!source.isMesh)return;const trees=new T.InstancedMesh(source.geometry,source.material,treeInstances),dummy=new T.Object3D();trees.castShadow=true;trees.receiveShadow=true;source.material.roughness=.95;treePositions.forEach(([x,z,scale,angle],i)=>{dummy.position.set(x,-.45,z);dummy.scale.setScalar(scale);dummy.rotation.set(0,angle,0);dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix)});scene.add(trees)});treeCount=treeInstances;
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
 for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++){const tile=box(1.192,.15,1.192,x*1.2-4,27.32,z*1.2+2,mat.clc,building);roofItems.push(tile);if(x===0&&z===0){roofTile=tile;roofHome=tile.position.clone();box(1.188,.09,1.188,0,-.105,0,new T.MeshStandardMaterial({color:'#c6bd99',roughness:1}),tile)}}
 for(const z of [-6.8,6.8])roofItems.push(box(20,.65,.16,0,27.7,z,mat.concrete,building));for(const x of [-9.8,9.8])roofItems.push(box(.16,.65,13.6,x,27.7,0,mat.concrete,building));
 crane=new T.Group();crane.position.set(13,0,-7);scene.add(crane);const height=35;for(let y=0;y<height;y+=2){for(const x of [-.6,.6])for(const z of [-.6,.6])line([x,y,z],[x,y+2,z],.045,mat.yellow,crane);for(const z of [-.6,.6])line([-.6,y,z],[.6,y+2,z],.035,mat.yellow,crane)}line([-20,height,0],[7,height,0],.13,mat.yellow,crane);line([-20,height+1,0],[7,height+1,0],.09,mat.yellow,crane);for(let x=-20;x<7;x+=2)line([x,height,0],[x+2,height+1,0],.035,mat.yellow,crane);
 panel=box(2.5,4,.16,3,30,-7,mat.clc);hoist.push(line([3,35,-7],[3,33,-7],.025,mat.dark));hoist.push(line([3,33,-7],[2.1,32,-7],.025,mat.dark));hoist.push(line([3,33,-7],[3.9,32,-7],.025,mat.dark));box(2.3,1.6,1.6,0,34,0,mat.yellow,crane);box(2.1,1.1,.035,0,34.15,.82,mat.glass,crane);box(.035,1.1,1.45,-1.17,34.15,0,mat.glass,crane);box(3,1.2,2,5,35,0,mat.concrete,crane);box(3,.12,2.5,0,33.1,0,mat.dark,crane);for(let y=0;y<34;y+=.4)line([-.3,y,-.66],[.3,y,-.66],.018,mat.dark,crane);
 hybridParts={};
 const brickGroup=new T.Group();building.add(brickGroup);hybridParts.brick=brickGroup;
 for(let row=0;row<8;row++)for(let col=0;col<10;col++){const x=-8.5+col*.49+(row%2)*.24;box(.482,.312,.18,x,10.6+row*.32,-5.7,mat.brick,brickGroup)}
 hybridParts.clc=new T.Group();building.add(hybridParts.clc);for(let row=0;row<6;row++)for(let col=0;col<5-row/2;col++)box(.832,.342,.25,-8+col*.84,10.6+row*.35,-5.37,mat.clc,hybridParts.clc);
 hybridParts.bond=box(5,.18,.3,-6,11.65,-5.15,mat.concrete,building);
 hybridFace=box(5,2.8,.1,-6,12,-5.15,mat.white,building);hybridParts.plaster=hybridFace;
 hybridParts.column=box(.58,3.4,.58,-9,12,-5.5,mat.concrete,building);hybridParts.beam=box(6,.45,.6,-6,13.5,-5.5,mat.concrete,building);
 highlights=new T.Group();building.add(highlights);const edgeMaterial=new T.LineBasicMaterial({color:'#d4edff',depthTest:true,transparent:false});
 function structuralEdge(w,h,d,x,y,z){const edge=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(w,h,d)),edgeMaterial);edge.position.set(x,y,z);edge.renderOrder=0;highlights.add(edge)}
 for(let f=0;f<3;f++){
  for(const x of [-9,-3,3,9])for(const z of [-6,6])structuralEdge(.58,3.4,.58,x,f*3.4+1.7,z);
  for(const z of [-6,6])structuralEdge(20,.52,.55,0,f*3.4+3.14,z);
  for(const x of [-9,9])structuralEdge(.55,.52,14,x,f*3.4+3.14,0);
 }
 const roadCurve=new T.CatmullRomCurve3([new T.Vector3(-15,0,22),new T.Vector3(20,0,22),new T.Vector3(70,0,22),new T.Vector3(130,0,22)]);
 const roadShape=new T.Shape();roadShape.moveTo(-135,-4);roadShape.lineTo(280,-4);roadShape.lineTo(280,4);roadShape.lineTo(-135,4);roadShape.closePath();for(const x of [25,112]){const hole=new T.Path();hole.absarc(x,0,1.5,0,Math.PI*2,true);roadShape.holes.push(hole)}
 const roadGeometry=new T.ExtrudeGeometry(roadShape,{depth:.45,bevelEnabled:false,curveSegments:32}),roadUV=roadGeometry.attributes.uv;for(let i=0;i<roadUV.count;i++)roadUV.setXY(i,roadUV.getX(i)/2,roadUV.getY(i)/2);const road=new T.Mesh(roadGeometry,mat.floor);road.rotation.x=-Math.PI/2;road.position.set(0,-.45,22);road.receiveShadow=true;scene.add(road);
 const covers=[];for(const x of [25,112]){const cover=new T.Mesh(new T.CircleGeometry(1.48,40),x===25?mat.clc:mat.dark);cover.rotation.x=-Math.PI/2;cover.position.set(x,.008,22);scene.add(cover);covers.push(cover)}
 window.nanoliteCovers=covers;
 for(const z of [17.85,26.15])box(415,.22,.3,72.5,.05,z,mat.concrete);
 const tunnel=new T.Group();tunnel.position.set(70,-3.85,22);scene.add(tunnel);
 const tunnelMaterial=mat.floor.clone();tunnelMaterial.side=T.DoubleSide;tunnelMaterial.color.set('#989d99');
 box(120,.25,6,0,-2.55,0,tunnelMaterial,tunnel);for(const z of [-3,3])box(120,5.7,.25,0,.15,z,tunnelMaterial,tunnel);
 // Shaft openings are real gaps in the concrete ceiling.
 for(const [left,right]of [[-60,-46.5],[-43.5,40.5],[43.5,60]])box(right-left,.25,6,(left+right)/2,3,0,tunnelMaterial,tunnel);
 const walkway=box(120,.16,1.25,0,-2.25,2.25,mat.floor,tunnel);
 for(const x of [-60,60])box(.3,5.5,6,x,.15,0,tunnelMaterial,tunnel);
 for(let x=-57;x<=57;x+=9){const lamp=new T.PointLight('#ffe4b8',8,13,2);lamp.position.set(x,2.7,2.55);tunnel.add(lamp);box(.65,.08,.22,x,2.85,2.55,new T.MeshBasicMaterial({color:'#fff0d0'}),tunnel);for(const z of [-2.84,2.84])line([x,-2.4,z],[x,2.9,z],.025,mat.dark,tunnel)}
 window.nanoliteRoad=road;window.nanoliteTunnel=tunnel;
 reflection=new T.WebGLRenderTarget(innerWidth<700?512:1024,innerWidth<700?512:1024);reflectionCamera=new T.PerspectiveCamera();
 const channelMaterial=new T.MeshPhysicalMaterial({color:'#2b4249',roughness:.13,metalness:.35});
 channelMaterial.onBeforeCompile=shader=>{shader.uniforms.reflectionMap={value:reflection.texture};shader.uniforms.reflectionMatrix={value:reflectionMatrix};shader.uniforms.waveTime={value:0};channelMaterial.userData.shader=shader;
  shader.vertexShader='uniform mat4 reflectionMatrix;uniform float waveTime;varying vec4 reflectedPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z+=sin(position.x*.65-waveTime*1.8)*.025+sin(position.y*1.4+waveTime)*.015;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nreflectedPosition=reflectionMatrix*modelMatrix*vec4(transformed,1.);');
  shader.fragmentShader='uniform sampler2D reflectionMap;uniform float waveTime;varying vec4 reflectedPosition;\n'+shader.fragmentShader.replace('#include <opaque_fragment>','vec2 reflectionUV=reflectedPosition.xy/reflectedPosition.w*.5+.5;reflectionUV+=vec2(sin(vViewPosition.x*2.+waveTime),cos(vViewPosition.z*2.-waveTime))*.004;vec3 reflected=texture2D(reflectionMap,clamp(reflectionUV,0.,1.)).rgb;outgoingLight=mix(outgoingLight,reflected,.6);\n#include <opaque_fragment>');
 };
 channel=new T.Mesh(new T.PlaneGeometry(120,3.4,160,24),channelMaterial);channel.rotation.x=-Math.PI/2;channel.position.y=-2.4;tunnel.add(channel);
 // shortcut: the water surface is a procedural illustration; replace with simulated flow for film-quality output.
 for(const x of [25,112]){const shaft=new T.Mesh(new T.CylinderGeometry(1.5,1.5,.9,48,1,true),tunnelMaterial);shaft.position.set(x,-.42,22);scene.add(shaft);const rim=new T.Mesh(new T.TorusGeometry(1.5,.08,8,40),mat.dark);rim.rotation.x=Math.PI/2;rim.position.set(x,.04,22);scene.add(rim)}
 const rusty=mat.rock.clone();rusty.color.set('#8b553b');for(let y=-5;y<3;y+=.38)line([111.1,y,21],[111.7,y,21],.028,rusty);for(const x of [111.1,111.7])line([x,-5,21],[x,3,21],.03,rusty);
 const exitLight=new T.PointLight('#ffe0a8',65,18,2);exitLight.position.set(112,-.5,22);scene.add(exitLight);
 factory=new T.Group();factory.position.set(90,0,-10);scene.add(factory);box(80,.25,48,0,-.1,0,mat.floor,factory);
 const installed=(x,z,count)=>{const g=new T.Group();g.position.set(x,0,z);factory.add(g);for(let i=0;i<count;i++){cylinder(1.5,8.4,-8+i*4,6,0,mat.white,g);cylinder(1.52,.6,-8+i*4,10.3,0,mat.blue,g);const hopper=new T.Mesh(new T.ConeGeometry(1.5,1.8,32),mat.blue);hopper.rotation.z=Math.PI;hopper.position.set(-8+i*4,1.1,0);g.add(hopper);const brand=new T.Mesh(new T.PlaneGeometry(1.6,1.6),label('NANOLITE'));brand.position.set(-8+i*4,6.5,1.52);g.add(brand);const guard=new T.Mesh(new T.TorusGeometry(1.48,.035,8,40),mat.blue);guard.rotation.x=Math.PI/2;guard.position.set(-8+i*4,11.15,0);g.add(guard);for(let n=0;n<8;n++){const a=n*Math.PI/4;line([-8+i*4+Math.cos(a)*1.48,10.6,Math.sin(a)*1.48],[-8+i*4+Math.cos(a)*1.48,11.15,Math.sin(a)*1.48],.025,mat.blue,g)}for(const xx of [-1,1])for(const zz of [-1,1])line([-8+i*4+xx,0,zz],[-8+i*4+xx,2,zz],.06,mat.dark,g)}for(const x of [-2,2])for(const z of [-2,2])line([x,0,z],[x,12,z],.1,mat.blue,g);for(let i=0;i<3;i++){const y=3+i*3,tank=cylinder(1.15,4.5,0,y,0,mat.white,g);tank.rotation.z=Math.PI/2;for(const x of [-2.35,2.35]){const cap=cylinder(1.18,.18,x,y,0,mat.blue,g);cap.rotation.z=Math.PI/2}const motor=cylinder(.35,.6,2.8,y,0,mat.blue,g);motor.rotation.z=Math.PI/2;const face=new T.Mesh(new T.PlaneGeometry(1.9,.9),label('NANOLITE|MIXING SYSTEM'));face.position.set(0,y,1.16);g.add(face)}box(5,2.5,3,7,1.25,0,mat.white,g);box(2,1.2,.06,7,1.8,1.53,mat.glass,g);const conveyor=box(12,.4,1.5,-6,3,6,mat.dark,g);conveyor.rotation.z=.4;return g};installed(-15,-10,2);installed(17,-9,4);
 for(let row=0;row<6;row++)for(let col=0;col<8;col++)box(2.4,.6,1.2,12+col*3,.3,4+row*2.3,mat.clc,factory);
 for(const z of [5,14]){box(22,.25,6,-22,4.2,z,mat.blue,factory);for(const x of [-32,-12])for(const zz of [z-2.5,z+2.5])line([x,0,zz],[x,4,zz],.08,mat.dark,factory)}
 for(const z of [5,14]){for(let n=0;n<75;n++)box(.06,.07,6,-33+n*.3,4.37,z,mat.blue,factory);for(const x of [-32,-22,-12]){line([x,3.65,z-2.7],[x,4.1,z],.035,mat.dark,factory);line([x,4.1,z],[x,3.65,z+2.7],.035,mat.dark,factory)}}
 function packaging(kind){const map=mat.packaging.clone();map.needsUpdate=true;map.repeat.set(.5,1);map.offset.set(kind==='bag'?0:.5,0);return new T.MeshStandardMaterial({map,roughness:kind==='bag'?.92:.48,metalness:0})}
 mat.timber=new T.MeshStandardMaterial({color:'#967047',roughness:.95});
 function pallet(w,d,x,z,parent){for(const xx of [-w*.36,0,w*.36])box(.16,.13,d,xx+x,.12,z,mat.timber,parent);for(let i=0;i<7;i++)box(w,.07,d/7-.025,x,.22,z-d/2+(i+.5)*d/7,mat.timber,parent)}
 const sackMaterial=mat.surface.clone();sackMaterial.color.set('#f4f1e9');sackMaterial.normalScale.set(.08,.08);sackMaterial.userData.tileMeters=.4;
 for(let i=0;i<8;i++){
  const geometry=new T.BoxGeometry(.75,1.2,.35,8,12,4),pos=geometry.attributes.position;
  for(let n=0;n<pos.count;n++){const y=pos.getY(n),bulge=.84+.14*Math.cos(y/1.2*Math.PI);pos.setX(n,pos.getX(n)*bulge);pos.setZ(n,pos.getZ(n)*bulge+.012*Math.sin(y*36+pos.getX(n)*12))}geometry.computeVertexNormals();
  const bag=new T.Mesh(geometry,sackMaterial);bag.position.set(i===0?-27:-29+(i%4)*.84,.88,i===0?5:3.2+Math.floor(i/4)*.55);bag.castShadow=bag.receiveShadow=true;factory.add(bag);
  const front=geometry.clone();const frontIndex=[];for(let k=0;k<front.index.count;k+=3){const ids=[front.index.getX(k),front.index.getX(k+1),front.index.getX(k+2)];if(ids.every(j=>front.attributes.normal.getZ(j)>.5))frontIndex.push(...ids)}front.setIndex(frontIndex);const face=new T.Mesh(front,packaging('bag'));face.position.z=.003;bag.add(face);for(const y of [-.58,.58])line([-.32,y,0],[.32,y,0],.015,mat.earth,bag);
 }pallet(3.7,1.5,-26.7,4.3,factory);
 pallet(3.8,2.5,-26.9,13.5,factory);
 for(let i=0;i<6;i++){
  const x=-28+(i%3)*1.05,z=13+Math.floor(i/3)*1.05,drum=cylinder(.45,1.4,x,.93,z,mat.white,factory);
  for(const y of [.28,.59,1.28,1.59])cylinder(.466,.045,x,y,z,mat.white,factory);
  cylinder(.44,.02,x,1.64,z,mat.white,factory);cylinder(.06,.025,x+.22,1.66,z,mat.dark,factory);
  const face=new T.Mesh(new T.CylinderGeometry(.454,.454,1.2,48,1,true,-Math.PI/3,Math.PI*2/3),packaging('drum'));drum.add(face);cylinder(.12,.045,x,1.68,z,mat.white,factory);
 }
 // Portable equipment remains in adjacent service bays throughout the tour.
 for(let i=0;i<3;i++){
  const g=new T.Group();g.position.set(-28+i*9,0,-4);factory.add(g);
  const paint=i===0?mat.dark:mat.white,trim=i===0?mat.yellow:mat.blue,length=i===2?4.5:3.3;
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
  box(5.4,.12,4.5,0,11,0,mat.dark,plant);
  for(let level=0;level<3;level++){
   const y=2+level*3;box(5.4,.12,4.5,0,y,0,mat.dark,plant);
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
 for(const x of [-35,-5,25]){const lamp=new T.PointLight('#ffd29a',24,18,2);lamp.position.set(x,4.6,5);factory.add(lamp);box(.5,.07,.25,x,4.4,5,new T.MeshBasicMaterial({color:'#ffdfad'}),factory)}
 for(const x of [-15,17])for(let n=0;n<3;n++)line([x,1,-10+n*.6],[x+9,1,-10+n*.6],.055,mat.blue,factory);

 truck=new T.Group();scene.add(truck);const vehicle=await new GLTFLoader().loadAsync('assets/models/truck.glb'),cab=vehicle.scene;
 cab.traverse(m=>{if(!m.isMesh)return;if(/trailer|door lock|amber side marker|fifth wheel|landing|rear door|rear lamp|rear underrun/i.test(m.name.replaceAll('_',' ')))m.visible=false;m.castShadow=m.receiveShadow=true;if(/cab|tractor body/i.test(m.name)&&!(/window/i.test(m.name)))m.material=mat.white;});cab.rotation.y=Math.PI/2;cab.position.x=-2.8;truck.add(cab);
 box(6.8,.25,2.45,-1,1.1,0,mat.dark,truck);for(const z of [-1.2,1.2])box(6.8,.06,.045,-1,1.27,z,mat.white,truck);
 for(let x=-3.1;x<1.6;x+=1.5){box(1.4,.12,2.15,x,1.3,0,mat.earth,truck);for(let y=0;y<3;y++)box(1.38,.38,2.05,x,1.55+y*.385,0,mat.clc,truck);for(const z of [-1.035,1.035])box(.035,1.2,.025,x,1.95,z,mat.dark,truck)}
 const rainPositions=new Float32Array(1800);for(let i=0;i<rainPositions.length;i+=3){rainPositions[i]=-20+random()*170;rainPositions[i+1]=random()*30;rainPositions[i+2]=5+random()*30}const rg=new T.BufferGeometry();rg.setAttribute('position',new T.BufferAttribute(rainPositions,3));rain=new T.Points(rg,new T.PointsMaterial({color:'#e1f0f0',size:.045,transparent:true,opacity:.5}));scene.add(rain);
 function batch(parent,exclude=new Set()){parent.updateWorldMatrix(true,true);const inverse=parent.matrixWorld.clone().invert(),buckets=new Map();parent.traverse(mesh=>{if(!mesh.isMesh||mesh.isInstancedMesh||exclude.has(mesh)||!mesh.visible||Array.isArray(mesh.material))return;const geometry=mesh.geometry.clone().applyMatrix4(inverse.clone().multiply(mesh.matrixWorld));const key=mesh.material.id;if(!buckets.has(key))buckets.set(key,{material:mesh.material,geometries:[],meshes:[]});buckets.get(key).geometries.push(geometry);buckets.get(key).meshes.push(mesh)});for(const {material,geometries,meshes}of buckets.values()){if(geometries.length<2)continue;const merged=mergeGeometries(geometries.map(g=>g.toNonIndexed()),false);if(!merged)continue;const mesh=new T.Mesh(merged,material);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);meshes.forEach(m=>{for(const child of [...m.children])parent.attach(child);m.removeFromParent()});geometries.forEach(g=>g.dispose())}}
 for(const floor of floors){const excluded=new Set([wallBlock]);floor.userData.final.forEach(frame=>frame.traverse(m=>excluded.add(m)));batch(floor,excluded);floor.userData.final.forEach(frame=>batch(frame))}batch(factory);batch(crane);batch(truck);
 resize();addEventListener('resize',resize,{passive:true});sceneReadyTime=performance.now();document.body.classList.add('webgl-ready');setMode(reduced.matches);addEventListener('pagehide',()=>{cancelAnimationFrame(frame);reflection.dispose();renderer.dispose()},{once:true});reduced.addEventListener('change',()=>setMode(reduced.matches));
}

// Fixed world-space camera stops; images are references, never camera frames.
const stops=[
 [27,12,38,0,2,0],[23,15,28,0,5,0],[-4.7,5.6,12,-5.3,4.5,6.3],[-2.9,5.4,10.6,-5.575,4.8,6.3],[27,16,34,0,5,0],[26,15,33,0,5,0],[18,31,20,0,25,0],[17,36,17,0,28,0],[7,31.5,2,3,30,-7],[-1,31,9,-4,27.4,2],[-1.5,29.5,7,-4,27.5,2],[39,32,46,0,14,0],[-6,12.2,1,-6,12,-5.2],[-6,12.2,.5,-6,12,-5.2],[35,29,40,0,14,0],[25,12,28,0,8,0],[22,2.2,22,40,.1,22],[25,1.8,22,45,.1,22],[28,-3.8,22,45,-4,22],[112,23,38,90,3,-10],[64,1.55,-1.5,63,.9,-5],[63.4,1.55,7.7,63,.8,3.6],[67,2.8,-7,62,1.7,-14],[76,2.8,-7,71,1.7,-14],[86,3,-6,80,1.8,-14],[97,16,2,75,5,-18],[123,16,-41,107,5,-19],[136,38,40,90,4,-10],[109,7,34,90,1.8,15],[75,8,42,57,1.5,22],[22,10,42,5,3,22],[38,27,43,0,13,0]
];
const deliveryRoute=new T.CurvePath();deliveryRoute.add(new T.CubicBezierCurve3(new T.Vector3(90,0,15),new T.Vector3(90,0,19),new T.Vector3(87,0,22),new T.Vector3(83,0,22)));deliveryRoute.add(new T.LineCurve3(new T.Vector3(83,0,22),new T.Vector3(2,0,22)));
const cameraKeys=stops.map((p,i)=>({time:i,p}));
for(const [time,p]of [[25.45,[63,16,-36,75,5,-20]],[25.8,[86,16,-39,75,5,-20]],[11.35,[-6,16,18,-6,12,-5.2]],[11.68,[-6,12.2,8,-6,12,-5.2]],[13.45,[-6,12.2,9,-6,12,-5.2]],[17.55,[25,1.8,22,40,-2,22]],[18.6,[106,-3.8,22,112,-3.8,22]],[18.78,[112,-3.8,22,112,2,21.8]],[18.9,[112,5,22,112,8,21.8]]])cameraKeys.push({time,p});cameraKeys.sort((a,b)=>a.time-b.time);
function sampleCamera(value){const i=Math.max(0,cameraKeys.findLastIndex(k=>k.time<=value)),a=cameraKeys[i],b=cameraKeys[Math.min(i+1,cameraKeys.length-1)];let t=b.time===a.time?0:clamp((value-a.time)/(b.time-a.time));t=t*t*(3-2*t);return a.p.map((x,n)=>lerp(x,b.p[n],t))}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
function tick(now){
 if(staticMode||document.hidden){if(!staticMode)frame=requestAnimationFrame(tick);return}
 const sectionIndex=Math.max(0,sections.findLastIndex(s=>scrollY>=s.offsetTop)),raw=clamp(sectionIndex+(scrollY-sections[sectionIndex].offsetTop)/sections[sectionIndex].offsetHeight,0,31),dt=last?Math.min(now-last,100):16;progress=last?lerp(progress,raw,1-Math.exp(-dt/180)):raw;last=now;
 const pose=sampleCamera(progress);camera.position.fromArray(pose);target.fromArray(pose,3);camera.lookAt(target);
 window.nanoliteCovers[0].visible=progress<17.55;window.nanoliteCovers[1].visible=progress<18.7;
 const active=Math.floor(raw),inJourney=scrollY<sections.at(-1).offsetTop+sections.at(-1).offsetHeight;
 sections.forEach((section,i)=>{const on=i===active&&inJourney;section.classList.toggle('active',on);section.classList.toggle('transitioning',on&&Math.abs(progress-raw)>.12);section.querySelector('.scene-copy').inert=!on});
 // A small framing offset keeps the subject clear of the compact product card.
 camera.setViewOffset(innerWidth,innerHeight,innerWidth>700&&sections[active].classList.contains('product')?innerWidth*.075:0,innerWidth<700?-innerHeight*.09:0,innerWidth,innerHeight);
 const construction=progress<1?lerp(0,3,progress):progress<6?3:progress<11?lerp(3,8,clamp(progress-6)):8;
 for(const child of building.children){if(!floors.includes(child)&&child!==highlights&&child.position.y>3)child.visible=child.position.y<=construction*3.4+.1}
 floors.forEach((floor,i)=>{floor.visible=i<Math.ceil(construction);floor.scale.y=1;floor.userData.final.forEach(m=>{const finish=clamp((progress-30.1-i*.055)/.48);m.visible=finish>0;m.scale.y=1})});
 const blockLift=progress<2?0:progress<3?clamp(progress-2):progress<4?clamp(4-progress):0;wallBlock.position.copy(wallHome);wallBlock.position.y+=blockLift*.7;wallBlock.position.z+=blockLift*.65;wallBlock.rotation.y=blockLift*.15;
 roofItems.forEach(m=>m.visible=construction>=8);roofTile.position.copy(roofHome);const tileLift=progress>=9&&progress<=11?Math.sin((progress-9)*Math.PI/2):0;roofTile.position.y+=tileLift*.85;
 panel.visible=progress>=7&&progress<9.6;panel.position.y=30+.65*Math.sin(clamp(progress-7,0,2.6)*Math.PI/2.6);hoist.forEach((m,i)=>{m.visible=panel.visible;const points=i===0?[[3,35,-7],[3,panel.position.y+3,-7]]:i===1?[[3,panel.position.y+3,-7],[2.1,panel.position.y+2,-7]]:[[3,panel.position.y+3,-7],[3.9,panel.position.y+2,-7]];const a=new T.Vector3(...points[0]),b=new T.Vector3(...points[1]);m.position.copy(a.clone().add(b).multiplyScalar(.5));m.scale.y=a.distanceTo(b)/m.geometry.parameters.height;m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize())});crane.visible=progress<30.7;
 hybridFace.visible=progress>11.5&&progress<14.3&&!(progress>12.7&&progress<13.8);for(const [key,m]of Object.entries(hybridParts)){if(key!=='plaster')m.visible=progress>11.5&&progress<14.3;m.traverse(child=>{if(child.isMesh){if(!child.userData.componentMaterial){child.material=child.material.clone();child.userData.componentMaterial=true}child.material.emissive.set(key===window.nanoliteWallComponent&&active===13?'#315f65':'#000000')}})};highlights.visible=active===5;
 rain.material.opacity=clamp((progress-17)/.55)*.5;rain.visible=progress>17&&progress<18;const time=now/1000;if(waterMaterial.userData.shader)waterMaterial.userData.shader.uniforms.waveTime.value=time;if(rain.visible){const data=rain.geometry.attributes.position;for(let i=1;i<data.array.length;i+=3)data.array[i]=(data.array[i]-dt*.012+30)%30;data.needsUpdate=true}
 const delivery=clamp((progress-28)/2.3),truckPoint=deliveryRoute.getPointAt(delivery),direction=deliveryRoute.getTangentAt(delivery);truck.position.copy(truckPoint);truck.rotation.y=Math.atan2(-direction.z,direction.x);truckWheels.forEach(wheel=>wheel.rotation.z=-delivery*90);truck.visible=true;
 const underground=progress>17.8&&progress<18.95;scene.background=underground?new T.Color('#111a1e'):scene.environment.userData.background;scene.fog.color.set(underground?'#1b262a':'#788b81');scene.fog.near=underground?25:140;scene.fog.far=underground?100:420;
 if(underground){
  const waterY=-6.25;reflectionCamera.copy(camera);reflectionCamera.position.y=waterY*2-camera.position.y;const reflectedTarget=target.clone();reflectedTarget.y=waterY*2-target.y;reflectionCamera.up.set(0,-1,0);reflectionCamera.lookAt(reflectedTarget);reflectionCamera.updateMatrixWorld();reflectionMatrix.multiplyMatrices(reflectionCamera.projectionMatrix,reflectionCamera.matrixWorldInverse);
  channel.visible=false;renderer.setRenderTarget(reflection);renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,1,0),-waterY)];renderer.render(scene,reflectionCamera);renderer.clippingPlanes=[];renderer.setRenderTarget(null);channel.visible=true;
  if(channel.material.userData.shader)channel.material.userData.shader.uniforms.waveTime.value=time;
 }
 renderer.render(scene,camera);window.nanoliteWorld={scene:active+1,progress,cameraAt:sampleCamera,buildingFloors:floors.filter(f=>f.visible).length,worldIdentity:'nanolite-fixed-world',referenceFrames:false,truckHeading:truck.rotation.y,truckPosition:truck.position.toArray(),cameraPosition:camera.position.toArray(),treeCount,humanCount:0,blockPosition:wallBlock.position.toArray(),blockHome:wallHome.toArray(),tilePosition:roofTile.position.toArray(),tileHome:roofHome.toArray(),panelVisible:panel.visible,panelBottom:panel.position.y-2,tunnelLength:120,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};frame=requestAnimationFrame(tick);
}
if(reduced.matches){setMode(true)}else{init().catch(error=>{setMode(true);console.warn('3D scene unavailable; static journey remains accessible.',error.message)})}
