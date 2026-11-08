// ================================================================
// LEGAL-AUTO v27 — Analyse technique + juridique croisée
// Contexte utilisateur libre + 4 recherches arrière-plan
// Fusion : d-faillance-auto- + auto-legal-by-kevin
// ================================================================
var __v27=true;
var LEGAL_SOURCES=['https://expertkevin06-cell.github.io/d-faillance-auto-','https://auto-legal-by-kevin.lovable.app'];
var LEGAL_DOCTRINE=[
{cat:"Vice caché",code:"Code civ. 1641-1648",delai:"2 ans à compter de la découverte",conditions:["Défaut grave antérieur à la vente","Rend le véhicule impropre à l'usage ou en diminue l'utilité","Ignoré de l'acheteur au moment de la vente"],action:"Action estimatoire ou rédhibitoire contre le vendeur"},
{cat:"Garantie de conformité",code:"Code conso. L217-3 à L217-15",delai:"2 ans (3 ans véhicule neuf)",conditions:["Vendeur professionnel","Non-conformité aux stipulations contractuelles","Défaut d'usage attendu"],action:"Réparation ou remplacement gratuit ; résolution possible"},
{cat:"Obligation de sécurité",code:"Code conso. L421-3 et s.",delai:"10 ans après mise en circulation",conditions:["Produit défectueux","Dommage causé","Lien de causalité"],action:"Responsabilité du fait des produits défectueux (constructeur)"},
{cat:"Garantie commerciale",code:"Code conso. L217-15 et s.",delai:"Durée contractuelle (1 à 8 ans)",conditions:["Vendeur pro","Contrat de garantie écrit"],action:"Prise en charge selon modalités"},
{cat:"Expertise contradictoire",code:"CPC art. 16 & 1643",delai:"Dès survenance du sinistre",conditions:["Conservation du véhicule","Convocation des parties","Expert neutre"],action:"Rapport opposable — méthode NFPA 921 obligatoire incendie"},
{cat:"Déclaration assureur",code:"Code ass. L113-2",delai:"5 jours ouvrés (sinistre), 10 jours (responsabilité civile)",conditions:["Sinistre couvert","Déclaration complète"],action:"Prise en charge selon conditions"},
{cat:"Mise en demeure",code:"Code civ. 1344 et s.",delai:"Avant action judiciaire",conditions:["LRAR","Objet précis","Délai raisonnable"],action:"Formalise la demande — préalable obligatoire"},
{cat:"Prescription",code:"Code civ. 2224",delai:"5 ans (droit commun), 2 ans (conso)",conditions:["Action personnelle/mobilière"],action:"Extinction du droit d'agir"}];
function laExtract(ctx){var s=seNorm(ctx||'');var out={brand:null,model:null,year:null,dtcs:[],keywords:[],seller:'unknown',goal:null,themes:[]};
 catalogBrands().forEach(function(b){var lbl=seNorm(PRETTY_BRANDS[b]||b);if(s.indexOf(lbl)>=0)out.brand=b;});
 var ym=s.match(/20[012][0-9]|19[89][0-9]/);if(ym)out.year=ym[0];
 var dts=s.match(/p[0-9a-f]{4}/gi);if(dts)out.dtcs=dts.slice(0,3);
 var themesMap=[['timing-belt',/courroie|distribution|d[ée]lamin|effiloch|bain d.huil/i],['exhaust-dpf',/fap|dpf|catalyseur|cat|encrass|r[eé]g[eé]n[ée]r/i],['engine-oil',/fuite huile|suintement|goutte|joint cache|vernis/i],['cooling',/surchauffe|liquide refroidissement|pompe [àa] eau|thermostat/i],['fuel-lpg',/fuite carburant|gpl|lpg|essence|gazole|multivalve/i],['elec-12-48',/court-circuit|cosse|batterie 12|b[+] |borne|fusible/i],['hv-charge',/batterie ht|pack|charge|ccs|type2|emballement|runaway/i],['fire-origin',/incendie|feu|flamme|fum[eé]e|carbonisation|foyer|v-pattern|perle/i],['adas',/cam[ée]ra|adas|lane|aeb|freinage|radar/i],['gearbox',/bo[îi]te|embrayage|dsg|dct|transmission|broutage/i],['cabin',/si[eè]ge|habitacle|mousse|m[ée]got/i]];
 themesMap.forEach(function(t){if(t[1].test(ctx))out.themes.push(t[0]);});
 var words=s.split(/[\s,;:.]+/).filter(function(w){return w.length>3;});out.keywords=words.slice(0,12);
 if(/professionnel|garage|concessionnaire|vendeur pro|d[ée]taillant/i.test(ctx))out.seller='pro';
 else if(/particulier|priv[ée]|entre particuliers/i.test(ctx))out.seller='particulier';
 if(/remboursement|r[ée]solution|annulation/i.test(ctx))out.goal='remboursement';
 else if(/r[ée]paration|prise en charge/i.test(ctx))out.goal='reparation';
 else if(/indemnisation|d[ée]dommagement/i.test(ctx))out.goal='indemnisation';
 return out;}
