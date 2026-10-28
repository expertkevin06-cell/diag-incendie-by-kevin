// ================================================================
// CONTRÔLE D’ACCÈS v17.1 — admin par HASH uniquement (aucun clair
// dans le code, les commentaires ou les outils) + tiers via ntfy
// (notifications in-app, sans mail/SMS) + connexion permanente
// ================================================================
var AC={REQ_TOPIC:'diag-incendie-kevin-req-83600',DEC_TOPIC:'diag-incendie-kevin-dec-83600',NTFY:'https://ntfy.sh',ADMIN_HASH:3615734019,state:null,requests:[],pollTimer:null,netTimer:null,tries:0,lockUntil:0};
function acHash(s){var h=5381;for(var i=0;i<s.length;i++){h=(Math.imul(h,33)+s.charCodeAt(i))|0;}return h>>>0;}
function acDevice(){var d=localStorage.getItem('acDevice');if(!d){d='dev-'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('acDevice',d);}return d;}
function acLoad(){try{AC.state=JSON.parse(localStorage.getItem('acState')||'null')||{role:'locked',name:''};}catch(e){AC.state={role:'locked',name:''};}return AC.state;}
function acSave(){localStorage.setItem('acState',JSON.stringify(AC.state));}
function acUnlocked(){return !!(AC.state&&(AC.state.role==='admin'||AC.state.role==='granted'));}
AC.banner=function(t){var b=document.getElementById('updateBanner');if(b){b.textContent=t;b.classList.add('show');setTimeout(function(){b.classList.remove('show');},9000);}};
function acNotify(title,body){AC.banner(title+' — '+body);try{if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body:body});}catch(e){}}
function acAskNotif(){try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();}catch(e){}}
async function acPub(topic,obj){try{await fetch(AC.NTFY+'/'+topic,{method:'POST',body:JSON.stringify(obj),headers:{'Content-Type':'text/plain'}});return true;}catch(e){console.warn('ntfy pub KO',e);return false;}}
async function acPoll(topic,since){try{var r=await fetch(AC.NTFY+'/'+topic+'/json?poll=1&since='+(since||'all'),{cache:'no-store'});if(!r.ok)return[];var j=await r.json();return Array.isArray(j)?j:[];}catch(e){return[];}}
function acParse(ev){try{return JSON.parse(ev.message);}catch(e){return null;}}
// ---- Tiers ----
async function acRequest(name){if(!name||name.length<2){AC.banner('⚠️ Indiquez un nom ou prénom');return;}
 var dev=acDevice();var req={device:dev,name:name,ts:Date.now(),ua:(navigator.userAgent||'').slice(0,60)};
 var ok=await acPub(AC.REQ_TOPIC,req);
 AC.state={role:'pending',name:name,device:dev,since:Date.now()};acSave();acApplyGate();acStartPolling();
 AC.banner(ok?'📨 Demande envoyée à l’admin ('+name+')':'⚠️ Envoi impossible (réseau ?) — réessayez');}
async function acCheckDecisions(){var evs=await acPoll(AC.DEC_TOPIC,AC.state&&AC.state.since?Math.floor(AC.state.since/1000)-120:'all');
 evs.forEach(function(ev){var d=acParse(ev);if(!d||d.device!==acDevice())return;
  if(d.status==='approved'){AC.state={role:'granted',name:d.name||AC.state.name,device:acDevice(),since:Date.now()};acSave();acNotify('✅ Accès accordé','Bienvenue '+AC.state.name);acApplyGate();}
  else if(d.status==='refused'){AC.state={role:'locked',name:'',since:Date.now()};acSave();acNotify('❌ Accès refusé','Demande refusée par l’administrateur');acApplyGate();}
  else if(d.status==='revoked'){AC.state={role:'locked',name:'',since:Date.now()};acSave();acNotify('⛔ Accès révoqué','Révoqué par l’administrateur');acApplyGate();}});}
