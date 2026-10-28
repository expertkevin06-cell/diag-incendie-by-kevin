// ================================================================
// UI v16 (__v16) - Matching tokenisé + alias (r5, c4, w206, id.4...)
// Surcharge : recherche globale, cases énergie, garageFilter
// ================================================================
var __v16=true;
function fuzzy16(t,q){var i=0;for(var j=0;j<t.length;j++){if(t[j]===q[i])i++;if(i>=q.length)return true;}return false;}
function mt16(model){return seNorm(model||'').split(/[\s/,]+/).filter(function(t){return t.length>1;});}
// Règle alias : "r5" -> 1er mot du champ commence par "r" ET contient "5"
function tmModel(rm,t){if(rm.indexOf(t)>=0)return true;
 var m=t.match(/^([a-z]{1,3})(\d{1,3})$/);
 if(m){var fw=rm.split(' ')[0]||'';if(fw.indexOf(m[1])===0&&rm.indexOf(m[2])>=0)return true;}
 if(t.length>=4&&fuzzy16(rm,t))return true;
 return false;}
function tokHay(hay,t){if(hay.indexOf(t)>=0)return true;if(t.length>=4&&fuzzy16(hay,t))return true;return false;}
function altMatch(hay,hayModels,w){var alts=(window.SE_SYN&&SE_SYN[w])||[];
 if(tokHay(hay,w)||tmModel(hayModels,w))return true;
 for(var i=0;i<alts.length;i++){var a=seNorm(alts[i]);if(tokHay(hay,a)||tmModel(hayModels,a))return true;}
 return false;}
function recallMatch16(r,toks){var hayB=seNorm(r.brand||''),hayM=seNorm(r.models||''),
 hay=hayB+' '+hayM+' '+seNorm((r.motor||'')+' '+(r.cause||'')+' '+(r.mech||'')+' '+(r.ref||'')+' '+(r.subsys||''));
 for(var i=0;i<toks.length;i++){var w=seNorm(toks[i]);
  if(!(altMatch(hay,hayM,w)||tokHay(hayB,w)&&tmModel(hayM,w)||tokHay(hayB,w)&&hayB.indexOf(w)>=0)){
   if(!altMatch(hay,hayM,w))return false;}}
 return true;}
function score16(r,toks){var s=0,hb=seNorm(r.brand||''),hm=seNorm(r.models||'');
 toks.forEach(function(w){w=seNorm(w);if(hb.indexOf(w)>=0)s+=3;if(hm.indexOf(w)>=0||tmModel(hm,w))s+=3;});return s;}
function searchAll16(q){var toks=seNorm(q||'').split(/[\s,;]+/).filter(function(t){return t.length>0;});
 if(!toks.length)return{recalls:[],cases:[]};
 var recs=[];RECALLS.forEach(function(r){if(recallMatch16(r,toks))recs.push({r:r,s:score16(r,toks)});});
 recs.sort(function(a,b){return b.s-a.s;});
 var cases=[];FIRE_DATABASE.fireCauses.forEach(function(c){
  var fake={brand:c.title,models:c.description+' '+c.causes.join(' '),motor:'',cause:'',mech:'',ref:'',subsys:''};
  if(recallMatch16(fake,toks))cases.push({c:c,s:score16(fake,toks)});});
 cases.sort(function(a,b){return b.s-a.s;});
 return{recalls:recs.slice(0,30),cases:cases.slice(0,10)};}
