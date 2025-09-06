import React, { useState, useEffect, useRef } from 'react'

const AdvancedChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showNotification, setShowNotification] = useState(true)
  const [showAIConfig, setShowAIConfig] = useState(false)
  const [useOpenAI, setUseOpenAI] = useState(false)
  const [openAIKey, setOpenAIKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [aiStatus, setAiStatus] = useState('offline') // offline, emergent, openai
  
  const messagesEndRef = useRef(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  const [userSession, setUserSession] = useState({
    id: generateUUID(),
    startTime: new Date(),
    messages: [],
    userData: {},
    score: 0,
    priority: 'medium'
  })

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
      setUseOpenAI(true)
      setAiStatus('openai')
    }

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
        "Bonjour ! 👋 Je suis Élise, votre conseillère web chez WebBoost Martinique.\n\nJe suis là pour vous aider à créer le site vitrine qui boostera votre activité ! 🚀\n\n💡 Cliquez sur ⚙️ pour activer l'IA avancée",
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
          "Nos tarifs sont spécialement adaptés au marché martiniquais 🇲🇶\n\n💎 **Pack Essentiel Local** - 890€ HT\n• Parfait pour débuter (3 pages)\n• Acompte 445€ seulement\n• Livré en 10 jours ouvrés\n\n🏆 **Pack Vitrine Pro** - 1 290€ HT\n• Le plus populaire (5-6 pages)\n• Acompte 645€ seulement\n• Livré en 7-10 jours ouvrés\n\n🚀 **Pack Vitrine Conversion** - 1 790€ HT\n• Pour maximiser vos ventes (6-8 pages)\n• Acompte 895€ seulement\n• Livré en 10-12 jours ouvrés\n\n*Paiement en 3 fois sans frais*",
          [
            {text: "Commander Pack Essentiel", action: "order_essentiel"},
            {text: "Commander Pack Pro", action: "order_pro"},
            {text: "Commander Pack Premium", action: "order_premium"}
          ]
        )
        break

      case 'explain_timeline':
        addBotMessage(
          "⚡ **Pourquoi nous sommes 3x plus rapides ?**\n\n🎯 **Process optimisé** : Templates pré-conçus adaptables\n📋 **Checklist claire** : Vous savez exactement quoi fournir\n💥 **Équipe dédiée** : Pas de sous-traitance à l'étranger\n🇲🇶 **Proximité locale** : Communication directe, pas de décalage\n\n**Délais garantis :**\n• Pack Essentiel : 10 jours ouvrés\n• Pack Pro : 7-10 jours ouvrés\n• Pack Conversion : 10-12 jours ouvrés",
          [
            {text: "Commander maintenant", action: "show_pricing"},
            {text: "Voir les garanties", action: "show_guarantees"}
          ]
        )
        break

      case 'start_qualification':
        addBotMessage(
          "Parfait ! Je vais vous poser quelques questions pour vous recommander la solution idéale 🎯\n\n**Question 1/3 :** Quel est votre secteur d'activité ?",
          [
            {text: "Restaurant/Hôtellerie", action: "sector_restaurant"},
            {text: "Commerce/Boutique", action: "sector_commerce"},
            {text: "Services B2B", action: "sector_services"},
            {text: "Artisan/BTP", action: "sector_artisan"}
          ]
        )
        break

      case 'whatsapp_redirect':
        redirectToWhatsApp()
        break

      case 'order_essentiel':
      case 'order_pro': 
      case 'order_premium':
        const pack = action.split('_')[1]
        addBotMessage(
          "Excellent choix ! 🎉\n\nPour commander, cliquez sur le bouton 'COMMANDER' en haut de la page. Vous pourrez :\n\n✅ Configurer votre pack\n✅ Ajouter des options\n✅ Payer l'acompte sécurisé\n✅ Suivre votre projet\n\nVous préférez discuter d'abord ?",
          [
            {text: "Oui, des questions d'abord", action: "start_qualification"},
            {text: "WhatsApp immédiat", action: "whatsapp_redirect"}
          ]
        )
        break

      case 'show_guarantees':
        addBotMessage(
          "🛡️ **Nos garanties TOTALES :**\n\n✅ **Satisfait ou remboursé** - 15 jours\n✅ **Délai respecté ou remboursé** - Engagement ferme\n✅ **Paiement 100% sécurisé** - SSL + Stripe\n✅ **Support 7j/7** inclus pendant le projet\n✅ **Révisions incluses** selon votre pack\n✅ **Garantie bugs** - 15 jours post-livraison",
          [
            {text: "Commander en toute confiance", action: "show_pricing"},
            {text: "Calculer mon devis", action: "start_qualification"}
          ]
        )
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

  const redirectToWhatsApp = () => {
    const message = encodeURIComponent("Bonjour Kenneson ! Je suis intéressé(e) par vos services WebBoost Martinique. Pouvons-nous discuter de mon projet ?")
    const whatsappUrl = `https://wa.me/596000000?text=${message}`

    addBotMessage("Parfait ! Je vous redirige vers WhatsApp pour une discussion directe 📱\n\nVous allez pouvoir parler directement avec Kenneson, notre expert web !")

    setTimeout(() => {
      window.open(whatsappUrl, '_blank')
    }, 2000)
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
        // Fallback vers les réponses intelligentes offline
        generateOfflineResponse(userMessage.toLowerCase())
      }
    }, 1000)
  }

  const generateOfflineResponse = (userMessage) => {
    if (userMessage.includes('prix') || userMessage.includes('tarif') || userMessage.includes('coût')) {
      handleAction('show_pricing')
    } else if (userMessage.includes('délai') || userMessage.includes('rapidité') || userMessage.includes('temps')) {
      handleAction('explain_timeline')
    } else if (userMessage.includes('whatsapp') || userMessage.includes('appel') || userMessage.includes('téléphone')) {
      handleAction('whatsapp_redirect')
    } else if (userMessage.includes('garantie') || userMessage.includes('remboursé') || userMessage.includes('sécur')) {
      handleAction('show_guarantees')
    } else {
      handleAction('default')
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setShowNotification(false)
    }
  }

  const toggleAIConfig = () => {
    setShowAIConfig(!showAIConfig)
  }

  const activateEmergentAI = () => {
    setAiStatus('emergent')
    setUseOpenAI(false)
    setShowAIConfig(false)
    addBotMessage("🚀 IA Emergent activée ! Je peux maintenant vous donner des réponses plus personnalisées et précises.")
  }

  const activateOpenAI = async () => {
    if (!openAIKey.trim()) {
      alert('Veuillez entrer votre clé OpenAI')
      return
    }

    try {
      // Test de la clé
      const response = await fetch(`${BACKEND_URL}/config/openai-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openai_api_key: openAIKey })
      })

      if (response.ok) {
        localStorage.setItem('openai_api_key', openAIKey)
        localStorage.setItem('openai_model', selectedModel)
        setAiStatus('openai')
        setUseOpenAI(true)
        setShowAIConfig(false)
        addBotMessage("🎯 OpenAI activé ! Votre clé est validée. Je peux maintenant utiliser l'intelligence artificielle avancée pour vous aider.")
      } else {
        const error = await response.json()
        alert('Clé OpenAI invalide : ' + error.detail)
      }
    } catch (error) {
      alert('Erreur de validation : ' + error.message)
    }
  }

  const deactivateAI = () => {
    setAiStatus('offline')
    setUseOpenAI(false)
    localStorage.removeItem('openai_api_key')
    localStorage.removeItem('openai_model')
    setShowAIConfig(false)
    addBotMessage("Mode offline activé. J'utilise maintenant mes réponses pré-programmées rapides.")
  }

  return (
    <>
      {/* Styles CSS intégrés et améliorés */}
      <style jsx>{`
        .wb-chatbot-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
        }

        .wb-chat-button {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: wb-pulse 3s infinite;
        }

        @keyframes wb-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 12px 35px rgba(212, 175, 55, 0.6); }
        }

        .wb-chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 15px 40px rgba(212, 175, 55, 0.5);
        }

        .wb-notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #EF4444;
          color: white;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: wb-notification-pulse 2s infinite;
        }

        @keyframes wb-notification-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }

        .wb-chat-container {
          position: absolute;
          bottom: 90px;
          right: 0;
          width: 400px;
          height: 550px;
          background: linear-gradient(145deg, rgba(11, 11, 13, 0.95) 0%, rgba(26, 26, 28, 0.95) 100%);
          backdrop-filter: blur(25px);
          border-radius: 20px;
          border: 2px solid rgba(212, 175, 55, 0.4);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
          transform: translateY(20px) scale(0.95);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: wb-shimmer 4s infinite;
        }

        @keyframes wb-shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .wb-avatar {
          width: 50px;
          height: 50px;
          background-image: url('/elise-avatar.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 8px;
          position: relative;
          overflow: hidden;
        }

        .wb-avatar::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 14px;
          height: 14px;
          background: #10B981;
          border: 2px solid white;
          border-radius: 50%;
        }

        .wb-chat-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .wb-ai-indicator {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 600;
        }

        .wb-ai-offline { background: rgba(107, 114, 128, 0.8); }
        .wb-ai-emergent { background: rgba(16, 185, 129, 0.8); }
        .wb-ai-openai { background: rgba(59, 130, 246, 0.8); }

        .wb-chat-subtitle {
          font-size: 13px;
          opacity: 0.95;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .wb-config-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .wb-config-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .wb-messages-area {
          height: 350px;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(180deg, #0B0B0D 0%, #1A1A1C 100%);
        }

        .wb-messages-area::-webkit-scrollbar {
          width: 6px;
        }

        .wb-messages-area::-webkit-scrollbar-track {
          background: rgba(212, 175, 55, 0.1);
          border-radius: 3px;
        }

        .wb-messages-area::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.5);
          border-radius: 3px;
        }

        .wb-message {
          margin-bottom: 16px;
          animation: wb-slideIn 0.4s ease;
        }

        @keyframes wb-slideIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .wb-message-bot {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .wb-message-user {
          display: flex;
          justify-content: flex-end;
        }

        .wb-bot-avatar {
          width: 32px;
          height: 32px;
          background-image: url('/elise-avatar.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 2px solid rgba(212, 175, 55, 0.4);
          flex-shrink: 0;
        }

        .wb-message-bubble {
          max-width: 85%;
          padding: 14px 18px;
          border-radius: 20px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .wb-message-bot .wb-message-bubble {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: white;
        }

        .wb-message-user .wb-message-bubble {
          background: linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%);
          color: white;
        }

        .wb-quick-replies {
          padding: 0 20px 15px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-height: 80px;
          overflow-y: auto;
        }

        .wb-quick-reply {
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #FBBF24;
          padding: 10px 14px;
          border-radius: 25px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-weight: 500;
        }

        .wb-quick-reply:hover {
          background: rgba(212, 175, 55, 0.25);
          border-color: #D4AF37;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .wb-typing-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 20px;
          width: fit-content;
          margin-bottom: 16px;
          margin-left: 42px;
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
          animation: wb-typing 1.4s infinite;
        }

        .wb-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .wb-typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes wb-typing {
          0%, 60%, 100% { opacity: 0.4; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.3); }
        }

        .wb-ai-config {
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .wb-input-area {
          padding: 16px 20px;
          background: #0B0B0D;
          border-top: 1px solid rgba(212, 175, 55, 0.3);
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .wb-input {
          flex: 1;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: white;
          padding: 12px 18px;
          border-radius: 25px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
        }

        .wb-input:focus {
          border-color: #FBBF24;
          background: rgba(212, 175, 55, 0.18);
        }

        .wb-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .wb-send-button {
          background: linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: white;
        }

        .wb-send-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        .wb-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .wb-config-input {
          width: 100%;
          padding: 8px 12px;
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(107, 114, 128, 0.5);
          color: white;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .wb-config-btn-primary {
          background: linear-gradient(135deg, #D4AF37, #F59E0B);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          margin-right: 6px;
        }

        .wb-config-btn-secondary {
          background: transparent;
          color: #D4AF37;
          border: 1px solid #D4AF37;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          margin-right: 6px;
        }

        /* Mobile responsive optimisé pour chatbot */
        @media (max-width: 768px) {
          .wb-chatbot-widget {
            bottom: 15px;
            right: 15px;
          }

          .wb-chat-container {
            width: calc(100vw - 30px);
            height: calc(100vh - 140px);
            bottom: 80px;
            right: 15px;
            left: 15px;
            border-radius: 16px;
            max-width: none;
          }

          .wb-messages-area {
            height: calc(100vh - 320px);
            padding: 16px;
            min-height: 300px;
          }

          .wb-chat-button {
            width: 60px;
            height: 60px;
            bottom: 15px;
            right: 15px;
          }

          .wb-notification-badge {
            width: 20px;
            height: 20px;
            font-size: 11px;
          }

          .wb-chat-header {
            padding: 16px;
          }

          .wb-avatar {
            width: 40px;
            height: 40px;
          }

          .wb-chat-title {
            font-size: 16px;
          }

          .wb-chat-subtitle {
            font-size: 12px;
          }

          .wb-ai-indicator {
            font-size: 10px;
            padding: 2px 4px;
          }

          .wb-message-bubble {
            max-width: 90%;
            padding: 12px 14px;
            font-size: 13px;
          }

          .wb-bot-avatar {
            width: 28px;
            height: 28px;
          }

          .wb-quick-reply {
            font-size: 11px;
            padding: 8px 10px;
            margin-bottom: 4px;
          }

          .wb-quick-replies {
            padding: 0 16px 12px;
            max-height: 100px;
          }

          .wb-input-area {
            padding: 12px 16px;
          }

          .wb-input {
            padding: 10px 14px;
            font-size: 15px; /* Important pour éviter zoom iOS */
            border-radius: 20px;
          }

          .wb-send-button {
            width: 40px;
            height: 40px;
            min-height: 40px;
          }

          .wb-ai-config {
            padding: 12px;
            margin: 12px 16px;
            border-radius: 8px;
          }

          .wb-config-input {
            font-size: 15px;
            padding: 10px 12px;
          }

          .wb-config-btn {
            width: 28px;
            height: 28px;
          }

          .wb-config-btn-primary,
          .wb-config-btn-secondary {
            padding: 8px 12px;
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .wb-chatbot-widget {
            bottom: 12px;
            right: 12px;
          }

          .wb-chat-container {
            width: calc(100vw - 24px);
            height: calc(100vh - 120px);
            bottom: 75px;
            right: 12px;
            left: 12px;
            border-radius: 12px;
          }

          .wb-messages-area {
            height: calc(100vh - 300px);
            padding: 12px;
            min-height: 250px;
          }

          .wb-chat-button {
            width: 55px;
            height: 55px;
            bottom: 12px;
            right: 12px;
          }

          .wb-notification-badge {
            width: 18px;
            height: 18px;
            font-size: 10px;
            top: -3px;
            right: -3px;
          }

          .wb-chat-header {
            padding: 12px;
          }

          .wb-avatar {
            width: 36px;
            height: 36px;
          }

          .wb-bot-avatar {
            width: 24px;
            height: 24px;
          }

          .wb-chat-title {
            font-size: 14px;
          }

          .wb-chat-subtitle {
            font-size: 11px;
          }

          .wb-message-bubble {
            max-width: 85%;
            padding: 10px 12px;
            font-size: 12px;
            line-height: 1.4;
          }

          .wb-quick-replies {
            padding: 0 12px 10px;
            gap: 6px;
            max-height: 80px;
          }

          .wb-quick-reply {
            font-size: 10px;
            padding: 6px 8px;
            border-radius: 15px;
          }

          .wb-typing-indicator {
            padding: 10px 12px;
            margin-left: 30px;
            margin-bottom: 12px;
          }

          .wb-typing-dot {
            width: 5px;
            height: 5px;
          }

          .wb-input-area {
            padding: 10px 12px;
            gap: 8px;
          }

          .wb-input {
            padding: 8px 12px;
            font-size: 15px;
            border-radius: 18px;
          }

          .wb-send-button {
            width: 36px;
            height: 36px;
          }

          .wb-ai-config {
            margin: 8px 12px;
            padding: 8px;
          }

          .wb-config-input {
            font-size: 14px;
            padding: 8px 10px;
          }
        }

        /* Landscape mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .wb-chat-container {
            width: 60vw;
            height: calc(100vh - 80px);
            bottom: 60px;
            right: 20px;
            left: auto;
          }

          .wb-messages-area {
            height: calc(100vh - 220px);
          }
        }
      `}</style>

      {/* Widget */}
      <div className="wb-chatbot-widget">
        {/* Container de chat */}
        <div className={`wb-chat-container ${isOpen ? 'open' : ''}`}>
          {/* Header avec photo d'Élise */}
          <div className="wb-chat-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="wb-avatar"></div>
                <div>
                  <div className="wb-chat-title">
                    Élise - WebBoost
                    <span className={`wb-ai-indicator ml-2 ${
                      aiStatus === 'offline' ? 'wb-ai-offline' : 
                      aiStatus === 'emergent' ? 'wb-ai-emergent' : 'wb-ai-openai'
                    }`}>
                      {aiStatus === 'offline' ? 'OFFLINE' : aiStatus === 'emergent' ? 'IA EMERGENT' : 'IA OPENAI'}
                    </span>
                  </div>
                  <div className="wb-chat-subtitle">
                    Conseillère web • Répond en 2 min
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="wb-config-btn" onClick={toggleAIConfig} title="Configurer IA">
                  <i className="fas fa-cog text-sm"></i>
                </button>
                <button className="wb-config-btn" onClick={toggleChat} title="Fermer">
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Configuration IA */}
          {showAIConfig && (
            <div className="wb-ai-config">
              <h4 className="text-yellow-400 font-bold text-sm mb-3">🤖 Configuration IA</h4>
              
              <div className="space-y-2 mb-3">
                <button 
                  onClick={activateEmergentAI}
                  className="wb-config-btn-primary w-full"
                >
                  🚀 Activer IA Emergent (Gratuit)
                </button>
                
                <div>
                  <input 
                    type="password"
                    className="wb-config-input"
                    placeholder="Votre clé OpenAI (sk-...)"
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={activateOpenAI} className="wb-config-btn-primary flex-1">
                      🔑 Activer OpenAI
                    </button>
                    <button onClick={deactivateAI} className="wb-config-btn-secondary">
                      📴 Mode Offline
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-400">
                IA Emergent : Gratuit • OpenAI : Vos quotas • Offline : Rapide
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="wb-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`wb-message ${msg.type === 'bot' ? 'wb-message-bot' : 'wb-message-user'}`}>
                {msg.type === 'bot' && <div className="wb-bot-avatar"></div>}
                <div className="wb-message-bubble">
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
            
            {/* Indicateur de frappe amélioré */}
            {isTyping && (
              <div className="wb-typing-indicator">
                <div className="wb-bot-avatar"></div>
                <div className="wb-typing-dots">
                  <div className="wb-typing-dot"></div>
                  <div className="wb-typing-dot"></div>
                  <div className="wb-typing-dot"></div>
                </div>
                <span className="text-xs text-gray-400 ml-2">Élise tape...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length > 0 && messages[messages.length - 1].quickReplies && !isTyping && (
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

          {/* Zone d'input améliorée */}
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
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>

        {/* Bouton d'ouverture amélioré */}
        <button className="wb-chat-button" onClick={toggleChat}>
          {showNotification && (
            <div className="wb-notification-badge">1</div>
          )}
          <i className="fas fa-headset text-2xl text-white"></i>
        </button>
      </div>
    </>
  )
}

export default AdvancedChatbot