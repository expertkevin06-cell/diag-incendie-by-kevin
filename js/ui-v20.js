// ================================================================
// UI v20.1 (__v20) — patch canal : écoute SW + indicateur relais
// (le reste de ui-v20 inchangé : barre prédictive, partage mail, sauvegarde, admin)
// ================================================================
var __v20=true;
function shareApk(){var apkUrl='https://expertkevin06-cell.github.io/diag-incendie/';
 var body='Bonjour,%0D%0AVoici l’application diag-incendie-by-kevin : '+encodeURIComponent(apkUrl)+'%0D%0AInstallez-la puis demandez l’accès (notification admin).';
 if(navigator.share){navigator.share({title:'diag-incendie-by-kevin',text:'Application diag-incendie-by-kevin',url:apkUrl}).catch(function(){});}
 setTimeout(function(){window.location.href='mailto:?subject='+encodeURIComponent('diag-incendie-by-kevin (APK)')+'&body='+body;},400);}
function saveMassive(){if(!window.app||!app.db){AC.banner('⚠️ Base non prête');return;}
 var tx=app.db.transaction(['fireCases','userData'],'readwrite');tx.objectStore('fireCases').clear();
 FIRE_DATABASE.fireCauses.forEach(function(c){tx.objectStore('fireCases').put(c);});
 tx.oncomplete=function(){AC.banner('💾 Sauvegarde massive locale effectuée ('+RECALLS.length+' pannes)');try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}};}
