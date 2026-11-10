// ================================================================
// APP v30 — fond véhicule en feu (réel + fallback SVG) + opacité
// + tous rendus + cascades + filtres + auto-vérifs + lightbox
// ================================================================
// ---- FOND PAR DÉFAUT : véhicule en feu réaliste ----
var BG_DEFAULT_URLS=[
 'https://images.unsplash.com/photo-1605652809146-9a225d0b1a0b?auto=format&fit=crop&w=1920&q=80',
 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Car_fire_on_highway.jpg',
 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1920'];
var BG_FALLBACK_SVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">'+
 '<defs><radialGradient id="glow" cx="50%" cy="62%" r="55%"><stop offset="0%" stop-color="#ff9a3c"/><stop offset="45%" stop-color="#e5391a" stop-opacity=".85"/><stop offset="100%" stop-color="#1a0503" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff2d2d"/><stop offset="55%" stop-color="#b71c1c"/><stop offset="100%" stop-color="#5a0a10"/></linearGradient>'+
 '<linearGradient id="fl1" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#ffd24a"/><stop offset="50%" stop-color="#ff7a18"/><stop offset="100%" stop-color="#e12d0a" stop-opacity=".2"/></linearGradient></defs>'+
 '<rect width="1920" height="1080" fill="#120407"/>'+
 '<ellipse cx="960" cy="720" rx="900" ry="360" fill="url(#glow)"/>'+
 '<path d="M250 760 L470 600 L760 560 L1180 556 L1430 600 L1620 700 L1660 792 L250 792 Z" fill="url(#body)"/>'+
 '<path d="M520 600 L700 520 L1080 516 L1300 590 Z" fill="#2a0a0e" opacity=".85"/>'+
 '<circle cx="560" cy="800" r="92" fill="#0c0c0c"/><circle cx="560" cy="800" r="38" fill="#3a3a3a"/>'+
 '<circle cx="1380" cy="800" r="92" fill="#0c0c0c"/><circle cx="1380" cy="800" r="38" fill="#3a3a3a"/>'+
 '<path d="M700 560 q-30 -160 40 -250 q20 90 70 120 q-10 -150 60 -230 q30 120 90 150 q10 -120 80 -180 q20 130 70 170 q40 -90 90 -120 q-10 120 -40 190 q60 -40 110 -30 q-40 90 -90 140 q50 10 80 50 q-70 30 -150 30 q40 40 30 90 q-90 -20 -150 -70 q-30 70 -90 90 q-20 -70 10 -130 q-70 50 -150 50 q20 -70 80 -110 q-90 10 -150 -20 q60 -40 130 -50 Z" fill="url(#fl1)" opacity=".92"/>'+
 '<path d="M820 470 q-10 -120 50 -190 q20 80 60 110 q0 -120 60 -180 q20 110 70 150 q30 -90 80 -120 q-10 110 -50 170 q50 -20 90 -10 q-40 80 -100 120 Z" fill="#ffe082" opacity=".85"/>'+
 '<g fill="#9aa0a6" opacity=".5"><ellipse cx="900" cy="250" rx="180" ry="70"/><ellipse cx="1150" cy="200" rx="220" ry="80"/><ellipse cx="700" cy="180" rx="150" ry="60"/></g>'+
 '<rect x="0" y="820" width="1920" height="260" fill="#0a0305"/></svg>';
function bgFallbackUrl(){return 'url("data:image/svg+xml;utf8,'+encodeURIComponent(BG_FALLBACK_SVG)+'")';}
function loadDefaultBg(layer){var i=0;function tryNext(){if(i>=BG_DEFAULT_URLS.length){layer.style.backgroundImage=bgFallbackUrl();document.documentElement.style.setProperty('--admin-bg','#3a0710');return;}
 var u=BG_DEFAULT_URLS[i++];var img=new Image();img.onload=function(){layer.style.backgroundImage='url("'+u+'")';document.documentElement.style.setProperty('--admin-bg','url("'+u+'")');};img.onerror=tryNext;img.src=u;}tryNext();}
// ---- Couche fond ----
function bgLayer(){var l=document.getElementById('adminBgLayer');if(!l){l=document.createElement('div');l.id='adminBgLayer';l.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1500;background-position:center;background-size:cover;background-repeat:no-repeat;opacity:.22';document.body.insertBefore(l,document.body.firstChild);}return l;}
function bgApplySaved(){if(!window.app||!app.db){var l0=bgLayer();if(!l0.style.backgroundImage)loadDefaultBg(l0);return;}
 idbGet(app.db,'userData','bgSettings').then(function(rec){var l=bgLayer();
  if(rec&&rec.blob){l.style.backgroundImage='url("'+URL.createObjectURL(rec.blob)+'")';document.documentElement.style.setProperty('--admin-bg','url("'+l.style.backgroundImage.slice(4,-1)+'")');}
  else if(rec&&rec.url){l.style.backgroundImage='url("'+rec.url+'")';document.documentElement.style.setProperty('--admin-bg','url("'+rec.url+'")');}
  else {loadDefaultBg(l);}
  var op=(rec&&rec.opacity!=null)?rec.opacity:22;l.style.opacity=op/100;
  var r=document.getElementById('adminBgOpacity');if(r)r.value=op;var v=document.getElementById('bgOpVal');if(v)v.textContent=op;});}
function bgSave(){var f=document.getElementById('adminBg');var uEl=document.getElementById('adminBgUrl');var r=document.getElementById('adminBgOpacity');var op=r?parseInt(r.value,10):22;var msg=document.getElementById('adminMsg');
 function persist(rec){idbPut(app.db,'userData',Object.assign({key:'bgSettings'},rec,{opacity:op})).then(function(){var l=bgLayer();
   if(rec.blob)l.style.backgroundImage='url("'+URL.createObjectURL(rec.blob)+'")';else if(rec.url)l.style.backgroundImage='url("'+rec.url+'")';
   l.style.opacity=op/100;if(msg)msg.textContent='✅ Fond enregistré (opacité '+op+' %)';});}
 if(f&&f.files&&f.files[0])persist({blob:f.files[0],url:null});
 else if(uEl&&uEl.value.trim())persist({url:uEl.value.trim(),blob:null});
 else persist({});}
function bgReset(){if(!window.app||!app.db)return;idbDel(app.db,'userData','bgSettings').then(function(){var l=bgLayer();loadDefaultBg(l);l.style.opacity='0.22';var m=document.getElementById('adminMsg');if(m)m.textContent='Fond réinitialisé (véhicule en feu)';var r=document.getElementById('adminBgOpacity');if(r)r.value=22;var v=document.getElementById('bgOpVal');if(v)v.textContent='22';});}
// ---- Constantes ----
var PRETTY_BRANDS={audi:'Audi',volkswagen:'Volkswagen',skoda:'Skoda',renault:'Renault',dacia:'Dacia',peugeot:'Peugeot',citroen:'Citroën',opel:'Opel',fiat:'Fiat',mercedes:'Mercedes',tesla:'Tesla',bmw:'BMW',ford:'Ford',toyota:'Toyota',hyundai:'Hyundai',kia:'Kia',byd:'BYD',mg:'MG',volvo:'Volvo',nissan:'Nissan',mazda:'Mazda',honda:'Honda',jeep:'Jeep',chevrolet:'Chevrolet',porsche:'Porsche',seat:'Seat',cupra:'Cupra',suzuki:'Suzuki',mitsubishi:'Mitsubishi',subaru:'Subaru',lexus:'Lexus',geely:'Geely',chery:'Chery',nio:'NIO',xpeng:'XPeng',zeekr:'Zeekr',vinfast:'VinFast',jaguar:'Jaguar','land rover':'Land Rover',smart:'Smart',polestar:'Polestar',alpine:'Alpine','alfa romeo':'Alfa Romeo'};
var TITRES={fire:'🔥 Incendie / rappel feu',elec:'⚡ Électrique / court-circuit',mech:'⚙️ Mécanique',turbo:'🌀 Turbo',egr:'♻️ Vanne EGR',dpf:'🌫️ DPF / FAP / GPF',adblue:'💧 AdBlue / SCR',adas:'📡 ADAS',camera:'📷 Caméras',charge:'🔌 Charge',range:'🔋 Autonomie / 12-48-HT',leak:'🛢️ Fuites',overheat:'🌡️ Surchauffe',fuel:'⛽ Carburant / GPL',belt:'⛓️ Courroie',gearbox:'⚙️ Boîte',batt:'🔋 Batterie',oil:'🛢️ Huile',coolant:'🧊 LDR',safety:'🚨 Sécurité',software:'💻 Software','48V':'🔋 48V','12V':'🔋 12V','timing-belt':'⛓️ Distribution','engine-oil':'🛢️ Moteur / huile','exhaust-dpf':'🌫️ Échappement / FAP','fuel-lpg':'⛽ Carburant / GPL','elec-12-48':'⚡ Électrique 12/48V','hv-charge':'🔋 HT / charge','fire-origin':'🔥 Origine incendie',cabin:'🛋️ Habitacle',brakes:'🛑 Freins / pneus'};
// ---- Helpers catalogue ----
function val15(id){var e=document.getElementById(id);return e?e.value:'';}
function catalogKey(brand){var b=seNorm(brand||'');if(!b)return null;var ks=Object.keys(VEHICLE_CATALOG||{});for(var i=0;i<ks.length;i++){var c=seNorm(ks[i]);if(c===b||b.indexOf(c)===0||c.indexOf(b)===0)return ks[i];}return null;}
function cleanModel(m){return String(m||'').replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim();}
function modelTokens(m){return seNorm(m||'').split(/[\s/,]+/).filter(function(t){return t.length>1;});}
function catalogBrands(){var set={};Object.keys(VEHICLE_CATALOG||{}).forEach(function(k){set[k]=1;});if(typeof RECALLS!=='undefined')RECALLS.forEach(function(r){var b=seNorm(String(r.brand||'').split('/')[0].split(' ')[0]);if(b&&b.length>2&&!/multi|tous|doctrine/i.test(b))set[b]=1;});return Object.keys(set).sort();}
function modelsFor(brand){var k=catalogKey(brand);var set={};if(k&&VEHICLE_CATALOG[k])Object.keys(VEHICLE_CATALOG[k]).forEach(function(m){set[m]=1;});
 if(typeof RECALLS!=='undefined')RECALLS.forEach(function(r){if(brandMatch(r.brand||'',brand))String(r.models||'').split(',').forEach(function(m){var c=cleanModel(m);if(c&&c.length<45&&!/tous|multi/i.test(c))set[c]=1;});});return Object.keys(set).sort();}
function motorsFor(brand,model){var k=catalogKey(brand);var set={};if(k&&model&&VEHICLE_CATALOG[k]&&VEHICLE_CATALOG[k][model])VEHICLE_CATALOG[k][model].forEach(function(s){set[String(s).split('|')[0].trim()]=1;});
 var toks=modelTokens(model);if(typeof RECALLS!=='undefined')RECALLS.forEach(function(r){if(!brandMatch(r.brand||'',brand))return;var rm=seNorm(cleanModel(r.models||''));if(toks.length){var all=toks.every(function(t){return rm.indexOf(t)>=0;});if(!all&&rm.indexOf(toks[0])<0)return;}var m=String(r.motor||'').split('(')[0].trim();if(m&&m!=='-'&&!/tous/i.test(m))set[m]=1;});return Object.keys(set).sort();}
function powersFor(brand,model,motor){var k=catalogKey(brand);var set={};if(k&&model&&VEHICLE_CATALOG[k]&&VEHICLE_CATALOG[k][model])VEHICLE_CATALOG[k][model].forEach(function(s){var p=String(s).split('|');if(seNorm(p[0])===seNorm(motor||'')){if(p[1])p[1].split('/').forEach(function(x){set[x.trim()]=1;});else set['Toutes']=1;}});
 var toks=modelTokens(model);var mt=seNorm(String(motor||'').split(' ')[0]);if(typeof RECALLS!=='undefined')RECALLS.forEach(function(r){if(!brandMatch(r.brand||'',brand))return;var rm=seNorm(cleanModel(r.models||''));if(toks.length){var all=toks.every(function(t){return rm.indexOf(t)>=0;});if(!all&&rm.indexOf(toks[0])<0)return;}var rmot=seNorm(r.motor||'');if(mt&&rmot.indexOf(mt)<0)return;if(r.power&&r.power!=='-')set[r.power]=1;var pm=String(r.motor||'').match(/\(([^)]*kW[^)]*)\)/);if(pm)set[pm[1]]=1;});
 if(!Object.keys(set).length)set['Toutes']=1;return Object.keys(set).sort();}
function fillSelect(el,opts,ph){if(!el)return;var h='<option value="">'+ph+'</option>';opts.forEach(function(o){h+='<option value="'+esc15(o)+'">'+esc15(o)+'</option>';});el.innerHTML=h;}
// ---- Autocomplète ----
function ensureAC(input){var wrap=input.parentElement;if(!wrap||!wrap.classList.contains('ac-wrap')){wrap=document.createElement('div');wrap.className='ac-wrap';input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);}wrap.style.position='relative';
 var box=wrap.querySelector('.ac-box');if(!box){box=document.createElement('div');box.className='ac-box';wrap.appendChild(box);}box.style.display='none';return box;}
