/**
 * WebBoost Martinique - Chatbot Élise  
 * JavaScript Vanilla pour 02switch
 * OpenAI intégré côté serveur (PHP)
 */

class EliseWebBoostChatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.messages = [];
        
        // Éléments DOM
        this.chatWidget = null;
        this.chatPanel = null;
        this.messagesContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.chatFab = null;
        this.notification = null;
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.setupEventListeners();
        this.startEliseWelcome();
    }
    
    bindElements() {
        this.chatWidget = document.getElementById('chatbot-widget');
        this.chatPanel = document.getElementById('chat-panel');
        this.messagesContainer = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-message-btn');
        this.chatFab = document.getElementById('chat-fab');
        this.notification = document.getElementById('chat-notification');
    }
    
    setupEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize input
        this.messageInput.addEventListener('input', () => {
            this.adjustInputHeight();
        });
    }
    
    startEliseWelcome() {
        // Élise dit bonjour après 3 secondes
        setTimeout(() => {
            this.showEliseTyping();
            
            setTimeout(() => {
                this.hideEliseTyping();
                this.addEliseMessage(
                    "Bonjour ! 😊 Je suis Élise, votre conseillère commerciale WebBoost Martinique.\n\nJe suis spécialisée dans l'accompagnement des entreprises martiniquaises pour leur transformation digitale.\n\nComment puis-je vous aider avec votre projet web aujourd'hui ?"
                );
            }, 2200);
        }, 3000);
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Ajouter message utilisateur
        this.addUserMessage(message);
        this.messageInput.value = '';
        this.adjustInputHeight();
        
        // Élise réfléchit...
        this.showEliseTyping();
        
        try {
            // Appel API backend PHP
            const response = await fetch('api/chat.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId,
                    model: 'gpt-4o-mini'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            this.hideEliseTyping();
            
            if (data.success && data.reply) {
                this.addEliseMessage(data.reply);
                
                // Analytics
                this.trackChatInteraction(message, data.reply, data.provider);
            } else {
                throw new Error(data.error || 'Réponse invalide');
            }
            
        } catch (error) {
            console.error('Erreur chat Élise:', error);
            this.hideEliseTyping();
            
            // Message d'erreur bienveillant d'Élise
            this.addEliseMessage(
                "Désolée, je rencontre un petit souci technique. 😔\n\nPour une réponse immédiate, n'hésitez pas à contacter Kenneson directement :\n📱 WhatsApp : https://wa.me/596000000\n\nOu réessayez dans quelques instants !"
            );
        }
    }
    
    addEliseMessage(text) {
        const messageId = `msg_${Date.now()}_${Math.random()}`;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message elise-message';
        messageElement.id = messageId;
        
        messageElement.innerHTML = `
            <div class="elise-avatar-small"></div>
            <div class="message-bubble elise-bubble">
                ${this.formatEliseMessage(text)}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Sauvegarder message
        this.saveMessage('elise', text);
        
        // Animation d'apparition
        requestAnimationFrame(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
    }
    
    addUserMessage(text) {
        const messageId = `msg_${Date.now()}_${Math.random()}`;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.id = messageId;
        
        messageElement.innerHTML = `
            <div class="message-bubble user-bubble">
                ${this.escapeHtml(text)}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Sauvegarder message
        this.saveMessage('user', text);
        
        // Animation d'apparition
        requestAnimationFrame(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
    }
    
    formatEliseMessage(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--wb-yellow);">$1</strong>')
            .replace(/✅/g, '<span style="color: var(--wb-green);">✅</span>')
            .replace(/💰|⚡|🎯|🛡️|📱|📊|🏆|🍽️|🛍️|💼|🚨/g, '<span style="font-size: 1.1em;">$&</span>')
            .replace(/(Pack \w+)/g, '<strong style="color: var(--wb-yellow);">$1</strong>')
            .replace(/(€\d+)/g, '<strong style="color: var(--wb-gold);">$1</strong>');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showEliseTyping() {
        this.isTyping = true;
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message typing-message';
        typingElement.id = 'typing-indicator';
        
        typingElement.innerHTML = `
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
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }
    
    hideEliseTyping() {
        this.isTyping = false;
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }
    
    adjustInputHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    saveMessage(type, text) {
        const message = {
            id: `msg_${Date.now()}`,
            type: type,
            text: text,
            timestamp: new Date().toISOString()
        };
        
        this.messages.push(message);
        
        // Sauvegarder en localStorage
        const conversations = JSON.parse(localStorage.getItem('elise_conversations') || '{}');
        if (!conversations[this.sessionId]) {
            conversations[this.sessionId] = {
                startTime: new Date().toISOString(),
                messages: []
            };
        }
        
        conversations[this.sessionId].messages.push(message);
        localStorage.setItem('elise_conversations', JSON.stringify(conversations));
    }
    
    trackChatInteraction(userMessage, eliseResponse, provider) {
        // Analytics Google
        if (typeof gtag === 'function') {
            gtag('event', 'chat_interaction', {
                'message_length': userMessage.length,
                'response_length': eliseResponse.length,
                'provider': provider,
                'session_id': this.sessionId
            });
        }
        
        // Console pour debug
        console.log('💬 Chat interaction:', {
            user: userMessage.substring(0, 50),
            elise: eliseResponse.substring(0, 50),
            provider: provider
        });
    }
    
    openChat() {
        this.isOpen = true;
        this.chatPanel.classList.add('active');
        this.chatWidget.classList.add('chat-open');
        this.notification.style.display = 'none';
        
        // Focus input après animation
        setTimeout(() => {
            this.messageInput.focus();
        }, 400);
        
        // Analytics
        this.trackChatInteraction('chat_opened', '', 'user_action');
    }
    
    closeChat() {
        this.isOpen = false;
        this.chatPanel.classList.remove('active');
        this.chatWidget.classList.remove('chat-open');
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
}

// Fonctions globales pour HTML
function toggleChat(event) {
    if (event) event.stopPropagation();
    window.eliseChatbot.toggleChat();
}

function sendChatMessage() {
    window.eliseChatbot.sendMessage();
}

function showEliseProfile() {
    document.getElementById('elise-profile-modal').classList.add('active');
}

function closeEliseProfile() {
    document.getElementById('elise-profile-modal').classList.remove('active');
}

// Auto-initialisation après chargement
document.addEventListener('DOMContentLoaded', function() {
    // Petite pause pour laisser le temps au CSS de charger
    setTimeout(() => {
        window.eliseChatbot = new EliseWebBoostChatbot();
        console.log('🤖 Chatbot Élise WebBoost initialisé');
    }, 1000);
});

// Export pour usage externe
window.EliseWebBoostChatbot = EliseWebBoostChatbot;