// ================================================================
// fetch-recalls.mjs v30 — Collecte mensuelle → data/recalls-feed.json
// NHTSA + Rappel Conso (data.gouv) + 6 sites internes (apk-base.json)
// ================================================================
import fs from 'fs';
const OUT='data/recalls-feed.json';
const UA={'User-Agent':'EtudeIncendieBot/30 (+https://expertkevin06-cell.github.io)'};
const now=new Date();const from=new Date(now.getTime()-400*864e5);
const stamp=d=>d.toISOString().slice(0,10);
async function getJSON(url,tries=3){let last;for(let i=0;i<tries;i++){try{const r=await fetch(url,{headers:UA});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json();}catch(e){last=e;await new Promise(s=>setTimeout(s,1500*(i+1)));}}throw last;}
async function getText(url,tries=2){let last;for(let i=0;i<tries;i++){try{const r=await fetch(url,{headers:UA});if(!r.ok)throw new Error('HTTP '+r.status);return await r.text();}catch(e){last=e;await new Promise(s=>setTimeout(s,1500*(i+1)));}}throw last;}
const out={version:now.getFullYear()*100+now.getMonth()+1,generated:now.toISOString(),cases:[]};
const seen=new Set();const dkeys=new Set();
const FIRE=/feu|incendie|fire|flamme|smoke|fum[ée]e|burn|carbon|runaway|emballement|short|arc|court-circuit|[eé]lectrique|electrical|wiring|faisceau|fuse|fusible|battery|batterie|12v|48v|hv|high voltage|fuel|carburant|oil|huile|leak|fuite|coolant|glycol|overheat|surchauffe|belt|courroie|chain|cha[îi]ne|turbo|dpf|fap|catalytic|catalyseur|egr|brake|frein|tire|pneu|adas|camera|radar|charger|charge|charging/i;
const VEH=/vehicle|voiture|car|automobile|truck|camion|van|motorcycle|moto|bus|coach/i;
const MAKES=['TOYOTA','HYUNDAI','KIA','FORD','TESLA','BMW','VOLKSWAGEN','RENAULT','HONDA','BYD','STELLANTIS','NISSAN','MAZDA','SUBARU','MERCEDES-BENZ','AUDI','PORSCHE','GEELY','GREAT WALL','VOLVO','JAGUAR','MITSUBISHI','SUZUKI','FIAT','OPEL','PEUGEOT','CITROEN','DACIA','SKODA','SEAT','CHEVROLET','GMC','JEEP','CHRYSLER','LEXUS','MINI','SMART','POLESTAR','CUPRA','MG','NIO','XPENG','LI AUTO','ZEEKR','CHERY','HAVAL','LAND ROVER','ALFA ROMEO','VINFAST','RIVIAN','LUCID','TATA','MAHINDRA','ISUZU','IVECO'];
const COMPS=['ELECTRICAL SYSTEM','ELECTRICAL SYSTEM: WIRING','ELECTRICAL SYSTEM: FUSES','ELECTRICAL SYSTEM: BATTERY','ELECTRICAL SYSTEM: ALTERNATOR/GENERATOR/REGULATOR','ELECTRICAL SYSTEM: SOFTWARE','FUEL SYSTEM','FUEL SYSTEM: GASOLINE','FUEL SYSTEM: DIESEL','FUEL SYSTEM: LPG','ENGINE AND ENGINE COOLING: ENGINE OIL/LUBRICATION','ENGINE AND ENGINE COOLING: COOLING SYSTEM','ENGINE AND ENGINE COOLING: TURBOCHARGER','EQUIPMENT:ELECTRICAL','POWER TRAIN: AUTOMATIC TRANSMISSION','POWER TRAIN: CLUTCH ASSEMBLY','STRUCTURE','VISUAL','ELECTRICAL'];
function energyOf(t){return /gpl|lpg/i.test(t)?'lpg':/hybride|hybrid|phev|hev|48v|mhev/i.test(t)?'hybrid':/[eé]lectrique|electric|batterie|battery|bev|ev\b/i.test(t)?'ev':'thermal';}
function subOf(t){return /adblue|scr/i.test(t)?'adblue':/dpf|fap|gpf|filtre|particul/i.test(t)?'dpf':/egr/i.test(t)?'egr':/turbo/i.test(t)?'turbo':/courroie|belt|cha[îi]ne|chain/i.test(t)?'belt':/bo[îi]te|gearbox|transmission|clutch|embrayage/i.test(t)?'gearbox':/adas|camera|radar|lane|collision/i.test(t)?'adas':/autonomie|range|phantom|drain/i.test(t)?'range':/charg|charging|iccu|obc|onduleur/i.test(t)?'charge':/fuite|leak|huile|oil|carburant|fuel|glycol|coolant/i.test(t)?'leak':/surchauffe|overheat|coolant|pompe|thermostat/i.test(t)?'overheat':'elec';}
function push(src,ref,brand,models,cause,text,region){const t=[brand,models,cause,text].join(' ');
 if(!VEH.test(t)&&!/moteur|engine|véhicule/i.test(t))return;if(!FIRE.test(t))return;
 const id='feed-'+src+'-'+String(ref).replace(/\W+/g,'-').slice(0,40);const dk=(brand+'|'+cause).toLowerCase().slice(0,80);
 if(seen.has(id)||dkeys.has(dk))return;seen.add(id);dkeys.add(dk);
 const pm=t.match(/(\d{2,3})\s*(?:kw|ch|hp)\b/i);const sub=subOf(t);
 out.cases.push({id,brand:brand||'-',models:models||'-',years:String(now.getUTCFullYear()),energy:energyOf(t),motor:'-',power:pm?pm[1]+' kW':'-',region,src,ref:String(ref),subsys:sub,cause:(cause||'').slice(0,160),mech:(cause||'')+' → inflammation/propagation (NFPA 921)',idx:'Cartographie fusion + perles + traces',photos:energyOf(t)==='ev'?['battery_runaway','pack_teardown']:sub==='leak'?['oil_puddle','exhaust_hot']:sub==='overheat'?['coolant_leak','thermal_fluke']:['harness_chafe','fuse_box','arc_beads']});}
