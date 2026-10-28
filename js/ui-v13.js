// ================================================================
// UI v14 - AUTOCOMPLÉTION en cascade : marque > modèle > motorisation > puissance
// Suggestions : commence-par > contient > sous-séquence | clavier + tactile
// ================================================================
var PRETTY_BRANDS={audi:'Audi',volkswagen:'Volkswagen',skoda:'Skoda',renault:'Renault',dacia:'Dacia',peugeot:'Peugeot',citroen:'Citroën',opel:'Opel',fiat:'Fiat',mercedes:'Mercedes'};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function val(id){var e=document.getElementById(id);return e?e.value:'';}
function catalogKey(brand){var b=seNorm(brand||'');if(!b)return null;var keys=Object.keys(window.VEHICLE_CATALOG||{});
 for(var i=0;i<keys.length;i++){var c=seNorm(keys[i]);if(c===b||b.indexOf(c)===0||c.indexOf(b)===0)return keys[i];}return null;}
function cleanModel(m){return String(m||'').replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim();}
function modelTokens(model){return seNorm(model||'').split(/[\s/,]+/).filter(function(t){return t.length>1;});}
function catalogBrands(){var set={};Object.keys(window.VEHICLE_CATALOG||{}).forEach(function(k){set[k]=1;});
 (window.RECALLS||[]).forEach(function(r){var raw=String(r.brand||'').split('/')[0].trim();var b=seNorm(raw.split(' ')[0]);
  if(b&&b.length>2&&!/multi|tous|doctrine/.test(b))set[b]=1;});
 return Object.keys(set).sort();}
function modelsFor(brand){var k=catalogKey(brand);var set={};
 if(k&&window.VEHICLE_CATALOG&&VEHICLE_CATALOG[k])Object.keys(VEHICLE_CATALOG[k]).forEach(function(m){set[m]=1;});
 RECALLS.forEach(function(r){if(brandMatch(r.brand||'',brand)){String(r.models||'').split(',').forEach(function(m){var c=cleanModel(m);if(c&&c.length<40&&!/tous|multi/i.test(c))set[c]=1;});}});
 return Object.keys(set).sort();}
function motorsFor(brand,model){var k=catalogKey(brand);var set={};
 if(k&&model&&VEHICLE_CATALOG[k]&&VEHICLE_CATALOG[k][model])VEHICLE_CATALOG[k][model].forEach(function(s){set[String(s).split('|')[0].trim()]=1;});
 var toks=modelTokens(model);
 RECALLS.forEach(function(r){if(!brandMatch(r.brand||'',brand))return;var rm=seNorm(cleanModel(r.models||''));
  if(toks.length){var all=toks.every(function(t){return rm.indexOf(t)>=0;});if(!all&&rm.indexOf(toks[0])<0)return;}
  var m=String(r.motor||'').split('(')[0].trim();if(m&&m!=='-'&&!/tous/i.test(m))set[m]=1;});
 return Object.keys(set).sort();}
function powersFor(brand,model,motor){var k=catalogKey(brand);var set={};
 if(k&&model&&VEHICLE_CATALOG[k]&&VEHICLE_CATALOG[k][model])VEHICLE_CATALOG[k][model].forEach(function(s){
  var parts=String(s).split('|');var code=parts[0].trim();var pw=String(parts[1]||'').trim();
  if(seNorm(code)===seNorm(motor||'')){if(pw)pw.split('/').forEach(function(x){set[x.trim()]=1;});else set['Toutes']=1;}});
 var toks=modelTokens(model);var mt=seNorm(String(motor||'').split(' ')[0]);
 RECALLS.forEach(function(r){if(!brandMatch(r.brand||'',brand))return;var rm=seNorm(cleanModel(r.models||''));
  if(toks.length){var all=toks.every(function(t){return rm.indexOf(t)>=0;});if(!all&&rm.indexOf(toks[0])<0)return;}
  var rmot=seNorm(r.motor||'');if(mt&&rmot.indexOf(mt)<0)return;
  if(r.power&&r.power!=='-')set[r.power]=1;
  var pm=String(r.motor||'').match(/\(([^)]*kW[^)]*)\)/);if(pm)set[pm[1]]=1;});
 if(!Object.keys(set).length)set['Toutes']=1;
 return Object.keys(set).sort();}
