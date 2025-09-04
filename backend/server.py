import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Literal, Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient

# IMPORTANT: All backend routes must be prefixed with '/api'
API_PREFIX = "/api"

# Read Mongo URL strictly from environment
MONGO_URL = os.environ.get("MONGO_URL")

# Mongo setup (optional if MONGO_URL missing - app should still start for /api/health)
client = None
db = None
leads_col = None
chats_col = None

if MONGO_URL:
    try:
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=3000)
        db = client.get_database()
        leads_col = db.get_collection("contact_leads")
        chats_col = db.get_collection("chat_leads")
        # Create indexes lightweight
        leads_col.create_index("createdAt")
        chats_col.create_index("createdAt")
    except Exception as e:
        # Do not crash if DB not reachable; log to stdout
        print(f"[backend] Warning: Mongo connection failed: {e}")
else:
    print("[backend] Warning: MONGO_URL not set. DB features disabled.")


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


class ChatResponse(BaseModel):
    reply: str
    used_llm: bool


# FastAPI app
app = FastAPI(title="WebBoost Martinique API", version="1.0.0")

# CORS - allow all origins; in production restrict via env
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(f"{API_PREFIX}/health")
async def health():
    return {"status": "ok", "mongo": bool(db)}


@app.post(f"{API_PREFIX}/contact")
async def submit_contact(payload: ContactPayload):
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Consentement RGPD requis")
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": str(payload.email),
        "phone": payload.phone.strip(),
        "sector": (payload.sector or "").strip(),
        "pack": payload.pack,
        "message": (payload.message or "").strip(),
        "consent": payload.consent,
        "source": payload.source or "contact_form",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    if leads_col is None:
        # Accept request in memory if DB is not configured
        return JSONResponse(status_code=201, content={"saved": False, "id": doc["id"]})
    try:
        leads_col.insert_one(doc)
        return JSONResponse(status_code=201, content={"saved": True, "id": doc["id"]})
    except Exception as e:
        print(f"[backend] insert lead error: {e}")
        raise HTTPException(status_code=500, detail="Erreur d'enregistrement")


SYSTEM_PROMPT = (
    "Assistant commercial WebBoost Martinique, expert transformation numérique TPE/PME locales. "
    "Réponds uniquement sur : packs (Essentiel/Pro/Conversion), options à la carte, délais 7-12j, modalités 50/40/10, "
    "révisions incluses et supplémentaires 60€/h. Hors périmètre = proposition devis additif. "
    "Ton chaleureux martiniquais, orienté action, toujours proposer prochaine étape concrète. "
    "Références locales bienvenues."
)


def _simple_rules_reply(user_text: str) -> str:
    t = user_text.lower()
    if "prix" in t or "tarif" in t or "packs" in t or "pack" in t:
        return (
            "Nos tarifs martiniquais: Essentiel 890€ HT, Vitrine Pro 1 290€ HT, Conversion 1 790€ HT. "
            "Je peux vous conseiller le pack adapté à votre secteur. Vous préférez un devis gratuit ou parler sur WhatsApp ?"
        )
    if "paiement" in t or "50/40/10" in t:
        return (
            "Modalités: 50% à la commande, 40% avant mise en ligne (validation V2), 10% à la livraison. "
            "Souhaitez-vous que je prépare le lien d'acompte 50% ou un RDV Calendly ?"
        )
    if "whatsapp" in t:
        return "Parfait ! Je peux vous mettre en relation via WhatsApp. Quel créneau vous convient ?"
    if "délai" in t or "delai" in t or "livraison" in t:
        return "Délais garantis 7 à 12 jours ouvrés selon pack et disponibilité de vos contenus."
    return (
        "Bienvenue chez WebBoost Martinique 🇲🇶 ! Souhaitez-vous voir les prix, comprendre le paiement 50/40/10, "
        "parler sur WhatsApp, ou calculer un délai de livraison ?"
    )


# Attempt optional LLM integration via Emergent universal key if available
USE_LLM = False
try:
    # Lazy import to avoid hard dependency
    import os as _os
    EMERGENT_KEY = _os.environ.get("EMERGENT_LLM_KEY")
    if EMERGENT_KEY:
        USE_LLM = True
except Exception as _:
    USE_LLM = False


async def call_llm(messages: List[Dict[str, str]], temperature: float = 0.3) -> str:
    """Attempt to call an LLM using Emergent universal key if available; fallback to simple rules."""
    if not USE_LLM:
        # Fallback basic assistant
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        return _simple_rules_reply(last_user)

    # Try OpenAI-compatible client via environment if present
    # We don't import vendor SDKs directly as per policy; attempt minimal HTTP call via OpenAI-compatible endpoint
    try:
        import requests  # lightweight; part of std images, else raise
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
            return _simple_rules_reply(last_user)

        # Use OpenAI compatible endpoint if routed by Emergent universal key provider
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        body = {
            "model": os.environ.get("EMERGENT_LLM_MODEL", "gpt-4o-mini"),
            "messages": messages,
            "temperature": temperature,
        }
        # Default to OpenAI URL if provided by environment; else fallback local rules
        base_url = os.environ.get("EMERGENT_OPENAI_API_BASE", "https://api.openai.com/v1")
        url = f"{base_url}/chat/completions"
        resp = requests.post(url, json=body, headers=headers, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            reply = data.get("choices", [{}])[0].get("message", {}).get("content", "") or ""
            if reply.strip():
                return reply
        else:
            print(f"[backend] LLM error {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"[backend] LLM exception: {e}")

    last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    return _simple_rules_reply(last_user)


@app.post(f"{API_PREFIX}/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # Assemble messages with fixed system prompt prepended
    msgs = [{"role": "system", "content": SYSTEM_PROMPT}] + [m.model_dump() for m in req.messages]
    reply_text = await call_llm(messages=msgs, temperature=req.temperature or 0.3)

    # Save minimal chat lead (non-sensitive) if DB available
    if chats_col is not None:
        try:
            chats_col.insert_one({
                "id": str(uuid.uuid4()),
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "lastUser": next((m["content"] for m in reversed(req.messages) if m.role == "user"), ""),
                "used_llm": bool(USE_LLM),
            })
        except Exception as e:
            print(f"[backend] save chat lead error: {e}")

    return ChatResponse(reply=reply_text, used_llm=bool(USE_LLM))


@app.get(f"{API_PREFIX}/kpi")
async def kpi():
    # Very lightweight KPIs (counts), no PII
    counts = {"leads": 0, "chats": 0}
    if leads_col is not None:
        try:
            counts["leads"] = leads_col.count_documents({})
        except Exception as e:
            print(f"[backend] kpi leads error: {e}")
    if chats_col is not None:
        try:
            counts["chats"] = chats_col.count_documents({})
        except Exception as e:
            print(f"[backend] kpi chats error: {e}")
    return counts