// ================================================================
// UI v15 (__v15) - Autocomplétion AUTO-CONSTRUITE, sans dépendance CSS/markup
// marque > modèle > motorisation > puissance : suggestions dès 1 lettre
// ================================================================
var __v15=true;
var PRETTY_BRANDS={audi:'Audi',volkswagen:'Volkswagen',skoda:'Skoda',renault:'Renault',dacia:'Dacia',peugeot:'Peugeot',citroen:'Citroën',opel:'Opel',fiat:'Fiat',mercedes:'Mercedes',tesla:'Tesla',bmw:'BMW',ford:'Ford',toyota:'Toyota',hyundai:'Hyundai',kia:'Kia',byd:'BYD',mg:'MG',volvo:'Volvo',nissan:'Nissan',mazda:'Mazda',honda:'Honda',jeep:'Jeep',chevrolet:'Chevrolet',porsche:'Porsche',seat:'Seat',cupra:'Cupra',suzuki:'Suzuki',mitsubishi:'Mitsubishi',subaru:'Subaru',lexus:'Lexus',geely:'Geely',chery:'Chery',nio:'NIO',xpeng:'XPeng',zeekr:'Zeekr',vinfast:'VinFast',jaguar:'Jaguar',land rover:'Land Rover',smart:'Smart',polestar:'Polestar'};
function esc15(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function cap15(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
function val15(id){var e=document.getElementById(id);return e?e.value:'';}
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
 RECALLS.forEach(function(r){if(brandMatch(r.brand||'',brand)){String(r.models||'').split(',').forEach(function(m){var c=cleanModel(m);if(c&&c.length<45&&!/tous|multi/i.test(c))set[c]=1;});}});
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
  var parts=String(s).split('|');var pw=String(parts[1]||'').trim();
  if(seNorm(parts[0])===seNorm(motor||'')){if(pw)pw.split('/').forEach(function(x){set[x.trim()]=1;});else set['Toutes']=1;}});
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
// ---------- DOM auto-construit ----------
function styleBox(b){b.style.position='absolute';b.style.top='100%';b.style.left='0';b.style.right='0';b.style.background='#fff';
 b.style.border='2px solid #ff6f00';b.style.borderTop='none';b.style.borderRadius='0 0 8px 8px';b.style.maxHeight='240px';
 b.style.overflowY='auto';b.style.zIndex='4000';b.style.display='none';b.style.boxShadow='0 10px 24px rgba(0,0,0,.3)';}
function styleItem(el,sel){el.style.padding='.6rem .75rem';el.style.cursor='pointer';el.style.fontSize='.92rem';el.style.color='#212121';
 el.style.borderBottom='1px solid #f0f0f0';el.style.background=sel?'#ffe0b2':'#fff';}
function ensureAC(input){
 var wrap=input.parentElement;
 if(!wrap||!wrap.classList.contains('ac-wrap')){wrap=document.createElement('div');wrap.className='ac-wrap';
  input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);}
 wrap.style.position='relative';
 var box=wrap.querySelector('.ac-box');
 if(!box){box=document.createElement('div');box.className='ac-box';wrap.appendChild(box);}
 styleBox(box);
 input.setAttribute('autocomplete','off');
 input.style.padding='.8rem';input.style.border='2px solid #e0e0e0';input.style.borderRadius='8px';
 input.style.fontSize='.95rem';input.style.width='100%';input.style.background='#fff';input.style.color='#212121';
 return box;}
