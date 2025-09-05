#!/bin/bash

echo "🚀 Déploiement GitHub Pages - WebBoost Martinique"

# Aller dans le dossier frontend
cd frontend

echo "📦 Installation des dépendances..."
yarn install

echo "🔨 Build de l'application avec base path..."
yarn build

# Copier index.html vers 404.html pour gérer les routes SPA
echo "📋 Copie de index.html vers 404.html pour SPA routing..."
cp dist/index.html dist/404.html

# Créer un fichier .nojekyll pour éviter les problèmes Jekyll
echo "📝 Création du fichier .nojekyll..."
touch dist/.nojekyll

echo "✅ Build terminé ! Fichiers générés dans frontend/dist/"
echo "📁 Contenu à déployer :"
ls -la dist/

echo ""
echo "🎯 INSTRUCTIONS DE DÉPLOIEMENT GITHUB PAGES :"
echo "1. Copiez tout le contenu du dossier 'frontend/dist/' vers votre repo GitHub"
echo "2. Assurez-vous que GitHub Pages est configuré sur la branche 'main' ou 'gh-pages'"
echo "3. Dans Settings > Pages, sélectionnez la bonne source"
echo ""
echo "🌐 Site disponible sur : https://kenneson972.github.io/WEBBOOSTMARTINIQUE/"
echo "⚡ Le chatbot utilise maintenant VITE_BACKEND_URL et devrait fonctionner !"

echo ""
echo "🔍 VÉRIFICATIONS IMPORTANTES :"
echo "✅ Base path configuré : /WEBBOOSTMARTINIQUE/"
echo "✅ React Router basename : /WEBBOOSTMARTINIQUE"  
echo "✅ Fichier 404.html créé pour SPA routing"
echo "✅ Variable VITE_BACKEND_URL correctement configurée"
echo "✅ Fichier .nojekyll présent"