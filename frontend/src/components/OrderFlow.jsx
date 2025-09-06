import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const OrderFlow = ({ selectedPack = null, onClose = null }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [orderData, setOrderData] = useState({
    // Étape 1: Pack sélectionné
    pack: selectedPack || '',
    basePrice: 0,
    
    // Étape 2: Options
    options: [],
    totalOptions: 0,
    
    // Étape 3: Informations client
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    currentWebsite: '',
    businessBrief: '',
    
    // Étape 4: Planning
    deliveryDate: '',
    
    // Calculs
    subtotal: 0,
    vat: 0,
    total: 0,
    deposit: 0
  })
  
  const [errors, setErrors] = useState({})

  const packs = {
    'essentiel': { name: 'Pack Essentiel Local', price: 890, pages: 3 },
    'pro': { name: 'Pack Vitrine Pro', price: 1290, pages: '5-6' },
    'premium': { name: 'Pack Vitrine Conversion', price: 1790, pages: '6-8' }
  }

  const availableOptions = [
    { id: 'content', name: 'Rédaction 800 mots', price: 180, description: 'Textes optimisés SEO' },
    { id: 'images', name: 'Optimisation 20 images', price: 120, description: 'Retouche et compression' },
    { id: 'page_extra', name: 'Page locale supplémentaire', price: 120, description: 'Page services ou produits' },
    { id: 'booking', name: 'Intégration réservation', price: 150, description: 'Calendrier en ligne' },
    { id: 'translation', name: 'Traduction FR-EN', price: 150, description: 'Site bilingue' }
  ]

  useEffect(() => {
    calculateTotals()
  }, [orderData.pack, orderData.options])

  const calculateTotals = () => {
    const packPrice = packs[orderData.pack]?.price || 0
    const optionsTotal = orderData.options.reduce((sum, optionId) => {
      const option = availableOptions.find(opt => opt.id === optionId)
      return sum + (option ? option.price : 0)
    }, 0)
    
    const subtotal = packPrice + optionsTotal
    const vat = subtotal * 0.085 // TVA martiniquaise 8.5%
    const total = subtotal + vat
    const deposit = Math.round(subtotal * 0.5) // Acompte 50%

    setOrderData(prev => ({
      ...prev,
      basePrice: packPrice,
      totalOptions: optionsTotal,
      subtotal: subtotal,
      vat: vat,
      total: total,
      deposit: deposit
    }))
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 6))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateCurrentStep = () => {
    const newErrors = {}
    
    switch(currentStep) {
      case 1:
        if (!orderData.pack) newErrors.pack = 'Veuillez sélectionner un pack'
        break
      case 3:
        if (!orderData.businessName) newErrors.businessName = 'Nom d\'entreprise requis'
        if (!orderData.contactName) newErrors.contactName = 'Nom du contact requis'
        if (!orderData.email) newErrors.email = 'Email requis'
        if (!orderData.phone) newErrors.phone = 'Téléphone requis'
        if (!orderData.businessBrief) newErrors.businessBrief = 'Description de votre activité requise'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const toggleOption = (optionId) => {
    setOrderData(prev => ({
      ...prev,
      options: prev.options.includes(optionId) 
        ? prev.options.filter(id => id !== optionId)
        : [...prev.options, optionId]
    }))
  }

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const generateOrderNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `WB-${year}-${random}`
  }

  const finalizeOrder = async () => {
    const orderNumber = generateOrderNumber()
    const finalOrder = {
      ...orderData,
      orderNumber,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      paymentMethod: 'pending'
    }

    // Sauvegarder localement pour l'instant
    const orders = JSON.parse(localStorage.getItem('wb_orders') || '[]')
    orders.push(finalOrder)
    localStorage.setItem('wb_orders', JSON.stringify(orders))
    
    // TODO: Envoyer vers le backend quand prêt
    
    setCurrentStep(6)
    return orderNumber
  }

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="gold-gradient">Sélectionnez votre pack</span>
              </h2>
              <p className="text-gray-300">Choisissez la solution qui correspond à vos besoins</p>
            </div>

            <div className="grid gap-6">
              {Object.entries(packs).map(([key, pack]) => (
                <div 
                  key={key}
                  className={`pack-selector ${orderData.pack === key ? 'selected' : ''}`}
                  onClick={() => handleInputChange('pack', key)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400">{pack.name}</h3>
                      <p className="text-gray-300">{pack.pages} pages • Livraison 7-12 jours</p>
                    </div>
                    <div className="price-display">
                      <div className="text-2xl font-bold text-gold">€{pack.price}</div>
                      <div className="text-sm text-gray-400">HT</div>
                      <div className="text-sm text-yellow-400">Acompte: €{Math.round(pack.price * 0.5)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.pack && <div className="error-message">{errors.pack}</div>}
          </div>
        )

      case 2:
        return (
          <div className="step-content">
            <div className="step-header text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="gold-gradient">Personnalisez votre pack</span>
              </h2>
              <p className="text-gray-300">Ajoutez des options pour maximiser l'impact de votre site</p>
            </div>

            <div className="space-y-4">
              {availableOptions.map(option => (
                <div 
                  key={option.id}
                  className={`option-item ${orderData.options.includes(option.id) ? 'selected' : ''}`}
                  onClick={() => toggleOption(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={orderData.options.includes(option.id)}
                        onChange={() => toggleOption(option.id)}
                        className="option-checkbox"
                      />
                      <div className="ml-4">
                        <h4 className="font-semibold text-yellow-400">{option.name}</h4>
                        <p className="text-sm text-gray-300">{option.description}</p>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gold">+€{option.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="step-content">
            <div className="step-header text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="gold-gradient">Vos informations</span>
              </h2>
              <p className="text-gray-300">Pour créer votre site parfaitement adapté</p>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Nom de l'entreprise *</label>
                  <input 
                    type="text"
                    value={orderData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className={`form-input ${errors.businessName ? 'error' : ''}`}
                    placeholder="Mon Entreprise SARL"
                  />
                  {errors.businessName && <div className="error-text">{errors.businessName}</div>}
                </div>
                
                <div>
                  <label className="form-label">Nom du responsable *</label>
                  <input 
                    type="text"
                    value={orderData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className={`form-input ${errors.contactName ? 'error' : ''}`}
                    placeholder="Jean Dupont"
                  />
                  {errors.contactName && <div className="error-text">{errors.contactName}</div>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Email professionnel *</label>
                  <input 
                    type="email"
                    value={orderData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="contact@monentreprise.com"
                  />
                  {errors.email && <div className="error-text">{errors.email}</div>}
                </div>
                
                <div>
                  <label className="form-label">Téléphone *</label>
                  <input 
                    type="tel"
                    value={orderData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="0596 XX XX XX"
                  />
                  {errors.phone && <div className="error-text">{errors.phone}</div>}
                </div>
              </div>

              <div>
                <label className="form-label">Adresse complète</label>
                <input 
                  type="text"
                  value={orderData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="form-input"
                  placeholder="123 Rue de la République, 97200 Fort-de-France"
                />
                <div className="text-xs text-gray-400 mt-1">Pour votre Google Business Profile</div>
              </div>

              <div>
                <label className="form-label">Site web actuel (si applicable)</label>
                <input 
                  type="url"
                  value={orderData.currentWebsite}
                  onChange={(e) => handleInputChange('currentWebsite', e.target.value)}
                  className="form-input"
                  placeholder="https://monsiteactuel.com"
                />
              </div>

              <div>
                <label className="form-label">Décrivez votre activité *</label>
                <textarea 
                  value={orderData.businessBrief}
                  onChange={(e) => handleInputChange('businessBrief', e.target.value)}
                  className={`form-input h-24 ${errors.businessBrief ? 'error' : ''}`}
                  placeholder="Restaurant créole, spécialités locales, ouvert depuis 2018..."
                ></textarea>
                {errors.businessBrief && <div className="error-text">{errors.businessBrief}</div>}
                <div className="text-xs text-gray-400 mt-1">Plus c'est précis, mieux nous adaptons votre site</div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="step-content">
            <div className="step-header text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="gold-gradient">Planning de livraison</span>
              </h2>
              <p className="text-gray-300">Quand souhaitez-vous recevoir votre site ?</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="form-label">Date de livraison souhaitée</label>
                <input 
                  type="date"
                  value={orderData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  className="form-input"
                  min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                <div className="text-sm text-gray-400 mt-2">
                  Délais standards selon votre pack :
                  <ul className="mt-2 space-y-1">
                    <li>• Pack Essentiel : 10 jours ouvrés</li>
                    <li>• Pack Pro : 7-10 jours ouvrés</li>
                    <li>• Pack Premium : 10-12 jours ouvrés</li>
                  </ul>
                </div>
              </div>

              <div className="delivery-info bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">
                  <i className="fas fa-info-circle mr-2"></i>
                  Informations importantes
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Les délais démarrent après réception de tous vos contenus</li>
                  <li>• Nous vous fournirons une checklist détaillée</li>
                  <li>• Communication par email + espace client dédié</li>
                  <li>• 1 à 2 révisions incluses selon votre pack</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="step-content">
            <div className="step-header text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                <span className="gold-gradient">Récapitulatif & Paiement</span>
              </h2>
              <p className="text-gray-300">Vérifiez votre commande avant paiement</p>
            </div>

            <div className="space-y-6">
              {/* Récapitulatif de commande */}
              <div className="order-summary bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">📋 Votre commande</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{packs[orderData.pack]?.name}</span>
                    <span>€{orderData.basePrice}</span>
                  </div>
                  
                  {orderData.options.map(optionId => {
                    const option = availableOptions.find(opt => opt.id === optionId)
                    return option ? (
                      <div key={optionId} className="flex justify-between text-gray-300">
                        <span>+ {option.name}</span>
                        <span>€{option.price}</span>
                      </div>
                    ) : null
                  })}
                  
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between">
                      <span>Sous-total HT</span>
                      <span>€{orderData.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>TVA (8.5%)</span>
                      <span>€{orderData.vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl text-yellow-400 pt-2 border-t border-gray-600 mt-2">
                      <span>Total TTC</span>
                      <span>€{orderData.total.toFixed(2)}</span>
                    </div>
                    <div className="text-center mt-4 p-3 bg-green-500/20 rounded-lg">
                      <div className="text-lg font-bold text-green-300">
                        Acompte à régler maintenant : €{orderData.deposit}
                      </div>
                      <div className="text-sm text-gray-300">
                        Solde (€{(orderData.subtotal - orderData.deposit).toFixed(2)}) avant mise en ligne
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Infos client */}
              <div className="customer-info bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">👤 Informations client</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Entreprise :</strong> {orderData.businessName}</div>
                  <div><strong>Contact :</strong> {orderData.contactName}</div>
                  <div><strong>Email :</strong> {orderData.email}</div>
                  <div><strong>Téléphone :</strong> {orderData.phone}</div>
                  {orderData.address && <div><strong>Adresse :</strong> {orderData.address}</div>}
                  {orderData.currentWebsite && <div><strong>Site actuel :</strong> {orderData.currentWebsite}</div>}
                </div>
              </div>

              {/* Paiement placeholder */}
              <div className="payment-section bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">
                  <i className="fas fa-credit-card mr-2"></i>
                  Paiement sécurisé
                </h3>
                <p className="text-gray-300 mb-4">
                  Paiement sécurisé par Stripe • SSL • Conforme RGPD
                </p>
                
                <div className="payment-methods flex justify-center items-center gap-4 mb-6">
                  <i className="fab fa-cc-visa text-3xl text-blue-400"></i>
                  <i className="fab fa-cc-mastercard text-3xl text-red-400"></i>
                  <i className="fab fa-cc-paypal text-3xl text-blue-500"></i>
                  <i className="fab fa-apple-pay text-3xl text-gray-300"></i>
                </div>
                
                <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-300">
                    <i className="fas fa-shield-alt mr-2"></i>
                    <strong>Garantie 100% :</strong> Satisfait ou remboursé sous 15 jours
                  </p>
                </div>

                <button 
                  onClick={finalizeOrder}
                  className="btn-premium text-xl px-12 py-4 rounded-xl font-bold w-full"
                >
                  <i className="fas fa-lock mr-2"></i>
                  PAYER €{orderData.deposit} MAINTENANT
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Cliquez pour finaliser (paiement Stripe sera intégré prochainement)
                </p>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="step-content text-center">
            <div className="success-animation mb-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-3xl text-white"></i>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              <span className="gold-gradient">Commande confirmée !</span>
            </h2>
            
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 mb-6">
              <p className="text-lg text-green-300 mb-2">
                <strong>Numéro de commande : {orderData.orderNumber || 'WB-2025-0001'}</strong>
              </p>
              <p className="text-gray-300">
                Un email de confirmation vous sera envoyé à {orderData.email}
              </p>
            </div>

            <div className="space-y-4 text-left bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-yellow-400 text-center">📋 Prochaines étapes</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="step-number">1</div>
                  <div>
                    <strong>Email de confirmation</strong><br />
                    <span className="text-gray-300">Reçu dans les 5 minutes</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="step-number">2</div>
                  <div>
                    <strong>Checklist de contenus</strong><br />
                    <span className="text-gray-300">Textes, images et informations nécessaires</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="step-number">3</div>
                  <div>
                    <strong>Développement</strong><br />
                    <span className="text-gray-300">Notre équipe crée votre site</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="step-number">4</div>
                  <div>
                    <strong>Livraison</strong><br />
                    <span className="text-gray-300">Votre site en ligne !</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="btn-outline-premium px-6 py-3 rounded-lg">
                <i className="fas fa-home mr-2"></i>
                Retour à l'accueil
              </Link>
              <button 
                onClick={() => window.open('https://wa.me/596000000?text=' + encodeURIComponent(`Bonjour Kenneson ! Je viens de passer commande ${orderData.orderNumber || 'WB-2025-XXXX'}. Merci de me confirmer la bonne réception.`), '_blank')}
                className="btn-premium px-6 py-3 rounded-lg"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Confirmer sur WhatsApp
              </button>
            </div>
          </div>
        )

      default:
        return <div>Étape inconnue</div>
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="order-flow-container max-w-4xl w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-yellow-400/30 overflow-hidden">
        {/* Header du tunnel */}
        <div className="order-header bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 text-gray-900">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <i className="fas fa-shopping-cart mr-2"></i>
              Commande WebBoost
            </h1>
            {onClose && (
              <button onClick={onClose} className="text-gray-900 hover:text-gray-700 text-2xl">
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="progress-bar mt-4">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className={currentStep >= 1 ? 'text-gray-900' : 'text-gray-600'}>Pack</span>
              <span className={currentStep >= 2 ? 'text-gray-900' : 'text-gray-600'}>Options</span>
              <span className={currentStep >= 3 ? 'text-gray-900' : 'text-gray-600'}>Infos</span>
              <span className={currentStep >= 4 ? 'text-gray-900' : 'text-gray-600'}>Planning</span>
              <span className={currentStep >= 5 ? 'text-gray-900' : 'text-gray-600'}>Paiement</span>
              <span className={currentStep >= 6 ? 'text-gray-900' : 'text-gray-600'}>Confirmé</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                style={{width: `${(currentStep / 6) * 100}%`}}
              ></div>
            </div>
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className="order-content p-6 max-h-[70vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer avec navigation */}
        {currentStep < 6 && (
          <div className="order-footer bg-gray-900 p-6 flex justify-between items-center">
            <button 
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-outline-premium px-6 py-3 rounded-lg disabled:opacity-50"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Précédent
            </button>

            {/* Prix en temps réel */}
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">
                Total : €{orderData.total.toFixed(2)} TTC
              </div>
              <div className="text-sm text-gray-300">
                Acompte : €{orderData.deposit}
              </div>
            </div>

            <button 
              onClick={currentStep === 5 ? finalizeOrder : nextStep}
              className="btn-premium px-6 py-3 rounded-lg"
            >
              {currentStep === 5 ? (
                <>
                  <i className="fas fa-credit-card mr-2"></i>
                  FINALISER
                </>
              ) : (
                <>
                  Suivant
                  <i className="fas fa-arrow-right ml-2"></i>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .pack-selector {
          border: 2px solid transparent;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pack-selector:hover {
          border-color: rgba(212, 175, 55, 0.5);
        }

        .pack-selector.selected {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.1);
        }

        .option-item {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .option-item:hover {
          border-color: rgba(212, 175, 55, 0.5);
        }

        .option-item.selected {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.1);
        }

        .option-checkbox {
          width: 20px;
          height: 20px;
          accent-color: #D4AF37;
        }

        .form-label {
          display: block;
          color: #FBBF24;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(107, 114, 128, 0.5);
          border-radius: 8px;
          color: white;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #FBBF24;
          background: rgba(31, 41, 55, 1);
        }

        .form-input.error {
          border-color: #EF4444;
        }

        .error-text {
          color: #EF4444;
          font-size: 12px;
          margin-top: 4px;
        }

        .error-message {
          color: #EF4444;
          text-align: center;
          margin-top: 16px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
        }

        .step-number {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #D4AF37, #F59E0B);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          color: white;
          margin-right: 12px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}

export default OrderFlow