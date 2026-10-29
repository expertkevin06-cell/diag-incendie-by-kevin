// ================================================================
// UI v21 (__v21) — prédiction exhaustive (base réelle) + cycle 30 j
// ================================================================
var __v21=true;
function renderPredict(res){var d=document.getElementById('predictResults');if(!d)return;var p=res.parsed;
 var tag='<div class="search-results-header">🔎 '+res.list.length+' résultat(s) — '+(p.brand?'marque='+p.brand+' ':'')+(p.model?'modèle='+p.model+' ':'')+(p.motor?'moteur='+p.motor+' ':'')+(p.power?'puiss='+p.power+' ':'')+(p.subs.length?'panne='+p.subs.join(',')+' ':'')+(p.free.length?'texte='+p.free.join(','):'')+'</div>';
 d.innerHTML=tag+res.list.map(function(r){return '<div class="search-result-item" onclick="expandRecall(\''+r.id+'\')"><h4>'+esc15(r.brand)+' — '+esc15(r.models)+'</h4><p>'+esc15(r.cause)+'</p></div>';}).join('')||'<p class="no-results">Aucun résultat — essayez « clio 5 courroie », « q4 obc », « id.7 12v »…</p>';}
function updateFeedInfo(){var el=document.getElementById('feedInfo');if(!el||!window.app||!app.db)return;
 idbGet(app.db,'userData','feedMeta').then(function(m){if(!m){el.textContent='🔄 Première mise à jour au prochain cycle 30 j';return;}
  var next=m.nextSync?new Date(m.nextSync).toLocaleDateString('fr-FR'):'—';
  el.textContent='🔄 Dernière MàJ : '+new Date(m.lastSync).toLocaleDateString('fr-FR')+' (v'+m.version+', +'+m.added+') • Prochaine auto : '+next+' • Cycle 30 j strict';});}
document.addEventListener('DOMContentLoaded',function(){
 try{
  var pi=document.getElementById('predictInput'),pb=document.getElementById('predictBox'),pr=document.getElementById('predictResults');
  if(pi&&pb){var cur=[],idx=-1;
   function sug(){cur=predSuggestions(pi.value);idx=-1;
    if(!cur.length){pb.style.display='none';return;}
    pb.innerHTML=cur.map(function(o,i){return '<div class="ac-item'+(i===idx?' sel':'')+'" data-i="'+i+'"><small style="opacity:.6">'+o.t+'</small> '+esc15(o.v)+'</div>';}).join('');
    pb.style.display='block';
    Array.prototype.forEach.call(pb.children,function(el,i){el.addEventListener('pointerdown',function(ev){ev.preventDefault();pi.value=cur[i].v;pb.style.display='none';runPred();});});}
   function runPred(){var q=pi.value.trim();if(!q){if(pr)pr.innerHTML='';return;}renderPredict(predSearch(q));}
   pi.addEventListener('focus',function(){sug();runPred();});
   pi.addEventListener('click',function(){sug();runPred();});
   pi.addEventListener('input',function(){sug();clearTimeout(pi._d);pi._d=setTimeout(runPred,250);});
   pi.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();if(pb.style.display!=='block')sug();idx=Math.min(idx+1,cur.length-1);Array.prototype.forEach.call(pb.children,function(el,i){el.classList.toggle('sel',i===idx);});}
    else if(e.key==='ArrowUp'){e.preventDefault();idx=Math.max(idx-1,0);Array.prototype.forEach.call(pb.children,function(el,i){el.classList.toggle('sel',i===idx);});}
    else if(e.key==='Enter'){if(pb.style.display==='block'&&idx>=0){e.preventDefault();pi.value=cur[idx].v;pb.style.display='none';}runPred();}
    else if(e.key==='Escape'){pb.style.display='none';}});
   pi.addEventListener('blur',function(){setTimeout(function(){pb.style.display='none';},200);});}
  // Écoute SW : MàJ auto 30 j + notifications
  if(navigator.serviceWorker){navigator.serviceWorker.addEventListener('message',function(e){
   if(e.data&&e.data.type==='feed-updated'){updateFeedInfo();if(typeof renderRecalls==='function')renderRecalls(RECALLS);
    AC.banner('🔄 Mise à jour 30 j appliquée : feed v'+e.data.version+(e.data.auto?' (auto)':''));}
   if(e.data&&e.data.type==='ntfy-event'){if(e.data.topic&&e.data.topic.indexOf('req')>=0)acAdminRefresh();else acCheckDecisions();
    AC.banner('🔔 '+((e.data.payload&&e.data.payload.name)||'événement')+' (via SW)');}});}
  setTimeout(updateFeedInfo,800);
  console.log('✅ ui-v21 actif (prédiction exhaustive + cycle 30 j)');
 }catch(err){console.error('[v21]',err);}});
