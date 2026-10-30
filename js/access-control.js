// ================================================================
// CONTRÔLE D’ACCÈS v22.2 — relais : test caché 60 s, messages neutres,
// file d’attente garantie, ⛔ seulement après 3 échecs complets
// ================================================================
var AC={
 RELAYS_DEFAULT:['https://ntfy.sh','https://ntfy.ffmuc.net','https://ntfy.dcs0.hu'],
 REQ:'diag-incendie-kevin-req-83600',DEC:'diag-incendie-kevin-dec-83600',REL:'diag-incendie-kevin-rel-83600',PING:'diag-incendie-kevin-ping-83600',
 ADMIN_HASH:3615734019,state:null,requests:[],pollTimer:null,netTimer:null,tries:0,lockUntil:0,relayIdx:0,queue:[],
 relayStatus:{ok:false,relay:'-',detail:'non testé'},_lastTest:0,_failStreak:0};
function acHash(s){var h=5381;for(var i=0;i<s.length;i++){h=(Math.imul(h,33)+s.charCodeAt(i))|0;}return h>>>0;}
function acDevice(){var d=localStorage.getItem('acDevice');if(!d){d='dev-'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('acDevice',d);}return d;}
function acLoad(){try{AC.state=JSON.parse(localStorage.getItem('acState')||'null')||{role:'locked',name:''};}catch(e){AC.state={role:'locked',name:''};}
 try{AC.queue=JSON.parse(localStorage.getItem('acQueue')||'[]');}catch(e){AC.queue=[];}return AC.state;}
function acSave(){localStorage.setItem('acState',JSON.stringify(AC.state));}
function acSaveQueue(){localStorage.setItem('acQueue',JSON.stringify(AC.queue.slice(-50)));}
function acUnlocked(){return !!(AC.state&&(AC.state.role==='admin'||AC.state.role==='granted'));}
function acRelays(){var out=[];var custom=localStorage.getItem('acRelay');if(custom)out.push(custom);
 AC.RELAYS_DEFAULT.forEach(function(r){if(out.indexOf(r)<0)out.push(r);});return out;}
function acTokens(){try{return JSON.parse(localStorage.getItem('acTokens')||'{}');}catch(e){return {};}}
function acSetCustomRelay(url){if(url&&/^https:\/\/.+/.test(url))localStorage.setItem('acRelay',url.replace(/\/$/,''));else localStorage.removeItem('acRelay');}
function acSetTokens(t){localStorage.setItem('acTokens',JSON.stringify(t||{}));}
AC.banner=function(t){var b=document.getElementById('updateBanner');if(b){b.textContent=t;b.classList.add('show');setTimeout(function(){b.classList.remove('show');},9000);}};
function acNotify(title,body){AC.banner(title+' — '+body);try{if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body:body,tag:'ac-'+Date.now()});}catch(e){}}
function acAskNotif(){try{if('Notification' in window&&Notification.permission!=='granted')Notification.requestPermission();}catch(e){}}
function acMakeSignal(ms){try{if(typeof AbortController==='undefined')return null;
 var c=new AbortController();var t=setTimeout(function(){try{c.abort();}catch(e){}},ms||10000);
 return {sig:c.signal,clear:function(){clearTimeout(t);}};}catch(e){return null;}}
async function acFetch(url,opts,ms){var o={};if(opts)for(var k in opts)o[k]=opts[k];
 var s=acMakeSignal(ms);if(s&&s.sig)o.signal=s.sig;
 try{return await fetch(url,o);}finally{if(s)s.clear();}}
function acHeaders(tokenKey){var h={'Content-Type':'text/plain','Title':'diag-incendie'};var tk=acTokens();
 var v=tokenKey==='req'?tk.req:tokenKey==='dec'?tk.dec:tokenKey==='rel'?tk.rel:'';
 if(v)h['Authorization']='Bearer '+v;return h;}
async function acProbe(base){var e1='',e2='';
 try{var r1=await acFetch(base+'/health',{mode:'cors',cache:'no-store'},8000);return {up:true,status:r1.status};}catch(e){e1=(e&&e.message)||String(e);}
 try{var r2=await acFetch(base+'/',{method:'HEAD',mode:'cors',cache:'no-store'},8000);return {up:true,status:r2.status};}catch(e){e2=(e&&e.message)||String(e);}
 try{var r3=await acFetch(base+'/v1/health',{mode:'cors',cache:'no-store'},6000);return {up:true,status:r3.status};}catch(e){}
 return {up:false,status:0,err:e1+' / '+e2};}