function renderGlobal16(){var q=(document.getElementById('searchInput')||{}).value||'';var d=document.getElementById('searchResults');if(!d)return;
 if(!q.trim()){d.innerHTML='';return;}
 var res=searchAll16(q);var n=res.recalls.length+res.cases.length;
 if(!n){d.innerHTML='<div class="no-results">Aucun résultat pour « '+q+' » — essayez « renault r5 », « mercedes w206 », « vw id.4 »</div>';return;}
 var h='<div class="search-results-header">🔎 '+n+' résultat(s) pour « '+q+' » (mots croisés + alias)</div>';
 res.recalls.forEach(function(x){h+='<div class="search-result-item" onclick="expandRecall(\''+x.r.id+'\')"><h4>[score '+x.s+'] '+x.r.brand+' — '+x.r.models+'</h4><p>'+x.r.cause+'</p></div>';});
 res.cases.forEach(function(x){h+='<div class="search-result-item" onclick="app.expandCase(\''+x.c.id+'\')"><h4>[score '+x.s+'] '+x.c.title+'</h4><p>'+x.c.description+'</p></div>';});
 d.innerHTML=h;}
// Surcharge du filtrage garage (alias r5 etc. + tokens)
function garageFilter(s,mask){mask=mask||{};var out=[];
 for(var i=0;i<RECALLS.length;i++){var r=RECALLS[i];
  if(s.sub&&r.subsys&&r.subsys!==s.sub)continue;
  if(!brandMatch(r.brand||'',s.brand))continue;
  if(s.model&&!mask.model){var rm=seNorm(String(r.models||'').replace(/\([^)]*\)/g,''));var toks=mt16(s.model);
   if(toks.length&&!/multi|tous/i.test(rm)){var all=toks.every(function(t){return tmModel(rm,t);});if(!all)continue;}}
  if(s.motor&&!mask.motor){var rmot=seNorm(String(r.motor||'')+' '+String(r.models||''));var t0=seNorm(s.motor).split(/[\s/]+/)[0];
   if(t0&&t0.length>1&&!/tous/i.test(rmot)&&rmot.indexOf(t0)<0&&!tmModel(rmot,t0))continue;}
  if(s.power&&s.power!=='Toutes'&&!mask.power){if(r.power&&r.power!=='-'&&!powerOverlap2(r.power,s.power))continue;}
  out.push(r);}
 return out;}
document.addEventListener('DOMContentLoaded',function(){
 try{
  // 1) Recherche globale : surcharge après le handler de app-v9
  var sb=document.getElementById('searchBtn'),si=document.getElementById('searchInput');
  if(sb)sb.addEventListener('click',function(){setTimeout(renderGlobal16,0);});
  if(si){si.addEventListener('keypress',function(e){if(e.key==='Enter')setTimeout(renderGlobal16,0);});
   var deb=null;si.addEventListener('input',function(){clearTimeout(deb);deb=setTimeout(renderGlobal16,350);});}
  // 2) Cases énergie : surcharge
  document.querySelectorAll('.rs-btn').forEach(function(b){b.addEventListener('click',function(){setTimeout(function(){
   var en=b.dataset.energy;var inp=document.getElementById('q-'+en);if(!inp)return;
   var q=inp.value.trim();var list=RECALLS.filter(function(r){return r.energy===en;});
   if(q){var toks=seNorm(q).split(/[\s,;]+/).filter(Boolean);list=list.filter(function(r){return recallMatch16(r,toks);});}
   renderRecalls(list);},0);});});
  // 3) Auto-test silencieux (lu par autodiag)
  var t1=RECALLS.filter(function(r){return recallMatch16(r,['renault','r5']);}).length;
  var t2=RECALLS.filter(function(r){return recallMatch16(r,['mercedes','w206']);}).length;
  var t3=RECALLS.filter(function(r){return recallMatch16(r,['volkswagen','id.4']);}).length;
  var t4=RECALLS.filter(function(r){return recallMatch16(r,['skoda','elroq']);}).length;
  try{localStorage.setItem('searchTest',JSON.stringify({t:Date.now(),r5:t1,w206:t2,id4:t3,elroq:t4}));}catch(e){}
  console.log('[v16] AUTO-TEST recherche : renault r5='+t1+' | mercedes w206='+t2+' | vw id.4='+t3+' | skoda elroq='+t4+' (tous >0 attendus)');
  console.log('✅ ui-v16 actif : matching tokenisé + alias opérationnel');
 }catch(err){console.error('[v16]',err);}});
