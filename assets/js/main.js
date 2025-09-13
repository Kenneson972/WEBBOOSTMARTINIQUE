/**
 * WebBoost Martinique - JavaScript Principal
 * Machine de vente + Navigation + Interactions
 * Version HTML/CSS/JS pour 02switch
 */

// Configuration globale
const WEBBOOST_CONFIG = {
    packs: {
        'essentiel': { name: 'Pack Essentiel Local', price: 890, pages: '3', delivery: '10 jours' },
        'pro': { name: 'Pack Vitrine Pro', price: 1290, pages: '5-6', delivery: '7-10 jours' },
        'premium': { name: 'Pack Vitrine Conversion', price: 1790, pages: '6-8', delivery: '10-12 jours' }
    },
    options: [
        { id: 'seo_local', name: 'SEO Local Avancé', price: 290 },
        { id: 'whatsapp_pro', name: 'WhatsApp Business Pro', price: 150 },
        { id: 'analytics_pro', name: 'Analytics & Conversion', price: 190 },
        { id: 'photos_pro', name: 'Pack Photos Pro', price: 240 },
        { id: 'email_marketing', name: 'Email Marketing', price: 170 },
        { id: 'boutique_simple', name: 'Boutique Simple', price: 350 }
    ],
    vatRate: 0.085, // TVA Martinique
    whatsappNumber: '596000000'
};

// Variables globales
let orderData = {
    step: 1,
    pack: '',
    options: [],
    customer: {},
    planning: {},
    pricing: { subtotal: 0, vat: 0, total: 0, deposit: 0 }
};

let mobileMenuOpen = false;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initWebBoost();
    initAnimations();
    initCookieBanner();
    setupNavigation();
    trackPageLoad();
});

function initWebBoost() {
    console.log('🚀 WebBoost Martinique - Version 02switch initialisée');
    
    // Smooth scroll pour ancres
    setupSmoothScroll();
    
    // Navigation scroll effect
    window.addEventListener('scroll', handleNavScroll);
    
    // Intersection Observer pour animations
    setupScrollAnimations();
    
    // Animation des compteurs
    setupCounterAnimations();
    
    // Resize handler
    window.addEventListener('resize', handleResize);
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navHeight = document.querySelector('.nav-premium').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Fermer menu mobile si ouvert
                closeMobileMenu();
            }
        });
    });
}

function handleNavScroll() {
    const nav = document.querySelector('.nav-premium');
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    // Observer éléments à animer
    document.querySelectorAll('.pack-card, .feature-item, .option-card').forEach(el => {
        observer.observe(el);
    });
}

// Navigation mobile
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    mobileMenuOpen = !mobileMenuOpen;
    
    if (mobileMenuOpen) {
        menu.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        menu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.remove('active');
    document.body.style.overflow = 'auto';
    mobileMenuOpen = false;
}

