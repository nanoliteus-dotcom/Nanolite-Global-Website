import {mkdir,copyFile,cp,readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url)),dist=path.join(root,'dist');
const files=['index.html','products.html','product.html','request.html','contact.html','site.css','site.js','cinema.js','film-manifest.json','product.js','request.js','products.json','scene-manifest.json','_headers'];
const scenes=JSON.parse(await readFile(path.join(root,'scene-manifest.json'),'utf8'));
if(scenes.length!==32)throw Error('The website requires all 32 scene assets.');
for(const scene of scenes){const asset=path.resolve(root,scene.image);if(!asset.startsWith(root)||!(await stat(asset)).isFile())throw Error('Scene asset missing: '+scene.image)}
const film=JSON.parse(await readFile(path.join(root,'film-manifest.json'),'utf8'));
if(film.parts.length!==4||film.parts.reduce((n,p)=>n+p.sceneCount,0)!==32)throw Error('Film must cover all 32 scenes');
for(const part of film.parts)for(const variant of ['desktop','mobile']){const info=await stat(path.join(root,part[variant]));if(info.size<=10000||info.size>=25000000)throw Error('Invalid film asset size');}
if((await stat(path.join(root,'assets/nanolite-catalogue.pdf'))).size>=25000000)throw Error('Catalogue exceeds the hosting asset limit');
await mkdir(dist,{recursive:true});
for(const file of files)await copyFile(path.join(root,file),path.join(dist,file));
await cp(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true,filter:source=>!['materials','models'].includes(path.basename(source))});
console.log('Built five pages and all 32 scene assets to dist.');
