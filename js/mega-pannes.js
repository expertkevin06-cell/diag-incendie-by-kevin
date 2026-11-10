// ================================================================
// MEGA-PANNES v30 — Pavé Pannes connues + IA locale + juriste
// Fusion 4 sites internes + photos réelles ciblées
// ================================================================
var B2="https://image.qwenlm.ai/public_source/cf785bab-295b-41b7-b135-c32bc2c7d2ed/";
function P2(a,b){return B2+a+"-1fcb-4aab-867a-73f78120a3c2"+b+".png";}
Object.assign(PHOTOS,{
oil_drip:{url:P2("3c9cfd728","5415"),caption:"Fuite d'huile moteur : goutte active au point bas",credit:"Fiches-auto"},
oil_cover:{url:P2("2c9cfd728","4966"),caption:"Joint de cache-culbuteurs : suintement caractéristique",credit:"Pelican Parts"},
oil_seep:{url:P2("1c9cfd728","3289"),caption:"Suintement d'huile sur carter/pipe : zone d'origine",credit:"BMWist"},
engine_teardown:{url:P2("5c9cfd728","6305"),caption:"Moteur déposé M9R : inspection après grippage",credit:"France Moteurs"},
dpf_cut:{url:P2("5c9cfd728","2336"),caption:"FAP coupé : monolithe encrassé (suies)",credit:"L'Argus"},
dpf_psa:{url:P2("6c9cfd728","8021"),caption:"Schéma PSA : FAP + additif + AdBlue",credit:"PSA"},
dpf_regen_psa:{url:P2("0c9cfd728","3566"),caption:"Régénération FAP par combustion (600-650°C)",credit:"PSA"},
dpf_under:{url:P2("7c9cfd728","9715"),caption:"FAP/catalyseur au banc : dépose analyse",credit:"Girardia"},
belt_puretech:{url:P2("3c9cfd728","2357"),caption:"Courroie humide PureTech : délaminage/effilochage",credit:"Reddit r/peugeot"},
belt_port:{url:P2("2c9cfd728","7591"),caption:"Trappe inspection : courroie bain d'huile dégradée",credit:"Reddit r/peugeot"},
belt_pulley:{url:P2("1c9cfd728","4652"),caption:"Poulie/crepine : débris courroie dans l'huile",credit:"Caradisiac"},
cyl_score:{url:P2("0c9cfd728","4283"),caption:"Cylindre rayé/grippé : stries verticales",credit:"Scooter System"},
piston_m9r:{url:P2("3c9cfd728","2750"),caption:"Piston M9R : contrôle usure/calamine/segments",credit:"France Moteurs"},
thermal_fluke:{url:P2("8c9cfd728","6505"),caption:"Caméra thermique Fluke : pic thermique localisé",credit:"Fluke"},
thermal_panel:{url:P2("6c9cfd728","7515"),caption:"Thermographie tableau : point chaud = résistance",credit:"LEADER"},
exhaust_blued:{url:P2("2c9cfd728","5067"),caption:"Collecteur bleui/violet : surchauffe chronique",credit:"Forum Yamaha"},
alt_schema:{url:P2("8c9cfd728","7288"),caption:"Schéma 12V : batterie, démarreur, B+, masses",credit:"AudiPassion"},
alt_photo:{url:P2("0c9cfd728","3082"),caption:"Alternateur : borne B+ et faisceau",credit:"Smarins"},
car_burnt_street:{url:P2("2c9cfd728","6771"),caption:"Véhicule incendié voie publique : traces post-feu",credit:"Républicain Lorrain"}});
var THEMES=[["all","🌐 Tous"],["engine-oil","🛢️ Moteur / huile"],["timing-belt","⛓️ Distribution / courroie"],["exhaust-dpf","🌫️ Échappement / FAP"],["cooling","🌡️ Refroidissement"],["fuel-lpg","⛽ Carburant / GPL"],["elec-12-48","⚡ Électrique 12/48V"],["hv-charge","🔋 HT / charge"],["range","🔋 Autonomie / 12V"],["adas","📡 ADAS"],["gearbox","⚙️ Boîte"],["brakes","🛑 Freins / pneus"],["cabin","🛋️ Habitacle"],["fire-origin","🔥 Origine incendie"]];
function M(a){return{id:a[0],theme:a[1],system:a[2],comp:a[3],dtc:a[4],type:a[5],sev:a[6],brands:a[7],models:a[8],motors:a[9],cause:a[10],sym:a[11],fix:a[12],src:a[13],fire:a[14],photos:a[15]};}
var MEGA=[
M(["mp01","timing-belt","Moteur","Chaîne distribution","P0010","Mécanique","🔴","Toutes","Tous","Tous","Décalage arbre à cames (tendeur usé)","Claquement froid, ratés, voyant","Chaîne+tendeur+calage (TSB)","https://expertkevin06-cell.github.io/autodiag-formation-auto/","→ Saut chaîne = casse = huile sur chaud",["belt_port","engine_teardown"]]),
M(["mp02","timing-belt","Moteur","Courroie humide PureTech","-","Mécanique","🔴","Peugeot, Citroën, Opel, DS","208/2008/308/C3/C4/Corsa","1.2 PureTech 55-107 kW","Délamination → débris crépine → perte pression","Voyant huile, bruit, perte puissance","Campagne 2023-24 : courroie+crépine+vidange","https://expertkevin06-cell.github.io/auto-diagnostic/","→ Serrage = fuite huile échappement = FEU",["belt_puretech","belt_port","belt_pulley","cyl_score"]]),
M(["mp03","engine-oil","Moteur","Joint cache-culbuteurs","-","Mécanique","🟡","Toutes","Tous","Tous","Suintement puis fuite haut moteur","Odeur huile chaude, fumée accélération","Joint + couple serrage","https://expertkevin06-cell.github.io/my-tech-by-kevin/","→ Huile collecteur 400-800°C = auto-infl.",["oil_drip","oil_cover"]]),
M(["mp04","engine-oil","Moteur","Joints turbo / retour","-","Mécanique","🔴","VAG, BMW, PSA, Renault","Diesel & essence turbo","Tous turbo","Fuite huile carter turbo chaud","Fumée bleue, turbo sifflant","Joints/retour turbo","https://expertkevin06-cell.github.io/my-tech-by-kevin/","→ Huile 600-1000°C = flamme immédiate",["oil_seep","exhaust_hot"]]),
M(["mp05","exhaust-dpf","Échappement","FAP / DPF","P2463","Mécanique","🟡","Toutes diesel","Tous","Diesel","Colmatage suies : ΔP élevé","Perte puissance, regen longues","Nettoyage/remplacement","https://expertkevin06-cell.github.io/autodiag-formation-auto/","→ Regen 600-1200°C = charge soubassement",["dpf_cut","dpf_psa","dpf_under"]]),
M(["mp06","exhaust-dpf","Échappement","Régénération FAP","-","Mécanique","🔴","Toutes diesel","Tous","Diesel","Regen en cours sur végétation","Odeur herbe brûlée, fumée sous caisse","Ne pas stationner herbe/paille","https://expertkevin06-cell.github.io/auto-diagnostic/","→ Herbe 250-300°C = inflammation",["dpf_regen_psa","dpf_cat","origin_pool"]]),
M(["mp07","exhaust-dpf","Échappement","Collecteur / ligne","-","Mécanique","🟡","Toutes","Tous","Tous","Bleuissement = surchauffe chronique","Coloration anormale, perfo","Contrôle mélange/soupapes","https://expertkevin06-cell.github.io/aide-redactionnelle-technique/","→ Colorations = lecture T° max",["exhaust_blued","heat_colors"]]),
M(["mp08","cooling","Refroidissement","Pompe à eau EA888/EA211","-","Mécanique","🔴","VW, Audi, Seat, Skoda","Golf, Passat, A3, Octavia","1.0-2.0 TSI/TDI","Boîtier plastique fissuré","Surchauffe, niveau bas, fuite rose","Campagne KBA 2019-21","https://expertkevin06-cell.github.io/auto-diagnostic/","→ Surchauffe = grippage = huile chaud",["coolant_leak","thermal_fluke"]]),
M(["mp09","cooling","Moteur","Cylindre / piston","P0217","Mécanique","🔴","Toutes","Tous","Tous","Surchauffe : cylindre rayé, piston grippé","Puissance basse, cliquetis","Moteur ouvert chemises/pistons","https://expertkevin06-cell.github.io/my-tech-by-kevin/","→ Grippage = projection huile = FEU",["cyl_score","piston_m9r","thermal_fluke","engine_teardown"]]),
M(["mp10","fuel-lpg","Carburant","Pompe HP GDI","P0087","Mécanique","🔴","VAG, BMW, PSA, Hyundai","Essence directe","GDI/THP/TSI","Fuite HP 150-350 bar = aérosol","Odeur essence, flash","Pompe/rampe HP","https://expertkevin06-cell.github.io/auto-diagnostic/","→ Aérosol instantané sur turbo",["gdi_pump","car_fire_road"]]),
M(["mp11","fuel-lpg","GPL","Multivalve / réservoir","-","Mécanique","🔴","Dacia, Renault, Fiat","Sandero, Clio, Duster ECO-G","1.0 TCe GPL","Fuite GPL phase vapeur/liquide","Odeur GPL, givre vanne","Campagne Rappel Conso 2021-22","https://rappel.conso.gouv.fr","→ Nappe lourde = flash retour",["car_fire_road","car_burnt_street"]]),
M(["mp12","elec-12-48","Électrique","Borne B+ / cosses","-","Électrique","🔴","Toutes","Tous","Tous","Cosse B+ sous-couple → Joule → arc","Fusion borne, odeur chaud, panne","Couple + graisse contact","https://expertkevin06-cell.github.io/autodiag-formation-auto/","→ Arc >2000°C = départ baie",["alt_photo","alt_schema","arc_beads"]]),
M(["mp13","elec-12-48","Électrique","Alternateur / diodes","P0562","Électrique","🟡","Toutes","Tous","Tous","Redresseur HS → ondulation","Voyant batterie, phares faibles","Alternateur/redresseur","https://expertkevin06-cell.github.io/my-tech-by-kevin/","→ Échauffement faisceau charge",["alt_photo","alt_schema"]]),
M(["mp14","elec-12-48","Électrique","Boîte à fusibles","-","Électrique","🔴","Toutes","Tous","Tous","Infiltration eau → court électrolytique","Fusibles grillés en série","Étanchéité + boîte neuve","https://expertkevin06-cell.github.io/auto-diagnostic/","→ Fusion lente lames = feu isolants",["fuse_box","panel_burnt"]]),
M(["mp15","hv-charge","HT","Pompe LDR batterie MEB","-","Électrique","🔴","VW, Audi, Skoda","ID.3/4/5, Q4, Enyaq, Elroq","BEV MEB","Humidité pompe → court interne","Codes BMS, charge limitée","Campagne KBA/NHTSA 2021-22","https://expertkevin06-cell.github.io/auto-diagnostic/","→ RISQUE FEU pack + perte thermique",["pack_teardown","coolant_leak"]]),
M(["mp16","hv-charge","HT","Connecteur CCS/Type2","-","Électrique","🔴","Toutes VE","Tous","BEV/PHEV","Tracking/arc broches (humidité, sel)","Marques noires, chauffe charge","Connecteur/broches","https://expertkevin06-cell.github.io/my-tech-by-kevin/","→ Arc DC 1000°C = flamme trappe",["ccs_connector","melted_plugs"]]),
M(["mp17","range","12V/autonomie","Décharge parasite","-","Électronique","🟡","Tesla, VW, Renault VE","Model 3/Y, ID., Zoe","BEV","Veille software + consommateurs","Autonomie -2 à -5%/jour, immo","MàJ software + 12V","https://expertkevin06-cell.github.io/autodiag-formation-auto/","→ 12V faible = contacteurs ouverts",["terminal_glow","fuse_box"]]),
M(["mp18","adas","ADAS","Caméra pare-brise","C1234","Électronique","🟡","Toutes","Tous","Tous","Buée/désalignement après vitrage","Perte lane-keep/AEB","Calibration + étanchéité","https://expertkevin06-cell.github.io/autodiag-formation-auto/","→ Sécurité active dégradée",["investigation_kit"]]),
M(["mp19","gearbox","Transmission","Mécatronique DQ200","P0730","Mécanique","🟡","VW, Audi, Seat, Skoda","Golf, Polo, Octavia","1.0-1.6 TSI/TDI","Embrayage sec + mécatronique","Broutage, à-coups","Mécatronique/embrayage","https://expertkevin06-cell.github.io/my-tech-by-kevin/","→ Surchauffe boîte = risque feu",["engine_burnt","thermal_fluke"]]),
M(["mp20","brakes","Freins","Étrier grippé / disque","-","Mécanique","🟡","Toutes","Tous","Tous","Frottement continu → 600-900°C","Tirage, odeur brûlé, vibration","Étrier/disque/neuf","https://expertkevin06-cell.github.io/autodiag-formation-auto/","→ Pneus 250-300°C = inflammation",["tire_burn","thermal_fluke"]]),
M(["mp21","cabin","Habitacle","Siège chauffant / USB","-","Électrique","🟡","Toutes","Tous","Tous","Résistance sectionnée / court USB","Odeur, point chaud siège","Résistance/chargeur neuf","https://expertkevin06-cell.github.io/my-tech-by-kevin/","→ Pyrolyse PU = couvaison",["seat_foam","smoker_car"]]),
M(["mp22","fire-origin","Global","Arceau / structure","-","Mécanique","🔴","Toutes","Tous","Tous","Choc + fuite + source chaude","Feu post-collision","Sécurisation + scellés","https://expertkevin06-cell.github.io/aide-redactionnelle-technique/","→ NFPA 921 : point origine",["car_burnt_street","investigation_kit"]]),
M(["mp23","elec-12-48","Électrique","Rongeurs faisceau","-","Mécanique","🔴","Toutes","Tous","Tous","Gaines sectionnées + nid","Court franc + combustible","Dératisation + faisceau","https://expertkevin06-cell.github.io/auto-diagnostic/","→ Dents + nid = preuve rongeur",["rodent_damage","harness_chafe"]]),
M(["mp24","hv-charge","HT","OBC / onduleur glycol","-","Électrique","🔴","Audi, VW","Q4 e-tron, ID.","BEV MEB","Fuite LDR sur OBC → court PCB","Codes isolation, chauffe","OBC + étanchéité","https://expertkevin06-cell.github.io/auto-diagnostic/","→ Glycol + busbars = arc DC",["pack_teardown","coolant_leak"]]),
M(["mp25","cooling","Refroidissement","Thermostat bloqué","-","Mécanique","🟡","Toutes","Tous","Tous","Ne s'ouvre plus → surchauffe","Aiguille rouge, vapor LDR","Thermostat neuf","https://expertkevin06-cell.github.io/my-tech-by-kevin/","→ Surchauffe chronique = usure",["thermal_fluke","coolant_leak"]]),
M(["mp26","exhaust-dpf","Échappement","Catalyseur surchauffé","-","Mécanique","🔴","Toutes","Tous","Essence/diesel","Mélange pauvre / ratés → cata 1200°C","Perte puissance, odeur soufre","Cata + diagnostic mélange","https://expertkevin06-cell.github.io/autodiag-formation-auto/","→ Cata 900-1200°C = inflammation",["catalyst_glow","cat_melt","exhaust_blued"]]),
M(["mp27","fuel-lpg","Carburant","Durite poreuse / collier","-","Mécanique","🔴","Renault, Ford, Fiat","Master, Transit, Ducato","Diesel/essence","Vieillissement durite → fuite","Odeur, vernis point chaud","Durite + colliers neufs","https://expertkevin06-cell.github.io/my-tech-by-kevin/","→ Fuite × chaud = auto-infl.",["oil_puddle","exhaust_hot"]]),
M(["mp28","elec-12-48","Électrique","Épissures aftermarket","-","Électrique","🔴","Toutes","Tous","Tous","Piquage non serti → Joule","Panne intermittente, odeur","Sertissage conforme / neuf","https://expertkevin06-cell.github.io/aide-redactionnelle-technique/","→ Épissure fondue = 1ère cause élec",["harness_chafe","fuse_box","arc_beads"]])];
var FT_CUR='all';
function legalNote(x){var n=[];
 if(/🔴/.test(x.sev))n.push('Vice caché présumé (C. civ. 1641) si antérieur à la vente ; rappel gratuit constructeur (C. conso. L421-3, 10 ans).');
 if(x.src&&/rappel|conso|kba|nhtsa/i.test(x.src))n.push('Campagne/rappel officiel → réparation gratuite (C. conso. L217-3) ; vérifier éligibilité VIN.');
 n.push('En cas de sinistre : expertise contradictoire (CPC 16 & 1643), conservation véhicule, NFPA 921.');
 return n;}
