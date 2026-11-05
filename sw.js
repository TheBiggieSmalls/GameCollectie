const V='collectie-v5',IMG='covers-v1',MAXIMG=900;
const SHELL=['./','index.html','xlsx.js','manifest.webmanifest','icon-192.png','icon-512.png'];
const STATIC=/\.(png|woff2?)$|xlsx\.js$|fonts\.g/;
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==IMG).map(x=>caches.delete(x)))).then(()=>clients.claim())));
async function trim(c){const k=await c.keys();if(k.length>MAXIMG)await Promise.all(k.slice(0,k.length-MAXIMG).map(x=>c.delete(x)))}
/* hoezen: eerst uit de cache; anders ophalen (CORS, anders opaque) en bewaren */
async function cover(r){
  const c=await caches.open(IMG),hit=await c.match(r.url);if(hit)return hit;
  try{const res=await fetch(r.url,{mode:'cors',credentials:'omit',referrerPolicy:'no-referrer'});if(res.ok){c.put(r.url,res.clone());trim(c);return res}}catch{}
  try{const res=await fetch(r.url,{mode:'no-cors',referrerPolicy:'no-referrer'});c.put(r.url,res.clone());trim(c);return res}catch{return Response.error()}}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname==='images.launchbox-app.com'){e.respondWith(cover(r));return}
  if((u.origin!==location.origin&&!/fonts\.g/.test(r.url))||u.pathname.includes('/db/'))return;
  const put=res=>{if(res.ok||res.type==='opaque')caches.open(V).then(c=>c.put(r,res.clone()));return res};
  e.respondWith(STATIC.test(r.url)
    ? caches.match(r).then(hit=>hit||fetch(r).then(put))
    : fetch(r,{cache:'no-cache'}).then(put).catch(()=>caches.match(r,{ignoreSearch:true}).then(hit=>hit||caches.match('index.html'))));
});
