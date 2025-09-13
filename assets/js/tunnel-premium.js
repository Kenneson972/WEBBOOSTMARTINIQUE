/* ===== TUNNEL D'ACHAT PREMIUM 2024 - WEBBOOST MARTINIQUE ===== */

// Classe principale du tunnel
class TunnelAchat {
  constructor() {
    this.currentStep = 1;
    this.maxStep = 3;
    this.formData = {};
    this.selectedPack = null;
    this.selectedOptions = [];
    
    this.init();
  }

  init() {
    console.log('🚀 TunnelAchat Premium initialisé');
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Boutons d'ouverture tunnel (tous les boutons commander)
    document.querySelectorAll('.btn-premium[onclick*="orderPack"], .pack-btn').forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Déterminer le pack depuis le bouton ou sa card parente
        const packCard = newBtn.closest('.pack-card');
        let packName = 'Premium';
        let packPrice = '1790';
        
        if (packCard) {
          const packData = packCard.dataset.pack;
          const priceElement = packCard.querySelector('.price-badge');
          
          if (packData === 'essentiel') {
            packName = 'Pack Essentiel';
            packPrice = '890';
          } else if (packData === 'pro') {
            packName = 'Pack Pro';
            packPrice = '1290';
          } else if (packData === 'premium') {
            packName = 'Pack Premium';
            packPrice = '1790';
          }
          
          if (priceElement) {
            const price = priceElement.textContent.match(/€(\d+)/);
            if (price) packPrice = price[1];
          }
        }
        
        this.ouvrirTunnel(packName, packPrice);
      });
    });

    // Fermeture tunnel
    const closeBtn = document.querySelector('.tunnel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.fermerTunnel();
      });
    }

    // Fermeture par clic sur overlay
    const overlay = document.getElementById('tunnelAchat');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.fermerTunnel();
        }
      });
    }

    // Formulaire étape 1
    const briefForm = document.getElementById('brief-premium');
    if (briefForm) {
      briefForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.nextStep();
      });
    }

    // Gestion ESC pour fermer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.fermerTunnel();
      }
    });
  }

  ouvrirTunnel(packName, prix) {
    console.log('📱 Ouverture tunnel:', packName, prix);
    
    this.selectedPack = { name: packName, price: prix };
    
    const tunnel = document.getElementById('tunnelAchat');
    const packNameElement = document.getElementById('packName');
    
    if (packNameElement) {
      packNameElement.textContent = packName;
    }
    
    // Animation d'ouverture
    tunnel.style.display = 'block';
    setTimeout(() => {
      tunnel.classList.add('active');
    }, 10);
    
    // Bloquer scroll body
    document.body.style.overflow = 'hidden';
    
    // Reset du tunnel
    this.currentStep = 1;
    this.showStep(1);
    this.updateProgress();
  }

  fermerTunnel() {
    console.log('❌ Fermeture tunnel');
    
    const tunnel = document.getElementById('tunnelAchat');
    tunnel.classList.remove('active');
    
    setTimeout(() => {
      tunnel.style.display = 'none';
      document.body.style.overflow = 'auto';
      this.resetTunnel();
    }, 400);
  }

  resetTunnel() {
    this.currentStep = 1;
    this.formData = {};
    this.selectedPack = null;
    this.selectedOptions = [];
    
    // Réinitialiser le formulaire
    const form = document.getElementById('brief-premium');
    if (form) {
      form.reset();
    }
    
    // Supprimer les classes d'erreur
    document.querySelectorAll('.floating-label.error').forEach(el => {
      el.classList.remove('error');
    });
    
    this.showStep(1);
    this.updateProgress();
  }

  nextStep() {
    console.log('➡️ Étape suivante depuis', this.currentStep);
    
    if (this.validateCurrentStep()) {
      this.saveStepData();
      
      if (this.currentStep < this.maxStep) {
        this.currentStep++;
        this.showStep(this.currentStep);
        this.updateProgress();
        
        // Générer contenu selon l'étape
        if (this.currentStep === 2) {
          this.generateRecap();
        } else if (this.currentStep === 3) {
          this.generatePayment();
        }
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
      this.updateProgress();
    }
  }

  validateCurrentStep() {
    if (this.currentStep === 1) {
      return this.validateForm();
    }
    return true; // Autres étapes toujours valides pour l'instant
  }

  validateForm() {
    const form = document.getElementById('brief-premium');
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
      const value = field.value ? field.value.trim() : '';
      
      if (!value) {
        this.showFieldError(field, 'Ce champ est obligatoire');
        valid = false;
      } else {
        // Validations spécifiques
        if (field.type === 'email' && !this.isValidEmail(value)) {
          this.showFieldError(field, 'Email invalide');
          valid = false;
        } else if (field.type === 'tel' && !this.isValidPhone(value)) {
          this.showFieldError(field, 'Téléphone martiniquais requis (0596...)');
          valid = false;
        } else {
          this.clearFieldError(field);
        }
      }
    });

    return valid;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^(0596|596|\+596)/;
    return phoneRegex.test(phone);
  }

  showFieldError(field) {
    const floatingLabel = field.closest('.floating-label');
    if (floatingLabel) {
      floatingLabel.classList.add('error');
      
      // Animation shake
      floatingLabel.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        floatingLabel.style.animation = '';
      }, 500);
    }
  }

  clearFieldError(field) {
    const floatingLabel = field.closest('.floating-label');
    if (floatingLabel) {
      floatingLabel.classList.remove('error');
    }
  }

  saveStepData() {
    if (this.currentStep === 1) {
      const form = document.getElementById('brief-premium');
      const formData = new FormData(form);
      
      // Sauvegarder les données de base
      this.formData.entreprise = formData.get('entreprise');
      this.formData.secteur = formData.get('secteur');
      this.formData.telephone = formData.get('telephone');
      this.formData.email = formData.get('email');
      this.formData.commune = formData.get('commune');
      this.formData.commentaires = formData.get('commentaires');
      
      // Sauvegarder les objectifs (checkboxes)
      this.formData.objectifs = [];
      form.querySelectorAll('input[name="objectifs[]"]:checked').forEach(checkbox => {
        this.formData.objectifs.push(checkbox.value);
      });
      
      console.log('💾 Données sauvegardées:', this.formData);
    }
  }

  showStep(stepNumber) {
    console.log('👀 Affichage étape', stepNumber);
    
    // Cacher toutes les étapes
    document.querySelectorAll('.tunnel-step').forEach(step => {
      step.classList.remove('active');
    });
    
    // Afficher étape courante
    const targetStep = document.querySelector(`.step-${stepNumber}`);
    if (targetStep) {
      targetStep.classList.add('active');
      
      // Scroll en haut du tunnel
      const container = document.querySelector('.tunnel-container');
      if (container) {
        container.scrollTop = 0;
      }
    }
  }

  updateProgress() {
    document.querySelectorAll('.tunnel-progress .step').forEach((step, index) => {
      if (index + 1 <= this.currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  generateRecap() {
    const recapContainer = document.getElementById('recap-commande');
    if (!recapContainer) return;

    const objectifsLabels = {
      'visibilite': 'Être trouvé sur Google',
      'ventes': 'Augmenter les ventes',
      'reservation': 'Prendre des réservations',
      'credibilite': 'Paraître plus professionnel'
    };

    const html = `
      <div class="recap-section">
        <h3><i class="fas fa-box mr-2"></i> Votre pack</h3>
        <div class="recap-item">
          <strong>${this.selectedPack.name}</strong>
          <span class="recap-price">${this.selectedPack.price}€ HT</span>
        </div>
      </div>

      <div class="recap-section">
        <h3><i class="fas fa-building mr-2"></i> Votre entreprise</h3>
        <div class="recap-item">
          <strong>${this.formData.entreprise}</strong>
          <span>${this.getSecteurLabel(this.formData.secteur)}</span>
        </div>
        <div class="recap-item">
          <span>📧 ${this.formData.email}</span>
          <span>📱 ${this.formData.telephone}</span>
        </div>
        <div class="recap-item">
          <span>📍 ${this.formData.commune || 'Non spécifié'}</span>
        </div>
      </div>

      ${this.formData.objectifs.length > 0 ? `
      <div class="recap-section">
        <h3><i class="fas fa-target mr-2"></i> Vos objectifs</h3>
        ${this.formData.objectifs.map(obj => `
          <div class="recap-objectif">
            <i class="fas fa-check text-green-400 mr-2"></i>
            ${objectifsLabels[obj] || obj}
          </div>
        `).join('')}      
      </div>
      ` : ''}

      ${this.formData.commentaires ? `
      <div class="recap-section">
        <h3><i class="fas fa-comment mr-2"></i> Précisions</h3>
        <div class="recap-comments">${this.formData.commentaires}</div>
      </div>
      ` : ''}

      <div class="recap-total">
        <div class="total-line">
          <span>Total HT</span>
          <span class="total-price">${this.selectedPack.price}€</span>
        </div>
        <div class="total-line">
          <span>TVA (8.5%)</span>
          <span>${Math.round(this.selectedPack.price * 0.085)}€</span>
        </div>
        <div class="total-line total-final">
          <span>Total TTC</span>
          <span class="total-price">${Math.round(this.selectedPack.price * 1.085)}€</span>
        </div>
      </div>
    `;

    recapContainer.innerHTML = html;
  }

  generatePayment() {
    const paymentContainer = document.getElementById('payment-summary-content');
    if (!paymentContainer) return;

    const totalTTC = Math.round(this.selectedPack.price * 1.085);
    const acompte = Math.round(totalTTC * 0.5);
    
    const html = `
      <div class="payment-line">
        <span>${this.selectedPack.name}</span>
        <span>${this.selectedPack.price}€ HT</span>
      </div>
      <div class="payment-line">
        <span>TVA (8.5%)</span>
        <span>${Math.round(this.selectedPack.price * 0.085)}€</span>
      </div>
      <div class="payment-line payment-total">
        <span>Total TTC</span>
        <span>${totalTTC}€</span>
      </div>
      
      <div class="payment-schedule">
        <h4>Échéancier de paiement</h4>
        <div class="payment-step">
          <strong>Aujourd'hui (50%)</strong>
          <span class="amount">${acompte}€</span>
        </div>
        <div class="payment-step">
          <span>Avant mise en ligne (40%)</span>
          <span>${Math.round(totalTTC * 0.4)}€</span>
        </div>
        <div class="payment-step">
          <span>À la livraison (10%)</span>
          <span>${Math.round(totalTTC * 0.1)}€</span>
        </div>
      </div>
    `;

    paymentContainer.innerHTML = html;
  }

  getSecteurLabel(secteur) {
    const secteurs = {
      'restaurant': '🍽️ Restaurant / Bar',
      'beaute': '💄 Coiffure / Beauté', 
      'auto': '🚗 Garage / Automobile',
      'commerce': '🛍️ Commerce / Boutique',
      'services': '🔧 Services aux particuliers',
      'sante': '⚕️ Santé / Médical',
      'immobilier': '🏠 Immobilier',
      'autre': '📋 Autre secteur'
    };
    return secteurs[secteur] || secteur;
  }
}

// Styles CSS additionnels pour les récaps
const recapStyles = `
.recap-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.recap-section:last-child {
  border-bottom: none;
}

.recap-section h3 {
  color: var(--wb-gold);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.recap-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: var(--wb-white);
}

.recap-price {
  color: var(--wb-gold);
  font-weight: 700;
  font-size: 1.1rem;
}

.recap-objectif {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.8);
}

.recap-comments {
  background: rgba(212, 175, 55, 0.1);
  padding: 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

.recap-total {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
  padding: 15px;
  border-radius: 12px;
  margin-top: 20px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--wb-white);
}

.total-final {
  border-top: 1px solid rgba(212, 175, 55, 0.3);
  padding-top: 8px;
  font-weight: 700;
  font-size: 1.1rem;
}

.total-price {
  color: var(--wb-gold);
  font-weight: 700;
}

.payment-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--wb-white);
}

.payment-total {
  border-top: 1px solid rgba(212, 175, 55, 0.3);
  padding-top: 8px;
  font-weight: 700;
  color: var(--wb-gold);
}

.payment-schedule {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.payment-schedule h4 {
  color: var(--wb-gold);
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.payment-step {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.8);
}

.payment-step .amount {
  color: var(--wb-gold);
  font-weight: 600;
}

@media (max-width: 768px) {
  .recap-item, .payment-line, .payment-step, .total-line {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .recap-price, .total-price, .amount {
    align-self: flex-end;
  }
}
`;

// Ajouter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = recapStyles;
document.head.appendChild(styleSheet);

// Initialiser le tunnel au chargement de la page
let tunnel;

document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 Initialisation Tunnel Premium WebBoost');
  tunnel = new TunnelAchat();
});

// Export pour usage global
window.tunnel = tunnel;