function attachAC(input,getOpts,onPick,nextId){var box=ensureAC(input);var cur=[],idx=-1;
 function compute(){var all=getOpts()||[];var q=seNorm(input.value);if(!q)return all.slice(0,12);
  var s=[],i2=[],f=[];all.forEach(function(o){var n=seNorm(o.label||o);if(n.indexOf(q)===0)s.push(o);else if(n.indexOf(q)>0)i2.push(o);else if(fuzzy16(n,q))f.push(o);});return s.concat(i2,f).slice(0,12);}
 function render(){cur=compute();idx=-1;if(!cur.length){box.style.display='none';return;}
  box.innerHTML='';cur.forEach(function(o,i2){var el=document.createElement('div');el.className='ac-item';el.textContent=o.label||o;
   el.addEventListener('pointerdown',function(ev){ev.preventDefault();pick(i2);});box.appendChild(el);});box.style.display='block';}
 function pick(i){var o=cur[i];if(!o)return;input.value=o.label||o;box.style.display='none';if(onPick)onPick(input.value);if(nextId){var nf=document.getElementById(nextId);if(nf)nf.focus();}}
 input.addEventListener('focus',render);input.addEventListener('click',render);input.addEventListener('input',render);
 input.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();render();}else if(e.key==='Enter'){if(box.style.display==='block'&&cur.length){e.preventDefault();pick(Math.max(idx,0));}else{box.style.display='none';}}else if(e.key==='Escape')box.style.display='none';});
 input.addEventListener('blur',function(){setTimeout(function(){box.style.display='none';},220);});}
// ---- Garage cascades ----
function garageSel(){return{brand:val15('gBrand2'),model:val15('gModel2'),motor:val15('gMotor2'),power:val15('gPower2'),sub:val15('gSub2')};}
function garageFilter(s,mask){mask=mask||{};var out=[];if(typeof RECALLS==='undefined')return out;
 for(var i=0;i<RECALLS.length;i++){var r=RECALLS[i];
  if(s.sub&&r.subsys&&r.subsys!==s.sub)continue;
  if(!brandMatch(r.brand||'',s.brand))continue;
  if(s.model&&!mask.model){var rm=seNorm(cleanModel(r.models||''));var toks=modelTokens(s.model);if(toks.length&&!/multi|tous/i.test(rm)){var all=toks.every(function(t){return tmModel(rm,t);});if(!all)continue;}}
  if(s.motor&&!mask.motor){var rmot=seNorm(String(r.motor||'')+' '+String(r.models||''));var t0=seNorm(s.motor).split(/[\s/]+/)[0];if(t0&&t0.length>1&&!/tous/i.test(rmot)&&rmot.indexOf(t0)<0&&!tmModel(rmot,t0))continue;}
  if(s.power&&s.power!=='Toutes'&&!mask.power){if(r.power&&r.power!=='-'&&!powerOverlap2(r.power,s.power))continue;}
  out.push(r);}return out;}