function renderMega(){var g=document.getElementById('megaGrid');if(!g)return;
 var th=document.getElementById('megaTheme').value,br=document.getElementById('megaBrand').value.trim(),mo=document.getElementById('megaModel').value.trim(),mt=document.getElementById('megaMotor').value.trim(),pw=document.getElementById('megaPower').value.trim();
 var list=MEGA.filter(function(x){
  if(th!=='all'&&x.theme!==th)return false;
  if(br&&!brandMatch(x.brands,br))return false;
  if(mo){var rm=seNorm(x.models);if(!modelTokens(mo).every(function(t){return rm.indexOf(t)>=0||tmModel(rm,t);}))return false;}
  if(mt){var mm=seNorm(x.motors);if(mm.indexOf(seNorm(mt))<0)return false;}
  if(pw&&pw!=='Toutes'){var pm=seNorm(x.motors+' '+pw);if(!powerOverlap2(x.motors,pw)&&pm.indexOf(seNorm(pw))<0)return false;}
  return true;});
 var h='<div class="search-results-header">🧰 '+list.length+' panne(s) connue(s) / '+MEGA.length+' — sévérité '+list.filter(function(x){return /🔴/.test(x.sev);}).length+'🔴 '+list.filter(function(x){return /🟡/.test(x.sev);}).length+'🟡</div><div class="causes-grid">';
 list.forEach(function(x){
  h+='<div class="cause-card"><span class="category-badge">'+x.sev+' '+(THEMES.find(function(t){return t[0]===x.theme;})||[,''])[1]+'</span><span class="badge-src">'+esc15(x.type)+'</span><h3>'+esc15(x.comp)+'</h3>'+
   '<p class="cause-type">'+esc15(x.brands)+' • '+esc15(x.models)+' • '+esc15(x.motors)+(x.dtc&&x.dtc!=='-'?' • <strong>DTC '+esc15(x.dtc)+'</strong>':'')+'</p>'+
   '<p class="cause-desc"><strong>Origine :</strong> '+esc15(x.cause)+'</p>'+
   '<p class="cause-desc"><strong>Symptômes :</strong> '+esc15(x.sym)+'</p>'+
   '<p class="cause-desc"><strong>Correction :</strong> '+esc15(x.fix)+'</p>'+
   '<p class="identification"><strong>→ Conséquence incendie :</strong> '+esc15(x.fire)+'</p>'+
   '<p class="identification" style="border-left-color:#1565c0;background:#e8eaf6"><strong>⚖️ Juriste :</strong> '+legalNote(x).map(esc15).join(' • ')+'</p>'+
   veRow(x.photos)+'<a class="btn-expand" style="display:block;text-align:center;text-decoration:none" target="_blank" href="'+esc15(x.src)+'">🔗 Source / TSB</a></div>';});
 h+='</div>';if(!list.length)h+='<p class="no-results">Aucune panne pour ces filtres.</p>';
 g.innerHTML=h;}