function kwNums(s){return (String(s||'').match(/\d{2,3}(?=\s*kW)/gi)||[]).map(Number);}
function powerOverlap2(a,b){var A=kwNums(a),B=kwNums(b);if(!A.length||!B.length)return true;
 var lo1=Math.min.apply(null,A),hi1=Math.max.apply(null,A),lo2=Math.min.apply(null,B),hi2=Math.max.apply(null,B);
 return lo1<=hi2+5&&lo2<=hi1+5;}
// ---- Composant autocomplétion ----
function makeAC(inputId,boxId,getOpts,onPick){
 var input=document.getElementById(inputId),box=document.getElementById(boxId);
 if(!input||!box)return null;
 var cur=[],idx=-1;
 function fuzzy(t,q){var i=0;for(var j=0;j<t.length;j++){if(t[j]===q[i])i++;if(i>=q.length)return true;}return false;}
 function compute(){var all=getOpts()||[];var q=seNorm(input.value);
  if(!q)return all.slice(0,15);
  var starts=[],incl=[],fz=[];
  all.forEach(function(o){var n=seNorm(o.label||o);
   if(n.indexOf(q)===0)starts.push(o);else if(n.indexOf(q)>0)incl.push(o);else if(fuzzy(n,q))fz.push(o);});
  return starts.concat(incl,fz).slice(0,15);}
 function render(){cur=compute();idx=-1;
  if(!cur.length){box.classList.remove('open');return;}
  var h='';for(var i=0;i<cur.length;i++){h+='<div class="ac-item" data-i="'+i+'">'+esc(cur[i].label||cur[i])+'</div>';}
  box.innerHTML=h;box.classList.add('open');
  Array.prototype.forEach.call(box.children,function(el,i){
   el.addEventListener('mousedown',function(ev){ev.preventDefault();pick(i);});
   el.addEventListener('touchstart',function(ev){ev.preventDefault();pick(i);},{passive:false});});}
 function pick(i){var o=cur[i];if(!o)return;input.value=o.label||o;box.classList.remove('open');if(onPick)onPick(input.value);}
 function highlight(){Array.prototype.forEach.call(box.children,function(el,i){if(i===idx)el.classList.add('sel');else el.classList.remove('sel');});}
 input.addEventListener('focus',render);
 input.addEventListener('click',render);
 input.addEventListener('input',render);
 input.addEventListener('keydown',function(e){
  if(e.key==='ArrowDown'){e.preventDefault();if(!box.classList.contains('open'))render();idx=Math.min(idx+1,cur.length-1);highlight();}
  else if(e.key==='ArrowUp'){e.preventDefault();idx=Math.max(idx-1,0);highlight();}
  else if(e.key==='Enter'){if(box.classList.contains('open')&&idx>=0){e.preventDefault();pick(idx);}else{box.classList.remove('open');var b=document.getElementById('gBtn2');if(b)b.click();}}
  else if(e.key==='Escape'){box.classList.remove('open');}});
 input.addEventListener('blur',function(){setTimeout(function(){box.classList.remove('open');},200);});
 return {refresh:render};}
