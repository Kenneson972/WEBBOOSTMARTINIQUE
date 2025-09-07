#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WebBoost Martinique - API Backend pour 02switch
Chatbot : Élise (OpenAI direct)
Hébergement : 02switch
"""

import os
import sys
import json
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from dotenv import load_dotenv

# Chargement variables environnement
load_dotenv()

# Importation emergentintegrations
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False
    print("Warning: emergentintegrations not available - using fallback mode")

# FastAPI app
app = FastAPI(
    title="WebBoost Martinique API",
    description="API pour chatbot Élise et services WebBoost",
    version="2.0.0"
)

# CORS pour 02switch
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://weboostmartinique.com", "https://www.weboostmartinique.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Models Pydantic
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    model: Optional[str] = "gpt-4o-mini"

class ContactRequest(BaseModel):
    nom: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    telephone: str = Field(..., min_length=10, max_length=20)
    entreprise: Optional[str] = Field(None, max_length=100)
    message: str = Field(..., min_length=10, max_length=2000)
    pack: Optional[str] = None
    consent: bool = Field(True, description="Consentement RGPD")

class OrderRequest(BaseModel):
    pack: str
    options: List[str] = []
    customer_info: dict
    total: float
    deposit: float
    order_number: str

# Personnalité Élise pour OpenAI
ELISE_PERSONA = """Tu es Élise Morel, conseillère commerciale de WebBoost Martinique. Tu es professionnelle mais chaleureuse, experte en création de sites web pour TPE/PME martiniquaises.