function setupNavigation() {
    // Fermer menu mobile si clic outside
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('mobile-menu');
        const btn = document.querySelector('.mobile-menu-btn');
        
        if (mobileMenuOpen && !menu.contains(e.target) && !btn.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

// Machine de vente - Tunnel de commande
function startOrder(preselectedPack = null) {
    // Reset order data
    orderData = {
        step: 1,
        pack: preselectedPack || '',
        options: [],
        customer: {},
        planning: {},
        pricing: { subtotal: 0, vat: 0, total: 0, deposit: 0 }
    };
    
    // Ouvrir modal
    const modal = document.getElementById('order-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialiser tunnel
    renderOrderModal();
    calculatePricing();
    
    // Analytics
    trackEvent('order_started', { pack: preselectedPack });
    
    console.log('🛒 Tunnel de commande démarré:', preselectedPack);
}

function orderPack(packKey) {
    startOrder(packKey);
    
    // Scroll vers le tunnel si nécessaire
    setTimeout(() => {
        document.getElementById('order-modal').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 100);
}

function closeOrder() {
    const modal = document.getElementById('order-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Analytics
    trackEvent('order_closed', { step: orderData.step });
}

function renderOrderModal() {
    const modal = document.getElementById('order-modal');
    modal.innerHTML = `
        <div class="order-container">
            <div class="order-header">
                <h2>
                    <i class="fas fa-shopping-cart mr-2"></i>
                    Commande WebBoost
                </h2>
                <button class="order-close-btn" onclick="closeOrder()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="order-progress">
                <div class="progress-steps">
                    <span class="progress-step ${orderData.step >= 1 ? 'active' : ''}" data-step="1">Pack</span>
                    <span class="progress-step ${orderData.step >= 2 ? 'active' : ''}" data-step="2">Options</span>
                    <span class="progress-step ${orderData.step >= 3 ? 'active' : ''}" data-step="3">Infos</span>
                    <span class="progress-step ${orderData.step >= 4 ? 'active' : ''}" data-step="4">Planning</span>
                    <span class="progress-step ${orderData.step >= 5 ? 'active' : ''}" data-step="5">Paiement</span>
                    <span class="progress-step ${orderData.step >= 6 ? 'active' : ''}" data-step="6">Confirmé</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(orderData.step / 6) * 100}%"></div>
                </div>
            </div>
            
            <div class="order-content" id="order-step-content">
                <!-- Contenu généré par renderOrderStep() -->
            </div>
            
            ${orderData.step < 6 ? `
                <div class="order-footer">
                    <button class="btn-outline-premium" onclick="prevOrderStep()" ${orderData.step === 1 ? 'style="visibility:hidden"' : ''}>
                        <i class="fas fa-arrow-left mr-2"></i>
                        Précédent
                    </button>
                    
                    <div class="order-pricing">
                        <div class="pricing-total">Total : €${orderData.pricing.total.toFixed(2)}</div>
                        <div class="pricing-deposit">Acompte : €${orderData.pricing.deposit}</div>
                    </div>
                    
                    <button class="btn-premium" onclick="nextOrderStep()">
                        ${orderData.step === 5 ? 'FINALISER' : 'Suivant'}
                        <i class="fas ${orderData.step === 5 ? 'fa-credit-card' : 'fa-arrow-right'} ml-2"></i>
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    renderOrderStep();
}

function nextOrderStep() {
    if (validateOrderStep()) {
        orderData.step++;
        renderOrderModal();
        
        if (orderData.step === 6) {
            // Finalisation commande
            finalizeOrder();
        }
    }
}

function prevOrderStep() {
    if (orderData.step > 1) {
        orderData.step--;
        renderOrderModal();
    }
}

function validateOrderStep() {
    switch(orderData.step) {
        case 1:
            if (!orderData.pack) {
                alert('Veuillez sélectionner un pack');
                return false;
            }
            break;
        case 3:
            if (!orderData.customer.nom || !orderData.customer.email || !orderData.customer.telephone) {
                alert('Veuillez remplir les champs obligatoires (nom, email, téléphone)');
                return false;
            }
            break;
    }
    return true;
}

function renderOrderStep() {
    const contentDiv = document.getElementById('order-step-content');
    if (!contentDiv) return;
    
    switch(orderData.step) {
        case 1:
            contentDiv.innerHTML = renderPackSelection();
            break;
        case 2:
            contentDiv.innerHTML = renderOptionsSelection();
            break;
        case 3:
            contentDiv.innerHTML = renderCustomerForm();
            break;
        case 4:
            contentDiv.innerHTML = renderPlanning();
            break;
        case 5:
            contentDiv.innerHTML = renderPayment();
            break;
        case 6:
            contentDiv.innerHTML = renderConfirmation();
            break;
    }
}

function renderPackSelection() {
    return `
        <div class="step-content">
            <h3 class="step-title">Sélectionnez votre pack</h3>
            <p class="step-desc">Choisissez la solution qui correspond à vos besoins</p>
            
            <div class="pack-selection-grid">
                ${Object.entries(WEBBOOST_CONFIG.packs).map(([key, pack]) => `
                    <div class="pack-selector ${orderData.pack === key ? 'selected' : ''}" 
                         onclick="selectPack('${key}')" data-pack="${key}">
                        <h4>${pack.name}</h4>
                        <div class="selector-price">€${pack.price} HT</div>
                        <div class="selector-deposit">Acompte : €${Math.round(pack.price * 0.5)}</div>
                        <p class="selector-desc">${pack.pages} pages • ${pack.delivery}</p>
                        <div class="selector-check">
                            <i class="fas ${orderData.pack === key ? 'fa-check-circle' : 'fa-circle'}"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function selectPack(packKey) {
    orderData.pack = packKey;
    calculatePricing();
    
    // Mettre à jour visual
    document.querySelectorAll('.pack-selector').forEach(el => {
        el.classList.remove('selected');
        el.querySelector('.selector-check i').className = 'fas fa-circle';
    });
    
    const selected = document.querySelector(`[data-pack="${packKey}"]`);
    selected.classList.add('selected');
    selected.querySelector('.selector-check i').className = 'fas fa-check-circle';
}

function calculatePricing() {
    if (!orderData.pack) return;
    
    const pack = WEBBOOST_CONFIG.packs[orderData.pack];
    const packPrice = pack.price;
    
    const optionsPrice = orderData.options.reduce((sum, optionId) => {
        const option = WEBBOOST_CONFIG.options.find(opt => opt.id === optionId);
        return sum + (option ? option.price : 0);
    }, 0);
    
    const subtotal = packPrice + optionsPrice;
    const vat = subtotal * WEBBOOST_CONFIG.vatRate;
    const total = subtotal + vat;
    const deposit = Math.round(subtotal * 0.5);
    
    orderData.pricing = { subtotal, vat, total, deposit };
}

function finalizeOrder() {
    const orderNumber = generateOrderNumber();
    orderData.orderNumber = orderNumber;
    orderData.status = 'pending_payment';
    orderData.createdAt = new Date().toISOString();
    
    // Sauvegarder commande localement
    saveOrder(orderData);
    
    // Analytics
    trackEvent('purchase_initiated', {
        order_number: orderNumber,
        pack: orderData.pack,
        total: orderData.pricing.total
    });
    
    console.log('✅ Commande finalisée:', orderNumber);
}

function generateOrderNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WB-${year}-${random}`;
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('webboost_orders') || '[]');
    orders.push(order);
    localStorage.setItem('webboost_orders', JSON.stringify(orders));
}

// Fonctions utilitaires
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const navHeight = document.querySelector('.nav-premium').offsetHeight;
        const targetPosition = element.offsetTop - navHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function addOption(optionId) {
    if (!orderData.options.includes(optionId)) {
        orderData.options.push(optionId);
        calculatePricing();
        
        // Feedback visuel
        showNotification(`Option ajoutée ! Total : €${orderData.pricing.total.toFixed(2)}`, 'success');
    }
}

// Analytics et tracking
function trackEvent(eventName, data = {}) {
    // Google Analytics 4
    if (typeof gtag === 'function') {
        gtag('event', eventName, {
            ...data,
            timestamp: new Date().toISOString()
        });
    }
    
    // Console pour développement
    console.log(`📊 Event: ${eventName}`, data);
    
    // Custom events pour intégrations tierces
    window.dispatchEvent(new CustomEvent('webboost-analytics', {
        detail: { event: eventName, data: data }
    }));
}

function trackPageLoad() {
    trackEvent('page_view', {
        page: 'homepage',
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
    });
}

// Gestion cookies
function initCookieBanner() {
    const cookieConsent = localStorage.getItem('webboost_cookie_consent');
    if (!cookieConsent) {
        // Afficher bannière après 2 secondes
        setTimeout(() => {
            document.getElementById('cookie-banner').classList.add('active');
        }, 2000);
    } else if (cookieConsent === 'accept') {
        // Activer analytics si accepté
        enableAnalytics();
    }
}

function acceptCookies() {
    localStorage.setItem('webboost_cookie_consent', 'accept');
    document.getElementById('cookie-banner').classList.remove('active');
    
    // Activer analytics
    enableAnalytics();
    
    // Analytics event
    trackEvent('cookie_consent', { action: 'accept' });
}

function refuseCookies() {
    localStorage.setItem('webboost_cookie_consent', 'refuse');
    document.getElementById('cookie-banner').classList.remove('active');
    
    // Analytics event (minimal)
    console.log('🍪 Cookies refusés');
}

function showCookieSettings() {
    // Réafficher bannière pour modification
    document.getElementById('cookie-banner').classList.add('active');
}

function enableAnalytics() {
    // Configuration GA4 si ID disponible
    if (window.GA_MEASUREMENT_ID) {
        gtag('consent', 'update', {
            'analytics_storage': 'granted',
            'ad_storage': 'denied'
        });
        
        gtag('config', window.GA_MEASUREMENT_ID, {
            'anonymize_ip': true
        });
    }
}

// Animations et interactions
function initAnimations() {
    // Intersection Observer pour animations on scroll
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Ajouter classe d'animation selon type
                if (element.classList.contains('pack-card')) {
                    element.style.animationDelay = `${Math.random() * 0.3}s`;
                    element.classList.add('animate-scale-in');
                } else if (element.classList.contains('feature-item')) {
                    element.style.animationDelay = `${Math.random() * 0.5}s`;
                    element.classList.add('animate-fade-in-up');
                }
                
                // Observer une seule fois
                animationObserver.unobserve(element);
            }
        });
    }, { threshold: 0.2 });
    
    // Appliquer observer aux éléments
    document.querySelectorAll('.pack-card, .feature-item, .badge-trust').forEach(el => {
        animationObserver.observe(el);
    });
}

function handleResize() {
    // Ajustements responsive si nécessaire
    const isMobile = window.innerWidth < 768;
    
    if (isMobile && mobileMenuOpen) {
        // Ajuster menu mobile
        const menu = document.getElementById('mobile-menu');
        menu.style.height = `${window.innerHeight - 80}px`;
    }
}

// Notifications toast
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Suppression automatique
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Formulaire brief projet
function submitBrief(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Validation basique
    if (!data.entreprise || !data.secteur || !data.telephone || !data.email) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Veuillez saisir une adresse email valide', 'error');
        return;
    }
    
    // Validation téléphone martiniquais
    const phoneRegex = /^(0596|596|\+596)/;
    if (!phoneRegex.test(data.telephone)) {
        showNotification('Veuillez saisir un numéro martiniquais (0596...)', 'error');
        return;
    }
    
    // Stocker les données du brief pour le tunnel de commande
    localStorage.setItem('webboost_brief', JSON.stringify(data));
    
    // Feedback utilisateur
    showNotification('Brief enregistré ! Choisissez maintenant votre pack ⬇️', 'success');
    
    // Scroll vers les packs après 1.5 secondes
    setTimeout(() => {
        scrollToSection('packs');
    }, 1500);
    
    // Analytics
    trackEvent('brief_submitted', {
        secteur: data.secteur,
        has_objectifs: !!data.objectifs
    });
    
    console.log('📋 Brief projet soumis:', data);
}

// Utilitaires
function formatPrice(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Gestion erreurs globales
window.addEventListener('error', function(e) {
    console.error('💥 Erreur WebBoost:', e.error);
    
    // Analytics erreur (si analytics activé)
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno
    });
});

// Export global
window.WebBoostApp = {
    startOrder,
    orderPack,
    closeOrder,
    toggleMobileMenu,
    closeMobileMenu,
    scrollToSection,
    acceptCookies,
    refuseCookies,
    showCookieSettings,
    submitContact,
    trackEvent,
    showNotification
};

// Animation des compteurs
function setupCounterAnimations() {
    const counters = document.querySelectorAll('.animate-count');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseFloat(counter.dataset.target);
                const numberElement = counter.querySelector('.badge-number');
                
                if (numberElement && !counter.hasAttribute('data-counted')) {
                    counter.setAttribute('data-counted', 'true');
                    animateCounter(numberElement, target);
                }
                
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element, target) {
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format selon le type de nombre
        if (target === 4.9) {
            element.textContent = current.toFixed(1) + '/5';
        } else if (target >= 100) {
            element.textContent = Math.floor(current) + '%';
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

console.log('🎯 WebBoost Martinique app ready!');