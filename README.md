# Etude incendie by Kevin — v30
PWA/APK Android • Windows • iOS. Base experte des départs d'incendie véhicules & bâtiments 2018-2026.

## Fonctionnalités
- 🖼️ Fond d'écran par défaut : véhicule en feu réaliste, opacité réglable 0-60 % (défaut 22 %) ; admin peut charger un autre fond (fichier ou URL)
- 🔐 Accès : mot de passe admin obligatoire à chaque ouverture (hash runtime) ; tiers uniquement par demande validée (notification ntfy sur APK admin), accord/refus/révocation à tout moment
- 🔎 Recherche unifiée prédictive (marque/modèle/motorisation/panne) + alias (r5, w206…) + 4 cases énergie + live 24 sources (Rappel Conso, NHTSA, Safety Gate/RAPEX, KBA, presse)
- 🧰 Pavé « Pannes connues » par thème + marque/modèle/motorisation/puissance (méga-base fusionnée : auto-diagnostic, my-tech, aide-rédactionnelle, formation-auto)
- 🤖 IA locale gratuite (hors-ligne) : hypothèses classées avec % confiance, origine → mécanisme → conséquences
- ⚖️ Analyse technique + juridique par contexte libre (vice caché 1641, conformité L217-3, sécurité L421-3, expertise CPC 16/1643…)
- 📋 20 fiches techniques origine de feu (10 thermiques + 10 VE) 9 rubriques + photos réelles
- 🎯 Foyer : 10 étapes sapiteur ; feu VE 8 phases ; comparatif élec/méca/fluide ; FAP/cata
- 📸 Photos réelles par marque & sujet (galeries filtrables)
- 🔄 MAJ mensuelle automatique (GitHub Action NHTSA + Rappel Conso + bases internes) + validation admin pour les tiers
- 📶 Connexion permanente 4G/5G/WiFi + base locale massive hors-ligne (IndexedDB + Cache API)

## Déploiement
1. Repo public `etude-incendie-by-kevin` ; envoyer les fichiers (tools/github-push.html ou Create new file)
2. GitHub Pages (branch main) + Actions (run manuel du workflow)
3. tools/generate-icons.html → 16 PNG → tools/upload-icons-github.html (token Contents R/W) → supprimer le token
4. tools/autodiag.html → 0 KO
5. pwabuilder.com → URL Pages → packages Android (.apk) / Windows (.msix) / iOS

## Structure
index.html • manifest.json • service-worker.js • css/styles.css • images/icon.svg • data/recalls-feed.json
js/data.js • js/engine.js • js/search-v25.js • js/mega-pannes.js • js/legal-auto.js • js/app.js • js/fiches-techniques.js
tools/ autodiag • github-push • generate-icons • upload-icons-github • fetch-recalls.mjs
.github/workflows/monthly-recalls.yml
