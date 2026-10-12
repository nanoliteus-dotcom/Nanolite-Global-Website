import {mkdir,copyFile,readFile,readdir,stat,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url)),dist=path.join(root,'dist');
const pages=(await readdir(root)).filter(file=>file.endsWith('.html'));
const files=[...pages,'site.css','site.js','product.js','request.js','experts.js','careers.js','media.js','investors.js','studies.js','studies.json','products.json','career-roles.json','_headers'];
const assets=new Set(['assets/logo.png','assets/manrope-OFL.txt']);
for(const file of pages){const html=await readFile(path.join(root,file),'utf8');if(/world\.js|<canvas(?! id="market-chart")|class="scene\b/.test(html))throw Error('Animation remains in '+file);for(const match of html.matchAll(/(?:src|href|data|poster)="(assets\/[^"?#]+)(?:[?#][^"]*)?"/g))assets.add(match[1]);}
const css=await readFile(path.join(root,'site.css'),'utf8');for(const match of css.matchAll(/url\(['"]?(assets\/[^)'"?#]+)/g))assets.add(match[1]);
for(const study of JSON.parse(await readFile(path.join(root,'studies.json'),'utf8')))if(study.image?.startsWith('assets/'))assets.add(study.image);
if(path.dirname(dist)!==path.resolve(root))throw Error('Invalid build directory');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const file of files)await copyFile(path.join(root,file),path.join(dist,file));
for(const asset of assets){const source=path.resolve(root,asset);if(!source.startsWith(root)||!(await stat(source)).isFile())throw Error('Missing asset: '+asset);await mkdir(path.dirname(path.join(dist,asset)),{recursive:true});await copyFile(source,path.join(dist,asset));}
console.log(`Built ${pages.length} static pages and ${assets.size} referenced assets. Only referenced media shipped; no 3D runtime.`);
