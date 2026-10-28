# diag-incendie-by-kevin — v9
PWA/APK Android • Windows • iOS. Base experte incendies véhicules 2018-2026.
## MAJ mensuelle automatique des cas
1. **GitHub Action** `.github/workflows/monthly-recalls.yml` : cron 1er du mois 06:00 UTC → `tools/fetch-recalls.mjs` (NHTSA recalls+complaints, Rappel Conso data.gouv) → commit `data/recalls-feed.json`
2. **Service Worker** : Periodic Background Sync 30 j → cache feed + notification
3. **App** : check au lancement (>30 j) + bouton manuel ; fusion RECALLS + persistance IndexedDB (hors-ligne)
## Contenu
55 cas documentés + feed mensuel ; 4 recherches (thermique/élec/hybride/GPL) ; mode formation (panne→inflammation→propagation→indices fusion) ; NFPA 921/ASTM E2929 ; 55+ photos réelles ; admin fond d'écran persistant.
## Déploiement
Upload complet → generate-icons → upload-icons (token) → autodiag 0 KO → PWABuilder (Android/Windows/iOS).
Activer Actions dans l'onglet Actions du dépôt (1er run manuel : workflow_dispatch).
