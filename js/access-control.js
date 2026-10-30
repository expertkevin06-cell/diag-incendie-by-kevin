// ================================================================
// CONTRÔLE D’ACCÈS v24 — REGISTRE FUSIONNÉ GitHub Issues + ntfy
// Le panneau admin voit TOUTES les demandes, quel que soit le transport
// ================================================================
var AC={
 MB:{OWNER:'expertkevin06-cell',REPO:'diag-incendie',TOKEN:''},
 RELAYS_DEFAULT:['https://ntfy.sh','https://ntfy.ffmuc.net','https://ntfy.dcs0.hu'],
 REQ:'diag-incendie-kevin-req-83600',DEC:'diag-incendie-kevin-dec-83600',REL:'diag-incendie-kevin-rel-83600',PING:'diag-incendie-kevin-ping-83600',
 ADMIN_HASH:3615734019,state:null,requests:[],registry:{},pollTimer:null,netTimer:null,tries:0,lockUntil:0,relayIdx:0,queue:[],
 relayStatus:{ok:false,relay:'-',detail:'non testé'},_lastTest:0,_failStreak:0};
function acHash(s){var h=5381;for(var i=0;i<s.length;i++){h=(Math.imul(h,33)+s.charCodeAt(i))|0;}return h>>>0;}
function acDevice(){var d=localStorage.getItem('acDevice');if(!d){d='dev-'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('acDevice',d);}return d;}
function acLoad(){try{AC.state=JSON.parse(localStorage.getItem('acState')||'null')||{role:'locked',name:''};}catch(e){AC.state={role:'locked',name:''};}
 try{AC.queue=JSON.parse(localStorage.getItem('acQueue')||'[]');}catch(e){AC.queue=[];}
 try{AC.registry=JSON.parse(localStorage.getItem('acReqRegistry')||'{}');}catch(e){AC.registry={};}return AC.state;}
function acSave(){localStorage.setItem('acState',JSON.stringify(AC.state));}
function acSaveQueue(){localStorage.setItem('acQueue',JSON.stringify(AC.queue.slice(-50)));}
function acSaveRegistry(){var ks=Object.keys(AC.registry).sort(function(a,b){return AC.registry[b].ts-AC.registry[a].ts;}).slice(0,200);
 var o={};ks.forEach(function(k){o[k]=AC.registry[k];});AC.registry=o;localStorage.setItem('acReqRegistry',JSON.stringify(o));}
function acUnlocked(){return !!(AC.state&&(AC.state.role==='admin'||AC.state.role==='granted'));}
function acRelays(){var out=[];var c=localStorage.getItem('acRelay');if(c)out.push(c);AC.RELAYS_DEFAULT.forEach(function(r){if(out.indexOf(r)<0)out.push(r);});return out;}
function acTokens(){try{return JSON.parse(localStorage.getItem('acTokens')||'{}');}catch(e){return {};}}
function acSetCustomRelay(u){if(u&&/^https:\/\/.+/.test(u))localStorage.setItem('acRelay',u.replace(/\/$/,''));else localStorage.removeItem('acRelay');}
function acSetTokens(t){localStorage.setItem('acTokens',JSON.stringify(t||{}));}
AC.banner=function(t){var b=document.getElementById('updateBanner');if(b){b.textContent=t;b.classList.add('show');setTimeout(function(){b.classList.remove('show');},9000);}};
function acNotify(title,body){AC.banner(title+' — '+body);try{if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body:body,tag:'ac-'+Date.now()});}catch(e){}}
function acAskNotif(){try{if('Notification' in window&&Notification.permission!=='granted')Notification.requestPermission();}catch(e){}}
function acMakeSignal(ms){try{if(typeof AbortController==='undefined')return null;var c=new AbortController();var t=setTimeout(function(){try{c.abort();}catch(e){}},ms||10000);return {sig:c.signal,clear:function(){clearTimeout(t);}};}catch(e){return null;}}
async function acFetch(url,opts,ms){var o={};if(opts)for(var k in opts)o[k]=opts[k];var s=acMakeSignal(ms);if(s&&s.sig)o.signal=s.sig;try{return await fetch(url,o);}finally{if(s)s.clear();}}
// ---- GitHub Issues ----
function ghUrl(p){return 'https://api.github.com/repos/'+AC.MB.OWNER+'/'+AC.MB.REPO+p;}
function ghAuth(h){if(AC.MB.TOKEN)h['Authorization']='Bearer '+AC.MB.TOKEN;return h;}
async function ghCreateIssue(payload){if(!AC.MB.TOKEN)return null;
 try{var r=await acFetch(ghUrl('/issues'),{method:'POST',mode:'cors',cache:'no-store',headers:ghAuth({'Content-Type':'application/json','Accept':'application/vnd.github+json'}),body:JSON.stringify({title:'ACCESS-REQUEST '+payload.name,body:JSON.stringify(payload),labels:['access']})},12000);
 if(r&&r.ok){var j=await r.json();return j.number;}}catch(e){}return null;}
