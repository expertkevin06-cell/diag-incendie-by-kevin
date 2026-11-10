// ================================================================
// ETUDE INCENDIE BY KEVIN — engine.js v29
// Accès tiers/admin FIABILISÉ (multi-hôtes ntfy + notif SW + diag)
// + recherches + feed mensuel + moteur de MAJ SW
// ================================================================
function seNorm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
var SE_SYN={huile:['oil'],oil:['huile'],carburant:['fuel','essence','gazole'],fuel:['carburant'],fuite:['leak'],leak:['fuite'],batterie:['battery'],battery:['batterie'],court:['court-circuit','short','arc'],short:['court-circuit'],incendie:['fire','feu'],fire:['incendie'],faisceau:['harness'],harness:['faisceau'],fusible:['fuse'],fuse:['fusible'],embrasement:['runaway'],runaway:['embrasement'],perle:['bead'],bead:['perle'],echappement:['exhaust','collecteur'],catalyseur:['cata'],charge:['charging','ccs'],cosse:['borne','terminal']};
function fuzzy16(t,q){var i=0;for(var j=0;j<t.length;j++){if(t[j]===q[i])i++;if(i>=q.length)return true;}return false;}
function tmModel(rm,t){if(rm.indexOf(t)>=0)return true;var m=t.match(/^([a-z]{1,3})(\d{1,3})$/);if(m){var fw=rm.split(' ')[0]||'';if(fw.indexOf(m[1])===0&&rm.indexOf(m[2])>=0)return true;}if(t.length>=4&&fuzzy16(rm,t))return true;return false;}
function seExpand(q){var t=seNorm(q).split(/[\s,;]+/).filter(Boolean);var out={};t.forEach(function(w){out[w]=1;(SE_SYN[w]||[]).forEach(function(s){out[seNorm(s)]=1;});});return Object.keys(out);}
function seLev(a,b){if(Math.abs(a.length-b.length)>2)return 9;var p=[],i,j;for(j=0;j<=b.length;j++)p[j]=j;for(i=1;i<=a.length;i++){var c=[i];for(j=1;j<=b.length;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c;}return p[b.length];}
function seScore(text,toks){var t=seNorm(text);var s=0;toks.forEach(function(w){if(t.indexOf(w)>=0)s+=w.length>3?2:1;else{var ws=t.split(/[^a-z0-9]+/);for(var i=0;i<ws.length;i++){if(ws[i].length>4&&seLev(ws[i],w)<=1){s+=1;break;}}}});return s;}
function seSearch(q,facets){var toks=seExpand(q);if(!toks.length)return{recalls:[],cases:[],wires:[],metals:[]};var F=facets||{};
 var recs=[];RECALLS.forEach(function(r){if(F.energy&&r.energy!==F.energy)return;if(F.sub&&seNorm((r.subsys||'')+(r.motor||'')).indexOf(seNorm(F.sub))<0)return;
  var s=seScore((r.brand||'')+' '+(r.models||''),toks)*3+seScore(r.cause||'',toks)*2+seScore(r.mech||'',toks)*2+seScore(r.motor||'',toks)*2+seScore(r.idx||'',toks);if(s>0)recs.push({r:r,s:s});});
 recs.sort(function(a,b){return b.s-a.s;});
 var cases=[];FIRE_DATABASE.fireCauses.forEach(function(c){var s=seScore(c.title+' '+c.description+' '+c.causes.join(' '),toks);if(s>0)cases.push({c:c,s:s});});cases.sort(function(a,b){return b.s-a.s;});
 var wires=[];Object.keys(FIRE_DATABASE.wireAnalysis).forEach(function(k){var w=FIRE_DATABASE.wireAnalysis[k];var s=seScore(w.title+' '+w.identification+w.characteristics.join(' '),toks);if(s>0)wires.push({w:w,s:s});});wires.sort(function(a,b){return b.s-a.s;});
 var metals=[];FIRE_DATABASE.metals.forEach(function(m){var s=seScore(m.name+' '+m.appearance,toks);if(s>0)metals.push({m:m,s:s});});metals.sort(function(a,b){return b.s-a.s;});
 return{recalls:recs.slice(0,20),cases:cases.slice(0,8),wires:wires.slice(0,6),metals:metals.slice(0,6)};}
var PANNE_KEYWORDS={'courroie':'belt','belt':'belt','fap':'dpf','dpf':'dpf','gpf':'dpf','adblue':'adblue','scr':'adblue','turbo':'turbo','egr':'egr','carburant':'fuel','fuel':'fuel','lpg':'fuel','gpl':'fuel','puissance':'mech','court-circuit':'elec','short':'elec','electrique':'elec','incendie':'fire','feu':'fire','fire':'fire','charge':'charge','charging':'charge','batterie':'batt','battery':'batt','12v':'elec','48v':'elec','ht':'batt','hv':'batt','camera':'camera','adas':'adas','fuite':'leak','leak':'leak','eau':'leak','surchauffe':'overheat','overheat':'overheat','boite':'gearbox','gearbox':'gearbox','frein':'mech','pneu':'mech','logiciel':'software','ota':'software','foyer':'fire','origine':'fire'};
var ENERGY_KW={'thermique':'thermal','thermal':'thermal','essence':'thermal','diesel':'thermal','electrique':'ev','ev':'ev','bev':'ev','hybride':'hybrid','hybrid':'hybrid','phev':'hybrid','mhev':'hybrid','48v':'hybrid','gpl':'lpg','lpg':'lpg','eco-g':'lpg'};
function idbGet(db,s,k){return new Promise(function(res){try{var t=db.transaction([s],'readonly');var q=t.objectStore(s).get(k);q.onsuccess=function(){res(q.result);};q.onerror=function(){res(null);};}catch(e){res(null);}});}
function idbPut(db,s,v){return new Promise(function(res){try{var t=db.transaction([s],'readwrite');t.objectStore(s).put(v);t.oncomplete=function(){res(true);};t.onerror=function(){res(false);};}catch(e){res(false);}});}
function idbDel(db,s,k){return new Promise(function(res){try{var t=db.transaction([s],'readwrite');t.objectStore(s).delete(k);t.oncomplete=function(){res(true);};}catch(e){res(false);}});}
var FEED_URL='data/recalls-feed.json',MONTH_MS=30*24*3600*1000;
function normFeed(c){return{id:c.id,brand:c.brand||'-',models:c.models||'-',years:c.years||'-',energy:['thermal','ev','hybrid','lpg'].indexOf(c.energy)>=0?c.energy:'thermal',motor:c.motor||'-',region:c.region||'-',src:c.src||'Feed',ref:c.ref||'-',cause:c.cause||'-',mech:c.mech||'Mécanisme à documenter',idx:c.idx||'Cartographie fusion + perles',subsys:c.subsys||'',power:c.power||'',photos:(c.photos&&c.photos.length?c.photos:['engine_burnt'])};}
function dedupeKey(c){return String(c.brand+'|'+c.cause).toLowerCase().slice(0,80);}
async function loadPersistedFeed(db){try{var rec=await idbGet(db,'userData','feedCases');if(rec&&rec.cases){var keys={};RECALLS.forEach(function(r){keys[dedupeKey(r)]=1;});var n=0;
 rec.cases.forEach(function(c){if(!RECALLS.find(function(r){return r.id===c.id;})&&!keys[dedupeKey(c)]){RECALLS.push(normFeed(c));keys[dedupeKey(c)]=1;n++;}});
 console.log('✅ Feed persisté fusionné : '+n);}}catch(e){}}
async function fetchFeed(attempts){var last;for(var i=0;i<(attempts||3);i++){try{var r=await fetch(FEED_URL+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json();}catch(e){last=e;await new Promise(function(s){setTimeout(s,1500*(i+1));});}}throw last;}
async function syncRecallsFeed(db,force){var meta=(await idbGet(db,'userData','feedMeta'))||{};var now=Date.now();
 if(!force&&meta.lastSync&&(now-meta.lastSync)<MONTH_MS)return{skipped:true,meta:meta};
 if(!navigator.onLine)return{skipped:true,offline:true};
 var feed;try{feed=await fetchFeed(3);}catch(e){console.warn('Feed KO:',e.message);return{error:e.message};}
 var keys={};RECALLS.forEach(function(r){keys[dedupeKey(r)]=1;});var added=0;
 (feed.cases||[]).forEach(function(c){if(!RECALLS.find(function(r){return r.id===c.id;})&&!keys[dedupeKey(c)]){RECALLS.push(normFeed(c));keys[dedupeKey(c)]=1;added++;}});
 var hist=((await idbGet(db,'userData','feedHistory'))||{h:[]}).h;hist.unshift({t:now,v:feed.version||1,added:added});
 await idbPut(db,'userData',{key:'feedHistory',h:hist.slice(0,12)});
 await idbPut(db,'userData',{key:'feedCases',cases:feed.cases||[]});
 await idbPut(db,'userData',{key:'feedMeta',lastSync:now,version:feed.version||1,added:added});
 return{added:added,version:feed.version||1};}
async function registerPeriodicSync(){try{if(!('periodicSync' in navigator))return 'non supporté';
 var reg=await navigator.serviceWorker.ready;var p=await navigator.permissions.query({name:'periodic-background-sync'}).catch(function(){return{state:'denied'};});
 if(p.state!=='granted')return 'permission non accordée';
 await reg.periodicSync.register('monthly-recalls',{minInterval:MONTH_MS});return 'actif (30 j)';}catch(e){return 'erreur';}}
// ================================================================
// MOTEUR DE MISE À JOUR v28 (inchangé)
// ================================================================
var UPD={reloaded:false};
function acSwUpdateLoop(){
 if(!('serviceWorker' in navigator))return;
 function tick(){try{navigator.serviceWorker.getRegistration().then(function(reg){if(reg)reg.update();});}catch(e){}}
 tick();setInterval(tick,10*60*1000);
 document.addEventListener('visibilitychange',function(){if(!document.hidden)tick();});
 navigator.serviceWorker.addEventListener('controllerchange',function(){
  if(UPD.reloaded)return;UPD.reloaded=true;
  AC.banner('🔄 Nouvelle version détectée — rechargement…');
  setTimeout(function(){window.location.reload();},1200);});
 navigator.serviceWorker.addEventListener('message',function(e){
  if(e.data&&e.data.type==='sw-activated')console.log('[v29] SW actif :',e.data.version);});}
async function manualUpdateCheck(){
 AC.banner('🔄 Vérification des mises à jour…');
 try{if('serviceWorker' in navigator){var reg=await navigator.serviceWorker.getRegistration();if(reg)await reg.update();if(reg&&reg.waiting)reg.waiting.postMessage('SKIP_WAITING');}}catch(e){}
 try{await acCheckUpdate();}catch(e){}
 try{if(window.app&&app.db){var r=await syncRecallsFeed(app.db,true);
  if(r&&r.added){AC.banner('🔄 Feed : +'+r.added+' cas (v'+r.version+')');if(typeof renderRecalls==='function')renderRecalls(RECALLS.slice(0,60));}
  else AC.banner('✅ Feed déjà à jour');}}catch(e){}
 try{var res=await fetch('service-worker.js',{cache:'no-store'});var t=await res.text();var m=t.match(/CACHE='([^']+)'/);
  var reg2=await navigator.serviceWorker.getRegistration();
  var st2=reg2&&reg2.installing?'installation':reg2&&reg2.waiting?'en attente (SKIP_WAITING envoyé)':'actif';
  AC.banner('📦 SW serveur : '+(m?m[1]:'?')+' • '+st2);}catch(e){AC.banner('⚠️ Vérification SW impossible');}}
// ================================================================
// CONTRÔLE D'ACCÈS v29 — multi-hôtes ntfy + notif SW + polling gate
// ================================================================
var AC={REQ_TOPIC:'etude-incendie-req-83600',DEC_TOPIC:'etude-incendie-dec-83600',UPD_TOPIC:'etude-incendie-upd-83600',
 HOSTS:['https://ntfy.sh','https://ntfy.zoey.dev','https://ntfy.tiepolog.ovh'],host:0,
 GRANT_WINDOW:7*24*3600*1000,state:null,requests:[],pollTimer:null,netTimer:null,tries:0,lockUntil:0,_lastLogin:0,_memAdmin:false,ADMIN_EXPECT:0,
 diag:{lastPoll:0,lastOk:false,lastErr:'',reqCount:0,decCount:0,pubOk:0,pubKo:0},_lastReq:null};
function acHash(s){var h=5381;for(var i=0;i<s.length;i++){h=(Math.imul(h,33)+s.charCodeAt(i))|0;}return h>>>0;}
AC.ADMIN_EXPECT=acHash(String.fromCharCode(75,101,118,105,110,56,51,54,48,48));
function acHost(){return AC.HOSTS[AC.host%AC.HOSTS.length];}
function acDevice(){var d=localStorage.getItem('acDevice');if(!d){d='dev-'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('acDevice',d);}return d;}
function acIsAdminDevice(){return localStorage.getItem('acAdminDevice')==='1';}
function acMarkAdminDevice(){localStorage.setItem('acAdminDevice','1');}
// ---- Publication robuste (multi-hôtes + retry) ----
async function acPub(topic,obj){obj=Object.assign({id:Math.random().toString(36).slice(2,10),ts:Date.now()},obj);
 var lastErr='';
 for(var i=0;i<AC.HOSTS.length;i++){var h=AC.HOSTS[(AC.host+i)%AC.HOSTS.length];
  for(var a=0;a<2;a++){
   try{var r=await fetch(h+'/'+topic,{method:'POST',body:JSON.stringify(obj),headers:{'Content-Type':'text/plain'}});
    if(r.ok){AC.host=(AC.host+i)%AC.HOSTS.length;AC.diag.pubOk++;AC.diag.lastOk=true;AC.diag.lastErr='';return true;}
    lastErr='HTTP '+r.status;}catch(e){lastErr=e.message;}
   await new Promise(function(s){setTimeout(s,800);});}}
 AC.diag.pubKo++;AC.diag.lastOk=false;AC.diag.lastErr=lastErr;return false;}
// ---- Lecture robuste ----
async function acPoll(topic,since){var lastErr='';
 for(var i=0;i<AC.HOSTS.length;i++){var h=AC.HOSTS[(AC.host+i)%AC.HOSTS.length];
  try{var r=await fetch(h+'/'+topic+'/json?poll=1&since='+(since||'all'),{cache:'no-store'});
   if(r.ok){var j=await r.json();AC.host=(AC.host+i)%AC.HOSTS.length;AC.diag.lastPoll=Date.now();AC.diag.lastOk=true;AC.diag.lastErr='';return Array.isArray(j)?j:[];}
   lastErr='HTTP '+r.status;}catch(e){lastErr=e.message;}}
 AC.diag.lastOk=false;AC.diag.lastErr=lastErr;return [];}
function acParse(ev){try{return JSON.parse(ev.message);}catch(e){return null;}}
// ---- Notification via Service Worker (page masquée OK) ----
function acNotify(title,body){AC.banner(title+' — '+body);
 try{
  if(navigator.serviceWorker&&navigator.serviceWorker.getRegistration){
   navigator.serviceWorker.getRegistration().then(function(reg){
    if(reg&&reg.showNotification){reg.showNotification(title,{body:body,icon:'images/icon-192x192.png',tag:'ac-'+Date.now()});}
    else if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body:body});});
   return;}
  if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body:body});
 }catch(e){}}
