// ================================================================
// UI v10 : pannes électriques + recherche multi-sources
// ================================================================
const SUBSYS=['Tous','Faisceau','Boîte fusibles','B+/Alternateur','Batterie 12V','48V','HT/Charge','ECU/Relais','Eau/Infiltration','Rongeurs','Aftermarket'];
let curSub='Tous';
function renderShorts(){const g=document.getElementById('shortsGrid');if(!g)return;
 let l=SHORTS;if(curSub!=='Tous')l=l.filter(s=>s.subsys===curSub);
 g.innerHTML=l.map(s=>`<div class="cause-card"><span class="category-badge">⚡ ${s.subsys}</span><span class="badge-src">${s.src}</span><h3>${s.brand}</h3><p class="cause-type">${s.models} • ${s.years}</p><p class="cause-desc"><strong>Panne :</strong> ${s.cause}</p><p class="cause-desc"><strong>Court-circuit :</strong> ${s.short}</p><p class="cause-desc"><strong>Départ de feu :</strong> ${s.fire}</p><p class="identification">${s.idx}</p><div class="photo-row">${(s.photos||[]).map(p=>vePhoto(p)).join('')}</div></div>`).join('')||'<p class="no-results">Aucun sous-système</p>';
 const c=document.getElementById('shortsChips');if(c)c.innerHTML=SUBSYS.map(s=>`<button class="nav-btn ${s===curSub?'active':''}" data-sub="${s}">${s}</button>`).join('');}
function msRender(res){const d=document.getElementById('multiResults');if(!d)return;
 d.innerHTML=`<div class="search-results-header">LOCAL : ${res.local.length} • API NHTSA/Conso : ${res.api.length}</div>`+
 `<div class="photo-row" style="margin:.6rem 0">${res.links.map(l=>`<a class="rs-btn" style="display:inline-block;width:auto;padding:.5rem .8rem;margin:.2rem;text-decoration:none" target="_blank" rel="noopener" href="${l.url}">🌐 ${l.label}</a>`).join('')}</div>`+
 res.local.map(r=>`<div class="search-result-item" onclick="expandRecall('${r.id}')"><h4>📦 ${r.brand} — ${r.models}</h4><p>${r.cause}</p></div>`).join('')+
 res.api.map(r=>`<div class="search-result-item" onclick="window.open('${r.link}','_blank')"><h4>🌐 [${r.src}] ${r.title}</h4><p>${r.desc}</p></div>`).join('')||'';}
document.addEventListener('DOMContentLoaded',()=>{
 renderShorts();
 document.addEventListener('click',e=>{const b=e.target.closest('[data-sub]');if(b){curSub=b.dataset.sub;renderShorts();}});
 const mb=document.getElementById('msBtn');if(mb)mb.addEventListener('click',()=>{const q=document.getElementById('msInput').value.trim();if(!q)return;
  document.getElementById('multiResults').innerHTML='<div class="loading">🔎 Interrogation NHTSA + Rappel Conso...</div>';msRun(q,msRender);});
 const mi=document.getElementById('msInput');if(mi)mi.addEventListener('keypress',e=>{if(e.key==='Enter'&&mb)mb.click();});
 const rc=document.getElementById('recallsCount');if(rc)rc.textContent=RECALLS.length;});