// ---- IA LOCALE (hors-ligne, système expert pondéré) ----
var IA_EV=[
{k:'courroie',w:9,t:'Courroie/chaîne → grippage → huile sur chaud',link:'mp02',fire:'Fuite huile échappement 400-800°C = auto-inflammation'},
{k:'huile',w:7,t:'Fuite huile sur point chaud',link:'mp03',fire:'Auto-infl. 300-350°C sur collecteur/turbo'},
{k:'turbo',w:7,t:'Turbo : joints/retour → huile pulvérisée',link:'mp04',fire:'600-1000°C = flamme immédiate'},
{k:'fap',w:6,t:'FAP/cata regen 600-1200°C + végétation',link:'mp06',fire:'Herbe 250-300°C = inflammation soubassement'},
{k:'dpf',w:6,t:'DPF encrassé / regen',link:'mp05',fire:'Charge thermique sous caisse'},
{k:'surchauffe',w:6,t:'Surchauffe → grippage → projection',link:'mp09',fire:'Grippage = huile sur chaud = FEU'},
{k:'coolant',w:5,t:'Perte LDR → surchauffe',link:'mp08',fire:'Indirect : grippage puis huile'},
{k:'carburant',w:8,t:'Fuite HP/aérosol sur source chaude',link:'mp10',fire:'Aérosol instantané = flash'},
{k:'gpl',w:8,t:'GPL nappe lourde → flash retour',link:'mp11',fire:'Retour réservoir = boule de feu'},
{k:'court',w:9,t:'Court-circuit / arc B+',link:'mp12',fire:'Arc >2000°C = départ baie'},
{k:'cosse',w:7,t:'Cosse/B+ sous-couple → Joule',link:'mp12',fire:'Fusion borne = arc'},
{k:'fusible',w:6,t:'Boîte fusibles infiltrée → électrolytique',link:'mp14',fire:'Fusion lames = feu isolants'},
{k:'batterie',w:8,t:'Runaway Li-ion (interne/externe)',link:'mp15',fire:'Jet-fire 800-1400°C + HF'},
{k:'charge',w:7,t:'Connecteur CCS/Type2 tracking',link:'mp16',fire:'Arc DC 1000°C = flamme trappe'},
{k:'rongeur',w:7,t:'Rongeurs → gaine sectionnée',link:'mp23',fire:'Court franc + nid combustible'},
{k:'epissure',w:7,t:'Aftermarket épissures → Joule',link:'mp28',fire='Épissure fondue = 1ère cause élec'}];
function iaRun(){var out=document.getElementById('iaOut');if(!out)return;
 var txt=seNorm(document.getElementById('iaSym').value||'');
 var checks=[];document.querySelectorAll('#iaEv input:checked').forEach(function(c){checks.push(c.value);});
 if(!txt&&checks.length<1){out.innerHTML='<p class="no-results">Cochez des indices et/ou décrivez le symptôme.</p>';return;}
 var scores={};
 checks.forEach(function(c){var ev=IA_EV.find(function(e){return e.k===c;});if(ev){scores[ev.link]=(scores[ev.link]||0)+ev.w;}});
 IA_EV.forEach(function(ev){if(txt.indexOf(ev.k)>=0)scores[ev.link]=(scores[ev.link]||0)+Math.round(ev.w*0.6);});
 Object.keys(PANNE_KEYWORDS).forEach(function(k){if(txt.indexOf(k)>=0){var link=IA_EV.find(function(e){return e.k===PANNE_KEYWORDS[k];});if(link)scores[link.id||link.link]=(scores[link.id||link.link]||0)+3;}});
 var ranked=Object.keys(scores).map(function(id){var x=MEGA.find(function(m){return m.id===id;});return{x:x,s:scores[id]};}).filter(function(o){return o.x;}).sort(function(a,b){return b.s-a.s;}).slice(0,6);
 var max=ranked.length?ranked[0].s:1;
 var h='<div class="search-results-header">🤖 IA locale (hors-ligne) — '+ranked.length+' hypothèse(s) classée(s)</div>';
 ranked.forEach(function(o){var conf=Math.round(100*o.s/max);
  h+='<div class="cause-card" style="border-left-color:#7c4dff"><span class="category-badge">Confiance '+conf+'%</span><span class="badge-src">'+o.x.sev+'</span><h3>'+esc15(o.x.comp)+'</h3>'+
   '<p class="cause-desc"><strong>Hypothèse :</strong> '+esc15(o.x.cause)+'</p>'+
   '<p class="cause-desc"><strong>Mécanisme → conséquence incendie :</strong> '+esc15(o.x.fire)+'</p>'+
   '<p class="cause-desc"><strong>Correction :</strong> '+esc15(o.x.fix)+'</p>'+
   (o.x.dtc&&o.x.dtc!=='-'?'<p class="identification"><strong>DTC :</strong> '+esc15(o.x.dtc)+'</p>':'')+
   '<p class="identification" style="border-left-color:#1565c0;background:#e8eaf6"><strong>⚖️ </strong>'+legalNote(o.x).map(esc15).join(' • ')+'</p>'+
   veRow(o.x.photos)+'</div>';});
 if(!ranked.length)h+='<p class="no-results">Indices trop faibles — précisez (courroie, huile, fap, court, batterie, gpl…).</p>';
 h+='<p class="ve-intro" style="margin-top:1rem">Méthode : système expert pondéré local (aucune donnée envoyée). Chaque hypothèse lie origine → mécanisme → conséquence incendie → correction → qualification juridique.</p>';
 out.innerHTML=h;}