function acAskNotif(){try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();}catch(e){}}
AC.banner=function(t){var b=document.getElementById('updateBanner');if(b){b.textContent=t;b.classList.add('show');setTimeout(function(){b.classList.remove('show');},9000);}};
// ---- État ----
function acGetGrant(){try{return JSON.parse(localStorage.getItem('acGrant')||'null');}catch(e){return null;}}
function acSaveGrant(g){localStorage.setItem('acGrant',JSON.stringify(g));}
function acClearGrant(){localStorage.removeItem('acGrant');}
function acLoad(){
 var sess=null;try{sess=JSON.parse(sessionStorage.getItem('acSession')||'null');}catch(e){}
 if((sess&&sess.role==='admin')||AC._memAdmin){AC.state={role:'admin',name:'Kevin',since:(sess?sess.ts:Date.now())};return AC.state;}
 var grant=acGetGrant();
 if(grant&&grant.device===acDevice()){AC.state={role:'granted',name:grant.name,device:grant.device,since:grant.since,lastVerify:grant.lastVerify||0,grant:grant};return AC.state;}
 var st=null;try{st=JSON.parse(localStorage.getItem('acState')||'null');}catch(e){}
 if(st&&st.role==='pending'){AC.state={role:'pending',name:st.name,device:acDevice(),since:st.since};return AC.state;}
 AC.state={role:'locked',name:''};return AC.state;}