var AC_ALL=[];
function closeAllAC(except){AC_ALL.forEach(function(a){if(a.box!==except)a.box.style.display='none';});}
function attachAC(input,getOpts,onPick,nextFocusId){
 var box=ensureAC(input);var api={input:input,box:box,items:[],idx:-1};AC_ALL.push(api);
 function fuzzy(t,q){var i=0;for(var j=0;j<t.length;j++){if(t[j]===q[i])i++;if(i>=q.length)return true;}return false;}
 function compute(){var all=getOpts()||[];var q=seNorm(input.value);
  if(!q)return all.slice(0,12);
  var starts=[],incl=[],fz=[];
  all.forEach(function(o){var lab=String(o.label||o);var n=seNorm(lab);
   if(n.indexOf(q)===0)starts.push(o);else if(n.indexOf(q)>0)incl.push(o);else if(fuzzy(n,q))fz.push(o);});
  return starts.concat(incl,fz).slice(0,12);}
 function render(){api.items=compute();api.idx=-1;
  if(!api.items.length){box.style.display='none';return;}
  var q=seNorm(input.value);box.innerHTML='';
  api.items.forEach(function(o,i){var lab=String(o.label||o);var el=document.createElement('div');
   var n=seNorm(lab);var pos=q?n.indexOf(q):-1;
   if(pos>=0&&q)el.innerHTML=esc15(lab.slice(0,pos))+'<b style="color:#d32f2f">'+esc15(lab.slice(pos,pos+q.length))+'</b>'+esc15(lab.slice(pos+q.length));
   else el.textContent=lab;
   styleItem(el,false);
   el.addEventListener('pointerdown',function(ev){ev.preventDefault();ev.stopPropagation();pick(i);});
   el.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();pick(i);});
   box.appendChild(el);});
  box.style.display='block';}
 function pick(i){var o=api.items[i];if(!o)return;input.value=String(o.label||o);box.style.display='none';
  if(onPick)onPick(input.value);
  if(nextFocusId){var nf=document.getElementById(nextFocusId);if(nf){try{nf.focus();}catch(e){}}}}
 function highlight(){Array.prototype.forEach.call(box.children,function(el,i){styleItem(el,i===api.idx);});}
 input.addEventListener('focus',function(){render();});
 input.addEventListener('click',function(){render();});
 input.addEventListener('input',function(){render();});
 input.addEventListener('keyup',function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp')render();});
 input.addEventListener('keydown',function(e){
  if(e.key==='ArrowDown'){e.preventDefault();if(box.style.display!=='block')render();api.idx=Math.min(api.idx+1,api.items.length-1);highlight();}
  else if(e.key==='ArrowUp'){e.preventDefault();api.idx=Math.max(api.idx-1,0);highlight();}
  else if(e.key==='Enter'){if(box.style.display==='block'&&api.idx>=0){e.preventDefault();pick(api.idx);}else{box.style.display='none';var b=document.getElementById('gBtn2');if(b)b.click();}}
  else if(e.key==='Escape'){box.style.display='none';}});
 input.addEventListener('blur',function(){setTimeout(function(){box.style.display='none';},250);});
 api.render=render;return api;}
