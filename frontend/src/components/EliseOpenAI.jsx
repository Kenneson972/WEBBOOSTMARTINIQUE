import React, { useState, useEffect, useRef } from 'react'

const EliseOpenAI = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showNotification, setShowNotification] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}`)
  
  const messagesEndRef = useRef(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Élise se présente automatiquement après 3 secondes
    const timer = setTimeout(() => {
      eliseIntroduction()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const eliseIntroduction = () => {
    setIsTyping(true)
    
    setTimeout(() => {
      setIsTyping(false)
      addEliseMessage(
        "Bonjour ! 😊 Je suis Élise, votre conseillère commerciale WebBoost Martinique.\n\nJe suis spécialisée dans l'accompagnement des entreprises locales pour leur transformation digitale.\n\nComment puis-je vous aider avec votre projet web aujourd'hui ?"
      )
    }, 2000)
  }

  const addEliseMessage = (text) => {
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type: 'elise',
      text: text,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Sauvegarder la conversation
    saveConversation(newMessage)
  }

  const addUserMessage = (text) => {
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type: 'user',
      text: text,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    saveConversation(newMessage)
  }

  const saveConversation = (message) => {
    const conversations = JSON.parse(localStorage.getItem('elise_conversations') || '{}')
    if (!conversations[sessionId]) {
      conversations[sessionId] = {
        startTime: new Date().toISOString(),
        messages: []
      }
    }
    conversations[sessionId].messages.push(message)
    localStorage.setItem('elise_conversations', JSON.stringify(conversations))
  }

  const sendToElise = async (userMessage) => {
    try {
      const response = await fetch(`${BACKEND_URL}/chat-openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          model: 'gpt-4o-mini'
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.reply
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur serveur')
      }
    } catch (error) {
      console.error('Erreur communication Élise:', error)
      
      // Fallback intelligent d'Élise
      return getEliseIntelligentFallback(userMessage)
    }
  }

  const getEliseIntelligentFallback = (userMessage) => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('prix') || message.includes('tarif')) {
      return "Je vois que vous vous intéressez aux tarifs ! 💰 Nos packs vont de 890€ à 1790€ HT. Pour vous conseiller au mieux, pouvez-vous me dire quel type d'entreprise vous dirigez ?"
    }
    
    if (message.includes('délai') || message.includes('temps')) {
      return "Excellente question ! ⚡ Nous livrons en 7-12 jours contre 6-8 semaines ailleurs. C'est notre signature ! Dans quel délai souhaiteriez-vous avoir votre site ?"
    }
    
    if (message.includes('restaurant') || message.includes('resto')) {
      return "🍽️ Parfait ! Les restaurants représentent 40% de notre clientèle. Notre Pack Pro à 1290€ HT est idéal avec la galerie photos pour vos plats. Combien de couverts faites-vous ?"
    }
    
    if (message.includes('commerce') || message.includes('boutique')) {
      return "🛍️ Super ! Pour un commerce, nos Packs Essentiel ou Pro sont parfaits selon votre ambition. Vendez-vous plutôt des produits ou des services ?"
    }
    
    return "😊 Je comprends votre demande ! Pour mieux vous conseiller, pouvez-vous me parler de votre activité ? (restaurant, commerce, services...)"
  }

  const sendMessage = async () => {
    if (!currentInput.trim()) return

    const userMessage = currentInput.trim()
    addUserMessage(userMessage)
    setCurrentInput('')

    setIsTyping(true)
    
    // Délai réaliste d'Élise qui réfléchit
    setTimeout(async () => {
      const eliseResponse = await sendToElise(userMessage)
      setIsTyping(false)
      addEliseMessage(eliseResponse)
    }, 1800)
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setShowNotification(false)
    }
  }

  const showEliseProfile = () => {
    setShowProfile(true)
  }

  const closeProfile = () => {
    setShowProfile(false)
  }

  return (
    <>
      {/* Profil Élise en overlay */}
      {showProfile && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeProfile}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-yellow-400/40 max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header profil */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 text-center relative">
              <button 
                onClick={closeProfile}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
              <img 
                src="/WEBBOOSTMARTINIQUE/elise-avatar.jpg" 
                alt="Élise Morel"
                className="w-20 h-20 rounded-full border-4 border-white mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-gray-900">Élise Morel</h3>
              <p className="text-gray-800 font-medium">Conseillère Commerciale WebBoost</p>
            </div>
            
            {/* Stats */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/30">
                  <div className="text-xl font-bold text-yellow-400">3 ans</div>
                  <div className="text-xs text-gray-300">expérience</div>
                </div>
                <div className="text-center bg-green-400/10 rounded-lg p-3 border border-green-400/30">
                  <div className="text-xl font-bold text-green-400">95%</div>
                  <div className="text-xs text-gray-300">satisfaits</div>
                </div>
                <div className="text-center bg-blue-400/10 rounded-lg p-3 border border-blue-400/30">
                  <div className="text-xl font-bold text-blue-400">180+</div>
                  <div className="text-xs text-gray-300">sites livrés</div>
                </div>
              </div>
              
              {/* Expertise */}
              <div className="mb-4">
                <h4 className="text-lg font-bold text-yellow-400 mb-2">💼 Mes spécialités</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>🎯 Conversion digitale TPE/PME</li>
                  <li>🇲🇶 Expertise marché martiniquais</li>
                  <li>📱 Sites mobiles haute performance</li>
                  <li>💰 Optimisation ROI digital</li>
                </ul>
              </div>
              
              {/* Citation */}
              <div className="bg-yellow-400/10 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm italic text-gray-200">
                  "J'accompagne chaque entrepreneur martiniquais avec une approche 100% personnalisée. Mon objectif : transformer votre vision en succès digital mesurable."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS optimisés */}
      <style jsx>{`
        .elise-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
        }

        .elise-fab {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.5);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: elise-pulse 3s infinite;
        }

        @keyframes elise-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 8px 30px rgba(212, 175, 55, 0.5);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 12px 40px rgba(212, 175, 55, 0.7);
          }
        }

        .elise-fab:hover {
          transform: scale(1.05);
          box-shadow: 0 15px 45px rgba(212, 175, 55, 0.6);
        }

        .elise-photo {
          width: 50px;
          height: 50px;
          background-image: url('/WEBBOOSTMARTINIQUE/elise-avatar.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.9);
          cursor: pointer;
          position: relative;
        }

        .elise-photo::after {
          content: '';
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: #10B981;
          border: 2px solid white;
          border-radius: 50%;
          animation: online-pulse 2s infinite;
        }

        @keyframes online-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .notification-ping {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #EF4444;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ping-animation 2s infinite;
        }

        @keyframes ping-animation {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        .elise-chat-panel {
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 380px;
          height: 520px;
          background: linear-gradient(145deg, rgba(15, 15, 17, 0.98) 0%, rgba(25, 25, 30, 0.98) 100%);
          backdrop-filter: blur(25px);
          border-radius: 20px;
          border: 2px solid rgba(212, 175, 55, 0.4);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
          transform: translateY(20px) scale(0.94);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          overflow: hidden;
        }

        .elise-chat-panel.active {
          transform: translateY(0) scale(1);
          opacity: 1;
          visibility: visible;
        }

        .elise-header {
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          padding: 20px;
          color: white;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .elise-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: header-shimmer 4s infinite;
        }

        @keyframes header-shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .elise-profile-section {
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .elise-profile-section:hover {
          transform: translateX(-2px);
        }

        .elise-header-photo {
          width: 50px;
          height: 50px;
          background-image: url('/WEBBOOSTMARTINIQUE/elise-avatar.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.8);
          position: relative;
        }

        .elise-header-photo::after {
          content: '';
          position: absolute;
          bottom: 0px;
          right: 0px;
          width: 14px;
          height: 14px;
          background: #10B981;
          border: 2px solid white;
          border-radius: 50%;
        }

        .elise-info h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px 0;
          line-height: 1.2;
        }

        .elise-info p {
          font-size: 12px;
          margin: 0;
          opacity: 0.95;
          line-height: 1.3;
        }

        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.25);
          border: none;
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: rotate(90deg);
        }

        .chat-messages {
          height: 360px;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(180deg, #0F0F11 0%, #1A1A1E 100%);
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: rgba(212, 175, 55, 0.1);
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.4);
          border-radius: 3px;
        }

        .message-row {
          margin-bottom: 16px;
          animation: message-appear 0.4s ease;
        }

        @keyframes message-appear {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .elise-msg {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .user-msg {
          display: flex;
          justify-content: flex-end;
        }

        .elise-avatar {
          width: 30px;
          height: 30px;
          background-image: url('/WEBBOOSTMARTINIQUE/elise-avatar.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 2px solid rgba(212, 175, 55, 0.4);
          flex-shrink: 0;
        }

        .msg-bubble {
          max-width: 85%;
          padding: 14px 18px;
          border-radius: 20px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          position: relative;
        }

        .elise-bubble {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: white;
        }

        .elise-bubble::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 15px;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-right: 8px solid rgba(212, 175, 55, 0.4);
        }

        .user-bubble {
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          color: white;
        }

        .user-bubble::before {
          content: '';
          position: absolute;
          right: -8px;
          top: 15px;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-left: 8px solid #D4AF37;
        }

        .typing-section {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          margin-left: 40px;
        }

        .typing-bubble {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          padding: 12px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dots {
          display: flex;
          gap: 4px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: #FBBF24;
          border-radius: 50%;
          animation: dot-pulse 1.5s infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.3s; }
        .dot:nth-child(3) { animation-delay: 0.6s; }

        @keyframes dot-pulse {
          0%, 60%, 100% { opacity: 0.4; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1.2); }
        }

        .input-zone {
          padding: 16px 20px;
          background: #0F0F11;
          border-top: 1px solid rgba(212, 175, 55, 0.3);
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .elise-input {
          flex: 1;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: white;
          padding: 12px 18px;
          border-radius: 25px;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
        }

        .elise-input:focus {
          border-color: #FBBF24;
          background: rgba(212, 175, 55, 0.18);
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .elise-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .send-btn {
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          border: none;
          border-radius: 50%;
          width: 46px;
          height: 46px;
          min-width: 46px;
          min-height: 46px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: white;
        }

        .send-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        .send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .elise-widget {
            bottom: 15px;
            right: 15px;
          }

          .elise-chat-panel {
            width: calc(100vw - 30px);
            height: calc(100vh - 140px);
            bottom: 85px;
            right: 15px;
            left: 15px;
            max-height: 600px;
          }

          .chat-messages {
            height: calc(100vh - 320px);
            padding: 16px;
            min-height: 250px;
          }

          .elise-fab {
            width: 60px;
            height: 60px;
          }

          .elise-photo {
            width: 42px;
            height: 42px;
          }

          .msg-bubble {
            max-width: 90%;
            padding: 12px 16px;
            font-size: 13px;
          }

          .elise-input {
            padding: 10px 16px;
            font-size: 15px;
          }

          .send-btn {
            width: 44px;
            height: 44px;
            min-width: 44px;
            min-height: 44px;
          }
        }

        @media (max-width: 480px) {
          .elise-widget {
            bottom: 12px;
            right: 12px;
          }

          .elise-chat-panel {
            width: calc(100vw - 24px);
            height: calc(100vh - 120px);
            bottom: 75px;
            right: 12px;
            left: 12px;
          }

          .elise-fab {
            width: 56px;
            height: 56px;
          }

          .elise-photo {
            width: 38px;
            height: 38px;
          }

          .chat-messages {
            height: calc(100vh - 300px);
            padding: 12px;
          }

          .elise-header {
            padding: 16px;
          }

          .elise-header-photo {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>

      {/* Widget Élise OpenAI */}
      <div className="elise-widget">
        {/* Panel de chat */}
        <div className={`elise-chat-panel ${isOpen ? 'active' : ''}`}>
          {/* Header Élise (cliquable pour profil) */}
          <div className="elise-header" onClick={showEliseProfile}>
            <button className="close-btn" onClick={(e) => {e.stopPropagation(); toggleChat()}}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="elise-profile-section">
              <div className="elise-header-photo"></div>
              <div className="elise-info">
                <h3>Élise Morel</h3>
                <p>Conseillère WebBoost Martinique<br />Spécialiste conversion digitale</p>
              </div>
            </div>
          </div>

          {/* Zone messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className="message-row">
                {msg.type === 'elise' ? (
                  <div className="elise-msg">
                    <div className="elise-avatar"></div>
                    <div className="msg-bubble elise-bubble">
                      {msg.text.split('\n').map((line, idx) => (
                        <React.Fragment key={idx}>
                          <span dangerouslySetInnerHTML={{
                            __html: line
                              .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FBBF24;">$1</strong>')
                              .replace(/✅/g, '<span style="color: #10B981;">✅</span>')
                              .replace(/💰|⚡|🎯|🛡️|📱|📊|🏆|🍽️|🛍️|💼/g, '<span style="font-size: 16px;">$&</span>')
                          }} />
                          {idx < msg.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="user-msg">
                    <div className="msg-bubble user-bubble">
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Élise en train de taper */}
            {isTyping && (
              <div className="typing-section">
                <div className="elise-avatar"></div>
                <div className="typing-bubble">
                  <div className="dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                  <span style={{fontSize: '11px', color: '#9CA3AF', marginLeft: '8px'}}>
                    Élise réfléchit...
                  </span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone input */}
          <div className="input-zone">
            <input 
              type="text"
              className="elise-input"
              placeholder="Tapez votre message à Élise..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              className="send-btn"
              onClick={sendMessage}
              disabled={!currentInput.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>

        {/* FAB Élise */}
        <button className="elise-fab" onClick={toggleChat}>
          {showNotification && (
            <div className="notification-ping">1</div>
          )}
          <div className="elise-photo" title="Parler à Élise - Conseillère WebBoost"></div>
        </button>
      </div>
    </>
  )
}

export default EliseOpenAI