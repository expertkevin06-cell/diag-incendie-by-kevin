// ================================================================
// MOTEUR PRÉDICTIF v21 (__predict) — suggestions = dictionnaires + BASE RÉELLE
// Propose TOUTES les réponses possibles sous la case de recherche
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
 if(PRED_MODELS.some(function(m){return m.indexOf(tok)>=0;}))return 'model';
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
// ---- Extraction des valeurs RÉELLES présentes dans la base locale ----
function realBrands(){var s={};PRED_BRANDS.forEach(function(b){s[b]=1;});
 RECALLS.forEach(function(r){var b=seNorm(String(r.brand||'').split('/')[0].trim().split(' ')[0]);if(b&&b.length>2)s[b]=1;});return Object.keys(s).sort();}
function realModels(brand){var s={};
 RECALLS.forEach(function(r){if(!brand||brandMatch(r.brand||'',brand)){String(r.models||'').split(',').forEach(function(m){var c=cleanModel(m);if(c&&c.length<45)s[c.toLowerCase()]=c;});}});
 PRED_MODELS.forEach(function(m){s[m]=m.charAt(0).toUpperCase()+m.slice(1);});return Object.keys(s).map(function(k){return s[k];}).sort();}
function realMotors(brand,model){var s={};
 RECALLS.forEach(function(r){if(!brand||brandMatch(r.brand||'',brand)){var rm=seNorm(cleanModel(r.models||''));if(!model||rm.indexOf(seNorm(model).split(' ')[0])>=0){var m=String(r.motor||'').split('(')[0].trim();if(m&&m!=='-'&&m.length<40)s[m.toLowerCase()]=m;}}});
 PRED_MOTORS.forEach(function(m){s[m]=m.toUpperCase();});return Object.keys(s).map(function(k){return s[k];}).sort();}
function realPowers(brand,model,motor){var s={};
 RECALLS.forEach(function(r){if(!brand||brandMatch(r.brand||'',brand)){var rm=seNorm(cleanModel(r.models||''));if(!model||rm.indexOf(seNorm(model).split(' ')[0])>=0){var rmo=seNorm(r.motor||'');if(!motor||rmo.indexOf(seNorm(motor).split(' ')[0])>=0){if(r.power&&r.power!=='-')s[r.power]=1;var pm=String(r.motor||'').match(/\(([^)]*kW[^)]*)\)/);if(pm)s[pm[1]]=1;}}}});
 return Object.keys(s).sort();}
function realSubs(){return Object.keys(PRED_SUBS).filter(function(k,i,a){return a.indexOf(k)===i;}).sort();}
// ---- Suggestions : TOUTES les réponses possibles selon la saisie ----
function predSuggestions(q){var toks=seNorm(q).split(/[\s,;]+/).filter(Boolean);var last=toks[toks.length-1]||'';var p=predParse(q);var out=[];var seen={};
 function add(cat,val){var key=cat+'|'+val;if(seen[key])return;seen[key]=1;out.push({t:cat,v:val});}
 if(!last){ // rien tapé : aperçu de tout
  realBrands().slice(0,8).forEach(function(b){add('🏷️ Marque',PRETTY_BRANDS[b]||cap15(b));});
  Object.keys(PRED_SUBS).slice(0,10).forEach(function(k){add('🔧 Panne',k);});
  return out.slice(0,14);}
 var cls=predClassify(last);
 // Marques
 if(cls==='brand'||toks.length===1)realBrands().forEach(function(b){if(b.indexOf(last)===0)add('🏷️ Marque',PRETTY_BRANDS[b]||cap15(b));else if(b.indexOf(last)>0)add('🏷️ Marque',PRETTY_BRANDS[b]||cap15(b));});
 // Modèles (selon marque déjà saisie ou non)
 realModels(p.brand).forEach(function(m){var n=seNorm(m);if(n.indexOf(last)===0)add('🚗 Modèle',m);else if(n.indexOf(last)>0&&out.length<40)add('🚗 Modèle',m);});
 // Motorisations
 realMotors(p.brand,p.model).forEach(function(m){var n=seNorm(m);if(n.indexOf(last)>=0)add('⚙️ Motorisation',m);});
 // Puissances
 realPowers(p.brand,p.model,p.motor).forEach(function(pw){if(seNorm(pw).indexOf(last)>=0)add('💪 Puissance',pw);});
 // Sous-systèmes / pannes
 realSubs().forEach(function(k){if(k.indexOf(last)===0)add('🔧 Panne',k);});
 return out.slice(0,18);}
