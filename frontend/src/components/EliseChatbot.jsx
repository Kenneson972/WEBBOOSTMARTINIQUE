import React, { useState, useEffect, useRef } from 'react'

const EliseChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showNotification, setShowNotification] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [conversationMemory, setConversationMemory] = useState({
    customerName: '',
    sector: '',
    budget: '',
    urgency: '',
    currentSite: '',
    mainGoal: '',
    concerns: [],
    interests: [],
    stage: 'discovery', // discovery, qualification, proposition, objection, closing
    score: 0
  })
  
  const messagesEndRef = useRef(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Élise dit bonjour après 4 secondes
    const timer = setTimeout(() => {
      startEliseIntroduction()
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  const startEliseIntroduction = () => {
    setIsTyping(true)
    
    setTimeout(() => {
      setIsTyping(false)
      addEliseMessage(
        "Bonjour ! 😊 Je suis Élise, votre conseillère commerciale chez WebBoost Martinique.\n\nJe suis spécialisée dans l'accompagnement des entreprises martiniquaises pour leur transformation digitale.\n\nComment puis-je vous aider aujourd'hui avec votre projet web ?"
      )
    }, 2000)
  }

  const addEliseMessage = (text, quickSuggestions = []) => {
    const newMessage = {
      id: Date.now(),
      type: 'elise',
      text: text,
      timestamp: new Date(),
      suggestions: quickSuggestions
    }
    
    setMessages(prev => [...prev, newMessage])
  }

  const addUserMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
  }

  // ÉLISE - Moteur d'intelligence conversationnelle
  const eliseThinking = {
    // Détection d'intentions naturelles
    detectIntent: (message) => {
      const text = message.toLowerCase()
      
      // Intentions commerciales
      if (/prix|coût|tarif|combien|budget/.test(text)) return 'pricing_inquiry'
      if (/délai|temps|quand|rapide|vite|livraison/.test(text)) return 'timeline_inquiry'  
      if (/garantie|remboursé|sécurisé|risque/.test(text)) return 'security_inquiry'
      
      // Secteurs d'activité
      if (/resto|restaurant|cuisine|plat|menu/.test(text)) return 'sector_restaurant'
      if (/boutique|magasin|commerce|vente|produit/.test(text)) return 'sector_commerce'
      if (/service|conseil|prestation|b2b/.test(text)) return 'sector_services'
      if (/médecin|clinique|santé|cabinet|dentiste/.test(text)) return 'sector_health'
      if (/coiffure|esthétique|beauté|salon|spa/.test(text)) return 'sector_beauty'
      if (/artisan|btp|plombier|électricien|maçon/.test(text)) return 'sector_craft'
      
      // Intentions de process
      if (/comment|process|étapes|fonctionnement/.test(text)) return 'process_inquiry'
      if (/exemple|portfolio|réalisation/.test(text)) return 'portfolio_request'
      if (/urgence|urgent|asap|rapidement/.test(text)) return 'urgent_request'
      if (/réfléchir|réflexion|plus tard|rappeler/.test(text)) return 'hesitation'
      
      return 'general_inquiry'
    },

    // Élise - Réponses par contexte et personnalité
    generateResponse: (intent, message) => {
      switch(intent) {
        case 'pricing_inquiry':
          return eliseThinking.pricingResponse()
        
        case 'timeline_inquiry':
          return eliseThinking.timelineResponse()
          
        case 'security_inquiry':
          return eliseThinking.securityResponse()
          
        case 'sector_restaurant':
          setConversationMemory(prev => ({ ...prev, sector: 'restaurant' }))
          return eliseThinking.sectorRestaurantResponse()
          
        case 'sector_commerce':
          setConversationMemory(prev => ({ ...prev, sector: 'commerce' }))
          return eliseThinking.sectorCommerceResponse()
          
        case 'sector_services':
          setConversationMemory(prev => ({ ...prev, sector: 'services' }))
          return eliseThinking.sectorServicesResponse()
          
        case 'urgent_request':
          return eliseThinking.urgentResponse()
          
        case 'hesitation':
          return eliseThinking.hesitationResponse()
          
        default:
          return eliseThinking.discoveryResponse(message)
      }
    },

    // ÉLISE - Réponses spécialisées avec personnalité commerciale
    pricingResponse: () => {
      const sector = conversationMemory.sector
      let response = "Excellente question ! 💰 Nos tarifs sont spécialement étudiés pour le marché martiniquais.\n\n"
      
      if (sector === 'restaurant') {
        response += "**Pour un restaurant comme le vôtre :**\n• Pack Pro (1 290€ HT) - Le plus adapté\n• Galerie photos plats incluse\n• Système réservation en ligne\n• Acompte : seulement 645€\n\nC'est 3x moins cher que la concurrence métropole !"
      } else if (sector === 'commerce') {
        response += "**Pour votre commerce :**\n• Pack Essentiel (890€ HT) - Parfait pour débuter\n• ou Pack Pro (1 290€ HT) - Plus complet\n• Catalogue produits optimisé\n• Acompte : 445€ ou 645€\n\nVous économisez plus de 60% vs concurrence !"
      } else {
        response += "**Nos 3 formules adaptées :**\n\n🥉 **Essentiel** - 890€ HT (acompte 445€)\n🥈 **Pro** - 1 290€ HT (acompte 645€) ⭐\n🥇 **Premium** - 1 790€ HT (acompte 895€)\n\nPour mieux vous conseiller, quel est votre secteur d'activité ?"
      }
      
      return response + "\n\nSouhaitez-vous que je vous détaille une formule ?"
    },

    timelineResponse: () => {
      return "⚡ **Nos délais express sont notre signature !**\n\nContrairement à la concurrence (6-8 semaines), nous livrons en **7 à 12 jours ouvrés maximum**.\n\n**Pourquoi si rapide ?**\n✅ Équipe 100% martiniquaise\n✅ Process optimisé depuis 3 ans\n✅ Templates adaptables pré-conçus\n✅ Communication directe (pas de décalage)\n\n**Vos délais selon le pack :**\n• Essentiel : 10 jours max\n• Pro : 7-10 jours max  \n• Premium : 10-12 jours max\n\nEt c'est garanti ! Délai non respecté = remboursement intégral. 🛡️"
    },

    securityResponse: () => {
      return "🛡️ **Sécurité totale avec WebBoost !**\n\nVoici mes garanties personnelles :\n\n✅ **Satisfait ou remboursé** - 15 jours complets\n✅ **Délai respecté ou remboursé** - Engagement ferme\n✅ **Paiement sécurisé** - Stripe certifié SSL\n✅ **Support 7j/7** pendant votre projet\n✅ **Révisions incluses** selon votre pack\n✅ **Anti-bug** - Corrections gratuites 15 jours\n\nEn 3 ans, nous avons **0% de remboursement** demandé ! 🏆\n\nQuestions sur nos garanties ?"
    },

    sectorRestaurantResponse: () => {
      return "🍽️ **Parfait ! Les restaurants sont ma spécialité !**\n\nPour votre restaurant, je recommande vivement notre **Pack Pro** (1 290€ HT) car il inclut :\n\n✨ **Galerie photos** - Mettez vos plats en valeur\n📱 **Réservation en ligne** - Plus de clients le soir\n🇲🇶 **SEO local** - Apparaître dans \"restaurant Fort-de-France\"\n⭐ **Avis Google** - Gestion de votre e-réputation\n\n**Acompte : seulement 645€ pour commencer**\n\nAvez-vous déjà un site actuellement ?"
    },

    sectorCommerceResponse: () => {
      return "🛍️ **Excellent ! Le commerce local, c'est mon domaine !**\n\nSelon votre activité, 2 options s'offrent à vous :\n\n💎 **Pack Essentiel** (890€ HT) - Si boutique physique\n• Site vitrine élégant\n• Infos pratiques, horaires, contact\n• Acompte : 445€\n\n🏆 **Pack Pro** (1 290€ HT) - Si vous voulez + de clients\n• Catalogue produits\n• Optimisation locale Google\n• Acompte : 645€\n\nQue vendez-vous exactement ? Cela m'aidera à mieux vous conseiller ! 😊"
    },

    sectorServicesResponse: () => {
      return "💼 **Services B2B ! Excellent secteur pour la conversion web !**\n\nLes entreprises de services ont souvent les **meilleurs retours** avec nos sites :\n\n🎯 **Pack Pro recommandé** (1 290€ HT)\n• Pages services détaillées\n• Formulaires de devis optimisés\n• Témoignages clients intégrés\n• SEO \"services [votre ville]\"\n\n**Acompte : 645€ pour démarrer**\n\nQuel type de services proposez-vous ? (conseil, maintenance, formation...)"
    },

    urgentResponse: () => {
      return "🚨 **Urgence comprise !** Je m'occupe de vous prioritairement.\n\nPour un **traitement express** :\n\n⚡ **Pack Pro express** - 7 jours garantis\n💰 **Acompte 645€** - Démarrage immédiat\n📱 **Kenneson en direct** - Appel dans l'heure\n\n**Votre situation :**\nLancement imminent ? Concurrent agressif ? Saison haute ?\n\nDites-moi tout, je trouve la solution ! 💪"
    },

    hesitationResponse: () => {
      return "😊 **Je comprends parfaitement !** C'est un investissement important.\n\n**Laissez-moi vous rassurer :**\n\n📧 **Témoignages** - Je vous envoie 3 cas similaires\n📱 **Kenneson direct** - Validation technique\n🛡️ **Garantie 15 jours** - Vous testez sans risque\n📅 **Planning flexible** - On s'adapte à vous\n\n**Puis-je vous envoyer un exemple concret** de site que nous avons créé pour un(e) [votre secteur] ?\n\nCela vous donnera une idée précise du résultat ! ⭐"
    },

    discoveryResponse: (message) => {
      return "🤔 **Intéressant !** Je note votre demande.\n\n**Pour mieux vous conseiller**, j'aimerais comprendre :\n\n• Quel est votre métier/activité ?\n• Avez-vous un site actuellement ?\n• Quel est votre objectif principal ?\n\n**Mon rôle** : vous trouver LA solution parfaite selon votre situation unique ! 🎯\n\nCommençons par votre activité ?"
    }
  }

  // ÉLISE - Gestion conversation avec mémoire
  const handleUserMessage = async (userMessage) => {
    addUserMessage(userMessage)
    
    // Analyser le message avec l'intelligence d'Élise
    const intent = eliseThinking.detectIntent(userMessage)
    
    setIsTyping(true)
    
    // Délai réaliste de réflexion (Élise "réfléchit")
    setTimeout(() => {
      setIsTyping(false)
      
      // Générer la réponse d'Élise selon l'intention
      const eliseResponse = eliseThinking.generateResponse(intent, userMessage)
      addEliseMessage(eliseResponse)
      
      // Mettre à jour la mémoire conversationnelle
      updateConversationMemory(intent, userMessage)
    }, 1500)
  }

  const updateConversationMemory = (intent, message) => {
    const updates = {}
    
    if (intent.startsWith('sector_')) {
      updates.sector = intent.replace('sector_', '')
    }
    
    if (intent === 'urgent_request') {
      updates.urgency = 'high'
    }
    
    if (intent === 'hesitation') {
      updates.concerns = [...conversationMemory.concerns, 'hesitation']
    }
    
    // Score de qualification automatique
    let newScore = conversationMemory.score
    if (intent === 'pricing_inquiry') newScore += 2
    if (intent.startsWith('sector_')) newScore += 3
    if (intent === 'urgent_request') newScore += 5
    
    setConversationMemory(prev => ({
      ...prev,
      ...updates,
      score: newScore
    }))
  }

  // ÉLISE - Interface de profil cliquable
  const showEliseProfile = () => {
    setShowProfile(true)
  }

  const closeProfile = () => {
    setShowProfile(false)
  }

  // ÉLISE - Suggestions intelligentes contextuelles
  const getEliseSuggestions = () => {
    const { sector, stage, score } = conversationMemory
    
    if (stage === 'discovery' && !sector) {
      return [
        "🍽️ Restaurant",
        "🛍️ Commerce", 
        "💼 Services B2B",
        "🏥 Santé",
        "💅 Beauté"
      ]
    }
    
    if (sector && stage === 'discovery') {
      return [
        "💰 Voir les tarifs",
        "⚡ Comprendre les délais", 
        "🛡️ Vos garanties",
        "📱 Parler à Kenneson"
      ]
    }
    
    if (score >= 5) {
      return [
        "🛒 Commander maintenant",
        "📞 Appel personnalisé",
        "📧 Devis détaillé"
      ]
    }
    
    return [
      "💰 Tarifs adaptés",
      "⚡ Délais express", 
      "🎯 Mon besoin exact",
      "📱 Contact direct"
    ]
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setShowNotification(false)
    }
  }

  const sendMessage = () => {
    if (!currentInput.trim()) return
    
    handleUserMessage(currentInput.trim())
    setCurrentInput('')
  }

  return (
    <>
      {/* Profil Élise en overlay */}
      {showProfile && (
        <div className="elise-profile-overlay" onClick={closeProfile}>
          <div className="elise-profile-card" onClick={e => e.stopPropagation()}>
            <div className="profile-header">
              <img src="/WEBBOOSTMARTINIQUE/elise-avatar.jpg" alt="Élise Morel" className="profile-photo" />
              <button onClick={closeProfile} className="profile-close">✕</button>
            </div>
            <div className="profile-content">
              <h3>Élise Morel</h3>
              <p className="profile-title">Conseillère Commerciale WebBoost Martinique</p>
              <div className="profile-stats">
                <div className="stat">
                  <strong>3 ans</strong>
                  <span>d'expérience</span>
                </div>
                <div className="stat">
                  <strong>95%</strong>
                  <span>clients satisfaits</span>
                </div>
                <div className="stat">
                  <strong>180+</strong>
                  <span>sites livrés</span>
                </div>
              </div>
              <div className="profile-expertise">
                <h4>💼 Mes spécialités :</h4>
                <ul>
                  <li>🎯 Conversion digitale TPE/PME</li>
                  <li>🇲🇶 Marché martiniquais</li>
                  <li>📱 Sites mobiles performants</li>
                  <li>💰 Optimisation ROI web</li>
                </ul>
              </div>
              <div className="profile-quote">
                <em>"J'accompagne chaque entrepreneur martiniquais avec une approche personnalisée. Mon objectif : transformer votre vision en succès digital mesurable."</em>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS pour Élise */}
      <style jsx>{`
        .elise-chatbot-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
        }

        .elise-chat-fab {
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

        .elise-chat-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 15px 45px rgba(212, 175, 55, 0.6);
        }

        .elise-avatar-fab {
          width: 50px;
          height: 50px;
          background-image: url('/WEBBOOSTMARTINIQUE/elise-avatar.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .elise-avatar-fab::after {
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

        .notification-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #EF4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: badge-bounce 2s infinite;
        }

        @keyframes badge-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .elise-chat-window {
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

        .elise-chat-window.open {
          transform: translateY(0) scale(1);
          opacity: 1;
          visibility: visible;
        }

        .elise-chat-header {
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          padding: 20px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .elise-chat-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 4s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .elise-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .elise-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .elise-profile:hover {
          transform: translateX(-2px);
        }

        .elise-header-avatar {
          width: 50px;
          height: 50px;
          background-image: url('/WEBBOOSTMARTINIQUE/elise-avatar.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.8);
          position: relative;
          transition: all 0.2s ease;
        }

        .elise-header-avatar::after {
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

        .header-controls {
          display: flex;
          gap: 8px;
        }

        .header-btn {
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

        .header-btn:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: scale(1.05);
        }

        .elise-messages-area {
          height: 360px;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(180deg, #0F0F11 0%, #1A1A1E 100%);
        }

        .elise-messages-area::-webkit-scrollbar {
          width: 6px;
        }

        .elise-messages-area::-webkit-scrollbar-track {
          background: rgba(212, 175, 55, 0.1);
          border-radius: 3px;
        }

        .elise-messages-area::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.4);
          border-radius: 3px;
        }

        .message-container {
          margin-bottom: 16px;
          animation: slide-in-message 0.4s ease;
        }

        @keyframes slide-in-message {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .elise-message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .user-message {
          display: flex;
          justify-content: flex-end;
        }

        .elise-message-avatar {
          width: 30px;
          height: 30px;
          background-image: url('/WEBBOOSTMARTINIQUE/elise-avatar.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          border: 2px solid rgba(212, 175, 55, 0.4);
          flex-shrink: 0;
        }

        .message-bubble {
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

        .elise-suggestions {
          padding: 0 20px 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .suggestion-btn {
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #FBBF24;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          font-weight: 500;
        }

        .suggestion-btn:hover {
          background: rgba(212, 175, 55, 0.25);
          border-color: #FBBF24;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .elise-typing {
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

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          background: #FBBF24;
          border-radius: 50%;
          animation: typing-animation 1.5s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.3s; }
        .typing-dot:nth-child(3) { animation-delay: 0.6s; }

        @keyframes typing-animation {
          0%, 60%, 100% { opacity: 0.4; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1.2); }
        }

        .elise-input-area {
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

        .elise-send-btn {
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          border: none;
          border-radius: 50%;
          width: 46px;
          height: 46px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: white;
          min-width: 46px;
          min-height: 46px;
        }

        .elise-send-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        .elise-send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Profil Élise overlay */
        .elise-profile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fade-in 0.3s ease;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .elise-profile-card {
          background: linear-gradient(145deg, #1A1A1E 0%, #2A2A32 100%);
          border: 2px solid rgba(212, 175, 55, 0.4);
          border-radius: 20px;
          max-width: 400px;
          width: 100%;
          overflow: hidden;
          animation: scale-in 0.3s ease;
        }

        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .profile-header {
          background: linear-gradient(135deg, #D4AF37 0%, #FBBF24 100%);
          padding: 20px;
          text-align: center;
          position: relative;
        }

        .profile-photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 4px solid white;
          margin: 0 auto;
        }

        .profile-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .profile-close:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .profile-content {
          padding: 20px;
          color: white;
        }

        .profile-content h3 {
          font-size: 22px;
          font-weight: 700;
          color: #FBBF24;
          margin: 0 0 4px 0;
          text-align: center;
        }

        .profile-title {
          text-align: center;
          color: #D1D5DB;
          margin: 0 0 20px 0;
          font-weight: 500;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat {
          text-align: center;
          padding: 12px;
          background: rgba(212, 175, 55, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .stat strong {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #FBBF24;
        }

        .stat span {
          font-size: 12px;
          color: #D1D5DB;
        }

        .profile-expertise h4 {
          color: #FBBF24;
          margin: 0 0 12px 0;
          font-size: 16px;
        }

        .profile-expertise ul {
          list-style: none;
          padding: 0;
          margin: 0 0 20px 0;
        }

        .profile-expertise li {
          padding: 6px 0;
          color: #D1D5DB;
          font-size: 14px;
        }

        .profile-quote {
          background: rgba(212, 175, 55, 0.1);
          border-left: 3px solid #FBBF24;
          padding: 16px;
          border-radius: 8px;
          font-style: italic;
          color: #F3F4F6;
          font-size: 13px;
          line-height: 1.5;
        }

        /* Mobile responsive pour Élise */
        @media (max-width: 768px) {
          .elise-chatbot-widget {
            bottom: 15px;
            right: 15px;
          }

          .elise-chat-window {
            width: calc(100vw - 30px);
            height: calc(100vh - 140px);
            bottom: 85px;
            right: 15px;
            left: 15px;
            max-height: 600px;
          }

          .elise-messages-area {
            height: calc(100vh - 320px);
            padding: 16px;
            min-height: 250px;
          }

          .elise-chat-fab {
            width: 60px;
            height: 60px;
          }

          .elise-avatar-fab {
            width: 42px;
            height: 42px;
          }

          .notification-badge {
            width: 18px;
            height: 18px;
            font-size: 10px;
          }

          .message-bubble {
            max-width: 90%;
            padding: 12px 16px;
            font-size: 13px;
          }

          .suggestion-btn {
            font-size: 11px;
            padding: 6px 10px;
          }

          .elise-input {
            padding: 10px 16px;
            font-size: 15px;
          }

          .elise-send-btn {
            width: 44px;
            height: 44px;
            min-width: 44px;
            min-height: 44px;
          }

          .elise-profile-card {
            margin: 20px;
            max-width: none;
          }
        }

        @media (max-width: 480px) {
          .elise-chatbot-widget {
            bottom: 12px;
            right: 12px;
          }

          .elise-chat-window {
            width: calc(100vw - 24px);
            height: calc(100vh - 120px);
            bottom: 75px;
            right: 12px;
            left: 12px;
          }

          .elise-chat-fab {
            width: 56px;
            height: 56px;
          }

          .elise-avatar-fab {
            width: 38px;
            height: 38px;
          }

          .elise-messages-area {
            height: calc(100vh - 300px);
            padding: 12px;
          }

          .elise-chat-header {
            padding: 16px;
          }

          .elise-header-avatar {
            width: 42px;
            height: 42px;
          }

          .elise-info h3 {
            font-size: 16px;
          }

          .elise-info p {
            font-size: 11px;
          }
        }
      `}</style>

      {/* Widget Élise */}
      <div className="elise-chatbot-widget">
        {/* Fenêtre de chat */}
        <div className={`elise-chat-window ${isOpen ? 'open' : ''}`}>
          {/* Header avec profil Élise */}
          <div className="elise-chat-header">
            <div className="elise-header-content">
              <div className="elise-profile" onClick={showEliseProfile}>
                <div className="elise-header-avatar"></div>
                <div className="elise-info">
                  <h3>Élise Morel</h3>
                  <p>Conseillère commerciale WebBoost<br />Spécialiste conversion digitale</p>
                </div>
              </div>
              
              <div className="header-controls">
                <button className="header-btn" onClick={toggleChat} title="Fermer">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Zone de messages */}
          <div className="elise-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className="message-container">
                {msg.type === 'elise' ? (
                  <div className="elise-message">
                    <div className="elise-message-avatar"></div>
                    <div className="message-bubble elise-bubble">
                      {msg.text.split('\n').map((line, idx) => (
                        <React.Fragment key={idx}>
                          <span dangerouslySetInnerHTML={{
                            __html: line
                              .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FBBF24;">$1</strong>')
                              .replace(/✅/g, '<span style="color: #10B981;">✅</span>')
                              .replace(/🎯|⚡|💰|🛡️|📱|📊|🏆/g, '<span style="font-size: 16px;">$&</span>')
                          }} />
                          {idx < msg.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="user-message">
                    <div className="message-bubble user-bubble">
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Indicateur Élise en train de taper */}
            {isTyping && (
              <div className="elise-typing">
                <div className="elise-message-avatar"></div>
                <div className="typing-bubble">
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <span style={{fontSize: '11px', color: '#9CA3AF', marginLeft: '6px'}}>
                    Élise réfléchit...
                  </span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions contextuelles Élise */}
          {!isTyping && messages.length > 0 && (
            <div className="elise-suggestions">
              {getEliseSuggestions().map((suggestion, idx) => (
                <button 
                  key={idx}
                  className="suggestion-btn"
                  onClick={() => handleUserMessage(suggestion.replace(/🍽️|🛍️|💼|🏥|💅|💰|⚡|🛡️|📱|🎯|📞|📧|🛒/g, '').trim())}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Zone de saisie */}
          <div className="elise-input-area">
            <input 
              type="text"
              className="elise-input"
              placeholder="Tapez votre message à Élise..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              className="elise-send-btn"
              onClick={sendMessage}
              disabled={!currentInput.trim()}
              title="Envoyer"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>

        {/* FAB avec photo Élise */}
        <button className="elise-chat-fab" onClick={toggleChat}>
          {showNotification && (
            <div className="notification-badge">1</div>
          )}
          <div className="elise-avatar-fab" title="Parler à Élise"></div>
        </button>
      </div>
    </>
  )
}

export default EliseChatbot