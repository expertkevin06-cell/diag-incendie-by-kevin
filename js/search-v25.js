// ================================================================
// SEARCH v30 — unifiée (RECALLS + MEGA + FICHES) + prédictions + live
// ================================================================
function usPredictions(q){var out=[];var s=seNorm(q);if(!s)return out;
 var seen={};
 function add(type,val){var k=type+'|'+val;if(seen[k])return;seen[k]=1;out.push({type:type,val:val});}
 if(typeof catalogBrands==='function')catalogBrands().forEach(function(b){var lbl=(PRETTY_BRANDS[b]||cap15(b));if(seNorm(lbl).indexOf(s)>=0||fuzzy16(seNorm(lbl),s))add('Marque',lbl);});
 if(typeof modelsFor==='function'){var cb=null;try{cb=catalogBrands().find(function(b){return seNorm(PRETTY_BRANDS[b]||b).indexOf(s)>=0;});}catch(e){}
  (cb?[cb]:catalogBrands().slice(0,6)).forEach(function(b){modelsFor(b).forEach(function(m){if(seNorm(m).indexOf(s)>=0)add('Modèle',m);});});}
 if(typeof MEGA!=='undefined')MEGA.forEach(function(x){if(seNorm(x.comp+' '+x.cause).indexOf(s)>=0)add('Panne',x.comp);});
 Object.keys(PANNE_KEYWORDS).forEach(function(k){if(k.indexOf(s)>=0)add('Panne',cap15(k));});
 if(typeof RECALLS!=='undefined')RECALLS.forEach(function(r){if(seNorm(r.cause).indexOf(s)>=0&&r.cause.length<40)add('Défaut',r.cause);});
 return out.slice(0,14);}
function _normMega(x){return{id:'MEGA-'+x.id,brand:x.brands,models:x.models,years:'—',energy:/ev|hv|charge|range/.test(x.theme)?'ev':/lpg|fuel/.test(x.theme)?'lpg':'thermal',motor:x.motors,subsys:x.theme,cause:x.comp+' : '+x.cause,mech:x.fix,idx:x.dtc&&x.dtc!=='-'?('DTC '+x.dtc+' • '):''+'Cartographie fusion',src:'Méga-base',ref:x.id,power:x.motors,photos:x.photos||[]};}
function _normFiche(f){return{id:'FICHE-'+(f.id||f.title),brand:'Multi',models:f.zone||'—',years:'—',energy:/ve|ev|batter/i.test(f.title||'')?'ev':'thermal',motor:'—',subsys:f.cat||'fire',cause:f.title,mech:f.cause||'',idx:f.evidence||'Indices sapiteur',src:'Fiche technique',ref:f.id||'-',power:'',photos:f.photos||[]};}
function unifiedSearch(q){var toks=seExpand(q);if(!toks.length)return[];var res=[];var seen={};
 function push(kind,obj,s){var k=obj.id||obj.brand+obj.cause;if(seen[k])return;seen[k]=1;res.push({kind:kind,r:obj,s:s});}
 RECALLS.forEach(function(r){var s=seScore((r.brand||'')+' '+(r.models||''),toks)*3+seScore(r.cause||'',toks)*2+seScore(r.mech||'',toks)*2+seScore(r.motor||'',toks)*2+seScore(r.idx||'',toks);if(s>0)push('recall',r,s);});
 if(typeof MEGA!=='undefined')MEGA.forEach(function(x){var n=_normMega(x);var s=seScore((n.brand||'')+' '+(n.models||''),toks)*3+seScore(n.cause||'',toks)*2+seScore(n.mech||'',toks)+ (x.dtc&&x.dtc!=='-'&&seNorm(q).indexOf(seNorm(x.dtc))>=0?6:0);if(s>0)push('mega',n,s+2);});
 if(typeof FICHES!=='undefined')FICHES.forEach(function(f){var n=_normFiche(f);var s=seScore((n.cause||'')+' '+(n.mech||'')+' '+(n.idx||''),toks)*2;if(s>0)push('fiche',n,s);});
 res.sort(function(a,b){return b.s-a.s;});
 return res.slice(0,30);}