function tmModel(rm,t){if(rm.indexOf(t)>=0)return true;var m=t.match(/^([a-z]{1,3})(\d{1,3})$/);if(m){var fw=rm.split(' ')[0]||'';if(fw.indexOf(m[1])===0&&rm.indexOf(m[2])>=0)return true;}if(t.length>=4&&fuzzy16(rm,t))return true;return false;}
function tokHay(hay,t){if(hay.indexOf(t)>=0)return true;if(t.length>=4&&fuzzy16(hay,t))return true;return false;}
function altMatch(hay,hayM,w){var alts=(window.SE_SYN&&SE_SYN[w])||[];if(tokHay(hay,w)||tmModel(hayM,w))return true;for(var i=0;i<alts.length;i++){var a=seNorm(alts[i]);if(tokHay(hay,a)||tmModel(hayM,a))return true;}return false;}
function recallMatch16(r,toks){var hayB=seNorm(r.brand||''),hayM=seNorm(r.models||''),hay=hayB+' '+hayM+' '+seNorm((r.motor||'')+' '+(r.cause||'')+' '+(r.mech||'')+' '+(r.ref||'')+' '+(r.subsys||''));
 for(var i=0;i<toks.length;i++){var w=seNorm(toks[i]);if(!altMatch(hay,hayM,w)&&!(tokHay(hayB,w)))return false;}return true;}
function score16(r,toks){var s=0,hb=seNorm(r.brand||''),hm=seNorm(r.models||'');toks.forEach(function(w){w=seNorm(w);if(hb.indexOf(w)>=0)s+=3;if(hm.indexOf(w)>=0||tmModel(hm,w))s+=3;});return s;}
function predMatch(r,p){
 if(p.brand&&!brandMatch(r.brand||'',p.brand)&&!seNorm(r.brand||'').includes(p.brand))return false;
 if(p.model){var rm=seNorm(String(r.models||'').replace(/\([^)]*\)/g,''));var mt=p.model.split(' ');var ok=mt.every(function(t){return tmModel(rm,t);})||tmModel(rm,mt[0]);if(!ok)return false;}
 if(p.motor){var rmo=seNorm(String(r.motor||'')+' '+String(r.models||''));if(!rmo.includes(seNorm(p.motor).split(' ')[0])&&!tmModel(rmo,seNorm(p.motor).split(' ')[0]))return false;}
 if(p.power&&r.power&&r.power!=='-'&&!powerOverlap2(r.power,p.power))return false;
 if(p.subs.length){var rs=r.subsys||bucketOf(r);if(p.subs.indexOf(rs)<0&&!p.subs.some(function(s){return seNorm(r.cause||'').includes(s);}))return false;}
 if(p.free.length){var hay=seNorm([r.brand,r.models,r.motor,r.cause,r.mech,r.idx].join(' '));for(var i=0;i<p.free.length;i++){if(!tokHay(hay,p.free[i])&&!tmModel(hay,p.free[i]))return false;}}
 return true;}
function predSearch(q){var p=predParse(q);var toks=seNorm(q).split(/[\s,;]+/).filter(Boolean);
 var list=RECALLS.filter(function(r){return predMatch(r,p)&&recallMatch16(r,toks);});
 list.sort(function(a,b){return score16(b,toks)-score16(a,toks);});
 return {parsed:p,list:list.slice(0,50)};}
