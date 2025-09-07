/**
 * WebBoost Martinique - Tunnel de Commande
 * 6 étapes : Pack → Options → Infos → Planning → Paiement → Confirmation
 */

// Rendu des étapes du tunnel
function renderOptionsSelection() {
    return `
        <div class="step-content">
            <h3 class="step-title">Personnalisez votre pack</h3>
            <p class="step-subtitle">Ajoutez des options pour maximiser l'impact</p>
            
            <div class="options-grid">
                ${OPTIONS.map(option => `
                    <div class="option-item ${orderData.options.includes(option.id) ? 'selected' : ''}"
                         onclick="toggleOption('${option.id}')">
                        <div class="option-content">
                            <div class="option-info">
                                <h4>${option.name}</h4>
                                <p>Option premium pour optimiser votre site</p>
                            </div>
                            <div class="option-price">+€${option.price}</div>
                            <div class="option-checkbox">
                                <i class="fas ${orderData.options.includes(option.id) ? 'fa-check-circle' : 'fa-circle'}"></i>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function toggleOption(optionId) {
    if (orderData.options.includes(optionId)) {
        orderData.options = orderData.options.filter(id => id !== optionId);
    } else {
        orderData.options.push(optionId);
    }
    
    // Mettre à jour l'affichage
    renderOrderStep(2);
    updateOrderTotal();
}

function renderCustomerInfo() {
    return `
        <div class="step-content">
            <h3 class="step-title">Vos informations</h3>
            <p class="step-subtitle">Pour créer votre site parfaitement adapté</p>
            
            <form class="customer-form" id="customer-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="nom">Nom et prénom *</label>
                        <input type="text" id="nom" name="nom" required 
                               value="${orderData.customer.nom || ''}"
                               oninput="updateCustomerData('nom', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="entreprise">Nom de l'entreprise</label>
                        <input type="text" id="entreprise" name="entreprise"
                               value="${orderData.customer.entreprise || ''}"
                               oninput="updateCustomerData('entreprise', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email professionnel *</label>
                        <input type="email" id="email" name="email" required
                               value="${orderData.customer.email || ''}"
                               oninput="updateCustomerData('email', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="telephone">Téléphone *</label>
                        <input type="tel" id="telephone" name="telephone" required
                               value="${orderData.customer.telephone || ''}"
                               oninput="updateCustomerData('telephone', this.value)"
                               placeholder="0596 XX XX XX">
                    </div>
                    
                    <div class="form-group form-full">
                        <label for="adresse">Adresse complète</label>
                        <input type="text" id="adresse" name="adresse"
                               value="${orderData.customer.adresse || ''}"
                               oninput="updateCustomerData('adresse', this.value)"
                               placeholder="123 Rue de la République, 97200 Fort-de-France">
                        <small>Pour votre Google Business Profile</small>
                    </div>
                    
                    <div class="form-group form-full">
                        <label for="activite">Décrivez votre activité *</label>
                        <textarea id="activite" name="activite" required rows="3"
                                  oninput="updateCustomerData('activite', this.value)"
                                  placeholder="Restaurant créole, spécialités locales, 50 couverts...">${orderData.customer.activite || ''}</textarea>
                        <small>Plus c'est précis, mieux nous adaptons votre site</small>
                    </div>
                </div>
            </form>
        </div>
    `;
}

function updateCustomerData(field, value) {
    if (!orderData.customer) orderData.customer = {};
    orderData.customer[field] = value;
}

function renderPlanning() {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7); // Minimum 7 jours
    
    return `
        <div class="step-content">
            <h3 class="step-title">Planning de livraison</h3>
            <p class="step-subtitle">Quand souhaitez-vous recevoir votre site ?</p>
            
            <div class="planning-content">
                <div class="form-group">
                    <label for="delivery-date">Date de livraison souhaitée</label>
                    <input type="date" id="delivery-date" name="delivery-date"
                           min="${minDate.toISOString().split('T')[0]}"
                           value="${orderData.customer.deliveryDate || ''}"
                           oninput="updateCustomerData('deliveryDate', this.value)">
                </div>
                
                <div class="planning-info">
                    <h4>📋 Informations importantes</h4>
                    <ul>
                        <li>Les délais démarrent après réception de tous vos contenus</li>
                        <li>Nous vous fournirons une checklist détaillée</li>
                        <li>Communication par email + espace client dédié</li>
                        <li>Révisions incluses selon votre pack</li>
                    </ul>
                </div>
                
                <div class="pack-timeline">
                    <h4>⚡ Vos délais selon le pack choisi</h4>
                    <div class="timeline-grid">
                        <div class="timeline-item ${orderData.pack === 'essentiel' ? 'active' : ''}">
                            <strong>Pack Essentiel</strong>
                            <span>10 jours maximum</span>
                        </div>
                        <div class="timeline-item ${orderData.pack === 'pro' ? 'active' : ''}">
                            <strong>Pack Pro</strong>
                            <span>7-10 jours maximum</span>
                        </div>
                        <div class="timeline-item ${orderData.pack === 'premium' ? 'active' : ''}">
                            <strong>Pack Premium</strong>
                            <span>10-12 jours maximum</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderPayment() {
    const pack = PACKS[orderData.pack];
    
    return `
        <div class="step-content">
            <h3 class="step-title">Récapitulatif & Paiement</h3>
            <p class="step-subtitle">Vérifiez votre commande avant paiement</p>
            
            <div class="payment-summary">
                <div class="order-recap">
                    <h4>📋 Votre commande</h4>
                    <div class="recap-item">
                        <span>${pack.name}</span>
                        <span>€${pack.price}</span>
                    </div>
                    
                    ${orderData.options.map(optionId => {
                        const option = OPTIONS.find(opt => opt.id === optionId);
                        return option ? `
                            <div class="recap-item option">
                                <span>+ ${option.name}</span>
                                <span>€${option.price}</span>
                            </div>
                        ` : '';
                    }).join('')}
                    
                    <div class="recap-totals">
                        <div class="recap-item">
                            <span>Sous-total HT</span>
                            <span>€${(pack.price + orderData.options.reduce((sum, id) => {
                                const opt = OPTIONS.find(o => o.id === id);
                                return sum + (opt ? opt.price : 0);
                            }, 0)).toFixed(2)}</span>
                        </div>
                        <div class="recap-item">
                            <span>TVA (8.5%)</span>
                            <span>€${(orderData.total - (pack.price + orderData.options.reduce((sum, id) => {
                                const opt = OPTIONS.find(o => o.id === id);
                                return sum + (opt ? opt.price : 0);
                            }, 0))).toFixed(2)}</span>
                        </div>
                        <div class="recap-item total">
                            <span>Total TTC</span>
                            <span>€${orderData.total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="deposit-highlight">
                        <strong>Acompte à régler maintenant : €${orderData.deposit}</strong>
                        <small>Solde (€${(orderData.total - orderData.deposit).toFixed(2)}) avant mise en ligne</small>
                    </div>
                </div>
                
                <div class="payment-methods">
                    <h4>💳 Paiement sécurisé</h4>
                    <div class="payment-icons">
                        <i class="fab fa-cc-visa"></i>
                        <i class="fab fa-cc-mastercard"></i>
                        <i class="fab fa-paypal"></i>
                        <i class="fab fa-apple-pay"></i>
                    </div>
                    <p>Paiement sécurisé par Stripe • SSL • Conforme RGPD</p>
                    
                    <div class="guarantee-box">
                        <i class="fas fa-shield-alt"></i>
                        <strong>Garantie 100% :</strong> Satisfait ou remboursé sous 15 jours
                    </div>
                </div>
                
                <button class="btn-premium btn-pay" onclick="processPayment()">
                    <i class="fas fa-lock"></i>
                    PAYER €${orderData.deposit} MAINTENANT
                </button>
                <p class="payment-notice">Intégration Stripe en cours - Commande enregistrée pour l'instant</p>
            </div>
        </div>
    `;
}

function processPayment() {
    // Générer numéro de commande
    const orderNumber = generateOrderNumber();
    orderData.orderNumber = orderNumber;
    
    // Pour l'instant : simulation paiement réussi
    setTimeout(() => {
        currentOrderStep = 6;
        renderOrderStep(6);
        updateProgress(6);
        
        // Analytics
        trackEvent('purchase', {
            order_number: orderNumber,
            pack: orderData.pack,
            total: orderData.total
        });
        
    }, 2000);
}

function renderConfirmation() {
    return `
        <div class="step-content confirmation">
            <div class="success-animation">
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
            </div>
            
            <h3 class="success-title">Commande confirmée !</h3>
            
            <div class="order-details">
                <div class="order-number">
                    <strong>Numéro de commande : ${orderData.orderNumber}</strong>
                </div>
                <p>Un email de confirmation sera envoyé à ${orderData.customer.email}</p>
            </div>
            
            <div class="next-steps">
                <h4>📋 Prochaines étapes</h4>
                <div class="steps-list">
                    <div class="step-item">
                        <span class="step-number">1</span>
                        <div>
                            <strong>Email de confirmation</strong>
                            <small>Reçu dans les 5 minutes</small>
                        </div>
                    </div>
                    <div class="step-item">
                        <span class="step-number">2</span>
                        <div>
                            <strong>Checklist de contenus</strong>
                            <small>Textes, images et infos nécessaires</small>
                        </div>
                    </div>
                    <div class="step-item">
                        <span class="step-number">3</span>
                        <div>
                            <strong>Développement</strong>
                            <small>Notre équipe crée votre site</small>
                        </div>
                    </div>
                    <div class="step-item">
                        <span class="step-number">4</span>
                        <div>
                            <strong>Livraison</strong>
                            <small>Votre site en ligne !</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="confirmation-actions">
                <button class="btn-outline-premium" onclick="closeOrder()">
                    <i class="fas fa-home"></i>
                    Retour à l'accueil
                </button>
                <button class="btn-premium" onclick="confirmWhatsApp()">
                    <i class="fab fa-whatsapp"></i>
                    Confirmer sur WhatsApp
                </button>
            </div>
        </div>
    `;
}

function confirmWhatsApp() {
    const message = `Bonjour Kenneson ! Je viens de passer commande ${orderData.orderNumber} sur votre site. Merci de me confirmer la bonne réception. Pack choisi : ${PACKS[orderData.pack].name}`;
    const whatsappUrl = `https://wa.me/596000000?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Analytics
    trackEvent('whatsapp_confirmation', {
        order_number: orderData.orderNumber
    });
}

// CSS pour les étapes (styles inline)
const orderFlowStyles = `
    .step-content {
        animation: fadeInUp 0.5s ease;
    }
    
    .step-title {
        font-size: 2rem;
        font-weight: 700;
        color: #FBBF24;
        margin-bottom: 1rem;
        text-align: center;
    }
    
    .step-subtitle {
        color: #D1D5DB;
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .pack-selection-grid,
    .options-grid {
        display: grid;
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .pack-option,
    .option-item {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid transparent;
        border-radius: 12px;
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .pack-option:hover,
    .option-item:hover {
        border-color: rgba(212, 175, 55, 0.5);
        transform: translateY(-2px);
    }
    
    .pack-option.selected,
    .option-item.selected {
        border-color: #D4AF37;
        background: rgba(212, 175, 55, 0.15);
        box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
    }
    
    .pack-price {
        font-size: 1.5rem;
        font-weight: 700;
        color: #FBBF24;
        margin: 0.5rem 0;
    }
    
    .pack-deposit {
        color: #10B981;
        font-weight: 600;
        margin-bottom: 1rem;
    }
    
    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }
    
    .form-full {
        grid-column: 1 / -1;
    }
    
    .form-group label {
        display: block;
        color: #FBBF24;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    
    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        background: rgba(31, 41, 55, 0.8);
        border: 1px solid rgba(107, 114, 128, 0.5);
        border-radius: 8px;
        color: white;
        font-size: 15px;
        font-family: 'Inter', sans-serif;
    }
    
    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #FBBF24;
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
    }
    
    .form-group small {
        display: block;
        color: #9CA3AF;
        font-size: 12px;
        margin-top: 0.25rem;
    }
    
    .success-animation {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .success-icon {
        width: 80px;
        height: 80px;
        background: #10B981;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        color: white;
        font-size: 2rem;
        animation: successBounce 0.6s ease;
    }
    
    @keyframes successBounce {
        0% { transform: scale(0); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;

// Injection des styles
if (!document.getElementById('order-flow-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'order-flow-styles';
    styleSheet.textContent = orderFlowStyles;
    document.head.appendChild(styleSheet);
}