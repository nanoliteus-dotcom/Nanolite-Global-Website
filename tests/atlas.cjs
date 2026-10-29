const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.mp3':'audio/mpeg','.wasm':'application/wasm','.gltf':'model/gltf+json','.bin':'application/octet-stream'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end()}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)&&url.pathname.startsWith('/Atlas/'))file=path.join(root,'Atlas/index.html');
 if(!fs.existsSync(file)){res.writeHead(404);return res.end()}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=process.env.ATLAS_TEST_ORIGIN||'http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'});
 const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)failed.push(r.status()+' '+r.url())});
 try {
  await page.goto(origin+'/');assert.match(await page.title(),/Nanolite/i);
  await page.goto(origin+'/Atlas');await page.locator('.site-header').waitFor();assert.match(await page.title(),/Atlas/);assert(await page.locator('body').evaluate(e=>e.classList.contains('home-route')));
  const routes=await page.locator('a[href^="/Atlas"]').evaluateAll(links=>[...new Set(links.map(a=>new URL(a.href).pathname))]);
  assert(routes.length>20,'Full Atlas navigation must remain available');
  await page.waitForTimeout(2500);
  for(const route of routes){await page.goto(origin+route);await page.locator('.site-header').waitFor();assert(!/Page Not Found/.test(await page.title()),route);assert.equal(await page.locator('a[href^="/"]:not([href^="/Atlas/"])').count(),0,'Link escaped Atlas: '+route)}
  await page.goto(origin+'/Atlas/enterprise/automations');assert.equal(await page.locator('h1').textContent(),'From content to published posts.');
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:900});await page.goto(origin+'/Atlas/product');await page.locator('h1').waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow '+width)}
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS Atlas home, '+routes.length+' routes, navigation isolation, assets, desktop/mobile layout, and Global homepage');
 } finally {await browser.close();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
