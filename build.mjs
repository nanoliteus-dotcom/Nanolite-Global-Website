import {mkdir,copyFile,cp,readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url)),dist=path.join(root,'dist');
const files=['index.html','products.html','product.html','request.html','contact.html','site.css','site.js','world.js','product.js','request.js','products.json','scene-manifest.json','_headers'];
const scenes=JSON.parse(await readFile(path.join(root,'scene-manifest.json'),'utf8'));
if(scenes.length!==32)throw Error('The website requires all 32 scene assets.');
for(const scene of scenes){const asset=path.resolve(root,scene.image);if(!asset.startsWith(root)||!(await stat(asset)).isFile())throw Error('Scene asset missing: '+scene.image)}
await mkdir(dist,{recursive:true});
for(const file of files)await copyFile(path.join(root,file),path.join(dist,file));
for(const folder of ['assets','vendor'])await cp(path.join(root,folder),path.join(dist,folder),{recursive:true});
console.log('Built five pages and all 32 scene assets to dist.');