async function ghListIssues(){try{var r=await acFetch(ghUrl('/issues?labels=access&state=all&per_page=100'),{mode:'cors',cache:'no-store',headers:{'Accept':'application/vnd.github+json'}},12000);
 if(r&&r.ok)return await r.json();}catch(e){}return [];}
async function ghComments(num){try{var r=await acFetch(ghUrl('/issues/'+num+'/comments'),{mode:'cors',cache:'no-store',headers:{'Accept':'application/vnd.github+json'}},12000);
 if(r&&r.ok)return await r.json();}catch(e){}return [];}
async function ghComment(num,payload){if(!AC.MB.TOKEN||!num)return false;
 try{var r=await acFetch(ghUrl('/issues/'+num+'/comments'),{method:'POST',mode:'cors',cache:'no-store',headers:ghAuth({'Content-Type':'application/json','Accept':'application/vnd.github+json'}),body:JSON.stringify({body:JSON.stringify(payload)})},12000);
 return !!(r&&r.ok);}catch(e){return false;}}
// ---- ntfy ----
function acHeaders(tk){var h={'Content-Type':'text/plain','Title':'diag-incendie'};var t=acTokens();var v=tk==='req'?t.req:tk==='dec'?t.dec:t.rel;if(v)h['Authorization']='Bearer '+v;return h;}
async function acProbe(base){try{var r1=await acFetch(base+'/health',{mode:'cors',cache:'no-store'},8000);return {up:true,status:r1.status};}catch(e){}
 try{var r2=await acFetch(base+'/',{method:'HEAD',mode:'cors',cache:'no-store'},8000);return {up:true,status:r2.status};}catch(e){}
 return {up:false,status:0,err:'sondes KO'};}
async function acTestChannel(force){var now=Date.now();if(!force&&AC._lastTest&&(now-AC._lastTest)<60000)return AC.relayStatus;AC._lastTest=now;
 var relays=acRelays(),detail=[];
 for(var r=0;r<relays.length;r++){var p=await acProbe(relays[r]);if(p.up){AC.relayIdx=r;AC._failStreak=0;AC.relayStatus={ok:true,relay:relays[r],detail:relays[r]+' → HTTP '+p.status};return AC.relayStatus;}detail.push(relays[r]+' → down');}
 AC._failStreak++;AC.relayStatus={ok:false,relay:'aucun',detail:detail.join(' | ')};return AC.relayStatus;}
async function acPub(topic,tk,obj){AC.queue.push({topic:topic,tk:tk,obj:obj,ts:Date.now()});acSaveQueue();return await acFlush();}
async function acFlush(){var pending=AC.queue.slice();if(!pending.length)return true;var relays=acRelays(),progressed=false;
 for(var i=0;i<pending.length;i++){var m=pending[i],delivered=false;
  for(var r=0;r<relays.length&&!delivered;r++){var base=relays[(AC.relayIdx+r)%relays.length];
   try{var resp=await acFetch(base+'/'+encodeURIComponent(m.topic),{method:'POST',mode:'cors',cache:'no-store',headers:acHeaders(m.tk),body:JSON.stringify(m.obj)},10000);
    if(resp&&resp.ok){delivered=true;AC.relayIdx=(AC.relayIdx+r)%relays.length;}}catch(e){}}
  if(delivered){AC.queue=AC.queue.filter(function(x){return x!==m;});progressed=true;}}
 acSaveQueue();return progressed;}
async function acPoll(topic,tk,since){var relays=acRelays();
 for(var r=0;r<relays.length;r++){var base=relays[(AC.relayIdx+r)%relays.length];
  try{var resp=await acFetch(base+'/'+encodeURIComponent(topic)+'/json?poll=1&since='+(since||'all'),{mode:'cors',cache:'no-store',headers:acHeaders(tk)},10000);
   if(resp&&resp.ok){var j=await resp.json();return Array.isArray(j)?j:[];}}catch(e){}}
 return [];}
