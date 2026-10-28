// ================================================================
// UI v19 (__v19) — accès rapide modèles demandés + hygiène champ mdp
// ================================================================
var __v19=true;
var MEGA_MODELS=[["Renault","Clio 4"],["Renault","Clio 5"],["Renault","Clio 6"],["Renault","Austral"],["Renault","Rafale"],["Renault","Koleos II"],["Peugeot","208 I"],["Peugeot","208 II"],["Peugeot","308 II"],["Peugeot","308 III"],["Peugeot","3008 II"],["Peugeot","5008 II"],["Dacia","Duster I/II"],["Dacia","Duster III"],["Dacia","Bigster"],["Dacia","Spring"],["Audi","A1"],["Audi","A3"],["Audi","A4"],["Audi","e-tron"],["Audi","Q3"],["Audi","Q4 e-tron"],["Audi","Q5"],["Audi","Q6 e-tron"],["Audi","Q7"],["Audi","Q8"],["Volkswagen","Polo VI"],["Volkswagen","Taigo"],["Volkswagen","ID.3"],["Volkswagen","ID.4"],["Volkswagen","ID.5"],["Volkswagen","ID.7"]];
function megaPick(b,m){var bEl=document.getElementById('gBrand2'),mEl=document.getElementById('gModel2');
 if(!bEl)return;
 bEl.value=b;bEl.dispatchEvent(new Event('change'));
 setTimeout(function(){mEl.value=m;mEl.dispatchEvent(new Event('change'));
  setTimeout(function(){if(typeof garageDiag2==='function')garageDiag2();},60);},60);}
document.addEventListener('DOMContentLoaded',function(){
 try{
  var p=document.getElementById('gatePwd');
  if(p){p.value='';p.placeholder='Mot de passe';p.setAttribute('autocomplete','new-password');}
  var wrap=document.getElementById('megaChips');
  if(wrap){wrap.innerHTML=MEGA_MODELS.map(function(x){return '<button class="nav-btn mega-chip" data-mb="'+esc15(x[0])+'" data-mm="'+esc15(x[1])+'">'+esc15(x[0])+' '+esc15(x[1])+'</button>';}).join('');
   wrap.addEventListener('click',function(e){var b=e.target.closest('[data-mb]');if(b)megaPick(b.dataset.mb,b.dataset.mm);});}
  console.log('✅ ui-v19 actif : '+MEGA_MODELS.length+' accès rapides + champ mdp sans points');
 }catch(err){console.error('[v19]',err);}});
