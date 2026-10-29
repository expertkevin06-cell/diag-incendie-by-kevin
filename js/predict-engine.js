// ================================================================
// MOTEUR PRÉDICTIF UNIQUE v20 (__predict) — 1 case pour tout
// marque + modèle + motorisation + puissance + type de panne
// ================================================================
var __predict=true;
var PRED_BRANDS=['renault','peugeot','citroen','ds','dacia','audi','volkswagen','vw','skoda','seat','cupra','opel','fiat','mercedes','bmw','ford','toyota','lexus','honda','hyundai','kia','genesis','nissan','mazda','subaru','mitsubishi','suzuki','tesla','byd','mg','nio','xpeng','zeekr','li auto','geely','great wall','haval','chery','volvo','polestar','jaguar','land rover','smart','vinfast','porsche','chevrolet','jeep','ram','dodge','chrysler'];
var PRED_MODELS=['clio 4','clio 5','clio 6','austral','rafale','koleos','scenic','symbioz','megane','captur','arkana','espace','208','308','2008','3008','5008','c3','c4','c5','berlingo','sandero','duster','bigster','spring','jogger','a1','a3','a4','a6','q3','q4','q5','q6','q7','q8','e-tron','golf','polo','passat','tiguan','taigo','t-roc','id.3','id.4','id.5','id.7','elroq','enyaq','octavia','fabia','superb','model 3','model y','model s','model x','atto 3','dolphin','seal','tang'];
var PRED_MOTORS=['1.0 tsi','1.2 puretech','1.2 tce','1.3 tce','1.5 bluehdi','1.5 tdi','1.5 tsi','1.6 thp','2.0 tdi','2.0 tsi','3.0 tdi','e-tech','phev','hev','bev','lpg','eco-g','gpl','dci','tdi','tsi','puretech','bluehdi','multijet','skyactiv'];
var PRED_SUBS={courroie:'belt',belt:'belt',fap:'dpf',dpf:'dpf',gpf:'dpf','filtre à particules':'dpf',carburant:'fuel',fuel:'fuel',essence:'fuel',diesel:'fuel',gpl:'fuel',lpg:'fuel',puissance:'power',kw:'power','court-circuit':'elec',court:'elec',electrique:'elec',elec:'elec','12v':'elec','48v':'elec',incendie:'fire',feu:'fire',flamme:'fire',charge:'charge',charging:'charge',autonomie:'range',range:'range',batterie:'batt',battery:'batt',ht:'batt','haute tension':'batt',turbo:'turbo',egr:'egr',adblue:'adblue',scr:'adblue',surchauffe:'overheat',overheat:'overheat',fuite:'leak',leak:'leak',huile:'leak',ldr:'leak',glycol:'leak',adas:'adas',camera:'camera',caméra:'camera',radar:'adas',logiciel:'software',software:'software',obc:'charge',iccu:'charge',pompe:'mech',boite:'gearbox','boîte':'gearbox',dsg:'gearbox',dct:'gearbox',cvt:'gearbox'};
function predClassify(tok){tok=seNorm(tok);
 if(PRED_BRANDS.indexOf(tok)>=0||PRED_BRANDS.some(function(b){return b.indexOf(tok)===0&&tok.length>=2;}))return 'brand';
 if(/^(\d{1,2}\.\d|\d{2,3})/.test(tok))return /kw|ch|hp/.test(tok)?'power':'motor';
 if(/^\d{2,4}$/.test(tok))return 'power';
 if(PRED_SUBS[tok]!==undefined)return 'sub';
 if(PRED_MODELS.some(function(m){return m.indexOf(tok)>=0||tok.indexOf(m.split(' ')[0])===0&&tok.length>1;}))return 'model';
 if(PRED_MOTORS.some(function(m){return m.indexOf(tok)>=0;}))return 'motor';
 return 'text';}
function predParse(q){var toks=seNorm(q).split(/[\s,;]+/).filter(Boolean);var o={brand:'',model:'',motor:'',power:'',subs:[],free:[]};
 toks.forEach(function(t){var c=predClassify(t);
  if(c==='brand'&&!o.brand)o.brand=t;
  else if(c==='model')o.model+=(o.model?' ':'')+t;
  else if(c==='motor')o.motor+=(o.motor?' ':'')+t;
  else if(c==='power'){var n=t.match(/\d+/);if(n)o.power=n[0]+' kW';}
  else if(c==='sub')o.subs.push(PRED_SUBS[t]);
  else o.free.push(t);});
 return o;}
function predSuggestions(q){var toks=seNorm(q).split(/[\s,;]+/).filter(Boolean);var last=toks[toks.length-1]||'';var out=[];
 if(!last)return out;
 var wantBrand=toks.length<=1&&!predParse(q).brand;
 if(wantBrand)PRED_BRANDS.forEach(function(b){if(b.indexOf(last)===0)out.push({t:'🏷️ Marque',v:b.charAt(0).toUpperCase()+b.slice(1)});});
 PRED_MODELS.forEach(function(m){if(m.indexOf(last)===0)out.push({t:'🚗 Modèle',v:m.charAt(0).toUpperCase()+m.slice(1)});});
 PRED_MOTORS.forEach(function(m){if(m.indexOf(last)===0)out.push({t:'⚙️ Motorisation',v:m.toUpperCase()});});
 Object.keys(PRED_SUBS).forEach(function(k){if(k.indexOf(last)===0)out.push({t:'🔧 Panne',v:k});});
 if(/^\d+$/.test(last))out.push({t:'💪 Puissance',v:last+' kW'});
 return out.slice(0,12);}
function predMatch(r,p){
 if(p.brand&&!brandMatch(r.brand||'',p.brand)&&!seNorm(r.brand||'').includes(p.brand))return false;
 if(p.model){var rm=seNorm(String(r.models||''));var mt=p.model.split(' ');var ok=mt.every(function(t){return rm.includes(t);})||rm.includes(mt[0]);if(!ok)return false;}
 if(p.motor){var rmo=seNorm(String(r.motor||'')+' '+String(r.models||''));if(!rmo.includes(seNorm(p.motor).split(' ')[0]))return false;}
 if(p.power&&r.power&&r.power!=='-'&&!powerOverlap2(r.power,p.power))return false;
 if(p.subs.length){var rs=r.subsys||bucketOf(r);if(p.subs.indexOf(rs)<0&&!p.subs.some(function(s){return seNorm(r.cause||'').includes(s);}))return false;}
 if(p.free.length){var hay=seNorm([r.brand,r.models,r.motor,r.cause,r.mech,r.idx].join(' '));for(var i=0;i<p.free.length;i++){if(hay.indexOf(p.free[i])<0&&!fuzzy16(hay,p.free[i]))return false;}}
 return true;}
function predSearch(q){var p=predParse(q);var list=RECALLS.filter(function(r){return predMatch(r,p);});
 list.sort(function(a,b){return score16(b,[q])-score16(a,[q]);});
 return {parsed:p,list:list.slice(0,40)};}
