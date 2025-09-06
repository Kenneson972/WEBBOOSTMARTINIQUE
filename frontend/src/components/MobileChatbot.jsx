import React, { useState, useEffect, useRef } from 'react'

const MobileChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showNotification, setShowNotification] = useState(true)
  const [showAIConfig, setShowAIConfig] = useState(false)
  const [aiStatus, setAiStatus] = useState('offline') // offline, emergent, openai
  const [openAIKey, setOpenAIKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  
  const messagesEndRef = useRef(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

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
    // Vérifier si une clé OpenAI est sauvegardée
    const savedKey = localStorage.getItem('openai_api_key')
    if (savedKey) {
      setOpenAIKey(savedKey)
      setAiStatus('openai')
    }

    // Séquence d'accueil automatique après 4 secondes sur mobile
    const welcomeTimer = setTimeout(() => {
      startWelcomeSequence()
    }, 4000)

    return () => clearTimeout(welcomeTimer)
  }, [])

  const startWelcomeSequence = () => {
    setIsTyping(true)
    
    setTimeout(() => {
      setIsTyping(false)
      addBotMessage(
        "Bonjour ! 👋 Je suis Élise, votre conseillère web chez WebBoost Martinique.\n\nJe vais vous aider à transformer votre activité avec un site web performant ! 🚀",
        [
          {text: "💰 Voir les prix", action: "show_pricing"},
          {text: "⚡ Délais 7-12 jours", action: "explain_timeline"}, 
          {text: "🛒 Commander maintenant", action: "start_order"},
          {text: "📱 WhatsApp urgent", action: "whatsapp_redirect"}
        ]
      )
    }, 1800)
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
  }

  const addUserMessage = (text) => {
    const newMessage = {
      id: generateUUID(),
      type: 'user', 
      text: text,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
  }

  const handleQuickReply = (text, action) => {
    addUserMessage(text)
    
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      handleAction(action)
    }, 1200)
  }

  const handleAction = (action) => {
    switch(action) {
      case 'show_pricing':
        addBotMessage(
          "💎 **Nos packs spécial Martinique** 🇲🇶\n\n**Essentiel** - 890€ HT\n• Acompte 445€ • 3 pages • 10 jours\n\n**Pro** - 1290€ HT ⭐\n• Acompte 645€ • 5-6 pages • 7-10 jours\n\n**Premium** - 1790€ HT\n• Acompte 895€ • 6-8 pages • 10-12 jours\n\n*Paiement 3x sans frais*",
          [
            {text: "🛒 Commander Essentiel", action: "order_essentiel"},
            {text: "🛒 Commander Pro", action: "order_pro"},
            {text: "🛒 Commander Premium", action: "order_premium"}
          ]
        )
        break

      case 'explain_timeline':
        addBotMessage(
          "⚡ **Délais ultra-rapides garantis !**\n\n🎯 Process optimisé local\n📋 Checklist claire fournie\n💥 Équipe martiniquaise dédiée\n🇲🇶 Pas de décalage horaire\n\n**Vos délais :**\n• Essentiel : 10 jours\n• Pro : 7-10 jours\n• Premium : 10-12 jours",
          [
            {text: "🛒 Commander maintenant", action: "show_pricing"},
            {text: "🛡️ Voir garanties", action: "show_guarantees"}
          ]
        )
        break

      case 'start_order':
        addBotMessage(
          "🛒 **Parfait ! Prêt à commander ?**\n\nPour une expérience optimale, cliquez sur le bouton **'COMMANDER'** en haut de la page.\n\nVous pourrez :\n✅ Choisir votre pack\n✅ Ajouter des options\n✅ Payer l'acompte sécurisé\n✅ Suivre votre projet",
          [
            {text: "💰 Voir les prix d'abord", action: "show_pricing"},
            {text: "📱 WhatsApp direct", action: "whatsapp_redirect"}
          ]
        )
        break

      case 'order_essentiel':
      case 'order_pro': 
      case 'order_premium':
        addBotMessage(
          "🎉 **Excellent choix !**\n\nPour finaliser votre commande, utilisez le bouton **'COMMANDER'** du site.\n\nC'est plus pratique et sécurisé ! 🔒\n\nBesoin d'aide immédiate ?",
          [
            {text: "📱 WhatsApp Kenneson", action: "whatsapp_redirect"},
            {text: "❓ J'ai des questions", action: "show_help"}
          ]
        )
        break

      case 'whatsapp_redirect':
        redirectToWhatsApp()
        break

      case 'show_guarantees':
        addBotMessage(
          "🛡️ **Nos garanties TOTALES :**\n\n✅ **Satisfait ou remboursé** - 15 jours\n✅ **Délai respecté ou remboursé**\n✅ **Paiement 100% sécurisé** - Stripe\n✅ **Support 7j/7** pendant le projet\n✅ **Révisions incluses**",
          [
            {text: "🛒 Commander en confiance", action: "show_pricing"},
            {text: "📞 Parler à Kenneson", action: "whatsapp_redirect"}
          ]
        )
        break

      case 'show_help':
        addBotMessage(
          "🤔 **Questions fréquentes :**\n\n• **Paiement** : 50% acompte, 40% avant mise en ligne, 10% livraison\n• **Délais** : Démarrent après réception de vos contenus\n• **Révisions** : Incluses selon pack\n• **Support** : Email + espace client\n\nAutre question ?",
          [
            {text: "💰 Voir les tarifs", action: "show_pricing"},
            {text: "📱 Appeler directement", action: "whatsapp_redirect"}
          ]
        )
        break

      default:
        addBotMessage(
          "🤖 **Je suis là pour vous aider !**\n\nQue souhaitez-vous savoir ?",
          [
            {text: "💰 Tarifs", action: "show_pricing"},
            {text: "⚡ Délais", action: "explain_timeline"},
            {text: "🛒 Commander", action: "start_order"},
            {text: "📱 WhatsApp", action: "whatsapp_redirect"}
          ]
        )
    }
  }

  const redirectToWhatsApp = () => {
    const message = encodeURIComponent("Bonjour Kenneson ! Je suis sur votre site WebBoost et j'aimerais discuter de mon projet web. Pouvez-vous m'appeler ?")
    const whatsappUrl = `https://wa.me/596000000?text=${message}`

    addBotMessage("📱 **Redirection WhatsApp...**\n\nVous allez parler directement avec Kenneson, notre expert web martiniquais !\n\n*Ouverture dans 3 secondes...*")

    setTimeout(() => {
      window.open(whatsappUrl, '_blank')
    }, 3000)
  }

  const sendMessage = async () => {
    if (!currentInput.trim()) return

    const userMessage = currentInput.trim()
    addUserMessage(userMessage)
    setCurrentInput('')

    setIsTyping(true)
    
    // Essayer d'abord l'IA si activée
    let aiResponse = null
    if (aiStatus !== 'offline') {
      aiResponse = await sendToAI(userMessage)
    }
    
    setTimeout(() => {
      setIsTyping(false)
      
      if (aiResponse) {
        addBotMessage(aiResponse)
      } else {
        generateOfflineResponse(userMessage.toLowerCase())
      }
    }, 1200)
  }

  const sendToAI = async (message) => {
    try {
      if (aiStatus === 'openai' && openAIKey) {
        const response = await fetch(`${BACKEND_URL}/chat/openai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            api_key: openAIKey,
            model: selectedModel
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          return data.reply
        }
      } else if (aiStatus === 'emergent') {
        const response = await fetch(`${BACKEND_URL}/chat/openai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            model: selectedModel
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          return data.reply
        }
      }
    } catch (error) {
      console.error('AI Error:', error)
    }
    
    return null
  }

  const generateOfflineResponse = (userMessage) => {
    if (userMessage.includes('prix') || userMessage.includes('tarif') || userMessage.includes('coût')) {
      handleAction('show_pricing')
    } else if (userMessage.includes('délai') || userMessage.includes('rapidité') || userMessage.includes('temps')) {
      handleAction('explain_timeline')
    } else if (userMessage.includes('whatsapp') || userMessage.includes('appel') || userMessage.includes('téléphone')) {
      handleAction('whatsapp_redirect')
    } else if (userMessage.includes('commander') || userMessage.includes('acheter') || userMessage.includes('payer')) {
      handleAction('start_order')
    } else if (userMessage.includes('garantie') || userMessage.includes('remboursé') || userMessage.includes('sécur')) {
      handleAction('show_guarantees')
    } else {
      handleAction('show_help')
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setShowNotification(false)
    }
  }

  const activateEmergentAI = () => {
    setAiStatus('emergent')
    setShowAIConfig(false)
    addBotMessage("🚀 **IA Emergent activée !**\n\nJe peux maintenant vous donner des réponses plus personnalisées et précises pour votre projet web.")
  }

  const activateOpenAI = async () => {
    if (!openAIKey.trim()) {
      alert('Veuillez entrer votre clé OpenAI')
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/config/openai-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openai_api_key: openAIKey })
      })

      if (response.ok) {
        localStorage.setItem('openai_api_key', openAIKey)
        localStorage.setItem('openai_model', selectedModel)
        setAiStatus('openai')
        setShowAIConfig(false)
        addBotMessage("🎯 **OpenAI activé !**\n\nVotre clé est validée. J'utilise maintenant l'intelligence artificielle avancée d'OpenAI.")
      } else {
        const error = await response.json()
        alert('❌ Clé invalide : ' + error.detail)
      }
    } catch (error) {
      alert('❌ Erreur : ' + error.message)
    }
  }

  const deactivateAI = () => {
    setAiStatus('offline')
    localStorage.removeItem('openai_api_key')
    setShowAIConfig(false)
    addBotMessage("📱 **Mode offline activé.**\n\nJ'utilise mes réponses rapides pré-programmées.")
  }

  return (
    <div className="chatbot-mobile-container">
      <style jsx>{`
        .chatbot-mobile-container {
          position: fixed;
          bottom: 15px;
          right: 15px;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
        }

        .chatbot-fab {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: gentle-pulse 3s infinite;
        }

        @keyframes gentle-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }

        .chatbot-fab:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(212, 175, 55, 0.5);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
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
          animation: notification-bounce 2s infinite;
        }

        @keyframes notification-bounce {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

          .chat-window {
            position: absolute;
            bottom: 75px;
            right: 0;
            width: 340px;
            height: 480px;
            background: linear-gradient(145deg, rgba(15, 15, 17, 0.98) 0%, rgba(25, 25, 30, 0.98) 100%);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            border: 2px solid rgba(212, 175, 55, 0.3);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            transform: translateY(10px) scale(0.95);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            overflow: hidden;
          }

        .chat-window.open {
          transform: translateY(0) scale(1);
          opacity: 1;
          visibility: visible;
        }

        .chat-header {
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          padding: 16px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .profile-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .elise-avatar {
          width: 42px;
          height: 42px;
          background-image: url('/WEBBOOSTMARTINIQUE/elise-avatar.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.8);
          position: relative;
        }

        .elise-avatar::after {
          content: '';
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 12px;
          height: 12px;
          background: #10B981;
          border: 2px solid white;
          border-radius: 50%;
        }

        .profile-info h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 2px 0;
          line-height: 1.2;
        }

        .profile-info p {
          font-size: 11px;
          margin: 0;
          opacity: 0.9;
          line-height: 1.2;
        }

        .ai-status {
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 2px;
        }

        .status-offline { background: rgba(107, 114, 128, 0.8); }
        .status-emergent { background: rgba(16, 185, 129, 0.8); }
        .status-openai { background: rgba(59, 130, 246, 0.8); }

        .controls-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-btn {
          background: rgba(255, 255, 255, 0.25);
          border: none;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 12px;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.35);
        }

        .messages-container {
          height: 320px;
          overflow-y: auto;
          padding: 16px;
          background: linear-gradient(180deg, #0F0F11 0%, #1A1A1E 100%);
        }

        .messages-container::-webkit-scrollbar {
          width: 4px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: rgba(212, 175, 55, 0.1);
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.4);
          border-radius: 2px;
        }

        .message-item {
          margin-bottom: 12px;
          animation: slide-up 0.3s ease;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bot-message {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .user-message {
          display: flex;
          justify-content: flex-end;
        }

        .mini-avatar {
          width: 26px;
          height: 26px;
          background-image: url('/WEBBOOSTMARTINIQUE/elise-avatar.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 1px solid rgba(212, 175, 55, 0.4);
          flex-shrink: 0;
        }

        .message-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .bot-bubble {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: white;
        }

        .user-bubble {
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          color: white;
        }

        .typing-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          margin-left: 34px;
        }

        .typing-bubble {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 10px 14px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .typing-dots {
          display: flex;
          gap: 3px;
        }

        .typing-dot {
          width: 4px;
          height: 4px;
          background: #D4AF37;
          border-radius: 50%;
          animation: typing-bounce 1.4s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing-bounce {
          0%, 60%, 100% { opacity: 0.4; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.2); }
        }

        .quick-replies-container {
          padding: 0 16px 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-height: 70px;
          overflow-y: auto;
        }

        .quick-reply-btn {
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #FBBF24;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-weight: 500;
        }

        .quick-reply-btn:hover {
          background: rgba(212, 175, 55, 0.2);
          border-color: #D4AF37;
          transform: translateY(-1px);
        }

        .ai-config-panel {
          background: rgba(20, 20, 25, 0.95);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 12px;
          padding: 12px;
          margin: 12px 16px;
          max-height: 180px;
          overflow-y: auto;
        }

        .config-title {
          color: #FBBF24;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .config-option {
          margin-bottom: 8px;
        }

        .config-input {
          width: 100%;
          padding: 6px 10px;
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(107, 114, 128, 0.5);
          color: white;
          border-radius: 6px;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .config-input:focus {
          outline: none;
          border-color: #FBBF24;
        }

        .config-btn-group {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .config-btn {
          background: linear-gradient(135deg, #D4AF37, #FBBF24);
          color: white;
          border: none;
          padding: 5px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
          min-width: 60px;
        }

        .config-btn-secondary {
          background: transparent;
          color: #D4AF37;
          border: 1px solid #D4AF37;
        }

        .input-container {
          padding: 12px 16px;
          background: #0F0F11;
          border-top: 1px solid rgba(212, 175, 55, 0.3);
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .message-input {
          flex: 1;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: white;
          padding: 10px 14px;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .message-input:focus {
          border-color: #FBBF24;
          background: rgba(212, 175, 55, 0.15);
        }

        .message-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .send-btn {
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          border: none;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: white;
        }

        .send-btn:hover {
          transform: scale(1.05);
        }

        .send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Mobile optimizations - CRITICAL FIX */
        @media (max-width: 768px) {
          .chatbot-mobile-container {
            bottom: 12px;
            right: 12px;
          }

          .chat-window {
            width: calc(100vw - 30px) !important;
            height: calc(100vh - 140px);
            bottom: 75px;
            right: 15px !important;
            left: 15px !important;
            max-width: 320px !important;
            max-height: 500px;
            position: fixed !important;
          }

          .messages-container {
            height: calc(100vh - 280px);
            min-height: 200px;
            padding: 12px;
          }

          .message-bubble {
            font-size: 12px;
            padding: 8px 12px;
            max-width: 85%;
          }

          .quick-reply-btn {
            font-size: 10px;
            padding: 5px 8px;
            border-radius: 16px;
          }

          .message-input {
            font-size: 15px; /* Important pour éviter zoom iOS */
            padding: 8px 12px;
          }

          .send-btn {
            width: 44px;
            height: 44px;
            min-width: 44px;
            min-height: 44px;
          }
        }

        @media (max-width: 480px) {
          .chatbot-mobile-container {
            bottom: 10px;
            right: 10px;
          }

          .chatbot-fab {
            width: 55px;
            height: 55px;
          }

          .notification-dot {
            width: 16px;
            height: 16px;
            font-size: 9px;
            top: 6px;
            right: 6px;
          }

          .chat-window {
            width: calc(100vw - 20px);
            height: calc(100vh - 100px);
            bottom: 70px;
            right: 10px;
            left: 10px;
            border-radius: 12px;
          }

          .messages-container {
            height: calc(100vh - 260px);
            padding: 10px;
          }

          .chat-header {
            padding: 12px;
          }

          .elise-avatar {
            width: 36px;
            height: 36px;
          }

          .profile-info h3 {
            font-size: 14px;
          }

          .profile-info p {
            font-size: 10px;
          }

          .ai-config-panel {
            margin: 8px 12px;
            padding: 10px;
            max-height: 150px;
          }

          .config-input {
            font-size: 14px;
          }
        }

        /* Landscape mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .chat-window {
            width: 70vw;
            height: calc(100vh - 60px);
            bottom: 50px;
            right: 15px;
            left: auto;
          }

          .messages-container {
            height: calc(100vh - 180px);
          }
        }
      `}</style>

      {/* Chatbot FAB */}
      <button className="chatbot-fab" onClick={toggleChat}>
        {showNotification && <div className="notification-dot">1</div>}
        <i className="fas fa-headset text-xl text-white"></i>
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header avec Élise */}
        <div className="chat-header">
          <div className="header-content">
            <div className="profile-section">
              <div className="elise-avatar"></div>
              <div className="profile-info">
                <h3>Élise - WebBoost</h3>
                <p>Conseillère web • En ligne</p>
                <div className={`ai-status ${
                  aiStatus === 'offline' ? 'status-offline' : 
                  aiStatus === 'emergent' ? 'status-emergent' : 'status-openai'
                }`}>
                  {aiStatus === 'offline' ? 'OFFLINE' : 
                   aiStatus === 'emergent' ? 'IA EMERGENT' : 'IA OPENAI'}
                </div>
              </div>
            </div>
            
            <div className="controls-section">
              <button className="control-btn" onClick={() => setShowAIConfig(!showAIConfig)}>
                <i className="fas fa-cog"></i>
              </button>
              <button className="control-btn" onClick={toggleChat}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Configuration IA (mobile optimisée) */}
        {showAIConfig && (
          <div className="ai-config-panel">
            <div className="config-title">
              <i className="fas fa-robot"></i>
              Config IA
            </div>
            
            <div className="config-option">
              <button onClick={activateEmergentAI} className="config-btn w-full mb-2">
                🚀 IA Emergent (Gratuit)
              </button>
            </div>
            
            <div className="config-option">
              <input 
                type="password"
                className="config-input"
                placeholder="Clé OpenAI (sk-...)"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
              />
              <div className="config-btn-group">
                <button onClick={activateOpenAI} className="config-btn">
                  🔑 OpenAI
                </button>
                <button onClick={deactivateAI} className="config-btn config-btn-secondary">
                  📴 Offline
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-2">
              Emergent: Gratuit • OpenAI: Vos quotas • Offline: Rapide
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-item ${msg.type === 'bot' ? 'bot-message' : 'user-message'}`}>
              {msg.type === 'bot' && <div className="mini-avatar"></div>}
              <div className={`message-bubble ${msg.type === 'bot' ? 'bot-bubble' : 'user-bubble'}`}>
                {msg.text.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    <span dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/• /g, '• ')
                    }} />
                    {idx < msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="typing-container">
              <div className="typing-bubble">
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span className="text-xs text-gray-400 ml-2">Élise tape...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies (mobile optimisées) */}
        {messages.length > 0 && messages[messages.length - 1].quickReplies && !isTyping && (
          <div className="quick-replies-container">
            {messages[messages.length - 1].quickReplies.map((reply, idx) => (
              <button 
                key={idx}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply.text, reply.action)}
              >
                {reply.text}
              </button>
            ))}
          </div>
        )}

        {/* Input zone */}
        <div className="input-container">
          <input 
            type="text"
            className="message-input"
            placeholder="Tapez ici..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            className="send-btn"
            onClick={sendMessage}
            disabled={!currentInput.trim()}
          >
            <i className="fas fa-paper-plane text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileChatbot