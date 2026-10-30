// ================================================================
// UI v24 (__v24) — section Campagnes techniques & bulletins
// ================================================================
var __v24=true;
var CAMP_FAMS=['Tous','chain','fuel','egr','turbo','dpf','ingenium'];
var CAMP_LBL={chain:'⛓️ Chaînes',fuel:'⛽ Carburant',egr:'♻️ EGR',turbo:'🌀 Turbo',dpf:'🌫️ FAP',ingenium:'🐆 Ingenium JLR'};
var curFam='Tous';
function campCard(x){return '<div class="cause-card"><span class="category-badge">'+(CAMP_LBL[x.fam]||x.fam)+'</span><span class="badge-src">'+esc15(x.src)+'</span>'+
 '<h3>'+esc15(x.brand)+'</h3><p class="cause-type">'+esc15(x.models)+'</p>'+
 '<p class="cause-type">'+esc15(x.years)+' • '+esc15(x.motor)+' • '+esc15(x.power)+'</p>'+
 '<p class="cause-desc"><strong>Campagne/panne :</strong> '+esc15(x.cause)+'</p>'+
 '<p class="cause-desc"><strong>Mécanisme & risque :</strong> '+esc15(x.mech)+'</p>'+
 '<p class="identification"><strong>Identification / indices :</strong> '+esc15(x.idx)+'</p>'+
 (x.doc?'<a class="btn-expand" style="display:block;text-align:center;text-decoration:none" target="_blank" rel="noopener" href="'+x.doc+'">📄 Bulletin / source technique</a>':'')+
 '<div class="photo-row">'+(x.photos||[]).map(function(p){return vePhoto(p);}).join('')+'</div></div>';}
function renderCampaigns(){var g=document.getElementById('campGrid');if(!g)return;
 var l=CAMPAIGNS.filter(function(x){return curFam==='Tous'||x.fam===curFam;});
 g.innerHTML=l.map(campCard).join('')||'<p class="no-results">Aucune campagne</p>';
 var c=document.getElementById('campChips');if(c)c.innerHTML=CAMP_FAMS.map(function(f){return '<button class="nav-btn '+(f===curFam?'active':'')+'" data-fam="'+f+'">'+(CAMP_LBL[f]||f)+'</button>';}).join('');
 var n=document.getElementById('campCount');if(n)n.textContent=l.length+' campagne(s) affichée(s) sur '+CAMPAIGNS.length+' • Modèles Ingenium : '+INGENIUM_MODELS;}
document.addEventListener('DOMContentLoaded',function(){try{
 renderCampaigns();
 document.addEventListener('click',function(e){var b=e.target.closest('[data-fam]');if(b){curFam=b.dataset.fam;renderCampaigns();}});
 console.log('✅ ui-v24 actif : section Campagnes techniques ('+CAMPAIGNS.length+')');
}catch(err){console.error('[v24]',err);}});
