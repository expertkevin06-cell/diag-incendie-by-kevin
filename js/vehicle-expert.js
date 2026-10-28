// ================================================================
// MODULE INGÉNIEUR EXPERT VÉHICULES - v8
// ================================================================
const VEHICLE_EXPERT = {
zones:[
{zone:"Compartiment moteur",components:"Moteur, turbo, collecteur, cata, FAP, faisceau, alternateur, durites, LDR, clim",risks:"Huile/carburant sur point chaud, faisceau frotté, B+, regen FAP"},
{zone:"Habitacle",components:"Mousses PU, ABS/PC, faisceaux, 12V, USB, sièges chauffants, airbags",risks:"Mégots, chargeurs, résistance, pyrolyse mousse"},
{zone:"Coffre / arrière",components:"Batterie 12V, réservoir, pack HT (VE), faisceau hayon",risks:"Bornes 12V, court hayon, pack HT"},
{zone:"Soubassement",components:"Échappement, cata, FAP, réservoir, pack HT, freins",risks:"Cata sur herbes, fuite réservoir, impact pack"},
{zone:"Roues / freins",components:"Disques, plaquettes, étriers, pneus",risks:"600-900°C après descente, étrier grippé"},
{zone:"Extérieur",components:"Peinture, joints, PP",risks:"Propagation externe, acte volontaire, brandons"}],
origins:{
electrical12:{title:"⚡ Électrique 12V",voltage:"12-14,4 V — démarreur 200-600 A, alternateur 90-250 A, méga-fusible 300-500 A",modes:["Frottement gaine/tôle → court franc (B+ toujours énergisé)","Cosse oxydée → Joule P=R×I²","Boîte fusibles : eau → corrosion → arc","Aftermarket : épissures = cause n°1","Rongeurs : gaine sectionnée + nid","Fatigue vibratoire → arc série (protections NON déclenchées)","Alternateur B+ mal serré → fusion 100-250 A"],evidence:["Arc mapping vers source","Perles primaires sphériques + cavité (ASTM E2929)","Fusibles grillés = circuit énergisé pendant feu","Œillet cloison fondu","Épissures non OEM"]},
electrical48:{title:"⚡ 48V MHEV",voltage:"48 V — Li-ion 0,5-1,5 kWh, BSG 10-15 kW, DC/DC",modes:["Connecteurs 200-300 A : chauffe contact","Fuite LDR pack 48V","Choc pack","Câblage bleu frotté"],evidence:["<60 V : pas électrocution mais feu réel","Arcs busbars 48V, DC/DC fondu","Glycol dans pack"]},
electricalHV:{title:"⚡ HT 400-800 V",voltage:"350-450 V ou 700-925 V — câblage ORANGE + HVIL",components:"Pack (cellules/modules/busbars), BMS, contacteurs, pyrofuse, MSD, évents, plaque froide ; onduleur, OBC, DC/DC, PTC, e-clim, CCS/Type2",modes:["Défaut isolement → fuite → chauffe","Court externe (choc, perçage)","Surcharge / défaut BMS","Court interne : particule, dendrite Li (charge rapide <0°C), séparateur","Connecteur charge : broches contaminées/humides","Relais charge soudés"],evidence:["AVANT contact : isolement + tension résiduelle","Suie INTERNE + évents orientés + busbars fondus dedans = INTERNE","Calcination ext→int, cellules opposées intactes = EXTERNE","Logs BMS anormaux AVANT feu","Pyrofuse déclenché = choc (EDR/airbags)","CT-scan/X-ray AVANT ouverture"]},
fuel:{title:"⛽ Carburant",pressures:"Indirecte 3-4 bar • GDI 150-350 bar • CR diesel 1600-2500 bar → fuite HP = brouillard inflammable",data:[
{fluid:"Essence SP95/E10",flash:"-43°C",auto:"~280°C",lel:"1,4 %",note:"Vapeurs 3× air, au sol"},
{fluid:"Diesel B7",flash:"≥55°C",auto:"~210°C",lel:"0,6 %",note:"S'enflamme sur point chaud"},
{fluid:"E85",flash:"~13°C",auto:"~363°C",lel:"3,3 %",note:"Flamme peu visible"},
{fluid:"GPL",flash:"-104°C",auto:"~470°C",lel:"1,8 %",note:"Lourd, soupape"},
{fluid:"H2",flash:"Gaz",auto:"~560°C",lel:"4 %",note:"Flamme invisible"}],modes:["Durite poreuse, collier, connecteur rapide","Joint injecteur/rampe HP","Réservoir percé, pompe","Fuite HP = aérosol immédiat"],evidence:["Flaque brûlée au centre","GC-MS hydrocarbure ≠ accélérant","Origine = fuite × point chaud"]},
lines:{title:"🛢️ Canalisations & fluides",fluids:[
{fluid:"Huile moteur",auto:"300-350°C",leak:"Cache-culbuteurs, turbo, filtre",trace:"Vernis brun échappement"},
{fluid:"ATF boîte",auto:"300-400°C",leak:"Durite refroidisseur",trace:"Rouge-brun"},
{fluid:"Direction assistée",auto:"250-300°C",leak:"Durite HP pompe",trace:"Noir brillant"},
{fluid:"Frein DOT4",auto:"380-400°C",leak:"Durite souple",trace:"Peinture décapée"},
{fluid:"LDR glycol",auto:"398-410°C",leak:"Radiateur, pompe",trace:"Vapeur blanche sucrée"},
{fluid:"PAG/POE clim",auto:"350-400°C",leak:"Condenseur",trace:"Avec R1234yf : HF"},
{fluid:"R1234yf",auto:"~405°C (A2L)",leak:"Condenseur percé",trace:"Flamme + HF"},
{fluid:"AdBlue",auto:"Non inflammable",leak:"Injecteur DEF",trace:"Cristaux blancs, NH3"}]},
battery12:{title:"🔋 12V plomb",modes:["Cosse oxydée/desserrée → Joule","Court cosse/masse","H2 charge + étincelle → EXPLOSION","Fuite acide (coffre)"],evidence:"Boîtier éclaté, bornes projetées, sulfate blanc, perles B+"},
battery48:{title:"🔋 48V Li-ion",modes:"Choc, fuite LDR, surcharge DC/DC, court busbars",evidence:"Boîtier éventré, cellules gonflées, dépôt blanc LiPF6"},
hotSurfaces:{title:"🌡️ Points chauds réels",surfaces:[
{part:"Collecteur",normal:"400-600°C",charge:"800-1000°C"},{part:"Turbo",normal:"600-800°C",charge:"900-1000°C"},
{part:"Catalyseur",normal:"400-700°C",charge:"900-1200°C"},{part:"FAP regen",normal:"600-650°C",charge:"1200°C"},
{part:"Ligne aval",normal:"300-500°C",charge:"600°C"},{part:"Disques frein",normal:"150-300°C",charge:"600-900°C"},
{part:"Bloc moteur",normal:"90-120°C",charge:"140°C (non inflammant)"},{part:"Sonde lambda",normal:"600-800°C loc",charge:"-"}],rule:"Règle ingénieur : inflammation seulement si T° surface > T° auto-inflammation du FILM liquide (délai s à min)."}},
plastics:[
{p:"PP",use:"Pare-chocs, garnitures",fire:"Fond 160-170°C, gouttes enflammées",role:"Propagateur"},
{p:"PE",use:"Réservoirs, durites",fire:"Fond 110-130°C",role:"Réservoir = combustible tardif"},
{p:"PU mousse",use:"Sièges",fire:"Croissance rapide, CO+HCN",role:"Combustible n°1 habitacle"},
{p:"PVC",use:"Isolation câbles",fire:"Auto-extinguible, HCl, fumées",role:"Toxique"},
{p:"ABS",use:"Planche de bord",fire:"Fond 105°C, suie",role:"Habitacle"},
{p:"PA nylon",use:"Connecteurs, admission",fire:"Fond 220-260°C",role:"Résiste"},
{p:"POM",use:"Engrenages",fire:"Formaldéhyde",role:"Mineur"},
{p:"PC",use:"Optiques",fire:"Tg 150°C",role:"Faible"},
{p:"EPDM",use:"Joints",fire:"Charbonise lent",role:"Faible"},
{p:"PET",use:"Textiles",fire:"Fond 250°C",role:"Moyen"}],
fireLoad:{mass:"100-150 kg polymères/véhicule",energy:"Charge calorifique 2-4 GJ",hrr:"Pic 3-8 MW (10 MW récents) ; VE : pic + jet-fire",tires:"Pneus : combustion tardive longue"},
development:{stages:[
{s:"1. Initiation",d:"Arc, fuite, mégot — fumée blanche = pyrolyse"},
{s:"2. Croissance",d:"Gaines, durites, mousses — 2-6 min pour percer capot"},
{s:"3. Embrasement volume",d:"Habitacle 8-15 min, flashover local"},
{s:"4. Plein développement",d:"700-1000°C gaz, Al fondu, vitres éclatées"},
{s:"5. Décroissance",d:"Pneus + polymères, ré-ignition possible (VE)"}],
ventilation:["FERMÉ : O2 limité → fumée dense, suie interne ; ouverture = reprise violente","Fenêtre ouverte au-dessus : effet cheminée ×2-3","Vent latéral : foyer poussé sous le vent","Garage : nappe 500-700°C, propagation adjacent <1 m","Extérieur ventilé : combustion complète, cartographie lisible"],
spreadPaths:["Moteur→habitacle : œillets, HVAC, pédales","Passage roue→habitacle : garniture PP, moquette","Soubassement→plancher : moquette/pyrolyse","Coffre→habitacle : banquette, passe-câbles","VE : pack→habitacle par évents (jet-fire sous caisse)"],
direction:["Gradient profondeur brûlure","Coulures polymères","V-patterns carrosserie","Vitrage éclaté en premier","Cartographie fusion Zn 420 → Al 660 → Cu 1084","Densité suie décroissante"]},
evExpert:{sequence:[
{t:"90-120°C",e:"Décomposition SEI → exothermie lente, dégazage"},
{t:"120-180°C",e:"Anode↔électrolyte, montée pression"},
{t:"130-170°C",e:"Fusion séparateur PE/PP → court interne massif"},
{t:"180-250°C",e:"Cathode NMC/NCA → O2 auto-comburant"},
{t:"270-310°C",e:"LFP tardif sans O2 = plus sûr"},
{t:">200°C",e:"Électrolyte brûle + jet-fire 800-1400°C"}],
gases:"H2 20-40 % • CO 10-30 % • CO2 • CH4/C2H4 • carbonates • HF (LiPF6) • POF3 → inflammable + toxique → déflagration par évents",
triggers:["Mécanique : écrasement, perforation, flexion","Électrique externe : court, surcharge, isolement","Électrique interne : particule, dendrite, séparateur","Thermique externe : feu voisin, point chaud"],
causeVsConsequence:["INTERNE : évents de l'intérieur, suie DANS pack, busbars fondus internes, logs BMS AVANT feu","EXTERNE : calcination ext→int, cellules opposées intactes, aucun log pré-feu, arcs externes","Données : logs BMS, EDR, télématique, session borne"],
charging:["AC Type2 : broches contaminées/humides → arc 1000°C+","DC CCS : relais soudés, câble sectionné","Preuves : broches fondues directionnelles, perles connecteur, logs session"],
reignition:"Énergie piégée : surveillance 24-72 h min, cas 3 semaines ; stockage extérieur, écart 5 m",
extinction:["REFROIDIR : 30 000-100 000 L eau","Ne jamais percer pack","ARI obligatoire (HF)","Immersion container","Caméra thermique <60°C stable"]},
thermalExpert:{dpf:"Regen FAP 600-1200°C : stationnement herbes après = ignition. Preuve : log ECU regen, suie FAP, départ sous caisse arrière.",rodent:"Fouines : gaines sectionnées + nid. Preuve : marques de dents, matériau de nid.",recalls:"Vérifier rappels constructeur feu + entretien + sinistres + modifications.",aftermarket:"Épissures non OEM = 1ère cause électrique : traceurs, alarmes, audio, LED, sièges chauffants."},
meltMap:[
{m:"Zinc (galva)",t:"420°C",meaning:"Feu modéré local"},{m:"Aluminium",t:"660°C",meaning:"Feu sévère, gaz >700°C"},
{m:"Cuivre",t:"1084°C",meaning:"Feu majeur OU arc local"},{m:"Acier déformation",t:"700-900°C",meaning:"Perte résistance"},
{m:"Verre trempé",t:"éclate 250-300°C",meaning:"Chronologie ouvrants"},{m:"Chrome/décor",t:"400-600°C",meaning:"Gradients fins"}],
protocol:[
"1. Scène : position, espacement, flaque brûlée centre (fuite) vs contour versé (accélérant)",
"2. Identification : VIN, km, contact, câble de charge ?",
"3. Historique : entretien, rappels, mods, sinistres, télématique",
"4. Données : EDR, logs BMS, OBD gelé, session borne, cloud",
"5. Externe : suie/fusion/vitrages, ouvrants, béquille capot fondue ?",
"6. Compartiments : gradients, zone convergente",
"7. Électrique : arc mapping, B+, fusibles, épissures",
"8. Fluides : traçage UV, GC-MS",
"9. VE : isolement + tension résiduelle, CT/X-ray, évents, suie interne",
"10. Labo : métallographie ASTM E2929, FTIR, GC-MS",
"11. Hypothèses : élimination, conclusion (certain/probable/indéterminé)"]};

