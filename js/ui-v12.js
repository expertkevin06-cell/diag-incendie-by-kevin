// ================================================================
// UI v12 : diagnostic par véhicule + sections surchauffe/mécanique
// ================================================================
const GROUPS=[['vw','volkswagen','audi','seat','skoda','cupra','porsche','vag'],['peugeot','citroen','ds','opel','vauxhall'],['fiat','jeep','dodge','ram','chrysler','alfa romeo','lancia','stellantis','opel'],['renault','dacia','alpine'],['hyundai','kia','genesis'],['toyota','lexus'],['honda','acura'],['nissan','infiniti','mitsubishi'],['ford','lincoln'],['chevrolet','gmc','cadillac','buick'],['bmw','mini'],['mercedes','mercedes-benz','smart'],['volvo','polestar','geely','lynk & co','zeekr'],['mg','saic','maxus','roewe'],['byd','denza'],['great wall','haval','wey','tank'],['chery','exeed','omoda'],['jaguar','land rover','tata'],['tesla'],['mazda'],['subaru'],['suzuki'],['nio'],['xpeng'],['li auto','seres','aito'],['changan'],['vinfast'],['fisker'],['rivian'],['lucida','lucide','lucid']];
function grpOf(b){const n=seNorm(b);for(let i=0;i<GROUPS.length;i++){if(GROUPS[i].some(x=>seNorm(x)===n||n.includes(seNorm(x))||seNorm(x).includes(n)))return i;}return -1;}
function brandMatch(rb,qb){const a=seNorm(rb),b=seNorm(qb);if(a.includes(b)||b.includes(a))return true;const ga=grpOf(a.split('/')[0]),gb=grpOf(b);return ga>=0&&ga===gb&&a.includes(b.split(' ')[0])?true:(ga>=0&&ga===gb&&GROUPS[ga].some(g=>a.includes(g)&&b.includes(g)));}
let curOv='Tous',curMc='Tous';
const OV_SUBS=['Tous','thermal','ev'],MC_SUBS=['Tous','belt','gearbox','turbo','egr','egrcooler','waterpump','alternator','other'];
const LBL2={thermal:'🚗 Thermique',ev:'🔋 VE',belt:'⛓️ Courroie',gearbox:'⚙️ Boîte',turbo:'🌀 Turbo',egr:'♻️ EGR',egrcooler:'🧊 Refroid. EGR',waterpump:'💧 Pompe à eau',alternator:'⚡ Alternateur',other:'🔧 Autres'};
function card2(x){return `<div class="cause-card"><span class="category-badge">${LBL2[x.sub]||x.sub}</span><span class="badge-src">${x.src}</span><h3>${x.brand}</h3><p class="cause-type">${x.models} • ${x.years}</p><p class="cause-desc"><strong>Défaut :</strong> ${x.cause}</p><p class="cause-desc"><strong>Mécanisme :</strong> ${x.mech}</p><p class="identification"><strong>Indices :</strong> ${x.idx}</p><div class="photo-row">${(x.photos||[]).map(p=>vePhoto(p)).join('')}</div></div>`;}
function renderOverheat(){const g=document.getElementById('overheatGrid');if(!g)return;let l=OVERHEAT;if(curOv!=='Tous')l=l.filter(x=>x.sub===curOv);g.innerHTML=l.map(card2).join('');const c=document.getElementById('overheatChips');if(c)c.innerHTML=OV_SUBS.map(s=>`<button class="nav-btn ${s===curOv?'active':''}" data-ov="${s}">${LBL2[s]||s}</button>`).join('');}
function renderMech(){const g=document.getElementById('mechGrid');if(!g)return;let l=MECH;if(curMc!=='Tous')l=l.filter(x=>x.sub===curMc);g.innerHTML=l.map(card2).join('');const c=document.getElementById('mechChips');if(c)c.innerHTML=MC_SUBS.map(s=>`<button class="nav-btn ${s===curMc?'active':''}" data-mc="${s}">${LBL2[s]||s}</button>`).join('');}
function bucketOf(r){const t=seNorm((r.id||'')+' '+(r.cause||'')+' '+(r.motor||''));
 if(/^o/.test(r.id)||/surchauffe|overheat|pompe à eau|water pump|thermostat|radiateur|ventilateur/.test(t))return 'overheat';
 if(/^m/.test(r.id)||/courroie|belt|bo[îi]te|gearbox|dsg|dct|edc|powershift|turbo|egr|cha[îi]ne|chain/.test(t))return 'mech';
 if(/^l/.test(r.id)||/fuite|leak|huile|oil|carburant|fuel|glycol|ldr|gpl/.test(t))return 'leak';
 if(/^b/.test(r.id)||/^a0/.test(r.id)||/batterie|battery|12v|48v|charge|charging|autonomie|range|contacteur|iccu|onduleur|inverter/.test(t))return 'batt';
 if(/^s/.test(r.id)||/faisceau|court|arc|fusible|alternateur|alternator|cosse|relais|epissure/.test(t))return 'elec';
 return 'fire';}
