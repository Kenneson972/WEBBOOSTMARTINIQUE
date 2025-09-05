#!/bin/bash

# Script de déploiement rapide pour GitHub Pages
echo "🚀 Déploiement WebBoost Martinique..."

# Aller dans le dossier frontend
cd frontend

echo "📦 Installation des dépendances..."
yarn install

echo "🔨 Build de l'application..."
yarn build

echo "✅ Build terminé ! Fichiers générés dans frontend/dist/"
echo "📁 Contenu à copier pour GitHub Pages :"
ls -la dist/

echo ""
echo "📋 ÉTAPES SUIVANTES POUR GITHUB PAGES :"
echo "1. Copiez tout le contenu du dossier 'frontend/dist/' vers votre repo GitHub"
echo "2. Ou poussez ce code avec le workflow .github/workflows/deploy.yml"
echo "3. Dans Settings > Pages, sélectionnez 'GitHub Actions' comme source"
echo ""
echo "🌐 Votre site sera disponible sur : https://kenneson972.github.io/WEBBOOSTMARTINIQUE/"