// ---- Options en cascade ----
function optsBrand(){return catalogBrands().map(function(k){return {v:k,label:PRETTY_BRANDS[k]||cap(k)};});}
function optsModel(){return modelsFor(val('gBrand2'));}
function optsMotor(){return motorsFor(val('gBrand2'),val('gModel2'));}
function optsPower(){return powersFor(val('gBrand2'),val('gModel2'),val('gMotor2'));}
// ---- Filtrage + rapport (v13.1 conservé) ----
function garageSel(){return {brand:val('gBrand2'),model:val('gModel2'),motor:val('gMotor2'),power:val('gPower2'),sub:val('gSub2')};}
function garageFilter(s,mask){mask=mask||{};var out=[];
 for(var i=0;i<RECALLS.length;i++){var r=RECALLS[i];
  if(s.sub&&r.subsys&&r.subsys!==s.sub)continue;
  if(!brandMatch(r.brand||'',s.brand))continue;
  if(s.model&&!mask.model){var rm=seNorm(cleanModel(r.models||''));var toks=modelTokens(s.model);
   if(toks.length&&!/multi|tous/i.test(rm)){var all=toks.every(function(t){return rm.indexOf(t)>=0;});if(!all&&rm.indexOf(toks[0])<0)continue;}}
  if(s.motor&&!mask.motor){var rmot=seNorm(String(r.motor||'')+' '+String(r.models||''));var t0=seNorm(s.motor).split(/[\s/]+/)[0];
   if(t0&&!/tous/i.test(rmot)&&rmot.indexOf(t0)<0)continue;}
  if(s.power&&s.power!=='Toutes'&&!mask.power){if(r.power&&r.power!=='-'&&!powerOverlap2(r.power,s.power))continue;}
  out.push(r);}
 return out;}
var TITRES_BUCKETS={fire:'🔥 Incendie / rappel feu',elec:'⚡ Électrique / court-circuit',mech:'⚙️ Mécanique / courroie / boîte',turbo:'🌀 Turbo',egr:'♻️ Vanne EGR',dpf:'🌫️ DPF / FAP / GPF',adblue:'💧 AdBlue / SCR',adas:'📡 ADAS',camera:'📷 Caméras',charge:'🔌 Charge',range:'🔋 Autonomie / 12-48-HT',leak:'🛢️ Fuites',overheat:'🌡️ Surchauffe',fuel:'⛽ Carburant / GPL',belt:'⛓️ Courroie',gearbox:'⚙️ Boîte'};
function garageDiag2(){var d=document.getElementById('garageReport2');if(!d)return;var s=garageSel();
 if(!s.brand){d.innerHTML='<p class="no-results">Tapez ou choisissez une marque (suggestions dès la 1ʳ lettre)</p>';return;}
 var mask={},list=garageFilter(s,mask),relax='';
 if(!list.length&&s.power){mask={power:1};list=garageFilter(s,mask);relax='puissance ignorée';}
 if(!list.length&&s.motor){mask={power:1,motor:1};list=garageFilter(s,mask);relax='motorisation + puissance ignorées';}
 if(!list.length&&s.model){mask={power:1,motor:1,model:1};list=garageFilter(s,mask);relax='marque seule (modèle/motorisation/puissance ignorés)';}
 var buckets={},exact=0,part=0,gen=0,warn=0;
 list.forEach(function(r){var v=verifyAttribution(r,s);
  if(v.warns.length)warn++;else if(v.level==='exact')exact++;else if(v.level==='partiel')part++;else gen++;
  var key=(r.subsys&&TITRES_BUCKETS[r.subsys])?r.subsys:bucketOf(r);
  if(!buckets[key])buckets[key]=[];buckets[key].push({r:r,v:v});});
 var html='<div class="search-results-header">🚘 '+esc(s.brand)+' '+esc(s.model)+' '+esc(s.motor)+' '+esc(s.power)+' → '+list.length+' défaut(s) | ✅ '+exact+' • 🟡 '+part+' • ⚪ '+gen+' • ⚠️ '+warn+(relax?' | ♻️ '+relax:'')+'</div>';
 Object.keys(buckets).forEach(function(k){html+='<h3>'+TITRES_BUCKETS[k]+' ('+buckets[k].length+')</h3>';
  buckets[k].forEach(function(x){var badge=x.v.warns.length?'⚠️':(x.v.level==='exact'?'✅':(x.v.level==='partiel'?'🟡':''));
   html+='<div class="cause-card"><span class="category-badge">'+badge+' '+x.v.level+'</span>'+
    (x.v.warns.length?'<span class="badge-src" style="background:#b71c1c">⚠️ '+esc(x.v.warns.join(', '))+'</span>':'<span class="badge-src">'+esc(x.r.src)+'</span>')+
    '<h3>'+esc(x.r.brand)+'</h3><p class="cause-type">'+esc(x.r.models)+' • '+esc(x.r.years)+'</p>'+
    '<p class="cause-desc"><strong>Défaut :</strong> '+esc(x.r.cause)+'</p>'+
    '<p class="cause-desc"><strong>Mécanisme :</strong> '+esc(x.r.mech)+'</p>'+
    '<p class="identification"><strong>Indices :</strong> '+esc(x.r.idx)+'</p>'+
    '<div class="photo-row">'+(x.r.photos||[]).map(function(p){return vePhoto(p);}).join('')+'</div></div>';});});
 if(!list.length)html+='<p class="no-results">Aucun défaut référencé pour cette combinaison.</p>';
 d.innerHTML=html;
 try{if(window.app&&app.db)idbPut(app.db,'userData',{key:'garage2',brand:s.brand,model:s.model,motor:s.motor,power:s.power,sub:s.sub});}catch(e){}
 console.log('[cascade-v14] résultat:',list.length,'| ✅',exact,'🟡',part,'⚪',gen,'⚠️',warn);}
