// ================================================================
// AUTO-UPDATE v25 — cycle 30 j strict + fusion CAS + CATALOGUE
// (nouvelles marques/modèles/motorisations injectées automatiquement)
// ================================================================
var FEED_URL='data/recalls-feed.json';
var MONTH_MS=30*24*3600*1000;
function idbGet(db,s,k){return new Promise(function(res){try{var t=db.transaction([s],'readonly');var q=t.objectStore(s).get(k);q.onsuccess=function(){res(q.result);};q.onerror=function(){res(null);};}catch(e){res(null);}});}
function idbPut(db,s,v){return new Promise(function(res){try{var t=db.transaction([s],'readwrite');t.objectStore(s).put(v);t.oncomplete=function(){res(true);};t.onerror=function(){res(false);};}catch(e){res(false);}});}
function normFeed(c){return{id:c.id,brand:c.brand||'-',models:c.models||'-',years:c.years||'-',energy:['thermal','ev','hybrid','lpg'].indexOf(c.energy)>=0?c.energy:'thermal',motor:c.motor||'-',region:c.region||'-',src:c.src||'Feed',ref:c.ref||'-',cause:c.cause||'-',mech:c.mech||'Mécanisme à documenter',idx:c.idx||'Cartographie fusion + perles',photos:(c.photos&&c.photos.length?c.photos:['engine_burnt']),power:c.power||'-',subsys:c.subsys};}
function dedupeKey(c){return (c.brand+'|'+c.cause).toLowerCase().slice(0,80);}
function applyFeedMerge(feed){if(!feed||!feed.cases)return 0;var added=0;var keys={};RECALLS.forEach(function(r){keys[dedupeKey(r)]=1;});
 feed.cases.forEach(function(c){var dk=dedupeKey(c);if(!RECALLS.find(function(r){return r.id===c.id;})&&!keys[dk]){RECALLS.push(normFeed(c));keys[dk]=1;added++;}});return added;}
function applyFeedCatalog(feed){if(!feed||!feed.catalog||!window.VEHICLE_CATALOG)return 0;var n=0;
 Object.keys(feed.catalog).forEach(function(b){var key=seNorm(b).split(' ')[0];var target=null;
  Object.keys(VEHICLE_CATALOG).forEach(function(k){if(seNorm(k)===key)target=k;});
  if(!target){VEHICLE_CATALOG[key]={};target=key;n++;}
  (feed.catalog[b]||[]).forEach(function(m){var mm=String(m).trim();if(mm&&!VEHICLE_CATALOG[target][mm]){VEHICLE_CATALOG[target][mm]=['-'];n++;}});});
 return n;}
async function loadPersistedFeed(db){try{var rec=await idbGet(db,'userData','feedCases');if(rec&&rec.cases){applyFeedMerge({cases:rec.cases});}
 var cat=await idbGet(db,'userData','feedCatalog');if(cat&&cat.catalog){applyFeedCatalog({catalog:cat.catalog});}
 console.log('✅ Feed persisté restauré');}catch(e){}}
async function fetchFeed(attempts){var last;for(var i=0;i<(attempts||3);i++){try{var r=await fetch(FEED_URL+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json();}catch(e){last=e;await new Promise(function(s){setTimeout(s,1500*(i+1));});}}throw last;}
async function syncRecallsFeed(db,force){var meta=(await idbGet(db,'userData','feedMeta'))||{};var now=Date.now();
 var due=!meta.lastSync||(now-meta.lastSync)>=MONTH_MS;
 if(!force&&!due)return{skipped:true,meta:meta,due:false};
 if(!navigator.onLine)return{skipped:true,offline:true,due:due};
 var feed;try{feed=await fetchFeed(3);}catch(e){return{error:e.message,due:due};}
 var added=applyFeedMerge(feed);var addedCat=applyFeedCatalog(feed);
 var hist=((await idbGet(db,'userData','feedHistory'))||{h:[]}).h;hist.unshift({t:now,v:feed.version||1,added:added,catalog:addedCat});
 await idbPut(db,'userData',{key:'feedHistory',h:hist.slice(0,12)});
 await idbPut(db,'userData',{key:'feedCases',cases:feed.cases||[]});
 await idbPut(db,'userData',{key:'feedCatalog',catalog:feed.catalog||{}});
 await idbPut(db,'userData',{key:'feedMeta',lastSync:now,version:feed.version||1,added:added,nextSync:now+MONTH_MS});
 return{added:added,catalog:addedCat,version:feed.version||1,due:true};}
async function registerPeriodicSync(){try{if(!('periodicSync' in navigator))return 'non supporté (fallback 30 j)';
 var reg=await navigator.serviceWorker.ready;var p=await navigator.permissions.query({name:'periodic-background-sync'}).catch(function(){return {state:'denied'};});
 if(p.state!=='granted')return 'permission non accordée (fallback lancement)';
 await reg.periodicSync.register('monthly-recalls',{minInterval:MONTH_MS});return 'actif (30 j)';}catch(e){return 'erreur';}}
