// ================================================================
// UI v17 (__v17) — gate admin/tiers, panneau admin, live-search, prédiction
// ================================================================
var __v17=true;
function renderAdmin(){var rq=document.getElementById('adminRequests'),gr=document.getElementById('adminGrants');if(!rq)return;
 if(!AC.requests.length){rq.innerHTML='<p class="no-results">Aucune demande en attente</p>';}
 else rq.innerHTML=AC.requests.map(function(d){var st=d.status==='approved'?'✅':d.status==='revoked'?'⛔':d.status==='refused'?'❌':'🆕';
  return '<div class="cause-card"><h3>'+st+' '+esc15(d.name)+'</h3><p class="cause-type">Appareil : '+esc15(d.device)+' • '+new Date(d.ts).toLocaleString('fr-FR')+'</p><p class="cause-desc">'+esc15(d.ua||'')+'</p>'+
  '<button class="btn-expand" data-act="approve" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'">✅ ACCORDER</button>'+
  '<button class="btn-expand" style="border-color:#b71c1c;color:#b71c1c" data-act="refuse" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'">❌ REFUSER</button>'+
  '<button class="btn-expand" style="border-color:#ff6f00;color:#ff6f00" data-act="revoke" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'">⛔ RÉVOQUER</button></div>';}).join('');
 var g={};try{g=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}
 var keys=Object.keys(g);
 gr.innerHTML=keys.length?keys.map(function(k){return '<div class="cause-card"><h3>'+(g[k].status==='approved'?'✅':'⛔')+' '+esc15(g[k].name)+'</h3><p class="cause-type">'+esc15(k)+' • '+new Date(g[k].ts).toLocaleString('fr-FR')+'</p><button class="btn-expand" style="border-color:#ff6f00;color:#ff6f00" data-act="revoke" data-dev="'+esc15(k)+'" data-name="'+esc15(g[k].name)+'">⛔ RÉVOQUER</button></div>';}).join(''):'<p class="no-results">Aucun appareil géré</p>';}
function lsRender(res){var d=document.getElementById('liveResults');if(!d)return;
 var n=res.local.recalls.length+res.local.cases.length+res.api.length;
 var h='<div class="search-results-header">🌐 '+n+' résultat(s) live pour « '+esc15(res.q)+' » (local + NHTSA + Rappel Conso)</div>';
 h+='<div class="photo-row" style="margin:.6rem 0">'+res.sites.map(function(s){return '<a class="rs-btn" style="display:inline-block;width:auto;padding:.5rem .8rem;margin:.2rem;text-decoration:none" target="_blank" rel="noopener" href="'+s.u+'">🌐 '+esc15(s.l)+'</a>';}).join('')+'</div>';
 res.local.recalls.forEach(function(x){h+='<div class="search-result-item" onclick="expandRecall(\''+x.r.id+'\')"><h4>📦 [local] '+esc15(x.r.brand)+' — '+esc15(x.r.models)+'</h4><p>'+esc15(x.r.cause)+'</p></div>';});
 res.local.cases.forEach(function(x){h+='<div class="search-result-item" onclick="app.expandCase(\''+x.c.id+'\')"><h4>📦 [local] '+esc15(x.c.title)+'</h4><p>'+esc15(x.c.description)+'</p></div>';});
 res.api.forEach(function(x){h+='<div class="search-result-item" onclick="window.open(\''+x.link.replace(/'/g,'')+'\',\'_blank\')"><h4>🌐 ['+esc15(x.src)+'] '+esc15(x.title)+'</h4><p>'+esc15(x.desc)+'</p></div>';});
 d.innerHTML=h;}
document.addEventListener('DOMContentLoaded',function(){
 try{
  // Gate boutons
  var ga=document.getElementById('gateAdminBtn');
  if(ga)ga.addEventListener('click',async function(){var pw=document.getElementById('gatePwd').value;
   var ok=await acAdminLogin(pw);if(!ok){document.getElementById('gateStatus').textContent='❌ Mot de passe incorrect';}});
  var gq=document.getElementById('gateReqBtn');
  if(gq)gq.addEventListener('click',function(){acRequest(document.getElementById('gateName').value.trim());});
  // Panneau admin : délégation
  document.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;
   var act=b.dataset.act,dev=b.dataset.dev,nm=b.dataset.name;
   if(act==='approve')acDecide(dev,nm,'approved');
   else if(act==='refuse')acDecide(dev,nm,'refused');
   else if(act==='revoke')acDecide(dev,nm,'revoked');
   else if(act==='refresh')acAdminRefresh();});
  // Live search
  var lb=document.getElementById('liveBtn');
  if(lb)lb.addEventListener('click',function(){var q=document.getElementById('liveInput').value.trim();if(!q)return;
   document.getElementById('liveResults').innerHTML='<div class="loading">🌐 Interrogation NHTSA + Rappel Conso + 24 sites…</div>';
   runLiveSearch(q,lsRender);});
  var li=document.getElementById('liveInput');
  if(li)li.addEventListener('keypress',function(e){if(e.key==='Enter'&&lb)lb.click();});
  // Prédiction marque/modèle sur le mode texte libre (datalists dynamiques)
  var gb=document.getElementById('gBrand'),gm=document.getElementById('gModel');
  if(gb){var dl=document.getElementById('brandList');
   gb.addEventListener('input',function(){if(!dl)return;var q=seNorm(gb.value);var all=catalogBrands();
    var f=q?all.filter(function(b){var n=seNorm(PRETTY_BRANDS[b]||b);return n.indexOf(q)===0||n.indexOf(q)>0;}):all;
    dl.innerHTML=f.slice(0,15).map(function(b){return '<option value="'+esc15(PRETTY_BRANDS[b]||cap15(b))+'"></option>';}).join('');});}
  if(gm){var dl2=document.createElement('datalist');dl2.id='modelList17';gm.setAttribute('list','modelList17');document.body.appendChild(dl2);
   gm.addEventListener('input',function(){var q=seNorm(gm.value);var all=modelsFor(gb?gb.value:'');
    var f=q?all.filter(function(m){var n=seNorm(m);return n.indexOf(q)>=0||fuzzy16(n,q);}):all;
    dl2.innerHTML=f.slice(0,15).map(function(m){return '<option value="'+esc15(m)+'"></option>';}).join('');});}
  console.log('✅ ui-v17 actif (gate + admin + live-search + prédiction)');
 }catch(err){console.error('[v17]',err);}});
