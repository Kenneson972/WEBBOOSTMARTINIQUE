/**
 * WebBoost Martinique - Chatbot Élise PREMIUM
 * Ajout : affichage profil + mode plein écran
 */
class EliseWebBoostChatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.isFullscreen = false;

        // Session persistante
        this.sessionId = localStorage.getItem("chat_session_id");
        if (!this.sessionId) {
            this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("chat_session_id", this.sessionId);
        }

        this.apiUrl = 'https://weboostmartinique.com/api/chat.php';
        this.whatsappNumber = '596TONVRAINUM';

        this.initializeWhenReady();
    }

    initializeWhenReady() {
        const checkDOM = () => {
            if (document.getElementById('chatbot-widget')) {
                this.init();
            } else {
                setTimeout(checkDOM, 300);
            }
        };
        checkDOM();
    }

    init() {
        this.bindElements();
        this.setupEventListeners();
        this.startEliseWelcome();
        console.log(`✅ Chatbot Élise initialisé | session_id: ${this.sessionId}`);
    }

    bindElements() {
        this.chatWidget = document.getElementById('chatbot-widget');
        this.chatPanel = document.getElementById('chat-panel');
        this.messagesContainer = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-message-btn');
        this.chatFab = document.getElementById('chat-fab');
        this.notification = document.getElementById('chat-notification');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
    }

    setupEventListeners() {
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
    }

    startEliseWelcome() {
        if (!this.messagesContainer || this.messagesContainer.children.length === 0) {
            setTimeout(() => {
                this.addEliseMessage(
                    "Bonjour ! 😊 Je suis Élise, conseillère WebBoost Martinique.\n\nComment puis-je vous aider avec votre projet web ?"
                );
            }, 1200);
        }
    }

    async sendMessage() {
        const message = this.messageInput?.value?.trim();
        if (!message || this.isTyping) return;

        this.addUserMessage(message);
        this.messageInput.value = '';
        this.showEliseTyping();

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.hideEliseTyping();

            if (data.success && data.response) {
                this.addEliseMessage(data.response);
            } else {
                throw new Error('Réponse invalide');
            }
        } catch (error) {
            console.error('💥 Erreur:', error);
            this.hideEliseTyping();
            this.addEliseMessage(
                `Désolée, petit souci technique... 😔\n\nContactez Kenneson directement :\n📱 https://wa.me/${this.whatsappNumber}`
            );
        }
    }

    addEliseMessage(text) {
        if (!this.messagesContainer) return;
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
    }

    addUserMessage(text) {
        if (!this.messagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-bubble user-bubble">
                ${this.escapeHtml(text)}
            </div>
        `;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showEliseTyping() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-message';
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

    hideEliseTyping() {
        this.isTyping = false;
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) typingElement.remove();
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    toggleChat() {
        if (!this.chatPanel) return;
        this.isOpen = !this.isOpen;
        this.chatPanel.classList.toggle('active', this.isOpen);
        this.chatWidget.classList.toggle('chat-open', this.isOpen);
        if (this.isOpen && this.messageInput) {
            this.messageInput.focus();
        }
    }

    toggleFullscreen() {
        if (!this.chatPanel) return;
        this.isFullscreen = !this.isFullscreen;
        this.chatPanel.classList.toggle('fullscreen', this.isFullscreen);
        const icon = this.fullscreenBtn.querySelector('i');
        if (this.isFullscreen) {
            icon.classList.replace('fa-expand', 'fa-compress');
        } else {
            icon.classList.replace('fa-compress', 'fa-expand');
        }
    }

    resetConversation() {
        localStorage.removeItem("chat_session_id");
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("chat_session_id", this.sessionId);
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = "";
        }
        this.startEliseWelcome();
        console.log("🔄 Session réinitialisée :", this.sessionId);
    }
}

/* ===== Fonctions globales supplémentaires ===== */
function toggleChat(event) {
    if (event) event.stopPropagation();
    if (window.eliseChatbot) {
        window.eliseChatbot.toggleChat();
    }
}

function sendChatMessage() {
    if (window.eliseChatbot) {
        window.eliseChatbot.sendMessage();
    }
}

function showEliseProfile() {
    const modal = document.getElementById('elise-profile-modal');
    if (modal) modal.classList.add('active');
}

function closeEliseProfile() {
    const modal = document.getElementById('elise-profile-modal');
    if (modal) modal.classList.remove('active');
}

/* ===== Initialisation auto ===== */
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.eliseChatbot = new EliseWebBoostChatbot();
    }, 500);
});
