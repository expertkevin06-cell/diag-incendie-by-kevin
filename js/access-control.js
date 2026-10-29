// ================================================================
// CONTRÔLE D’ACCÈS v20.1 — canal notifications STRICT & redondant
// (demande / accord / refus / révocation) — multi-relais ntfy + queue
// ================================================================
var AC={
 RELAYS:['https://ntfy.sh','https://ntfr.frontend.dev','https://ntfy.zwieback.dev'],
 REQ:'diag-incendie-kevin-req-83600',DEC:'diag-incendie-kevin-dec-83600',REL:'diag-incendie-kevin-rel-83600',
 TK_REQ:'tk_req_kevin83600_diagincendie',TK_DEC:'tk_dec_kevin83600_diagincendie',TK_REL:'tk_rel_kevin83600_diagincendie',
 ADMIN_HASH:3615734019,state:null,requests:[],pollTimer:null,netTimer:null,tries:0,lockUntil:0,relayIdx:0,queue:[]};
function acHash(s){var h=5381;for(var i=0;i<s.length;i++){h=(Math.imul(h,33)+s.charCodeAt(i))|0;}return h>>>0;}
function acDevice(){var d=localStorage.getItem('acDevice');if(!d){d='dev-'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('acDevice',d);}return d;}
function acLoad(){try{AC.state=JSON.parse(localStorage.getItem('acState')||'null')||{role:'locked',name:''};}catch(e){AC.state={role:'locked',name:''};}
 try{AC.queue=JSON.parse(localStorage.getItem('acQueue')||'[]');}catch(e){AC.queue=[];}return AC.state;}
function acSave(){localStorage.setItem('acState',JSON.stringify(AC.state));}
function acSaveQueue(){localStorage.setItem('acQueue',JSON.stringify(AC.queue.slice(-50)));}
function acUnlocked(){return !!(AC.state&&(AC.state.role==='admin'||AC.state.role==='granted'));}
AC.banner=function(t){var b=document.getElementById('updateBanner');if(b){b.textContent=t;b.classList.add('show');setTimeout(function(){b.classList.remove('show');},9000);}};
function acNotify(title,body){AC.banner(title+' — '+body);try{if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body:body,tag:'ac-'+Date.now()});}catch(e){}}
function acAskNotif(){try{if('Notification' in window&&Notification.permission!=='granted')Notification.requestPermission();}catch(e){}}
// ---- Canal strict : publie sur les relais jusqu’à succès (avec jeton) ----
async function acPub(topic,token,obj){AC.queue.push({topic:topic,token:token,obj:obj,ts:Date.now()});acSaveQueue();return await acFlush();}
async function acFlush(){var pending=AC.queue.slice();var ok=0;
 for(var i=0;i<pending.length;i++){var m=pending[i];var delivered=false;
  for(var r=0;r<AC.RELAYS.length;r++){var base=AC.RELAYS[(AC.relayIdx+r)%AC.RELAYS.length];
   try{var ctrl=new AbortController();var to=setTimeout(function(){ctrl.abort();},10000);
    var resp=await fetch(base+'/'+encodeURIComponent(m.topic),{method:'POST',mode:'cors',cache:'no-store',signal:ctrl.signal,
     headers:{'Authorization':'Bearer '+m.token,'Content-Type':'text/plain','Title':'diag-incendie'},body:JSON.stringify(m.obj)});
    clearTimeout(to);
    if(resp&&resp.ok){delivered=true;AC.relayIdx=(AC.relayIdx+r)%AC.RELAYS.length;break;}
   }catch(e){}}
  if(delivered){AC.queue=AC.queue.filter(function(x){return x!==m;});ok++;}}
 acSaveQueue();return ok>0||pending.length===0;}
async function acPoll(topic,token,since){var lastErr=null;
 for(var r=0;r<AC.RELAYS.length;r++){var base=AC.RELAYS[(AC.relayIdx+r)%AC.RELAYS.length];
  try{var ctrl=new AbortController();var to=setTimeout(function(){ctrl.abort();},10000);
   var resp=await fetch(base+'/'+encodeURIComponent(topic)+'/json?poll=1&since='+(since||'all'),{mode:'cors',cache:'no-store',signal:ctrl.signal,headers:{'Authorization':'Bearer '+token}});
   clearTimeout(to);
   if(resp&&resp.ok){var j=await resp.json();AC.relayIdx=(AC.relayIdx+r)%AC.RELAYS.length;return Array.isArray(j)?j:[];}
   lastErr='HTTP '+(resp?resp.status:'?');
  }catch(e){lastErr=e.message;}}
 console.warn('acPoll KO ('+topic+') :',lastErr);return [];}
