// ================================================================
// RECHERCHE LIVE MULTI-SOURCES v17 (complément massif de la base locale)
// ================================================================
var LS_SITES=[
{l:'Google (tous sites)',u:'https://www.google.com/search?q=%Q%+incendie+v%C3%A9hicule+panne+court-circuit'},
{l:'Rappel Conso (officiel)',u:'https://rappel.conso.gouv.fr/#/recherche?search=%Q%'},
{l:'Safety Gate (EU)',u:'https://ec.europa.eu/safety-gate-alerts/screen/webReport?search=%Q%'},
{l:'NHTSA (US)',u:'https://www.nhtsa.gov/recalls?keyword=%Q%'},
{l:'CarComplaints (US)',u:'https://www.google.com/search?q=site:carcomplaints.com+%Q%+fire'},
{l:'Consumer Reports (US)',u:'https://www.google.com/search?q=site:consumerreports.org+%Q%+fire+recall'},
{l:'IIHS (US)',u:'https://www.google.com/search?q=site:iihs.org+%Q%+fire'},
{l:'Which? (UK)',u:'https://www.google.com/search?q=site:which.co.uk+%Q%+fire+recall'},
{l:'ADAC (DE)',u:'https://www.google.com/search?q=site:adac.de+%Q%+Brand+R%C3%BCckruf'},
{l:'AutoBild (DE)',u:'https://www.google.com/search?q=site:autobild.de+%Q%+Brand+R%C3%BCckruf'},
{l:'Transport Canada',u:'https://www.google.com/search?q=site:canada.ca+vehicle+recall+fire+%Q%'},
{l:'SafeCar (AU)',u:'https://www.google.com/search?q=site:safecar.gov.au+fire+%Q%'},
{l:'L’Argus (FR)',u:'https://www.google.com/search?q=site:largus.fr+%Q%+incendie+rappel'},
{l:'Caradisiac (FR)',u:'https://www.google.com/search?q=site:caradisiac.com+%Q%+incendie+rappel'},
{l:'Auto-Journal (FR)',u:'https://www.google.com/search?q=site:autojournal.fr+%Q%+incendie+rappel'},
{l:'Turbo.fr (FR)',u:'https://www.google.com/search?q=site:turbo.fr+%Q%+incendie+rappel'},
{l:'Auto-Moto (FR)',u:'https://www.google.com/search?q=site:auto-moto.com+%Q%+incendie'},
{l:'60 Millions (FR)',u:'https://www.google.com/search?q=site:60millions-mag.com+%Q%+incendie+rappel'},
{l:'Que Choisir (FR)',u:'https://www.google.com/search?q=site:quechoisir.org+%Q%+incendie+rappel'},
{l:'UFC-Que Choisir forum',u:'https://www.google.com/search?q=site:forum.quechoisir.org+%Q%+incendie'},
{l:'Automobile Magazine',u:'https://www.google.com/search?q=site:automobile-magazine.fr+%Q%+incendie'},
{l:'Forum Mécanique (FR)',u:'https://www.google.com/search?q=site:forum-mecanique.com+%Q%+incendie'},
{l:'Reddit r/MechanicAdvice',u:'https://www.google.com/search?q=site:reddit.com+r/MechanicAdvice+%Q%+fire'},
{l:'NFPA / forensique',u:'https://www.google.com/search?q=%Q%+vehicle+fire+investigation+short+circuit'}];
function lsMake(q){var m=(q.match(/[a-z]+/i)||[''])[0].toUpperCase();var map={VW:'VOLKSWAGEN',MERCEDES:'MERCEDES-BENZ',CHEVY:'CHEVROLET',DACIA:'DACIA',PSA:'PEUGEOT'};return map[m]||m;}
async function lsNhtsa(q){var out=[];var mk=lsMake(q);if(!mk)return out;
 try{var r=await fetch('https://api.nhtsa.gov/recalls?make='+mk,{signal:lsAbort()});if(r.ok){var j=await r.json();
  (j.results||[]).forEach(function(rec){var t=(rec.Component||'')+' '+(rec.Summary||'');
   if(seNorm(t).indexOf(seNorm(q).split(' ')[0])>=0||/fire|incendie|smoke|short/i.test(t))out.push({src:'NHTSA',title:rec.Make+' '+(rec.Model||'')+' '+(rec.ModelYear||''),desc:(rec.Component||'')+' — '+(rec.Summary||'').slice(0,160),link:'https://www.nhtsa.gov/recalls?keyword='+encodeURIComponent(q)});});}}catch(e){}
 return out.slice(0,15);}
async function lsConso(q){var out=[];
 try{var d=await fetch('https://www.data.gouv.fr/api/1/datasets/rappels-de-produits-de-consommation/',{signal:lsAbort()});if(!d.ok)return out;
  var j=await d.json();var res=(j.resources||[]).find(function(x){return x.format==='csv';});if(!res)return out;
  var csv=await (await fetch(res.url,{signal:lsAbort(12000)})).text();var L=csv.split(/\r?\n/);var H=L[0].split(';');
  var iC=H.findIndex(function(h){return /cat/i.test(h);}),iM=H.findIndex(function(h){return /marque/i.test(h);}),iT=H.findIndex(function(h){return /titre|nom/i.test(h);}),iR=H.findIndex(function(h){return /motif|risque/i.test(h);});
  var n=0,ql=seNorm(q);
  for(var i=1;i<L.length&&n<15;i++){var c=L[i].split(';');var line=seNorm(c.join(' '));
   if(c[iC]&&/v[eé]hicule|automobile/i.test(c[iC])&&line.indexOf(ql.split(' ')[0])>=0){n++;out.push({src:'Rappel Conso',title:(c[iM]||'')+' '+(c[iT]||''),desc:(c[iR]||'').slice(0,160),link:'https://rappel.conso.gouv.fr'});}}}catch(e){}
 return out;}
function lsAbort(ms){var c=new AbortController();setTimeout(function(){c.abort();},ms||8000);return c.signal;}
async function runLiveSearch(q,render){if(!q)return;
 var local=searchAll16(q);
 var apis=await Promise.all([lsNhtsa(q),lsConso(q)]);
 render({q:q,local:local,api:apis[0].concat(apis[1]),sites:LS_SITES.map(function(s){return {l:s.l,u:s.u.replace('%Q%',encodeURIComponent(q))};})});}
