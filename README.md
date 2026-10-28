# diag-incendie-by-kevin (v8)
PWA/APK multi-plateformes (Android .apk, Windows .msix, iOS) d'aide au diagnostic incendie.
## Contenu
- 55 campagnes/pannes réelles 2018-2026 (NHTSA, Rappel Conso, Safety Gate, SAMR, KBA, Korea MTI) : thermique, VE, hybride, GPL
- Mode formation par rappel : panne → inflammation → propagation → indices de fusion (Al 660°C, Cu 1084°C, perlage, collage)
- 4 recherches locales (thermique / électrique / hybride / GPL) + recherche globale + IA Gemini
- NFPA 921, ASTM E2929, cartographie de fusion, polymères, aéraulique, protocoles
- 55+ photos réelles (MEB, caméras thermiques, sinistres) mises en cache hors ligne
- ADMIN : fond d'écran personnalisé persistant (IndexedDB)
## Déploiement
1. Uploader tous les fichiers (GitHub)
2. tools/generate-icons.html → 15 PNG → tools/upload-icons-github.html (token)
3. tools/autodiag.html → 0 KO
4. pwabuilder.com → URL GitHub Pages → Package Android/Windows/iOS
## Clé Gemini
js/gemini-search.js → GEMINI_API_KEY (aistudio.google.com)
