/* ===== WEBBOOST MARTINIQUE - ANIMATIONS PREMIUM 2024 ===== */

// Variables globales
let isScrolling = false;
let ticking = false;

// Initialisation des animations premium
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 WebBoost Premium Animations initialisées');
    
    // Setup des animations au scroll
    setupScrollAnimations();
    
    // Setup parallax léger
    setupParallaxEffect();
    
    // Setup compteurs animés
    setupAdvancedCounters();
    
    // Setup micro-interactions
    setupMicroInteractions();
    
    // Setup smooth scroll
    setupSmoothScrolling();
    
    // Ajout des classes d'animation initiales
    addInitialAnimationClasses();
});

// ===== ANIMATIONS AU SCROLL =====
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Ajouter la classe visible avec un délai selon le type d'animation
                const element = entry.target;
                const delay = element.style.animationDelay || '0s';
                const delayMs = parseFloat(delay) * 1000;
                
                setTimeout(() => {
                    element.classList.add('visible');
                    
                    // Animation spéciale pour les compteurs
                    if (element.classList.contains('animate-count')) {
                        animateCounter(element);
                    }
                    
                    // Effect spécial pour les cards premium
                    if (element.classList.contains('premium-card')) {
                        element.style.transform = 'translateY(0) scale(1)';
                    }
                }, delayMs);
                
                // Une fois animé, ne plus observer
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observer tous les éléments avec les classes d'animation
    const animationSelectors = [
        '.fade-in',
        '.fade-in-left', 
        '.fade-in-right',
        '.scale-in',
        '.section-loading'
    ];

    animationSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            observer.observe(el);
        });
    });
}

// ===== PARALLAX LÉGER =====
function setupParallaxEffect() {
    let heroContent = document.querySelector('.hero-content');
    let particles = document.querySelectorAll('.particle');
    
    function updateParallax() {
        if (ticking) return;
        
        requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            
            // Parallax hero content (très subtil)
            if (heroContent && scrolled < window.innerHeight) {
                const speed = scrolled * 0.3;
                heroContent.style.transform = `translateY(${speed}px)`;
            }
            
            // Animation des particules
            particles.forEach((particle, index) => {
                const speed = (scrolled * (0.5 + index * 0.1));
                particle.style.transform = `translateY(${speed}px)`;
            });
            
            ticking = false;
        });
        
        ticking = true;
    }
    
    window.addEventListener('scroll', updateParallax, { passive: true });
}

// ===== COMPTEURS ANIMÉS AVANCÉS =====
function setupAdvancedCounters() {
    const counters = document.querySelectorAll('.animate-count');
    
    counters.forEach(counter => {
        counter.addEventListener('mouseenter', () => {
            if (!counter.classList.contains('hovered')) {
                counter.classList.add('hovered');
                const numberElement = counter.querySelector('.counter');
                if (numberElement) {
                    numberElement.style.transform = 'scale(1.1) rotate(2deg)';
                    numberElement.style.filter = 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))';
                }
            }
        });
        
        counter.addEventListener('mouseleave', () => {
            const numberElement = counter.querySelector('.counter');
            if (numberElement) {
                numberElement.style.transform = 'scale(1) rotate(0deg)';
                numberElement.style.filter = 'none';
            }
        });
    });
}

function animateCounter(element) {
    const target = parseFloat(element.dataset.target);
    const numberElement = element.querySelector('.counter, .badge-number');
    
    if (!numberElement || element.hasAttribute('data-counted')) return;
    
    element.setAttribute('data-counted', 'true');
    
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
            numberElement.textContent = current.toFixed(1) + '/5';
        } else if (target >= 100) {
            numberElement.textContent = Math.floor(current) + '%';
        } else if (element.textContent.includes('j')) {
            numberElement.textContent = Math.floor(current) + '-' + (Math.floor(current) + 5) + 'j';
        } else {
            numberElement.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// ===== MICRO-INTERACTIONS =====
function setupMicroInteractions() {
    // Boutons premium avec effet de ripple
    document.querySelectorAll('.btn-premium').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Icons premium avec rotation au hover
    document.querySelectorAll('.premium-icon').forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'rotate(8deg) scale(1.15)';
            icon.style.filter = 'drop-shadow(0 5px 15px rgba(212, 175, 55, 0.4))';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'rotate(0deg) scale(1)';
            icon.style.filter = 'none';
        });
    });
    
    // Cards premium avec effet 3D
    document.querySelectorAll('.premium-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
        });
    });
}

// ===== SMOOTH SCROLLING =====
function setupSmoothScrolling() {
    // Scroll fluide pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 100; // Offset pour la navigation
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== CLASSES D'ANIMATION INITIALES =====
function addInitialAnimationClasses() {
    // Ajouter automatiquement les classes fade-in aux sections
    document.querySelectorAll('section').forEach((section, index) => {
        if (!section.classList.contains('fade-in') && 
            !section.classList.contains('fade-in-left') && 
            !section.classList.contains('fade-in-right') &&
            !section.classList.contains('scale-in')) {
            section.classList.add('fade-in');
        }
    });
    
    // Classes spéciales pour certains éléments
    document.querySelectorAll('.section-header').forEach(header => {
        if (!header.classList.contains('fade-in') && !header.classList.contains('fade-in-left')) {
            header.classList.add('fade-in');
        }
    });
}

// ===== EFFET RIPPLE CSS =====
function addRippleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            pointer-events: none;
            animation: ripple-effect 0.6s ease-out;
        }
        
        @keyframes ripple-effect {
            from {
                opacity: 1;
                transform: scale(0);
            }
            to {
                opacity: 0;
                transform: scale(2);
            }
        }
        
        .btn-premium {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
}

// Ajouter les styles ripple
addRippleStyles();

// ===== NAVIGATION PREMIUM =====
function setupPremiumNavigation() {
    const nav = document.querySelector('.nav-premium');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            nav.style.background = 'rgba(11, 11, 13, 0.95)';
            nav.style.backdropFilter = 'blur(25px)';
            nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.background = 'transparent';
            nav.style.backdropFilter = 'blur(10px)';
            nav.style.boxShadow = 'none';
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true });
}

// Setup navigation premium
setupPremiumNavigation();

// ===== PRÉLOADER DÉSACTIVÉ POUR PERFORMANCE =====
// Preloader supprimé pour chargement instantané

// Afficher le loader au chargement de la page - DÉSACTIVÉ
// if (document.readyState === 'loading') {
//     showPremiumLoader();
// }

console.log('✨ WebBoost Premium 2024 - Chargement optimisé instantané !');