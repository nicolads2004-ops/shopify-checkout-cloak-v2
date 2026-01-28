# Shopify Checkout Cloak - Système de Rotation Multi-Comptes

**Comme Tagada Pay** - Redirigez automatiquement vos clients vers différents comptes Shopify Payments de façon rotative.

## 🎯 Concept

Vous avez **une boutique principale (Shop A)** où vos clients naviguent et achètent. Quand ils cliquent sur "Passer au checkout", ils sont **automatiquement redirigés** vers le checkout d'une **boutique cible (Shop B, C, D...)** de façon rotative.

### Avantages

- ✅ **Diversification des comptes Shopify Payments**
- ✅ **Répartition équitable du trafic**
- ✅ **Transparent pour les clients**
- ✅ **Analytics détaillées par boutique**
- ✅ **Gestion centralisée**

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│   BOUTIQUE SOURCE (Shop A)              │
│   - Les clients naviguent ici           │
│   - Script de cloaking installé         │
│   - Intercepte les checkouts            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   VOTRE SAAS (Ce projet)                │
│   - Algorithme de rotation              │
│   - Création de checkout                │
│   - Tracking & Analytics                │
└──────────────┬──────────────────────────┘
               │
               ▼ Redirection rotative
    ┌──────────┴──────────┬──────────┐
    │                     │          │
    ▼                     ▼          ▼
┌─────────┐         ┌─────────┐  ┌─────────┐
│ Shop B  │         │ Shop C  │  │ Shop D  │
│ (Cible) │         │ (Cible) │  │ (Cible) │
└─────────┘         └─────────┘  └─────────┘
  Compte 1            Compte 2     Compte 3
```

## 🚀 Installation Rapide

### 1. Installer les dépendances

```bash
cd shopify-checkout-rotator
npm install
```

### 2. Configurer la base de données

Créez un fichier `.env` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/shopify_cloak"
ADMIN_SECRET_KEY="votre-cle-secrete"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Initialiser la base de données

```bash
npm run db:generate
npm run db:push
```

### 4. Lancer l'application

```bash
npm run dev
```

Accédez à http://localhost:3000

## 📋 Configuration

### Étape 1 : Créer la boutique source

1. Allez sur `/dashboard`
2. Cliquez sur **"Créer la boutique source"**
3. Entrez :
   - **Nom** : Nom de votre boutique principale
   - **Domaine** : `votreboutique.myshopify.com`
4. **Copiez l'API Key** générée

### Étape 2 : Ajouter les boutiques cibles

Pour chaque boutique qui recevra les paiements :

1. Cliquez sur **"+ Ajouter une boutique cible"**
2. Entrez :
   - **Nom** : Ex: "Boutique B"
   - **Domaine** : `boutique-b.myshopify.com`
   - **Access Token** : Token Storefront API (voir ci-dessous)
   - **Poids** : 1-10 (pour rotation pondérée)

#### Obtenir un Access Token Storefront API

1. Admin Shopify > **Settings > Apps and sales channels**
2. **Develop apps** > Create app
3. **Configuration** > Storefront API
4. Permissions nécessaires :
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_read_product_listings`
5. Copiez le **Storefront API access token**

### Étape 3 : Installer le script sur Shop A

1. Admin Shopify de votre **boutique source**
2. **Online Store > Themes > Edit Code**
3. Ouvrir `theme.liquid`
4. **Avant la balise `</body>`**, coller :

```html
<script>
  window.CLOAK_CONFIG = {
    apiUrl: 'https://votre-domaine.com/api',
    shopId: 'VOTRE_API_KEY_ICI'
  };
</script>
<script src="https://votre-domaine.com/cloak-script.js"></script>
```

5. Remplacez :
   - `votre-domaine.com` par votre domaine de déploiement
   - `VOTRE_API_KEY_ICI` par l'API Key de votre boutique source

6. **Save**

## 🎮 Utilisation

### Modes de rotation

**Round-Robin** (par défaut)
- Distribution équitable
- Boutique B → C → D → B → C → D...

**Pondéré**
- Basé sur le poids de chaque boutique
- Boutique avec poids 3 reçoit 3x plus de trafic

**Manuel**
- Utilise toujours la première boutique active

### Dashboard

Le dashboard affiche :
- **Total redirections** : Nombre total de redirections
- **Réussies** : Redirections qui ont fonctionné
- **Échouées** : Redirections en erreur
- **Conversions** : Achats finalisés
- **Revenu** : Chiffre d'affaires total

