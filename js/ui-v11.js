// ================================================================
// UI v11 : sections fuites + batteries + recherche expert à facettes
// ================================================================
let curLeak='Tous',curBatt='Tous';
const LEAK_SUBS=['Tous','oil','fuel','lpg','coolant'],BATT_SUBS=['Tous','12V','48V','HV'];
const LBL={oil:'🛢️ Huile',fuel:'⛽ Carburant',lpg:'⛽ GPL',coolant:'🧊 LDR/AdBlue','12V':'🔋 12V','48V':'🔋 48V',HV:'🔋 HT'};
function leakCard(x){return `<div class="cause-card"><span class="category-badge">${LBL[x.sub]||x.sub}</span><span class="badge-src">${x.src}</span><h3>${x.brand}</h3><p class="cause-type">${x.models} • ${x.years}</p><p class="cause-desc"><strong>Panne :</strong> ${x.cause}</p><p class="cause-desc"><strong>Mécanisme :</strong> ${x.mech}</p><p class="identification"><strong>Indices :</strong> ${x.idx}</p><div class="photo-row">${(x.photos||[]).map(p=>vePhoto(p)).join('')}</div></div>`;}
function renderLeaks(){const g=document.getElementById('leaksGrid');if(!g)return;let l=LEAKS.filter(x=>x.cause!=='-');if(curLeak!=='Tous')l=l.filter(x=>x.sub===curLeak);
g.innerHTML=l.map(leakCard).join('');const c=document.getElementById('leaksChips');if(c)c.innerHTML=LEAK_SUBS.map(s=>`<button class="nav-btn ${s===curLeak?'active':''}" data-lsub="${s}">${LBL[s]||s}</button>`).join('');}
function renderBatts(){const g=document.getElementById('battGrid');if(!g)return;let l=BATT;if(curBatt!=='Tous')l=l.filter(x=>x.sub===curBatt);
g.innerHTML=l.map(leakCard).join('');const c=document.getElementById('battChips');if(c)c.innerHTML=BATT_SUBS.map(s=>`<button class="nav-btn ${s===curBatt?'active':''}" data-bsub="${s}">${LBL[s]||s}</button>`).join('');}
document.addEventListener('DOMContentLoaded',()=>{
 renderLeaks();renderBatts();
 document.addEventListener('click',e=>{const l=e.target.closest('[data-lsub]');if(l){curLeak=l.dataset.lsub;renderLeaks();}
  const b=e.target.closest('[data-bsub]');if(b){curBatt=b.dataset.bsub;renderBatts();}});
 const xb=document.getElementById('xpBtn');
 const run=()=>{const q=document.getElementById('xpInput').value.trim();if(!q)return;
  const facets={energy:document.getElementById('xpEnergy').value||'',sub:document.getElementById('xpSub').value||''};
  seRender(seSearch(q,facets),'xpResults');};
 if(xb)xb.addEventListener('click',run);
 const xi=document.getElementById('xpInput');if(xi)xi.addEventListener('keypress',e=>{if(e.key==='Enter')run();});
 const rc=document.getElementById('recallsCount');if(rc)rc.textContent=RECALLS.length;});
