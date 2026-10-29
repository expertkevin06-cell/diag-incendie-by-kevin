// ================================================================
// UI v22 (__v22) — configuration du canal (relais personnalisé + jetons)
// ================================================================
var __v22=true;
function relayConfigUI(){var host=document.getElementById('relayConfig');
 if(!host){host=document.createElement('div');host.id='relayConfig';host.className='id-card';
  var ap=document.getElementById('adminPanel');if(ap)ap.insertBefore(host,ap.querySelector('h3'));else return;}
 host.innerHTML='<h4>📡 Configuration du canal notifications</h4>'+
  '<p style="font-size:.85rem">Relais par défaut : ntfy.sh, ntfy.ffmuc.net, ntfy.dcs0.hu (aucun jeton requis). Optionnel : relais auto-hébergé + jetons.</p>'+
  '<input id="cfgRelay" placeholder="Relais personnalisé (ex : https://ntfy.mondomaine.fr)" style="width:100%;padding:.6rem;margin:.3rem 0;border:2px solid #ddd;border-radius:8px">'+
  '<input id="cfgTkReq" placeholder="Jeton WRITE topic demandes (optionnel)" style="width:100%;padding:.6rem;margin:.3rem 0;border:2px solid #ddd;border-radius:8px">'+
  '<input id="cfgTkDec" placeholder="Jeton READ+WRITE topics décisions+demandes (optionnel)" style="width:100%;padding:.6rem;margin:.3rem 0;border:2px solid #ddd;border-radius:8px">'+
  '<input id="cfgTkRel" placeholder="Jeton WRITE topic releases (optionnel)" style="width:100%;padding:.6rem;margin:.3rem 0;border:2px solid #ddd;border-radius:8px">'+
  '<button class="btn-offline" id="cfgSave" style="color:#2e7d32">💾 Enregistrer & re-tester</button>'+
  '<button class="btn-offline" id="cfgTest" style="color:#ff6f00">🔁 Re-tester les relais</button>'+
  '<p id="cfgOut" class="feed-info"></p>';
 var tk=acTokens();
 document.getElementById('cfgRelay').value=localStorage.getItem('acRelay')||'';
 document.getElementById('cfgTkReq').value=tk.req||'';
 document.getElementById('cfgTkDec').value=tk.dec||'';
 document.getElementById('cfgTkRel').value=tk.rel||'';
 document.getElementById('cfgSave').addEventListener('click',function(){
  acSetCustomRelay(document.getElementById('cfgRelay').value.trim());
  acSetTokens({req:document.getElementById('cfgTkReq').value.trim(),dec:document.getElementById('cfgTkDec').value.trim(),rel:document.getElementById('cfgTkRel').value.trim()});
  acTestChannel().then(function(t){document.getElementById('cfgOut').textContent=(t.ok?'🟢 ':'⛔ ')+t.relay+' — '+t.detail;});});
 document.getElementById('cfgTest').addEventListener('click',function(){
  acTestChannel().then(function(t){document.getElementById('cfgOut').textContent=(t.ok?'🟢 ':'⛔ ')+t.relay+' — '+t.detail;});});}
document.addEventListener('DOMContentLoaded',function(){try{relayConfigUI();console.log('✅ ui-v22 actif (config canal)');}catch(e){console.error('[v22]',e);}});