document.addEventListener('pointerdown',function(){closeAllAC(null);},true);
// ---------- Options cascade ----------
function optsBrand(){return catalogBrands().map(function(k){return {v:k,label:PRETTY_BRANDS[k]||cap15(k)};});}
function optsModel(){return modelsFor(val15('gBrand2'));}
function optsMotor(){return motorsFor(val15('gBrand2'),val15('gModel2'));}
function optsPower(){return powersFor(val15('gBrand2'),val15('gModel2'),val15('gMotor2'));}
// ---------- Filtrage + rapport ----------
function garageSel(){return {brand:val15('gBrand2'),model:val15('gModel2'),motor:val15('gMotor2'),power:val15('gPower2'),sub:val15('gSub2')};}
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
 if(!s.brand){d.innerHTML='<p class="no-results">Tapez les premières lettres de la marque : suggestions automatiques.</p>';return;}
 var mask={},list=garageFilter(s,mask),relax='';
 if(!list.length&&s.power){mask={power:1};list=garageFilter(s,mask);relax='puissance ignorée';}
 if(!list.length&&s.motor){mask={power:1,motor:1};list=garageFilter(s,mask);relax='motorisation + puissance ignorées';}
 if(!list.length&&s.model){mask={power:1,motor:1,model:1};list=garageFilter(s,mask);relax='marque seule';}
 var buckets={},exact=0,part=0,gen=0,warn=0;
 list.forEach(function(r){var v=verifyAttribution(r,s);
  if(v.warns.length)warn++;else if(v.level==='exact')exact++;else if(v.level==='partiel')part++;else gen++;
  var key=(r.subsys&&TITRES_BUCKETS[r.subsys])?r.subsys:bucketOf(r);
  if(!buckets[key])buckets[key]=[];buckets[key].push({r:r,v:v});});
 var html='<div class="search-results-header">🚘 '+esc15(s.brand)+' '+esc15(s.model)+' '+esc15(s.motor)+' '+esc15(s.power)+' → '+list.length+' défaut(s) | ✅ '+exact+' • 🟡 '+part+' • ⚪ '+gen+' • ⚠️ '+warn+(relax?' | ♻️ '+relax:'')+'</div>';
 Object.keys(buckets).forEach(function(k){html+='<h3>'+TITRES_BUCKETS[k]+' ('+buckets[k].length+')</h3>';
  buckets[k].forEach(function(x){var badge=x.v.warns.length?'⚠️':(x.v.level==='exact'?'✅':(x.v.level==='partiel'?'🟡':''));
   html+='<div class="cause-card"><span class="category-badge">'+badge+' '+x.v.level+'</span>'+
    (x.v.warns.length?'<span class="badge-src" style="background:#b71c1c">⚠️ '+esc15(x.v.warns.join(', '))+'</span>':'<span class="badge-src">'+esc15(x.r.src)+'</span>')+
    '<h3>'+esc15(x.r.brand)+'</h3><p class="cause-type">'+esc15(x.r.models)+' • '+esc15(x.r.years)+'</p>'+
    '<p class="cause-desc"><strong>Défaut :</strong> '+esc15(x.r.cause)+'</p>'+
    '<p class="cause-desc"><strong>Mécanisme :</strong> '+esc15(x.r.mech)+'</p>'+
    '<p class="identification"><strong>Indices :</strong> '+esc15(x.r.idx)+'</p>'+
    '<div class="photo-row">'+(x.r.photos||[]).map(function(p){return vePhoto(p);}).join('')+'</div></div>';});});
 if(!list.length)html+='<p class="no-results">Aucun défaut référencé pour cette combinaison.</p>';
 d.innerHTML=html;
 try{if(window.app&&app.db)idbPut(app.db,'userData',{key:'garage2',brand:s.brand,model:s.model,motor:s.motor,power:s.power,sub:s.sub});}catch(e){}
 console.log('[v15] résultat:',list.length,'✅',exact,'🟡',part,'⚪',gen,'⚠️',warn);}
function cascadeSelfTest(){var combos=[{brand:'Mercedes',model:'C W206',motor:'2.0 d',power:'145 kW'},
 {brand:'Renault',model:'Renault 5 E-Tech',motor:'BEV 52 kWh',power:'90-110 kW'},
 {brand:'Skoda',model:'Elroq',motor:'BEV 77',power:'150-210 kW'},
 {brand:'Dacia',model:'Bigster',motor:'1.2 TCe MHEV',power:'96-103 kW'}];
 var res=combos.map(function(c){return garageFilter(c,{}).length;});
 try{localStorage.setItem('cascadeTest',JSON.stringify({t:Date.now(),res:res}));}catch(e){}
 console.log('[v15] AUTO-TEST (>0 attendu) :',res.join(' , '));return res;}
