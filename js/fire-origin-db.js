// ================================================================
// ORIGINE & FOYER v21 — zone de départ, feu VE, élec VS méca VS fluide, FAP/cata
// Photos réelles explicites liées à chaque étape
// ================================================================
var B2="https://image.qwenlm.ai/public_source/cf785bab-295b-41b7-b135-c32bc2c7d2ed/";
Object.assign(PHOTOS,{
origin_v_body:{url:B2+"1012034df-1d0c-4729-8d1b-f4c229283bb02076.png",caption:"V-pattern sur carrosserie : l’apex désigne la zone d’origine (ici avant/baie moteur)",credit:"StockCake"},
origin_pool:{url:B2+"0012034df-1d0c-4729-8d1b-f4c229283bb04727.png",caption:"Flaque brûlée EN SON CENTRE sous le véhicule = fuite à ce point (contour versé = accélérant)",credit:"Envato"},
ev_jetfire:{url:B2+"2012034df-1d0c-4729-8d1b-f4c229283bb09565.png",caption:"Jet-fire Li-ion 800-1400°C orienté par les évents (sous plancher)",credit:"ScienceDirect"},
ev_propag:{url:B2+"4012034df-1d0c-4729-8d1b-f4c229283bb04328.png",caption:"Propagation aux véhicules adjacents : rayonnement, espacement <1 m",credit:"TheMirror"},
dpf_cat:{url:B2+"2012034df-1d0c-4729-8d1b-f4c229283bb08185.png",caption:"FAP/catalyseur : régénération 600-1200°C, inflammation de végétation sous caisse",credit:"eBay"},
cat_melt:{url:B2+"6012034df-1d0c-4729-8d1b-f4c229283bb06248.png",caption:"Catalyseur et boucliers décolorés/fondus : signature thermique extrême",credit:"eBay"},
elec_beads:{url:B2+"2012034df-1d0c-4729-8d1b-f4c229283bb02098.png",caption:"Perles primaires = signature ÉLECTRIQUE au point de défaut (MEB)",credit:"ScienceDirect"},
mech_seize:{url:B2+"6012034df-1d0c-4729-8d1b-f4c229283bb05987.png",caption:"Origine MÉCANIQUE : moteur grippé, aluminium fondu, vernis d’huile",credit:"LION"}});
var FIRE_ORIGIN={
zoneSteps:[
{n:1,t:"Sécuriser & photographier AVANT toute manipulation",d:"4 faces + soubassement + habitacle ouvrants fermés : l’état initial est la preuve",p:["investigation_kit"]},
{n:2,t:"Gradients de profondeur de brûlure",d:"Peinture cloquée, plastiques fondus : la zone la PLUS profonde = la plus proche du foyer",p:["origin_v_body"]},
{n:3,t:"V-patterns / U-patterns carrosserie",d:"Apex du V vers le bas = origine ; V inversé sous plancher = foyer soubassement/pack VE",p:["origin_v_body","v_pattern"]},
{n:4,t:"Chronologie des vitrages",d:"Trempé latéral éclate au choc thermique (250-300°C) : le premier éclaté borde le foyer ; feuilleté pare-brise fond en périphérie",p:["crazed_glass"]},
{n:5,t:"Cartographie de fusion",d:"Zn 420°C → Al 660°C → Cu 1084°C : bornes de T° max par zone ; Al fondu sous plancher = jet-fire pack VE",p:["heat_colors","aluminum_melt"]},
{n:6,t:"Séquence pneus & jantes",d:"Le pneu le plus détruit et la jante la plus décolorée bordent le foyer",p:["tire_burn"]},
{n:7,t:"Lecture des flaques",d:"Brûlée AU CENTRE = fuite à ce point ; contour irrégulier versé = accélérant ; traînée = chemin de fuite",p:["origin_pool"]},
{n:8,t:"Arc mapping électrique",d:"Remonter depuis le B+ batterie : la PREMIÈRE perle primaire = origine du défaut électrique",p:["elec_beads","arc_beads"]},
{n:9,t:"Béquille capot & serrures",d:"Béquille fondue = feu sous capot AVANT ouverture ; capot intact = foyer hors baie moteur",p:["engine_burnt"]},
{n:10,t:"Spécifique VE",d:"Orientation des évents, suie INTERNE au pack, perforation plancher au-dessus des modules = origine interne pack",p:["pack_teardown","ev_jetfire"]}],
evFire:{phases:[
{t:"1. Initiation",d:"Court interne (particule, dendrite) ou externe (choc, eau) ou surcharge → SEI 90-120°C",p:["liion_cell"]},
{t:"2. Dégazage",d:"Fumée BLANCHE dense + sifflement : électrolyte vaporisé, HF toxique",p:["battery_runaway"]},
{t:"3. Jet-fire",d:"800-1400°C orienté par les évents (souvent vers le sol/plancher)",p:["ev_jetfire"]},
{t:"4. Propagation cell→cell",d:"Conduction 1-3 min/cellule, module→module",p:["battery_burnt"]},
{t:"5. Rupture pack",d:"Perforation plancher, jet dans habitacle",p:["pack_teardown"]},
{t:"6. Embrasement véhicule",d:"Mousses PU, plastiques, pneus : 10-20 min",p:["car_fire_road"]},
{t:"7. Propagation voisins",d:"Rayonnement >20 kW/m², espacement <1 m (parkings)",p:["ev_propag"]},
{t:"8. Ré-ignition",d:"Énergie piégée : 24-72 h, cas jusqu’à 3 semaines",p:["ev_reignition"]}],
signs:["Fumée blanche + odeur âcre solvants","Sifflement dégazage","Jets directionnels sous caisse","Dépôts blancs LiPF6","Caméra thermique : points chauds résiduels"]},
compare:[
{c:"Perles de fusion",e:"Sphériques brillantes AU point de défaut (primaires)",m:"Absentes ou secondaires uniquement",f:"Absentes"},
{c:"Localisation fusions",e:"Connecteur, composant, épissure",m:"Le long de l’organe chaud (échappement, turbo)",f:"Le long du chemin de fuite"},
{c:"Résidus signatures",e:"Oxyde cuivre, carbone PVC",m:"Bleuissement acier, grippage, vernis huile",f:"Vernis brun (huile) / flaque centre (carburant)"},
{c:"Arc mapping",e:"Chemin d’arcs continu depuis B+",m:"Aucun",f:"Aucun"},
{c:"Fusibles",e:"Fusible du circuit grillé",m:"Intacts",f:"Intacts"},
{c:"Codes EDR/BMS",e:"Codes court-circuit/isolement AVANT événement",m:"Codes température/surchauffe",f:"Codes pression huile/carburant"},
{c:"Odeurs / labo",e:"HCl (PVC), cuivre",m:"Huile brûlée",f:"Hydrocarbures GC-MS"},
{c:"Chronologie témoins",e:"Flash instantané + étincelles",m:"Fumée progressive puis flamme",f:"Flash (essence) / fumée lente (huile)"}],
dpfCat:{mech:"Régénération FAP 600-650°C (jusqu’à 1200°C si régénération ratée/ratés d’allumage) ; exothermie catalyseur 900-1200°C. Inflammation de végétation sèche (250-300°C), de feuilles mortes ou d’une fuite (huile/carburant) au contact du soubassement chaud.",
evidence:["Végétation carbonisée ALIGNÉE sur la position FAP/cata","Boucliers PP fondus (160°C) au droit du soubassement","Ligne échappement bleui/décolorée","Log ECU : régénération active au moment du stationnement","ABSENCE de perles primaires à l’origine (écarte l’hypothèse électrique)"],
prevention:["Éviter stationnement herbes/pailles après trajet charge","Contrôler boucliers thermiques","Surveiller alertes régénération"],
photos:["dpf_cat","cat_melt","origin_pool","catalyst_glow"]}};
// Injection recherchable
[{id:"fo01",subsys:"fire",cause:"[FOYER] Détermination zone de départ véhicule",mech:"Gradients, V-patterns, vitrages, cartographie fusion, flaques, arc mapping, béquille capot",idx:"Convergence des indices = foyer",photos:["origin_v_body","origin_pool","elec_beads"]},
{id:"fo02",subsys:"charge",cause:"[VE] Départ batterie HT & propagation ensemble",mech:"Jet-fire évents → modules → plancher → habitacle → voisins → ré-ignition",idx:"Suie interne pack, évents orientés",photos:["ev_jetfire","ev_propag","pack_teardown"]},
{id:"fo03",subsys:"elec",cause:"[COMPARATIF] Origine électrique VS mécanique VS fluide",mech:"8 critères : perles, fusions, résidus, arc mapping, fusibles, codes, odeurs, chronologie",idx:"Tableau comparatif",photos:["elec_beads","mech_seize","origin_pool"]},
{id:"fo04",subsys:"dpf",cause:"[FAP/CATA] Départ de feu soubassement",mech:"Régénération 600-1200°C + végétation/fuite sous caisse",idx:"Végétation alignée, log ECU regen, absence perles",photos:["dpf_cat","cat_melt"]}].forEach(function(x){if(!RECALLS.find(function(r){return r.id===x.id;}))RECALLS.push({id:x.id,brand:"Multi-marques",models:"Tous véhicules",years:"2018-2026",energy:"thermal",motor:"-",power:"-",region:"Multi",src:"Doctrine sapiteur",ref:"NFPA 921",subsys:x.subsys,cause:x.cause,mech:x.mech,idx:x.idx,photos:x.photos});});
function foRow(ps){return '<div class="photo-row big">'+(ps||[]).map(function(p){return vePhoto(p);}).join('')+'</div>';}
function renderFireOrigin(){var g=function(id){return document.getElementById(id);};if(!g('fo-zone'))return;
g('fo-zone').innerHTML=FIRE_ORIGIN.zoneSteps.map(function(s){return '<div class="method-step"><div class="step-num">'+s.n+'</div><div class="step-content"><strong>'+s.t+'</strong><p>'+s.d+'</p>'+foRow(s.p)+'</div></div>';}).join('');
g('fo-ev').innerHTML=FIRE_ORIGIN.evFire.phases.map(function(p){return '<div class="runaway-phase"><h4>'+p.t+'</h4><p>'+p.d+'</p>'+foRow(p.p)+'</div>';}).join('')+'<div class="id-card"><h4>🚨 Signes annonciateurs</h4><ul>'+FIRE_ORIGIN.evFire.signs.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ul></div>';
g('fo-compare').innerHTML='<div class="table-container"><table class="metal-table"><thead><tr><th>Critère</th><th>⚡ Électrique</th><th>⚙️ Mécanique / thermique</th><th>🛢️ Fluide (huile/carburant)</th></tr></thead><tbody>'+FIRE_ORIGIN.compare.map(function(r){return '<tr><td><strong>'+r.c+'</strong></td><td>'+r.e+'</td><td>'+r.m+'</td><td>'+r.f+'</td></tr>';}).join('')+'</tbody></table>';
g('fo-dpf').innerHTML='<div class="id-card"><h4>Mécanisme</h4><p>'+FIRE_ORIGIN.dpfCat.mech+'</p></div><div class="id-card"><h4>Preuves à relever</h4><ul>'+FIRE_ORIGIN.dpfCat.evidence.map(function(e){return '<li>'+e+'</li>';}).join('')+'</ul></div><div class="id-card"><h4>Prévention / contrôle</h4><ul>'+FIRE_ORIGIN.dpfCat.prevention.map(function(e){return '<li>'+e+'</li>';}).join('')+'</ul>'+foRow(FIRE_ORIGIN.dpfCat.photos)+'</div>';
console.log('✅ fire-origin v21 rendu (foyer, VE, comparatif, FAP/cata)');}
document.addEventListener('DOMContentLoaded',renderFireOrigin);