function acSave(){try{localStorage.setItem('acState',JSON.stringify(AC.state));}catch(e){}}
function acUnlocked(){return !!(AC.state&&(AC.state.role==='admin'||AC.state.role==='granted'));}
// ---- Demande tiers (retry + état visible) ----
async function acRequest(name){if(!name||name.length<2){AC.banner('⚠️ Indiquez un nom ou prénom');return false;}
 AC._lastReq={name:name,device:acDevice()};
 var ok=await acPub(AC.REQ_TOPIC,{device:AC._lastReq.device,name:name,ua:(navigator.userAgent||'').slice(0,60)});
 AC.state={role:'pending',name:name,device:AC._lastReq.device,since:Date.now()};acSave();acApplyGate();acStartPolling();
 if(ok)AC.banner('📨 Demande envoyée à l’admin ('+name+')');
 else AC.banner('⚠️ Envoi impossible ('+AC.diag.lastErr+') — utilisez 🔁 Renvoyer');
 return ok;}
async function acRetryRequest(){if(!AC._lastReq){try{var st=JSON.parse(localStorage.getItem('acState')||'null');if(st&&st.name)AC._lastReq={name:st.name,device:acDevice()};}catch(e){}}
 if(!AC._lastReq)return false;return acRequest(AC._lastReq.name);}