function renderUnifiedResults(list,q){var d=document.getElementById('unifiedResults');if(!d)return;
 if(!list.length){d.innerHTML='<p class="no-results">Aucun résultat pour « '+esc15(q)+' ». Essayez marque + modèle + panne (ex : « peugeot 208 courroie »).</p>';return;}
 var h='<div class="search-results-header">🔎 '+list.length+' résultat(s) — RECALLS + MÉGA-BASE + FICHES fusionnés</div><div class="causes-grid">';
 list.forEach(function(x){
  var badge=x.kind==='mega'?'🧰 Panne connue':x.kind==='fiche'?'📋 Fiche origine':'🚨 Rappel/Cas';
  h+='<div class="cause-card"><span class="category-badge">'+badge+'</span><span class="badge-src">'+esc15(x.r.src)+'</span><h3>'+esc15(x.r.brand)+'</h3>'+
   '<p class="cause-type">'+esc15(x.r.models)+' • '+esc15(x.r.years)+(x.r.power&&x.r.power!=='-'?' • '+esc15(x.r.power):'')+'</p>'+
   '<p class="cause-desc"><strong>Défaut :</strong> '+esc15(x.r.cause)+'</p>'+
   '<p class="cause-desc"><strong>Mécanisme / conséquence :</strong> '+esc15(x.r.mech)+'</p>'+
   '<p class="identification"><strong>Indices :</strong> '+esc15(x.r.idx)+'</p>'+veRow(x.r.photos)+
   '<button class="btn-expand" onclick="expandRecall(\''+esc15(x.r.id)+'\')">🎓 Détails</button></div>';});
 h+='</div>';
 h+='<div class="photo-row" style="margin-top:1rem"><button class="rs-btn" style="width:auto;padding:.6rem 1rem" onclick="liveEnrich(\''+esc15(q)+'\')">🛰️ Enrichir en arrière-plan (NHTSA + feed)</button></div>';
 d.innerHTML=h;}
function runUnifiedNow(){var ui=document.getElementById('unifiedInput');if(!ui)return;var q=ui.value.trim();
 var pr=document.getElementById('unifiedPredict');if(pr)pr.style.display='none';
 renderUnifiedResults(unifiedSearch(q),q);}
var LIVE_STATE={running:false,last:0};
async function liveEnrich(q){if(!navigator.onLine){AC.banner('⚠️ Hors ligne — base locale uniquement');return;}
 if(LIVE_STATE.running)return;LIVE_STATE.running=true;AC.banner('🛰️ Enrichissement arrière-plan…');
 var toks=seExpand(q);var brandTok=toks[0]||'';var added=0;
 try{var mk=(PRETTY_BRANDS[brandTok]||cap15(brandTok)).replace(/[^a-z]/gi,'');
  if(mk.length>2){var r=await fetch('https://api.nhtsa.gov/recalls?make='+encodeURIComponent(mk)+'&fromDate=2018-01-01&toDate='+new Date().toISOString().slice(0,10),{cache:'no-store'});
   if(r.ok){var j=await r.json();var keys={};RECALLS.forEach(function(x){keys[dedupeKey(x)]=1;});
    (j.results||[]).forEach(function(rec){var c={id:'live-nhtsa-'+(rec.NHTSACampaignNumber||Math.random().toString(36).slice(2)),brand:(rec.Make||'')+' '+(rec.Model||''),models:rec.Model||'-',years:String(rec.ModelYear||''),energy:/ev|electric|battery/i.test((rec.Component||'')+(rec.Summary||''))?'ev':'thermal',motor:'-',region:'US',src:'NHTSA-live',ref:rec.NHTSACampaignNumber||'-',subsys:/fire|fuel|battery|electrical/i.test(rec.Component||'')?'fire':'mech',cause:(rec.Component||'')+' : '+(rec.Summary||''),mech:'Rappel NHTSA → inflammation/propagation (NFPA 921)',idx:'Cartographie fusion + perles + traces',photos:['engine_burnt','arc_beads']};
     if(!keys[dedupeKey(c)]){RECALLS.push(normFeed(c));keys[dedupeKey(c)]=1;added++;}});}}}
 }catch(e){console.warn('NHTSA live KO',e.message);}
 try{if(window.app&&app.db){var fr=await syncRecallsFeed(app.db,true);if(fr&&fr.added)added+=fr.added;}}catch(e){}
 LIVE_STATE.running=false;
 if(added>0){AC.banner('✅ +'+added+' cas fusionnés (base massive)');renderUnifiedResults(unifiedSearch(q),q);}
 else AC.banner('ℹ️ Aucun nouveau cas live (base locale déjà complète)');}
console.log('✅ search-v30 chargé (unifiée 3 bases + live enrich)');
