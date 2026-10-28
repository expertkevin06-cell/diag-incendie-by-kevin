// ================================================================
// UI v13 : sélecteurs en cascade + rapport auto-vérifié + catalogues étendus par le feed
// ================================================================
function catalogBrands(){const set=new Set(Object.keys(VEHICLE_CATALOG));
 RECALLS.forEach(r=>{const b=seNorm((r.brand||'').split('/')[0].split(' ')[0]);if(b&&b.length>2&&!/multi|tous/.test(b))set.add(b);});
 return [...set].sort();}
function modelsFor(brand){const k=Object.keys(VEHICLE_CATALOG).find(c=>seNorm(c)===seNorm(brand)||seNorm(brand).includes(seNorm(c)));
 const set=new Set(k?Object.keys(VEHICLE_CATALOG[k]):[]);
 RECALLS.forEach(r=>{if(brandMatch(r.brand||'',brand))(r.models||'').split(',').forEach(m=>{const t=m.trim();if(t&&t.length<40)set.add(t);});});
 return [...set].sort();}
function motorsFor(brand,model){const k=Object.keys(VEHICLE_CATALOG).find(c=>seNorm(c)===seNorm(brand)||seNorm(brand).includes(seNorm(c)));
 const set=new Set();
 if(k&&VEHICLE_CATALOG[k][model])(VEHICLE_CATALOG[k][model]).forEach(s=>set.add(s.split('|')[0]));
 RECALLS.forEach(r=>{if(brandMatch(r.brand||'',brand)&&seNorm(r.models||'').includes(seNorm(model).split(' ')[0])){const m=(r.motor||'').split('(')[0].trim();if(m&&m!=='-')set.add(m);}});
 return [...set].sort();}
function powersFor(brand,model,motor){const k=Object.keys(VEHICLE_CATALOG).find(c=>seNorm(c)===seNorm(brand)||seNorm(brand).includes(seNorm(c)));
 const set=new Set();
 if(k&&VEHICLE_CATALOG[k][model])(VEHICLE_CATALOG[k][model]).forEach(s=>{const[c,p]=s.split('|');if(seNorm(c)===seNorm(motor)&&p)p.split('/').forEach(x=>set.add(x.trim()));else if(seNorm(c)===seNorm(motor)&&!p)set.add('non précisé');});
 RECALLS.forEach(r=>{if(r.power&&r.power!=='-'&&brandMatch(r.brand||'',brand)&&seNorm(r.models||'').includes(seNorm(model).split(' ')[0])&&seNorm(r.motor||'').includes(seNorm(motor).split(' ')[0]))set.add(r.power);});
 if(!set.size)set.add('Toutes');return [...set].sort();}
