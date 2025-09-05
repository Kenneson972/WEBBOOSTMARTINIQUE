# 🤖 CONFIGURATION CHATBOT OPENAI - WebBoost Martinique

## 🎯 PROBLÈME RÉSOLU !

Le chatbot affichait "Désolé, une erreur est survenue" à cause d'un problème de variable d'environnement Vite (`REACT_APP_` au lieu de `VITE_`).

## ✅ SOLUTIONS DISPONIBLES

### **Option 1: Clé Universelle Emergent (Recommandée) 🚀**
- **Avantage** : Fonctionne immédiatement, rien à configurer
- **Comment** : Cliquez sur ⚙️ dans le chatbot > "Utiliser" la clé Emergent
- **Modèles** : GPT-4o-mini, GPT-4o, GPT-5 (selon disponibilité)

### **Option 2: Votre Clé OpenAI Personnelle 🔑**
- **Avantage** : Contrôle total, vos propres quotas OpenAI
- **Comment** : 
  1. Obtenez votre clé API sur https://platform.openai.com/api-keys
  2. Allez sur `/config` ou cliquez ⚙️ dans le chatbot
  3. Entrez votre clé `sk-...`
  4. Choisissez votre modèle (gpt-4o-mini, gpt-4o, etc.)
  5. Cliquez "Tester & Sauvegarder"

## 🔧 NOUVEAUX ENDPOINTS CRÉÉS

### `/api/chat/openai` 
- **Utilise** : Votre clé OpenAI OU clé Emergent en fallback
- **Format** : `{ "message": "votre message", "api_key": "sk-...", "model": "gpt-4o-mini" }`
- **Réponse** : `{ "reply": "...", "model": "...", "provider": "openai" }`

### `/api/config/openai-key`
- **Test et validation** de clés API OpenAI
- **Format** : `{ "openai_api_key": "sk-..." }`
- **Réponse** : `{ "success": true, "message": "..." }`

### `/api/models/openai`
- **Liste** les modèles OpenAI disponibles
- **Réponse** : `{ "models": [...], "default": "gpt-4o-mini" }`

## 📱 UTILISATION SIMPLE

### **Pour utilisation immédiate :**
1. Allez sur votre site : `https://kenneson972.github.io/WEBBOOSTMARTINIQUE/`
2. Cliquez sur le chatbot doré 💬
3. Cliquez sur ⚙️ en haut à droite
4. Cliquez "Utiliser" sur la clé Emergent
5. **Le chatbot fonctionne immédiatement !**

### **Pour utilisation avec votre clé OpenAI :**
1. Récupérez votre clé API sur https://platform.openai.com/api-keys
2. Allez sur `/config` sur votre site
3. Entrez votre clé dans le champ prévu
4. Testez et sauvegardez
5. **Votre chatbot utilise maintenant votre IA !**

## 🔧 VARIABLES D'ENVIRONNEMENT

### **Backend (`/app/backend/.env`)**
```
EMERGENT_LLM_KEY=sk-emergent-b27C78eB5E91e6950F
OPENAI_API_KEY=                                    # Votre clé ici (optionnel)
```

### **Frontend (`/app/frontend/.env`)**
```
VITE_BACKEND_URL=https://digital-martinique-1.preview.emergentagent.com/api
```

## ✅ CHANGEMENTS APPORTÉS

1. **✅ Chatbot corrigé** - VITE_BACKEND_URL au lieu de REACT_APP_BACKEND_URL
2. **✅ Page Impact supprimée** - Navigation simplifiée
3. **✅ "Sites web" au lieu de "Sites martiniquais"** - Contenu mis à jour
4. **✅ Bannière cookies améliorée** - Textes plus clairs
5. **✅ Configuration OpenAI** - Interface simple pour votre clé API
6. **✅ GitHub Pages corrigé** - basename="/WEBBOOSTMARTINIQUE" + 404.html

## 🎯 RÉSULTAT

Vous avez maintenant **2 façons de faire fonctionner le chatbot** :

**🚀 SIMPLE** : Clé Emergent (1 clic)
**🔑 AVANCÉE** : Votre clé OpenAI (plus de contrôle)

**Le chatbot ne devrait plus jamais afficher "Désolé, une erreur est survenue" !**