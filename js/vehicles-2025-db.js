// ================================================================
// VÉHICULES 2024-2026 : R5/R4 E-Tech, Elroq, Bigster, Austral, Rafale, Scenic, Symbioz - v15
// Extension additive (ne modifie aucun fichier existant)
// ================================================================
(function(){
var C=window.VEHICLE_CATALOG;if(!C)return;
C.renault=C.renault||{};
Object.assign(C.renault,{
 "Renault 5 E-Tech":["BEV 40 kWh|70 kW","BEV 52 kWh|90-110 kW"],
 "Renault 4 E-Tech":["BEV 40 kWh|70 kW","BEV 52 kWh|90-110 kW"],
 "Austral":["1.2 E-Tech|116-147 kW","1.3 TCe MHEV|103-116 kW"],
 "Rafale":["1.2 E-Tech|147-160 kW"],
 "Scenic E-Tech":["BEV|125-160 kW"],
 "Scenic IV":["1.3 TCe|103-116 kW","1.5 Blue dCi|85 kW","1.7 Blue dCi|110 kW"],
 "Symbioz":["1.6 E-Tech|105-107 kW"],
 "Megane E-Tech":["BEV|96-160 kW"]});
C.skoda=C.skoda||{};Object.assign(C.skoda,{"Elroq":["BEV 52|125 kW","BEV 77|150-210 kW"],"Kodiaq II":["1.5 TSI|110 kW","2.0 TDI|142 kW"]});
C.dacia=C.dacia||{};Object.assign(C.dacia,{"Bigster":["1.2 TCe MHEV|96-103 kW","Hybrid 150|110 kW","ECO-G|103 kW"]});
var NEW=[
{id:"n01",brand:"Renault",models:"Renault 5 E-Tech, Renault 4 E-Tech",years:"2024-2026",energy:"ev",motor:"BEV AmpR Small",power:"70-110 kW",subsys:"charge",cause:"Interruptions charge AC/DC + échauffement prise",mech:"Communication pilote/borne instable + résistance de contact broches → arc local",idx:"Broches Type2 marquées, logs charge interrompus",src:"RETEX 2024-2025",ref:"-",photos:["ccs_connector","melted_plugs"]},
{id:"n02",brand:"Renault",models:"Renault 5 E-Tech, Renault 4 E-Tech, Scenic E-Tech",years:"2024-2026",energy:"ev",motor:"BEV",power:"70-160 kW",subsys:"range",cause:"Décharge 12V Li-ion → immobilisation",mech:"Batterie 12V Li-ion faible capacité + consommateurs veille → panne totale",idx:"12V <11 V, codes U",src:"RETEX 2024-2025",ref:"-",photos:["terminal_glow","fuse_box"]},
{id:"n03",brand:"Renault",models:"Renault 5 E-Tech, Renault 4 E-Tech",years:"2024-2026",energy:"ev",motor:"BEV 40/52 kWh",power:"70-110 kW",subsys:"range",cause:"Autonomie hiver -25/-35% (pompe à chaleur absente sur 40 kWh)",mech:"Chauffage PTC énergivore + physique Li-ion froid",idx:"Conso kWh/100 élevée, préconditionnement",src:"Doctrine/RETEX",ref:"-",photos:["battery_runaway"]},
{id:"n04",brand:"Renault",models:"Austral, Rafale, Symbioz (E-Tech)",years:"2022-2026",energy:"hybrid",motor:"1.2/1.6 E-Tech",power:"105-160 kW",subsys:"mech",cause:"Boîte E-Tech : actuators crabots / à-coups",mech:"Actionneurs boîte → limp + surchauffe locale électronique",idx:"Codes boîte, à-coups à froid",src:"RETEX 2023-2025",ref:"-",photos:["engine_burnt","fuse_box"]},
{id:"n05",brand:"Renault",models:"Austral, Rafale, Espace VI",years:"2022-2026",energy:"hybrid",motor:"1.2 E-Tech",power:"116-160 kW",subsys:"elec",cause:"Décharge 12V + reboots OpenR Link",mech:"Consommateurs veille + calculateur multimédia → panne 12V récurrente",idx:"Historique 12V, reboots",src:"RETEX 2023-2025",ref:"-",photos:["terminal_glow"]},
{id:"n06",brand:"Renault",models:"Scenic IV (1.5/1.7 Blue dCi)",years:"2016-2022",energy:"thermal",motor:"1.5/1.7 dCi",power:"85-110 kW",subsys:"adblue",cause:"Système AdBlue : pompe/capteur NOx/cristallisation",mech:"Défaut NOx → dérivation → NH3 + encrassement DPF",idx:"Cristaux blancs, codes P20xx",src:"Rappel Conso/RETEX",ref:"2019-2022",photos:["coolant_leak","dpf_regen"]},
{id:"n07",brand:"Renault",models:"Scenic E-Tech",years:"2024-2026",energy:"ev",motor:"BEV 87 kWh",power:"125-160 kW",subsys:"charge",cause:"Préconditionnement batterie/charge DC dégradé",mech:"Charge lente + échauffement pack en DC répété",idx:"Courbes charge, ΔT pack",src:"RETEX 2024-2025",ref:"-",photos:["ccs_connector","battery_runaway"]},
{id:"n08",brand:"Renault",models:"Renault 5/4/Scenic E-Tech",years:"2024-2026",energy:"ev",motor:"BEV",power:"70-160 kW",subsys:"charge",cause:"Surchauffe broches Type2 (charges AC répétées 11 kW)",mech:"Résistance de contact → arc → flamme prise",idx:"Broches bleues/fondues",src:"Doctrine",ref:"-",photos:["melted_plugs","ccs_connector"]},
{id:"n09",brand:"Skoda",models:"Elroq",years:"2024-2026",energy:"ev",motor:"BEV MEB 52/77 kWh",power:"125-210 kW",subsys:"charge",cause:"Dérating DC + software charge (MEB début de série)",mech:"Gestion thermique conservative → puissance bridée",idx:"Logs borne, mises à jour",src:"RETEX 2025",ref:"-",photos:["ccs_connector"]},
{id:"n10",brand:"Skoda",models:"Elroq, Enyaq",years:"2021-2026",energy:"ev",motor:"BEV MEB",power:"125-220 kW",subsys:"overheat",cause:"Pompe LDR batterie : humidité → court-circuit (famille MEB)",mech:"Court pompe → RISQUE FEU + perte gestion thermique",idx:"Pompe fondue, codes BMS",src:"KBA/NHTSA",ref:"2021-2022",photos:["pack_teardown","coolant_leak"]},
{id:"n11",brand:"Skoda",models:"Elroq",years:"2024-2026",energy:"ev",motor:"BEV",power:"125-210 kW",subsys:"elec",cause:"Décharge 12V (infotainment veille)",mech:"Immobilisation + contacteurs HT ouverts",idx:"12V basse",src:"RETEX 2025",ref:"-",photos:["terminal_glow"]},
{id:"n12",brand:"Dacia",models:"Bigster (1.2 TCe MHEV)",years:"2025-2026",energy:"hybrid",motor:"1.2 TCe 48V",power:"96-103 kW",subsys:"elec",cause:"Système 48V : BSG/DC-DC (famille MHEV)",mech:"Perte stop-start + échauffement connecteurs 48V",idx:"Codes 48V",src:"Doctrine/RETEX",ref:"-",photos:["fuse_box","alternator_burnt"]},
{id:"n13",brand:"Dacia",models:"Bigster ECO-G",years:"2025-2026",energy:"lpg",motor:"1.2 TCe GPL",power:"103 kW",subsys:"fuel",cause:"Étanchéité multivalve/réservoir GPL (famille ECO-G)",mech:"Nappe GPL → flash retour",idx:"Souffle arrière, givre vanne",src:"Rappel Conso (famille)",ref:"2021-2022",photos:["car_fire_road"]},
{id:"n14",brand:"Dacia",models:"Bigster",years:"2025-2026",energy:"thermal",motor:"Tous",power:"-",subsys:"adas",cause:"Caméra ADAS + eCall : défauts calibration début de série",mech:"Perte AEB/lane-keep",idx:"Codes ADAS",src:"RETEX 2025",ref:"-",photos:["investigation_kit"]},
{id:"n15",brand:"Renault",models:"Rafale (E-Tech 4x4)",years:"2023-2026",energy:"hybrid",motor:"1.2 E-Tech 4x4",power:"160 kW",subsys:"elec",cause:"Moteur arrière/inverter : échauffement connecteurs HT",mech:"Arc DC local sous plancher",idx:"Connecteurs HT marqués",src:"RETEX 2024-2025",ref:"-",photos:["pack_teardown","harness_chafe"]},
{id:"n16",brand:"Renault",models:"Symbioz",years:"2024-2026",energy:"hybrid",motor:"1.6 E-Tech",power:"105-107 kW",subsys:"elec",cause:"12V + onduleur HEV (famille E-Tech)",mech:"Immobilisation + échauffement DC-DC",idx:"Codes DC-DC",src:"Doctrine/RETEX",ref:"-",photos:["terminal_glow","fuse_box"]},
{id:"n17",brand:"Renault",models:"Austral, Rafale (1.2 E-Tech turbo)",years:"2022-2026",energy:"thermal",motor:"1.2 E-Tech",power:"116-160 kW",subsys:"turbo",cause:"Turbo essence : coking/lubrification (famille 1.2 turbo)",mech:"Fuite huile sur turbo chaud → feu baie",idx:"Turbo gras/bleu",src:"RETEX",ref:"-",photos:["exhaust_hot","engine_burnt"]},
{id:"n18",brand:"Skoda / Dacia / Renault",models:"Elroq, Bigster, R5 (plateformes neuves)",years:"2024-2026",energy:"ev",motor:"BEV",power:"-",subsys:"camera",cause:"Caméras/radars : buée interne débuts de série",mech:"Perte assistances, recalibrations",idx:"Buée optique, codes",src:"RETEX 2025",ref:"-",photos:["investigation_kit"]}];
NEW.forEach(function(x){if(!RECALLS.find(function(r){return r.id===x.id;}))RECALLS.push({id:x.id,brand:x.brand,models:x.models,years:x.years,energy:x.energy,motor:x.motor+' ('+x.power+')',region:'EU',src:x.src,ref:x.ref,cause:'['+x.subsys.toUpperCase()+'] '+x.cause,mech:x.mech,idx:x.idx,photos:x.photos,power:x.power,subsys:x.subsys});});
console.log('✅ v15 : +'+NEW.length+' pannes 2024-2026 (R5/R4 E-Tech, Elroq, Bigster, Austral, Rafale, Scenic, Symbioz) — RECALLS='+RECALLS.length);
})();
