// ================================================================
// AUTO-UPDATE v20 — helper de fusion de feed (appelé par access-control)
// ================================================================
function applyFeedMerge(feed){if(!feed||!feed.cases)return 0;var added=0;
 var keys={};RECALLS.forEach(function(r){keys[(r.brand+'|'+r.cause).toLowerCase().slice(0,80)]=1;});
 feed.cases.forEach(function(c){var dk=(c.brand+'|'+c.cause).toLowerCase().slice(0,80);
  if(!RECALLS.find(function(r){return r.id===c.id;})&&!keys[dk]){RECALLS.push({id:c.id,brand:c.brand,models:c.models,years:c.years,energy:c.energy,motor:c.motor||'-',region:c.region||'-',src:c.src||'Feed',ref:c.ref||'-',subsys:c.subsys,cause:c.cause,mech:c.mech,idx:c.idx,photos:c.photos,power:c.power});keys[dk]=1;added++;}});
 return added;}
if(typeof syncRecallsFeed==='function'){var _origSync=syncRecallsFeed; /* keep existing */}
console.log('✅ auto-update v20 (applyFeedMerge disponible)');
