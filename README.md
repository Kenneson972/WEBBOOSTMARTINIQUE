# 🚀 WebBoost Martinique - Version 02switch

Site web professionnel pour la création de sites vitrines martiniquais. Architecture HTML/CSS/JS classique optimisée pour l'hébergement 02switch.

## 🎯 Fonctionnalités

### 🤖 **Chatbot Élise IA**
- Conseillère commerciale professionnelle
- Intégration OpenAI côté serveur (PHP)
- Fallback intelligent si IA indisponible
- Interface premium avec photo

### 🛒 **Machine de vente**
- Tunnel de commande 6 étapes
- 3 packs : Essentiel (890€), Pro (1290€), Premium (1790€)
- Options à la carte
- Paiement échelonné 50/40/10

### 📱 **Mobile-first**
- Responsive design parfait
- Touch-optimized (≥44px)
- Performance optimisée
- Animations fluides

## 🔧 Installation

### 1. Configuration .env
```bash
# Créer fichier .env à la racine
OPENAI_API_KEY=sk-votre-cle-openai-ici
EMERGENT_LLM_KEY=sk-emergent-b27C78eB5E91e6950F
```

### 2. Déploiement 02switch
Le fichier `.cpanel.yml` gère le déploiement automatique GitHub → 02switch.

### 3. Structure déployée
```
public_html/
├── index.html              # Page principale  
├── .htaccess               # Configuration Apache
├── assets/                 # CSS, JS, images
└── api/                    # Backend PHP
```

## 📁 Structure projet

```
webboost-martinique/
├── .cpanel.yml             # Déploiement auto
├── .env.example            # Template variables
├── index.html              # Page principale
├── .htaccess               # Config Apache
├── robots.txt              # SEO
│
├── assets/
│   ├── css/
│   │   ├── main.css        # Styles principaux
│   │   ├── chatbot.css     # Chatbot Élise
│   │   ├── responsive.css  # Mobile-first
│   │   └── components.css  # Composants UI
│   │
│   ├── js/
│   │   ├── main.js         # App principal
│   │   ├── chatbot.js      # Élise IA
│   │   ├── contact-form.js # Formulaires
│   │   └── order-flow.js   # Tunnel commande
│   │
│   └── images/
│       └── elise-avatar.jpg # Photo Élise
│
└── api/
    └── chat.php            # Backend chatbot
```

## 🚀 Utilisation

### Chatbot Élise
```javascript
// Auto-initialisation
window.eliseChatbot = new EliseWebBoostChatbot();

// Interaction programmatique
window.eliseChatbot.openChat();
window.eliseChatbot.sendMessage("Bonjour Élise");
```

### Machine de vente
```javascript
// Démarrer commande
startOrder();           // Sélection libre
startOrder('pro');      // Pack pré-sélectionné

// Commande directe
orderPack('essentiel'); // Commande Pack Essentiel
```

### Analytics
```javascript
// Tracking événements
trackEvent('pack_viewed', { pack: 'pro' });
trackEvent('order_completed', { total: 1290 });
```

## 🔧 Configuration

### OpenAI (Élise)
1. Récupérer clé sur https://platform.openai.com/api-keys
2. Ajouter dans `.env` : `OPENAI_API_KEY=sk-...`
3. Élise fonctionne automatiquement

### Analytics GA4
1. Ajouter ID mesure dans `index.html`
2. Décommenter code GA4
3. Événements trackés automatiquement

### Stripe (futur)
1. Créer compte Stripe
2. Ajouter clés dans `.env`
3. Intégrer dans `order-flow.js`

## 📊 Performance

- **Lighthouse** : 95+ mobile/desktop
- **First Contentful Paint** : < 1.5s
- **Largest Contentful Paint** : < 2.5s
- **Cumulative Layout Shift** : < 0.1
- **Time to Interactive** : < 3s

## 🛡️ Sécurité

- Headers sécurité configurés
- Fichiers sensibles protégés
- CORS configuré
- Validation inputs côté serveur
- Rate limiting API (recommandé)

## 📞 Support

- **Site** : https://weboostmartinique.com
- **Email** : contact@weboostmartinique.com  
- **WhatsApp** : +596 00 00 00
- **Élise chatbot** : Disponible 24/7

---

**🎯 WebBoost Martinique - Spécialiste sites web martiniquais depuis 2022**