function laCrossSearch(ctx,entities){var results={mega:[],recalls:[],fires:[],dtcs:[],external:[]};
 // 1) Méga-base (pavé Pannes connues)
 var q=(entities.brand?PRETTY_BRANDS[entities.brand]||entities.brand+' ':'')+(entities.model||'')+' '+entities.keywords.slice(0,3).join(' ');
 MEGA.forEach(function(x){var s=0;
  if(entities.brand&&brandMatch(x.brands,entities.brand))s+=4;
  if(entities.themes.indexOf(x.theme)>=0)s+=3;
  entities.dtcs.forEach(function(d){if(x.dtc.toLowerCase()===d.toLowerCase())s+=5;});
  entities.keywords.forEach(function(k){if(seNorm(x.cause+' '+x.sym+' '+x.comp).indexOf(k)>=0)s+=1;});
  if(s>0)results.mega.push({x:x,s:s});});
 results.mega.sort(function(a,b){return b.s-a.s;});results.mega=results.mega.slice(0,5);
 // 2) RECALLS (base massive)
 var r=unifiedSearch(q);results.recalls=r.slice(0,5);
 // 3) Fiches techniques origine de feu
 if(typeof FICHES!=='undefined')FICHES.forEach(function(f){var s=0;
  entities.themes.forEach(function(t){if((t==='fire-origin'||t==='engine-oil'||t==='exhaust-dpf'||t==='hv-charge')&&seNorm(f.title+' '+f.cause).indexOf(seNorm(f.title||''))>=0)s+=2;});
  entities.keywords.forEach(function(k){if(seNorm(f.title+' '+f.cause).indexOf(k)>=0)s+=2;});
  if(s>0)results.fires.push({f:f,s:s});});
 results.fires.sort(function(a,b){return b.s-a.s;});results.fires=results.fires.slice(0,4);
 // 4) DTC matches (P0xxx)
 entities.dtcs.forEach(function(d){MEGA.forEach(function(x){if(x.dtc.toLowerCase()===d.toLowerCase())results.dtcs.push(x);});});
 return results;}
function laDoctrineFor(ctx,entities){var out=[];
 LEGAL_DOCTRINE.forEach(function(d){var score=0;
  if(entities.seller==='pro'&&(d.cat==='Vice caché'||d.cat==='Garantie de conformité'))score+=2;
  if(/incendie|feu|sinistre/i.test(ctx)&&(d.cat==='Expertise contradictoire'||d.cat==='Déclaration assureur'))score+=3;
  if(/r[ée]paration|d[ée]faut|panne/i.test(ctx)&&d.cat==='Garantie de conformité')score+=2;
  if(/m[eé]content|r[eé]clamation/i.test(ctx)&&d.cat==='Mise en demeure')score+=2;
  if(/constructeur|fabricant|d[ée]fectueux/i.test(ctx)&&d.cat==='Obligation de sécurité')score+=3;
  if(score>0)out.push({d:d,score:score});});
 out.sort(function(a,b){return b.score-a.score;});return out.slice(0,5);}