function fillSelect(el,opts,ph){el.innerHTML='<option value="">'+ph+'</option>'+opts.map(o=>`<option value="${o}">${o}</option>`).join('');}
function garageSel(){return{brand:document.getElementById('gBrand2').value,model:document.getElementById('gModel2').value,motor:document.getElementById('gMotor2').value,power:document.getElementById('gPower2').value,sub:document.getElementById('gSub2').value};}
function garageDiag2(){const s=garageSel();const d=document.getElementById('garageReport2');if(!d)return;
 if(!s.brand){d.innerHTML='<p class="no-results">Choisissez une marque</p>';return;}
 const buckets={};let exact=0,part=0,gen=0,warn=0,n=0;
 const TIT={fire:'🔥 Incendie / rappel feu',elec:'⚡ Électrique / court-circuit / ADAS-élec',mech:'⚙️ Mécanique / courroie / boîte',turbo:'🌀 Turbo',egr:'♻️ Vanne EGR',dpf:'🌫️ DPF / FAP / GPF',adblue:'💧 AdBlue / SCR',adas:'📡 ADAS',camera:'📷 Caméras',charge:'🔌 Charge',range:'🔋 Autonomie / 12-48-HT',leak:'🛢️ Fuites',overheat:'🌡️ Surchauffe',fuel:'⛽ Carburant / GPL',belt:'⛓️ Courroie',gearbox:'⚙️ Boîte'};
 for(const r of RECALLS){
  if(s.sub&&r.subsys&&r.subsys!==s.sub)continue;
  if(!s.sub&&!r.subsys){} // entrées sans subsys filtrées plus bas par bucket
  const v=verifyAttribution(r,s);
  const bm=brandMatch(r.brand||'',s.brand);if(!bm)continue;
  if(s.model){const rm=seNorm(r.models||'');const t=seNorm(s.model).split(/[\s/]+/)[0];if(!rm.includes(t)&&!/multi|tous/i.test(rm))continue;}
  if(s.motor){const rmot=seNorm((r.motor||'')+' '+(r.models||''));const t=seNorm(s.motor).split(/[\s/]+/)[0];if(t&&!rmot.includes(t)&&!/tous/i.test(rmot))continue;}
  if(s.power&&s.power!=='Toutes'&&r.power&&r.power!=='-'&&!powerOverlap(r.power,s.power))continue;
  const b=bucketOf(r);(buckets[b]=buckets[b]||[]).push({r,v});n++;
  if(v.warns.length)warn++;else if(v.level==='exact')exact++;else if(v.level==='partiel')part++;else gen++;}
 d.innerHTML=`<div class="search-results-header">🚘 ${s.brand} ${s.model} ${s.motor} ${s.power} → ${n} défaut(s) | ✅ exacts ${exact} • 🟡 partiels ${part} • ⚪ génériques ${gen} • ⚠️ alertes ${warn}</div>`+
 Object.entries(buckets).map(([k,list])=>`<h3>${TIT[k]||k} (${list.length})</h3>`+list.map(x=>{const b=x.v.warns.length?'⚠️':'(x.v.level==='exact'?'✅':x.v.level==='partiel'?'🟡':'')';
  return `<div class="cause-card"><span class="category-badge">${b} ${x.v.level}</span>${x.v.warns.length?`<span class="badge-src" style="background:#b71c1c">⚠️ ${x.v.warns.join(', ')}</span>`:`<span class="badge-src">${x.r.src}</span>`}<h3>${x.r.brand}</h3><p class="cause-type">${x.r.models} • ${x.r.years}</p><p class="cause-desc"><strong>Défaut :</strong> ${x.r.cause}</p><p class="cause-desc"><strong>Mécanisme :</strong> ${x.r.mech}</p><p class="identification"><strong>Indices :</strong> ${x.r.idx}</p><div class="photo-row">${(x.r.photos||[]).map(p=>vePhoto(p)).join('')}</div></div>`;}).join('')).join('')+
 (n===0?'<p class="no-results">Aucun défaut pour cette combinaison — élargissez puissance/sous-système ou passez en mode texte libre.</p>':'');
 if(window.app&&app.db)idbPut(app.db,'userData',{key:'garage2',...s});}
document.addEventListener('DOMContentLoaded',()=>{
 const bEl=document.getElementById('gBrand2'),mEl=document.getElementById('gModel2'),moEl=document.getElementById('gMotor2'),pEl=document.getElementById('gPower2');
 if(!bEl)return;
 fillSelect(bEl,catalogBrands(),'Marque...');
 bEl.addEventListener('change',()=>{fillSelect(mEl,modelsFor(bEl.value),'Modèle...');moEl.innerHTML='<option value="">Motorisation...</option>';pEl.innerHTML='<option value="">Puissance...</option>';});
 mEl.addEventListener('change',()=>{fillSelect(moEl,motorsFor(bEl.value,mEl.value),'Motorisation...');pEl.innerHTML='<option value="">Puissance...</option>';});
 moEl.addEventListener('change',()=>{fillSelect(pEl,powersFor(bEl.value,mEl.value,moEl.value),'Puissance...');});
 const gb=document.getElementById('gBtn2');if(gb)gb.addEventListener('click',garageDiag2);
 const sub=document.getElementById('gSub2');if(sub)sub.addEventListener('change',garageDiag2);
 if(window.app&&app.db)idbGet(app.db,'userData','garage2').then(g=>{if(g&&g.brand){bEl.value=g.brand||'';bEl.dispatchEvent(new Event('change'));if(g.model){mEl.value=g.model;mEl.dispatchEvent(new Event('change'));}if(g.motor){moEl.value=g.motor;moEl.dispatchEvent(new Event('change'));}if(g.power)pEl.value=g.power;garageDiag2();}});
 auditAttribution();});