function acParse(ev){try{return JSON.parse(ev.message);}catch(e){return null;}}
function acPersistBase(){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}}
async function acTestChannel(){var ok=false,idx=-1;
 for(var r=0;r<AC.RELAYS.length;r++){try{var resp=await fetch(AC.RELAYS[r]+'/health',{mode:'cors',cache:'no-store'});if(resp&&resp.ok){ok=true;idx=r;break;}}catch(e){}}
 AC.relayIdx=ok?idx:0;return {ok:ok,relay:ok?AC.RELAYS[idx]:'aucun',queue:AC.queue.length};}
// ---- Tiers ----
async function acRequest(name){if(!name||name.length<2){AC.banner('⚠️ Indiquez un nom ou prénom');return;}
 var t=await acTestChannel();if(!t.ok){AC.banner(' Relais injoignables — vérifiez 4G/5G/WiFi puis réessayez');return;}
 var dev=acDevice();var sent=await acPub(AC.REQ,AC.TK_REQ,{device:dev,name:name,ts:Date.now(),ua:(navigator.userAgent||'').slice(0,60)});
 AC.state={role:'pending',name:name,device:dev,since:Date.now(),feedVersion:AC.state&&AC.state.feedVersion||0};acSave();acApplyGate();acStartPolling();
 AC.banner(sent?'📨 Demande envoyée via '+AC.RELAYS[AC.relayIdx]+' ('+name+')'+(AC.queue.length?' — '+AC.queue.length+' en attente':''):'⚠️ Échec envoi — sera rejoué automatiquement');}
async function acCheckDecisions(){var evs=await acPoll(AC.DEC,AC.TK_DEC,AC.state&&AC.state.since?Math.floor(AC.state.since/1000)-180:'all');
 var dev=acDevice(),nm=AC.state&&AC.state.name?seNorm(AC.state.name):'';
 evs.forEach(function(ev){var d=acParse(ev);if(!d)return;var matchDev=d.device===dev;var matchName=nm&&d.name&&seNorm(d.name)===nm;
  if(!matchDev&&!matchName)return;
  if(d.status==='approved'){AC.state.role='granted';AC.state.name=d.name||AC.state.name;AC.state.since=Date.now();acSave();acNotify('✅ Accès accordé','Bienvenue '+AC.state.name);acApplyGate();}
  else if(d.status==='refused'){AC.state={role:'locked',name:'',since:Date.now()};acSave();acNotify('❌ Accès refusé','Par l’administrateur');acApplyGate();}
  else if(d.status==='revoked'){AC.state={role:'locked',name:'',since:Date.now()};acSave();acNotify('⛔ Accès révoqué','Par l’administrateur');acApplyGate();}});}
async function acCheckReleases(){var evs=await acPoll(AC.REL,AC.TK_REL,'30d');var latest=null;
 evs.forEach(function(ev){var d=acParse(ev);if(d&&d.type==='release'&&d.validated){if(!latest||d.version>latest.version)latest=d;}});
 if(latest&&(!AC.state.feedVersion||latest.version>AC.state.feedVersion)){
  try{var r=await fetch('data/recalls-feed.json?v='+Date.now(),{cache:'no-store'});if(r.ok){var feed=await r.json();
   if(window.applyFeedMerge){var added=applyFeedMerge(feed);AC.state.feedVersion=latest.version;acSave();
    acNotify('🔄 Mise à jour appliquée','v'+latest.version+' (+'+added+' cas) — validée admin');
    if(typeof renderRecalls==='function')renderRecalls(RECALLS);if(window.app&&app.stats)app.stats();}}}catch(e){}}}
// ---- Admin ----
async function acAdminLogin(pw){if(Date.now()<AC.lockUntil){AC.banner('⛔ Trop de tentatives — '+Math.ceil((AC.lockUntil-Date.now())/1000)+' s');return false;}
 var input=document.getElementById('gatePwd');var ok=acHash(String(pw||''))===AC.ADMIN_HASH;if(input)input.value='';
 if(ok){AC.tries=0;var t=await acTestChannel();AC.state={role:'admin',name:'Kevin',since:Date.now(),feedVersion:AC.state&&AC.state.feedVersion||0,relayOk:t.ok};acSave();acAskNotif();acApplyGate();acStartPolling();
  AC.banner(t.ok?'🟢 Canal notifications opérationnel ('+AC.RELAYS[AC.relayIdx]+')':'⛔ Relais injoignables — vérifiez le réseau');return true;}
 AC.tries++;if(AC.tries>=5){AC.lockUntil=Date.now()+30000;AC.tries=0;AC.banner('⛔ 5 échecs — verrou 30 s');}return false;}
