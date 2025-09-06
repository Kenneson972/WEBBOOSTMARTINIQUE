import React, { useState, useEffect, useRef } from 'react'

const OfflineChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentFlow, setCurrentFlow] = useState('welcome')
  const [showNotification, setShowNotification] = useState(true)
  const [userSession, setUserSession] = useState({
    id: generateUUID(),
    startTime: new Date(),
    messages: [],
    userData: {},
    score: 0,
    priority: 'medium'
  })
  const messagesEndRef = useRef(null)

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Séquence d'accueil automatique après 3 secondes
    const welcomeTimer = setTimeout(() => {
      startWelcomeSequence()
    }, 3000)

    return () => clearTimeout(welcomeTimer)
  }, [])

  const startWelcomeSequence = () => {
    setIsTyping(true)
    
    setTimeout(() => {
      setIsTyping(false)
      addBotMessage(
        "Bonjour ! 👋 Je suis Élise, votre conseillère web chez WebBoost Martinique.\n\nJe suis là pour vous aider à créer le site vitrine qui boostera votre activité ! 🚀",
        [
          {text: "Voir les prix spécial Martinique 💰", action: "show_pricing"},
          {text: "Comprendre les délais 7-12 jours ⚡", action: "explain_timeline"},
          {text: "Calculer mon devis personnalisé 📊", action: "start_qualification"},
          {text: "Parler directement WhatsApp 📱", action: "whatsapp_redirect"}
        ]
      )
    }, 1500)
  }

  const addBotMessage = (text, quickReplies = []) => {
    const newMessage = {
      id: generateUUID(),
      type: 'bot',
      text: text,
      timestamp: new Date(),
      quickReplies: quickReplies
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Sauvegarder dans la session
    setUserSession(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }))
  }

  const addUserMessage = (text) => {
    const newMessage = {
      id: generateUUID(),
      type: 'user', 
      text: text,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Sauvegarder dans la session
    setUserSession(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }))
  }

  const handleQuickReply = (text, action) => {
    addUserMessage(text)
    
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      handleAction(action)
    }, 1000)
  }

  const handleAction = (action) => {
    switch(action) {
      case 'show_pricing':
        addBotMessage(
          "Nos tarifs sont spécialement adaptés au marché martiniquais 🇲🇶\n\n💎 **Pack Essentiel Local** - 890€ HT\n• Parfait pour débuter (3 pages)\n• Livré en 10 jours ouvrés\n\n🏆 **Pack Vitrine Pro** - 1 290€ HT\n• Le plus populaire (5-6 pages)\n• Livré en 7-10 jours ouvrés\n\n🚀 **Pack Vitrine Conversion** - 1 790€ HT\n• Pour maximiser vos ventes (6-8 pages)\n• Livré en 10-12 jours ouvrés\n\n*Paiement en 3 fois : 50% / 40% / 10%*",
          [
            {text: "Détails Pack Essentiel", action: "pack_essentiel"},
            {text: "Détails Pack Pro", action: "pack_pro"},
            {text: "Calculer mon devis", action: "start_qualification"}
          ]
        )
        break

      case 'explain_timeline':
        addBotMessage(
          "⚡ **Pourquoi nous sommes 3x plus rapides ?**\n\n🎯 **Process optimisé** : Templates pré-conçus adaptables\n📋 **Checklist claire** : Vous savez exactement quoi fournir\n💥 **Équipe dédiée** : Pas de sous-traitance à l'étranger\n🇲🇶 **Proximité locale** : Communication directe, pas de décalage\n\n**Délais garantis :**\n• Pack Essentiel : 10 jours ouvrés\n• Pack Pro : 7-10 jours ouvrés\n• Pack Conversion : 10-12 jours ouvrés",
          [
            {text: "Démarrer mon projet", action: "start_qualification"},
            {text: "Voir les tarifs", action: "show_pricing"}
          ]
        )
        break

      case 'start_qualification':
        addBotMessage(
          "Parfait ! Je vais vous poser quelques questions pour vous recommander la solution idéale 🎯\n\n**Question 1/5 :** Quel est votre secteur d'activité ?",
          [
            {text: "Restaurant/Hôtellerie", action: "sector_restaurant"},
            {text: "Commerce/Boutique", action: "sector_commerce"},
            {text: "Services B2B", action: "sector_services"},
            {text: "Artisan/BTP", action: "sector_artisan"},
            {text: "Autre secteur", action: "sector_other"}
          ]
        )
        break

      case 'whatsapp_redirect':
        redirectToWhatsApp()
        break

      case 'pack_essentiel':
        showPackDetails('essentiel')
        break

      case 'pack_pro':
        showPackDetails('pro')
        break

      case 'pack_premium':
        showPackDetails('premium')
        break

      // Qualification flows
      case 'sector_restaurant':
        updateUserData({sector: 'restaurant'})
        askBudgetQuestion()
        break

      case 'sector_commerce':
        updateUserData({sector: 'commerce'})
        askBudgetQuestion()
        break

      case 'sector_services':
        updateUserData({sector: 'services'})
        askBudgetQuestion()
        break

      case 'sector_artisan':
        updateUserData({sector: 'artisan'})
        askBudgetQuestion()
        break

      case 'sector_other':
        updateUserData({sector: 'other'})
        askBudgetQuestion()
        break

      default:
        addBotMessage(
          "Je comprends votre question ! Pour mieux vous répondre, choisissez ce qui vous intéresse le plus :",
          [
            {text: "Voir les tarifs 💰", action: "show_pricing"},
            {text: "Comprendre les délais ⚡", action: "explain_timeline"},
            {text: "Calculer mon devis 📊", action: "start_qualification"},
            {text: "Parler sur WhatsApp 📱", action: "whatsapp_redirect"}
          ]
        )
    }
  }

  const showPackDetails = (pack) => {
    const packs = {
      'essentiel': {
        name: 'Pack Essentiel Local',
        price: '890€ HT',
        features: '✅ 3 pages optimisées\n✅ SEO local de base\n✅ Mobile-first\n✅ 1 révision incluse\n✅ Livraison 10 jours\n✅ Garantie bugs 15j'
      },
      'pro': {
        name: 'Pack Vitrine Pro', 
        price: '1 290€ HT',
        features: '✅ 5-6 pages + galerie\n✅ SEO étendu\n✅ Performance < 2,5s\n✅ Google Business Profile\n✅ 2 révisions incluses\n✅ Livraison 7-10 jours'
      },
      'premium': {
        name: 'Pack Vitrine Conversion',
        price: '1 790€ HT', 
        features: '✅ 6-8 pages + conversion\n✅ Page Réserver/Devis\n✅ Tracking avancé\n✅ Formation 45min\n✅ 2 révisions incluses\n✅ Livraison 10-12 jours'
      }
    }

    const packInfo = packs[pack]
    addBotMessage(
      `🏆 **${packInfo.name}** - ${packInfo.price}\n\n${packInfo.features}\n\n*Paiement en 3 fois sans frais*`,
      [
        {text: "C'est parfait pour moi !", action: "request_quote"},
        {text: "Voir un autre pack", action: "show_pricing"},
        {text: "Calculer mon devis", action: "start_qualification"}
      ]
    )
  }

  const askBudgetQuestion = () => {
    addBotMessage(
      "Parfait ! **Question 2/5 :** Quel est votre budget approximatif pour votre site ?",
      [
        {text: "Moins de 1000€", action: "budget_low"},
        {text: "1000-1500€", action: "budget_medium"},
        {text: "1500-2000€", action: "budget_high"},
        {text: "Plus de 2000€", action: "budget_premium"}
      ]
    )
  }

  const updateUserData = (data) => {
    setUserSession(prev => ({
      ...prev,
      userData: {...prev.userData, ...data}
    }))
  }

  const calculateLeadScore = () => {
    let score = 0
    const data = userSession.userData

    // Scoring basé sur le secteur
    const sectorScores = {
      'restaurant': 8, 'commerce': 7, 'services': 9,
      'artisan': 6, 'other': 5
    }

    if (data.sector) {
      score += sectorScores[data.sector] || 5
    }

    // Scoring basé sur le budget
    if (data.budget === 'premium') score += 10
    else if (data.budget === 'high') score += 9
    else if (data.budget === 'medium') score += 7
    else if (data.budget === 'low') score += 4

    return score
  }

  const saveLeadToStorage = () => {
    const leads = JSON.parse(localStorage.getItem('wb_leads') || '[]')
    const updatedSession = {
      ...userSession,
      score: calculateLeadScore(),
      priority: calculateLeadScore() >= 15 ? 'high' : calculateLeadScore() >= 10 ? 'medium' : 'low'
    }
    leads.push(updatedSession)
    localStorage.setItem('wb_leads', JSON.stringify(leads))
  }

  const redirectToWhatsApp = () => {
    const message = encodeURIComponent("Bonjour ! Je suis intéressé(e) par vos services WebBoost Martinique. Pouvons-nous discuter de mon projet ?")
    const whatsappUrl = `https://wa.me/596000000?text=${message}`

    addBotMessage("Parfait ! Je vous redirige vers WhatsApp pour une discussion directe 📱\n\nVous allez pouvoir parler directement avec Kenneson, notre expert web !")

    setTimeout(() => {
      window.open(whatsappUrl, '_blank')
    }, 2000)
  }

  const sendMessage = () => {
    if (!currentInput.trim()) return

    addUserMessage(currentInput)
    const userMessage = currentInput.toLowerCase()
    setCurrentInput('')

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      generateResponse(userMessage)
    }, 1500)
  }

  const generateResponse = (userMessage) => {
    if (userMessage.includes('prix') || userMessage.includes('tarif') || userMessage.includes('coût')) {
      handleAction('show_pricing')
    } else if (userMessage.includes('délai') || userMessage.includes('rapidité') || userMessage.includes('temps')) {
      handleAction('explain_timeline')
    } else if (userMessage.includes('whatsapp') || userMessage.includes('appel') || userMessage.includes('téléphone')) {
      handleAction('whatsapp_redirect')
    } else {
      addBotMessage(
        "Je comprends votre question ! Pour mieux vous répondre, choisissez ce qui vous intéresse le plus :",
        [
          {text: "Voir les tarifs 💰", action: "show_pricing"},
          {text: "Comprendre les délais ⚡", action: "explain_timeline"},
          {text: "Calculer mon devis 📊", action: "start_qualification"},
          {text: "Parler sur WhatsApp 📱", action: "whatsapp_redirect"}
        ]
      )
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setShowNotification(false)
    }
  }

  return (
    <>
      {/* Styles CSS intégrés */}
      <style jsx>{`
        .wb-chatbot-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
        }

        .wb-chat-button {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: wb-pulse 3s infinite;
        }

        @keyframes wb-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 12px 35px rgba(212, 175, 55, 0.5); }
        }

        .wb-chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 35px rgba(212, 175, 55, 0.4);
        }

        .wb-notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #EF4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: wb-notification-pulse 2s infinite;
        }

        @keyframes wb-notification-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        .wb-chat-container {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          height: 500px;
          background: linear-gradient(145deg, rgba(11, 11, 13, 0.95) 0%, rgba(26, 26, 28, 0.95) 100%);
          backdrop-filter: blur(25px);
          border-radius: 20px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
          transform: translateY(20px) scale(0.95);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .wb-chat-container.open {
          transform: translateY(0) scale(1);
          opacity: 1;
          visibility: visible;
        }

        .wb-chat-header {
          background: linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%);
          padding: 20px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .wb-chat-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: wb-shimmer 3s infinite;
        }

        @keyframes wb-shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .wb-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 18px;
        }

        .wb-chat-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .wb-chat-subtitle {
          font-size: 12px;
          opacity: 0.9;
          margin: 0;
        }

        .wb-online-status {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #10B981;
          color: white;
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
        }

        .wb-messages-area {
          height: 320px;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(180deg, #0B0B0D 0%, #1A1A1C 100%);
        }

        .wb-messages-area::-webkit-scrollbar {
          width: 4px;
        }

        .wb-messages-area::-webkit-scrollbar-track {
          background: rgba(212, 175, 55, 0.1);
        }

        .wb-messages-area::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.5);
          border-radius: 2px;
        }

        .wb-message {
          margin-bottom: 15px;
          animation: wb-slideIn 0.3s ease;
        }

        @keyframes wb-slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .wb-message-bot {
          display: flex;
          align-items: flex-start;
        }

        .wb-message-user {
          display: flex;
          justify-content: flex-end;
        }

        .wb-message-bubble {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .wb-message-bot .wb-message-bubble {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: white;
          margin-left: 8px;
        }

        .wb-message-user .wb-message-bubble {
          background: linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%);
          color: white;
        }

        .wb-quick-replies {
          padding: 0 20px 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .wb-quick-reply {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #D4AF37;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .wb-quick-reply:hover {
          background: rgba(212, 175, 55, 0.2);
          border-color: #D4AF37;
          transform: translateY(-1px);
        }

        .wb-typing-indicator {
          padding: 12px 16px;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 18px;
          margin-left: 8px;
          width: fit-content;
          margin-bottom: 15px;
        }

        .wb-typing-dots {
          display: flex;
          gap: 4px;
        }

        .wb-typing-dot {
          width: 6px;
          height: 6px;
          background: #D4AF37;
          border-radius: 50%;
          animation: wb-typing 1.5s infinite;
        }

        .wb-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .wb-typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes wb-typing {
          0%, 60%, 100% { opacity: 0.3; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.2); }
        }

        .wb-input-area {
          padding: 15px 20px;
          background: #0B0B0D;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .wb-input {
          flex: 1;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: white;
          padding: 10px 15px;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .wb-input:focus {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.15);
        }

        .wb-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .wb-send-button {
          background: linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .wb-send-button:hover {
          transform: scale(1.1);
        }

        .wb-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
          .wb-chat-container {
            width: calc(100vw - 40px);
            height: calc(100vh - 120px);
            bottom: 80px;
            right: 20px;
            left: 20px;
            border-radius: 15px;
          }

          .wb-messages-area {
            height: calc(100% - 180px);
          }

          .wb-chat-button {
            width: 55px;
            height: 55px;
          }
        }
      `}</style>

      {/* Widget */}
      <div className="wb-chatbot-widget">
        {/* Container de chat */}
        <div className={`wb-chat-container ${isOpen ? 'open' : ''}`}>
          {/* Header */}
          <div className="wb-chat-header">
            <div className="wb-online-status">En ligne</div>
            <div className="wb-avatar">É</div>
            <h3 className="wb-chat-title">Élise - WebBoost</h3>
            <p className="wb-chat-subtitle">Conseillère web • Répond en 2 min</p>
          </div>

          {/* Messages */}
          <div className="wb-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`wb-message ${msg.type === 'bot' ? 'wb-message-bot' : 'wb-message-user'}`}>
                <div className="wb-message-bubble">
                  {msg.text.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/• /g, '• ')}
                      {idx < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="wb-typing-indicator">
                <div className="wb-typing-dots">
                  <div className="wb-typing-dot"></div>
                  <div className="wb-typing-dot"></div>
                  <div className="wb-typing-dot"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length > 0 && messages[messages.length - 1].quickReplies && (
            <div className="wb-quick-replies">
              {messages[messages.length - 1].quickReplies.map((reply, idx) => (
                <button 
                  key={idx}
                  className="wb-quick-reply"
                  onClick={() => handleQuickReply(reply.text, reply.action)}
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}

          {/* Zone d'input */}
          <div className="wb-input-area">
            <input 
              type="text"
              className="wb-input"
              placeholder="Tapez votre message..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              className="wb-send-button"
              onClick={sendMessage}
              disabled={!currentInput.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9"></polygon>
              </svg>
            </button>
          </div>
        </div>

        {/* Bouton d'ouverture */}
        <button className="wb-chat-button" onClick={toggleChat}>
          {showNotification && (
            <div className="wb-notification-badge">1</div>
          )}
          <svg className="wb-chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
          </svg>
        </button>
      </div>
    </>
  )
}

export default OfflineChatbot