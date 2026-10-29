const CACHE='diag-v22',DYN='diag-dyn-v22',MONTH=30*24*3600*1000;
const CORE=['./','./index.html','./manifest.json','./css/styles.css','./js/data-v9.js','./js/shorts-db.js','./js/leaks-batt-db.js','./js/overheat-mech-db.js','./js/eu-failures-db.js','./js/vehicles-2025-db.js','./js/elroq-db.js','./js/models-mega-db.js','./js/predict-engine.js','./js/access-control.js','./js/search-engine.js','./js/live-search.js','./js/multi-search.js','./js/auto-update.js','./js/ui-v10.js','./js/ui-v11.js','./js/ui-v12.js','./js/ui-v13.js','./js/ui-v16.js','./js/ui-v17.js','./js/ui-v18.js','./js/ui-v19.js','./js/ui-v20.js','./js/ui-v21.js','./js/ui-v22.js','./js/app-v9.js','./js/gemini-search.js','./images/icon.svg','./data/recalls-feed.json'];
const NTFY_HOSTS=['ntfy.sh','ntfy.ffmuc.net','ntfy.dcs0.hu'];
const TOP_DEC='diag-incendie-kevin-dec-83600',TOP_REQ='diag-incendie-kevin-req-83600';
let sseCtrl=null;
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.allSettled(CORE.map(u=>c.add(u).catch(()=>null)));self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==DYN).map(k=>caches.delete(k)))).then(()=>{self.startNtfyStream();return self.clients.claim();}));});
/* NTFY-PASSTHROUGH : les requêtes ntfy ne sont JAMAIS interceptées (réseau natif) */
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
 if(NTFY_HOSTS.some(h=>u.hostname===h||u.hostname.endsWith('.'+h)))return;
 if(u.hostname.includes('generativelanguage.googleapis.com')||u.hostname.includes('api.nhtsa.gov')||u.hostname.includes('data.gouv.fr')||u.hostname.includes('ec.europa.eu')){e.respondWith(net(e.request));return;}
 if(e.request.destination==='image'){e.respondWith(img(e.request));return;}
 e.respondWith(nav(e.request));});
self.startNtfyStream=function(){try{if(sseCtrl)sseCtrl.abort();sseCtrl=new AbortController();
 fetch('https://ntfy.sh/'+encodeURIComponent(TOP_DEC)+','+encodeURIComponent(TOP_REQ)+'/sse',{cache:'no-store',signal:sseCtrl.signal})
 .then(r=>{if(!r.ok||!r.body)throw new Error('sse '+r.status);const reader=r.body.getReader();const dec=new TextDecoder();let buf='';
  function pump(){return reader.read().then(({done,value})=>{if(done)return;buf+=dec.decode(value,{stream:true});let lines=buf.split('\n');buf=lines.pop();
   lines.forEach(ln=>{try{const m=ln.match(/data:\s*(.*)/);if(m){const ev=JSON.parse(m[1]);handleNtfyEvent(ev);}}catch(x){}});return pump();});}return pump();})
 .catch(err=>{console.warn('SSE KO, poll 60 s :',err.message);self.startNtfyPoll();});}catch(e){self.startNtfyPoll();}};
self.startNtfyPoll=function(){if(self._ntfyPoll)return;self._ntfyPoll=setInterval(()=>{
 fetch('https://ntfy.sh/'+encodeURIComponent(TOP_DEC)+','+encodeURIComponent(TOP_REQ)+'/json?poll=1&since=60s',{cache:'no-store'})
 .then(r=>r.ok?r.json():[]).then(arr=>{(Array.isArray(arr)?arr:[]).forEach(handleNtfyEvent);}).catch(()=>{});},60000);};
function handleNtfyEvent(ev){try{const msg=JSON.parse(ev.message||'{}');const isReq=ev.topic===TOP_REQ;
 self.registration.showNotification(isReq?('🔔 Demande d’accès : '+(msg.name||'?')):('🔐 Décision : '+(msg.status||'?')),
  {body:isReq?'Appareil '+(msg.device||'').slice(0,8):'Appliquée sur l’APK concernée',icon:'images/icon-192x192.png',tag:'ac-'+(ev.id||Date.now()),data:{type:isReq?'request':'decision',payload:msg}});
 self.clients.matchAll({type:'window'}).then(cls=>cls.forEach(c=>c.postMessage({type:'ntfy-event',topic:ev.topic,payload:msg})));}catch(e){}}
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>cs[0]?cs[0].focus():clients.openWindow('./')));});
self.addEventListener('periodicsync',e=>{if(e.tag==='monthly-recalls'){e.waitUntil((async()=>{try{
 const res=await fetch('data/recalls-feed.json?v='+Date.now(),{cache:'no-store'});if(!res.ok)return;
 const feed=await res.json();const c=await caches.open(DYN);c.put('data/recalls-feed.json',new Response(JSON.stringify(feed)));
 const cls=await self.clients.matchAll({type:'window'});cls.forEach(cl=>cl.postMessage({type:'feed-updated',version:feed.version,auto:true}));
 await self.registration.showNotification('diag-incendie-by-kevin',{body:'🔄 MàJ 30 j : feed v'+feed.version,icon:'images/icon-192x192.png'});}catch(err){console.warn(err);}})());}});
async function img(r){const h=await caches.match(r);if(h)return h;try{const s=await fetch(r);if(s.ok||s.type==='opaque'){const c=await caches.open(DYN);c.put(r,s.clone());}return s;}catch{return new Response('',{status:503});}}
async function net(r){try{const s=await fetch(r);if(s.ok){const c=await caches.open(DYN);c.put(r,s.clone());}return s;}catch{return(await caches.match(r))||new Response('{}',{status:503});}}
async function nav(r){try{const s=await fetch(r);if(s.ok){const c=await caches.open(DYN);c.put(r,s.clone());}return s;}catch{const h=await caches.match(r);if(h)return h;if(r.mode==='navigate')return(await caches.match('./index.html'))||Response.error();return new Response('',{status:503});}}