// Test avec CACHE 60 s + secours par publication anonyme
async function acTestChannel(force){var now=Date.now();
 if(!force&&AC._lastTest&&(now-AC._lastTest)<60000)return AC.relayStatus;
 AC._lastTest=now;var relays=acRelays();var detail=[];
 for(var r=0;r<relays.length;r++){var p=await acProbe(relays[r]);
  if(p.up){AC.relayIdx=r;AC._failStreak=0;AC.relayStatus={ok:true,relay:relays[r],detail:detail.concat([relays[r]+' → HTTP '+p.status]).join(' | ')};return AC.relayStatus;}
  detail.push(relays[r]+' → '+(p.err||'down'));}
 for(var r2=0;r2<relays.length;r2++){
  try{var pr=await acFetch(relays[r2]+'/'+encodeURIComponent(AC.PING),{method:'POST',mode:'cors',cache:'no-store',headers:{'Content-Type':'text/plain'},body:'{"ping":1}'},8000);
   if(pr&&pr.ok){AC.relayIdx=r2;AC._failStreak=0;AC.relayStatus={ok:true,relay:relays[r2],detail:'pub anonyme OK '+pr.status};return AC.relayStatus;}}catch(e){}}
 AC._failStreak++;AC.relayStatus={ok:false,relay:'aucun',detail:detail.join(' | ')};return AC.relayStatus;}
function acRelayLabel(){if(AC.relayStatus.ok)return '🟢 Relais : '+AC.relayStatus.relay;
 return (AC._failStreak>=3?'⛔ Relais injoignables (3 essais) — file active':'🟡 Canal en vérification / momentané — file d’attente active');}
async function acPub(topic,tokenKey,obj){AC.queue.push({topic:topic,tk:tokenKey,obj:obj,ts:Date.now()});acSaveQueue();return await acFlush();}
async function acFlush(){var pending=AC.queue.slice();if(!pending.length)return true;var relays=acRelays();var progressed=false;
 for(var i=0;i<pending.length;i++){var m=pending[i];var delivered=false;
  for(var r=0;r<relays.length&&!delivered;r++){var base=relays[(AC.relayIdx+r)%relays.length];
   for(var attempt=0;attempt<2&&!delivered;attempt++){
    try{var headers=acHeaders(m.tk);if(attempt===1)delete headers['Authorization'];
     var resp=await acFetch(base+'/'+encodeURIComponent(m.topic),{method:'POST',mode:'cors',cache:'no-store',headers:headers,body:JSON.stringify(m.obj)},10000);
     if(resp&&resp.ok){delivered=true;AC.relayIdx=(AC.relayIdx+r)%relays.length;AC._failStreak=0;AC.relayStatus={ok:true,relay:base,detail:'pub OK '+resp.status};}
     else if(resp&&resp.status===401&&attempt===0){continue;}
    }catch(e){}}}
  if(delivered){AC.queue=AC.queue.filter(function(x){return x!==m;});progressed=true;}}
 acSaveQueue();return progressed;}
async function acPoll(topic,tokenKey,since){var relays=acRelays();
 for(var r=0;r<relays.length;r++){var base=relays[(AC.relayIdx+r)%relays.length];
  for(var attempt=0;attempt<2;attempt++){
   try{var headers={};var tk=acTokens();var v=tokenKey==='req'?tk.req:tokenKey==='dec'?tk.dec:tk.rel;
    if(v&&attempt===0)headers['Authorization']='Bearer '+v;
    var resp=await acFetch(base+'/'+encodeURIComponent(topic)+'/json?poll=1&since='+(since||'all'),{mode:'cors',cache:'no-store',headers:headers},10000);
    if(resp&&resp.ok){AC.relayIdx=(AC.relayIdx+r)%relays.length;var j=await resp.json();return Array.isArray(j)?j:[];}
    if(resp&&resp.status===401&&attempt===0)continue;
   }catch(e){}}}
 return [];}