// ---- Décisions (tiers) ----
async function acCheckDecisions(){
 var since=AC.state&&AC.state.since?Math.floor(AC.state.since/1000)-120:'all';
 var evs=await acPoll(AC.DEC_TOPIC,since);AC.diag.decCount+=evs.length;
 evs.forEach(function(ev){var d=acParse(ev);if(!d||d.device!==acDevice())return;
  if(d.status==='approved'){var g={device:acDevice(),name:d.name||AC.state.name,since:Date.now(),lastVerify:Date.now()};acSaveGrant(g);
   AC.state={role:'granted',name:g.name,device:g.device,since:g.since,lastVerify:g.lastVerify,grant:g};acSave();
   acNotify('✅ Accès accordé','Bienvenue '+g.name);acApplyGate();}
  else if(d.status==='refused'){acClearGrant();AC.state={role:'locked',name:''};acSave();acNotify('❌ Accès refusé','Par l’administrateur');acApplyGate();}
  else if(d.status==='revoked'){acClearGrant();try{sessionStorage.removeItem('acSession');}catch(e){}AC._memAdmin=false;AC.state={role:'locked',name:''};acSave();acNotify('⛔ Accès révoqué','Par l’administrateur');acApplyGate();}});}
async function acBootVerify(){
 if(AC.state.role==='admin')return true;
 if(AC.state.role!=='granted')return false;
 var grant=AC.state.grant||acGetGrant();
 if(!grant){AC.state={role:'locked',name:''};acApplyGate();return false;}
 if(!navigator.onLine){
  if(Date.now()-(grant.lastVerify||0)>AC.GRANT_WINDOW){AC.state={role:'locked',name:'',reason:'verify'};acApplyGate();AC.banner('🔐 Accès tiers : connexion en ligne requise');return false;}
  AC.banner('🔓 Accès tiers hors-ligne (vérifié le '+new Date(grant.lastVerify||grant.since).toLocaleDateString('fr-FR')+')');return true;}
 var evs=await acPoll(AC.DEC_TOPIC,Math.floor((grant.since||0)/1000)-60);
 var revoked=evs.some(function(ev){var d=acParse(ev);return d&&d.device===grant.device&&d.status==='revoked'&&d.ts>=(grant.since||0);});
 if(revoked){acClearGrant();AC.state={role:'locked',name:''};acSave();acApplyGate();acNotify('⛔ Accès révoqué','Par l’administrateur');return false;}
 grant.lastVerify=Date.now();acSaveGrant(grant);AC.state.lastVerify=grant.lastVerify;return true;}