// 1) NHTSA recalls
try{const j=await getJSON(`https://api.nhtsa.gov/recalls?fromDate=${stamp(from)}&toDate=${stamp(now)}`);for(const rec of j.results||[])push('NHTSA',rec.NHTSACampaignNumber||rec.Component||'?',(rec.Make||'?')+' '+(rec.Model||''),rec.Model||'-',(rec.Component||'')+' : '+(rec.Summary||''),rec.Summary||'','US');}catch(e){console.warn('NHTSA recalls KO',e.message);}
// 2) NHTSA complaints (échantillon marques/composants)
for(const make of MAKES){for(const comp of COMPS){try{const j=await getJSON(`https://api.nhtsa.gov/complaints?make=${encodeURIComponent(make)}&component=${encodeURIComponent(comp)}&fromDate=${stamp(from)}&toDate=${stamp(now)}`);for(const c of (j.results||[]).slice(0,40))push('NHTSA-C',c.ComplaintId||'?',make,(c.Model||'')+' '+(c.Year||''),(c.Component||'')+' : plainte',c.Summary||'','US');}catch(e){}}}
// 3) Rappel Conso via data.gouv
try{const d=await getJSON('https://www.data.gouv.fr/api/1/datasets/rappels-de-produits-de-consommation/');const res=(d.resources||[]).find(x=>x.format==='csv'||x.type==='main');if(res){const csv=await getText(res.url);const L=csv.split(/\r?\n/);const H=L[0].split(';');const iC=H.findIndex(h=>/cat/i.test(h)),iM=H.findIndex(h=>/marque|brand/i.test(h)),iT=H.findIndex(h=>/titre|nom|name/i.test(h)),iR=H.findIndex(h=>/motif|risque|reason/i.test(h));for(let i=1;i<L.length;i++){const c=L[i].split(';');if(c[iC]&&/v[eé]hicule|automobile|vehicle/i.test(c[iC]))push('RappelConso','rc-'+i,(c[iM]||'').replace(/"/g,''),(c[iT]||'').replace(/"/g,''),(c[iR]||'').replace(/"/g,''),(c[iR]||'')+' '+(c[iT]||''),'FR');}}}catch(e){console.warn('Conso KO',e.message);}
// 4) 6 sites internes (apk-base.json / data/*.json)
const EXT=['https://expertkevin06-cell.github.io/auto-diagnostic/apk-base.json','https://expertkevin06-cell.github.io/auto-diagnostic/data/apk-base.json','https://expertkevin06-cell.github.io/my-tech-by-kevin/apk-base.json','https://expertkevin06-cell.github.io/aide-redactionnelle-technique/apk-base.json','https://expertkevin06-cell.github.io/aide-redactionnelle-technique/data/apk-base.json','https://expertkevin06-cell.github.io/autodiag-formation-auto/apk-base.json','https://expertkevin06-cell.github.io/d-faillance-auto-/apk-base.json','https://auto-legal-by-kevin.lovable.app/apk-base.json'];
for(const u of EXT){try{const j=await getJSON(u);const arr=j.pannes||j.faults||j.recalls||j.fiches||j.dtc||(Array.isArray(j)?j:[]);for(const p of arr||[])push('EXT-'+new URL(u).hostname.split('.')[0],p.id||p.code||p.dtc||Math.random().toString(36).slice(2,8),p.marque||p.brands||p.brand||'?',p.modele||p.models||p.model||'-',(p.composant||p.component||p.titre||p.cause||'')+' : '+(p.libelle||p.cause||''),(p.symptomes||p.symptoms||p.solution||p.cause||''),'EU');console.log('✅ base externe fusionnée :',u);}catch(e){console.warn('EXT KO',u,e.message);}}
out.cases=out.cases.slice(0,4000);
fs.mkdirSync('data',{recursive:true});
fs.writeFileSync(OUT,JSON.stringify(out,null,1));
console.log('Feed v'+out.version+' : '+out.cases.length+' cas écrits dans '+OUT);