function acParse(ev){try{return JSON.parse(ev.message||ev.body||'{}');}catch(e){return null;}}
function acPersistBase(){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}}
function acRegister(d,source,issue){if(!d||!d.device)return;var old=AC.registry[d.device]||{};
 AC.registry[d.device]={device:d.device,name:d.name||old.name||'?',ts:Math.max(d.ts||0,old.ts||0),ua:d.ua||old.ua||'',issue:issue||old.issue||null,source:source};
 acSaveRegistry();}
// ---- Tiers ----
async function acRequest(name){if(!name||name.length<2){AC.banner('⚠️ Indiquez un nom ou prénom');return;}
 var dev=acDevice();var payload={device:dev,name:name,ts:Date.now(),ua:(navigator.userAgent||'').slice(0,60)};
 var issue=await ghCreateIssue(payload);
 var ntfyOk=false;{var t=await acTestChannel(true);ntfyOk=t.ok?await acPub(AC.REQ,'req',payload):false;}
 AC.state={role:'pending',name:name,device:dev,since:Date.now(),issue:issue,feedVersion:AC.state&&AC.state.feedVersion||0};acSave();acApplyGate();acStartPolling();
 AC.banner(issue?'📨 Demande envoyée (ticket #'+issue+')':(ntfyOk?'📨 Demande envoyée via relais ntfy':'📡 Demande en file — renvoi auto'));}
async function acCheckDecisions(){
 if(AC.state&&AC.state.issue){var cs=await ghComments(AC.state.issue);
  for(var i=0;i<cs.length;i++){var d=acParse(cs[i]);if(d&&d.status)applyDecision(d);}}
 var evs=await acPoll(AC.DEC,'dec',AC.state&&AC.state.since?Math.floor(AC.state.since/1000)-180:'all');
 evs.forEach(function(ev){var d=acParse(ev);if(d&&d.device===acDevice())applyDecision(d);});}
function applyDecision(d){
 if(d.status==='approved'){AC.state.role='granted';AC.state.name=d.name||AC.state.name;AC.state.since=Date.now();acSave();acNotify('✅ Accès accordé','Bienvenue '+AC.state.name);acApplyGate();}
 else if(d.status==='refused'){AC.state={role:'locked',name:'',since:Date.now()};acSave();acNotify('❌ Accès refusé','Par l’administrateur');acApplyGate();}
 else if(d.status==='revoked'){AC.state={role:'locked',name:'',since:Date.now()};acSave();acNotify('⛔ Accès révoqué','Par l’administrateur');acApplyGate();}}
async function acCheckReleases(){var evs=await acPoll(AC.REL,'rel','30d');var latest=null;
 evs.forEach(function(ev){var d=acParse(ev);if(d&&d.type==='release'&&d.validated){if(!latest||d.version>latest.version)latest=d;}});
 if(latest&&(!AC.state.feedVersion||latest.version>AC.state.feedVersion)){
  try{var r=await acFetch('data/recalls-feed.json?v='+Date.now(),{cache:'no-store'},10000);if(r&&r.ok){var feed=await r.json();
   if(window.applyFeedMerge){var added=applyFeedMerge(feed);if(window.applyFeedCatalog)added+=applyFeedCatalog(feed);AC.state.feedVersion=latest.version;acSave();
    acNotify('🔄 Mise à jour appliquée','v'+latest.version+' (+'+added+')');if(typeof renderRecalls==='function')renderRecalls(RECALLS);}}}catch(e){}}}
// ---- Admin : REGISTRE FUSIONNÉ GitHub + ntfy ----
async function acAdminRefresh(){
 var list=await ghListIssues();
 list.forEach(function(it){var d=null;try{d=JSON.parse(it.body);}catch(e){}
  if(d&&d.device)acRegister(d,'github',it.number);});
 var evs=await acPoll(AC.REQ,'req','all');
 evs.forEach(function(ev){var d=acParse(ev);if(d&&d.device)acRegister(d,'ntfy',d.issue||null);});
 var grants={};try{grants=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}
 AC.requests=Object.keys(AC.registry).map(function(k){var d=AC.registry[k];d.grant=grants[k]||null;d.status=grants[k]?grants[k].status:'new';return d;})
  .sort(function(a,b){return b.ts-a.ts;});
 var prev=localStorage.getItem('acReqCount')||'0';
 if(AC.requests.length>parseInt(prev,10)&&AC.requests[0])acNotify('🔔 Nouvelle demande',AC.requests[0].name);
 localStorage.setItem('acReqCount',String(AC.requests.length));
 await acFlush();
 if(typeof renderAdmin==='function')renderAdmin();}
