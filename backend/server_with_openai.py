from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
import os
import uuid
import json
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta
import orjson
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="WebBoost Martinique API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Database connection
MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    raise Exception("MONGO_URL environment variable is required")

client = MongoClient(MONGO_URL)
db = client.get_database()

# Pydantic models
class ContactPayload(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=6, max_length=25)
    sector: Optional[str] = Field(None, max_length=80)
    pack: Optional[Literal["Essentiel Local", "Vitrine Pro", "Vitrine Conversion"]] = None
    message: Optional[str] = Field(None, max_length=2000)
    consent: bool = Field(..., description="RGPD consent")
    source: Optional[str] = Field("contact_form", max_length=60)


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.3


class OpenAIChatRequest(BaseModel):
    message: str
    api_key: Optional[str] = None
    model: Optional[str] = "gpt-4o-mini"


class APIKeyConfig(BaseModel):
    openai_api_key: Optional[str] = None


# Initialize emergentintegrations for LLM
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False
    print("Warning: emergentintegrations not available")

# Health check endpoint
@app.get("/api/health")
async def health_check():
    try:
        # Test database connection
        server_info = client.server_info()
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "database": "connected",
            "mongo_version": server_info.get("version", "unknown")
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")


# Contact form endpoint
@app.post("/api/contact")
async def submit_contact(payload: ContactPayload):
    try:
        contact_data = {
            "id": str(uuid.uuid4()),
            "name": payload.name,
            "email": payload.email,
            "phone": payload.phone,
            "sector": payload.sector,
            "pack": payload.pack,
            "message": payload.message,
            "consent": payload.consent,
            "source": payload.source,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "new"
        }
        
        result = db.contacts.insert_one(contact_data)
        
        return {
            "success": True,
            "message": "Contact submitted successfully",
            "id": contact_data["id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save contact: {str(e)}")


# Original fallback chat endpoint (keeping for compatibility)
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        user_message = request.messages[-1].content if request.messages else ""
        
        # Try Emergent LLM first
        if EMERGENT_AVAILABLE:
            try:
                emergent_key = os.getenv("EMERGENT_LLM_KEY")
                if emergent_key:
                    chat = LlmChat(
                        api_key=emergent_key,
                        session_id=str(uuid.uuid4()),
                        system_message="Tu es l'assistant WebBoost Martinique. Réponds en français de manière professionnelle et locale."
                    ).with_model("openai", "gpt-4o-mini")
                    
                    user_msg = UserMessage(text=user_message)
                    response = await chat.send_message(user_msg)
                    
                    # Store in database
                    chat_data = {
                        "id": str(uuid.uuid4()),
                        "message": user_message,
                        "response": response,
                        "model": "gpt-4o-mini",
                        "provider": "emergent",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    db.chats.insert_one(chat_data)
                    
                    return {"reply": response, "used_llm": True, "provider": "emergent"}
            except Exception as e:
                print(f"Emergent LLM failed: {e}")
        
        # Fallback responses
        fallback_responses = {
            "bonjour": "Bienvenue chez WebBoost Martinique 🇲🇶 ! Souhaitez-vous voir les prix, comprendre le paiement 50/40/10, parler sur WhatsApp, ou calculer un délai de livraison ?",
            "prix": "Nos packs : Essentiel Local (890€ HT), Vitrine Pro (1290€ HT), Vitrine Conversion (1790€ HT). Paiement échelonné 50/40/10 possible.",
            "paiement": "Modalités 50/40/10 : 50% à la commande, 40% avant mise en ligne, 10% à la livraison. Révisions incluses selon le pack choisi.",
            "délai": "Délais selon pack : Essentiel (7-10j), Pro (7-10j), Conversion (10-12j). Délais déclenchés à réception complète de vos contenus.",
            "whatsapp": "Contactez-nous directement sur WhatsApp pour un échange personnalisé : https://wa.me/596000000"
        }
        
        response_text = "Je suis l'assistant WebBoost Martinique. Comment puis-je vous aider avec votre projet web ?"
        message_lower = user_message.lower()
        
        for keyword, response in fallback_responses.items():
            if keyword in message_lower:
                response_text = response
                break
        
        # Store fallback in database
        chat_data = {
            "id": str(uuid.uuid4()),
            "message": user_message,
            "response": response_text,
            "model": "fallback",
            "provider": "local",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.chats.insert_one(chat_data)
        
        return {"reply": response_text, "used_llm": False, "provider": "fallback"}
        
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Chat service temporarily unavailable")


# NEW OpenAI Chat endpoint with API key configuration
@app.post("/api/chat/openai")
async def openai_chat_endpoint(request: OpenAIChatRequest):
    """
    OpenAI Chat endpoint - allows user to provide their own API key
    """
    try:
        # Try user-provided API key first, then environment variable
        api_key = request.api_key or os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            # Try Emergent LLM as fallback
            if EMERGENT_AVAILABLE:
                emergent_key = os.getenv("EMERGENT_LLM_KEY")
                if emergent_key:
                    chat = LlmChat(
                        api_key=emergent_key,
                        session_id=str(uuid.uuid4()),
                        system_message="Tu es l'assistant WebBoost Martinique. Réponds en français de manière professionnelle et adaptée au marché martiniquais. Sois concis et utile."
                    ).with_model("openai", request.model)
                    
                    user_msg = UserMessage(text=request.message)
                    response = await chat.send_message(user_msg)
                    
                    # Store in database
                    chat_data = {
                        "id": str(uuid.uuid4()),
                        "message": request.message,
                        "response": response,
                        "model": request.model,
                        "provider": "emergent",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    db.chats.insert_one(chat_data)
                    
                    return {
                        "reply": response, 
                        "model": request.model, 
                        "provider": "emergent",
                        "success": True
                    }
            
            raise HTTPException(
                status_code=400, 
                detail="Aucune clé API OpenAI fournie. Veuillez fournir votre clé API OpenAI ou configurer OPENAI_API_KEY dans l'environnement."
            )
        
        # Use emergentintegrations with OpenAI API key
        if EMERGENT_AVAILABLE:
            try:
                chat = LlmChat(
                    api_key=api_key,
                    session_id=str(uuid.uuid4()),
                    system_message="Tu es l'assistant WebBoost Martinique. Réponds en français de manière professionnelle et adaptée au marché martiniquais. Sois concis et utile."
                ).with_model("openai", request.model)
                
                user_msg = UserMessage(text=request.message)
                response = await chat.send_message(user_msg)
                
                # Store in database
                chat_data = {
                    "id": str(uuid.uuid4()),
                    "message": request.message,
                    "response": response,
                    "model": request.model,
                    "provider": "openai",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "api_key_used": "provided" if request.api_key else "environment"
                }
                db.chats.insert_one(chat_data)
                
                return {
                    "reply": response, 
                    "model": request.model, 
                    "provider": "openai",
                    "success": True
                }
                
            except Exception as e:
                error_msg = str(e)
                if "api key" in error_msg.lower() or "authentication" in error_msg.lower():
                    raise HTTPException(status_code=401, detail="Clé API OpenAI invalide. Vérifiez votre clé API.")
                elif "quota" in error_msg.lower() or "billing" in error_msg.lower():
                    raise HTTPException(status_code=429, detail="Quota OpenAI dépassé. Vérifiez votre compte OpenAI.")
                else:
                    raise HTTPException(status_code=500, detail=f"Erreur OpenAI: {error_msg}")
        else:
            raise HTTPException(status_code=503, detail="Service LLM non disponible")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"OpenAI chat error: {e}")
        raise HTTPException(status_code=500, detail="Service de chat temporairement indisponible")


# API Key configuration endpoint
@app.post("/api/config/openai-key")
async def configure_openai_key(config: APIKeyConfig):
    """
    Endpoint to test and configure OpenAI API key
    """
    if not config.openai_api_key:
        raise HTTPException(status_code=400, detail="Clé API OpenAI requise")
    
    try:
        # Test the API key with a simple request
        if EMERGENT_AVAILABLE:
            chat = LlmChat(
                api_key=config.openai_api_key,
                session_id=str(uuid.uuid4()),
                system_message="Réponds juste 'Test réussi' en français."
            ).with_model("openai", "gpt-4o-mini")
            
            user_msg = UserMessage(text="Test")
            response = await chat.send_message(user_msg)
            
            return {
                "success": True,
                "message": "Clé API OpenAI validée avec succès",
                "test_response": response
            }
        else:
            raise HTTPException(status_code=503, detail="Service de validation non disponible")
            
    except Exception as e:
        error_msg = str(e)
        if "api key" in error_msg.lower() or "authentication" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Clé API OpenAI invalide")
        else:
            raise HTTPException(status_code=500, detail=f"Erreur de validation: {error_msg}")


# KPI endpoint
@app.get("/api/kpi")
async def get_kpi():
    try:
        total_contacts = db.contacts.count_documents({})
        total_chats = db.chats.count_documents({})
        
        # Recent activity (last 7 days)
        recent_contacts = db.contacts.count_documents({
            "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()}
        })
        
        return {
            "total_leads": total_contacts,
            "total_chats": total_chats,
            "recent_leads": recent_contacts,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch KPI: {str(e)}")


# Get available OpenAI models
@app.get("/api/models/openai")
async def get_openai_models():
    """
    Return available OpenAI models
    """
    return {
        "models": [
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "description": "Rapide et économique"},
            {"id": "gpt-4o", "name": "GPT-4o", "description": "Modèle principal d'OpenAI"},
            {"id": "gpt-4", "name": "GPT-4", "description": "Modèle GPT-4 standard"},
            {"id": "gpt-5", "name": "GPT-5", "description": "Dernier modèle OpenAI (si disponible)"}
        ],
        "default": "gpt-4o-mini"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)