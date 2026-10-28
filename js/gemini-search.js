const GEMINI_API_KEY='VOTRE_CLE_API_GEMINI';
async function geminiSearch(query){const ctx='MÉTAUX : '+FIRE_DATABASE.metals.map(m=>m.name+' '+m.meltingPointC+'°C').join(', ')+' | CAS RÉCENTS : '+RECALLS.slice(-15).map(r=>r.brand+' '+r.cause).join(' ; ');
const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+GEMINI_API_KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:'Expert incendie véhicule/bâtiment. CONTEXTE : '+ctx+'\nQUESTION : '+query+'\nRéponds en français technique (T°, aspects, indices).'}]}]})});
if(!r.ok)throw new Error('API '+r.status);const d=await r.json();return d.candidates[0].content.parts[0].text;}
