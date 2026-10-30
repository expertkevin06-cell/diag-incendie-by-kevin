// ================================================================
// UI v23 (__v23) — case prédictive UNIQUE (#pInput) + thèmes de pannes
// Les anciens modules (ui-v20/v21) deviennent inertes (ids renommés)
// ================================================================
var __v23=true;
(function(){
var SUB_LABEL={belt:'⛓️ Courroie',dpf:'🌫️ FAP/DPF/GPF',fuel:'⛽ Carburant',elec:'⚡ Court-circuit/élec',fire:'🔥 Incendie',charge:'🔌 Charge',range:'🔋 Autonomie',batt:' Batterie HT',turbo:' Turbo',egr:'♻️ EGR',adblue:'💧 AdBlue',overheat:'🌡️ Surchauffe',leak:'🛢️ Fuite',adas:'📡 ADAS',camera:'📷 Caméra',mech:'⚙️ Mécanique',gearbox:'⚙️ Boîte',software:'💻 Logiciel'};
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
var input,box,res,cur=[],idx=-1;
function suggestions(q){try{return predSuggestions(q)||[];}catch(e){console.error('[v23] sug',e);return [];}}
function search(q){try{return predSearch(q);}catch(e){console.error('[v23] search',e);return {parsed:{},list:[]};}}
function renderBox(){if(!cur.length){box.style.display='none';return;}
 box.innerHTML=cur.map(function(o,i){return '<div class="ac-item'+(i===idx?' sel':'')+'" data-i="'+i+'"><small style="opacity:.6">'+o.t+'</small> '+esc(o.v)+'</div>';}).join('');
 box.style.display='block';
 Array.prototype.forEach.call(box.children,function(el,i){
  el.addEventListener('pointerdown',function(ev){ev.preventDefault();ev.stopPropagation();pick(i);});
  el.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();pick(i);});});}
function pick(i){var o=cur[i];if(!o)return;input.value=o.v;box.style.display='none';runNow();}
function themes(list){var c={};list.forEach(function(r){var s=r.subsys||bucketOf(r);c[s]=(c[s]||0)+1;});
 return Object.keys(c).map(function(k){return {k:k,n:c[k]};}).sort(function(a,b){return b.n-a.n;}).slice(0,10);}
function runNow(){var q=input.value.trim();
 if(!q){res.innerHTML='';box.style.display='none';return;}
 var r=search(q);var th=themes(r.list);var p=r.parsed||{};
 var head='<div class="search-results-header">🔎 '+r.list.length+' résultat(s) — '+(p.brand?'marque='+esc(p.brand)+' ':'')+(p.model?'modèle='+esc(p.model)+' ':'')+(p.motor?'moteur='+esc(p.motor)+' ':'')+(p.power?'puiss='+esc(p.power)+' ':'')+(p.subs&&p.subs.length?'panne='+esc(p.subs.join(',')):'')+'</div>';
 var chips=th.length?'<div class="photo-row" style="margin:.5rem 0">'+th.map(function(t){return '<button class="nav-btn theme-chip" data-theme="'+esc(t.k)+'">'+(SUB_LABEL[t.k]||t.k)+' ('+t.n+')</button>';}).join('')+'</div>':'';
 var items=r.list.map(function(x){return '<div class="search-result-item" data-rid="'+esc(x.id)+'"><h4>'+esc(x.brand)+' — '+esc(x.models)+'</h4><p>'+esc(x.cause)+'</p></div>';}).join('');
 res.innerHTML=head+chips+items+(r.list.length?'':'<p class="no-results">Aucun résultat — ex : « clio 5 courroie », « q4 obc », « 3008 adblue », « id.7 12v »</p>');}
function onTheme(k){var v=input.value.trim();var toks=v.split(/\s+/);var last=toks[toks.length-1]||'';
 if(predClassify(last)==='sub')toks.pop();toks.push(k);input.value=toks.join(' ');box.style.display='none';runNow();}
function onOpen(id){if(typeof expandRecall==='function')expandRecall(id);}
document.addEventListener('DOMContentLoaded',function(){
 input=document.getElementById('pInput');box=document.getElementById('pBox');res=document.getElementById('pResults');
 if(!input||!box||!res){console.warn('[v23] case prédictive absente');return;}
 input.addEventListener('focus',function(){cur=suggestions(input.value);idx=-1;renderBox();runNow();});
 input.addEventListener('click',function(){cur=suggestions(input.value);idx=-1;renderBox();});
 input.addEventListener('input',function(){cur=suggestions(input.value);idx=-1;renderBox();clearTimeout(input._d);input._d=setTimeout(runNow,250);});
 input.addEventListener('keydown',function(e){
  if(e.key==='ArrowDown'){e.preventDefault();if(box.style.display!=='block'){cur=suggestions(input.value);renderBox();}idx=Math.min(idx+1,cur.length-1);renderBox();}
  else if(e.key==='ArrowUp'){e.preventDefault();idx=Math.max(idx-1,0);renderBox();}
  else if(e.key==='Enter'){e.preventDefault();if(box.style.display==='block'&&idx>=0)pick(idx);else{box.style.display='none';runNow();}}
  else if(e.key==='Escape'){box.style.display='none';}});
 input.addEventListener('blur',function(){setTimeout(function(){box.style.display='none';},220);});
 res.addEventListener('click',function(e){
  var t=e.target.closest('[data-theme]');if(t){onTheme(t.dataset.theme);return;}
  var it=e.target.closest('[data-rid]');if(it){onOpen(it.dataset.rid);}});
 console.log('✅ ui-v23 actif : case prédictive unique + thèmes de pannes');});
})();
