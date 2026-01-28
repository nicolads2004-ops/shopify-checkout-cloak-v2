/**
 * SCRIPT DE CLOAKING CHECKOUT SHOPIFY
 * À installer sur la boutique source (Shop A)
 * 
 * Installation :
 * 1. Aller dans Shopify Admin > Online Store > Themes > Edit Code
 * 2. Ouvrir theme.liquid
 * 3. Ajouter avant </body> :
 *    <script src="https://votre-domaine.com/cloak-script.js"></script>
 */

(function() {
  'use strict';

  // Configuration depuis window.CLOAK_CONFIG
  const CONFIG = window.CLOAK_CONFIG || {
    apiUrl: 'http://localhost:3000/api',
    shopId: 'DEMO',
  };

  // Fonction pour obtenir les items du panier Shopify
  async function getCartItems() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      return cart.items.map(item => ({
        variantId: item.variant_id,
        quantity: item.quantity,
        title: item.title,
        price: item.price / 100, // Shopify retourne en centimes
        image: item.image,
        product_id: item.product_id,
      }));
    } catch (error) {
      console.error('Erreur récupération panier:', error);
      return [];
    }
  }

  // Fonction pour créer un checkout sur la boutique cible
  async function createCloakedCheckout(cartItems) {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/cloak/redirect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: CONFIG.shopId,
          cartItems: cartItems,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur de redirection');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur création checkout:', error);
      throw error;
    }
  }

  // Fonction pour intercepter le checkout
  async function interceptCheckout(event) {
    event.preventDefault();
    event.stopPropagation();

    // Afficher un loader
    const originalButton = event.target;
    const originalText = originalButton.textContent;
    originalButton.textContent = 'Redirection...';
    originalButton.disabled = true;

    try {
      // Récupérer le panier
      const cartItems = await getCartItems();

      if (cartItems.length === 0) {
        alert('Votre panier est vide');
        originalButton.textContent = originalText;
        originalButton.disabled = false;
        return;
      }

      // Créer le checkout cloaké
      const checkoutData = await createCloakedCheckout(cartItems);

      // Rediriger vers le checkout de la boutique cible
      window.location.href = checkoutData.checkoutUrl;

    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
      originalButton.textContent = originalText;
      originalButton.disabled = false;
    }
  }

  // Fonction pour trouver et remplacer les boutons checkout
  function hijackCheckoutButtons() {
    // Sélecteurs communs pour les boutons checkout Shopify
    const selectors = [
      'button[name="checkout"]',
      'input[name="checkout"]',
      'a[href="/checkout"]',
      'button[type="submit"][name="checkout"]',
      '.cart__checkout',
      '[data-checkout-button]',
    ];

    selectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        // Éviter de réattacher plusieurs fois
        if (button.dataset.cloakAttached) return;
        button.dataset.cloakAttached = 'true';

        // Remplacer le comportement par défaut
        button.addEventListener('click', interceptCheckout, true);
        
        // Si c'est un lien, empêcher la navigation
        if (button.tagName === 'A') {
          button.href = 'javascript:void(0)';
        }
      });
    });
  }

  // Observer les changements DOM pour les thèmes dynamiques
  function observeDOMChanges() {
    const observer = new MutationObserver(() => {
      hijackCheckoutButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Initialisation
  function init() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        hijackCheckoutButtons();
        observeDOMChanges();
      });
    } else {
      hijackCheckoutButtons();
      observeDOMChanges();
    }

    console.log('✅ Cloak Checkout activé');
  }

  // Démarrer
  init();
})();
