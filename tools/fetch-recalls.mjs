// PLAN 30 JOURS v25 : NHTSA recalls+complaints (90 marques, 30 composants)
// + vPIC (nouveaux MODÈLES par marque/année) + Rappel Conso + Safety Gate
// + extraction motorisations/puissances → feed {cases, catalog}
import {readFileSync,writeFileSync} from 'node:fs';
const FEED='data/recalls-feed.json';
const pad=n=>String(n).padStart(2,'0');
const stamp=d=>`${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}`;
const now=new Date(),from=new Date(Date.now()-45*864e5),YEAR=now.getUTCFullYear();
let feed={version:0,sources:[],cases:[],catalog:{}};try{feed=JSON.parse(readFileSync(FEED,'utf8'));}catch{}
const out={version:(feed.version||0)+1,generatedAt:now.toISOString(),sources:[...new Set([...(feed.sources||[]),'NHTSA','NHTSA-complaints','NHTSA-vPIC','Rappel Conso','Safety Gate'])],cases:feed.cases||[],catalog:feed.catalog||{}};
const seen=new Set(out.cases.map(c=>c.id));const dkeys=new Set(out.cases.map(c=>(c.brand+'|'+c.cause).toLowerCase().slice(0,80)));
const FIRE=/incendie|feu|fire|smoke|fum[eé]e|burn|melt|fondu|runaway|embrasement/i;
const ELEC=/short|arc|court-circuit|wiring|harness|faisceau|fuse|electrical|[eé]lectrique|connector|connecteur|relay|relais|battery|batterie|12v|48v|voltage|alternator|alternateur|adas|camera|cam[eé]ra|radar|lidar|aeb|display|screen|[eé]cran|instrument/i;
const LEAK=/leak|fuite|oil|huile|fuel|carburant|essence|diesel|gazole|gpl|lpg|coolant|glycol|adblue|scr/i;
const HOT=/overheat|surchauffe|coolant|thermostat|water pump|pompe [àa] eau|radiator|radiateur|fan|ventilateur|egr|turbo|dpf|fap|filtre|belt|courroie|chain|cha[îi]ne|transmission|bo[îi]te|gearbox|oil pressure|pression d'?huile/i;
const RANGE=/autonomie|range|charging|charge|iccu|obc|onboard/i;
const VEH=/v[eé]hicule|vehicle|voiture|car|automobile|moteur|engine|hybride|hybrid|essence|diesel|suv|pickup/i;
const MAKES=['TOYOTA','HYUNDAI','KIA','FORD','TESLA','BMW','VOLKSWAGEN','RENAULT','HONDA','BYD','STELLANTIS','NISSAN','MAZDA','SUBARU','MERCEDES-BENZ','AUDI','PORSCHE','GEELY','GREAT WALL','VOLVO','JAGUAR','MITSUBISHI','SUZUKI','FIAT','OPEL','PEUGEOT','CITROEN','DACIA','SKODA','SEAT','CHEVROLET','GMC','JEEP','CHRYSLER','LEXUS','BUICK','CADILLAC','LINCOLN','RAM','DODGE','MINI','SMART','POLESTAR','CUPRA','MG','NIO','XPENG','LI AUTO','ZEEKR','AITO','CHERY','HAVAL','LAND ROVER','ALFA ROMEO','LANCIA','ABARTH','MASERATI','LOTUS','VINFAST','FISKER','RIVIAN','LUCID','AIWAYS','SERES','HONGQI','DONGFENG','JAC','BAIC','WULING','LEAPMOTOR','NETA','VOYAH','AVATR','DEEPAL','TANK','LYNK & CO','PROTON','PERODUA','TATA','MAHINDRA','ISUZU','IVECO','MAN','SCANIA','RENAULT TRUCKS','DENZA','YANGWANG','FANGCHENGBAO','ORA','WEY','EXEED','OMODA','JAECOO','AION','HYPER','ROEWE','MAXUS','IM MOTORS','FORTHING'];
const COMPS=['ELECTRICAL SYSTEM','FUEL SYSTEM','FUEL SYSTEM: GASOLINE','FUEL SYSTEM: DIESEL','ENGINE AND ENGINE COOLING: ENGINE OIL/LUBRICATION','ENGINE AND ENGINE COOLING: COOLING SYSTEM','ELECTRICAL SYSTEM: BATTERY','ELECTRICAL SYSTEM: WIRING','ELECTRICAL SYSTEM: FUSES','ELECTRICAL SYSTEM: ALTERNATOR/GENERATOR/REGULATOR','ELECTRICAL SYSTEM: INSTRUMENT CLUSTER','ELECTRICAL SYSTEM: SOFTWARE','POWER TRAIN: AUTOMATIC TRANSMISSION','POWER TRAIN: CLUTCH ASSEMBLY','ENGINE','TURBOCHARGER','EQUIPMENT:ELECTRICAL','SERVICE BRAKES','FORWARD COLLISION AVOIDANCE','LANE DEPARTURE','VISIBILITY/WIPER','SEATS: HEATER','ELECTRICAL SYSTEM: STARTER'];
const energyOf=t=>/gpl|lpg/i.test(t)?'lpg':/hybride|hybrid|phev|hev|48v/i.test(t)?'hybrid':/[eé]lectrique|electric|batterie|battery|high voltage|bev/i.test(t)?'ev':'thermal';
const subOf=t=>/adblue|scr/i.test(t)?'adblue':/dpf|fap|gpf|filtre/i.test(t)?'dpf':/egr/i.test(t)?'egr':/turbo/i.test(t)?'turbo':/courroie|belt|cha[îi]ne|chain/i.test(t)?'belt':/bo[îi]te|gearbox|transmission|dsg|dct/i.test(t)?'gearbox':/adas|camera|cam[eé]ra|radar|lidar|aeb|[eé]cran|display|screen/i.test(t)?'adas':/autonomie|range/i.test(t)?'range':/charg/i.test(t)?'charge':/pression d'?huile|oil pressure/i.test(t)?'oilpressure':/coolant|radiateur|radiator|pompe [àa] eau|water pump|thermostat/i.test(t)?'cooling':/fuite|leak|huile|oil|carburant|fuel|glycol/i.test(t)?'leak':/surchauffe|overheat/i.test(t)?'overheat':/battery|batterie|12v|48v/i.test(t)?'batt':'elec';
const tagOf=s=>({adblue:'💧',dpf:'🌫️',egr:'♻️',turbo:'🌀',belt:'⛓️',gearbox:'⚙️',adas:'📡',range:'🔋',charge:'🔌',leak:'🛢️',overheat:'🌡️',batt:'🔋',cooling:'🧊',oilpressure:'🛢️'}[s]||'⚡ ');
const extractPower=t=>{const m=t.match(/(\d{2,3})\s*(?:kw|ch|hp)\b/i);return m?m[1]+' kW':'-';};
const extractMotor=t=>{const m=t.match(/(\d\.\d\s?(?:l\s?)?(?:tdi|tsi|tce|dci|bluehdi|ecoboost|multijet|skyactiv|puretech|thp|crdi|d-4d|om6\d\d|n47|b47|ea211|ea888|ingenium|dv5|dv6))?/i);return m&&m[1]?m[1].trim():'-';};
function push(src,ref,brand,models,cause,text,region){const t=brand+' '+models+' '+cause+' '+text;
 if(!VEH.test(t))return;if(!(FIRE.test(t)||ELEC.test(t)||LEAK.test(t)||HOT.test(t)||RANGE.test(t)))return;
 const id='feed-'+src+'-'+String(ref).replace(/\W+/g,'-').slice(0,40);const dk=(brand+'|'+cause).toLowerCase().slice(0,80);
 if(seen.has(id)||dkeys.has(dk))return;seen.add(id);dkeys.add(dk);
 const sub=subOf(t);
 out.cases.push({id,brand,models:models||'-',years:String(YEAR),energy:energyOf(t),motor:extractMotor(t),power:extractPower(t),region,src,ref:String(ref),subsys:sub,cause:tagOf(sub)+cause,mech:cause+' → conséquence (NFPA 921)',idx:'Cartographie fusion + perles + traces',photos:energyOf(t)==='ev'?['battery_runaway','pack_teardown']:sub==='leak'?['oil_puddle','exhaust_hot']:sub==='cooling'?['coolant_leak']:sub==='belt'?['chain_generic','oil_puddle']:['harness_chafe','fuse_box','arc_beads']});}
