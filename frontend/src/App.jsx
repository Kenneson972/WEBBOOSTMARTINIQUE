import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom'
import OpenAIConfig from './OpenAIConfig'
import OfflineChatbot from './components/OfflineChatbot'
import OrderFlow from './components/OrderFlow'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

function Navigation() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <nav className="nav-premium">
      <div className="nav-container">
        <Link to="/" className="logo-premium">
          WebBoost Martinique
        </Link>
        
        {/* Desktop Navigation */}
        <div className="nav-links">
          <NavLink to="/packs">Packs</NavLink>
          <NavLink to="/options">Options</NavLink>
          <NavLink to="/modalites">Modalités</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <Link to="/contact" className="btn-premium px-6 py-3 rounded-lg">
            <i className="fas fa-rocket mr-2"></i>
            Devis gratuit
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <i className="fas fa-bars"></i>
        </button>
        
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="mobile-menu">
            <NavLink to="/packs" onClick={() => setShowMobileMenu(false)}>Packs</NavLink>
            <NavLink to="/options" onClick={() => setShowMobileMenu(false)}>Options</NavLink>
            <NavLink to="/modalites" onClick={() => setShowMobileMenu(false)}>Modalités</NavLink>
            <NavLink to="/contact" onClick={() => setShowMobileMenu(false)}>Contact</NavLink>
          </div>
        )}
      </div>
    </nav>
  )
}

