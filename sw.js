const V='collectie-v3',SHELL=['./','index.html','xlsx.js','manifest.webmanifest','icon-192.png','icon-512.png'];
const STATIC=/\.(png|woff2?)$|xlsx\.js$|fonts\.g/;
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const put=res=>{if(res.ok||res.type==='opaque')caches.open(V).then(c=>c.put(r,res.clone()));return res};
  e.respondWith(STATIC.test(r.url)
    ? caches.match(r).then(hit=>hit||fetch(r).then(put))
    : fetch(r).then(put).catch(()=>caches.match(r,{ignoreSearch:true}).then(hit=>hit||caches.match('index.html'))));
});