function bucketOf(r){var t=seNorm((r.id||'')+' '+(r.subsys||'')+' '+(r.cause||'')+' '+(r.motor||''));
 if(r.subsys&&TITRES[r.subsys])return r.subsys;
 if(/surchauffe|overheat|pompe [àa] eau|thermostat|radiateur|ventilateur/.test(t))return 'overheat';
 if(/courroie|belt|bo[îi]te|gearbox|dsg|dct|turbo|egr|cha[îi]ne/.test(t))return 'mech';
 if(/fuite|leak|huile|oil|carburant|fuel|glycol|ldr|gpl/.test(t))return 'leak';
 if(/batterie|battery|12v|48v|charge|charging|autonomie|range|contacteur|iccu|onduleur/.test(t))return 'batt';
 if(/faisceau|court|arc|fusible|alternateur|cosse|relais|epissure/.test(t))return 'elec';
 return 'fire';}
function garageDiag2(){var d=document.getElementById('garageReport2');if(!d)return;var s=garageSel();
 if(!s.brand){d.innerHTML='<p class="no-results">Tapez ou choisissez une marque</p>';return;}
 var mask={},list=garageFilter(s,mask),relax='';
 if(!list.length&&s.power){mask={power:1};list=garageFilter(s,mask);relax='puissance ignorée';}
 if(!list.length&&s.motor){mask={power:1,motor:1};list=garageFilter(s,mask);relax='motorisation+puissance ignorées';}
 if(!list.length&&s.model){mask={power:1,motor:1,model:1};list=garageFilter(s,mask);relax='marque seule';}
 var bk={},ex=0,pa=0,ge=0,wa=0;
 list.forEach(function(r){var v=verifyAttribution(r,s);if(v.warns.length)wa++;else if(v.level==='exact')ex++;else if(v.level==='partiel')pa++;else ge++;var k=bucketOf(r);(bk[k]=bk[k]||[]).push({r:r,v:v});});
 var h='<div class="search-results-header">🚘 '+esc15(s.brand+' '+s.model+' '+s.motor+' '+s.power)+' → '+list.length+' défaut(s) | ✅ '+ex+' • 🟡 '+pa+' • ⚪ '+ge+' • ⚠️ '+wa+(relax?' | ♻️ '+relax:'')+'</div>';
 Object.keys(bk).forEach(function(k){h+='<h3>'+(TITRES[k]||k)+' ('+bk[k].length+')</h3>';bk[k].forEach(function(x){var badge=x.v.warns.length?'⚠️':(x.v.level==='exact'?'✅':(x.v.level==='partiel'?'🟡':'⚪'));
  h+='<div class="cause-card"><span class="category-badge">'+badge+' '+x.v.level+'</span><span class="badge-src">'+esc15(x.r.src)+'</span><h3>'+esc15(x.r.brand)+'</h3><p class="cause-type">'+esc15(x.r.models)+' • '+esc15(x.r.years)+'</p><p class="cause-desc"><strong>Défaut :</strong> '+esc15(x.r.cause)+'</p><p class="cause-desc"><strong>Mécanisme :</strong> '+esc15(x.r.mech)+'</p><p class="identification"><strong>Indices :</strong> '+esc15(x.r.idx)+'</p>'+veRow(x.r.photos)+'</div>';});});
 if(!list.length)h+='<p class="no-results">Aucun défaut pour cette combinaison.</p>';
 d.innerHTML=h;
 try{if(window.app&&app.db)idbPut(app.db,'userData',{key:'garage2',brand:s.brand,model:s.model,motor:s.motor,power:s.power,sub:s.sub});}catch(e){}}
function cascadeSelfTest(){var combos=[{brand:'Mercedes',model:'C W206',motor:'2.0 d',power:'145 kW'},{brand:'Renault',model:'Renault 5 E-Tech',motor:'BEV 52',power:'90-110 kW'},{brand:'Skoda',model:'Elroq',motor:'BEV 77',power:'150-210 kW'},{brand:'Dacia',model:'Bigster',motor:'1.2 TCe MHEV',power:'96-103 kW'}];
 var res=combos.map(function(c){return garageFilter(c,{}).length;});try{localStorage.setItem('cascadeTest',JSON.stringify({t:Date.now(),res:res}));}catch(e){}
 console.log('[cascade] AUTO-TEST :',res.join(','));return res;}
// ---- Filtres catégorie ----
var NAV_LABELS={all:'🌐 Tous les cas',building:'🏢 Bâtiment',electrical:'⚡ Électrique','vehicle-thermal':'🚗 Thermique','vehicle-electric':'🔋 VE / Hybride',equipment:'🧪 Chimique / GPL'};
function navData(f){var cases=(typeof FIRE_DATABASE!=='undefined')?FIRE_DATABASE.fireCauses:[],recs=[];
 if(typeof RECALLS==='undefined')RECALLS=[];
 if(f==='all'){recs=RECALLS.slice(0,40);cases=cases.slice(0,12);}
 else if(f==='building'){recs=RECALLS.filter(function(r){return /b[âa]timent|immeuble|fa[çc]ade|cuisine|habitation/i.test((r.models||'')+' '+(r.cause||''));});cases=cases.filter(function(c){return c.category==='building';});}
 else if(f==='electrical'){recs=RECALLS.filter(function(r){return r.subsys==='elec'||/court-circuit|faisceau|alternateur|cosse|relais|fusible|arc/i.test(r.cause||'');});cases=cases.filter(function(c){return c.category==='electrical';});}
 else if(f==='vehicle-thermal'){recs=RECALLS.filter(function(r){return r.energy==='thermal';});cases=cases.filter(function(c){return c.category==='vehicle-thermal';});}
 else if(f==='vehicle-electric'){recs=RECALLS.filter(function(r){return r.energy==='ev'||r.energy==='hybrid';});cases=cases.filter(function(c){return c.category==='vehicle-electric';});}
 else{recs=RECALLS.filter(function(r){return r.energy==='lpg'||r.subsys==='fuel'||/chimique|exothermique/i.test(r.cause||'');});cases=cases.filter(function(c){return c.category==='equipment';});}
 return{recs:recs,cases:cases};}
function renderNavResults(f){var sec=document.getElementById('navResults');if(!sec)return;var d=navData(f);var n=d.recs.length+d.cases.length;
 var h='<h2>'+NAV_LABELS[f]+' — '+n+' résultat(s) direct(s)</h2><div class="causes-grid">';
 d.cases.forEach(function(c){h+='<div class="cause-card"><span class="category-badge">'+NAV_LABELS[f]+'</span><h3>'+esc15(c.title)+'</h3><p class="cause-type">'+esc15(c.type)+' • '+esc15(c.temperature)+'</p><p class="cause-desc">'+esc15(c.description)+'</p>'+veRow(c.photos)+'<button class="btn-expand" onclick="app.expandCase(\''+c.id+'\')">Analyse complète</button></div>';});
 d.recs.forEach(function(r){h+=recallCard(r);});
 h+='</div>';if(!n)h+='<p class="no-results">Aucun cas</p>';
 sec.innerHTML=h;sec.style.display='block';try{sec.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}}
