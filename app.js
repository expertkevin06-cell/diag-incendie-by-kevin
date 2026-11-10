/* =========================================================
   EXPERT AUTO LITIGE — app.js v6
   ✔ Demande d'accès tiers fiable (file d'attente hors-ligne + retry)
   ✔ Notifications admin temps réel (badge + toast + son + vibration + Notification API)
   ✔ Statut tiers mis à jour en direct
   ✔ Expertise multi-IA + moteur local
   ========================================================= */
const ADMIN_PWD = "Kevin83600";
const SESSION_KEY = 'expertauto_session';
let usersData = {}, listenerOn = false, lastPendingCount = -1, deferredPrompt = null;

/* ---------- Helpers ---------- */
const el = id => document.getElementById(id);
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));const t=el(id);if(t)t.classList.remove('hidden');}
function screenIsActive(id){const t=el(id);return t&&!t.classList.contains('hidden');}
function notify(msg,type){let t=el('toast');if(!t)return;t.textContent=msg;t.className='toast show'+(type==='error'?' err':'');clearTimeout(t._h);t._h=setTimeout(()=>t.className='toast',3500);}
function deviceId(){let d=localStorage.getItem('expertauto_device');if(!d){d='DEV-'+Math.random().toString(36).slice(2,8).toUpperCase();localStorage.setItem('expertauto_device',d);}return d;}
function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY))||null}catch(e){return null}}
function saveSession(s){localStorage.setItem(SESSION_KEY,JSON.stringify(s));}
function dbOk(){return !!window.db;}
function showDbBanner(msg){const b=el('dbBanner');if(!b)return;if(!msg){b.classList.add('hidden');return;}b.textContent=msg;b.classList.remove('hidden');}
function vibrate(){try{navigator.vibrate&&navigator.vibrate([180,90,180]);}catch(e){}}
function beep(){try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(.15,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.4);o.start();o.stop(ctx.currentTime+.45);}catch(e){}}
function todayKey(){return new Date().toISOString().slice(0,10);}

/* ---------- Écouteur temps réel + NOTIFICATIONS ADMIN ---------- */
function startAccessListener(){
  if(listenerOn) return;
  if(!dbOk()){showDbBanner('⚠️ Base Firebase non configurée (firebase-config.js). Mode hors-ligne actif : les demandes seront mises en file d\'attente.');return;}
  listenerOn = true;

  db.ref('.info/connected').on('value', s=>{
    if(s.val()===true){showDbBanner('');flushQueue();}
    else showDbBanner('⚠️ Connexion à la base perdue — mode hors-ligne.');
  });

  db.ref('access/users').on('value', snap=>{
    usersData = snap.val() || {};
    const pending = countPending();
    updatePendingBadge(pending);
    if(lastPendingCount >= 0 && pending > lastPendingCount) onNewRequest(pending);
    lastPendingCount = pending;
    refreshSelfFromUsers();
    if(screenIsActive('screen-admin')) renderAdmin();
  }, err=>showDbBanner('❌ Erreur base de données : '+err.message));
}
function countPending(){return Object.values(usersData).filter(u=>u.status==='pending').length;}
function updatePendingBadge(n){
  const b=el('pendingBadge'); if(b){b.textContent=n;b.style.display=n>0?'inline-block':'none';}
}
function onNewRequest(n){
  notify('🔔 Nouvelle demande d\'accès en attente ('+n+')');
  vibrate(); beep();
  if(sessionStorage.getItem('autodiag_admin')==='1' && 'Notification' in window && Notification.permission==='granted'){
    try{new Notification('Expert Auto — Nouvelle demande d\'accès',{body:n+' demande(s) en attente',icon:'./icon-192.png'});}catch(e){}
  }
}
function refreshSelfFromUsers(){
  const s=getSession(); if(!s||!s.prenom) return;
  const k=Object.keys(usersData).find(k=>(usersData[k].prenom||'').toLowerCase()===s.prenom.toLowerCase());
  const st=k?(usersData[k].status||'pending'):null;
  if(st && st!==s.status){saveSession(Object.assign({},s,{status:st}));routeUser();notify('📩 Statut mis à jour : '+st);}
}