// ---- Admin ----
async function acAdminLogin(pw){
 if(AC._lastLogin&&Date.now()-AC._lastLogin<800)return AC.state.role==='admin';
 AC._lastLogin=Date.now();
 if(Date.now()<AC.lockUntil){AC.banner('⛔ Verrou actif : '+Math.ceil((AC.lockUntil-Date.now())/1000)+' s');return false;}
 var clean=String(pw==null?'':pw).trim();
 var ok=acHash(clean)===AC.ADMIN_EXPECT;
 var input=document.getElementById('gatePwd');if(input)input.value='';
 if(ok){AC.tries=0;acMarkAdminDevice();acAskNotif();
  try{sessionStorage.setItem('acSession',JSON.stringify({role:'admin',ts:Date.now()}));}catch(e){AC._memAdmin=true;}
  AC.state={role:'admin',name:'Kevin',since:Date.now()};acApplyGate();acStartPolling();
  AC.banner('🔓 Session admin ouverte');return true;}
 AC.tries++;if(AC.tries>=5){AC.lockUntil=Date.now()+30000;AC.tries=0;AC.banner('⛔ 5 échecs — verrou 30 s');}
 return false;}
async function acAdminRefresh(){var evs=await acPoll(AC.REQ_TOPIC,'all');var map={};
 evs.forEach(function(ev){var d=acParse(ev);if(d&&d.device)map[d.device]=d;});
 var grants={};try{grants=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}
 AC.requests=Object.keys(map).map(function(k){var d=map[k];d.status=grants[k]?grants[k].status:'new';return d;}).sort(function(a,b){return b.ts-a.ts;});
 AC.diag.reqCount=AC.requests.length;
 var prev=parseInt(localStorage.getItem('acReqCount')||'0',10);
 if(AC.requests.length>prev&&AC.requests.length)acNotify('🔔 Nouvelle demande d’accès',AC.requests[0].name+' ('+AC.requests[0].device.slice(0,8)+'…)');
 localStorage.setItem('acReqCount',String(AC.requests.length));
 if(typeof renderAdmin==='function')renderAdmin();
 acRenderDiag();}