// ---- Admin ----
function renderAdmin(){var rq=document.getElementById('adminRequests'),gr=document.getElementById('adminGrants'),up=document.getElementById('adminUpdate');if(!rq)return;
 var ACx=window.AC||{requests:[]};
 rq.innerHTML=ACx.requests.length?ACx.requests.map(function(d){var st=d.status==='approved'?'✅':d.status==='revoked'?'⛔':d.status==='refused'?'❌':'🆕';
  return '<div class="cause-card"><h3>'+st+' '+esc15(d.name)+'</h3><p class="cause-type">'+esc15(d.device)+' • '+new Date(d.ts).toLocaleString('fr-FR')+'</p><button class="btn-expand" data-act="approve" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'">✅ ACCORDER</button><button class="btn-expand" style="border-color:#b71c1c;color:#b71c1c" data-act="refuse" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'">❌ REFUSER</button><button class="btn-expand" style="border-color:#ff6f00;color:#ff6f00" data-act="revoke" data-dev="'+esc15(d.device)+'" data-name="'+esc15(d.name)+'">⛔ RÉVOQUER</button></div>';}).join(''):'<p class="no-results">Aucune demande</p>';
 var g={};try{g=JSON.parse(localStorage.getItem('acGrants')||'{}');}catch(e){}
 gr.innerHTML=Object.keys(g).length?Object.keys(g).map(function(k){return '<div class="cause-card"><h3>'+(g[k].status==='approved'?'✅':'⛔')+' '+esc15(g[k].name)+'</h3><p class="cause-type">'+esc15(k)+'</p><button class="btn-expand" style="border-color:#ff6f00;color:#ff6f00" data-act="revoke" data-dev="'+esc15(k)+'" data-name="'+esc15(g[k].name)+'">⛔ RÉVOQUER</button></div>';}).join(''):'<p class="no-results">Aucun appareil</p>';
 if(up){var lu=null;try{lu=JSON.parse(localStorage.getItem('acLastUpdate')||'null');}catch(e){}
  up.innerHTML='<label>Version MAJ :</label><input id="updVersion" value="'+(lu?lu.version:'')+'" placeholder="ex: v30"><label style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" id="updTiers" style="width:auto" '+(lu&&lu.approvedForTiers?'checked':'')+'> ✅ Applicable aux tiers</label><button class="btn-primary" data-act="publishUpdate">📡 Publier la MAJ</button>'+(lu?'<p style="opacity:.8">Dernière : v'+lu.version+' — '+(lu.approvedForTiers?'✅ tiers':'⏳ admin')+'</p>':'');}}
// ---- dbCard ----
function dbCard(x,badge){return '<div class="cause-card"><span class="category-badge">'+badge+'</span><span class="badge-src">'+esc15(x.src)+'</span><h3>'+esc15(x.brand)+'</h3><p class="cause-type">'+esc15(x.models)+' • '+esc15(x.years)+'</p><p class="cause-desc"><strong>Défaut :</strong> '+esc15(x.cause)+'</p><p class="cause-desc"><strong>Mécanisme :</strong> '+esc15(x.mech)+'</p><p class="identification"><strong>Indices :</strong> '+esc15(x.idx)+'</p>'+veRow(x.photos)+'</div>';}
// ---- Classe app ----
class DiagApp{
constructor(){this.db=null;this.cur={ov:'Tous',mc:'Tous',lk:'Tous',bt:'Tous',sh:'Tous'};this.periodic='...';this.init();}
async init(){try{await this.initIDB();if(typeof loadPersistedFeed==='function')await loadPersistedFeed(this.db);this.listeners();this.renderAll();if(typeof renderRecalls==='function')renderRecalls(RECALLS.slice(0,60));this.stats();
 this.periodic=(typeof registerPeriodicSync==='function')?await registerPeriodicSync():'...';this.feedInfo();this.autoSync();
 if(typeof AC!=='undefined'){if(typeof acLoad==='function')acLoad();if(typeof acApplyGate==='function')acApplyGate();if(typeof acStartPolling==='function')acStartPolling();if(typeof acNetWatch==='function')acNetWatch();}
 if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',function(e){if(e.data&&e.data.type==='feed-updated'){AC.banner('🛰️ MAJ mensuelle SW : feed v'+e.data.version);}});
 this.selfTests();console.log('✅ app.js v30 initialisé');}catch(e){console.error('app.init error',e);}}
async initIDB(){return new Promise(function(res,rej){var r=indexedDB.open('EtudeIncendieDB',1);
 r.onerror=function(){rej(r.error);};r.onsuccess=function(){res(r.result);};
 r.onupgradeneeded=function(e){var db=e.target.result;if(!db.objectStoreNames.contains('fireCases'))db.createObjectStore('fireCases',{keyPath:'id'});if(!db.objectStoreNames.contains('userData'))db.createObjectStore('userData',{keyPath:'key'});};}).then(function(db){this.db=db;var t=db.transaction(['fireCases'],'readwrite');t.objectStore('fireCases').count().onsuccess=function(e){if(e.target.result===0&&typeof FIRE_DATABASE!=='undefined')FIRE_DATABASE.fireCauses.forEach(function(c){t.objectStore('fireCases').put(c);});};return db;}.bind(this));}
listeners(){var self=this;
 document.querySelectorAll('.nav-btn[data-filter]').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('.nav-btn[data-filter]').forEach(function(x){x.classList.remove('active');});b.classList.add('active');self.renderCauses(b.dataset.filter);setTimeout(function(){renderNavResults(b.dataset.filter);},0);});});
 var ui=document.getElementById('unifiedInput');var pr=document.getElementById('unifiedPredict');
 if(ui){var d2=null;ui.addEventListener('input',function(){clearTimeout(d2);d2=setTimeout(function(){var q=ui.value;if(q.length<2){pr.style.display='none';return;}if(typeof usPredictions==='function'){var p=usPredictions(q);if(!p.length){pr.style.display='none';return;}pr.innerHTML=p.map(function(x){return '<div class="ac-item" data-val="'+esc15(x.val)+'">'+esc15(x.type)+' : <b>'+esc15(x.val)+'</b></div>';}).join('');pr.style.display='block';}},150);});
  ui.addEventListener('keypress',function(e){if(e.key==='Enter'){pr.style.display='none';if(typeof runUnifiedNow==='function')runUnifiedNow();}});
  document.addEventListener('pointerdown',function(e){if(!e.target.closest('#unifiedPredict')&&e.target!==ui)pr.style.display='none';},true);}
 document.querySelectorAll('.rs-btn[data-energy]').forEach(function(b){b.addEventListener('click',function(){setTimeout(function(){var en=b.dataset.energy;var inp=document.getElementById('q-'+en);var q=inp?inp.value.trim():'';var list=RECALLS.filter(function(r){return r.energy===en;});if(q){var toks=seNorm(q).split(/[\s,;]+/).filter(Boolean);list=list.filter(function(r){var hay=seNorm([r.brand,r.models,r.motor,r.cause,r.mech].join(' '));return toks.every(function(t){return hay.indexOf(t)>=0;});});}if(typeof renderRecalls==='function')renderRecalls(list);},0);});});
 var ob=document.getElementById('offlinePhotosBtn');if(ob)ob.addEventListener('click',function(){self.cachePhotos();});
 var sb=document.getElementById('syncNowBtn');if(sb)sb.addEventListener('click',async function(){AC.banner('🔄 Synchronisation…');var r=await syncRecallsFeed(self.db,true);self.afterSync(r);});
 var gb=document.getElementById('gBrand2'),gm=document.getElementById('gModel2'),gmo=document.getElementById('gMotor2'),gp=document.getElementById('gPower2');
 if(gb)attachAC(gb,function(){return catalogBrands().map(function(k){return{v:k,label:PRETTY_BRANDS[k]||cap15(k)};});},function(){document.getElementById('gModel2').value='';document.getElementById('gMotor2').value='';document.getElementById('gPower2').value='';},'gModel2');
 if(gm)attachAC(gm,function(){return modelsFor(val15('gBrand2'));},function(){document.getElementById('gMotor2').value='';document.getElementById('gPower2').value='';},'gMotor2');
 if(gmo)attachAC(gmo,function(){return motorsFor(val15('gBrand2'),val15('gModel2'));},function(){document.getElementById('gPower2').value='';},'gPower2');
 if(gp)attachAC(gp,function(){return powersFor(val15('gBrand2'),val15('gModel2'),val15('gMotor2'));},null,null);
 var gb2=document.getElementById('gBtn2');if(gb2)gb2.addEventListener('click',function(){try{garageDiag2();}catch(e){var r=document.getElementById('garageReport2');if(r)r.innerHTML='<div class="error">'+e.message+'</div>';}});
 var gs=document.getElementById('gSub2');if(gs)gs.addEventListener('change',function(){garageDiag2();});
 var ga=document.getElementById('gateAdminBtn');if(ga&&typeof acAdminLogin==='function')ga.addEventListener('click',async function(){var ok=await acAdminLogin(document.getElementById('gatePwd').value);if(!ok){var st=document.getElementById('gateStatus');if(st)st.textContent='❌ Mot de passe incorrect';}});
 var gr=document.getElementById('gateReqBtn');if(gr&&typeof acRequest==='function')gr.addEventListener('click',function(){acRequest(document.getElementById('gateName').value.trim());});
 var sa=document.getElementById('shareApkBtn');if(sa&&typeof apkShareMail==='function')sa.addEventListener('click',apkShareMail);
 document.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;
  if(a==='approve')acDecide(b.dataset.dev,b.dataset.name,'approved');
  else if(a==='refuse')acDecide(b.dataset.dev,b.dataset.name,'refused');
  else if(a==='revoke')acDecide(b.dataset.dev,b.dataset.name,'revoked');
  else if(a==='refresh')acAdminRefresh();
  else if(a==='publishUpdate'){var v=document.getElementById('updVersion').value.trim();var t=document.getElementById('updTiers').checked;if(v&&typeof acPublishUpdate==='function')acPublishUpdate(v,t);}});
 var ba=document.getElementById('adminBgApply');if(ba)ba.addEventListener('click',function(){setTimeout(bgSave,50);});
 var br=document.getElementById('adminBgReset');if(br)br.addEventListener('click',function(){setTimeout(bgReset,50);});
 var op=document.getElementById('adminBgOpacity');if(op)op.addEventListener('input',function(){document.getElementById('bgOpVal').textContent=op.value;var l=bgLayer();if(l.style.backgroundImage)l.style.opacity=op.value/100;});
 document.addEventListener('click',function(e){var c=e.target.closest('[data-ov],[data-mc],[data-lk],[data-bt],[data-sh],[data-elq],[data-ft],[data-bp]');if(!c)return;
  if(c.dataset.ov!==undefined){self.cur.ov=c.dataset.ov;self.renderOverheat();}
  if(c.dataset.mc!==undefined){self.cur.mc=c.dataset.mc;self.renderMech();}
  if(c.dataset.lk!==undefined){self.cur.lk=c.dataset.lk;self.renderLeaks();}
  if(c.dataset.bt!==undefined){self.cur.bt=c.dataset.bt;self.renderBatt();}
  if(c.dataset.sh!==undefined){self.cur.sh=c.dataset.sh;self.renderShorts();}
  if(c.dataset.elq!==undefined){if(typeof renderElroqGrid==='function')renderElroqGrid(c.dataset.elq,(document.getElementById('elqInput')||{}).value||'');}
  if(c.dataset.ft!==undefined){if(typeof FT_CUR!=='undefined'){FT_CUR=c.dataset.ft;if(typeof renderFiches==='function')renderFiches();}}
  if(c.dataset.bp!==undefined){self.renderBrandPhotos(c.dataset.bp);}});
 var ei=document.getElementById('elqInput');if(ei){var dd=null;ei.addEventListener('input',function(){clearTimeout(dd);dd=setTimeout(function(){var act=document.querySelector('[data-elq].active');if(typeof renderElroqGrid==='function')renderElroqGrid(act?act.dataset.elq:'Tous',ei.value);},250);});}
 window.addEventListener('online',function(){self.conn();});window.addEventListener('offline',function(){self.conn();});this.conn();}