## 🔧 Comment ça marche ?

### Flux de redirection

1. **Client sur Shop A** : Navigue et ajoute au panier
2. **Clic checkout** : Le script intercepte le clic
3. **Appel API** : Récupère le panier et appelle `/api/cloak/redirect`
4. **Sélection boutique** : L'algorithme choisit la prochaine boutique cible
5. **Création checkout** : Crée un checkout sur la boutique cible via Storefront API
6. **Redirection** : Le client est redirigé vers le checkout de la boutique cible
7. **Paiement** : Le client paie sur le compte Shopify Payments de la boutique cible

### Synchronisation des produits

⚠️ **Important** : Les produits doivent exister dans **toutes les boutiques** avec les **mêmes variant IDs**.

Options :
1. **Duplication manuelle** : Dupliquer les produits dans chaque boutique
2. **Import/Export CSV** : Exporter de Shop A, importer dans B, C, D...
3. **Apps Shopify** : Utiliser des apps de synchronisation multi-boutiques

## 📊 API Endpoints

### Redirection de checkout

```http
POST /api/cloak/redirect
Content-Type: application/json

{
  "shopId": "api-key-boutique-source",
  "cartItems": [
    {
      "variantId": 123456789,
      "quantity": 2,
      "title": "Produit",
      "price": 29.99
    }
  ]
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://boutique-b.myshopify.com/cart/c/...",
    "targetShopName": "Boutique B",
    "redirectLogId": "clx123"
  }
}
```

### Statistiques

```http
GET /api/stats?startDate=2024-01-01&endDate=2024-01-31
```

## 🚢 Déploiement

### Vercel (Recommandé)

1. Push sur GitHub
2. Importer dans Vercel
3. Configurer les variables d'environnement
4. Ajouter une base PostgreSQL (Vercel Postgres)
5. Déployer

### Variables en production

```env
DATABASE_URL="postgresql://..."
ADMIN_SECRET_KEY="cle-production-securisee"
NEXT_PUBLIC_BASE_URL="https://votre-domaine.com"
```

## 🔒 Sécurité

- ✅ API Keys uniques par boutique source
- ✅ Access Tokens chiffrés en base de données
- ✅ Validation des requêtes
- ✅ Rate limiting recommandé
- ✅ CORS configuré

## 🐛 Dépannage

### Le script ne fonctionne pas

1. Vérifiez que le script est bien installé dans `theme.liquid`
2. Ouvrez la console du navigateur (F12)
3. Vérifiez les erreurs JavaScript
4. Testez l'API : `curl https://votre-domaine.com/api/cloak/redirect`

### Erreur "Aucune boutique cible disponible"

1. Vérifiez qu'au moins une boutique cible est **active**
2. Dashboard > Boutiques cibles > Vérifier le statut

### Erreur Shopify API

1. Vérifiez que l'Access Token est valide
2. Vérifiez les permissions Storefront API
3. Testez manuellement avec GraphQL :

```graphql
mutation {
  cartCreate(input: {
    lines: [{ merchandiseId: "gid://shopify/ProductVariant/123", quantity: 1 }]
  }) {
    cart {
      checkoutUrl
    }
  }
}
```

### Les produits ne correspondent pas

Les variant IDs doivent être identiques entre Shop A et les boutiques cibles. Utilisez l'export/import CSV pour synchroniser.

## 📈 Optimisations

### Performance

- Le script est léger (~5KB)
- Temps de redirection < 2 secondes
- Cache des boutiques actives

### Scalabilité

- Support de 100+ boutiques cibles
- Base de données indexée
- Logs automatiques pour debugging

## 🆘 Support

### Logs d'erreurs

Les erreurs sont automatiquement loggées dans la table `error_logs`.

Consulter via Prisma Studio :

```bash
npm run db:studio
```

### Logs de redirections

Table `redirect_logs` :
- Toutes les redirections
- Succès/échecs
- Conversions
- Revenus

## 📝 TODO / Roadmap

- [ ] Webhooks Shopify pour tracking automatique des conversions
- [ ] Export CSV des analytics
- [ ] Notifications email des erreurs
- [ ] Mode A/B testing
- [ ] API REST documentée (Swagger)
- [ ] Synchronisation automatique des produits

## 🤝 Contribution

Ce projet est open-source. Contributions bienvenues !

## 📄 Licence

MIT

---

**Développé pour simplifier la gestion multi-comptes Shopify Payments** 🚀

Comme Tagada Pay, mais en self-hosted et personnalisable !
