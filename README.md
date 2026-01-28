# Shopify Checkout Rotator - SaaS Multi-Boutiques

Système intelligent de rotation de checkout pour gérer plusieurs boutiques Shopify avec un seul site vitrine.

## 🎯 Fonctionnalités

- **Rotation automatique** entre plusieurs boutiques Shopify
- **Trois modes de rotation** : Round-robin, Pondéré, Manuel
- **Dashboard admin** complet pour gérer les boutiques
- **Analytics en temps réel** : conversions, revenus, statistiques par boutique
- **Site vitrine** avec gestion de panier
- **Intégration Shopify Storefront API** pour création de checkout
- **Tracking des conversions** via webhooks Shopify
- **Gestion d'erreurs** avec logs persistants

## 🛠️ Stack Technique

- **Frontend** : Next.js 14 (App Router), React, TypeScript
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL avec Prisma ORM
- **État global** : Zustand
- **Styling** : TailwindCSS
- **API** : Shopify Storefront API (GraphQL)

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL 14+
- Compte(s) Shopify avec accès Storefront API
- npm ou yarn

## 🚀 Installation

### 1. Cloner et installer les dépendances

```bash
cd shopify-checkout-rotator
npm install
```

### 2. Configuration de la base de données

Créez une base de données PostgreSQL :

```sql
CREATE DATABASE shopify_rotator;
```

### 3. Variables d'environnement

Copiez le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Modifiez `.env` avec vos informations :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/shopify_rotator?schema=public"
ADMIN_SECRET_KEY="votre-cle-secrete-changez-moi"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Initialiser la base de données

```bash
npm run db:generate
npm run db:push
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📖 Configuration des boutiques Shopify

### Obtenir un Access Token Storefront API

1. Connectez-vous à votre admin Shopify
2. Allez dans **Settings > Apps and sales channels**
3. Cliquez sur **Develop apps**
4. Créez une nouvelle app ou sélectionnez une existante
5. Dans **Configuration**, activez **Storefront API**
6. Accordez les permissions nécessaires :
   - `unauthenticated_read_product_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
7. Copiez le **Storefront API access token**

### Ajouter une boutique via le dashboard

1. Accédez à `/admin`
2. Cliquez sur **"+ Ajouter une boutique"**
3. Remplissez les informations :
   - **Nom** : Nom d'affichage de la boutique
   - **Domaine Shopify** : `votreboutique.myshopify.com`
   - **Access Token** : Token Storefront API
   - **Poids** : Pour la rotation pondérée (1 par défaut)

## 🎮 Utilisation

### Site Vitrine

- **Page d'accueil** : `/`
- **Boutique** : `/shop` - Parcourir les produits
- **Panier** : `/cart` - Gérer le panier et passer commande

### Dashboard Admin

- **Administration** : `/admin`
- Gérer les boutiques (ajouter, activer/désactiver, supprimer)
- Choisir le mode de rotation
- Consulter les statistiques en temps réel

### Modes de Rotation

1. **Round-Robin** : Distribution équitable, une boutique après l'autre
2. **Pondéré** : Distribution basée sur le poids de chaque boutique
3. **Manuel** : Utilise toujours la première boutique active

## 🔌 API Endpoints

### Boutiques

- `GET /api/stores` - Liste toutes les boutiques
- `POST /api/stores` - Créer une nouvelle boutique
- `GET /api/stores/[id]` - Détails d'une boutique
- `PUT /api/stores/[id]` - Mettre à jour une boutique
- `DELETE /api/stores/[id]` - Supprimer une boutique

### Rotation

- `GET /api/rotation/next` - Obtenir la prochaine boutique
- `GET /api/rotation/mode` - Mode de rotation actuel
- `POST /api/rotation/mode` - Changer le mode de rotation
- `GET /api/rotation/stats` - Statistiques de rotation

### Checkout

- `POST /api/checkout/create` - Créer un checkout Shopify

### Webhooks

- `POST /api/webhooks/shopify` - Webhook pour les commandes Shopify

## 📊 Webhooks Shopify

Pour tracker les conversions, configurez un webhook dans chaque boutique :

1. Admin Shopify > **Settings > Notifications**
2. Créez un webhook **Order creation**
3. URL : `https://votre-domaine.com/api/webhooks/shopify`
4. Format : JSON

## 🗃️ Structure de la Base de Données

### Tables principales

- **stores** : Boutiques Shopify connectées
- **rotations** : État de la rotation
- **checkout_logs** : Historique des redirections
- **products** : Catalogue produits (optionnel)
- **error_logs** : Logs d'erreurs

## 🔒 Sécurité

- Access tokens stockés de manière sécurisée en base de données
- Variables d'environnement pour les secrets
- Validation des données côté serveur
- Protection CSRF sur les API routes

## 🚢 Déploiement

### Vercel (Recommandé)

1. Pushez votre code sur GitHub
2. Importez le projet dans Vercel
3. Configurez les variables d'environnement
4. Ajoutez une base PostgreSQL (Vercel Postgres ou externe)
5. Déployez !

### Variables d'environnement en production

```env
DATABASE_URL="postgresql://..."
ADMIN_SECRET_KEY="cle-secrete-production"
NEXT_PUBLIC_BASE_URL="https://votre-domaine.com"
```

## 📈 Monitoring

Les erreurs sont automatiquement loggées dans la table `error_logs`. Vous pouvez :

- Consulter les logs via Prisma Studio : `npm run db:studio`
- Implémenter des notifications email (voir `.env.example`)
- Intégrer un service comme Sentry

## 🧪 Tests

Pour tester le système :

1. Ajoutez au moins 2 boutiques dans le dashboard admin
2. Activez les deux boutiques
3. Sélectionnez le mode "Round-Robin"
4. Ajoutez des produits au panier sur `/shop`
5. Passez plusieurs commandes et vérifiez la rotation

## 🛠️ Scripts disponibles

```bash
npm run dev          # Lancer en développement
npm run build        # Build pour production
npm run start        # Lancer en production
npm run lint         # Linter le code
npm run db:generate  # Générer le client Prisma
npm run db:push      # Pousser le schéma vers la DB
npm run db:migrate   # Créer une migration
npm run db:studio    # Ouvrir Prisma Studio
```

## 🐛 Dépannage

### Erreur de connexion à la base de données

Vérifiez que :
- PostgreSQL est démarré
- La `DATABASE_URL` est correcte
- L'utilisateur a les permissions nécessaires

### Erreur Shopify API

Vérifiez que :
- L'Access Token est valide
- Les permissions Storefront API sont accordées
- Le domaine Shopify est correct (format: `boutique.myshopify.com`)

### Checkout ne se crée pas

Vérifiez que :
- Les `variantId` des produits sont au format GraphQL : `gid://shopify/ProductVariant/123`
- La boutique cible est active
- L'Access Token a les permissions `unauthenticated_write_checkouts`

## 📝 TODO / Améliorations futures

- [ ] Export des analytics en CSV
- [ ] Mode A/B testing
- [ ] Notifications email des erreurs
- [ ] API REST documentée avec Swagger
- [ ] Tests unitaires et d'intégration
- [ ] Synchronisation automatique des produits depuis Shopify
- [ ] Multi-devises
- [ ] Interface de personnalisation du thème

## 📄 Licence

MIT

## 👨‍💻 Support

Pour toute question ou problème, consultez la documentation Shopify :
- [Storefront API](https://shopify.dev/docs/api/storefront)
- [Webhooks](https://shopify.dev/docs/apps/webhooks)

---

Développé avec ❤️ pour simplifier la gestion multi-boutiques Shopify