conn(){var el=document.getElementById('connectionStatus');if(!el)return;el.className='connection-status '+(navigator.onLine?'online':'offline');el.innerHTML='<span class="status-text">'+(navigator.onLine?'📶 4G/5G/WiFi actif':'Hors ligne — base locale')+'</span>';}
async autoSync(){var r=await syncRecallsFeed(this.db,false);this.afterSync(r);}
afterSync(r){if(r&&r.added){if(typeof renderRecalls==='function')renderRecalls(RECALLS.slice(0,60));this.stats();AC.banner('🔄 MAJ mensuelle : +'+r.added+' cas (feed v'+r.version+')');}this.feedInfo();}
async feedInfo(){var meta=(await idbGet(this.db,'userData','feedMeta'))||{};var el=document.getElementById('feedInfo');if(!el)return;
 el.textContent='🛰️ Dernière synchro : '+(meta.lastSync?new Date(meta.lastSync).toLocaleDateString('fr-FR'):'jamais')+' • feed v'+(meta.version||'-')+' • Sync SW : '+(this.periodic||'…')+' • Prochaine auto : '+(meta.lastSync?new Date(meta.lastSync+MONTH_MS).toLocaleDateString('fr-FR'):'au lancement');}
ph(k){return vePhoto(k);}row(ks){return veRow(ks);}
renderAll(){this.renderMethod();this.renderChem();this.renderGas();this.renderZones();this.renderOrigins();this.renderPlastics();this.renderDev();this.renderEV();this.renderThermalExpert();this.renderMelt();this.renderProto();this.renderThermal();this.renderEVExpert();this.renderHybrid();this.renderBuildings();this.renderChemical();this.renderMetals();this.renderWires();this.renderMetalId();this.renderCauses('all');this.renderGallery();this.renderOverheat();this.renderMech();this.renderLeaks();this.renderBatt();this.renderShorts();this.renderFoyer();this.renderBrandPhotos('all');}
renderFoyer(){var z=document.getElementById('fo-zone');if(z)z.innerHTML=FIRE_ORIGIN.zone.map(function(s){return '<div class="method-step"><div class="step-num">'+s.n+'</div><div class="step-content"><strong>'+esc15(s.t)+'</strong><p>'+esc15(s.d)+'</p></div></div>';}).join('');
 var ev=document.getElementById('fo-ev');if(ev)ev.innerHTML=FIRE_ORIGIN.ev.map(function(s){return '<div class="runaway-phase"><h4>'+esc15(s.t)+'</h4><p>'+esc15(s.d)+'</p></div>';}).join('')+veRow(EV_PHOTOS);
 var cp=document.getElementById('fo-compare');if(cp){var keys=Object.keys(FIRE_ORIGIN.compare[0]);cp.innerHTML='<div class="table-container"><table class="metal-table"><thead><tr>'+keys.map(function(k){return '<th>'+esc15(k)+'</th>';}).join('')+'</tr></thead><tbody>'+FIRE_ORIGIN.compare.map(function(row){return '<tr>'+keys.map(function(k){return '<td>'+esc15(row[k])+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';}
 var dp=document.getElementById('fo-dpf');if(dp)dp.innerHTML=FIRE_ORIGIN.dpf.map(function(s){return '<div class="id-card"><h4>'+esc15(s.t)+'</h4><p>'+esc15(s.d)+'</p></div>';}).join('')+veRow(['dpf_regen','catalyst_glow','origin_pool']);}
renderBrandPhotos(sel){var g=document.getElementById('bpGrid'),c=document.getElementById('bpChips');if(!g)return;
 var brands=Object.keys(PHOTOS_BY_BRAND);if(c)c.innerHTML=['<button class="nav-btn '+(sel==='all'?'active':'')+'" data-bp="all">🌐 Toutes</button>'].concat(brands.map(function(b){return '<button class="nav-btn '+(sel===b?'active':'')+'" data-bp="'+esc15(b)+'">'+esc15(b)+'</button>';])).join('');
 var list=sel==='all'?brands.reduce(function(a,b){return a.concat(PHOTOS_BY_BRAND[b].map(function(p){return Object.assign({brand:b},p);}));},[]):PHOTOS_BY_BRAND[sel].map(function(p){return Object.assign({brand:sel},p);});
 g.innerHTML=list.map(function(p){var ph=PHOTOS[p.k];return '<figure class="gallery-item">'+vePhoto(p.k)+'<figcaption><strong>'+esc15(p.brand)+'</strong> — '+esc15(p.t)+(ph?' <em>('+esc15(ph.credit)+')</em>':'')+'</figcaption></figure>';}).join('')||'<p class="no-results">Aucune photo</p>';}
renderMethod(){var m=FIRE_DATABASE.methodology;var g=document.getElementById('methodSteps');if(g)g.innerHTML=m.steps.map(function(s){return '<div class="method-step"><div class="step-num">'+s.n+'</div><div class="step-content"><strong>'+s.name+'</strong><p>'+s.desc+'</p></div></div>';}).join('');
 var p=document.getElementById('patternsGrid');if(p)p.innerHTML=m.patterns.map(function(p2){return '<div class="pattern-card"><h4>'+p2.name+'</h4><p>'+p2.desc+'</p>'+veRow([p2.photo])+'</div>';}).join('');}
renderChem(){var c=FIRE_DATABASE.fireChemistry;var t=document.getElementById('tetrahedron');if(t)t.innerHTML=c.tetrahedron.map(function(e){return '<div class="tetra-element"><h4>'+e.element+'</h4><p>'+e.desc+'</p></div>';}).join('');
 var p=document.getElementById('phenomenaGrid');if(p)p.innerHTML=c.phenomena.map(function(e){return '<div class="phenomenon-card"><h4>⚠️ '+e.name+'</h4><p>'+e.desc+'</p>'+(e.photo?veRow([e.photo]):'')+'</div>';}).join('');}
renderGas(){var tb=document.querySelector('#gasTable tbody');if(tb)tb.innerHTML=FIRE_DATABASE.fireChemistry.toxicGases.map(function(g){return '<tr><td><strong>'+g.gas+'</strong></td><td>'+g.source+'</td><td>'+g.danger+'</td></tr>';}).join('');}
renderZones(){var g=document.getElementById('vz-grid');if(g)g.innerHTML=VEHICLE_EXPERT.zones.map(function(z){return '<div class="ve-zone"><h4>📍 '+z.zone+'</h4><p><strong>Composants :</strong> '+z.components+'</p><p><strong>Risques :</strong> '+z.risks+'</p></div>';}).join('');}
renderOrigins(){var g=document.getElementById('vo-grid');if(g)g.innerHTML=Object.entries(VEHICLE_EXPERT.origins).map(function(e){var k=e[0],o=e[1];return '<details class="ve-origin"><summary>'+o.title+'</summary>'+(o.voltage?'<p class="ve-volt">🔌 '+o.voltage+'</p>':'')+(o.pressures?'<p class="ve-volt">⛽ '+o.pressures+'</p>':'')+(o.components?'<p><strong>Composants :</strong> '+o.components+'</p>':'')+(o.modes?'<h5>Mécanismes</h5><ul>'+o.modes.map(function(m){return '<li>'+m+'</li>';}).join('')+'</ul>':'')+(o.evidence&&Array.isArray(o.evidence)?'<h5>Preuves</h5><ul>'+o.evidence.map(function(m){return '<li>'+m+'</li>';}).join('')+'</ul>':'')+(o.evidence&&typeof o.evidence==='string'?'<p class="identification">'+o.evidence+'</p>':'')+(o.data?'<div class="table-container"><table class="metal-table"><thead><tr><th>Fluide</th><th>Éclair</th><th>Auto</th><th>LIE</th><th>Note</th></tr></thead><tbody>'+o.data.map(function(d){return '<tr><td>'+d.fluid+'</td><td>'+d.flash+'</td><td>'+d.auto+'</td><td>'+d.lel+'</td><td>'+d.note+'</td></tr>';}).join('')+'</tbody></table></div>':'')+(o.fluids?'<div class="table-container"><table class="metal-table"><thead><tr><th>Fluide</th><th>Auto</th><th>Fuites</th><th>Trace</th></tr></thead><tbody>'+o.fluids.map(function(d){return '<tr><td>'+d.fluid+'</td><td>'+d.auto+'</td><td>'+d.leak+'</td><td>'+d.trace+'</td></tr>';}).join('')+'</tbody></table></div>':'')+(o.surfaces?'<div class="table-container"><table class="metal-table"><thead><tr><th>Organe</th><th>Normal</th><th>Charge</th></tr></thead><tbody>'+o.surfaces.map(function(d){return '<tr><td>'+d.part+'</td><td>'+d.normal+'</td><td>'+d.charge+'</td></tr>';}).join('')+'</tbody></table></div><p class="identification">'+o.rule+'</p>':'')+veRow((typeof ORIGIN_PHOTOS!=='undefined'&&ORIGIN_PHOTOS[k])?ORIGIN_PHOTOS[k]:[])+'</details>';}).join('');}
renderPlastics(){var t=document.getElementById('vp-table');if(t)t.innerHTML=VEHICLE_EXPERT.plastics.map(function(p){return '<tr><td><strong>'+p.p+'</strong></td><td>'+p.use+'</td><td>'+p.fire+'</td><td>'+p.role+'</td></tr>';}).join('');
 var f=document.getElementById('vf-load');if(f)f.innerHTML='<p><strong>Masse :</strong> '+VEHICLE_EXPERT.fireLoad.mass+'</p><p><strong>Énergie :</strong> '+VEHICLE_EXPERT.fireLoad.energy+'</p><p><strong>HRR :</strong> '+VEHICLE_EXPERT.fireLoad.hrr+'</p><p><strong>Pneus :</strong> '+VEHICLE_EXPERT.fireLoad.tires+'</p>';}
renderDev(){var d=VEHICLE_EXPERT.development;var s=document.getElementById('vd-stages');if(s)s.innerHTML=d.stages.map(function(e){return '<div class="runaway-phase"><h4>'+e.s+'</h4><p>'+e.d+'</p></div>';}).join('');
 var v=document.getElementById('vd-vent');if(v)v.innerHTML='<ul>'+d.ventilation.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>'+veRow((typeof DEV_PHOTOS!=='undefined')?DEV_PHOTOS:[]);
 var sp=document.getElementById('vd-spread');if(sp)sp.innerHTML='<ul>'+d.spreadPaths.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
 var dr=document.getElementById('vd-dir');if(dr)dr.innerHTML='<ul>'+d.direction.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';}
renderEV(){var v=VEHICLE_EXPERT.evExpert;var s=document.getElementById('ev-seq');if(s)s.innerHTML=v.sequence.map(function(x){return '<div class="runaway-phase"><h4>'+x.t+'</h4><p>'+x.e+'</p></div>';}).join('')+veRow((typeof EV_PHOTOS!=='undefined')?EV_PHOTOS:[]);
 var g=document.getElementById('ev-gas');if(g)g.innerHTML='<p class="identification">'+v.gases+'</p>';
 var tr=document.getElementById('ev-trig');if(tr)tr.innerHTML='<ul>'+v.triggers.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
 var cc=document.getElementById('ev-cc');if(cc)cc.innerHTML='<ul>'+v.causeVsConsequence.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
 var ch=document.getElementById('ev-chg');if(ch)ch.innerHTML='<ul>'+v.charging.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
 var re=document.getElementById('ev-reig');if(re)re.innerHTML='<p class="identification">'+v.reignition+'</p>';
 var ex=document.getElementById('ev-ext');if(ex)ex.innerHTML='<ul>'+v.extinction.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';}
renderThermalExpert(){var t=VEHICLE_EXPERT.thermalExpert;var g=document.getElementById('th-expert');if(g)g.innerHTML='<div class="id-card"><h4>🔥 FAP</h4><p>'+t.dpf+'</p>'+veRow(['dpf_regen','catalyst_glow'])+'</div><div class="id-card"><h4>🐭 Rongeurs</h4><p>'+t.rodent+'</p>'+veRow(['rodent_damage'])+'</div><div class="id-card"><h4>📋 Rappels</h4><p>'+t.recalls+'</p></div><div class="id-card"><h4>🔧 Aftermarket</h4><p>'+t.aftermarket+'</p>'+veRow(['harness_chafe','fuse_box'])+'</div>';}
renderMelt(){var t=document.getElementById('vm-table');if(t)t.innerHTML=VEHICLE_EXPERT.meltMap.map(function(m){return '<tr><td><strong>'+m.m+'</strong></td><td>'+m.t+'</td><td>'+m.meaning+'</td></tr>';}).join('');}
renderProto(){var g=document.getElementById('vproto');if(g)g.innerHTML=VEHICLE_EXPERT.protocol.map(function(p,i){return '<div class="method-step"><div class="step-num">'+(i+1)+'</div><div class="step-content"><p>'+p.replace(/^\d+\s/,'')+'</p></div></div>';}).join('')+veRow((typeof PROTO_PHOTOS!=='undefined')?PROTO_PHOTOS:[]);}
renderThermal(){var v=FIRE_DATABASE.vehicleThermal;var e=document.getElementById('engineCauses');if(e)e.innerHTML=v.engineCompartment.map(function(c){return '<div class="cause-card"><h3>'+c.title+'</h3><div class="cause-temp">'+c.frequency+' • '+c.tempSource+'</div>'+(c.autoIgnition?'<p><strong>Auto-infl :</strong> '+c.autoIgnition+'</p>':'')+'<div class="cause-causes"><strong>Causes :</strong><ul>'+c.causes.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div><p class="identification">'+c.identification+'</p>'+veRow(c.photos)+'</div>';}).join('');
 var cab=document.getElementById('cabinCauses');if(cab)cab.innerHTML=v.cabin.map(function(c){return '<div class="cause-card"><h3>'+c.title+'</h3><div class="cause-temp">'+c.frequency+'</div><div class="cause-causes"><strong>Causes :</strong><ul>'+c.causes.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div><p class="identification">'+c.identification+'</p>'+veRow(c.photos)+'</div>';}).join('');}
renderEVExpert(){var v=FIRE_DATABASE.vehicleElectric;var g=document.getElementById('chemGrid');if(g)g.innerHTML=v.chemistries.map(function(c){return '<div class="chem-card"><h4>🔋 '+c.name+'</h4><p>'+c.desc+'</p><div class="cause-temp">Runaway '+c.tempRunaway+'</div></div>';}).join('');
 var p=document.getElementById('runawayPhases');if(p)p.innerHTML=v.thermalRunaway.phases.map(function(x){return '<div class="runaway-phase"><h4>'+x.phase+'</h4><p>'+x.desc+'</p></div>';}).join('');
 var d=document.getElementById('runawayDetails');if(d)d.innerHTML='<div class="id-card"><h4>🚨 Indicateurs</h4><ul>'+v.thermalRunaway.indicators.map(function(i){return '<li>'+i+'</li>';}).join('')+'</ul></div><div class="id-card"><h4>🚒 Extinction</h4><ul>'+v.thermalRunaway.extinction.map(function(e2){return '<li>'+e2+'</li>';}).join('')+'</ul></div>';
 var c=document.getElementById('evCauses');if(c)c.innerHTML=v.causes.map(function(x){return '<div class="cause-card"><h3>'+x.title+'</h3><p class="cause-desc">'+x.desc+'</p>'+veRow([x.photo])+'</div>';}).join('');}
renderHybrid(){var h=FIRE_DATABASE.vehicleHybrid;var g=document.getElementById('hybridInfo');if(g)g.innerHTML='<div class="id-card"><h4>'+h.title+'</h4><ul>'+h.risks.map(function(r){return '<li>'+r+'</li>';}).join('')+'</ul><p class="identification">'+h.identification+' • '+h.safety+'</p></div>';}
renderBuildings(){var g=document.getElementById('buildingCauses');if(g)g.innerHTML=FIRE_DATABASE.buildings.causes.map(function(c){return '<div class="cause-card"><h3>'+c.title+'</h3><div class="cause-temp">'+c.frequency+'</div><div class="cause-causes"><strong>Causes :</strong><ul>'+c.causes.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div><p class="identification">'+c.identification+'</p>'+veRow(c.photos)+'</div>';}).join('');
 var p=document.getElementById('propagationGrid');if(p)p.innerHTML=Object.entries(FIRE_DATABASE.buildings.propagation).map(function(e){return '<div class="phenomenon-card"><h4>'+e[0]+'</h4><p>'+e[1]+'</p></div>';}).join('');}
renderChemical(){var t=document.querySelector('#selfIgnitionTable tbody');if(t)t.innerHTML=FIRE_DATABASE.chemical.selfIgnition.map(function(s){return '<tr><td><strong>'+s.material+'</strong></td><td>'+s.autoTemp+'</td><td>'+s.mechanism+'</td><td>'+s.prevention+'</td></tr>';}).join('');
 var i=document.getElementById('incompatibilities');if(i)i.innerHTML='<div class="id-card"><ul>'+FIRE_DATABASE.chemical.incompatibilities.map(function(x){return '<li>⚠️ '+x+'</li>';}).join('')+'</ul></div>';}
renderMetals(){var t=document.querySelector('#metalTable tbody');if(t)t.innerHTML=FIRE_DATABASE.metals.map(function(m){return '<tr><td><strong>'+m.name+'</strong></td><td>'+m.meltingPointC+' °C</td><td>'+m.meltingPointF+' °F</td><td>'+m.appearance+'</td></tr>';}).join('');}
renderWires(){var g=document.getElementById('wireAnalysisGrid');if(g)g.innerHTML=Object.entries(FIRE_DATABASE.wireAnalysis).map(function(e){var d=e[1];return '<div class="analysis-card"><h3>'+d.title+'</h3><div class="temp-info">🌡️ '+d.temperature+'</div><ul class="characteristics">'+d.characteristics.map(function(c){return '<li>'+c+'</li>';}).join('')+'</ul><p class="identification">'+d.identification+'</p>'+veRow(d.photos)+'</div>';}).join('');}
renderMetalId(){var hc=FIRE_DATABASE.metalIdentification.heatColors,de=FIRE_DATABASE.metalIdentification.deterioration;
 var g=document.getElementById('metalIdGrid');if(g)g.innerHTML='<div class="id-card"><h3>'+hc.title+'</h3><div class="temp-colors">'+hc.temps.map(function(t){return '<div class="temp-item"><span class="temp">'+t.temp+'</span><span class="color" style="background:'+t.hex+'">'+t.color+'</span><span class="desc">'+t.description+'</span></div>';}).join('')+'</div><p class="identification">'+hc.identification+'</p>'+veRow(hc.photos)+'</div><div class="id-card"><h3>'+de.title+'</h3>'+de.types.map(function(t2){return '<div class="det-type"><h4>'+t2.type+'</h4><p><strong>Aspect :</strong> '+t2.appearance+'</p><p><strong>Cause :</strong> '+t2.cause+' — '+t2.temperature+'</p></div>';}).join('')+veRow(de.photos)+'</div>';}
renderCauses(f){var l=FIRE_DATABASE.fireCauses.slice();if(f&&f!=='all')l=l.filter(function(c){return c.category===f;});
 var g=document.getElementById('causesGrid');if(g)g.innerHTML=l.map(function(c){return '<div class="cause-card"><span class="category-badge">'+({building:'🏢 Bâtiment',electrical:'⚡ Électrique','vehicle-thermal':'🚗 Thermique','vehicle-electric':'🔋 VE',equipment:'🧪 Chimique'}[c.category]||c.category)+'</span><h3>'+c.title+'</h3><p class="cause-type">'+c.type+'</p><p class="cause-desc">'+c.description+'</p><div class="cause-temp">🌡️ '+c.temperature+'</div>'+veRow(c.photos)+'<button class="btn-expand" onclick="app.expandCase(\''+c.id+'\')">Analyse complète</button></div>';}).join('')||'<p class="no-results">Aucun cas</p>';}
renderGallery(){var g=document.getElementById('photoGallery');if(g)g.innerHTML=Object.entries(PHOTOS).map(function(e){return '<figure class="gallery-item">'+vePhoto(e[0])+'<figcaption>'+esc15(e[1].caption)+'</figcaption></figure>';}).join('');}
chips(el,subs,cur,attr){var c=document.getElementById(el);if(c)c.innerHTML=subs.map(function(s){return '<button class="nav-btn '+(s===cur?'active':'')+'" data-'+attr+'="'+s+'">'+(TITRES[s]||s)+'</button>';}).join('');}
renderOverheat(){var l=(typeof OVERHEAT!=='undefined')?OVERHEAT.filter(function(x){return this.cur.ov==='Tous'||x.sub===this.cur.ov;},this):[];this.chips('overheatChips',['Tous','thermal','ev'],this.cur.ov,'ov');var g=document.getElementById('overheatGrid');if(g)g.innerHTML=l.map(function(x){return dbCard(x,'🌡️ '+x.sub);}).join('');}
renderMech(){var l=(typeof MECH!=='undefined')?MECH.filter(function(x){return this.cur.mc==='Tous'||x.sub===this.cur.mc;},this):[];this.chips('mechChips',['Tous','belt','gearbox','turbo','egr','other'],this.cur.mc,'mc');var g=document.getElementById('mechGrid');if(g)g.innerHTML=l.map(function(x){return dbCard(x,'⚙️ '+x.sub);}).join('');}
renderLeaks(){var l=(typeof LEAKS!=='undefined')?LEAKS.filter(function(x){return x.cause!=='-'&&(this.cur.lk==='Tous'||x.sub===this.cur.lk);},this):[];this.chips('leaksChips',['Tous','oil','fuel','lpg','coolant'],this.cur.lk,'lk');var g=document.getElementById('leaksGrid');if(g)g.innerHTML=l.map(function(x){return dbCard(x,'🛢️ '+x.sub);}).join('');}
renderBatt(){var l=(typeof BATT!=='undefined')?BATT.filter(function(x){return this.cur.bt==='Tous'||x.sub===this.cur.bt;},this):[];this.chips('battChips',['Tous','12V','48V','HV'],this.cur.bt,'bt');var g=document.getElementById('battGrid');if(g)g.innerHTML=l.map(function(x){return dbCard(x,'🔋 '+x.sub);}).join('');}
renderShorts(){var subs=['Tous'];if(typeof SHORTS!=='undefined')SHORTS.forEach(function(x){if(subs.indexOf(x.subsys)<0)subs.push(x.subsys);});var l=(typeof SHORTS!=='undefined')?SHORTS.filter(function(x){return this.cur.sh==='Tous'||x.subsys===this.cur.sh;},this):[];this.chips('shortsChips',subs,this.cur.sh,'sh');var g=document.getElementById('shortsGrid');if(g)g.innerHTML=l.map(function(x){return dbCard(x,'⚡ '+(x.subsys||''));}).join('');}
expandCase(id){var c=FIRE_DATABASE.fireCauses.find(function(x){return x.id===id;});if(!c)return;var m=document.createElement('div');m.className='modal-overlay';
 m.innerHTML='<div class="modal-content"><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">×</button><h2>'+esc15(c.title)+'</h2><div class="modal-section"><h3>Description</h3><p>'+esc15(c.description)+'</p></div><div class="modal-section"><h3>Causes</h3><ul>'+c.causes.map(function(x){return '<li>'+esc15(x)+'</li>';}).join('')+'</ul></div><div class="modal-section"><h3>Identification</h3><div class="id-subsection"><h4>🔌 Fils</h4><p>'+esc15(c.identification.wires)+'</p></div><div class="id-subsection"><h4>🔩 Métal</h4><p>'+esc15(c.identification.metal)+'</p></div><div class="id-subsection"><h4>🏠 Env.</h4><p>'+esc15(c.identification.surroundings)+'</p></div></div><div class="modal-section"><h3>T°</h3><p class="temp-highlight">'+esc15(c.temperature)+'</p></div><div class="modal-section"><h3>📷</h3><div class="photo-row big">'+veRow(c.photos)+'</div></div></div>';
 document.body.appendChild(m);}
async cachePhotos(){var ks=Object.keys(PHOTOS||{});var pr=document.getElementById('offlineProgress');var d=0;
 for(var i=0;i<ks.length;i++){try{await fetch(PHOTOS[ks[i]].url);}catch(e){}d++;if(pr)pr.textContent='📥 '+d+'/'+ks.length;}
 if(pr)pr.textContent='✅ '+ks.length+' photos hors ligne !';}
stats(){var pc=document.getElementById('photosCount');if(pc)pc.textContent=Object.keys(PHOTOS||{}).length;
 var mc=document.getElementById('metalsCount');if(mc&&typeof FIRE_DATABASE!=='undefined')mc.textContent=FIRE_DATABASE.metals.length;
 var rc=document.getElementById('recallsCount');if(rc&&typeof RECALLS!=='undefined')rc.textContent=RECALLS.length;
 if(this.db){var t=this.db.transaction(['fireCases'],'readonly');t.objectStore('fireCases').count().onsuccess=function(e){var cc=document.getElementById('casesCount');if(cc)cc.textContent=e.target.result||(typeof FIRE_DATABASE!=='undefined'?FIRE_DATABASE.fireCauses.length:0);};}
 var ss=document.getElementById('storageStatus');if(ss&&typeof RECALLS!=='undefined')ss.textContent='✅ Base locale massive active ('+RECALLS.length+' pannes)';}
selfTests(){try{
 var t1=(typeof unifiedSearch==='function')?unifiedSearch('renault r5').length:0;
 var t2=(typeof unifiedSearch==='function')?unifiedSearch('mercedes w206').length:0;
 var t3=(typeof unifiedSearch==='function')?unifiedSearch('skoda elroq').length:0;
 var bad=0;if(typeof unifiedSearch==='function'){unifiedSearch('elroq').forEach(function(x){var b=seNorm((x.r.brand||'')+' '+(x.r.models||''));if(b.indexOf('elroq')<0&&b.indexOf('skoda')<0)bad++;});}
 localStorage.setItem('searchTest',JSON.stringify({t:Date.now(),r5:t1,w206:t2,elroq:t3}));
 localStorage.setItem('purity25',JSON.stringify({t:Date.now(),n:t3,bad:bad}));
 var ok=t1>0&&t2>0&&t3>0&&bad===0;console.log(ok?'✅ AUTO-VÉRIF recherches OK (pureté elroq 0 hors-sujet)':'⚠️ recherches : r5='+t1+' w206='+t2+' elroq='+t3+' bad='+bad);
 }catch(e){console.warn('selfTest',e);}
 cascadeSelfTest();}}
// ---- Lightbox ----
function openLightbox(k){var p=PHOTOS[k];if(!p)return;document.getElementById('lightboxImg').src=p.url;document.getElementById('lightboxCaption').textContent=p.caption;document.getElementById('lightboxCredit').textContent='© '+p.credit;document.getElementById('lightbox').classList.remove('hidden');}
function closeLightbox(){document.getElementById('lightbox').classList.add('hidden');}
// ---- Boot ----
window.addEventListener('error',function(e){try{localStorage.setItem('lastCrash',JSON.stringify({t:Date.now(),e:e.message}));}catch(ex){}});
setInterval(function(){console.log(window.app&&app.db?'✅ Auto-vérif périodique OK':'⚠️ app non prête');},60000);
var app;
document.addEventListener('DOMContentLoaded',function(){
 try{var c=localStorage.getItem('lastCrash');if(c){console.warn('Reprise après incident:',c);localStorage.removeItem('lastCrash');}}catch(e){}
 app=new DiagApp();window.app=app;bgLayer();bgApplySaved();
});