/* ---------- File d'attente hors-ligne ---------- */
function queueRequest(key,data){const q=JSON.parse(localStorage.getItem('reqQueue')||'[]');q.push({key,data});localStorage.setItem('reqQueue',JSON.stringify(q));}
async function flushQueue(){
  const q=JSON.parse(localStorage.getItem('reqQueue')||'[]');
  if(!q.length||!dbOk())return;
  const rest=[];
  for(const item of q){try{await db.ref('access/users/'+item.key).set(item.data);}catch(e){rest.push(item);}}
  localStorage.setItem('reqQueue',JSON.stringify(rest));
  if(q.length&&!rest.length)notify('✅ Demande(s) en attente envoyée(s) à l\'admin');
}

/* ---------- Demande d'accès tiers ---------- */
async function requestAccess(){
  const p=el('input-prenom').value.trim();
  if(p.length<2) return notify('Prénom invalide','error');
  const key='user_'+p.toLowerCase().replace(/[^a-z0-9]+/g,'_');
  const data={prenom:p,status:'pending',device:deviceId(),date:Date.now()};
  saveSession({prenom:p,status:'pending',date:Date.now()});
  if(!dbOk()){queueRequest(key,data);showPending(p);notify('⚠️ Hors-ligne : demande mise en file d\'attente');return;}
  try{
    await db.ref('access/users/'+key).set(data);
    showPending(p); notify('📨 Demande envoyée à l\'administrateur');
  }catch(e){
    console.error(e); queueRequest(key,data); showPending(p);
    notify('⚠️ Envoi impossible pour l\'instant — mise en file d\'attente','error');
  }
}
function showPending(p){
  el('pending-name').textContent=p;
  const m=encodeURIComponent('🔐 DEMANDE D\'ACCÈS Expert Auto\n👤 '+p+'\n📱 '+deviceId()+'\n📅 '+new Date().toLocaleString('fr-FR'));
  el('share-wa').href='https://wa.me/?text='+m;
  el('share-sms').href='sms:?body='+m;
  el('share-mail').href='mailto:?subject=Demande%20acc%C3%A8s&body='+m;
  showScreen('screen-pending');
}
async function checkStatus(){
  const s=getSession(); if(!s||!s.prenom) return showScreen('screen-home');
  if(!dbOk()) return notify('⚠️ Base indisponible (hors-ligne ?)','error');
  try{
    const snap=await db.ref('access/users').once('value');
    usersData=snap.val()||{};
    const k=Object.keys(usersData).find(k=>(usersData[k].prenom||'').toLowerCase()===s.prenom.toLowerCase());
    const st=k?(usersData[k].status||'pending'):null;
    if(!st){showPending(s.prenom);return notify('Demande introuvable — renouveliez-la','error');}
    saveSession(Object.assign({},s,{status:st}));
    routeUser();
  }catch(e){notify('⚠️ Vérification impossible : '+e.message,'error');}
}
function resetSession(){localStorage.removeItem(SESSION_KEY);el('input-prenom').value='';showScreen('screen-home');}
function routeUser(){
  const s=getSession();
  if(!s||!s.prenom){showScreen('screen-home');return;}
  const st=s.status||'pending';
  if(st==='accepted'){el('accepted-name').textContent=s.prenom;showScreen('screen-accepted');}
  else if(st==='refused')showScreen('screen-refused');
  else if(st==='revoked')showScreen('screen-revoked');
  else showPending(s.prenom);
}