PERSONNALITÉ ÉLISE :
- Conseillère commerciale experte (3 ans d'expérience)
- Connaissance parfaite du marché martiniquais  
- Approche consultative et bienveillante
- Spécialiste conversion digitale TPE/PME
- Utilise des emojis avec modération pour humaniser

SERVICES WEBBOOST MARTINIQUE :
- Pack Essentiel (890€ HT) : 3 pages, SEO base, mobile-first, 1 révision, délai 10j, acompte 445€
- Pack Pro (1290€ HT) : 5-6 pages, SEO étendu, LCP<2.5s, GA4, 2 révisions, délai 7-10j, acompte 645€ [LE PLUS POPULAIRE]
- Pack Premium (1790€ HT) : 6-8 pages + conversion, tracking avancé, formation 45min, délai 10-12j, acompte 895€

MODALITÉS :
- Paiement échelonné : 50% commande / 40% avant mise en ligne / 10% livraison
- Délais WebBoost : 7-12 jours (vs 4-8 semaines concurrence)
- Garanties : Satisfait ou remboursé 15j, délai respecté ou remboursé
- Support : 7j/7 pendant le projet, révisions incluses selon pack

CONTEXTE MARTINIQUE :
74% de la population martiniquaise est en difficulté avec le numérique (vs 33% en métropole).
WebBoost accompagne spécifiquement les entrepreneurs locaux avec tarifs adaptés et approche pédagogique.

TON RÔLE COMMERCIAL :
1. Accueillir chaleureusement et te présenter
2. Découvrir le secteur d'activité (restaurant, commerce, services, santé, beauté, artisan)
3. Comprendre les besoins, objectifs et situation actuelle  
4. Recommander le pack le mieux adapté avec justification claire
5. Gérer les objections (prix = comparaison concurrence, délais = notre rapidité, sécurité = garanties)
6. Guider vers la commande en ligne ou contact direct Kenneson pour urgence
7. Toujours demander les coordonnées pour devis personnalisé

EXEMPLES RÉPONSES PAR SECTEUR :
- Restaurant : Pack Pro recommandé (galerie photos plats, réservation en ligne, SEO "restaurant [ville]")
- Commerce : Pack Essentiel ou Pro selon ambition (catalogue produits, optimisation locale)
- Services B2B : Pack Pro/Premium (pages services, formulaires devis, témoignages clients)

Réponds naturellement en français, sois consultative mais guide vers la vente. Mentionne les acomptes (50%) pour rassurer sur l'investissement initial."""

# Routes API
@app.get("/")
async def root():
    return {"message": "WebBoost Martinique API - Élise Chatbot OpenAI", "status": "active", "version": "2.0"}

@app.get("/api/health")
async def health():
    """Health check pour monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "WebBoost API",
        "chatbot": "Élise OpenAI",
        "emergent_available": EMERGENT_AVAILABLE
    }

@app.post("/api/chat-openai")
async def chat_with_elise(request: ChatRequest):
    """Chat avec Élise - OpenAI direct (pas de configuration utilisateur)"""
    try:
        user_message = request.message
        session_id = request.session_id or str(uuid.uuid4())
        
        # Essayer OpenAI avec emergentintegrations
        if EMERGENT_AVAILABLE:
            try:
                # Récupérer la clé (Emergent ou OpenAI selon config)
                openai_key = os.getenv("OPENAI_API_KEY", "")
                emergent_key = os.getenv("EMERGENT_LLM_KEY", "")
                
                # Utiliser OpenAI si clé configurée, sinon Emergent
                if openai_key and openai_key != "sk-votre-cle-openai-ici":
                    chat = LlmChat(
                        api_key=openai_key,
                        session_id=session_id,
                        system_message=ELISE_PERSONA
                    ).with_model("openai", request.model)
                    provider = "openai_direct"
                elif emergent_key:
                    chat = LlmChat(
                        api_key=emergent_key,
                        session_id=session_id,
                        system_message=ELISE_PERSONA
                    ).with_model("openai", request.model)
                    provider = "emergent_openai"
                else:
                    raise Exception("No API key configured")
                
                user_msg = UserMessage(text=user_message)
                elise_response = await chat.send_message(user_msg)
                
                # Sauvegarder conversation (localStorage côté client)
                return JSONResponse({
                    "reply": elise_response,
                    "model": request.model,
                    "provider": provider,
                    "personality": "elise",
                    "session_id": session_id,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "success": True
                })
                
            except Exception as e:
                print(f"AI Error: {e}")
                # Fallback vers Élise locale
                fallback_response = get_elise_local_response(user_message)
                return JSONResponse({
                    "reply": fallback_response,
                    "model": "fallback",
                    "provider": "elise_local",
                    "personality": "elise",
                    "session_id": session_id,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "success": True
                })
        else:
            # Mode fallback uniquement
            fallback_response = get_elise_local_response(user_message)
            return JSONResponse({
                "reply": fallback_response,
                "model": "fallback",
                "provider": "elise_local", 
                "personality": "elise",
                "session_id": session_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "success": True
            })
            
    except Exception as e:
        print(f"Chat Error: {e}")
        return JSONResponse({
            "reply": "Désolée, je rencontre un petit souci technique. Pouvez-vous réessayer ou me contacter directement au WhatsApp ? 📱",
            "error": str(e),
            "success": False
        }, status_code=500)

def get_elise_local_response(message):
    """Réponses Élise intelligentes en mode local"""
    text = message.lower()
    
    # Salutations
    if any(word in text for word in ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou']):
        return """Bonjour ! 😊 Je suis Élise, votre conseillère commerciale WebBoost Martinique.

Je suis spécialisée dans l'accompagnement des entreprises martiniquaises pour leur transformation digitale.

**Mes domaines d'expertise :**
🎯 Conversion digitale TPE/PME
🇲🇶 Marché martiniquais  
📱 Sites mobiles performants
💰 Optimisation ROI web

Comment puis-je vous aider avec votre projet web aujourd'hui ?"""

    # Prix/Tarifs  
    if any(word in text for word in ['prix', 'tarif', 'coût', 'combien', 'budget']):
        return """💰 **Excellente question ! Nos tarifs sont spécialement adaptés au marché martiniquais :**

**Pack Essentiel** - 890€ HT
• 3 pages professionnelles + SEO base
• Acompte : 445€ seulement
• Délai : 10 jours max

**Pack Pro** - 1 290€ HT ⭐ (Le plus populaire)
• 5-6 pages + SEO étendu + GA4  
• Acompte : 645€ seulement
• Délai : 7-10 jours max

**Pack Premium** - 1 790€ HT
• 6-8 pages + conversion + formation
• Acompte : 895€ seulement  
• Délai : 10-12 jours max

**Paiement échelonné 50/40/10 - Pour quel secteur d'activité ?**"""

    # Secteur Restaurant
    if any(word in text for word in ['restaurant', 'resto', 'cuisine', 'plat']):
        return """🍽️ **Parfait ! Les restaurants sont ma spécialité !**

Pour votre restaurant, je recommande fortement le **Pack Pro** (1 290€ HT) car il inclut :

✨ **Galerie photos optimisée** - Mettez vos plats en valeur
📱 **Système de réservation** - Plus de clients le soir
🇲🇶 **SEO local renforcé** - Apparaître dans "restaurant [votre ville]"
⭐ **Gestion avis Google** - E-réputation contrôlée

**Acompte : seulement 645€ pour commencer**

Avez-vous déjà un site web actuellement ? Combien de couverts faites-vous ?"""

    # Secteur Commerce
    if any(word in text for word in ['commerce', 'boutique', 'magasin', 'vente']):
        return """🛍️ **Excellent ! Le commerce local, c'est mon domaine !**

Selon votre ambition, 2 options parfaites :

**Pack Essentiel** (890€ HT) - Boutique physique etablie
• Site vitrine élégant + informations pratiques
• Acompte : 445€

**Pack Pro** (1 290€ HT) - Développement commercial  
• Catalogue produits + SEO local renforcé
• Acompte : 645€

**Que vendez-vous exactement ?** (vêtements, alimentaire, artisanat...)
Cela m'aidera à personnaliser mes recommandations ! 😊"""

    # Délais
    if any(word in text for word in ['délai', 'temps', 'rapidité', 'livraison', 'quand']):
        return """⚡ **Notre signature : la rapidité martiniquaise !**

Contrairement à la concurrence (6-8 semaines), nous livrons en **7 à 12 jours ouvrés maximum**.

**Pourquoi si rapide ?**
✅ Équipe 100% locale (pas de décalage horaire)
✅ Process optimisé depuis 3 ans  
✅ Communication directe WhatsApp/téléphone
✅ Pas de sous-traitance à l'étranger

**Vos délais garantis :**
• Pack Essentiel : 10 jours maximum
• Pack Pro : 7-10 jours maximum
• Pack Premium : 10-12 jours maximum

**Et c'est garanti !** Délai non respecté = remboursement intégral. 🛡️

Pour quel type d'entreprise est-ce ?"""

    # Urgence
    if any(word in text for word in ['urgent', 'vite', 'rapidement', 'asap', 'pressé']):
        return """🚨 **Urgence parfaitement comprise !**

Pour un traitement express :
📱 **Kenneson en direct** - Contact dans l'heure  
⚡ **Démarrage immédiat** si brief complet
🎯 **Priorité absolue** sur planning

**Contact urgence :** https://wa.me/596000000

**Quelle est votre situation ?**
• Lancement imminent ?
• Concurrent agressif ?
• Saison haute qui arrive ?

Je trouve la solution adaptée ! 💪"""

    # Garanties
    if any(word in text for word in ['garantie', 'sécurisé', 'remboursé', 'risque', 'confiance']):
        return """🛡️ **Toutes mes garanties personnelles :**

✅ **Satisfait ou remboursé** - 15 jours complets
✅ **Délai respecté ou remboursé** - Engagement ferme
✅ **Paiement 100% sécurisé** - Stripe certifié SSL  
✅ **Support 7j/7** pendant tout votre projet
✅ **Révisions incluses** selon votre pack
✅ **Anti-bug gratuit** - 15 jours post-livraison

**En 3 ans : 0% de remboursement demandé !** 🏆

Qu'est-ce qui vous préoccupe le plus dans votre projet ?"""

    # Services/B2B
    if any(word in text for word in ['service', 'conseil', 'b2b', 'prestation']):
        return """💼 **Services B2B ! Excellent secteur pour la conversion !**

Les entreprises de services ont souvent les **meilleurs retours** avec nos sites :

🎯 **Pack Pro recommandé** (1 290€ HT)
• Pages services détaillées et optimisées
• Formulaires de devis/contact avancés  
• Témoignages clients intégrés
• SEO "services [votre domaine] [votre ville]"

**Acompte : 645€ pour démarrer**

**Quel type de services proposez-vous ?** (conseil, maintenance, formation, expertise...)"""

    # Général/Découverte
    return """😊 **Merci de votre intérêt pour WebBoost !**

Je suis Élise, spécialisée dans l'accompagnement des entrepreneurs martiniquais pour leur transformation digitale.

**Pour mieux vous conseiller de manière personnalisée :**
• Quel type d'entreprise dirigez-vous ?
• Avez-vous un site web actuellement ?
• Quel est votre objectif principal ?

**Mon rôle :** vous trouver LA solution parfaite selon votre situation unique ! 🎯

Par quoi souhaitez-vous commencer ?"""

@app.post("/api/contact")
async def contact_form(request: ContactRequest):
    """Traitement formulaire de contact"""
    try:
        # Validation données
        contact_data = {
            "id": str(uuid.uuid4()),
            "nom": request.nom,
            "email": request.email,
            "telephone": request.telephone,
            "entreprise": request.entreprise,
            "message": request.message,
            "pack": request.pack,
            "consent": request.consent,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "source": "contact_form"
        }
        
        # TODO: Enregistrement en base de données MongoDB
        # TODO: Envoi email de confirmation
        
        # Sauvegarde locale pour l'instant
        print(f"Contact reçu: {contact_data}")
        
        return JSONResponse({
            "message": "Merci ! Élise vous contactera sous 24h ouvrées.",
            "id": contact_data["id"],
            "status": "success"
        })
        
    except Exception as e:
        print(f"Contact Error: {e}")
        return JSONResponse({
            "message": "Erreur lors de l'envoi. Contactez-nous directement au 0696 XX XX XX",
            "error": str(e),
            "status": "error"
        }, status_code=500)

@app.post("/api/order")
async def create_order(request: OrderRequest):
    """Création de commande"""
    try:
        order_data = {
            "order_number": request.order_number,
            "pack": request.pack,
            "options": request.options,
            "customer_info": request.customer_info,
            "total": request.total,
            "deposit": request.deposit,
            "status": "pending_payment",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # TODO: Intégration Stripe pour paiement
        # TODO: Envoi email confirmation
        # TODO: Sauvegarde MongoDB
        
        print(f"Commande créée: {order_data}")
        
        return JSONResponse({
            "message": "Commande créée avec succès",
            "order_number": request.order_number,
            "next_step": "payment",
            "status": "success"
        })
        
    except Exception as e:
        print(f"Order Error: {e}")
        return JSONResponse({
            "message": "Erreur lors de la création de commande",
            "error": str(e),
            "status": "error"
        }, status_code=500)

@app.get("/api/kpi")
async def get_kpi():
    """Statistiques pour dashboard"""
    try:
        # TODO: Données réelles depuis MongoDB
        return JSONResponse({
            "total_conversations": 0,
            "total_contacts": 0,
            "total_orders": 0,
            "conversion_rate": 0.0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# Point d'entrée pour 02switch (CGI/WSGI)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)