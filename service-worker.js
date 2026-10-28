const CACHE='diag-v8',DYN='diag-dyn-v8';
const CORE=['./','./index.html','./manifest.json','./css/styles.css','./js/app.js','./js/database.js','./js/recalls-db.js','./js/vehicle-expert.js','./js/gemini-search.js','./images/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.allSettled(CORE.map(u=>c.add(u).catch(()=>null)));self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==DYN).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
if(u.hostname.includes('generativelanguage.googleapis.com')){e.respondWith(net(e.request));return;}
if(e.request.destination==='image'){e.respondWith(img(e.request));return;}
e.respondWith(nav(e.request));});
async function img(r){const h=await caches.match(r);if(h)return h;try{const s=await fetch(r);if(s.ok||s.type==='opaque'){const c=await caches.open(DYN);c.put(r,s.clone());}return s;}catch{return new Response('',{status:503});}}
async function net(r){try{const s=await fetch(r);if(s.ok){const c=await caches.open(DYN);c.put(r,s.clone());}return s;}catch{return(await caches.match(r))||new Response('{}',{status:503});}}
async function nav(r){try{const s=await fetch(r);if(s.ok){const c=await caches.open(DYN);c.put(r,s.clone());}return s;}catch{const h=await caches.match(r);if(h)return h;if(r.mode==='navigate')return(await caches.match('./index.html'))||Response.error();return new Response('',{status:503});}}