/* ---------- Admin ---------- */
function loginAdmin(){
  if(el('admin-pwd').value===ADMIN_PWD){
    sessionStorage.setItem('autodiag_admin','1'); el('admin-pwd').value='';
    if('Notification' in window && Notification.permission==='default') Notification.requestPermission();
    showScreen('screen-admin'); renderAdmin(); updatePendingBadge(countPending());
    notify('👑 Session admin ouverte — notifications actives');
  } else notify('❌ Mot de passe incorrect','error');
}
function logoutAdmin(){sessionStorage.removeItem('autodiag_admin');showScreen('screen-home');}
function renderAdmin(){
  const c=el('users-table-container'); if(!c)return;
  const keys=Object.keys(usersData).sort((a,b)=>(usersData[b].date||0)-(usersData[a].date||0));
  if(!keys.length){c.innerHTML='<p class="muted">Aucune demande pour le moment.</p>';return;}
  const L={pending:'⏳ Attente',accepted:'✅ Accepté',refused:'❌ Refusé',revoked:'🔒 Révoqué'};
  let h='<table><thead><tr><th>Prénom</th><th>Statut</th><th>Appareil</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
  keys.forEach(k=>{
    const u=usersData[k],st=u.status||'pending'; let a='';
    if(st==='pending') a+='<button class="btn btn-sm ok" data-action="accept" data-key="'+k+'">✓</button><button class="btn btn-sm ko" data-action="refuse" data-key="'+k+'">✗</button>';
    else if(st==='accepted') a+='<button class="btn btn-sm ko" data-action="revoke" data-key="'+k+'">Révoquer</button>';
    else a+='<button class="btn btn-sm ok" data-action="accept" data-key="'+k+'">Réautoriser</button>';
    a+='<button class="btn btn-sm sec" data-action="delete" data-key="'+k+'">🗑️</button>';
    h+='<tr><td>'+esc(u.prenom)+'</td><td><span class="st st-'+st+'">'+L[st]+'</span></td><td class="small">'+esc(u.device||'—')+'</td><td class="small">'+(u.date?new Date(u.date).toLocaleDateString('fr-FR'):'—')+'</td><td>'+a+'</td></tr>';
  });
  c.innerHTML=h+'</tbody></table>';
}
function bindAdminTable(){
  el('users-table-container').addEventListener('click',e=>{
    const b=e.target.closest('button[data-action]'); if(!b)return;
    if(!dbOk()) return notify('⚠️ Base indisponible','error');
    const k=b.dataset.key,a=b.dataset.action;
    if(a==='delete'){if(confirm('Supprimer définitivement ?'))db.ref('access/users/'+k).remove();return;}
    db.ref('access/users/'+k).update({status:a==='accept'?'accepted':a==='refuse'?'refused':'revoked'})
      .then(()=>notify('✅ Statut mis à jour (notifié au tiers)'))
      .catch(er=>notify('❌ '+er.message,'error'));
  });
}
async function addUser(){
  const p=el('new-prenom').value.trim(); if(p.length<2)return notify('Prénom invalide','error');
  if(!dbOk())return notify('⚠️ Base indisponible','error');
  await db.ref('access/users/user_'+p.toLowerCase().replace(/[^a-z0-9]+/g,'_')).set({prenom:p,status:'accepted',device:'admin',date:Date.now()});
  el('new-prenom').value=''; notify('✅ '+p+' autorisé');
}
function shareAPK(){
  const u=new URL('./index.html',location.href).href;
  if(navigator.share) navigator.share({title:'Expert Auto Litige',text:'Installez l\'APK :',url:u}).catch(()=>{});
  else if(navigator.clipboard) navigator.clipboard.writeText(u).then(()=>notify('🔗 Lien copié'));
  else prompt('Lien :',u);
}
function openExpertise(){
  const ok=sessionStorage.getItem('autodiag_admin')==='1'||(getSession()&&getSession().status==='accepted');
  if(!ok) return notify('Accès non autorisé','error');
  showScreen('screen-app'); loadSavedReports(); renderQuota();
}
function enterApp(){openExpertise();}
function logoutApp(){showScreen(sessionStorage.getItem('autodiag_admin')==='1'?'screen-admin':'screen-accepted');}

