import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL

function Nav() {
  const [showMobileNav, setShowMobileNav] = useState(false)
  const navClasses = ({ isActive }) => isActive ? 'text-[#D4AF37]' : 'nav-links a'
  
  return (
    <header className="header-premium">
      <div className="nav-premium">
        <Link to="/" className="logo-premium">
          <span className="logo-text">WebBoost</span>
          <span className="logo-accent">Martinique</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="nav-links">
          <NavLink to="/packs" className={navClasses}>Packs</NavLink>
          <NavLink to="/options" className={navClasses}>Options</NavLink>
          <NavLink to="/modalites" className={navClasses}>Modalités</NavLink>
          <NavLink to="/impact" className={navClasses}>Impact</NavLink>
          <NavLink to="/contact" className="btn-cta-header">Devis gratuit</NavLink>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="mobile-nav text-wb-gold text-2xl"
          onClick={() => setShowMobileNav(!showMobileNav)}
        >
          ☰
        </button>
        
        {/* Mobile Navigation */}
        {showMobileNav && (
          <div className="mobile-nav-menu">
            <NavLink to="/packs" className="mobile-nav-link" onClick={() => setShowMobileNav(false)}>Packs</NavLink>
            <NavLink to="/options" className="mobile-nav-link" onClick={() => setShowMobileNav(false)}>Options</NavLink>
            <NavLink to="/modalites" className="mobile-nav-link" onClick={() => setShowMobileNav(false)}>Modalités</NavLink>
            <NavLink to="/impact" className="mobile-nav-link" onClick={() => setShowMobileNav(false)}>Impact</NavLink>
            <NavLink to="/contact" className="mobile-nav-link" onClick={() => setShowMobileNav(false)}>Contact</NavLink>
          </div>
        )}
      </div>
    </header>
  )
}

function Footer(){
  return (
    <footer className="footer-premium">
      <p>&copy; {new Date().getFullYear()} WebBoost Martinique. Spécialiste de la transformation numérique locale.</p>
      <div className="mt-4 space-x-6">
        <Link to="/mentions" className="text-gray-400 hover:text-wb-gold transition-colors">Mentions légales</Link>
        <Link to="/cookies" className="text-gray-400 hover:text-wb-gold transition-colors">Cookies</Link>
      </div>
    </footer>
  )
}

function Home(){
  return (
    <main>
      {/* Hero Section Premium */}
      <section className="hero-premium">
        <div className="bg-gradient-to-br from-wb-black via-gray-900 to-wb-black">
          <div className="geometric-overlay opacity-10"></div>
          
          <div className="hero-content max-w-6xl mx-auto">
            <h1 className="animate-fade-in-up">
              Sites vitrines martiniquais qui 
              <span className="gradient-text"> transforment </span>
              vos visiteurs en clients en 7-12 jours
            </h1>
            
            <p className="animate-fade-in-up">
              Délais courts, tarifs locaux, SEO local expert et accompagnement continu.
              Mobile-first et performance certifiée.
            </p>
            
            <div className="cta-group animate-fade-in-up">
              <Link to="/packs" className="btn-premium-primary">
                Voir les tarifs martiniquais
              </Link>
              <a href="https://wa.me/596000000" 
                 className="btn-premium-secondary"
                 onClick={() => window.dispatchEvent(new Event('click_whatsapp'))}>
                Parler sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section Packs Premium Preview */}
      <section className="section-premium">
        <div className="max-w-7xl mx-auto px-4">
          <div className="section-header">
            <h2 className="section-title">Packs tarifaires</h2>
            <p className="section-subtitle">
              Solutions adaptées au marché martiniquais avec garanties
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="pack-card animate-fade-in-up">
              <div className="pack-badge">Pack Essentiel</div>
              <div className="price-premium">
                <span className="currency">€</span>
                <span className="amount">890</span>
                <span className="period">HT</span>
              </div>
              <h3 className="pack-title">Essentiel Local</h3>
              <p className="text-gray-300">3 pages, SEO local de base, tracking appels/clics</p>
            </div>

            <div className="pack-card animate-fade-in-up">
              <div className="pack-badge">Pack Pro</div>
              <div className="price-premium">
                <span className="currency">€</span>
                <span className="amount">1 290</span>
                <span className="period">HT</span>
              </div>
              <h3 className="pack-title">Vitrine Pro</h3>
              <p className="text-gray-300">5-6 pages, SEO étendu, LCP {"< 2,5s"}, GA4 & Search Console</p>
            </div>

            <div className="pack-card animate-fade-in-up">
              <div className="pack-badge">Pack Premium</div>
              <div className="price-premium">
                <span className="currency">€</span>
                <span className="amount">1 790</span>
                <span className="period">HT</span>
              </div>
              <h3 className="pack-title">Vitrine Conversion</h3>
              <p className="text-gray-300">6-8 pages, page Réserver/Devis optimisée, tracking avancé</p>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Premium */}
      <section className="section-premium bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="badges-premium">
            <span className="badge-premium animate-float">Délais 7-12 jours</span>
            <span className="badge-premium animate-float">LCP {"< 2,5s"} mobile</span>
            <span className="badge-premium animate-float">Schema + GBP</span>
            <span className="badge-premium animate-float">Révisions incluses</span>
            <span className="badge-premium animate-float">Spécialiste Martinique</span>
          </div>
        </div>
      </section>
    </main>
  )
}