function laRun(){var out=document.getElementById('laOut');if(!out)return;
 var ctx=document.getElementById('laCtx').value.trim();
 if(!ctx||ctx.length<20){out.innerHTML='<p class="no-results">Décrivez votre situation en 20+ caractères (marque, modèle, année, panne, contexte transactionnel, sinistre…)</p>';return;}
 out.innerHTML='<div class="loading">🔎 Analyse croisée en cours (4 bases en arrière-plan)…</div>';
 setTimeout(function(){
  var e=laExtract(ctx);var r=laCrossSearch(ctx,e);var d=laDoctrineFor(ctx,e);
  var h='<div class="search-results-header">📋 Analyse technique + juridique croisée</div>';
  h+='<div class="id-card"><h3>🧠 Contexte détecté</h3>'+
   '<p><strong>Marque :</strong> '+(e.brand?esc15(PRETTY_BRANDS[e.brand]||e.brand):'non détectée')+'</p>'+
   '<p><strong>Année :</strong> '+(e.year||'—')+' • <strong>Vendeur :</strong> '+esc15(e.seller==='pro'?'Professionnel':e.seller==='particulier'?'Particulier':'Non précisé')+'</p>'+
   '<p><strong>DTC :</strong> '+(e.dtcs.length?e.dtcs.join(', '):'aucun')+'</p>'+
   '<p><strong>Thèmes :</strong> '+e.themes.map(function(t){var lbl=THEMES.find(function(x){return x[0]===t;});return lbl?esc15(lbl[1]):esc15(t);}).join(' • ')+'</p></div>';
  h+='<div class="id-card"><h3>🔧 Top pannes connues corrélées ('+r.mega.length+')</h3>'+r.mega.map(function(x){
   return '<div style="border-bottom:1px solid #eee;padding:.6rem 0"><strong>'+esc15(x.x.comp)+'</strong> — '+esc15(x.x.cause)+' <span class="badge-src">score '+x.s+'</span><br><small>'+esc15(x.x.sym)+'</small></div>';}).join('')||'<p>Aucune corrélation</p></div>';
  h+='<div class="id-card"><h3>🚨 Rappels & campagnes applicables ('+r.recalls.length+')</h3>'+r.recalls.map(function(x){
   return '<div style="border-bottom:1px solid #eee;padding:.6rem 0"><strong>'+esc15(x.r.brand)+'</strong> — '+esc15(x.r.cause)+' <span class="badge-src">'+esc15(x.r.src)+'</span><br><small>'+esc15(x.r.models)+' • '+esc15(x.r.years)+'</small></div>';}).join('')||'<p>Aucun rappel applicable</p></div>';
  if(r.fires.length){h+='<div class="id-card"><h3>🔥 Fiches origine de feu pertinentes ('+r.fires.length+')</h3>'+r.fires.map(function(x){
   return '<div style="border-bottom:1px solid #eee;padding:.6rem 0"><strong>'+esc15(x.f.title)+'</strong> <span class="badge-src">score '+x.s+'</span><br><small>'+esc15(x.f.zone)+'</small></div>';}).join('')+'</div>';}
  if(r.dtcs.length){h+='<div class="id-card"><h3>⚡ DTC identifiés</h3><ul>'+r.dtcs.map(function(x){return '<li><strong>'+esc15(x.dtc)+'</strong> : '+esc15(x.comp)+' — '+esc15(x.cause)+'</li>';}).join('')+'</ul></div>';}
  h+='<div class="id-card"><h3>⚖️ Doctrines juridiques applicables</h3>'+d.map(function(x){
   return '<div style="border-bottom:1px solid #eee;padding:.6rem 0"><strong>'+esc15(x.d.cat)+'</strong> ('+esc15(x.d.code)+') <span class="badge-src">pertinence '+x.score+'</span><br><small>Délai : '+esc15(x.d.delai)+'</small><br><small>Conditions : '+x.d.conditions.map(esc15).join(' • ')+'</small><br><small>📝 '+esc15(x.d.action)+'</small></div>';}).join('')+'</div>';
  h+='<div class="id-card"><h3>🎯 Recommandations (mode sapiteur)</h3><ol>'+
   '<li><strong>Conservation des preuves</strong> : ne pas faire réparer avant expertise, photographier toutes les pièces (avant/après), garder le véhicule en l\'état.</li>'+
   '<li><strong>Expertise contradictoire</strong> : convoquer vendeur+constructeur+assureur (CPC 16 & 1643). En cas d\'incendie : méthode NFPA 921 obligatoire, cartographie fusion (Zn420/Al660/Cu1084), arc mapping ASTM E2929.</li>'+
   '<li><strong>Mise en demeure</strong> (LRAR) : préalable obligatoire avant action (Code civ. 1344). Objet précis + délai raisonnable (15 j).</li>'+
   (e.seller==='pro'?'<li><strong>Vendeur pro</strong> : garantie de conformité (L217-3, 2 ans), obligation de sécurité (L421-3, 10 ans) activables.</li>':'')+
   (e.seller==='particulier'?'<li><strong>Vendeur particulier</strong> : vice caché uniquement (Code civ. 1641-1648, 2 ans découverte).</li>':'')+
   '<li><strong>Déclaration assureur</strong> : 5 jours ouvrés (sinistre), 10 jours (responsabilité civile).</li>'+
   '<li><strong>Documentation à conserver</strong> : facture d\'achat, carnet d\'entretien, historique interventions, photos sinistre, rapport expert, LRAR envoyées, emails.</li>'+
   '</ol></div>';
  h+='<div class="photo-row" style="margin:.6rem 0"><a class="rs-btn" style="display:inline-block;width:auto;padding:.5rem .8rem;text-decoration:none" target="_blank" href="https://expertkevin06-cell.github.io/d-faillance-auto-/">⚙️ Base défaillances</a><a class="rs-btn" style="display:inline-block;width:auto;padding:.5rem .8rem;text-decoration:none" target="_blank" href="https://auto-legal-by-kevin.lovable.app/">⚖️ Base juridique</a><a class="rs-btn" style="display:inline-block;width:auto;padding:.5rem .8rem;text-decoration:none" target="_blank" href="https://rappel.conso.gouv.fr">🇫🇷 Rappel Conso</a><a class="rs-btn" style="display:inline-block;width:auto;padding:.5rem .8rem;text-decoration:none" target="_blank" href="https://www.nhtsa.gov/recalls">🇺 NHTSA</a><a class="rs-btn" style="display:inline-block;width:auto;padding:.5rem .8rem;text-decoration:none" target="_blank" href="https://ec.europa.eu/safety-gate-alerts">🇪 Safety Gate</a></div>';
  out.innerHTML=h;},50);}
