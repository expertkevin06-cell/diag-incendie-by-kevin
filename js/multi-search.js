// ================================================================
// RECHERCHE MULTI-SOURCES v10 : NHTSA + Rappel Conso (API) + Safety Gate + sites spé (liens)
// ================================================================
const MS_FIRE=/incendie|feu|fire|smoke|fum[eé]e|burn|melt|fondu|arc|court-circuit|short|runaway|embrasement/i;
function msAbort(ms){const c=new AbortController();setTimeout(()=>c.abort(),ms||8000);return c;}
async function msNhtsa(q){
 const out=[];const makes=(q.match(/[a-z]+/gi)||[]).slice(0,2);
 for(const mk of makes){
  try{const r=await fetch('https://api.nhtsa.gov/recalls?make='+mk.toUpperCase(),{signal:msAbort().signal});if(!r.ok)continue;
   const j=await r.json();for(const rec of j.results||[]){const t=(rec.Component||'')+' '+(rec.Summary||'');
    if(MS_FIRE.test(t)&&/20(1[89]|2[0-6])/.test(rec.ModelYear||'2020'))out.push({src:'NHTSA',title:rec.Make+' '+rec.Model+' ('+(rec.ModelYear||'')+')',desc:(rec.Component||'')+' — '+(rec.Summary||'').slice(0,180),link:'https://static.nhtsa.gov/odi/rcl/'+(rec.ReportReceivedDate||'').slice(0,4)+'/'+(rec.NHTSACampaignNumber||'')+'-pdf'});}}catch(e){}
  try{const r2=await fetch('https://api.nhtsa.gov/complaints?make='+mk.toUpperCase(),{signal:msAbort().signal});if(r2.ok){
   const j2=await r2.json();let n=0;for(const c of j2.results||[]){if(n>8)break;if(MS_FIRE.test(c.Summary||'')){n++;out.push({src:'NHTSA-plaintes',title:c.Make+' '+(c.Model||'')+' '+(c.Year||''),desc:(c.Component||'')+' — '+(c.Summary||'').slice(0,180),link:'https://www.nhtsa.gov/recalls'});}}}}catch(e){}}
 return out.slice(0,25);}
async function msConso(q){
 const out=[];
 try{const d=await fetch('https://www.data.gouv.fr/api/1/datasets/rappels-de-produits-de-consommation/',{signal:msAbort().signal});if(!d.ok)return out;
  const j=await d.json();const res=(j.resources||[]).find(x=>x.format==='csv');if(!res)return out;
  const csv=await (await fetch(res.url,{signal:msAbort(12000)})).text();const L=csv.split(/\r?\n/);const H=L[0].split(';');
  const iC=H.findIndex(h=>/cat/i.test(h)),iM=H.findIndex(h=>/marque/i.test(h)),iT=H.findIndex(h=>/titre|nom/i.test(h)),iR=H.findIndex(h=>/motif|risque/i.test(h));
  let n=0;for(let i=1;i<L.length&&n<20;i++){const c=L[i].split(';');const line=(c.join(' ')).toLowerCase();
   if(c[iC]&&/v[eé]hicule|automobile/i.test(c[iC])&&line.includes(q.toLowerCase())&&MS_FIRE.test(line)){n++;
    out.push({src:'Rappel Conso',title:(c[iM]||'')+' '+(c[iT]||''),desc:(c[iR]||'').slice(0,180),link:'https://rappel.conso.gouv.fr'});}}
 }catch(e){}
 return out;}
const MS_LINKS=[
 {label:'Safety Gate (EU)',url:'https://ec.europa.eu/safety-gate-alerts/screen/webReport?search=%Q%'},
 {label:'CarComplaints',url:'https://www.google.com/search?q=site:carcomplaints.com+%Q%+fire'},
 {label:"L'Argus",url:'https://www.google.com/search?q=site:largus.fr+%Q%+incendie+rappel'},
 {label:'60 Millions',url:'https://www.google.com/search?q=site:60millions-mag.com+%Q%+incendie'},
 {label:'AutoPlus',url:'https://www.google.com/search?q=site:autoplus.fr+%Q%+incendie+rappel'},
 {label:'NFPA/forensique',url:'https://www.google.com/search?q=%Q%+vehicle+fire+short+circuit+investigation'},
 {label:'Google (tous sites)',url:'https://www.google.com/search?q=%Q%+rappel+incendie+v%C3%A9hicule+court-circuit'}];
async function msRun(q,render){
 if(!q)return;
 const res={local:[],api:[],links:MS_LINKS.map(l=>({...l,url:l.url.replace('%Q%',encodeURIComponent(q))}))};
 const ql=q.toLowerCase();
 res.local=RECALLS.filter(r=>(r.brand+r.models+r.motor+r.cause+r.mech).toLowerCase().includes(ql)).slice(0,12);
 const [n,c]=await Promise.all([msNhtsa(q),msConso(q)]);
 res.api=[...n,...c];
 render(res);}
