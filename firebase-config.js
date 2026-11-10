/* =========================================================
   firebase-config.js — Configuration Firebase Realtime Database
   ⚠️ Remplacez l'objet ci-dessous par VOTRE config (Console Firebase)
   ⚠️ databaseURL est OBLIGATOIRE pour la base temps réel
   ========================================================= */
const firebaseConfig = {
  apiKey: "COLLEZ_VOTRE_API_KEY",
  authDomain: "VOTRE-PROJET.firebaseapp.com",
  databaseURL: "https://VOTRE-PROJET-default-rtdb.firebaseio.com",
  projectId: "VOTRE-PROJET",
  storageBucket: "VOTRE-PROJET.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

try {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.database();
  console.log('✅ Firebase initialisé');
} catch (e) {
  console.warn('❌ Firebase init échouée :', e);
  window.db = null;
}
