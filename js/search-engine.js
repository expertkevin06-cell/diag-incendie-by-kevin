// ================================================================
// MOTEUR DE RECHERCHE EXPERT v11
// ================================================================
const SE_SYN={huile:['oil','lubrifiant','moteur','carter'],oil:['huile'],carburant:['fuel','essence','gazole','diesel','gpl'],fuel:['carburant'],fuite:['leak','fuites'],leak:['fuite'],batterie:['battery','accu'],battery:['batterie'],court:['court-circuit','short','arc'],short:['court-circuit'],incendie:['fire','feu','flamme'],fire:['incendie'],faisceau:['harness','câblage','cablage'],harness:['faisceau'],fusible:['fuse','boîte à fusibles'],fuse:['fusible'],embrasement:['runaway','thermal runaway'],runaway:['embrasement'],perle:['bead','perlage'],bead:['perle'],échappement:['exhaust','collecteur'],catalyseur:['cata','catalytic'],charge:['charging','ccs','type2'],cosse:['borne','terminal']};
function seNorm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function seExpand(q){const t=seNorm(q).split(/[\s,;]+/).filter(Boolean);const out=new Set(t);
t.forEach(w=>{(SE_SYN[w]||[]).forEach(s=>out.add(seNorm(s)));});return [...out];}
function seLev(a,b){if(Math.abs(a.length-b.length)>2)return 9;const m=a.length,n=b.length;let p=Array.from({length:n+1},(_,i)=>i);
for(let i=1;i<=m;i++){let cur=[i];for(let j=1;j<=n;j++){cur[j]=Math.min(p[j]+1,cur[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));}p=cur;}return p[n];}
function seScore(text,tokens){const t=seNorm(text);let s=0;
for(const w of tokens){if(t.includes(w))s+=w.length>3?2:1;else{const words=t.split(/[^a-z0-9]+/);for(const x of words){if(x.length>4&&seLev(x,w)<=1){s+=1;break;}}}}
return s;}
function seSearch(q,facets){
 const toks=seExpand(q);if(!toks.length)return{recalls:[],cases:[],wires:[],metals:[]};
 const F=facets||{};
 const recs=[];
 for(const r of RECALLS){
  if(F.energy&&r.energy!==F.energy)continue;
  if(F.sub&&!(r.motor||'').toLowerCase().includes(F.sub.toLowerCase())&&!(r.id||'').startsWith(F.sub))continue;
  const s=seScore((r.brand||'')+' '+(r.models||''),toks)*3+seScore(r.cause||'',toks)*2+seScore(r.mech||'',toks)*2+seScore(r.motor||'',toks)*2+seScore(r.idx||'',toks);
  if(s>0)recs.push({r,s});}
 recs.sort((a,b)=>b.s-a.s);
 const cases=[];for(const c of FIRE_DATABASE.fireCauses){const s=seScore(c.title+' '+c.description+' '+c.causes.join(' '),toks);if(s>0)cases.push({c,s});}
 cases.sort((a,b)=>b.s-a.s);
 const wires=[];for(const[k,w]of Object.entries(FIRE_DATABASE.wireAnalysis)){const s=seScore(w.title+' '+w.identification+' '+w.characteristics.join(' '),toks);if(s>0)wires.push({w,s});}
 wires.sort((a,b)=>b.s-a.s);
 const metals=[];for(const m of FIRE_DATABASE.metals){const s=seScore(m.name+' '+m.appearance,toks);if(s>0)metals.push({m,s});}
 metals.sort((a,b)=>b.s-a.s);
 return{recalls:recs.slice(0,20),cases:cases.slice(0,8),wires:wires.slice(0,6),metals:metals.slice(0,6)};}
function seRender(res,target){const d=document.getElementById(target);if(!d)return;
 const tot=res.recalls.length+res.cases.length+res.wires.length+res.metals.length;
 if(!tot){d.innerHTML='<div class="no-results">Aucun résultat — essayez : fuite huile, cosse, runaway, CP4, glycol...</div>';return;}
 d.innerHTML=`<div class="search-results-header">${tot} résultat(s) scorés</div>`+
 (res.recalls.length?'<h3>🚨 Pannes / rappels / fuites / batteries</h3>':'')+res.recalls.map(x=>`<div class="search-result-item" onclick="expandRecall('${x.r.id}')"><h4>[score ${x.s}] ${x.r.brand} — ${x.r.models}</h4><p>${x.r.cause} → ${x.r.mech.slice(0,120)}</p></div>`).join('')+
 (res.cases.length?'<h3>🎯 Cas NFPA</h3>':'')+res.cases.map(x=>`<div class="search-result-item" onclick="app.expandCase('${x.c.id}')"><h4>[score ${x.s}] ${x.c.title}</h4><p>${x.c.description}</p></div>`).join('')+
 (res.wires.length?'<h3>🔌 Fils</h3>':'')+res.wires.map(x=>`<div class="search-result-item"><h4>[score ${x.s}] ${x.w.title}</h4><p>${x.w.identification}</p></div>`).join('')+
 (res.metals.length?'<h3>🌡️ Métaux</h3>':'')+res.metals.map(x=>`<div class="search-result-item"><h4>[score ${x.s}] ${x.m.name} — ${x.m.meltingPointC}°C</h4><p>${x.m.appearance}</p></div>`).join('');}
