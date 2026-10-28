// ================================================================
// APPLICATION - diag-incendie-by-kevin v8
// ================================================================
class DiagApp {
constructor(){this.db=null;this.currentFilter='all';this.init();}
async init(){try{
await this.initIDB();this.listeners();this.conn();this.applyAdminBg();
this.renderMethod();this.renderChem();this.renderGas();this.renderThermal();this.renderEV();this.renderHybrid();this.renderBuildings();this.renderChemical();
this.renderMetals();this.renderWires();this.renderMetalId();this.renderCauses();this.renderGallery();
renderRecalls(RECALLS);this.stats();
console.log('✅ v8 initialisée');}catch(e){console.error(e);localStorage.setItem('lastCrash',JSON.stringify({t:Date.now(),e:e.message}));}}
async initIDB(){return new Promise((res,rej)=>{const r=indexedDB.open('DiagIncendieDB',1);
r.onerror=()=>rej(r.error);
r.onsuccess=()=>{this.db=r.result;this.populate();res(this.db);};
r.onupgradeneeded=e=>{const db=e.target.result;
if(!db.objectStoreNames.contains('fireCases')){const s=db.createObjectStore('fireCases',{keyPath:'id'});s.createIndex('category','category');}
if(!db.objectStoreNames.contains('userData'))db.createObjectStore('userData',{keyPath:'key'});};});}
populate(){if(!this.db)return;const tx=this.db.transaction(['fireCases'],'readwrite');const st=tx.objectStore('fireCases');
st.count().onsuccess=e=>{if(e.target.result===0)FIRE_DATABASE.fireCauses.forEach(c=>st.put(c));};}
listeners(){
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',e=>{document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));e.target.classList.add('active');this.currentFilter=e.target.dataset.filter;this.renderCauses();}));
document.getElementById('searchBtn').addEventListener('click',()=>this.search());
document.getElementById('searchInput').addEventListener('keypress',e=>{if(e.key==='Enter')this.search();});
document.getElementById('geminiSearchBtn').addEventListener('click',()=>this.gemini());
document.getElementById('offlinePhotosBtn').addEventListener('click',()=>this.cachePhotos());
document.querySelectorAll('.rs-btn').forEach(b=>b.addEventListener('click',()=>{const en=b.dataset.energy;const q=document.getElementById('q-'+en).value.toLowerCase().trim();
let list=RECALLS.filter(r=>r.energy===en);if(q)list=list.filter(r=>(r.brand+r.models+r.motor+r.cause+r.ref).toLowerCase().includes(q));renderRecalls(list);}));
document.getElementById('adminBgApply').addEventListener('click',()=>this.setAdminBg());
document.getElementById('adminBgReset').addEventListener('click',()=>this.resetAdminBg());
window.addEventListener('online',()=>this.conn());window.addEventListener('offline',()=>this.conn());}
conn(){const el=document.getElementById('connectionStatus');el.className='connection-status '+(navigator.onLine?'online':'offline');el.innerHTML=`<span class="status-text">${navigator.onLine?'En ligne':'Hors ligne - base locale'}</span>`;}
ph(key,cls=''){const p=PHOTOS[key];return p?`<img src="${p.url}" alt="${p.caption}" loading="lazy" class="photo-thumb ${cls}" onclick="openLightbox('${key}')" onerror="this.classList.add('photo-error')">`:'';}
row(keys){return `<div class="photo-row">${(keys||[]).map(k=>this.ph(k)).join('')}</div>`;}
renderMethod(){const m=FIRE_DATABASE.methodology;
document.getElementById('methodSteps').innerHTML=m.steps.map(s=>`<div class="method-step"><div class="step-num">${s.n}</div><div class="step-content"><strong>${s.name}</strong><p>${s.desc}</p></div></div>`).join('');
document.getElementById('patternsGrid').innerHTML=m.patterns.map(p=>`<div class="pattern-card"><h4>${p.name}</h4><p>${p.desc}</p>${this.row([p.photo])}</div>`).join('');}
renderChem(){const c=FIRE_DATABASE.fireChemistry;
document.getElementById('tetrahedron').innerHTML=c.tetrahedron.map(t=>`<div class="tetra-element"><h4>${t.element}</h4><p>${t.desc}</p></div>`).join('');
document.getElementById('phenomenaGrid').innerHTML=c.phenomena.map(p=>`<div class="phenomenon-card"><h4>⚠️ ${p.name}</h4><p>${p.desc}</p>${p.photo?this.row([p.photo]):''}</div>`).join('');}
renderGas(){document.querySelector('#gasTable tbody').innerHTML=FIRE_DATABASE.fireChemistry.toxicGases.map(g=>`<tr><td><strong>${g.gas}</strong></td><td>${g.source}</td><td>${g.danger}</td></tr>`).join('');}
renderThermal(){const v=FIRE_DATABASE.vehicleThermal;
document.getElementById('engineCauses').innerHTML=v.engineCompartment.map(c=>`<div class="cause-card"><h3>${c.title}</h3><div class="cause-temp">Fréq : ${c.frequency} • ${c.tempSource||''}</div>${c.autoIgnition?`<p><strong>Auto-infl :</strong> ${c.autoIgnition}</p>`:''}<div class="cause-causes"><strong>Causes :</strong><ul>${c.causes.map(x=>`<li>${x}</li>`).join('')}</ul></div><p class="identification">${c.identification}</p>${this.row(c.photos)}</div>`).join('');
document.getElementById('cabinCauses').innerHTML=v.cabin.map(c=>`<div class="cause-card"><h3>${c.title}</h3><div class="cause-temp">Fréq : ${c.frequency}</div><div class="cause-causes"><strong>Causes :</strong><ul>${c.causes.map(x=>`<li>${x}</li>`).join('')}</ul></div><p class="identification">${c.identification}</p>${this.row(c.photos)}</div>`).join('');}
renderEV(){const v=FIRE_DATABASE.vehicleElectric;
document.getElementById('chemGrid').innerHTML=v.chemistries.map(c=>`<div class="chem-card"><h4>🔋 ${c.name}</h4><p>${c.desc}</p><div class="cause-temp">Runaway : ${c.tempRunaway}</div></div>`).join('');
document.getElementById('runawayPhases').innerHTML=v.thermalRunaway.phases.map(p=>`<div class="runaway-phase"><h4>${p.phase}</h4><p>${p.desc}</p></div>`).join('');
document.getElementById('runawayDetails').innerHTML=`<div class="id-card"><h4>🚨 Indicateurs</h4><ul>${v.thermalRunaway.indicators.map(i=>`<li>${i}</li>`).join('')}</ul></div><div class="id-card"><h4>☠️ Gaz</h4><ul>${v.thermalRunaway.gases.map(g=>`<li>${g}</li>`).join('')}</ul></div><div class="id-card"><h4>🚒 Extinction</h4><ul>${v.thermalRunaway.extinction.map(e=>`<li>${e}</li>`).join('')}</ul></div><div class="id-card"><h4>⚠️ Ré-ignition</h4><p>${v.thermalRunaway.reignition}</p></div>`;
document.getElementById('evCauses').innerHTML=v.causes.map(c=>`<div class="cause-card"><h3>${c.title}</h3><p class="cause-desc">${c.desc}</p>${this.row([c.photo])}</div>`).join('');}
renderHybrid(){const h=FIRE_DATABASE.vehicleHybrid;document.getElementById('hybridInfo').innerHTML=`<div class="id-card"><h4>${h.title}</h4><ul>${h.risks.map(r=>`<li>${r}</li>`).join('')}</ul><p class="identification"><strong>Identification :</strong> ${h.identification}</p><p class="identification"><strong>Sécurité :</strong> ${h.safety}</p></div>`;}
renderBuildings(){document.getElementById('buildingCauses').innerHTML=FIRE_DATABASE.buildings.causes.map(c=>`<div class="cause-card"><h3>${c.title}</h3><div class="cause-temp">Fréq : ${c.frequency}</div><div class="cause-causes"><strong>Causes :</strong><ul>${c.causes.map(x=>`<li>${x}</li>`).join('')}</ul></div><p class="identification">${c.identification}</p>${this.row(c.photos)}</div>`).join('');
document.getElementById('propagationGrid').innerHTML=Object.entries(FIRE_DATABASE.buildings.propagation).map(([k,v])=>`<div class="phenomenon-card"><h4>${k}</h4><p>${v}</p></div>`).join('');}
renderChemical(){document.querySelector('#selfIgnitionTable tbody').innerHTML=FIRE_DATABASE.chemical.selfIgnition.map(s=>`<tr><td><strong>${s.material}</strong></td><td>${s.autoTemp}</td><td>${s.mechanism}</td><td>${s.prevention}</td></tr>`).join('');
document.getElementById('incompatibilities').innerHTML=`<div class="id-card"><ul>${FIRE_DATABASE.chemical.incompatibilities.map(i=>`<li>⚠️ ${i}</li>`).join('')}</ul></div>`;}
renderMetals(){document.querySelector('#metalTable tbody').innerHTML=FIRE_DATABASE.metals.map(m=>`<tr><td><strong>${m.name}</strong></td><td>${m.meltingPointC} °C</td><td>${m.meltingPointF} °F</td><td>${m.appearance}</td></tr>`).join('');}
renderWires(){document.getElementById('wireAnalysisGrid').innerHTML=Object.entries(FIRE_DATABASE.wireAnalysis).map(([k,d])=>`<div class="analysis-card"><h3>${d.title}</h3><div class="temp-info">🌡️ ${d.temperature}</div><ul class="characteristics">${d.characteristics.map(c=>`<li>${c}</li>`).join('')}</ul><p class="identification">${d.identification}</p>${this.row(d.photos)}</div>`).join('');}
renderMetalId(){const hc=FIRE_DATABASE.metalIdentification.heatColors,de=FIRE_DATABASE.metalIdentification.deterioration;
document.getElementById('metalIdGrid').innerHTML=`<div class="id-card"><h3>${hc.title}</h3><div class="temp-colors">${hc.temps.map(t=>`<div class="temp-item"><span class="temp">${t.temp}</span><span class="color" style="background:${t.hex}">${t.color}</span><span class="desc">${t.description}</span></div>`).join('')}</div><p class="identification">${hc.identification}</p>${this.row(hc.photos)}</div>
<div class="id-card"><h3>${de.title}</h3>${de.types.map(t=>`<div class="det-type"><h4>${t.type}</h4><p><strong>Aspect :</strong> ${t.appearance}</p><p><strong>Cause :</strong> ${t.cause} — <strong>T° :</strong> ${t.temperature}</p></div>`).join('')}${this.row(de.photos)}</div>`;}
renderCauses(){let l=FIRE_DATABASE.fireCauses;if(this.currentFilter!=='all')l=l.filter(c=>c.category===this.currentFilter);
document.getElementById('causesGrid').innerHTML=l.map(c=>`<div class="cause-card"><span class="category-badge">${this.lbl(c.category)}</span><h3>${c.title}</h3><p class="cause-type">${c.type}</p><p class="cause-desc">${c.description}</p><div class="cause-causes"><strong>Causes :</strong><ul>${c.causes.slice(0,4).map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="cause-temp">🌡️ ${c.temperature}</div>${this.row(c.photos)}<button class="btn-expand" onclick="app.expandCase('${c.id}')">Analyse complète</button></div>`).join('')||'<p class="no-results">Aucun cas</p>';}
lbl(c){return{building:'🏢 Bâtiment',electrical:'⚡ Électrique','vehicle-thermal':'🚗 Thermique','vehicle-electric':'🔋 VE',equipment:'🧪 Chimique'}[c]||c;}
expandCase(id){const c=FIRE_DATABASE.fireCauses.find(x=>x.id===id);if(!c)return;const m=document.createElement('div');m.className='modal-overlay';
m.innerHTML=`<div class="modal-content"><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button><h2>${c.title}</h2>
<div class="modal-section"><h3>Description</h3><p>${c.description}</p></div>
<div class="modal-section"><h3>Causes</h3><ul>${c.causes.map(x=>`<li>${x}</li>`).join('')}</ul></div>
<div class="modal-section"><h3>Identification</h3><div class="id-subsection"><h4>🔌 Fils</h4><p>${c.identification.wires}</p></div><div class="id-subsection"><h4>🔩 Métal</h4><p>${c.identification.metal}</p></div><div class="id-subsection"><h4>🏠 Environnement</h4><p>${c.identification.surroundings}</p></div></div>
<div class="modal-section"><h3>Température</h3><p class="temp-highlight">${c.temperature}</p></div>
<div class="modal-section"><h3>📷 Photos</h3><div class="photo-row big">${c.photos.map(p=>this.ph(p)).join('')}</div></div>
<div class="modal-section"><h3>✅ Checklists</h3><ul>${[...FIRE_DATABASE.diagnosticGuide.wireChecklist,...FIRE_DATABASE.diagnosticGuide.metalChecklist,...FIRE_DATABASE.diagnosticGuide.vehicleChecklist].map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`;
document.body.appendChild(m);}
renderGallery(){document.getElementById('photoGallery').innerHTML=Object.entries(PHOTOS).map(([k,p])=>`<figure class="gallery-item">${this.ph(k)}<figcaption>${p.caption}</figcaption></figure>`).join('');}
async cachePhotos(){const ks=Object.keys(PHOTOS);const pr=document.getElementById('offlineProgress');let d=0;
for(const k of ks){try{await fetch(PHOTOS[k].url);}catch(e){}d++;pr.textContent=`📥 ${d}/${ks.length}...`;}
pr.textContent=`✅ ${ks.length} photos hors ligne !`;}
search(){const q=document.getElementById('searchInput').value.toLowerCase().trim();const div=document.getElementById('searchResults');if(!q){div.innerHTML='';return;}
const rc=FIRE_DATABASE.fireCauses.filter(c=>(c.title+c.description+c.type+c.causes.join()).toLowerCase().includes(q));
const rr=RECALLS.filter(r=>(r.brand+r.models+r.motor+r.cause+r.ref+r.mech).toLowerCase().includes(q));
div.innerHTML=`<div class="search-results-header">${rc.length} cas + ${rr.length} rappels</div>`+
rc.map(r=>`<div class="search-result-item" onclick="app.expandCase('${r.id}')"><h4>${r.title}</h4><p>${r.description}</p></div>`).join('')+
rr.map(r=>`<div class="search-result-item" onclick="expandRecall('${r.id}')"><h4>🚨 ${r.brand} — ${r.models}</h4><p>${r.cause}</p></div>`).join('')||'<div class="no-results">Aucun résultat</div>';}
async gemini(){const q=document.getElementById('searchInput').value.trim();const div=document.getElementById('geminiResults');if(!q){alert('Entrez une question');return;}
div.innerHTML='<div class="loading">🤖 Recherche IA...</div>';
try{const a=await geminiSearch(q);div.innerHTML=`<div class="gemini-answer"><h3>🤖 Gemini</h3><div class="answer-content">${a.replace(/\n/g,'<br>')}</div></div>`;}catch(e){div.innerHTML=`<div class="error">${e.message}</div>`;}}
// ---- ADMIN fond d'écran ----
applyAdminBg(){if(!this.db)return;const tx=this.db.transaction(['userData'],'readonly');const g=tx.objectStore('userData').get('bgBlob');
g.onsuccess=e=>{const rec=e.target.result;if(rec&&rec.blob){const u=URL.createObjectURL(rec.blob);document.documentElement.style.setProperty('--admin-bg',`url("${u}")`);const m=document.getElementById('adminMsg');if(m)m.textContent='✅ Fond admin actif';}};}
setAdminBg(){const f=document.getElementById('adminBg').files[0];if(!f){alert('Choisissez une image');return;}
const tx=this.db.transaction(['userData'],'readwrite');tx.objectStore('userData').put({key:'bgBlob',blob:f});
tx.oncomplete=()=>{this.applyAdminBg();document.getElementById('adminMsg').textContent='✅ Fond enregistré et appliqué (persistant)';};}
resetAdminBg(){const tx=this.db.transaction(['userData'],'readwrite');tx.objectStore('userData').delete('bgBlob');
tx.oncomplete=()=>{document.documentElement.style.removeProperty('--admin-bg');document.getElementById('adminMsg').textContent='Fond réinitialisé';};}
stats(){document.getElementById('photosCount').textContent=Object.keys(PHOTOS).length;
document.getElementById('metalsCount').textContent=FIRE_DATABASE.metals.length;
document.getElementById('recallsCount').textContent=RECALLS.length;
if(this.db){const tx=this.db.transaction(['fireCases'],'readonly');tx.objectStore('fireCases').count().onsuccess=e=>document.getElementById('casesCount').textContent=e.target.result||FIRE_DATABASE.fireCauses.length;}
document.getElementById('storageStatus').textContent='✅ Base v8 — NHTSA / Rappel Conso / Safety Gate / SAMR';}
}

