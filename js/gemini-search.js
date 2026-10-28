const GEMINI_API_KEY='VOTRE_CLE_API_GEMINI'; // gratuite : aistudio.google.com/app/apikey
async function geminiSearch(query){
const ctx='MÉTAUX : '+FIRE_DATABASE.metals.map(m=>`${m.name} ${m.meltingPointC}°C`).join(', ')+'. RAPPELS : '+RECALLS.slice(0,20).map(r=>`${r.brand} ${r.cause}`).join(' ; ');
const prompt=`Tu es expert incendie véhicule/bâtiment. CONTEXTE : ${ctx}\nQUESTION : ${query}\nRéponds en français, technique, avec températures et aspects visuels.`;
const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
if(!r.ok)throw new Error('API '+r.status);
const d=await r.json();return d.candidates[0].content.parts[0].text;}