const ORIGIN_PHOTOS={electrical12:['harness_chafe','alternator_burnt','fuse_box','rodent_damage'],electrical48:['battery_runaway','harness_chafe'],electricalHV:['pack_teardown','ccs_connector','battery_burnt'],fuel:['gdi_pump','car_fire_road','oil_puddle'],lines:['coolant_leak','exhaust_hot','oil_puddle'],battery12:['alternator_burnt','fuse_box'],battery48:['battery_runaway'],hotSurfaces:['exhaust_hot','catalyst_glow','dpf_regen','tire_burn']};
const DEV_PHOTOS=['garage_fire','seat_foam','tire_burn','v_pattern'];
const EV_PHOTOS=['battery_runaway','pack_teardown','ev_reignition','ccs_connector'];
const PROTO_PHOTOS=['investigation_kit','pack_teardown','fuse_box'];

function vePhoto(key){const p=PHOTOS[key];return p?`<img src="${p.url}" alt="${p.caption}" loading="lazy" class="photo-thumb" onclick="openLightbox('${key}')" onerror="this.classList.add('photo-error')">`:'';}
function veRow(keys){return `<div class="photo-row">${(keys||[]).map(vePhoto).join('')}</div>`;}

function renderVehicleExpert(){
const V=VEHICLE_EXPERT,g=id=>document.getElementById(id);
if(!g('vz-grid'))return;
g('vz-grid').innerHTML=V.zones.map(z=>`<div class="ve-zone"><h4>📍 ${z.zone}</h4><p><strong>Composants :</strong> ${z.components}</p><p><strong>Risques :</strong> ${z.risks}</p></div>`).join('');
g('vo-grid').innerHTML=Object.entries(V.origins).map(([k,o])=>`<details class="ve-origin"><summary>${o.title}</summary>
${o.voltage?`<p class="ve-volt">🔌 ${o.voltage}</p>`:''}${o.pressures?`<p class="ve-volt">⛽ ${o.pressures}</p>`:''}
${o.components?`<p><strong>Composants :</strong> ${o.components}</p>`:''}
${o.modes?`<h5>Mécanismes de défaillance</h5><ul>${o.modes.map(m=>`<li>${m}</li>`).join('')}</ul>`:''}
${o.evidence&&Array.isArray(o.evidence)?`<h5>Preuves</h5><ul>${o.evidence.map(m=>`<li>${m}</li>`).join('')}</ul>`:''}
${o.evidence&&typeof o.evidence==='string'?`<p class="identification">${o.evidence}</p>`:''}
${o.data?`<div class="table-container"><table class="metal-table"><thead><tr><th>Fluide</th><th>Éclair</th><th>Auto-infl.</th><th>LIE</th><th>Note</th></tr></thead><tbody>${o.data.map(d=>`<tr><td><strong>${d.fluid}</strong></td><td>${d.flash}</td><td>${d.auto}</td><td>${d.lel}</td><td>${d.note}</td></tr>`).join('')}</tbody></table></div>`:''}
${o.fluids?`<div class="table-container"><table class="metal-table"><thead><tr><th>Fluide</th><th>Auto-infl.</th><th>Fuites</th><th>Trace</th></tr></thead><tbody>${o.fluids.map(d=>`<tr><td><strong>${d.fluid}</strong></td><td>${d.auto}</td><td>${d.leak}</td><td>${d.trace}</td></tr>`).join('')}</tbody></table></div>`:''}
${o.surfaces?`<div class="table-container"><table class="metal-table"><thead><tr><th>Organe</th><th>Normal</th><th>Charge</th></tr></thead><tbody>${o.surfaces.map(d=>`<tr><td><strong>${d.part}</strong></td><td>${d.normal}</td><td>${d.charge}</td></tr>`).join('')}</tbody></table></div><p class="identification">${o.rule}</p>`:''}
${veRow(ORIGIN_PHOTOS[k])}</details>`).join('');
g('vp-table').innerHTML=V.plastics.map(p=>`<tr><td><strong>${p.p}</strong></td><td>${p.use}</td><td>${p.fire}</td><td>${p.role}</td></tr>`).join('');
g('vf-load').innerHTML=`<p><strong>Masse :</strong> ${V.fireLoad.mass}</p><p><strong>Énergie :</strong> ${V.fireLoad.energy}</p><p><strong>HRR :</strong> ${V.fireLoad.hrr}</p><p><strong>Pneus :</strong> ${V.fireLoad.tires}</p>`;
g('vd-stages').innerHTML=V.development.stages.map(s=>`<div class="runaway-phase"><h4>${s.s}</h4><p>${s.d}</p></div>`).join('');
g('vd-vent').innerHTML=`<ul>${V.development.ventilation.map(v=>`<li>${v}</li>`).join('')}</ul>`+veRow(DEV_PHOTOS);
g('vd-spread').innerHTML=`<ul>${V.development.spreadPaths.map(v=>`<li>${v}</li>`).join('')}</ul>`;
g('vd-dir').innerHTML=`<ul>${V.development.direction.map(v=>`<li>${v}</li>`).join('')}</ul>`;
g('ev-seq').innerHTML=V.evExpert.sequence.map(s=>`<div class="runaway-phase"><h4>${s.t}</h4><p>${s.e}</p></div>`).join('')+veRow(EV_PHOTOS);
g('ev-gas').innerHTML=`<p class="identification">${V.evExpert.gases}</p>`;
g('ev-trig').innerHTML=`<ul>${V.evExpert.triggers.map(v=>`<li>${v}</li>`).join('')}</ul>`;
g('ev-cc').innerHTML=`<ul>${V.evExpert.causeVsConsequence.map(v=>`<li>${v}</li>`).join('')}</ul>`;
g('ev-chg').innerHTML=`<ul>${V.evExpert.charging.map(v=>`<li>${v}</li>`).join('')}</ul>`;
g('ev-reig').innerHTML=`<p class="identification">${V.evExpert.reignition}</p>`;
g('ev-ext').innerHTML=`<ul>${V.evExpert.extinction.map(v=>`<li>${v}</li>`).join('')}</ul>`;
g('th-expert').innerHTML=`<div class="id-card"><h4>🔥 FAP/regen</h4><p>${V.thermalExpert.dpf}</p>${veRow(['dpf_regen','catalyst_glow'])}</div>
<div class="id-card"><h4>🐭 Rongeurs</h4><p>${V.thermalExpert.rodent}</p>${veRow(['rodent_damage'])}</div>
<div class="id-card"><h4>📋 Rappels</h4><p>${V.thermalExpert.recalls}</p></div>
<div class="id-card"><h4>🔧 Aftermarket</h4><p>${V.thermalExpert.aftermarket}</p>${veRow(['harness_chafe','fuse_box'])}</div>`;
g('vm-table').innerHTML=V.meltMap.map(m=>`<tr><td><strong>${m.m}</strong></td><td>${m.t}</td><td>${m.meaning}</td></tr>`).join('');
g('vproto').innerHTML=V.protocol.map(p=>`<div class="method-step"><div class="step-num">${p.split('.')[0]}</div><div class="step-content"><p>${p.substring(p.indexOf('.')+1)}</p></div></div>`).join('')+veRow(PROTO_PHOTOS);
console.log('✅ Module expert v8 rendu');
}
document.addEventListener('DOMContentLoaded',renderVehicleExpert);