// ---- Admin (hash uniquement, anti force brute) ----
async function acAdminLogin(pw){
 if(Date.now()<AC.lockUntil){AC.banner('⛔ Trop de tentatives — réessayez dans '+Math.ceil((AC.lockUntil-Date.now())/1000)+' s');return false;}
 var input=document.getElementById('gatePwd');
 var ok=acHash(String(pw||''))===AC.ADMIN_HASH;
 if(input){input.value='';}
 if(ok){AC.tries=0;AC.state={role:'admin',name:'Kevin',since:Date.now()};acSave();acAskNotif();acApplyGate();acStartPolling();return true;}
 AC.tries++;
 if(AC.tries>=5){AC.lockUntil=Date.now()+30000;AC.tries=0;AC.banner('⛔ 5 échecs — verrou 30 s');}
 return false;}
async function acAdminRefresh(){var evs=await acPoll(AC.REQ_TOPIC,'all');var map={};
 evs.forEach(function(ev){var d=acParse(ev);if(d&&d.device)map[d.device]=d;});
 var grants={};try{grants=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}
 AC.requests=Object.keys(map).map(function(k){var d=map[k];d.status=grants[k]?grants[k].status:'new';return d;}).sort(function(a,b){return b.ts-a.ts;});
 var prev=localStorage.getItem('acReqCount')||'0';
 if(AC.requests.length>parseInt(prev,10)){var nw=AC.requests[0];acNotify('🔔 Nouvelle demande d’accès',nw.name+' ('+nw.device.slice(0,8)+')');}
 localStorage.setItem('acReqCount',String(AC.requests.length));
 if(typeof renderAdmin==='function')renderAdmin();}
async function acDecide(device,name,status){var ok=await acPub(AC.DEC_TOPIC,{device:device,name:name,status:status,ts:Date.now()});
 var g={};try{g=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}
 g[device]={name:name,status:status,ts:Date.now()};localStorage.setItem('acGrants',JSON.stringify(g));
 acNotify(status==='approved'?'✅ Accordé à '+name:status==='revoked'?'⛔ Révoqué : '+name:'❌ Refusé : '+name,'Décision transmise sur l’APK du tiers');
 acAdminRefresh();return ok;}
// ---- Gate UI ----
function acApplyGate(){var g=document.getElementById('gateOverlay');if(!g)return;
 if(acUnlocked()){g.style.display='none';document.body.classList.remove('locked');
  var ap=document.getElementById('adminPanel');if(ap)ap.style.display=(AC.state.role==='admin')?'block':'none';
  if(AC.state.role==='admin')acAdminRefresh();}
 else{g.style.display='flex';document.body.classList.add('locked');
  var st=document.getElementById('gateStatus');if(st)st.textContent=(AC.state.role==='pending')?'⏳ Demande envoyée ('+AC.state.name+') — en attente de validation admin…':'🔒 Application protégée — admin ou demande d’accès';
  var p=document.getElementById('gatePwd');if(p){p.value='';p.setAttribute('autocomplete','new-password');}}}
function acStartPolling(){if(AC.pollTimer)return;
 AC.pollTimer=setInterval(function(){if(!navigator.onLine)return;
  if(AC.state&&AC.state.role==='admin')acAdminRefresh();
  else if(AC.state&&(AC.state.role==='pending'||AC.state.role==='granted'))acCheckDecisions();},45000);}
function acNetWatch(){if(AC.netTimer)return;
 AC.netTimer=setInterval(function(){var el=document.getElementById('connectionStatus');if(!el)return;
  if(!navigator.onLine){el.className='connection-status offline';el.innerHTML='<span class="status-text">Hors ligne — base locale</span>';return;}
  fetch('./',{method:'HEAD',cache:'no-store'}).then(function(r){el.className='connection-status online';el.innerHTML='<span class="status-text">📶 4G/5G/WiFi actif</span>';
   if(window.app&&app.db&&r.ok)syncRecallsFeed(app.db,false).then(function(x){if(x&&x.added){renderRecalls(RECALLS);AC.banner('🔄 Feed : +'+x.added+' cas');}});}).catch(function(){el.className='connection-status offline';el.innerHTML='<span class="status-text">Réseau instable — base locale</span>';});},20000);}
document.addEventListener('DOMContentLoaded',function(){acLoad();
 var p=document.getElementById('gatePwd');if(p){p.value='';p.setAttribute('autocomplete','new-password');p.setAttribute('inputmode','text');}
 acApplyGate();acStartPolling();acNetWatch();acAskNotif();
 console.log('✅ access-control v17.1 actif (role='+AC.state.role+', hash-only)');});
