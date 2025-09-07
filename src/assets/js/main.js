/**
 * WebBoost Martinique - JavaScript Principal
 * Machine de vente + Navigation + Interactions
 */

// Variables globales
let currentOrderStep = 1;
let orderData = {
    pack: '',
    options: [],
    customer: {},
    total: 0,
    deposit: 0
};

// Configuration packs
const PACKS = {
    'essentiel': { name: 'Pack Essentiel Local', price: 890, features: ['3 pages', 'SEO base', 'Mobile-first', '1 révision'] },
    'pro': { name: 'Pack Vitrine Pro', price: 1290, features: ['5-6 pages', 'SEO étendu', 'GA4', '2 révisions'] },
    'premium': { name: 'Pack Vitrine Conversion', price: 1790, features: ['6-8 pages', 'Conversion', 'Formation', '2 révisions'] }
};

// Options disponibles
const OPTIONS = [
    { id: 'content', name: 'Rédaction 800 mots', price: 180 },
    { id: 'images', name: 'Optimisation 20 images', price: 120 },
    { id: 'page_extra', name: 'Page locale supplémentaire', price: 120 },
    { id: 'booking', name: 'Intégration réservation', price: 150 },
    { id: 'translation', name: 'Traduction FR-EN', price: 150 }
];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initWebBoost();
    initCookieBanner();
    handleSmoothScroll();
});

