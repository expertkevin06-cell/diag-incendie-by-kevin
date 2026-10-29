// ================================================================
// CONTRÔLE D’ACCÈS v20 — admin hash-only, tiers NOTIF-ONLY (ntfy),
// diffusion des mises à jour validées par l’admin, base persistante
// ================================================================
var AC={REQ_TOPIC:'diag-incendie-kevin-req-83600',DEC_TOPIC:'diag-incendie-kevin-dec-83600',REL_TOPIC:'diag-incendie-kevin-rel-83600',NTFY:'https://ntfy.sh',ADMIN_HASH:3615734019,state:null,requests:[],pollTimer:null,netTimer:null,tries:0,lockUntil:0};
function acHash(s){var h=5381;for(var i=0;i<s.length;i++){h=(Math.imul(h,33)+s.charCodeAt(i))|0;}return h>>>0;}
function acDevice(){var d=localStorage.getItem('acDevice');if(!d){d='dev-'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('acDevice',d);}return d;}
function acLoad(){try{AC.state=JSON.parse(localStorage.getItem('acState')||'null')||{role:'locked',name:''};}catch(e){AC.state={role:'locked',name:''};}return AC.state;}
function acSave(){localStorage.setItem('acState',JSON.stringify(AC.state));}
function acUnlocked(){return !!(AC.state&&(AC.state.role==='admin'||AC.state.role==='granted'));}
AC.banner=function(t){var b=document.getElementById('updateBanner');if(b){b.textContent=t;b.classList.add('show');setTimeout(function(){b.classList.remove('show');},9000);}};
function acNotify(title,body){AC.banner(title+' — '+body);try{if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body:body});}catch(e){}}
function acAskNotif(){try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();}catch(e){}}
async function acPub(topic,obj){try{await fetch(AC.NTFY+'/'+topic,{method:'POST',body:JSON.stringify(obj),headers:{'Content-Type':'text/plain'}});return true;}catch(e){console.warn('ntfy KO',e);return false;}}
async function acPoll(topic,since){try{var r=await fetch(AC.NTFY+'/'+topic+'/json?poll=1&since='+(since||'all'),{cache:'no-store'});if(!r.ok)return[];var j=await r.json();return Array.isArray(j)?j:[];}catch(e){return[];}}
function acParse(ev){try{return JSON.parse(ev.message);}catch(e){return null;}}
function acPersistBase(){try{if(navigator.storage&&navigator.storage.persist){navigator.storage.persist().then(function(ok){console.log('💾 stockage persistant :',ok);});}}catch(e){}}
// ---- Tiers : demande NOTIF-ONLY ----
async function acRequest(name){if(!name||name.length<2){AC.banner('⚠️ Indiquez un nom ou prénom');return;}
 var dev=acDevice();await acPub(AC.REQ_TOPIC,{device:dev,name:name,ts:Date.now(),ua:(navigator.userAgent||'').slice(0,60)});
 AC.state={role:'pending',name:name,device:dev,since:Date.now(),feedVersion:AC.state&&AC.state.feedVersion||0};acSave();acApplyGate();acStartPolling();
 AC.banner('📨 Demande envoyée à l’admin ('+name+') — notification directe, sans mail/SMS');}
async function acCheckDecisions(){var evs=await acPoll(AC.DEC_TOPIC,AC.state&&AC.state.since?Math.floor(AC.state.since/1000)-120:'all');
 evs.forEach(function(ev){var d=acParse(ev);if(!d||d.device!==acDevice())return;
  if(d.status==='approved'){AC.state.role='granted';AC.state.name=d.name||AC.state.name;AC.state.since=Date.now();acSave();acNotify('✅ Accès accordé','Bienvenue '+AC.state.name);acApplyGate();}
  else if(d.status==='refused'){AC.state={role:'locked',name:'',since:Date.now()};acSave();acNotify('❌ Accès refusé','Par l’administrateur');acApplyGate();}
  else if(d.status==='revoked'){AC.state={role:'locked',name:'',since:Date.now()};acSave();acNotify('⛔ Accès révoqué','Par l’administrateur');acApplyGate();}});}
// ---- Tiers : application des MàJ SEULEMENT si validées par l’admin ----
async function acCheckReleases(){var evs=await acPoll(AC.REL_TOPIC,'30d');var latest=null;
 evs.forEach(function(ev){var d=acParse(ev);if(d&&d.type==='release'&&d.validated){if(!latest||d.version>latest.version)latest=d;}});
 if(latest&&(!AC.state.feedVersion||latest.version>AC.state.feedVersion)){
  try{var r=await fetch('data/recalls-feed.json?v='+Date.now(),{cache:'no-store'});if(r.ok){var feed=await r.json();
   if(window.applyFeedMerge){var added=applyFeedMerge(feed);AC.state.feedVersion=latest.version;acSave();
    acNotify('🔄 Mise à jour appliquée','v'+latest.version+' (+'+added+' cas) — validée par l’admin');
    if(typeof renderRecalls==='function')renderRecalls(RECALLS);if(window.app)app.stats&&app.stats();}}}catch(e){console.warn('release apply KO',e);}}}