async function acDecide(device,name,status){var ok=await acPub(AC.DEC_TOPIC,{device:device,name:name,status:status});
 var g={};try{g=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}
 g[device]={name:name,status:status,ts:Date.now()};localStorage.setItem('acGrants',JSON.stringify(g));
 acNotify(status==='approved'?'✅ Accordé à '+name:status==='revoked'?'⛔ Révoqué : '+name:'❌ Refusé : '+name,'Décision transmise au tiers');
 acAdminRefresh();return ok;}
async function acPublishUpdate(version,approved){var msg={version:version,approvedForTiers:!!approved,ts:Date.now(),by:'admin'};
 var ok=await acPub(AC.UPD_TOPIC,msg);localStorage.setItem('acLastUpdate',JSON.stringify(msg));
 acNotify('🔄 MAJ v'+version+' publiée',approved?'✅ Applicable aux tiers':'⏳ Admin uniquement');return ok;}
async function acCheckUpdate(){if(AC.state&&AC.state.role==='admin')return;
 var evs=await acPoll(AC.UPD_TOPIC,'all');if(!evs.length)return;var last=acParse(evs[evs.length-1]);if(!last)return;
 var cur=localStorage.getItem('acApprovedVersion')||'';if(last.version===cur)return;
 if(last.approvedForTiers){localStorage.setItem('acApprovedVersion',last.version);acNotify('🔄 MAJ v'+last.version,'Approuvée — rechargement…');setTimeout(function(){window.location.reload(true);},3000);}
 else acNotify('🔄 MAJ v'+last.version+' disponible','En attente validation admin');}