// ---- Modale formation rappel ----
function expandRecall(id){const r=RECALLS.find(x=>x.id===id);if(!r)return;const m=document.createElement('div');m.className='modal-overlay';
m.innerHTML=`<div class="modal-content"><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
<h2>🎓 ${r.brand} — ${r.models}</h2>
<div class="modal-section"><h3>Fiche</h3><p><strong>Années :</strong> ${r.years}<br><strong>Motorisation :</strong> ${r.motor}<br><strong>Région :</strong> ${r.region}<br><strong>Source :</strong> ${r.src} — <strong>Réf :</strong> ${r.ref}</p></div>
<div class="modal-section"><h3>1. Origine : la panne</h3><p>${r.cause}</p></div>
<div class="modal-section"><h3>2. Mécanisme : inflammation → propagation</h3><p>${r.mech}</p></div>
<div class="modal-section"><h3>3. Indices thermiques & fusion des métaux</h3><p class="identification">${r.idx}</p></div>
<div class="modal-section"><h3>4. Photos représentatives</h3><div class="photo-row big">${(r.photos||[]).map(p=>window.vePhoto?vePhoto(p):'').join('')}</div></div></div>`;
document.body.appendChild(m);}

function openLightbox(key){const p=PHOTOS[key];if(!p)return;document.getElementById('lightboxImg').src=p.url;document.getElementById('lightboxCaption').textContent=p.caption;document.getElementById('lightboxCredit').textContent='© '+p.credit;document.getElementById('lightbox').classList.remove('hidden');}
function closeLightbox(){document.getElementById('lightbox').classList.add('hidden');}

window.addEventListener('error',e=>localStorage.setItem('lastCrash',JSON.stringify({t:Date.now(),e:e.message})));
setInterval(()=>{const ok=window.app&&window.app.db;console.log(ok?'✅ Auto-vérification OK':'⚠️ app non prête');},60000);
let app;
document.addEventListener('DOMContentLoaded',()=>{const c=localStorage.getItem('lastCrash');if(c){console.warn('Reprise après incident:',c);localStorage.removeItem('lastCrash');}app=new DiagApp();});
