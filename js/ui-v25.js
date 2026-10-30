// ================================================================
// UI v25 (__v25) — rendu ADMIN faisant autorité (chargé en dernier)
// Boutons en data-act2 (aucun conflit avec les délégations précédentes)
// ================================================================
var __v25=true;
function renderAdmin(){
 var rq=document.getElementById('adminRequests'),gr=document.getElementById('adminGrants');if(!rq)return;
 if(!AC.requests.length){rq.innerHTML='<p class="no-results">Aucune demande — le registre fusionné (GitHub + ntfy) est vide.</p>';}
 else rq.innerHTML=AC.requests.map(function(d){
  var st=d.status==='approved'?'✅':d.status==='revoked'?'⛔':d.status==='refused'?'❌':'🆕';
  var src=(d.source||'').indexOf('github')>=0?'🎫 ticket #'+(d.issue||'?'):'📡 ntfy';
  if((d.source||'').indexOf('ntfy')>=0&&(d.source||'').indexOf('github')>=0)src='🎫+📡';
  return '<div class="cause-card"><h3>'+st+' '+esc15(d.name)+'</h3>'+
   '<p class="cause-type">'+esc15(src)+' • appareil '+esc15(String(d.device).slice(0,10))+' • '+new Date(d.ts).toLocaleString('fr-FR')+'</p>'+
   '<p class="cause-desc">'+esc15(d.ua||'')+'</p>'+
   '<button class="btn-expand" data-act2="approve" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'" data-issue="'+(d.issue||'')+'">✅ ACCORDER</button>'+
   '<button class="btn-expand" style="border-color:#b71c1c;color:#b71c1c" data-act2="refuse" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'" data-issue="'+(d.issue||'')+'">❌ REFUSER</button>'+
   '<button class="btn-expand" style="border-color:#ff6f00;color:#ff6f00" data-act2="revoke" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'" data-issue="'+(d.issue||'')+'">⛔ RÉVOQUER</button></div>';}).join('');
 var g={};try{g=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}var keys=Object.keys(g);
 gr.innerHTML=keys.length?keys.map(function(k){return '<div class="cause-card"><h3>'+(g[k].status==='approved'?'✅':'⛔')+' '+esc15(g[k].name)+'</h3><p class="cause-type">'+esc15(k)+'</p>'+
  '<button class="btn-expand" style="border-color:#ff6f00;color:#ff6f00" data-act2="revoke" data-dev="'+esc15(k)+'" data-name="'+esc15(g[k].name)+'" data-issue="'+((AC.registry[k]||{}).issue||'')+'">⛔ RÉVOQUER</button></div>';}).join(''):'<p class="no-results">Aucun appareil géré</p>';
 var rv=document.getElementById('adminRelease');if(rv){fetch('data/recalls-feed.json',{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){rv.innerHTML='Feed actuel : <strong>v'+j.version+'</strong> — <button class="btn-offline" data-act2="validate" data-ver="'+j.version+'" style="color:#2e7d32">✅ Valider & diffuser cette version aux tiers</button>';}).catch(function(){rv.innerHTML='Feed indisponible';});}}
document.addEventListener('click',function(e){var b=e.target.closest('[data-act2]');if(!b)return;
 var a=b.dataset.act2,dev=b.dataset.dev,nm=b.dataset.name,iss=b.dataset.issue?parseInt(b.dataset.issue,10):undefined;
 if(a==='approve')acDecide(dev,nm,'approved',iss);
 else if(a==='refuse')acDecide(dev,nm,'refused',iss);
 else if(a==='revoke')acDecide(dev,nm,'revoked',iss);
 else if(a==='refresh')acAdminRefresh();
 else if(a==='validate')acValidateRelease(b.dataset.ver);});
document.addEventListener('DOMContentLoaded',function(){try{if(typeof renderAdmin==='function'&&AC.state&&AC.state.role==='admin')renderAdmin();console.log('✅ ui-v25 actif (rendu admin faisant autorité)');}catch(e){}});
