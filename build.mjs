import {mkdir,copyFile,cp,readFile,stat,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url)),dist=path.join(root,'dist');
const files=['index.html','products.html','product.html','request.html','contact.html','about.html','documents.html','app.html','experts.html','experts.js','studies.html','studies.js','studies.json','site.css','site.js','world.js','product.js','request.js','products.json','scene-manifest.json','_headers'];
const scenes=JSON.parse(await readFile(path.join(root,'scene-manifest.json'),'utf8'));
if(scenes.length!==32)throw Error('The website requires all 32 scene assets.');
for(const scene of scenes){const asset=path.resolve(root,scene.image);if(!asset.startsWith(root)||!(await stat(asset)).isFile())throw Error('Scene asset missing: '+scene.image)}
if((await stat(path.join(root,'assets/nanolite-catalogue.pdf'))).size>=25000000)throw Error('Catalogue exceeds the hosting asset limit');
if(path.dirname(dist)!==path.resolve(root))throw Error('Invalid build directory');
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
for(const file of files)await copyFile(path.join(root,file),path.join(dist,file));
await cp(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true,filter:source=>path.basename(source)!=='film'});
await cp(path.join(root,'vendor'),path.join(dist,'vendor'),{recursive:true});
console.log('Built ten pages and all 32 scene assets to dist.');