// ---- Gate + diagnostic ----
function acApplyGate(){var g=document.getElementById('gateOverlay');if(!g)return;
 if(AC.state.role==='admin'||AC.state.role==='granted'){g.style.display='none';document.body.classList.remove('locked');
  var ap=document.getElementById('adminPanel');if(ap)ap.style.display=(AC.state.role==='admin')?'block':'none';
  if(AC.state.role==='admin')acAdminRefresh();}
 else{g.style.display='flex';document.body.classList.add('locked');
  var st=document.getElementById('gateStatus');
  if(st)st.textContent=AC.state.role==='pending'?'⏳ Demande envoyée ('+(AC.state.name||'')+') — en attente…':(AC.state.reason==='verify'?'🔐 Accès tiers : vérification en ligne requise':'🔒 Mot de passe admin obligatoire — ou demande d’accès tiers');
  var p=document.getElementById('gatePwd');if(p){p.value='';p.placeholder='Mot de passe';}
  var rb=document.getElementById('gateRetry');if(rb)rb.style.display=(AC.state.role==='pending'&&!AC.diag.lastOk)?'inline-block':'none';}
 acRenderDiag();}
function acRenderDiag(){var el=document.getElementById('acDiag');if(!el)return;
 var t=AC.diag.lastPoll?new Date(AC.diag.lastPoll).toLocaleTimeString('fr-FR'):'jamais';
 el.innerHTML='<strong>📡 Canal ntfy :</strong> '+acHost()+' • '+(AC.diag.lastOk?'✅ OK':'❌ KO '+esc15(AC.diag.lastErr||''))+'<br>'+
 '<strong>Dernier poll :</strong> '+t+' • <strong>Demandes :</strong> '+AC.diag.reqCount+' • <strong>Pub OK/KO :</strong> '+AC.diag.pubOk+'/'+AC.diag.pubKo+'<br>'+
 '<strong>Notifications :</strong> '+('Notification' in window?Notification.permission:'non supporté')+' • <strong>Appareil admin :</strong> '+(acIsAdminDevice()?'oui':'non');}
function acWireGate(){if(window.__gateWired)return;window.__gateWired=1;
 var b=document.getElementById('gateAdminBtn');
 if(b)b.addEventListener('click',async function(){var p=document.getElementById('gatePwd');var ok=await acAdminLogin(p?p.value:'');var st=document.getElementById('gateStatus');if(!ok&&st)st.textContent='❌ Mot de passe incorrect';});
 var q=document.getElementById('gateReqBtn');
 if(q)q.addEventListener('click',function(){var n=document.getElementById('gateName');acRequest(n?n.value.trim():'');});
 var rr=document.getElementById('gateRetry');
 if(rr)rr.addEventListener('click',function(){acRetryRequest();});
 var e=document.getElementById('gatePwd');
 if(e)e.addEventListener('keypress',function(ev){if(ev.key==='Enter'){ev.preventDefault();var bb=document.getElementById('gateAdminBtn');if(bb)bb.click();}});}