function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-pattern relative pt-24 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8 animate-fade-in-up">
              Sites web qui <span className="gold-gradient">transforment</span><br />
              vos visiteurs en clients<br />
              <span className="text-yellow-400">en 7-12 jours</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 animate-fade-in-up animate-delay-200">
              Délais courts, tarifs locaux, SEO local expert et accompagnement continu.<br />
              <span className="text-yellow-400 font-semibold">Mobile-first et performance certifiée.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 animate-fade-in-up animate-delay-400">
              <Link to="/packs" className="btn-premium px-8 py-4 rounded-xl font-bold text-lg text-gray-900 w-full sm:w-auto">
                <i className="fas fa-chart-line mr-2"></i>
                Voir nos tarifs
              </Link>
              <a 
                href="https://wa.me/596000000" 
                className="btn-outline-premium px-8 py-4 rounded-xl font-bold text-lg w-full sm:w-auto"
                onClick={() => window.dispatchEvent(new Event('click_whatsapp'))}
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Parler sur WhatsApp
              </a>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-16 animate-fade-in-up animate-delay-600">
              <div className="badge-trust px-4 py-2 rounded-full text-sm font-semibold">
                <i className="fas fa-clock mr-1"></i>
                Délais 7-12 jours
              </div>
              <div className="badge-trust px-4 py-2 rounded-full text-sm font-semibold">
                <i className="fas fa-mobile-alt mr-1"></i>
                LCP &lt; 2,5s mobile
              </div>
              <div className="badge-trust px-4 py-2 rounded-full text-sm font-semibold">
                <i className="fas fa-search mr-1"></i>
                Schema + GBP
              </div>
              <div className="badge-trust px-4 py-2 rounded-full text-sm font-semibold">
                <i className="fas fa-edit mr-1"></i>
                Révisions incluses
              </div>
              <div className="badge-trust px-4 py-2 rounded-full text-sm font-semibold">
                <i className="fas fa-map-marker-alt mr-1"></i>
                Spécialiste Martinique
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Packs Section */}
      <section id="packs" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gold-gradient">Packs tarifaires</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Solutions adaptées au marché martiniquais avec garanties
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Pack Essentiel */}
            <div className="card-premium rounded-2xl p-8 relative">
              <div className="text-center mb-6">
                <div className="price-badge inline-block px-4 py-2 rounded-full text-2xl font-bold mb-4">
                  €890<span className="text-base font-medium">HT</span>
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">Pack Essentiel</h3>
                <p className="text-gray-400">Essentiel Local</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>3 pages professionnelles</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>SEO local de base</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>Tracking appels/clics</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>Design mobile-first</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>1 révision incluse</span>
                </li>
              </ul>
              
              <Link to="/contact" className="btn-premium w-full py-3 rounded-lg font-semibold text-gray-900">
                Choisir ce pack
              </Link>
            </div>
            
            {/* Pack Pro (Populaire) */}
            <div className="card-premium rounded-2xl p-8 relative transform scale-105 border-2 border-yellow-400">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  POPULAIRE
                </span>
              </div>
              
              <div className="text-center mb-6 mt-4">
                <div className="price-badge inline-block px-4 py-2 rounded-full text-2xl font-bold mb-4">
                  €1,290<span className="text-base font-medium">HT</span>
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">Pack Pro</h3>
                <p className="text-gray-400">Vitrine Pro</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>5-6 pages optimisées</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>SEO étendu</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>LCP &lt; 2,5s garanti</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>GA4 & Search Console</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>2 révisions incluses</span>
                </li>
              </ul>
              
              <Link to="/contact" className="btn-premium w-full py-3 rounded-lg font-semibold text-gray-900">
                Choisir ce pack
              </Link>
            </div>
            
            {/* Pack Premium */}
            <div className="card-premium rounded-2xl p-8 relative">
              <div className="text-center mb-6">
                <div className="price-badge inline-block px-4 py-2 rounded-full text-2xl font-bold mb-4">
                  €1,790<span className="text-base font-medium">HT</span>
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">Pack Premium</h3>
                <p className="text-gray-400">Vitrine Conversion</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>6-8 pages + conversion</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>Page Réserver/Devis optimisée</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>Tracking avancé</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>Formation 45min incluse</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle feature-check mt-1"></i>
                  <span>2 révisions incluses</span>
                </li>
              </ul>
              
              <Link to="/contact" className="btn-premium w-full py-3 rounded-lg font-semibold text-gray-900">
                Choisir ce pack
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Pourquoi choisir <span className="gold-gradient">WebBoost Martinique</span> ?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clock text-2xl text-gray-900"></i>
              </div>
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Délais Express</h3>
              <p className="text-gray-300">Livraison en 7-12 jours ouvrés contre 4-8 semaines ailleurs</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-map-marker-alt text-2xl text-gray-900"></i>
              </div>
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Expertise Locale</h3>
              <p className="text-gray-300">Solutions adaptées au marché martiniquais et aux TPE/PME locales</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-line text-2xl text-gray-900"></i>
              </div>
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Performance Garantie</h3>
              <p className="text-gray-300">LCP &lt; 2,5s mobile et optimisation SEO local incluse</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-handshake text-2xl text-gray-900"></i>
              </div>
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Accompagnement</h3>
              <p className="text-gray-300">Support continu et révisions incluses selon votre pack</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à <span className="gold-gradient">transformer</span> votre présence web ?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Rejoignez les entreprises martiniquaises qui font confiance à WebBoost
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link to="/contact" className="btn-premium px-8 py-4 rounded-xl font-bold text-lg text-gray-900 w-full sm:w-auto">
              <i className="fas fa-rocket mr-2"></i>
              Commencer mon projet
            </Link>
            <Link to="/contact" className="btn-outline-premium px-8 py-4 rounded-xl font-bold text-lg w-full sm:w-auto">
              <i className="fas fa-phone mr-2"></i>
              Consultation gratuite
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function PacksPage() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('pack_selection_view'))
  }, [])

  return (
    <div className="py-20 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gold-gradient">Packs détaillés</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choisissez la solution qui correspond à vos besoins et votre budget
          </p>
        </div>

        {/* Détail des packs ici - structure similaire à l'accueil mais plus détaillée */}
        <div className="space-y-8">
          {[
            {
              name: 'Essentiel Local',
              price: '890€ HT',
              features: ['3 pages professionnelles', 'SEO local de base', 'Données structurées', 'Tracking appels/clics', '1 révision ≤ 15 pts', 'Délai: 10 j', 'Paiement 50/40/10'],
              ideal: 'Parfait pour les artisans, commerçants et professions libérales qui veulent une présence web efficace.'
            },
            {
              name: 'Vitrine Pro',
              price: '1 290€ HT', 
              features: ['5-6 pages optimisées', 'SEO on-page étendu', 'LCP < 2,5s & CLS < 0,1', 'Alignement GBP + GA4 + GSC', '2 révisions ≤ 20 pts', 'Délai: 7-10 j', 'Formation référencement'],
              ideal: 'Idéal pour les entreprises qui veulent se démarquer localement et attirer plus de clients.',
              popular: true
            },
            {
              name: 'Vitrine Conversion',
              price: '1 790€ HT',
              features: ['6-8 pages + Réserver/Devis', 'Tracking avancé + schema enrichi', 'Formation 45min', 'SEO expert + CRO', '2 révisions ≤ 25 pts', 'Délai: 10-12 j', 'Accompagnement 3 mois'],
              ideal: 'Pour les entreprises ambitieuses qui veulent maximiser leurs conversions et leur croissance.'
            }
          ].map((pack) => (
            <div key={pack.name} className={`card-premium rounded-2xl p-8 ${pack.popular ? 'border-2 border-yellow-400 transform scale-105' : ''}`}>
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                    POPULAIRE
                  </span>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="price-badge inline-block px-4 py-2 rounded-full text-2xl font-bold mb-4">
                    {pack.price}
                  </div>
                  <h3 className="text-3xl font-bold text-yellow-400 mb-2">{pack.name}</h3>
                  <p className="text-gray-300 text-lg mb-6">{pack.ideal}</p>
                  <Link to="/contact" className="btn-premium px-8 py-3 rounded-lg font-semibold text-gray-900">
                    Choisir {pack.name}
                  </Link>
                </div>
                
                <div>
                  <h4 className="text-xl font-semibold text-gold mb-4">✨ Inclus dans ce pack :</h4>
                  <ul className="space-y-3">
                    {pack.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <i className="fas fa-check-circle feature-check mt-1"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OptionsPage() {
  return (
    <div className="py-20 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gold-gradient">Options à la carte</span>
          </h1>
          <p className="text-xl text-gray-300">Personnalisez votre site selon vos besoins</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {title: 'Page supplémentaire', price: '150€ HT', features: ['Page complète avec SEO', 'Design cohérent', 'Responsive', 'Intégration au menu']},
            {title: 'E-commerce WooCommerce', price: '400€ HT', features: ['Installation WooCommerce', 'Jusqu\'à 10 produits', 'Paiement sécurisé', 'Gestion des commandes']},
            {title: 'Formation WordPress', price: '180€ HT', features: ['2h de formation personnalisée', 'Support téléphonique', 'Documentation fournie', 'Suivi 30 jours']},
            {title: 'Maintenance mensuelle', price: '50€ HT/mois', features: ['Mises à jour WordPress', 'Sauvegarde automatique', 'Support technique', 'Monitoring sécurité']}
          ].map((option) => (
            <div key={option.title} className="card-premium rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-yellow-400">{option.title}</h3>
                <div className="price-badge px-4 py-2 rounded-full font-bold">
                  {option.price}
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <i className="fas fa-check-circle feature-check mt-1"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/contact" className="btn-premium w-full py-3 rounded-lg font-semibold text-gray-900">
                Ajouter cette option
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ModalitesPage() {
  return (
    <div className="py-20 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gold-gradient">Modalités & Garanties</span>
          </h1>
        </div>

        <div className="space-y-8">
          <div className="card-premium rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center">
              <i className="fas fa-credit-card mr-3"></i>
              Paiement échelonné 50/40/10
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-400 mb-2">50%</div>
                <p className="font-semibold mb-2">À la commande</p>
                <p className="text-sm text-gray-300">Acompte pour lancer votre projet</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-400 mb-2">40%</div>
                <p className="font-semibold mb-2">Avant mise en ligne</p>
                <p className="text-sm text-gray-300">Validation finale de votre site</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-400 mb-2">10%</div>
                <p className="font-semibold mb-2">À la livraison</p>
                <p className="text-sm text-gray-300">Solde à la mise en ligne</p>
              </div>
            </div>
          </div>

          <div className="card-premium rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center">
              <i className="fas fa-shield-alt mr-3"></i>
              Garanties & Révisions
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <i className="fas fa-check-circle feature-check mt-1"></i>
                <span><strong>Révisions incluses :</strong> Selon votre pack (1 à 2 révisions comprises)</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle feature-check mt-1"></i>
                <span><strong>Révisions supplémentaires :</strong> 60€/h (minimum 1h) avec délai de 48h</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle feature-check mt-1"></i>
                <span><strong>Garantie bugs :</strong> 15 jours post-livraison pour correction gratuite</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle feature-check mt-1"></i>
                <span><strong>Délais :</strong> Déclenchés à réception complète de vos contenus</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sector: '',
    pack: '',
    message: '',
    consent: false
  })
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.phone || !formData.consent) {
      alert('Email, téléphone et consentement sont requis.')
      return
    }
    
    setStatus('loading')
    
    try {
      const response = await fetch(`${BACKEND_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setStatus('success')
        alert('Merci ! Nous vous recontactons sous 24h ouvrées.')
        setFormData({name: '', email: '', phone: '', sector: '', pack: '', message: '', consent: false})
        window.dispatchEvent(new Event('contact_form_submit'))
      } else {
        throw new Error('Erreur serveur')
      }
    } catch (error) {
      setStatus('error')
      alert('Une erreur est survenue. Merci de réessayer.')
    }
  }

  return (
    <div className="py-20 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gold-gradient">Parlons de votre projet</span>
          </h1>
          <p className="text-xl text-gray-300">Devis gratuit et sans engagement</p>
        </div>

        <div className="card-premium rounded-2xl p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">Nom et Prénom *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">Email *</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">Téléphone *</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">Secteur d'activité</label>
                <input 
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-yellow-400 font-semibold mb-2">Pack souhaité</label>
              <select 
                value={formData.pack}
                onChange={(e) => setFormData({...formData, pack: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition-all"
              >
                <option value="">À définir ensemble</option>
                <option value="Essentiel Local">Essentiel Local (890€ HT)</option>
                <option value="Vitrine Pro">Vitrine Pro (1290€ HT)</option>
                <option value="Vitrine Conversion">Vitrine Conversion (1790€ HT)</option>
              </select>
            </div>

            <div>
              <label className="block text-yellow-400 font-semibold mb-2">Décrivez votre projet</label>
              <textarea 
                rows="5" 
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Votre activité, vos objectifs, vos besoins spécifiques..."
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition-all"
              ></textarea>
            </div>

            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                required
                checked={formData.consent}
                onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                className="mt-1"
              />
              <label className="text-sm text-gray-300">
                J'accepte que mes données soient utilisées pour être recontacté. 
                <Link to="/cookies" className="text-yellow-400 underline ml-1">En savoir plus</Link>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="btn-premium w-full py-4 rounded-lg font-semibold text-gray-900 text-lg"
            >
              <i className="fas fa-paper-plane mr-2"></i>
              {status === 'loading' ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ConfigPage() {
  return (
    <div className="py-20 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gold-gradient">Configuration ChatBot IA</span>
          </h1>
          <p className="text-xl text-gray-300">Configurez l'intelligence artificielle de votre chatbot</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <OpenAIConfig />
        </div>
      </div>
    </div>
  )
}

function MentionsPage() {
  return (
    <div className="py-20 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span className="gold-gradient">Mentions légales</span>
        </h1>
        <div className="card-premium rounded-2xl p-8">
          <p className="text-gray-300">Informations éditeur, hébergeur, et politique de confidentialité. (À compléter)</p>
        </div>
      </div>
    </div>
  )
}

function CookiesPage() {
  return (
    <div className="py-20 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span className="gold-gradient">Politique de cookies</span>
        </h1>
        <div className="card-premium rounded-2xl p-8">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Cookies utilisés sur ce site</h3>
          <ul className="space-y-3 text-gray-300">
            <li><strong>Cookies de mesure (Google Analytics) :</strong> Pour comprendre l'utilisation du site</li>
            <li><strong>Cookies de préférences :</strong> Pour mémoriser vos choix de consentement</li>
            <li><strong>Cookies techniques :</strong> Nécessaires au fonctionnement du site</li>
          </ul>
          
          <h3 className="text-xl font-bold text-yellow-400 mb-4 mt-8">Vos droits</h3>
          <p className="text-gray-300">
            Vous pouvez accepter ou refuser les cookies via la bannière en bas de page. 
            En cas de refus, seuls les cookies techniques seront conservés.
          </p>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer-premium">
      <div className="container-premium">
        <p>&copy; {new Date().getFullYear()} WebBoost Martinique. Spécialiste de la transformation numérique locale.</p>
        <div className="flex justify-center items-center gap-6 mt-4">
          <Link to="/mentions" className="text-gray-400 hover:text-gold transition-colors">
            Mentions légales
          </Link>
          <Link to="/cookies" className="text-gray-400 hover:text-gold transition-colors">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  )
}

function EnhancedChatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key'))
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('openai_model') || 'gpt-4o-mini')
  const [messages, setMessages] = useState([{
    role: 'assistant', 
    content: "Bonjour ! Je suis l'assistant WebBoost Martinique 🇲🇶\nComment puis-je vous accompagner dans votre projet web ?\n\n💡 Cliquez sur ⚙️ pour configurer l'IA avancée"
  }])
  
  const send = async (text) => {
    const content = (text ?? input).trim()
    if(!content) return
    setMessages(m=>[...m,{role:'user', content}])
    setInput('')
    
    try{
      if(!BACKEND_URL) throw new Error('Missing backend URL')
      
      // Use OpenAI endpoint if we have a key, otherwise fallback
      const endpoint = apiKey ? '/chat/openai' : '/chat'
      const payload = apiKey 
        ? { message: content, api_key: apiKey, model: selectedModel }
        : { messages: [{role: 'user', content: content}], temperature: 0.3 }
      
      const res = await fetch(`${BACKEND_URL}${endpoint}`, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`)
      }
      
      const j = await res.json()
      const reply = j.reply || j.message || '...'
      setMessages(m=>[...m,{role:'assistant', content: reply}])
      
      if(content.toLowerCase().includes('whatsapp')) {
        window.dispatchEvent(new CustomEvent('click_whatsapp'))
      }
    }catch(e){
      console.error('Chatbot error:', e)
      let errorMessage = "Désolé, une erreur est survenue. "
      if (e.message.includes('api key') || e.message.includes('authentication')) {
        errorMessage += "Vérifiez votre clé API OpenAI dans les paramètres ⚙️."
      } else if (e.message.includes('quota')) {
        errorMessage += "Quota OpenAI dépassé. Vérifiez votre compte OpenAI."
      } else {
        errorMessage += "Réessayez dans un instant."
      }
      setMessages(m=>[...m,{role:'assistant', content: errorMessage}])
    }
  }
  
  const onKeyValidated = (key, model) => {
    setApiKey(key)
    setSelectedModel(model)
    setShowConfig(false)
    setMessages(m=>[...m,{role:'assistant', content: "✅ Configuration mise à jour ! L'IA avancée est maintenant activée."}])
  }
  
  const quick = [
    'Voir les prix en Martinique',
    'Comprendre le paiement 50/40/10', 
    'Parler directement sur WhatsApp',
    'Calculer mon délai de livraison'
  ]

  return (
    <>
      <button className="chat-fab animate-pulse-glow" onClick={() => setOpen(!open)}>
        <i className="fas fa-comments"></i>
      </button>
      
      {open && (
        <div className="chat-panel">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-yellow-400 flex items-center">
              <i className="fas fa-robot mr-2"></i>
              Assistant WebBoost
            </h4>
            <div className="flex items-center gap-2">
              <button 
                className="text-gold hover:text-yellow-400 text-lg transition-colors"
                onClick={() => setShowConfig(!showConfig)}
                title="Configurer IA"
              >
                <i className="fas fa-cog"></i>
              </button>
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          {showConfig && (
            <div className="mb-4 max-h-64 overflow-y-auto">
              <OpenAIConfig onKeyValidated={onKeyValidated} />
            </div>
          )}
          
          <div className="h-64 overflow-y-auto space-y-3 mb-4 pr-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900' 
                    : 'bg-gray-800/80 text-white'
                }`}>
                  {m.content.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < m.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {quick.map(q => (
                <button 
                  key={q} 
                  className="badge-trust px-3 py-1 rounded-full text-xs font-medium"
                  onClick={() => send(q)}
                >
                  {q}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder="Tapez votre message..." 
                className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                onKeyPress={e => e.key === 'Enter' && send()} 
              />
              <button 
                onClick={() => send()}
                className="btn-premium px-4 py-3 rounded-lg"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
            
            <p className="text-xs text-gray-400 text-center">
              {apiKey ? (
                <span className="text-green-400">
                  <i className="fas fa-check-circle mr-1"></i>
                  IA avancée activée
                </span>
              ) : (
                <span className="text-yellow-400">
                  <i className="fas fa-info-circle mr-1"></i>
                  Mode basique - Cliquez ⚙️ pour l'IA avancée
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function CookieBanner() {
  const [shown, setShown] = useState(() => !localStorage.getItem('cookie-consent'))
  
  if (!shown) return null

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accept')
    setShown(false)
    if (window.gtag) {
      window.gtag('consent', 'update', { 'analytics_storage': 'granted' })
    }
  }

  const handleRefuse = () => {
    localStorage.setItem('cookie-consent', 'refuse')
    setShown(false)
  }

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p className="text-sm text-gray-300">
          Nous utilisons des cookies pour mesurer l'audience de façon anonyme et améliorer votre expérience.
          Vous pouvez accepter tous les cookies ou les refuser.
        </p>
        <div className="cookie-buttons">
          <button 
            onClick={handleRefuse}
            className="btn-cookie-refuse"
          >
            Refuser tous les cookies
          </button>
          <button 
            onClick={handleAccept}
            className="btn-cookie-accept"
          >
            Accepter tous les cookies
          </button>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [kpi, setKpi] = useState(null)
  
  useEffect(() => {
    const loadKPI = async () => {
      try {
        if (!BACKEND_URL) return
        const response = await fetch(`${BACKEND_URL}/kpi`)
        const data = await response.json()
        setKpi(data)
      } catch (error) {
        console.error('KPI loading error:', error)
      }
    }
    loadKPI()
  }, [])

  return (
    <div className="py-20 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span className="gold-gradient">Dashboard (caché)</span>
        </h1>
        <div className="card-premium rounded-2xl p-8">
          <pre className="text-sm text-gray-300 overflow-auto">
            {JSON.stringify(kpi, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [showOrderFlow, setShowOrderFlow] = useState(false)
  const [selectedPack, setSelectedPack] = useState(null)

  const startOrder = (pack = null) => {
    setSelectedPack(pack)
    setShowOrderFlow(true)
  }

  const closeOrder = () => {
    setShowOrderFlow(false)
    setSelectedPack(null)
  }

  return (
    <div className="gradient-bg min-h-screen text-white">
      <Navigation startOrder={startOrder} />
      
      <Routes>
        <Route path="/" element={<HomePage startOrder={startOrder} />} />
        <Route path="/packs" element={<PacksPage startOrder={startOrder} />} />
        <Route path="/options" element={<OptionsPage />} />
        <Route path="/modalites" element={<ModalitesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/mentions" element={<MentionsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      
      <Footer />
      <OfflineChatbot />
      <CookieBanner />
      
      {/* Tunnel de commande */}
      {showOrderFlow && (
        <OrderFlow 
          selectedPack={selectedPack}
          onClose={closeOrder}
        />
      )}
    </div>
  )
}