// ---------- Bootstrap auto-réparateur ----------
document.addEventListener('DOMContentLoaded',function(){
 try{
  var host=document.getElementById('garageReport2');
  var form=document.querySelector('.garage-form');
  var bEl=document.getElementById('gBrand2'),mEl=document.getElementById('gModel2'),moEl=document.getElementById('gMotor2'),pEl=document.getElementById('gPower2');
  if(!bEl){ // auto-construction complète si markup absent
   var sec=document.createElement('section');sec.className='search-section garage-box';
   sec.innerHTML='<h2 style="margin-top:0">🚘 Mon véhicule — suggestions automatiques</h2><div class="garage-form" id="gForm15"></div><div id="garageReport2"></div>';
   var hdr=document.querySelector('.app-header');if(hdr&&hdr.parentNode)hdr.parentNode.insertBefore(sec,hdr.nextSibling);
   form=sec.querySelector('.garage-form');host=sec.querySelector('#garageReport2');
   ['gBrand2:Marque : « mer », « ren »...','gModel2:Modèle : « 5 », « elroq »...','gMotor2:Motorisation : « bev », « 1.2 »...','gPower2:Puissance : « 96 », « 145 »...'].forEach(function(spec){
    var id=spec.split(':')[0],ph=spec.split(':')[1];var inp=document.createElement('input');inp.id=id;inp.placeholder=ph;form.appendChild(inp);});
   var sel=document.createElement('select');sel.id='gSub2';sel.innerHTML='<option value="">Tous sous-systèmes</option><option value="elec">⚡ Électrique</option><option value="mech">⚙️ Mécanique</option><option value="belt">⛓️ Courroie</option><option value="gearbox">⚙️ Boîte</option><option value="turbo">🌀 Turbo</option><option value="egr">♻️ EGR</option><option value="dpf">🌫️ DPF/FAP/GPF</option><option value="adblue">💧 AdBlue</option><option value="adas">📡 ADAS</option><option value="camera">📷 Caméra</option><option value="charge">🔌 Charge</option><option value="range">🔋 Autonomie</option><option value="leak">🛢️ Fuite</option><option value="overheat">🌡️ Surchauffe</option><option value="fuel">⛽ Carburant/GPL</option>';
   form.appendChild(sel);
   var btn=document.createElement('button');btn.id='gBtn2';btn.className='btn-primary';btn.textContent='🚘 Analyser (attribution vérifiée)';form.appendChild(btn);
   bEl=document.getElementById('gBrand2');mEl=document.getElementById('gModel2');moEl=document.getElementById('gMotor2');pEl=document.getElementById('gPower2');}
  if(bEl.tagName==='SELECT'){ // conversion anciens selects → inputs
   ['gBrand2','gModel2','gMotor2','gPower2'].forEach(function(id){var s=document.getElementById(id);if(s&&s.tagName==='SELECT'){var inp=document.createElement('input');inp.id=id;inp.placeholder=s.options[0]?s.options[0].text:'';s.parentNode.replaceChild(inp,s);}});
   bEl=document.getElementById('gBrand2');mEl=document.getElementById('gModel2');moEl=document.getElementById('gMotor2');pEl=document.getElementById('gPower2');}
  attachAC(bEl,optsBrand,function(){mEl.value='';moEl.value='';pEl.value='';},'gModel2');
  attachAC(mEl,optsModel,function(){moEl.value='';pEl.value='';},'gMotor2');
  attachAC(moEl,optsMotor,function(){pEl.value='';},'gPower2');
  attachAC(pEl,optsPower,null,null);
  var gb=document.getElementById('gBtn2');
  if(gb)gb.addEventListener('click',function(){try{garageDiag2();}catch(e){console.error('[v15]',e);var d=document.getElementById('garageReport2');if(d)d.innerHTML='<div class="error">'+esc15(e.message)+'</div>';}});
  var sub=document.getElementById('gSub2');
  if(sub)sub.addEventListener('change',function(){try{garageDiag2();}catch(e){}});
  cascadeSelfTest();
  try{if(window.app&&app.db)idbGet(app.db,'userData','garage2').then(function(g){if(g&&g.brand){
   bEl.value=g.brand||'';mEl.value=g.model||'';moEl.value=g.motor||'';pEl.value=g.power||'';
   var s2=document.getElementById('gSub2');if(s2&&g.sub)s2.value=g.sub;garageDiag2();}});}catch(e){}
  console.log('✅ ui-v15 actif : autocomplétion auto-construite opérationnelle');
 }catch(err){console.error('[v15] bootstrap',err);}});