function cascadeSelfTest(){var combos=[{brand:'Mercedes',model:'C W206',motor:'2.0 d',power:'145 kW'},{brand:'Peugeot',model:'3008 II',motor:'1.5 BlueHDi',power:'96 kW'},{brand:'Volkswagen',model:'ID.4',motor:'BEV',power:'125-220 kW'}];
 var res=combos.map(function(c){return garageFilter(c,{}).length;});
 try{localStorage.setItem('cascadeTest',JSON.stringify({t:Date.now(),res:res}));}catch(e){}
 console.log('[cascade-v14] AUTO-TEST (>0 attendu) :',res.join(' , '));return res;}
document.addEventListener('DOMContentLoaded',function(){
 var bEl=document.getElementById('gBrand2');
 if(!bEl){console.warn('[cascade-v14] champs absents');return;}
 makeAC('gBrand2','acBrand',optsBrand,function(){
  document.getElementById('gModel2').value='';document.getElementById('gMotor2').value='';document.getElementById('gPower2').value='';});
 makeAC('gModel2','acModel',optsModel,function(){
  document.getElementById('gMotor2').value='';document.getElementById('gPower2').value='';});
 makeAC('gMotor2','acMotor',optsMotor,function(){document.getElementById('gPower2').value='';});
 makeAC('gPower2','acPower',optsPower,null);
 var gb=document.getElementById('gBtn2');
 if(gb)gb.addEventListener('click',function(){try{garageDiag2();}catch(e){console.error('[cascade-v14]',e);document.getElementById('garageReport2').innerHTML='<div class="error">'+esc(e.message)+'</div>';}});
 var sub=document.getElementById('gSub2');
 if(sub)sub.addEventListener('change',function(){try{garageDiag2();}catch(e){}});
 try{cascadeSelfTest();}catch(e){console.error('[cascade-v14] selftest',e);}
 try{if(window.app&&app.db)idbGet(app.db,'userData','garage2').then(function(g){if(g&&g.brand){
  document.getElementById('gBrand2').value=g.brand||'';document.getElementById('gModel2').value=g.model||'';
  document.getElementById('gMotor2').value=g.motor||'';document.getElementById('gPower2').value=g.power||'';
  if(g.sub)document.getElementById('gSub2').value=g.sub;garageDiag2();}});}catch(e){}
 console.log('✅ ui-v14 chargé : autocomplétion marque/modèle/motorisation/puissance active');});
