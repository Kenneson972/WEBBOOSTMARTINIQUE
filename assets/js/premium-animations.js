/* ===== ANIMATIONS COMPLÈTEMENT DÉSACTIVÉES ===== */

// DÉSACTIVER COMPLÈTEMENT TOUTES LES ANIMATIONS
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚫 Animations désactivées - Site statique');
    
    // Supprimer toutes les classes d'animation
    const elementsWithAnimations = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in, .animate-count, .premium-section');
    elementsWithAnimations.forEach(el => {
        el.classList.remove('fade-in', 'fade-in-left', 'fade-in-right', 'scale-in', 'animate-count', 'premium-section');
    });
    
    // Désactiver tous les observers
    // PAS d'IntersectionObserver
    // PAS d'animations au scroll
    // PAS de micro-interactions
    // PAS de parallax
});

console.log('✅ Site WebBoost sans animations - Prêt !');