function garageDiag(brand,model,motor){
 const d=document.getElementById('garageReport');if(!d)return;
 if(!brand){d.innerHTML='<p class="no-results">Indiquez au moins une marque</p>';return;}
 const mt=seNorm(model).split(/[\s,]+/).filter(w=>w.length>1);
 const mo=seNorm(motor);
 const buckets={fire:[],elec:[],leak:[],overheat:[],mech:[],batt:[]};
 let n=0;
 for(const r of RECALLS){
  if(!brandMatch(r.brand||'',brand))continue;
  if(mt.length){const rm=seNorm(r.models||'');if(!mt.some(t=>rm.includes(t)))continue;}
  if(mo){const rm2=seNorm((r.motor||'')+' '+(r.models||''));const toks=mo.split(/[\s/]+/).filter(w=>w.length>2);if(toks.length&&!toks.some(t=>rm2.includes(t)))continue;}
  buckets[bucketOf(r)].push(r);n++;}
 const TIT={fire:'🔥 Incendie / rappel feu',elec:'⚡ Court-circuit / alimentation électrique',leak:'🛢️ Fuites huile / carburant / LDR',overheat:'🌡️ Surchauffe',mech:'⚙️ Mécanique (courroie, boîte, turbo, EGR)',batt:'🔋 12V / 48V / HT / charge / autonomie'};
 d.innerHTML=`<div class="search-results-header">🚘 ${brand} ${model} ${motor} → ${n} défaut(s) connu(s)</div>`+
 Object.entries(buckets).map(([k,list])=>list.length?`<h3>${TIT[k]} (${list.length})</h3>`+list.map(r=>recallCard(r)).join(''):'').join('')+
 (n===0?'<p class="no-results">Aucun défaut référencé pour cette combinaison — élargissez le modèle ou la motorisation, ou utilisez la recherche expert 🧠.</p>':'');}
document.addEventListener('DOMContentLoaded',()=>{
 renderOverheat();renderMech();
 document.addEventListener('click',e=>{const o=e.target.closest('[data-ov]');if(o){curOv=o.dataset.ov;renderOverheat();}
  const m=e.target.closest('[data-mc]');if(m){curMc=m.dataset.mc;renderMech();}});
 const gb=document.getElementById('gBtn');
 const runG=()=>{const b=document.getElementById('gBrand').value.trim(),m=document.getElementById('gModel').value.trim(),mo=document.getElementById('gMotor').value.trim();
  garageDiag(b,m,mo);
  if(window.app&&app.db)idbPut(app.db,'userData',{key:'garage',brand:b,model:m,motor:mo});};
 if(gb)gb.addEventListener('click',runG);
 ['gBrand','gModel','gMotor'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('keypress',e=>{if(e.key==='Enter')runG();});});
 if(window.app&&app.db)idbGet(app.db,'userData','garage').then(g=>{if(g&&g.brand){document.getElementById('gBrand').value=g.brand||'';document.getElementById('gModel').value=g.model||'';document.getElementById('gMotor').value=g.motor||'';garageDiag(g.brand,g.model||'',g.motor||'');}});});
