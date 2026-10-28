// Collecte mensuelle v12 : NHTSA + Rappel Conso ; scoring feu/élec/fuite/surchauffe/méca
import {readFileSync,writeFileSync} from 'node:fs';
const FEED='data/recalls-feed.json';
const pad=n=>String(n).padStart(2,'0');
const stamp=d=>`${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}`;
const now=new Date(),from=new Date(Date.now()-45*864e5);
let feed={version:0,sources:[],cases:[]};try{feed=JSON.parse(readFileSync(FEED,'utf8'));}catch{}
const out={version:(feed.version||0)+1,generatedAt:now.toISOString(),sources:[...new Set([...(feed.sources||[]),'NHTSA','NHTSA-complaints','Rappel Conso'])],cases:feed.cases||[]};
const seen=new Set(out.cases.map(c=>c.id));const dkeys=new Set(out.cases.map(c=>(c.brand+'|'+c.cause).toLowerCase().slice(0,80)));
const FIRE=/incendie|feu|fire|smoke|fum[eé]e|burn|melt|fondu|runaway|embrasement/i;
const HOT=/overheat|surchauffe|coolant|thermostat|water pump|pompe [àa] eau|radiator|radiateur|fan|ventilateur|egr|turbo|belt|courroie|transmission|bo[îi]te|gearbox/i;
const RISK=/risque|risk|fire|incendie|fuite|leak|rupture|seiz|serrage|short|court/i;
const ELEC=/short|arc|court-circuit|wiring|harness|faisceau|fuse|electrical|[eé]lectrique|connector|connecteur|relay|relais|battery|batterie|12v|48v|voltage|alternator|alternateur/i;
const LEAK=/leak|fuite|oil|huile|fuel|carburant|essence|diesel|gazole|gpl|lpg|coolant|glycol/i;
const VEH=/v[eé]hicule|vehicle|voiture|car|automobile|moteur|engine|hybride|hybrid|essence|diesel/i;
const MAKES=['TOYOTA','HYUNDAI','KIA','FORD','TESLA','BMW','VOLKSWAGEN','RENAULT','HONDA','BYD','STELLANTIS','NISSAN','MAZDA','SUBARU','MERCEDES-BENZ','AUDI','PORSCHE','GEELY','GREAT WALL','VOLVO','JAGUAR','MITSUBISHI','SUZUKI','FIAT','OPEL','PEUGEOT','CITROEN','DACIA','SKODA','SEAT','CHEVROLET','GMC','JEEP','CHRYSLER','LEXUS','BUICK','CADILLAC','LINCOLN','RAM','DODGE','MINI','SMART','POLESTAR','CUPRA','MG','NIO','XPENG','LI AUTO','ZEEKR','AITO','CHERY','HAVAL','LAND ROVER','ALFA ROMEO'];
const COMPS=['ELECTRICAL SYSTEM','FUEL SYSTEM','FUEL SYSTEM: GASOLINE','FUEL SYSTEM: DIESEL','ENGINE AND ENGINE COOLING: ENGINE OIL/LUBRICATION','ENGINE AND ENGINE COOLING: COOLING SYSTEM','ELECTRICAL SYSTEM: BATTERY','ELECTRICAL SYSTEM: WIRING','ELECTRICAL SYSTEM: FUSES','ELECTRICAL SYSTEM: ALTERNATOR/GENERATOR/REGULATOR','POWER TRAIN: AUTOMATIC TRANSMISSION','POWER TRAIN: CLUTCH ASSEMBLY','ENGINE','EQUIPMENT:ELECTRICAL','TURBOCHARGER'];
const energyOf=t=>/gpl|lpg/i.test(t)?'lpg':/hybride|hybrid|phev|hev|48v/i.test(t)?'hybrid':/[eé]lectrique|electric|batterie|battery|high voltage/i.test(t)?'ev':'thermal';
const tagOf=t=>ELEC.test(t)?'⚡ ':LEAK.test(t)?'🛢️ ':HOT.test(t)?'🌡️/⚙️ ':'🔥 ';
function push(src,ref,brand,models,cause,text,region){const t=brand+' '+models+' '+cause+' '+text;
 if(!VEH.test(t))return;const ok=FIRE.test(t)||(HOT.test(t)&&RISK.test(t));if(!ok)return;
 const id='feed-'+src+'-'+String(ref).replace(/\W+/g,'-').slice(0,40);const dk=(brand+'|'+cause).toLowerCase().slice(0,80);
 if(seen.has(id)||dkeys.has(dk))return;seen.add(id);dkeys.add(dk);
 out.cases.push({id,brand,models:models||'-',years:String(now.getUTCFullYear()),energy:energyOf(t),motor:'-',region,src,ref:String(ref),cause:tagOf(t)+cause,mech:cause+' → inflammation/propagation (NFPA 921)',idx:'Cartographie fusion Zn420/Al660/Cu1084 + perles + traces fuite/surchauffe',photos:energyOf(t)==='ev'?['battery_runaway','pack_teardown']:ELEC.test(t)?['harness_chafe','fuse_box','arc_beads']:HOT.test(t)?['coolant_leak','engine_burnt']:['oil_puddle','exhaust_hot','engine_burnt']});}
try{const r=await fetch(`https://api.nhtsa.gov/recalls?fromDate=${stamp(from)}&toDate=${stamp(now)}`);if(r.ok){const j=await r.json();for(const rec of j.results||[])push('NHTSA',rec.NHTSACampaignNumber||rec.Component||'?',(rec.Make||'?')+' '+(rec.Model||''),(rec.Component||'')+' : '+(rec.Summary||''),rec.Summary||'','US');}}catch(e){console.warn('recalls KO',e.message);}
for(const make of MAKES){for(const comp of COMPS){
 try{const r=await fetch(`https://api.nhtsa.gov/complaints?make=${encodeURIComponent(make)}&component=${encodeURIComponent(comp)}&fromDate=${stamp(from)}&toDate=${stamp(now)}`);if(!r.ok)continue;
 const j=await r.json();for(const c of j.results||[])push('NHTSA-C',c.ComplaintId||'?',make,(c.Model||'')+' '+(c.Year||''),(c.Component||'')+' : plainte',c.Summary||'','US');}catch(e){}}}
try{const d=await fetch('https://www.data.gouv.fr/api/1/datasets/rappels-de-produits-de-consommation/');if(d.ok){const j=await d.json();const res=(j.resources||[]).find(x=>x.format==='csv');if(res){
 const csv=await (await fetch(res.url)).text();const L=csv.split(/\r?\n/);const H=L[0].split(';');
 const iC=H.findIndex(h=>/cat/i.test(h)),iM=H.findIndex(h=>/marque/i.test(h)),iT=H.findIndex(h=>/titre|nom/i.test(h)),iR=H.findIndex(h=>/motif|risque/i.test(h));
 for(let i=1;i<L.length;i++){const c=L[i].split(';');if(c[iC]&&/v[eé]hicule|automobile/i.test(c[iC])&&(FIRE.test(c[iR]||'')||(HOT.test(c[iR]||'')&&RISK.test(c[iR]||''))))push('RappelConso','rc-'+i,(c[iM]||'').replace(/"/g,''),(c[iT]||'').replace(/"/g,''),(c[iR]||'').replace(/"/g,''),(c[iR]||'')+' '+(c[iT]||''),'FR');}}}}catch(e){console.warn('conso KO',e.message);}
out.cases=out.cases.slice(0,1200);
writeFileSync(FEED,JSON.stringify(out,null,1));
console.log('Feed v'+out.version+' : '+out.cases.length+' cas');