async function acAdminRefresh(){var evs=await acPoll(AC.REQ,AC.TK_REQ,'all');var map={};
 evs.forEach(function(ev){var d=acParse(ev);if(d&&d.device)map[d.device]=d;});
 var grants={};try{grants=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}
 AC.requests=Object.keys(map).map(function(k){var d=map[k];d.grant=grants[k]||null;return d;}).sort(function(a,b){return b.ts-a.ts;});
 var prev=localStorage.getItem('acReqCount')||'0';
 if(AC.requests.length>parseInt(prev,10)&&AC.requests[0])acNotify('🔔 Nouvelle demande d’accès',AC.requests[0].name+' ('+AC.requests[0].device.slice(0,8)+')');
 localStorage.setItem('acReqCount',String(AC.requests.length));
 await acFlush();
 if(typeof renderAdmin==='function')renderAdmin();}
async function acDecide(device,name,status){var sent=await acPub(AC.DEC,AC.TK_DEC,{device:device,name:name,status:status,ts:Date.now()});
 var g={};try{g=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}g[device]={name:name,status:status,ts:Date.now()};localStorage.setItem('acGrants',JSON.stringify(g));
 acNotify(status==='approved'?'✅ Accordé : '+name:status==='revoked'?'⛔ Révoqué : '+name:'❌ Refusé : '+name,sent?'Notifié au tiers via '+AC.RELAYS[AC.relayIdx]:'⚠️ En attente de relais (rejoué auto)');
 acAdminRefresh();return sent;}
async function acValidateRelease(version){var v=parseInt(version||'0',10);if(!v){AC.banner('⚠️ Version invalide');return;}
 var sent=await acPub(AC.REL,AC.TK_REL,{type:'release',version:v,validated:true,ts:Date.now()});
 AC.state.feedVersion=v;acSave();acNotify('📡 Mise à jour v'+v+' diffusée',sent?'Les tiers l’appliqueront automatiquement':'En attente relais');AC.banner(sent?'✅ v'+v+' validée & diffusée':'⚠️ v'+v+' validée — diffusion en attente de relais');}
// ---- Gate UI ----
function acApplyGate(){var g=document.getElementById('gateOverlay');if(!g)return;
 if(acUnlocked()){g.style.display='none';document.body.classList.remove('locked');
  var ap=document.getElementById('adminPanel');if(ap)ap.style.display=(AC.state.role==='admin')?'block':'none';
  if(AC.state.role==='admin'){acAdminRefresh();var rc=document.getElementById('relayStatus');if(rc)rc.textContent=AC.state.relayOk?'🟢 Relais OK ('+AC.RELAYS[AC.relayIdx]+')':'⛔ Relais injoignable';}}
 else{g.style.display='flex';document.body.classList.add('locked');
  var st=document.getElementById('gateStatus');if(st)st.textContent=(AC.state.role==='pending')?'⏳ Demande envoyée ('+AC.state.name+') — attente validation admin… (relais '+AC.RELAYS[AC.relayIdx]+', '+AC.queue.length+' en file)':'🔒 Application protégée — admin ou demande d’accès';
  var p=document.getElementById('gatePwd');if(p){p.value='';p.placeholder='Mot de passe';p.setAttribute('autocomplete','new-password');}}}
function acStartPolling(){if(AC.pollTimer)return;
 AC.pollTimer=setInterval(function(){if(!navigator.onLine){return;}
  acFlush();
  if(AC.state&&AC.state.role==='admin')acAdminRefresh();
  else if(AC.state){acCheckDecisions();acCheckReleases();}},30000);}
function acNetWatch(){if(AC.netTimer)return;
 AC.netTimer=setInterval(function(){var el=document.getElementById('connectionStatus');if(!el)return;
  if(!navigator.onLine){el.className='connection-status offline';el.innerHTML='<span class="status-text">Hors ligne — base locale</span>';return;}
  fetch('./',{method:'HEAD',cache:'no-store'}).then(function(r){el.className='connection-status online';el.innerHTML='<span class="status-text">📶 4G/5G/WiFi permanent</span>';
   if(window.app&&app.db&&r.ok)syncRecallsFeed(app.db,false).then(function(x){if(x&&x.added&&AC.state&&AC.state.role==='admin')AC.banner('🔄 Nouveau feed v'+x.version+' — validez sa diffusion');});}).catch(function(){el.className='connection-status offline';el.innerHTML='<span class="status-text">Réseau instable</span>';});},15000);}
document.addEventListener('DOMContentLoaded',function(){acLoad();acPersistBase();
 var p=document.getElementById('gatePwd');if(p){p.value='';p.placeholder='Mot de passe';p.setAttribute('autocomplete','new-password');}
 acApplyGate();acStartPolling();acNetWatch();acAskNotif();acTestChannel().then(function(t){console.log('✅ canal v20.1 :',(t.ok?'OK ':'KO ')+t.relay+' (file='+t.queue+')');});
 console.log('✅ access-control v20.1 (multi-relais + queue, role='+AC.state.role+')');});