async function acDecide(device,name,status,issue){
 var okGh=await ghComment(issue||((AC.registry[device]||{}).issue),{device:device,name:name,status:status,ts:Date.now()});
 var okNtfy=await acPub(AC.DEC,'dec',{device:device,name:name,status:status,ts:Date.now()});
 var g={};try{g=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}g[device]={name:name,status:status,ts:Date.now()};localStorage.setItem('acGrants',JSON.stringify(g));
 if(AC.registry[device])AC.registry[device].status=status;acSaveRegistry();
 acNotify(status==='approved'?'✅ Accordé : '+name:status==='revoked'?'⛔ Révoqué : '+name:'❌ Refusé : '+name,(okGh?'ticket + ':'')+(okNtfy?'relais':'file'));
 acAdminRefresh();return okGh||okNtfy;}
async function acValidateRelease(version){var v=parseInt(version||'0',10);if(!v)return;
 await acPub(AC.REL,'rel',{type:'release',version:v,validated:true,ts:Date.now()});AC.state.feedVersion=v;acSave();AC.banner('✅ v'+v+' diffusée');}
function acApplyGate(){var g=document.getElementById('gateOverlay');if(!g)return;
 if(acUnlocked()){g.style.display='none';document.body.classList.remove('locked');var ap=document.getElementById('adminPanel');if(ap)ap.style.display=(AC.state.role==='admin')?'block':'none';
  if(AC.state.role==='admin'){acAdminRefresh();var rc=document.getElementById('relayStatus');
   if(rc)rc.innerHTML='🟢 Canal demandes : <strong>GitHub Issues + ntfy</strong> (registre fusionné) — '+(AC.MB.TOKEN?'jeton GH configuré':'jeton GH optionnel');}}
 else{g.style.display='flex';document.body.classList.add('locked');var st=document.getElementById('gateStatus');
  if(st)st.textContent=(AC.state.role==='pending')?'⏳ Demande '+(AC.state.issue?'ticket #'+AC.state.issue:'envoyée')+' ('+AC.state.name+') — attente admin…':'🔒 Application protégée — admin ou demande d’accès';
  var p=document.getElementById('gatePwd');if(p){p.value='';p.placeholder='Mot de passe';p.setAttribute('autocomplete','new-password');}}}
function acStartPolling(){if(AC.pollTimer)return;AC.pollTimer=setInterval(function(){if(!navigator.onLine)return;acFlush();
 if(AC.state&&AC.state.role==='admin')acAdminRefresh();else if(AC.state){acCheckDecisions();acCheckReleases();}},30000);}
function acNetWatch(){if(AC.netTimer)return;AC.netTimer=setInterval(function(){var el=document.getElementById('connectionStatus');if(!el)return;
 if(!navigator.onLine){el.className='connection-status offline';el.innerHTML='<span class="status-text">Hors ligne — base locale</span>';return;}
 acFetch('./',{method:'HEAD',cache:'no-store'},8000).then(function(r){el.className='connection-status online';el.innerHTML='<span class="status-text">📶 4G/5G/WiFi permanent</span>';
  if(window.app&&app.db&&r.ok)syncRecallsFeed(app.db,false).then(function(x){if(x&&x.added){if(typeof renderRecalls==='function')renderRecalls(RECALLS);AC.banner('🔄 MàJ 30 j : +'+x.added);if(window.updateFeedInfo)updateFeedInfo();}});}).catch(function(){});},15000);}
document.addEventListener('DOMContentLoaded',function(){acLoad();acPersistBase();var p=document.getElementById('gatePwd');if(p){p.value='';p.placeholder='Mot de passe';p.setAttribute('autocomplete','new-password');}
 acApplyGate();acStartPolling();acNetWatch();acAskNotif();
 console.log('✅ access-control v24 (registre fusionné GitHub+ntfy)');});