function acParse(ev){try{return JSON.parse(ev.message);}catch(e){return null;}}
function acPersistBase(){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}}
async function acRequest(name){if(!name||name.length<2){AC.banner('⚠️ Indiquez un nom ou prénom');return;}
 var t=await acTestChannel(true);var dev=acDevice();
 var sent=t.ok?await acPub(AC.REQ,'req',{device:dev,name:name,ts:Date.now(),ua:(navigator.userAgent||'').slice(0,60)}):false;
 AC.state={role:'pending',name:name,device:dev,since:Date.now(),feedVersion:AC.state&&AC.state.feedVersion||0};acSave();acApplyGate();acStartPolling();
 AC.banner(sent?'📨 Demande envoyée ('+name+') via '+t.relay:'📡 Demande en file ('+name+') — envoi auto dès relais disponible');}
async function acCheckDecisions(){var evs=await acPoll(AC.DEC,'dec',AC.state&&AC.state.since?Math.floor(AC.state.since/1000)-180:'all');
 var dev=acDevice(),nm=AC.state&&AC.state.name?seNorm(AC.state.name):'';
 evs.forEach(function(ev){var d=acParse(ev);if(!d)return;if(d.device!==dev&&!(nm&&d.name&&seNorm(d.name)===nm))return;
  if(d.status==='approved'){AC.state.role='granted';AC.state.name=d.name||AC.state.name;AC.state.since=Date.now();acSave();acNotify('✅ Accès accordé','Bienvenue '+AC.state.name);acApplyGate();}
  else if(d.status==='refused'){AC.state={role:'locked',name:'',since:Date.now()};acSave();acNotify('❌ Accès refusé','Par l’administrateur');acApplyGate();}
  else if(d.status==='revoked'){AC.state={role:'locked',name:'',since:Date.now()};acSave();acNotify('⛔ Accès révoqué','Par l’administrateur');acApplyGate();}});}
async function acCheckReleases(){var evs=await acPoll(AC.REL,'rel','30d');var latest=null;
 evs.forEach(function(ev){var d=acParse(ev);if(d&&d.type==='release'&&d.validated){if(!latest||d.version>latest.version)latest=d;}});
 if(latest&&(!AC.state.feedVersion||latest.version>AC.state.feedVersion)){
  try{var r=await acFetch('data/recalls-feed.json?v='+Date.now(),{cache:'no-store'},10000);if(r&&r.ok){var feed=await r.json();
   if(window.applyFeedMerge){var added=applyFeedMerge(feed);AC.state.feedVersion=latest.version;acSave();
    acNotify('🔄 Mise à jour appliquée','v'+latest.version+' (+'+added+' cas)');
    if(typeof renderRecalls==='function')renderRecalls(RECALLS);if(window.app&&app.stats)app.stats();}}}catch(e){}}}
async function acAdminLogin(pw){if(Date.now()<AC.lockUntil){AC.banner('⛔ Trop de tentatives — '+Math.ceil((AC.lockUntil-Date.now())/1000)+' s');return false;}
 var input=document.getElementById('gatePwd');var ok=acHash(String(pw||''))===AC.ADMIN_HASH;if(input)input.value='';
 if(ok){AC.tries=0;AC.state={role:'admin',name:'Kevin',since:Date.now(),feedVersion:AC.state&&AC.state.feedVersion||0};acSave();acAskNotif();acApplyGate();acStartPolling();
  acTestChannel(true);return true;}
 AC.tries++;if(AC.tries>=5){AC.lockUntil=Date.now()+30000;AC.tries=0;AC.banner('⛔ 5 échecs — verrou 30 s');}return false;}
async function acAdminRefresh(){var evs=await acPoll(AC.REQ,'req','all');var map={};evs.forEach(function(ev){var d=acParse(ev);if(d&&d.device)map[d.device]=d;});
 var grants={};try{grants=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}
 AC.requests=Object.keys(map).map(function(k){var d=map[k];d.grant=grants[k]||null;return d;}).sort(function(a,b){return b.ts-a.ts;});
 var prev=localStorage.getItem('acReqCount')||'0';if(AC.requests.length>parseInt(prev,10)&&AC.requests[0])acNotify('🔔 Nouvelle demande',AC.requests[0].name);
 localStorage.setItem('acReqCount',String(AC.requests.length));await acFlush();if(typeof renderAdmin==='function')renderAdmin();}
