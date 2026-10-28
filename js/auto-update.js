// ================================================================
// MAJ MENSUELLE AUTOMATIQUE v10 (robuste)
// ================================================================
const FEED_URL='data/recalls-feed.json';
const MONTH_MS=30*24*3600*1000;
function idbGet(db,s,k){return new Promise(r=>{const t=db.transaction([s],'readonly');const q=t.objectStore(s).get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(null);});}
function idbPut(db,s,v){return new Promise(r=>{const t=db.transaction([s],'readwrite');t.objectStore(s).put(v);t.oncomplete=()=>r(true);t.onerror=()=>r(false);});}
function norm(c){return{id:c.id,brand:c.brand||'-',models:c.models||'-',years:c.years||'-',energy:['thermal','ev','hybrid','lpg'].includes(c.energy)?c.energy:'thermal',motor:c.motor||'-',region:c.region||'-',src:c.src||'Feed',ref:c.ref||'-',cause:c.cause||'-',mech:c.mech||'Mécanisme à documenter',idx:c.idx||'Cartographie fusion + perles prim/second',photos:(c.photos&&c.photos.length?c.photos:['engine_burnt'])};}
function dedupeKey(c){return (c.brand+'|'+c.cause).toLowerCase().slice(0,80);}
async function loadPersistedFeed(db){try{const rec=await idbGet(db,'userData','feedCases');if(rec&&rec.cases){const keys=new Set(RECALLS.map(dedupeKey));let n=0;
 for(const c of rec.cases){if(!RECALLS.find(r=>r.id===c.id)&&!keys.has(dedupeKey(c))){RECALLS.push(norm(c));keys.add(dedupeKey(c));n++;}}
 console.log('✅ Feed persisté fusionné :',n);}}catch(e){console.warn(e);}}
async function fetchFeed(attempts){let last;for(let i=0;i<(attempts||3);i++){try{const r=await fetch(FEED_URL+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json();}catch(e){last=e;await new Promise(s=>setTimeout(s,1500*(i+1)));}}throw last;}
async function syncRecallsFeed(db,force){
 const meta=(await idbGet(db,'userData','feedMeta'))||{};const now=Date.now();
 if(!force&&meta.lastSync&&(now-meta.lastSync)<MONTH_MS)return{skipped:true,meta};
 if(!navigator.onLine)return{skipped:true,offline:true};
 let feed;try{feed=await fetchFeed(3);}catch(e){console.warn('Feed KO:',e.message);return{error:e.message};}
 const keys=new Set(RECALLS.map(dedupeKey));let added=0;
 for(const c of (feed.cases||[])){if(!RECALLS.find(r=>r.id===c.id)&&!keys.has(dedupeKey(c))){RECALLS.push(norm(c));keys.add(dedupeKey(c));added++;}}
 const hist=((await idbGet(db,'userData','feedHistory'))||{h:[]}).h;hist.unshift({t:now,v:feed.version||1,added});
 await idbPut(db,'userData',{key:'feedHistory',h:hist.slice(0,12)});
 await idbPut(db,'userData',{key:'feedCases',cases:feed.cases||[]});
 await idbPut(db,'userData',{key:'feedMeta',lastSync:now,version:feed.version||1,added});
 return{added,version:feed.version||1};}
async function registerPeriodicSync(){try{if(!('periodicSync' in navigator))return 'non supporté';
 const reg=await navigator.serviceWorker.ready;
 const p=await navigator.permissions.query({name:'periodic-background-sync'}).catch(()=>({state:'denied'}));
 if(p.state!=='granted')return 'permission non accordée';
 await reg.periodicSync.register('monthly-recalls',{minInterval:MONTH_MS});return 'actif (30 j)';}catch(e){return 'erreur';}}
