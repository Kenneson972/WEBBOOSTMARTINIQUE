/**
 * WebBoost Martinique - Chatbot Élise
 * Intégration OpenAI directe (pas de configuration utilisateur)
 * Conseillère commerciale professionnelle
 */

class EliseChatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.sessionId = `session_${Date.now()}`;
        this.conversationMemory = {
            customerName: '',
            sector: '',
            budget: '',
            urgency: '',
            interests: [],
            stage: 'discovery',
            score: 0
        };
        
        this.init();
    }
    
    init() {
        this.createElements();
        this.setupEventListeners();
        this.startEliseIntroduction();
    }
    
    createElements() {
        // Les éléments sont déjà dans le HTML
        this.chatFab = document.getElementById('chat-fab');
        this.chatPanel = document.getElementById('chat-panel');
        this.messagesContainer = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.notification = document.getElementById('chat-notification');
    }
    
    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    startEliseIntroduction() {
        // Élise dit bonjour après 3 secondes
        setTimeout(() => {
            this.showTyping();
            
            setTimeout(() => {
                this.hideTyping();
                this.addEliseMessage(
                    "Bonjour ! 😊 Je suis Élise, votre conseillère commerciale WebBoost Martinique.\n\nJe suis spécialisée dans l'accompagnement des entreprises martiniquaises pour leur transformation digitale.\n\nComment puis-je vous aider avec votre projet web aujourd'hui ?"
                );
            }, 2000);
        }, 3000);
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Afficher message utilisateur
        this.addUserMessage(message);
        this.messageInput.value = '';
        
        // Élise réfléchit...
        this.showTyping();
        
        try {
            // Appel API Élise (OpenAI direct côté serveur)
            const response = await fetch('/api/chat-openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: message,
                    session_id: this.sessionId,
                    model: 'gpt-4o-mini'
                })
            });
            
            const data = await response.json();
            
            this.hideTyping();
            
            if (data.success && data.reply) {
                this.addEliseMessage(data.reply);
                this.updateConversationMemory(message, data.reply);
            } else {
                // Fallback Élise local
                const fallbackResponse = this.getEliseFallback(message);
                this.addEliseMessage(fallbackResponse);
            }
            
        } catch (error) {
            console.error('Erreur communication Élise:', error);
            this.hideTyping();
            
            // Fallback intelligent d'Élise
            const fallbackResponse = this.getEliseFallback(message);
            this.addEliseMessage(fallbackResponse);
        }
    }
    
    getEliseFallback(message) {
        const text = message.toLowerCase();
        
        // Détection d'intentions et réponses Élise
        if (text.includes('bonjour') || text.includes('salut') || text.includes('hello')) {
            return "Bonjour ! 😊 Ravie de faire votre connaissance ! Je suis Élise, votre conseillère WebBoost. Quel type d'entreprise dirigez-vous ?";
        }
        
        if (text.includes('prix') || text.includes('tarif') || text.includes('coût')) {
            return `Excellente question ! 💰 Nos tarifs sont spécialement adaptés au marché martiniquais :

**Pack Essentiel** - 890€ HT (acompte 445€)
• Parfait pour débuter • 3 pages • 10 jours

**Pack Pro** - 1 290€ HT (acompte 645€) ⭐
• Le plus populaire • 5-6 pages • 7-10 jours

**Pack Premium** - 1 790€ HT (acompte 895€)  
• Pour maximiser vos ventes • 6-8 pages • 10-12 jours

Paiement en 3 fois sans frais ! Pour quel secteur d'activité ?`;
        }
        
        if (text.includes('délai') || text.includes('temps') || text.includes('rapidité')) {
            return `⚡ **Notre signature : la rapidité !**

Contrairement à la concurrence (6-8 semaines), nous livrons en **7 à 12 jours ouvrés**.

**Pourquoi si rapide ?**
✅ Équipe 100% martiniquaise  
✅ Process optimisé depuis 3 ans
✅ Communication directe
✅ Pas de sous-traitance

**Délais garantis :**
• Pack Essentiel : 10 jours max
• Pack Pro : 7-10 jours max
• Pack Premium : 10-12 jours max

Et c'est garanti ! Délai non respecté = remboursement intégral. 🛡️`;
        }
        
        if (text.includes('restaurant') || text.includes('resto')) {
            this.conversationMemory.sector = 'restaurant';
            return `🍽️ **Parfait ! Les restaurants sont ma spécialité !**

Pour votre restaurant, je recommande vivement le **Pack Pro** (1 290€ HT) :

✨ **Galerie photos** - Mettez vos plats en valeur
📱 **Réservation en ligne** - Plus de réservations
🇲🇶 **SEO local** - "restaurant Fort-de-France"
⭐ **Avis Google** - Gérez votre e-réputation

**Acompte : seulement 645€ pour commencer**

Avez-vous déjà un site actuellement ?`;
        }
        
        if (text.includes('commerce') || text.includes('boutique') || text.includes('magasin')) {
            this.conversationMemory.sector = 'commerce';
            return `🛍️ **Excellent ! Le commerce local, c'est mon domaine !**

Selon votre ambition, 2 options :

**Pack Essentiel** (890€ HT) - Boutique physique
• Site vitrine élégant + infos pratiques  
• Acompte : 445€

**Pack Pro** (1 290€ HT) - Plus d'ambition
• Catalogue produits + SEO local renforcé
• Acompte : 645€

Que vendez-vous exactement ? Cela m'aidera à mieux vous conseiller ! 😊`;
        }
        
        if (text.includes('urgent') || text.includes('vite') || text.includes('asap')) {
            return `🚨 **Urgence comprise !**

Pour un traitement prioritaire :
📱 **Kenneson en direct** - Appel dans l'heure
⚡ **Démarrage immédiat** si brief complet  
🎯 **Livraison prioritaire** selon pack

**Contactez Kenneson :** https://wa.me/596000000

Quelle est votre situation d'urgence ?`;
        }
        
        if (text.includes('garantie') || text.includes('sécurisé') || text.includes('remboursé')) {
            return `🛡️ **Toutes mes garanties personnelles :**

✅ **Satisfait ou remboursé** - 15 jours complets
✅ **Délai respecté ou remboursé** - Engagement ferme
✅ **Paiement sécurisé** - Stripe certifié SSL
✅ **Support 7j/7** pendant votre projet  
✅ **0% remboursement** en 3 ans d'activité !

Qu'est-ce qui vous préoccupe exactement ?`;
        }
        
        // Réponse générale d'Élise
        return `😊 **Je comprends votre demande !**

Pour mieux vous conseiller de manière personnalisée :

• Quel type d'entreprise dirigez-vous ?
• Avez-vous un site web actuellement ?
• Quel est votre objectif principal ?

Mon rôle : vous trouver LA solution parfaite selon votre situation unique ! 🎯`;
    }
    
    addEliseMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message elise-message';
        
        messageDiv.innerHTML = `
            <div class="elise-avatar-small"></div>
            <div class="message-bubble elise-bubble">
                ${this.formatMessage(text)}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Sauvegarder conversation
        this.saveMessage('elise', text);
    }
    
    addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        messageDiv.innerHTML = `
            <div class="message-bubble user-bubble">
                ${text}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Sauvegarder conversation
        this.saveMessage('user', text);
    }
    
    formatMessage(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FBBF24;">$1</strong>')
            .replace(/✅/g, '<span style="color: #10B981;">✅</span>')
            .replace(/(Pack \w+)/g, '<strong style="color: #FBBF24;">$1</strong>');
    }
    
    showTyping() {
        this.isTyping = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message typing-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="elise-avatar-small"></div>
            <div class="typing-bubble">
                <div class="typing-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <span class="typing-text">Élise réfléchit...</span>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    saveMessage(type, text) {
        const conversations = JSON.parse(localStorage.getItem('elise_conversations') || '{}');
        if (!conversations[this.sessionId]) {
            conversations[this.sessionId] = {
                startTime: new Date().toISOString(),
                messages: []
            };
        }
        
        conversations[this.sessionId].messages.push({
            type: type,
            text: text,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('elise_conversations', JSON.stringify(conversations));
    }
    
    updateConversationMemory(userMessage, eliseResponse) {
        const text = userMessage.toLowerCase();
        
        // Détection secteur
        if (text.includes('restaurant')) this.conversationMemory.sector = 'restaurant';
        if (text.includes('commerce') || text.includes('boutique')) this.conversationMemory.sector = 'commerce';
        if (text.includes('service')) this.conversationMemory.sector = 'services';
        
        // Scoring automatique
        if (text.includes('prix')) this.conversationMemory.score += 2;
        if (text.includes('urgent')) this.conversationMemory.score += 5;
        if (this.conversationMemory.sector) this.conversationMemory.score += 3;
    }
}

// Fonctions globales pour l'interaction
function toggleChat() {
    const widget = document.getElementById('chatbot-widget');
    const panel = document.getElementById('chat-panel');
    const notification = document.getElementById('chat-notification');
    
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
        widget.classList.remove('chat-open');
    } else {
        panel.classList.add('active');
        widget.classList.add('chat-open');
        notification.style.display = 'none';
        
        // Focus input
        document.getElementById('message-input').focus();
    }
}

function showEliseProfile() {
    document.getElementById('elise-profile-overlay').classList.add('active');
}

function closeEliseProfile() {
    document.getElementById('elise-profile-overlay').classList.remove('active');
}

// Auto-initialisation Élise
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le chatbot Élise après chargement complet
    setTimeout(() => {
        window.eliseChatbot = new EliseChatbot();
    }, 1000);
});

// Export pour utilisation globale
window.EliseChatbot = EliseChatbot;