function initWebBoost() {
    console.log('🚀 WebBoost Martinique initialisé');
    
    // Déclencher événements analytics
    window.dispatchEvent(new CustomEvent('page_loaded'));
    
    // Auto-scroll smooth
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Navigation mobile
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function closeMobileMenu() {
    document.getElementById('mobile-menu').style.display = 'none';
}

// Scroll vers section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Machine de vente - Démarrage commande
function startOrder(preselectedPack = null) {
    orderData.pack = preselectedPack || '';
    currentOrderStep = 1;
    
    document.getElementById('order-modal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Empêcher scroll background
    
    renderOrderStep(1);
    updateProgress(1);
    
    // Analytics
    window.dispatchEvent(new CustomEvent('order_started', { 
        detail: { pack: preselectedPack }
    }));
}

// Fermer tunnel commande  
function closeOrder() {
    document.getElementById('order-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset données
    orderData = { pack: '', options: [], customer: {}, total: 0, deposit: 0 };
    currentOrderStep = 1;
}

// Commande directe pack
function orderPack(packKey) {
    startOrder(packKey);
}

// Navigation étapes
function nextStep() {
    if (validateStep(currentOrderStep)) {
        currentOrderStep++;
        renderOrderStep(currentOrderStep);
        updateProgress(currentOrderStep);
    }
}

function prevStep() {
    if (currentOrderStep > 1) {
        currentOrderStep--;
        renderOrderStep(currentOrderStep);
        updateProgress(currentOrderStep);
    }
}

function validateStep(step) {
    switch(step) {
        case 1: 
            return orderData.pack !== '';
        case 3:
            return orderData.customer.nom && orderData.customer.email;
        default:
            return true;
    }
}

function updateProgress(step) {
    const progressFill = document.getElementById('progress-fill');
    const percentage = (step / 6) * 100;
    progressFill.style.width = `${percentage}%`;
    
    // Mettre à jour les indicateurs d'étapes
    document.querySelectorAll('.step').forEach((el, index) => {
        if (index + 1 <= step) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function renderOrderStep(step) {
    const content = document.getElementById('order-content');
    const footer = document.getElementById('order-footer');
    
    switch(step) {
        case 1:
            content.innerHTML = renderPackSelection();
            footer.style.display = 'flex';
            break;
        case 2: 
            content.innerHTML = renderOptionsSelection();
            footer.style.display = 'flex';
            break;
        case 3:
            content.innerHTML = renderCustomerInfo();
            footer.style.display = 'flex';
            break;
        case 4:
            content.innerHTML = renderPlanning();
            footer.style.display = 'flex';
            break;
        case 5:
            content.innerHTML = renderPayment();
            footer.style.display = 'flex';
            break;
        case 6:
            content.innerHTML = renderConfirmation();
            footer.style.display = 'none';
            break;
    }
    
    updateOrderTotal();
}

function renderPackSelection() {
    return `
        <div class="step-content">
            <h3 class="step-title">Sélectionnez votre pack</h3>
            <p class="step-subtitle">Choisissez la solution qui correspond à vos besoins</p>
            
            <div class="pack-selection-grid">
                ${Object.entries(PACKS).map(([key, pack]) => `
                    <div class="pack-option ${orderData.pack === key ? 'selected' : ''}" 
                         onclick="selectPack('${key}')">
                        <h4>${pack.name}</h4>
                        <div class="pack-price">€${pack.price} HT</div>
                        <div class="pack-deposit">Acompte : €${Math.round(pack.price * 0.5)}</div>
                        <ul class="pack-features-mini">
                            ${pack.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function selectPack(packKey) {
    orderData.pack = packKey;
    document.querySelectorAll('.pack-option').forEach(el => el.classList.remove('selected'));
    event.target.closest('.pack-option').classList.add('selected');
    updateOrderTotal();
}

function updateOrderTotal() {
    const pack = PACKS[orderData.pack];
    if (!pack) return;
    
    const packPrice = pack.price;
    const optionsTotal = orderData.options.reduce((sum, optionId) => {
        const option = OPTIONS.find(opt => opt.id === optionId);
        return sum + (option ? option.price : 0);
    }, 0);
    
    const subtotal = packPrice + optionsTotal;
    const vat = subtotal * 0.085; // TVA Martinique
    const total = subtotal + vat;
    const deposit = Math.round(subtotal * 0.5);
    
    orderData.total = total;
    orderData.deposit = deposit;
    
    // Mettre à jour affichage
    const totalEl = document.getElementById('order-total');
    if (totalEl) {
        totalEl.innerHTML = `
            <div class="total-price">Total : €${total.toFixed(2)} TTC</div>
            <div class="deposit-price">Acompte : €${deposit}</div>
        `;
    }
}

// Gestion cookies
function initCookieBanner() {
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
        setTimeout(() => {
            document.getElementById('cookie-banner').classList.add('active');
        }, 2000);
    }
}

function acceptCookies() {
    localStorage.setItem('cookie-consent', 'accept');
    document.getElementById('cookie-banner').classList.remove('active');
    
    // Activer analytics
    if (typeof gtag === 'function') {
        gtag('consent', 'update', {
            'analytics_storage': 'granted'
        });
    }
}

function refuseCookies() {
    localStorage.setItem('cookie-consent', 'refuse');
    document.getElementById('cookie-banner').classList.remove('active');
}

function showCookieSettings() {
    // Réafficher la bannière pour modifier les choix
    document.getElementById('cookie-banner').classList.add('active');
}

// Génération numéro de commande
function generateOrderNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WB-${year}-${random}`;
}

// Smooth scroll handling
function handleSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Fermer mobile menu si ouvert
                closeMobileMenu();
            }
        });
    });
}

// Analytics helpers
function trackEvent(eventName, data = {}) {
    // Google Analytics 4
    if (typeof gtag === 'function') {
        gtag('event', eventName, data);
    }
    
    // Console pour debug
    console.log(`📊 Event: ${eventName}`, data);
}

// Utilitaires
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
    }).format(price);
}

function showNotification(message, type = 'success') {
    // TODO: Système de notifications toast
    console.log(`${type}: ${message}`);
}

// Export fonctions globales
window.WebBoostApp = {
    startOrder,
    orderPack,
    closeOrder,
    nextStep,
    prevStep,
    toggleMobileMenu,
    closeMobileMenu,
    acceptCookies,
    refuseCookies,
    scrollToSection,
    trackEvent
};