/* ---------- Quota IA ---------- */
function getQuota(){let q=JSON.parse(localStorage.getItem('iaQuota')||'{"date":"","count":0}');if(q.date!==todayKey())q={date:todayKey(),count:0};return q;}
function bumpQuota(){const q=getQuota();q.count++;localStorage.setItem('iaQuota',JSON.stringify(q));renderQuota();}
function renderQuota(){const b=el('quotaBadge');if(b)b.textContent='🧠 Analyses IA aujourd\'hui : '+getQuota().count;}

/* ---------- Expertise (multi-IA + local) ---------- */
function calculerDelais(d){
  const dateE=new Date(d.dateE),dateP=new Date(d.dateP),today=new Date();
  const fc=new Date(dateE);fc.setFullYear(fc.getFullYear()+2);
  const fv=new Date(dateP);fv.setFullYear(fv.getFullYear()+5);
  return {
    joursDepuisVente:Math.floor((today-dateE)/86400000),
    joursDepuisPanne:Math.floor((today-dateP)/86400000),
    delaiConformiteRestant:Math.floor((fc-today)/86400000),
    delaiVicesCachesRestant:Math.floor((fv-today)/86400000),
    finConformite:fc.toLocaleDateString('fr-FR'), finVicesCaches:fv.toLocaleDateString('fr-FR')
  };
}
const SYSTEM_PROMPT="Tu es un Ingénieur Expert Automobile français ET Juriste spécialisé (droit civil, consommation, assurances, procédure). Rédige un rapport d'expertise ultra-précis pour assureur Protection Juridique / RC Pro. Structure : I Synthèse (indice d'antériorité) ; II Analyse chronologique/kilométrique ; III Analyse technique (causes, DTC, rappels) ; IV Qualification juridique (articles précis C. civ. 1641-1649, 1231-1, 1137, 1604 ; C. conso L217-4 s. ; charge de la preuve) ; V Jurisprudence (5-10 arrêts Cour de cassation avec références complètes) ; VI Stratégie procédurale (mise en demeure, expertise 145 CPC, référé 809 CPC, tribunal compétent) ; VII Délais de prescription restants ; VIII Conclusion (chances de succès en %, documents à conserver). Termine par : « Document à faire valider par un expert agréé / professionnel du droit. »";
function buildPrompt(d){
  const del=calculerDelais(d); const legal=window.DATA_LEGAL||{codes:{civil:[],consommation:[]},jurisprudence:[]};
  let ctx='\n=== ARTICLES APPLICABLES ===\n';
  legal.codes.civil.slice(0,10).forEach(a=>ctx+='• Art. '+a.art+' C. civ. : '+a.texte+'\n');
  if(d.type==='vente_pro_part') legal.codes.consommation.slice(0,6).forEach(a=>ctx+='• Art. '+a.art+' C. conso : '+a.texte+'\n');
  ctx+='\n=== JURISPRUDENCE ===\n';
  legal.jurisprudence.slice(0,8).forEach(j=>ctx+='• '+j.ref+' : '+j.principe+'\n');
  return 'CONTEXTE :\n- Type : '+d.typeLabel+'\n- Vente/intervention : '+d.dateE+' ('+d.kmE+' km)\n- Constat panne : '+d.dateP+' ('+d.kmP+' km)\n- Délai : '+d.days+' j | Distance : '+d.km+' km | Moyenne : '+d.avg+' km/j\n- Symptômes : '+d.desc+
  '\n\nPRESCRIPTION : conformité fin '+del.finConformite+' ('+del.delaiConformiteRestant+' j) ; vices cachés fin '+del.finVicesCaches+' ('+del.delaiVicesCachesRestant+' j)'+ctx+'\n\nRédige le rapport complet structuré.';
}
function delayAnalysis(days,km){
  if(days<=30&&km<=3000)return{niv:'TRÈS ÉLEVÉ',txt:'Très court délai + faible km : indice fort de défaut préexistant.',score:90};
  if(days<=90&&km<=10000)return{niv:'ÉLEVÉ',txt:'Délai court et km limité plaident pour un défaut antérieur.',score:75};
  if(days<=180)return{niv:'MODÉRÉ',txt:'Délai intermédiaire : analyse technique approfondie requise.',score:50};
  return{niv:'À DOCUMENTER',txt:'Délai important : antériorité à démontrer par expertise.',score:30};
}
function findLocalMatches(d){
  const low=d.desc.toLowerCase();
  const issues=(window.DATA_ISSUES||[]).filter(i=>(i.detail||'').toLowerCase().split(' ').some(w=>w.length>4&&low.includes(w))).slice(0,5);
  const exps=(window.DATA_BRAND_EXPERT||[]).filter(e=>[e.title,e.symptom,e.diagnosis].join(' ').toLowerCase().split(' ').some(w=>w.length>4&&low.includes(w))).slice(0,5);
  return{issues,exps};
}
function localExpertReport(d){
  const m=findLocalMatches(d),da=delayAnalysis(d.days,d.km),del=calculerDelais(d);
  const doc=(window.DATA_LEGAL&&window.DATA_LEGAL.doctrines)?window.DATA_LEGAL.doctrines[d.type]:null;
  let r="RAPPORT D'EXPERTISE — MOTEUR LOCAL (hors-ligne)\nRéf. EXP-"+Date.now()+" — "+new Date().toLocaleDateString('fr-FR')+"\nType : "+d.typeLabel+"\n\nI. SYNTHÈSE\nDélai "+d.days+" j / "+d.km+" km. Indice d'antériorité : "+da.niv+" ("+da.score+"/100). Chances de succès : "+(da.score>=75?'ÉLEVÉES (70-85%)':da.score>=50?'MODÉRÉES (50-70%)':'À ÉVALUER')+".\n\nII. CHRONOLOGIE\n"+da.txt+"\n\nIII. TECHNIQUE\n";
  if(m.issues.length)m.issues.forEach(i=>r+="• "+i.title+" ("+i.source+") : "+i.detail+" — DTC "+(i.dtc||'n/a')+"\n");
  if(m.exps.length)m.exps.forEach(e=>r+="• "+e.title+" : "+e.symptom+" | Diag : "+e.diagnosis+"\n");
  if(!m.issues.length&&!m.exps.length)r+="Défaillance à caractériser par lecture OBD + inspection.\n";
  r+="\nIV. JURIDIQUE\n"+((doc&&doc.fondements)?doc.fondements.map(f=>"• "+f).join('\n'):"• Garantie vices cachés art. 1641-1649 C. civ.\n• Obligation délivrance art. 1604 C. civ.\n• Dol art. 1137 C. civ.")+"\nCharge de la preuve : "+((doc&&doc.charge_preuve)||"acheteur (vice, antériorité, gravité)")+"\n\nV. JURISPRUDENCE\n";
  ((window.DATA_LEGAL&&window.DATA_LEGAL.jurisprudence)||[]).slice(0,6).forEach(j=>r+="• "+j.ref+" : "+j.principe+"\n");
  r+="\nVI. PROCÉDURE\n1) Mise en demeure LRAR 15 j\n2) Expertise amiable (art. 145 CPC)\n3) Déclaration Protection Juridique (art. L124-1 s. C. ass.)\n4) Référé-provision si urgence (art. 809 CPC)\n5) Tribunal judiciaire du défendeur\n\nVII. PRESCRIPTION\nConformité fin "+del.finConformite+" ("+del.delaiConformiteRestant+" j) ; vices cachés fin "+del.finVicesCaches+" ("+del.delaiVicesCachesRestant+" j)\n\nVIII. CONCLUSION\nActions prioritaires sous 15 jours. Conserver : facture, certificat de cession, entretien, photos, codes DTC.\n\nDocument à faire valider par un expert agréé / professionnel du droit.";
  return r;
}
async function generateReport(){
  const type=el('typeLitige').value, typeLabel=el('typeLitige').selectedOptions[0].text;
  const dateE=el('dateEvent').value, kmE=parseInt(el('kmEvent').value,10)||0;
  const dateP=el('datePanne').value, kmP=parseInt(el('kmPanne').value,10)||0;
  const desc=el('descPanne').value.trim();
  if(!dateE||!dateP||!desc)return alert('Complétez le formulaire');
  const days=Math.max(0,Math.floor((new Date(dateP)-new Date(dateE))/86400000));
  const km=Math.max(0,kmP-kmE); const avg=days>0?(km/days).toFixed(1):km;
  const d={type,typeLabel,dateE,kmE,dateP,kmP,desc,days,km,avg};
  el('loading').classList.remove('hidden'); el('reportContainer').classList.add('hidden');
  const messages=[{role:'system',content:SYSTEM_PROMPT},{role:'user',content:buildPrompt(d)}];
  let out=null;
  try{ out=await window.AI_CHAIN(messages); bumpQuota(); }
  catch(e){ console.warn('IA KO → local',e); out={text:localExpertReport(d),source:'Moteur expert LOCAL (hors-ligne)'}; }
  el('reportSource').textContent='Source : '+out.source;
  el('providerStatus').textContent='Provider : '+out.source+' | '+new Date().toLocaleString('fr-FR');
  el('reportText').innerText=out.text;
  el('loading').classList.add('hidden'); el('reportContainer').classList.remove('hidden');
}
function saveLocal(){
  const saves=JSON.parse(localStorage.getItem('expertSaves')||'[]');
  saves.push({date:el('datePanne').value||todayKey(),report:el('reportText').innerText,timestamp:new Date().toISOString()});
  localStorage.setItem('expertSaves',JSON.stringify(saves)); loadSavedReports(); notify('💾 Rapport sauvegardé hors-ligne');
}
function loadSavedReports(){
  const saves=JSON.parse(localStorage.getItem('expertSaves')||'[]'); const list=el('savedList'); list.innerHTML='';
  if(!saves.length){list.innerHTML='<p class="muted">Aucune sauvegarde locale.</p>';return;}
  saves.slice().reverse().forEach(s=>{
    const div=document.createElement('div');
    div.innerHTML='<strong>Dossier du '+s.date+'</strong><br><small>'+new Date(s.timestamp).toLocaleString('fr-FR')+'</small>';
    div.onclick=()=>{el('reportText').innerText=s.report;el('reportSource').textContent='Source : sauvegarde locale';el('reportContainer').classList.remove('hidden');window.scrollTo(0,document.body.scrollHeight);};
    list.appendChild(div);
  });
}
function downloadPDF(){
  const{jsPDF}=window.jspdf; const doc=new jsPDF();
  doc.setFontSize(11);doc.setFont('helvetica','bold');doc.text("RAPPORT D'EXPERTISE AUTOMOBILE",10,12);
  doc.setFont('helvetica','normal');doc.setFontSize(9);
  doc.text(doc.splitTextToSize(el('reportText').innerText,180),10,20);
  doc.save('Rapport_Expertise_'+todayKey()+'.pdf');
}

/* ---------- Install PWA ---------- */
function setupInstall(){
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
  window.addEventListener('appinstalled',()=>notify('🎉 Application installée'));
}

/* ---------- Boot ---------- */
function boot(){
  bindAdminTable();
  startAccessListener();
  routeUser();
  setupInstall();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('SW :',e));
}
boot();