(function boot(){function go(){
 if(document.getElementById('section-pannes'))return;
 var sec=document.createElement('section');sec.id='section-pannes';sec.setAttribute('data-inj-order','20');sec.style.borderTop='4px solid #ff6f00';
 sec.innerHTML='<h2>🧰 Pannes connues — méga-base fusionnée</h2>'+
  '<p class="ve-intro">Filtres par thème + marque / modèle / motorisation / puissance. Sources : auto-diagnostic, my-tech, aide-rédactionnelle, formation-auto.</p>'+
  '<div class="garage-form">'+
   '<select id="megaTheme">'+THEMES.map(function(t){return '<option value="'+t[0]+'">'+t[1]+'</option>';}).join('')+'</select>'+
   '<input id="megaBrand" placeholder="Marque (ex : Peugeot)">'+
   '<input id="megaModel" placeholder="Modèle (ex : 208)">'+
   '<input id="megaMotor" placeholder="Motorisation (ex : 1.2 PureTech)">'+
   '<input id="megaPower" placeholder="Puissance (ex : 81 kW)">'+
  '</div>'+
  '<button id="megaBtn" class="btn-primary" style="margin-top:.8rem">🧰 Filtrer les pannes connues</button>'+
  '<div id="megaGrid" style="margin-top:1rem"></div>';
 injectOrdered(sec,20);
 var ia=document.createElement('section');ia.id='section-ia';ia.setAttribute('data-inj-order','30');ia.style.borderTop='4px solid #7c4dff';
 ia.innerHTML='<h2>🤖 IA locale gratuite (hors-ligne)</h2>'+
  '<p class="ve-intro">Cochez les indices observés + décrivez le symptôme → hypothèses classées avec % confiance, origine → mécanisme → conséquences → juriste.</p>'+
  '<div id="iaEv" style="margin-bottom:.8rem">'+IA_EV.map(function(e){return '<label><input type="checkbox" value="'+e.k+'"> '+esc15(e.t.split('→')[0].trim())+'</label>';}).join('')+'</div>'+
  '<textarea id="iaSym" placeholder="Symptôme libre : claquement à froid, voyant huile, odeur brûlé, fumée blanche…" style="width:100%;min-height:90px;padding:.8rem;border:2px solid var(--border);border-radius:8px;font-family:inherit"></textarea>'+
  '<button id="iaBtn" class="btn-secondary" style="margin-top:.8rem">🤖 Lancer l’analyse locale</button>'+
  '<div id="iaOut" style="margin-top:1rem"></div>';
 injectOrdered(ia,30);
 document.getElementById('megaBtn').addEventListener('click',renderMega);
 ['megaTheme','megaBrand','megaModel','megaMotor','megaPower'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('keypress',function(e){if(e.key==='Enter')renderMega();});});
 document.getElementById('iaBtn').addEventListener('click',iaRun);
 renderMega();
 console.log('✅ mega-pannes v30 actif : '+MEGA.length+' fiches + IA locale');}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();})();