async function acDecide(device,name,status){var sent=await acPub(AC.DEC,'dec',{device:device,name:name,status:status,ts:Date.now()});
 var g={};try{g=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}g[device]={name:name,status:status,ts:Date.now()};localStorage.setItem('acGrants',JSON.stringify(g));
 acNotify(status==='approved'?'✅ Accordé : '+name:status==='revoked'?'⛔ Révoqué : '+name:'❌ Refusé : '+name,sent?'Notifié au tiers':'📡 En file — renvoi auto');acAdminRefresh();return sent;}
async function acValidateRelease(version){var v=parseInt(version||'0',10);if(!v){AC.banner('⚠️ Version invalide');return;}
 var sent=await acPub(AC.REL,'rel',{type:'release',version:v,validated:true,ts:Date.now()});
 AC.state.feedVersion=v;acSave();AC.banner(sent?'✅ v'+v+' diffusée aux tiers':'📡 v'+v+' en file — diffusion auto');}
function acApplyGate(){var g=document.getElementById('gateOverlay');if(!g)return;
 if(acUnlocked()){g.style.display='none';document.body.classList.remove('locked');var ap=document.getElementById('adminPanel');if(ap)ap.style.display=(AC.state.role==='admin')?'block':'none';
  if(AC.state.role==='admin'){acAdminRefresh();var rc=document.getElementById('relayStatus');
   if(rc)rc.innerHTML=acRelayLabel()+' <small style="opacity:.75">('+esc15(AC.relayStatus.detail||'')+')</small>';}}
 else{g.style.display='flex';document.body.classList.add('locked');var st=document.getElementById('gateStatus');
  if(st)st.textContent=(AC.state.role==='pending')?'⏳ Demande '+(AC.queue.length?'en file ('+AC.queue.length+') ':'envoyée ')+'('+AC.state.name+') — attente admin…':'🔒 Application protégée — admin ou demande d’accès';
  var p=document.getElementById('gatePwd');if(p){p.value='';p.placeholder='Mot de passe';p.setAttribute('autocomplete','new-password');}}}
function acStartPolling(){if(AC.pollTimer)return;AC.pollTimer=setInterval(function(){if(!navigator.onLine)return;
 acTestChannel(false).then(function(){var rc=document.getElementById('relayStatus');if(rc&&AC.state&&AC.state.role==='admin')rc.innerHTML=acRelayLabel()+' <small style="opacity:.75">('+esc15(AC.relayStatus.detail||'')+')</small>';});
 acFlush();
 if(AC.state&&AC.state.role==='admin')acAdminRefresh();else if(AC.state){acCheckDecisions();acCheckReleases();}},30000);}
function acNetWatch(){if(AC.netTimer)return;AC.netTimer=setInterval(function(){var el=document.getElementById('connectionStatus');if(!el)return;
 if(!navigator.onLine){el.className='connection-status offline';el.innerHTML='<span class="status-text">Hors ligne — base locale</span>';return;}
 acFetch('./',{method:'HEAD',cache:'no-store'},8000).then(function(r){el.className='connection-status online';el.innerHTML='<span class="status-text">📶 4G/5G/WiFi permanent</span>';
  if(window.app&&app.db&&r.ok)syncRecallsFeed(app.db,false).then(function(x){if(x&&x.added){if(typeof renderRecalls==='function')renderRecalls(RECALLS);AC.banner('🔄 MàJ 30 j : +'+x.added+' cas');if(window.updateFeedInfo)updateFeedInfo();}});}).catch(function(){el.className='connection-status offline';el.innerHTML='<span class="status-text">Réseau instable</span>';});},15000);}
document.addEventListener('DOMContentLoaded',function(){acLoad();acPersistBase();var p=document.getElementById('gatePwd');if(p){p.value='';p.placeholder='Mot de passe';p.setAttribute('autocomplete','new-password');}
 acApplyGate();acStartPolling();acNetWatch();acAskNotif();
 acTestChannel(true).then(function(t){console.log('✅ canal v22.2 :',(t.ok?'OK '+t.relay:'file active — '+t.detail));});
 console.log('✅ access-control v22.2 (relais non-bloquant, cache 60 s, file garantie)');});