// ---- Bootstrap injection ----
(function boot(){function go(){
 var anchor=document.getElementById('section-ia');if(!anchor||document.getElementById('section-legal'))return;
 var sec=document.createElement('section');sec.id='section-legal';sec.style.borderTop='4px solid #1565c0';
 sec.innerHTML='<h2>⚖️ Analyse technique + juridique (contexte libre)</h2>'+
 '<p class="ve-intro">Décrivez votre situation : marque, modèle, année, symptômes, panne, sinistre, contexte de vente, vendeur (pro/particulier), objectif. 4 bases croisées en arrière-plan.</p>'+
 '<textarea id="laCtx" placeholder="Ex : J\'ai acheté en 2023 chez un concessionnaire une Peugeot 208 1.2 PureTech 82 kW de 2021. Depuis 3 mois : perte de puissance + fumée blanche + voyant moteur. Code défaut P0401. Le vendeur refuse la prise en charge. Je veux la réparation gratuite sous garantie de conformité." style="width:100%;min-height:120px;padding:.9rem;border:2px solid var(--border);border-radius:8px;font-family:inherit;font-size:1rem"></textarea>'+
 '<button id="laBtn" class="btn-secondary" style="margin-top:.8rem">🔎 Analyser (croisée : MEGA + RECALLS + FICHES + DTC)</button>'+
 '<div class="photo-row" style="margin:.6rem 0"><a class="rs-btn" style="display:inline-block;width:auto;padding:.5rem .8rem;text-decoration:none" target="_blank" href="https://expertkevin06-cell.github.io/d-faillance-auto-/">⚙️ Base défaillances</a><a class="rs-btn" style="display:inline-block;width:auto;padding:.5rem .8rem;text-decoration:none" target="_blank" href="https://auto-legal-by-kevin.lovable.app/">⚖️ Base juridique auto</a></div>'+
 '<div id="laOut" style="margin-top:1rem"></div>';
 anchor.parentNode.insertBefore(sec,anchor.nextSibling);
 document.getElementById('laBtn').addEventListener('click',laRun);
 console.log('✅ legal-auto v27 actif : contexte libre + 4 recherches croisées');}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();})();
