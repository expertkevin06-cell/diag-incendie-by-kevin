// ================================================================
// UI v18 (__v18) — Section dédiée Skoda Elroq : symptômes + sous-systèmes
// ================================================================
var __v18=true;
var ELQ_SUBS=['Tous','charge','range','batt','elec','software','camera','adas','mech','leak','safety'];
var ELQ_LBL={charge:'🔌 Charge',range:'🔋 Autonomie',batt:' Batterie HT',elec:'⚡ 12V/élec',software:'💻 Software',camera:'📷 Caméras',adas:'📡 ADAS',mech:'⚙️ Mécanique',leak:'💧 Fuites/eau',safety:'🚨 Sécurité/feu'};
var curElq='Tous';
function elqCard(x){return '<div class="cause-card"><span class="category-badge">'+(ELQ_LBL[x.subsys]||x.subsys)+'</span><span class="badge-src">'+esc15(x.src)+'</span>'+
 '<h3>'+esc15(x.sym)+'</h3>'+
 '<p class="cause-desc"><strong>Cause :</strong> '+esc15(x.cause)+'</p>'+
 '<p class="cause-desc"><strong>Mécanisme :</strong> '+esc15(x.mech)+'</p>'+
 '<p class="identification"><strong>Diagnostic / indices :</strong> '+esc15(x.idx)+'</p>'+
 '<p class="cause-temp">Fréquence : '+esc15(x.freq)+'</p>'+
 '<div class="photo-row">'+(x.photos||[]).map(function(p){return vePhoto(p);}).join('')+'</div></div>';}
function elqMatch(x,toks){if(!toks.length)return true;var hay=seNorm(x.sym+' '+x.cause+' '+x.mech+' '+x.idx+' '+x.subsys);
 for(var i=0;i<toks.length;i++){if(hay.indexOf(toks[i])<0&&!fuzzy16(hay,toks[i]))return false;}return true;}
function renderElroq(){var g=document.getElementById('elroqGrid');if(!g)return;
 var q=seNorm((document.getElementById('elqInput')||{}).value||'');var toks=q.split(/[\s,]+/).filter(function(t){return t.length>1;});
 var l=ELROQ.filter(function(x){return (curElq==='Tous'||x.subsys===curElq)&&elqMatch(x,toks);});
 g.innerHTML=l.map(elqCard).join('')||'<p class="no-results">Aucun symptôme — essayez « charge », « 12v », « caméra », « fuite »…</p>';
 var c=document.getElementById('elroqChips');if(c)c.innerHTML=ELQ_SUBS.map(function(s){return '<button class="nav-btn '+(s===curElq?'active':'')+'" data-elq="'+s+'">'+(ELQ_LBL[s]||s)+'</button>';}).join('');
 var n=document.getElementById('elqCount');if(n)n.textContent=l.length+' symptôme(s)/panne(s) Elroq affiché(s) sur '+ELROQ.length;}
document.addEventListener('DOMContentLoaded',function(){
 try{
  if(window.SE_SYN){SE_SYN['elroq']=['skoda elroq','meb','enyaq'];SE_SYN['meb']=['elroq','id.4','enyaq'];}
  renderElroq();
  document.addEventListener('click',function(e){var b=e.target.closest('[data-elq]');if(b){curElq=b.dataset.elq;renderElroq();}});
  var i=document.getElementById('elqInput');
  if(i){var d=null;i.addEventListener('input',function(){clearTimeout(d);d=setTimeout(renderElroq,250);});
   i.addEventListener('keypress',function(e){if(e.key==='Enter')renderElroq();});}
  console.log('✅ ui-v18 actif : section Skoda Elroq ('+ELROQ.length+' fiches)');
 }catch(err){console.error('[v18]',err);}});