function Packs(){
  useEffect(()=>{ window.dispatchEvent(new CustomEvent('pack_selection_view')) }, [])
  return (
    <div className="section-premium">
      <div className="max-w-7xl mx-auto px-4">
        <div className="section-header">
          <h1 className="section-title">Packs tarifaires</h1>
          <p className="section-subtitle">Solutions adaptées au marché martiniquais</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {[
            {title:'Essentiel Local', price:'890€ HT', points:['3 pages','SEO local de base','Données structurées','Tracking appels/clics','1 révision ≤ 15 pts','Délai: 10 j']},
            {title:'Vitrine Pro', price:'1 290€ HT', points:['5-6 pages','SEO on-page étendu','LCP < 2,5s & CLS < 0,1','Alignement GBP + GA4 + GSC','2 révisions ≤ 20 pts','Délai: 7-10 j']},
            {title:'Vitrine Conversion', price:'1 790€ HT', points:['6-8 pages + Réserver/Devis','Tracking avancé + schema enrichi','Formation 45min','SEO expert + CRO','2 révisions ≤ 25 pts','Délai: 10-12 j']},
          ].map((p)=> (
            <div key={p.title} className="pack-card">
              <div className="pack-badge">{p.title}</div>
              <div className="price-premium">
                <span className="currency">€</span>
                <span className="amount">{p.price.split('€')[0]}</span>
                <span className="period">HT</span>
              </div>
              <h3 className="pack-title">{p.title}</h3>
              <ul className="features-premium">
                {p.points.map(pt => (
                  <li key={pt} className="feature-item">
                    <svg className="check-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {pt}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn-pack-select">Choisir ce pack</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Options(){
  return (
    <div className="container-premium py-12">
      <h2 className="h1 mb-8">Options à la carte</h2>
      <ul className="grid md:grid-cols-2 gap-6">
        {[
          'Rédaction web ≤ 800 mots : 180€ HT',
          'Optimisation 20 images : 120€ HT',
          'Page locale supplémentaire : 120€ HT/page',
          'Intégration réservation : 150-300€ HT',
          'Traduction FR-EN (3 pages) : 150€ HT',
        ].map((o)=> <li key={o} className="card p-6">{o}</li>)}
      </ul>

      <h3 className="h2 mt-10">Services récurrents</h3>
      <div className="grid md:grid-cols-3 gap-6 mt-4">
        {[
          {title:'Maintenance Basic', price:'49€ HT/mois', pts:['Mises à jour + sauvegardes + sécurité','Support email']},
          {title:'Maintenance Pro', price:'89€ HT/mois', pts:['Tout Basic + 1h modifs/mois','Rapport performance/SEO local']},
          {title:'Croissance Locale', price:'149€ HT/mois', pts:['Tout Pro + optimisation GBP','2 posts/mois + mini-SEO continu']},
        ].map((o)=> (
          <div key={o.title} className="card p-6">
            <div className="flex items-baseline justify-between">
              <h4 className="h2">{o.title}</h4>
              <span className="text-[#D4AF37] font-semibold">{o.price}</span>
            </div>
            <ul className="mt-3 text-white/80 space-y-1">{o.pts.map(pt => <li key={pt}>• {pt}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function Modalites(){
  return (
    <div className="container-premium py-12">
      <h2 className="h1 mb-6">Modalités 50/40/10 — Révisions & Garanties</h2>
      <div className="prose prose-invert max-w-none">
        <p>• 50% à la commande (acompte) · 40% avant mise en ligne (validation V2) · 10% à la livraison.</p>
        <p>• Révisions extra : 60€/h (min 1h) + 48h délai · Délais déclenchés à réception complète des contenus · Garantie bugs : 15 jours post-livraison.</p>
      </div>
    </div>
  )
}

function Impact(){
  return (
    <div className="container-premium py-12">
      <h2 className="h1 mb-4">Impact territorial</h2>
      <p className="text-white/80 max-w-3xl">En Martinique, 74% de la population est en difficulté avec le numérique contre 33% en métropole. Notre mission : accompagner les 100% d'entreprises digitalisées d'ici 2028.</p>
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {['Délais 3x plus courts','Tarifs adaptés','Expertise fracture numérique'].map(t => <div key={t} className="card p-6">{t}</div>)}
      </div>
    </div>
  )
}

function Mentions(){
  return (
    <div className="container-premium py-12">
      <h2 className="h1 mb-4">Mentions légales</h2>
      <p className="text-white/80">Informations éditeur, hébergeur, et politique de confidentialité. (Placeholders)</p>
    </div>
  )
}

function CookiesPolicy(){
  return (
    <div className="container-premium py-12">
      <h2 className="h1 mb-4">Politique de cookies</h2>
      <p className="text-white/80">Cette bannière permet d'accepter ou refuser les cookies de mesure (GA4). Lien présent en bas de page.</p>
    </div>
  )
}

function Contact(){
  const [form, setForm] = useState({name:'', email:'', phone:'', sector:'', pack:'', message:'', consent:false})
  const [status, setStatus] = useState('idle')

  const submit = async (e) => {
    e.preventDefault()
    if(!form.email || !form.phone || !form.consent){
      alert('Email, téléphone et consentement requis.')
      return
    }
    if(!BACKEND_URL){
      alert('Configuration manquante: REACT_APP_BACKEND_URL')
      return
    }
    try{
      setStatus('loading')
      const res = await fetch(`${BACKEND_URL}/contact`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        ...form,
        pack: form.pack || null,
        consent: !!form.consent,
      })})
      if(!res.ok) throw new Error('Erreur serveur')
      setStatus('success')
      window.dispatchEvent(new CustomEvent('contact_form_submit'))
      setForm({name:'', email:'', phone:'', sector:'', pack:'', message:'', consent:false})
      alert('Merci ! Nous vous recontactons sous 24h ouvrées.')
    }catch(err){
      console.error(err)
      setStatus('error')
      alert("Une erreur est survenue. Merci de réessayer.")
    }
  }

  return (
    <div className="container-premium py-12">
      <h2 className="h1 mb-6">Contact</h2>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-6">
        <input className="card p-3" placeholder="Nom" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
        <input className="card p-3" placeholder="Email*" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
        <input className="card p-3" placeholder="Téléphone*" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
        <input className="card p-3" placeholder="Secteur d'activité" value={form.sector} onChange={e=>setForm(f=>({...f,sector:e.target.value}))} />
        <select className="card p-3" value={form.pack} onChange={e=>setForm(f=>({...f,pack:e.target.value}))}>
          <option value="">Pack intéressé</option>
          <option>Essentiel Local</option>
          <option>Vitrine Pro</option>
          <option>Vitrine Conversion</option>
        </select>
        <textarea className="card p-3 md:col-span-2" rows="5" placeholder="Message" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}></textarea>
        <label className="md:col-span-2 flex items-start gap-3 text-sm text-white/80">
          <input type="checkbox" checked={form.consent} onChange={e=>setForm(f=>({...f,consent:e.target.checked}))} />
          <span>J'accepte que mes données soient utilisées pour être recontacté. <Link to="/cookies" className="underline">En savoir plus</Link></span>
        </label>
        <button className="btn-primary md:col-span-2" disabled={status==='loading'}>Envoyer</button>
      </form>
    </div>
  )
}

function Dashboard(){
  const [kpi, setKpi] = useState(null)
  useEffect(()=>{ (async()=>{ try{ if(!BACKEND_URL) return; const r = await fetch(`${BACKEND_URL}/kpi`); const j = await r.json(); setKpi(j) }catch(e){ console.error(e) } })() },[])
  return (
    <div className="container-premium py-12">
      <h2 className="h1 mb-6">Dashboard (caché)</h2>
      <pre className="card p-4 overflow-auto">{JSON.stringify(kpi, null, 2)}</pre>
    </div>
  )
}

function Chatbot(){
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([{role:'assistant', content:"Bonjour ! Je suis l'assistant WebBoost Martinique 🇲🇶\nComment puis-je vous accompagner dans votre projet web ?"}])
  const send = async (text) => {
    const content = (text ?? input).trim()
    if(!content) return
    setMessages(m=>[...m,{role:'user', content}])
    setInput('')
    try{
      if(!BACKEND_URL) throw new Error('Missing backend URL')
      const res = await fetch(`${BACKEND_URL}/chat`, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ message: content }) 
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      const j = await res.json()
      setMessages(m=>[...m,{role:'assistant', content: j.reply || '...'}])
      if(content.toLowerCase().includes('whatsapp')) window.dispatchEvent(new CustomEvent('click_whatsapp'))
    }catch(e){
      console.error('Chatbot error:', e)
      setMessages(m=>[...m,{role:'assistant', content: "Désolé, une erreur est survenue. Réessayez dans un instant."}])
    }
  }
  // quick replies
  const quick = [
    'Voir les prix spécial Martinique',
    'Comprendre le paiement 50/40/10',
    'Parler directement sur WhatsApp',
    'Calculer mon délai de livraison',
  ]

  // lazy-load after LCP
  useEffect(()=>{
    const t = setTimeout(()=> setOpen(false), 1200)
    return ()=> clearTimeout(t)
  },[])

  return (
    <>
      <button className="chat-fab" onClick={()=>setOpen(o=>!o)} aria-label="Chatbot">💬</button>
      {open && (
        <div className="chat-panel">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Assistant WebBoost</h4>
            <button className="text-white/60 hover:text-white" onClick={()=>setOpen(false)}>✕</button>
          </div>
          <div className="h-64 overflow-y-auto space-y-2 mb-3 pr-2">
            {messages.map((m,i)=> (
              <div key={i} className={m.role==='user' ? 'text-right' : ''}>
                <div className={`inline-block card px-3 py-2 ${m.role==='user' ? 'bg-[#D4AF37] text-[#0B0B0D]' : ''}`}>{m.content}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-2 mb-2">
            <div className="flex flex-wrap gap-2">
              {quick.map(q => <button key={q} className="badge" onClick={()=>send(q)}>{q}</button>)}
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Écrire un message..." className="flex-1 card px-3 py-2" />
              <button className="btn-primary" onClick={()=>send()}>Envoyer</button>
            </div>
            <p className="text-xs text-white/50">En utilisant le chat, vous acceptez la <Link to="/cookies" className="underline">Politique cookies</Link>. Opt-out à tout moment.</p>
          </div>
        </div>
      )}
    </>
  )
}

function CookieBanner(){
  const [seen, setSeen] = useState(() => localStorage.getItem('cookie-consent'))
  if(seen) return null
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[#0B0B0D]/90 backdrop-blur">
      <div className="container-premium py-4 flex flex-wrap items-center gap-3 justify-between">
        <p className="text-sm text-white/80">Nous utilisons des cookies de mesure anonymisés pour améliorer l'expérience. Vous pouvez accepter ou refuser.</p>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={()=>{localStorage.setItem('cookie-consent','refuse'); setSeen('refuse')}}>Refuser</button>
          <button className="btn-primary" onClick={()=>{localStorage.setItem('cookie-consent','accept'); setSeen('accept')}}>Accepter</button>
        </div>
      </div>
    </div>
  )
}

function Layout(){
  const { pathname } = useLocation()
  useEffect(()=>{ window.scrollTo(0,0) }, [pathname])
  return (
    <div className="min-h-full flex flex-col">
      <Nav />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/packs" element={<Packs/>} />
          <Route path="/options" element={<Options/>} />
          <Route path="/modalites" element={<Modalites/>} />
          <Route path="/impact" element={<Impact/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/mentions" element={<Mentions/>} />
          <Route path="/cookies" element={<CookiesPolicy/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
        </Routes>
      </div>
      <Footer />
      <Chatbot />
      <CookieBanner />
    </div>
  )
}

export default function App(){
  return <Layout />
}