// ---- Admin ----
async function acAdminLogin(pw){if(Date.now()<AC.lockUntil){AC.banner('⛔ Trop de tentatives — '+Math.ceil((AC.lockUntil-Date.now())/1000)+' s');return false;}
 var input=document.getElementById('gatePwd');var ok=acHash(String(pw||''))===AC.ADMIN_HASH;if(input)input.value='';
 if(ok){AC.tries=0;AC.state={role:'admin',name:'Kevin',since:Date.now(),feedVersion:AC.state&&AC.state.feedVersion||0};acSave();acAskNotif();acApplyGate();acStartPolling();return true;}
 AC.tries++;if(AC.tries>=5){AC.lockUntil=Date.now()+30000;AC.tries=0;AC.banner('⛔ 5 échecs — verrou 30 s');}return false;}
async function acAdminRefresh(){var evs=await acPoll(AC.REQ_TOPIC,'all');var map={};
 evs.forEach(function(ev){var d=acParse(ev);if(d&&d.device)map[d.device]=d;});
 var grants={};try{grants=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}
 AC.requests=Object.keys(map).map(function(k){var d=map[k];d.grant=grants[k]||null;return d;}).sort(function(a,b){return b.ts-a.ts;});
 var prev=localStorage.getItem('acReqCount')||'0';
 if(AC.requests.length>parseInt(prev,10)&&AC.requests[0])acNotify('🔔 Nouvelle demande',AC.requests[0].name);
 localStorage.setItem('acReqCount',String(AC.requests.length));
 if(typeof renderAdmin==='function')renderAdmin();}
async function acDecide(device,name,status){await acPub(AC.DEC_TOPIC,{device:device,name:name,status:status,ts:Date.now()});
 var g={};try{g=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}g[device]={name:name,status:status,ts:Date.now()};localStorage.setItem('acGrants',JSON.stringify(g));
 acNotify(status==='approved'?'✅ Accordé : '+name:status==='revoked'?'⛔ Révoqué : '+name:'❌ Refusé : '+name,'Notifié sur l’APK du tiers');acAdminRefresh();}
async function acValidateRelease(version){var v=parseInt(version||'0',10);if(!v){AC.banner('⚠️ Version invalide');return;}
 await acPub(AC.REL_TOPIC,{type:'release',version:v,validated:true,ts:Date.now()});
 AC.state.feedVersion=v;acSave();acNotify('📡 Mise à jour v'+v+' diffusée','Les tiers l’appliqueront automatiquement');AC.banner('✅ v'+v+' validée et diffusée aux tiers');}
// ---- Gate UI ----
function acApplyGate(){var g=document.getElementById('gateOverlay');if(!g)return;
 if(acUnlocked()){g.style.display='none';document.body.classList.remove('locked');
  var ap=document.getElementById('adminPanel');if(ap)ap.style.display=(AC.state.role==='admin')?'block':'none';
  if(AC.state.role==='admin')acAdminRefresh();}
 else{g.style.display='flex';document.body.classList.add('locked');
  var st=document.getElementById('gateStatus');if(st)st.textContent=(AC.state.role==='pending')?'⏳ Demande envoyée ('+AC.state.name+') — attente validation admin…':'🔒 Application protégée — admin ou demande d’accès';
  var p=document.getElementById('gatePwd');if(p){p.value='';p.placeholder='Mot de passe';p.setAttribute('autocomplete','new-password');}}}
function acStartPolling(){if(AC.pollTimer)return;
 AC.pollTimer=setInterval(function(){if(!navigator.onLine)return;
  if(AC.state&&AC.state.role==='admin')acAdminRefresh();
  else if(AC.state){acCheckDecisions();acCheckReleases();}},40000);}
function acNetWatch(){if(AC.netTimer)return;
 AC.netTimer=setInterval(function(){var el=document.getElementById('connectionStatus');if(!el)return;
  if(!navigator.onLine){el.className='connection-status offline';el.innerHTML='<span class="status-text">Hors ligne — base locale massive</span>';return;}
  fetch('./',{method:'HEAD',cache:'no-store'}).then(function(r){el.className='connection-status online';el.innerHTML='<span class="status-text">📶 4G/5G/WiFi permanent</span>';
   if(window.app&&app.db&&r.ok)syncRecallsFeed(app.db,false).then(function(x){if(x&&x.added&&AC.state&&AC.state.role==='admin'){AC.banner('🔄 Nouveau feed v'+x.version+' disponible — validez sa diffusion aux tiers');}});}).catch(function(){el.className='connection-status offline';el.innerHTML='<span class="status-text">Réseau instable — base locale</span>';});},15000);}
document.addEventListener('DOMContentLoaded',function(){acLoad();acPersistBase();
 var p=document.getElementById('gatePwd');if(p){p.value='';p.placeholder='Mot de passe';p.setAttribute('autocomplete','new-password');}
 acApplyGate();acStartPolling();acNetWatch();acAskNotif();
 console.log('✅ access-control v20 (notif-only + diffusion admin + base persistante, role='+AC.state.role+')');});
