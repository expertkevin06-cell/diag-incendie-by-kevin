// ================================================================
// MAJ MENSUELLE AUTOMATIQUE DES CAS - v9
// Couches : GitHub Action (feed) + Periodic Background Sync (SW) + check au lancement + manuel
// ================================================================
const FEED_URL='data/recalls-feed.json';
const MONTH_MS=30*24*3600*1000;
function idbGet(db,store,key){return new Promise(res=>{const t=db.transaction([store],'readonly');const r=t.objectStore(store).get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);});}
function idbPut(db,store,val){return new Promise(res=>{const t=db.transaction([store],'readwrite');t.objectStore(store).put(val);t.oncomplete=()=>res(true);t.onerror=()=>res(false);});}
function idbDel(db,store,key){return new Promise(res=>{const t=db.transaction([store],'readwrite');t.objectStore(store).delete(key);t.oncomplete=()=>res(true);});}
function normalizeFeedCase(c){return {id:c.id,brand:c.brand||'-',models:c.models||'-',years:c.years||'-',energy:['thermal','ev','hybrid','lpg'].includes(c.energy)?c.energy:'thermal',motor:c.motor||'-',region:c.region||'-',src:c.src||'Feed',ref:c.ref||'-',cause:c.cause||'-',mech:c.mech||'Mécanisme à documenter',idx:c.idx||'Cartographie de fusion + perles primaires/secondaires',photos:(c.photos&&c.photos.length?c.photos:['engine_burnt'])};}
async function loadPersistedFeed(db){try{const rec=await idbGet(db,'userData','feedCases');if(rec&&rec.cases){let n=0;for(const c of rec.cases){if(!RECALLS.find(r=>r.id===c.id)){RECALLS.push(normalizeFeedCase(c));n++;}}console.log('✅ Feed persisté fusionné :',n,'cas');} }catch(e){console.warn(e);}}
async function syncRecallsFeed(db,force){
 const meta=(await idbGet(db,'userData','feedMeta'))||{};
 const now=Date.now();
 if(!force&&meta.lastSync&&(now-meta.lastSync)<MONTH_MS)return{skipped:true,meta};
 if(!navigator.onLine)return{skipped:true,offline:true};
 let feed;
 try{const r=await fetch(FEED_URL+'?v='+now,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);feed=await r.json();}catch(e){console.warn('Feed injoignable:',e.message);return{error:e.message};}
 let added=0;
 for(const c of (feed.cases||[])){if(!RECALLS.find(r=>r.id===c.id)){RECALLS.push(normalizeFeedCase(c));added++;}}
 await idbPut(db,'userData',{key:'feedCases',cases:feed.cases||[]});
 await idbPut(db,'userData',{key:'feedMeta',lastSync:now,version:feed.version||1,added});
 return{added,version:feed.version||1};}
async function registerPeriodicSync(){
 try{if(!('periodicSync' in navigator))return 'non supporté';
 const reg=await navigator.serviceWorker.ready;
 const perm=await navigator.permissions.query({name:'periodic-background-sync'}).catch(()=>({state:'denied'}));
 if(perm.state!=='granted')return 'permission non accordée';
 await reg.periodicSync.register('monthly-recalls',{minInterval:MONTH_MS});
 return 'actif (intervalle 30 j)';}catch(e){return 'erreur : '+e.message;}}
