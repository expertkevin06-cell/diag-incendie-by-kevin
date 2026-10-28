// Collecte mensuelle NHTSA + Rappel Conso → data/recalls-feed.json
import {readFileSync,writeFileSync} from 'node:fs';
const FEED='data/recalls-feed.json';
const pad=n=>String(n).padStart(2,'0');
const stamp=d=>`${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}`;
const now=new Date(),from=new Date(Date.now()-45*864e5);
let feed={version:0,sources:[],cases:[]};
try{feed=JSON.parse(readFileSync(FEED,'utf8'));}catch{}
const out={version:(feed.version||0)+1,generatedAt:now.toISOString(),sources:[...new Set([...(feed.sources||[]),'NHTSA','Rappel Conso'])],cases:feed.cases||[]};
const seen=new Set(out.cases.map(c=>c.id));
const FIRE=/incendie|feu|fire|smoke|fum[eé]e|runaway|embrasement|burn/i;
const VEH=/v[eé]hicule|vehicle|voiture|car|automobile|batterie|battery|hybride|hybrid|gpl|lpg|essence|diesel|[eé]lectrique|electric|engine|moteur/i;
const energyOf=t=>/gpl|lpg/i.test(t)?'lpg':/hybride|hybrid|phev|hev/i.test(t)?'hybrid':/[eé]lectrique|electric|batterie|battery/i.test(t)?'ev':'thermal';
function push(src,ref,brand,models,cause,text,region){const t=brand+' '+models+' '+cause+' '+text;if(!FIRE.test(t)||!VEH.test(t))return;
const id='feed-'+src+'-'+String(ref).replace(/\W+/g,'-').slice(0,40);if(seen.has(id))return;seen.add(id);const en=energyOf(t);
out.cases.push({id,brand,models:models||'-',years:String(now.getUTCFullYear()),energy:en,motor:'-',region,src,ref:String(ref),cause,mech:cause+' → inflammation → propagation (doctrine NFPA 921, voir mode formation)',idx:'Cartographie fusion Zn 420/Al 660/Cu 1084 °C + perles primaires/secondaires',photos:en==='ev'?['battery_runaway','pack_teardown']:en==='lpg'?['car_fire_road']:en==='hybrid'?['battery_runaway','harness_chafe']:['engine_burnt','harness_chafe']});}
// 1) NHTSA recalls
try{const r=await fetch(`https://api.nhtsa.gov/recalls?fromDate=${stamp(from)}&toDate=${stamp(now)}`);if(r.ok){const j=await r.json();for(const rec of j.results||[])push('NHTSA',rec.NHTSACampaignNumber||rec.Component||'?',(rec.Make||'?')+' '+(rec.Model||''),(rec.Component||'')+' : '+(rec.Summary||''),rec.Summary||'','US');}}catch(e){console.warn('NHTSA recalls KO',e.message);}
// 2) NHTSA complaints (top makes)
try{for(const make of ['TOYOTA','HYUNDAI','KIA','FORD','TESLA','BMW','VOLKSWAGEN','RENAULT','HONDA','BYD','STELLANTIS','NISSAN','MAZDA','SUBARU','MERCEDES-BENZ','AUDI','PORSCHE','GEELY','GREAT WALL']){
const r=await fetch(`https://api.nhtsa.gov/complaints?make=${encodeURIComponent(make)}&fromDate=${stamp(from)}&toDate=${stamp(now)}`);if(!r.ok)continue;
const j=await r.json();for(const c of j.results||[])if(FIRE.test(c.Summary||''))push('NHTSA-C',c.ComplaintId||'?',make,(c.Model||'')+' '+(c.Year||''),'Plainte '+(c.Component||''),c.Summary||'','US');}}catch(e){console.warn('complaints KO',e.message);}
// 3) Rappel Conso (data.gouv)
try{const d=await fetch('https://www.data.gouv.fr/api/1/datasets/rappels-de-produits-de-consommation/');if(d.ok){const j=await d.json();
const res=(j.resources||[]).find(x=>x.format==='csv')||null;if(res){const csv=await (await fetch(res.url)).text();const L=csv.split(/\r?\n/);const H=L[0].split(';');
const iC=H.findIndex(h=>/cat[eé]gorie/i.test(h)),iM=H.findIndex(h=>/marque/i.test(h)),iT=H.findIndex(h=>/titre|nom|produit/i.test(h)),iR=H.findIndex(h=>/motif|risque/i.test(h));
for(let i=1;i<L.length;i++){const c=L[i].split(';');if(c[iC]&&/v[eé]hicule|automobile/i.test(c[iC]))push('RappelConso','rc-'+i,(c[iM]||'').replace(/"/g,''),(c[iT]||'').replace(/"/g,''),(c[iR]||'').replace(/"/g,''),(c[iR]||'')+' '+(c[iT]||''),'FR');}}}}catch(e){console.warn('Conso KO',e.message);}
out.cases=out.cases.slice(0,500);
writeFileSync(FEED,JSON.stringify(out,null,1));
console.log('Feed v'+out.version+' : '+out.cases.length+' cas');