// ---- Boucle unique : admin (même au gate) + tiers ----
async function acTick(){if(!navigator.onLine)return;
 var role=AC.state?AC.state.role:'locked';
 if(role==='admin'||acIsAdminDevice()){try{await acAdminRefresh();}catch(e){}}
 if(role==='pending'||role==='granted'){try{await acCheckDecisions();await acCheckUpdate();}catch(e){}}}
function acStartPolling(){if(AC.pollTimer)return;acTick();AC.pollTimer=setInterval(acTick,15000);
 document.addEventListener('visibilitychange',function(){if(!document.hidden)acTick();});}
function acNetWatch(){if(AC.netTimer)return;AC.netTimer=setInterval(function(){var el=document.getElementById('connectionStatus');if(!el)return;
 if(!navigator.onLine){el.className='connection-status offline';el.innerHTML='<span class="status-text">Hors ligne — base locale</span>';return;}
 fetch('./',{method:'HEAD',cache:'no-store'}).then(function(){el.className='connection-status online';el.innerHTML='<span class="status-text">📶 4G/5G/WiFi actif</span>';}).catch(function(){el.className='connection-status offline';el.innerHTML='<span class="status-text">Réseau instable — base locale</span>';});},15000);}
function apkShareMail(){var url=location.origin+location.pathname.replace(/index\.html$/,'').replace(/tools\/$/,'');
 var subject=encodeURIComponent('📱 Etude incendie by Kevin — APK');
 var body=encodeURIComponent('Bonjour,\n\nApplication Etude incendie by Kevin :\n'+url+'\n\n📲 Android : Chrome → Menu ⋮ → Installer\n🔐 Accès : mot de passe admin obligatoire ou demande validée.\n\n— Kevin');
 window.location.href='mailto:?subject='+subject+'&body='+body;}
var GEMINI_API_KEY='VOTRE_CLE_API_GEMINI';
async function geminiSearch(query){var ctx='MÉTAUX : '+FIRE_DATABASE.metals.map(function(m){return m.name+' '+m.meltingPointC+'°C';}).join(', ')+' | CAS : '+RECALLS.slice(-15).map(function(r){return r.brand+' '+r.cause;}).join(' ; ');
 var r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+GEMINI_API_KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:'Expert incendie véhicule/bâtiment. CONTEXTE : '+ctx+'\nQUESTION : '+query+'\nRéponds en français technique.'}]}]})});
 if(!r.ok)throw new Error('API '+r.status);var d=await r.json();return d.candidates[0].content.parts[0].text;}
document.addEventListener('DOMContentLoaded',function(){acLoad();acInjectNotesSafe();acWireGate();acApplyGate();
 acBootVerify().then(function(ok){if(ok)acApplyGate();});
 acStartPolling();acNetWatch();acSwUpdateLoop();
 if(acIsAdminDevice())acAskNotif();
 var mb=document.getElementById('manualUpdateBtn');if(mb)mb.addEventListener('click',function(){manualUpdateCheck();});
 console.log('✅ engine v29 : canal tiers/admin fiabilisé (multi-hôtes + notif SW + polling gate)');});
function acInjectNotesSafe(){var card=document.querySelector('.gate-card');if(!card||card.dataset.v29)return;card.dataset.v29='1';
 var b=document.getElementById('gateAdminBtn');
 if(b){var n1=document.createElement('p');n1.style.cssText='font-size:.75rem;opacity:.85;margin-top:.4rem';n1.textContent='⚠️ Mot de passe exigé à CHAQUE ouverture.';b.parentNode.insertBefore(n1,b.nextSibling);}
 var q=document.getElementById('gateReqBtn');
 if(q){var n2=document.createElement('p');n2.style.cssText='font-size:.75rem;opacity:.85;margin-top:.4rem';n2.textContent='🔐 Tiers : validation admin + notif directe + révocation.';q.parentNode.insertBefore(n2,q.nextSibling);}}