// 1) NHTSA recalls
try{const r=await fetch(`https://api.nhtsa.gov/recalls?fromDate=${stamp(from)}&toDate=${stamp(now)}`);if(r.ok){const j=await r.json();for(const rec of j.results||[])push('NHTSA',rec.NHTSACampaignNumber||rec.Component||'?',(rec.Make||'?')+' '+(rec.Model||''),(rec.Component||'')+' : '+(rec.Summary||''),rec.Summary||'','US');}}catch(e){console.warn('recalls KO',e.message);}
// 2) NHTSA complaints par make+composant
for(const make of MAKES){for(const comp of COMPS){
 try{const r=await fetch(`https://api.nhtsa.gov/complaints?make=${encodeURIComponent(make)}&component=${encodeURIComponent(comp)}&fromDate=${stamp(from)}&toDate=${stamp(now)}`);if(!r.ok)continue;
 const j=await r.json();for(const c of j.results||[])push('NHTSA-C',c.ComplaintId||'?',make,(c.Model||'')+' '+(c.Year||''),(c.Component||'')+' : plainte',c.Summary||'','US');}catch(e){}}}
// 3) vPIC : nouveaux MODÈLES commercialisés (année courante)
for(const make of MAKES){try{const r=await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodeURIComponent(make)}?format=json&modelYear=${YEAR}`);if(!r.ok)continue;
 const j=await r.json();const list=(j.Results||[]).map(x=>x.Model_Name).filter(Boolean).slice(0,80);
 if(list.length){out.catalog[make]=Array.from(new Set([...(out.catalog[make]||[]),...list]));}}catch(e){}}
// 4) Rappel Conso
try{const d=await fetch('https://www.data.gouv.fr/api/1/datasets/rappels-de-produits-de-consommation/');if(d.ok){const j=await d.json();const res=(j.resources||[]).find(x=>x.format==='csv');if(res){
 const csv=await (await fetch(res.url)).text();const L=csv.split(/\r?\n/);const H=L[0].split(';');
 const iC=H.findIndex(h=>/cat/i.test(h)),iM=H.findIndex(h=>/marque/i.test(h)),iT=H.findIndex(h=>/titre|nom/i.test(h)),iR=H.findIndex(h=>/motif|risque/i.test(h));
 for(let i=1;i<L.length;i++){const c=L[i].split(';');if(c[iC]&&/v[eé]hicule|automobile/i.test(c[iC]))push('RappelConso','rc-'+i,(c[iM]||'').replace(/"/g,''),(c[iT]||'').replace(/"/g,''),(c[iR]||'').replace(/"/g,''),(c[iR]||'')+' '+(c[iT]||''),'FR');}}}}catch(e){console.warn('conso KO',e.message);}
// 5) Safety Gate (export hebdo)
try{const sg=await fetch('https://ec.europa.eu/safety-gate-alerts/screen/webReport/alertsWeeklyExport');if(sg.ok){const txt=await sg.text();const L=txt.split(/\r?\n/);
 for(let i=1;i<L.length;i++){const c=L[i].split(/;|,/);const line=c.join(' ');if(/car|vehicle|voiture|automobile/i.test(line)&&(FIRE.test(line)||ELEC.test(line)||LEAK.test(line)))push('SafetyGate','sg-'+i,(c[1]||'?').replace(/"/g,''),(c[2]||'').replace(/"/g,''),(c[3]||'').replace(/"/g,''),line,'EU');}}}catch(e){console.warn('safetygate KO',e.message);}
out.cases=out.cases.slice(0,3000);
writeFileSync(FEED,JSON.stringify(out,null,1));
console.log('Feed v'+out.version+' : '+out.cases.length+' cas | catalogue '+Object.keys(out.catalog).length+' marques / '+Object.values(out.catalog).reduce((a,b)=>a+b.length,0)+' modèles');