function renderAdmin(){var rq=document.getElementById('adminRequests'),gr=document.getElementById('adminGrants');if(!rq)return;
 rq.innerHTML=AC.requests.length?AC.requests.map(function(d){var st=d.grant?(d.grant.status==='approved'?'✅':d.grant.status==='revoked'?'⛔':''):'🆕';
  return '<div class="cause-card"><h3>'+st+' '+esc15(d.name)+'</h3><p class="cause-type">'+esc15(d.device)+' • '+new Date(d.ts).toLocaleString('fr-FR')+'</p>'+
  '<button class="btn-expand" data-act="approve" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'">✅ ACCORDER</button>'+
  '<button class="btn-expand" style="border-color:#b71c1c;color:#b71c1c" data-act="refuse" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'">❌ REFUSER</button>'+
  '<button class="btn-expand" style="border-color:#ff6f00;color:#ff6f00" data-act="revoke" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'">⛔ RÉVOQUER</button></div>';}).join(''):'<p class="no-results">Aucune demande</p>';
 var g={};try{g=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}var keys=Object.keys(g);
 gr.innerHTML=keys.length?keys.map(function(k){return '<div class="cause-card"><h3>'+(g[k].status==='approved'?'✅':'⛔')+' '+esc15(g[k].name)+'</h3><p class="cause-type">'+esc15(k)+'</p><button class="btn-expand" style="border-color:#ff6f00;color:#ff6f00" data-act="revoke" data-dev="'+esc15(k)+'" data-name="'+esc15(g[k].name)+'">⛔ RÉVOQUER</button></div>';}).join(''):'<p class="no-results">Aucun appareil</p>';
 var rv=document.getElementById('adminRelease');if(rv){fetch('data/recalls-feed.json',{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){rv.innerHTML='Feed actuel : <strong>v'+j.version+'</strong> — <button class="btn-offline" data-act="validate" data-ver="'+j.version+'" style="color:#2e7d32">✅ Valider & diffuser cette version aux tiers</button>';}).catch(function(){rv.innerHTML='Feed indisponible';});}}
function renderPredict(res){var d=document.getElementById('predictResults');if(!d)return;var p=res.parsed;
 var tag='<div class="search-results-header">🔎 '+res.list.length+' résultat(s) — '+(p.brand?'marque='+p.brand+' ':'')+(p.model?'modèle='+p.model+' ':'')+(p.motor?'moteur='+p.motor+' ':'')+(p.power?'puiss='+p.power+' ':'')+(p.subs.length?'panne='+p.subs.join(',')+' ':'')+(p.free.length?'texte='+p.free.join(','):'')+'</div>';
 d.innerHTML=tag+res.list.map(function(r){return '<div class="search-result-item" onclick="expandRecall(\''+r.id+'\')"><h4>'+esc15(r.brand)+' — '+esc15(r.models)+'</h4><p>'+esc15(r.cause)+'</p></div>';}).join('')||'<p class="no-results">Aucun résultat — essayez « clio 5 courroie », « q4 obc », « id.7 12v »…</p>';}
document.addEventListener('DOMContentLoaded',function(){
 try{
  // Barre prédictive unique
  var pi=document.getElementById('predictInput'),pb=document.getElementById('predictBox'),pr=document.getElementById('predictResults');
  if(pi&&pb){var cur=[],idx=-1;
   function sug(){cur=predSuggestions(pi.value);idx=-1;if(!cur.length){pb.style.display='none';return;}
    pb.innerHTML=cur.map(function(o,i){return '<div class="ac-item'+(i===idx?' sel':'')+'" data-i="'+i+'"><small style="opacity:.6">'+o.t+'</small> '+esc15(o.v)+'</div>';}).join('');pb.style.display='block';
    Array.prototype.forEach.call(pb.children,function(el,i){el.addEventListener('pointerdown',function(ev){ev.preventDefault();pi.value=cur[i].v;pb.style.display='none';runPred();});});}
   function runPred(){var q=pi.value.trim();if(!q){if(pr)pr.innerHTML='';return;}renderPredict(predSearch(q));}
   pi.addEventListener('focus',sug);pi.addEventListener('click',sug);
   pi.addEventListener('input',function(){sug();clearTimeout(pi._d);pi._d=setTimeout(runPred,300);});
   pi.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();if(pb.style.display!=='block')sug();idx=Math.min(idx+1,cur.length-1);Array.prototype.forEach.call(pb.children,function(el,i){el.classList.toggle('sel',i===idx);});}
    else if(e.key==='ArrowUp'){e.preventDefault();idx=Math.max(idx-1,0);Array.prototype.forEach.call(pb.children,function(el,i){el.classList.toggle('sel',i===idx);});}
    else if(e.key==='Enter'){if(pb.style.display==='block'&&idx>=0){e.preventDefault();pi.value=cur[idx].v;pb.style.display='none';}runPred();}
    else if(e.key==='Escape'){pb.style.display='none';}});
   pi.addEventListener('blur',function(){setTimeout(function(){pb.style.display='none';},200);});}
  var sh=document.getElementById('shareApkBtn');if(sh)sh.addEventListener('click',shareApk);
  var sv=document.getElementById('saveMassiveBtn');if(sv)sv.addEventListener('click',saveMassive);
  document.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;
   if(a==='approve')acDecide(b.dataset.dev,b.dataset.name,'approved');
   else if(a==='refuse')acDecide(b.dataset.dev,b.dataset.name,'refused');
   else if(a==='revoke')acDecide(b.dataset.dev,b.dataset.name,'revoked');
   else if(a==='refresh')acAdminRefresh();
   else if(a==='validate')acValidateRelease(b.dataset.ver);});
  // Écoute des notifications relayées par le Service Worker
  if(navigator.serviceWorker){navigator.serviceWorker.addEventListener('message',function(e){
   if(e.data&&e.data.type==='ntfy-event'){
    if(e.data.topic&&e.data.topic.indexOf('req')>=0)acAdminRefresh();
    else acCheckDecisions();
    AC.banner('🔔 '+((e.data.payload&&e.data.payload.name)||'événement')+' (via SW)');}});}
  console.log('✅ ui-v20.1 actif (canal strict + écoute SW)');
 }catch(err){console.error('[v20.1]',err);}});
