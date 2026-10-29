const CACHE='diag-v20',DYN='diag-dyn-v20';
const CORE=['./','./index.html','./manifest.json','./css/styles.css','./js/data-v9.js','./js/shorts-db.js','./js/leaks-batt-db.js','./js/overheat-mech-db.js','./js/eu-failures-db.js','./js/vehicles-2025-db.js','./js/elroq-db.js','./js/models-mega-db.js','./js/predict-engine.js','./js/access-control.js','./js/search-engine.js','./js/live-search.js','./js/multi-search.js','./js/auto-update.js','./js/ui-v10.js','./js/ui-v11.js','./js/ui-v12.js','./js/ui-v13.js','./js/ui-v16.js','./js/ui-v17.js','./js/ui-v18.js','./js/ui-v19.js','./js/ui-v20.js','./js/app-v9.js','./js/gemini-search.js','./images/icon.svg','./data/recalls-feed.json'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.allSettled(CORE.map(u=>c.add(u).catch(()=>null)));self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==DYN).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('periodicsync',e=>{if(e.tag==='monthly-recalls'){e.waitUntil((async()=>{try{
 const res=await fetch('data/recalls-feed.json?v='+Date.now(),{cache:'no-store'});if(!res.ok)return;
 const feed=await res.json();const c=await caches.open(DYN);c.put('data/recalls-feed.json',new Response(JSON.stringify(feed)));
 const cls=await self.clients.matchAll({type:'window'});cls.forEach(cl=>cl.postMessage({type:'feed-updated',version:feed.version}));
 await self.registration.showNotification('diag-incendie-by-kevin',{body:'🔄 Feed v'+feed.version+' — en attente validation admin',icon:'images/icon-192x192.png'});}catch(err){console.warn(err);}})());}});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
if(u.hostname.includes('generativelanguage.googleapis.com')||u.hostname.includes('ntfy.sh')||u.hostname.includes('api.nhtsa.gov')||u.hostname.includes('data.gouv.fr')){e.respondWith(net(e.request));return;}
if(e.request.destination==='image'){e.respondWith(img(e.request));return;}
e.respondWith(nav(e.request));});
async function img(r){const h=await caches.match(r);if(h)return h;try{const s=await fetch(r);if(s.ok||s.type==='opaque'){const c=await caches.open(DYN);c.put(r,s.clone());}return s;}catch{return new Response('',{status:503});}}
async function net(r){try{const s=await fetch(r);if(s.ok){const c=await caches.open(DYN);c.put(r,s.clone());}return s;}catch{return(await caches.match(r))||new Response('{}',{status:503});}}
async function nav(r){try{const s=await fetch(r);if(s.ok){const c=await caches.open(DYN);c.put(r,s.clone());}return s;}catch{const h=await caches.match(r);if(h)return h;if(r.mode==='navigate')return(await caches.match('./index.html'))||Response.error();return new Response('',{status:503});}}
