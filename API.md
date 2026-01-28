# Documentation API - Shopify Checkout Rotator

Cette documentation décrit tous les endpoints API disponibles dans l'application.

## Base URL

```
http://localhost:3000/api (développement)
https://votre-domaine.com/api (production)
```

## Format des réponses

Toutes les réponses suivent ce format :

```json
{
  "success": true,
  "data": { ... }
}
```

En cas d'erreur :

```json
{
  "success": false,
  "error": "Message d'erreur"
}
```

---

## 🏪 Boutiques (Stores)

### Lister toutes les boutiques

```http
GET /api/stores
```

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx123abc",
      "name": "Ma Boutique 1",
      "shopifyDomain": "boutique1.myshopify.com",
      "accessToken": "***",
      "isActive": true,
      "weight": 1,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Créer une boutique

```http
POST /api/stores
Content-Type: application/json
```

**Body :**

```json
{
  "name": "Ma Nouvelle Boutique",
  "shopifyDomain": "boutique.myshopify.com",
  "accessToken": "shpat_xxxxxxxxxxxxx",
  "weight": 1
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "clx456def",
    "name": "Ma Nouvelle Boutique",
    "shopifyDomain": "boutique.myshopify.com",
    "accessToken": "***",
    "isActive": true,
    "weight": 1,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Erreurs possibles :**
- `400` : Champs manquants
- `400` : Boutique déjà existante

### Obtenir une boutique

```http
GET /api/stores/:id
```

**Paramètres :**
- `id` : ID de la boutique

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "clx123abc",
    "name": "Ma Boutique",
    "shopifyDomain": "boutique.myshopify.com",
    "accessToken": "***",
    "isActive": true,
    "weight": 1,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Erreurs possibles :**
- `404` : Boutique introuvable

### Mettre à jour une boutique

```http
PUT /api/stores/:id
Content-Type: application/json
```

**Body (tous les champs sont optionnels) :**

```json
{
  "name": "Nouveau nom",
  "shopifyDomain": "nouveau-domaine.myshopify.com",
  "accessToken": "nouveau-token",
  "isActive": false,
  "weight": 2
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "clx123abc",
    "name": "Nouveau nom",
    "isActive": false,
    ...
  }
}
```

### Supprimer une boutique

```http
DELETE /api/stores/:id
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "message": "Boutique supprimée avec succès"
  }
}
```

---

## 🔄 Rotation

### Obtenir la prochaine boutique

```http
GET /api/rotation/next
```

Retourne la prochaine boutique selon l'algorithme de rotation configuré.

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "clx123abc",
    "name": "Ma Boutique 1",
    "shopifyDomain": "boutique1.myshopify.com"
  }
}
```

**Erreurs possibles :**
- `404` : Aucune boutique disponible

### Obtenir le mode de rotation

```http
GET /api/rotation/mode
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "mode": "round-robin"
  }
}
```

**Modes disponibles :**
- `round-robin` : Distribution équitable
- `weighted` : Distribution pondérée
- `manual` : Utilise toujours la première boutique

### Changer le mode de rotation

```http
POST /api/rotation/mode
Content-Type: application/json
```

**Body :**

```json
{
  "mode": "weighted"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "mode": "weighted"
  }
}
```

**Erreurs possibles :**
- `400` : Mode invalide

### Obtenir les statistiques

```http
GET /api/rotation/stats?startDate=2024-01-01&endDate=2024-01-31
```

**Paramètres (optionnels) :**
- `startDate` : Date de début (ISO 8601)
- `endDate` : Date de fin (ISO 8601)

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "storeName": "Ma Boutique 1",
      "totalRedirections": 150,
      "completedCheckouts": 45,
      "totalRevenue": 3450.50,
      "conversionRate": 30.0
    },
    {
      "storeName": "Ma Boutique 2",
      "totalRedirections": 148,
      "completedCheckouts": 52,
      "totalRevenue": 4120.75,
      "conversionRate": 35.14
    }
  ]
}
```

---

## 🛒 Checkout

### Créer un checkout

```http
POST /api/checkout/create
Content-Type: application/json
```

Crée un checkout dans une boutique Shopify sélectionnée par l'algorithme de rotation.

**Body :**

```json
{
  "cartItems": [
    {
      "variantId": "gid://shopify/ProductVariant/123456789",
      "quantity": 2,
      "title": "T-Shirt Premium",
      "price": 29.99,
      "image": "https://cdn.shopify.com/..."
    },
    {
      "variantId": "gid://shopify/ProductVariant/987654321",
      "quantity": 1,
      "title": "Jean Slim",
      "price": 79.99,
      "image": "https://cdn.shopify.com/..."
    }
  ]
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://boutique1.myshopify.com/cart/c/abc123...",
    "storeName": "Ma Boutique 1",
    "checkoutLogId": "clx789ghi"
  }
}
```

**Erreurs possibles :**
- `400` : Panier vide
- `503` : Aucune boutique disponible
- `500` : Erreur Shopify API

**Notes importantes :**
- Les `variantId` doivent être au format GraphQL : `gid://shopify/ProductVariant/[ID]`
- Le client doit être redirigé vers `checkoutUrl` après réception
- Un log est automatiquement créé pour le tracking

---

## 🔔 Webhooks

### Webhook Shopify

```http
POST /api/webhooks/shopify
Content-Type: application/json
X-Shopify-Topic: orders/create
```

Endpoint pour recevoir les webhooks Shopify. Configure ce webhook dans chaque boutique Shopify.

**Body (exemple) :**

```json
{
  "id": 123456789,
  "checkout_token": "abc123...",
  "total_price": "139.97",
  ...
}
```

**Réponse :**

```json
{
  "success": true
}
```

**Configuration dans Shopify :**
1. Admin Shopify → Settings → Notifications
2. Webhooks → Create webhook
3. Event : `Order creation`
4. Format : `JSON`
5. URL : `https://votre-domaine.com/api/webhooks/shopify`

---

## 🔐 Authentification

Actuellement, l'API n'a pas d'authentification. Pour la production, il est recommandé d'ajouter :

### Option 1 : API Key

Ajoutez un header à toutes les requêtes admin :

```http
X-API-Key: votre-cle-secrete
```

### Option 2 : JWT

Implémentez un système de tokens JWT pour les endpoints sensibles.

### Endpoints à protéger

- `POST /api/stores`
- `PUT /api/stores/:id`
- `DELETE /api/stores/:id`
- `POST /api/rotation/mode`

---

## 📊 Codes de statut HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 400 | Requête invalide |
| 404 | Ressource introuvable |
| 500 | Erreur serveur |
| 503 | Service indisponible |

---

## 🧪 Exemples avec cURL

### Créer une boutique

```bash
curl -X POST http://localhost:3000/api/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Store",
    "shopifyDomain": "test.myshopify.com",
    "accessToken": "shpat_xxxxx",
    "weight": 1
  }'
```

### Obtenir la prochaine boutique

```bash
curl http://localhost:3000/api/rotation/next
```

### Créer un checkout

```bash
curl -X POST http://localhost:3000/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [
      {
        "variantId": "gid://shopify/ProductVariant/123",
        "quantity": 1,
        "title": "Produit Test",
        "price": 29.99
      }
    ]
  }'
```

### Changer le mode de rotation

```bash
curl -X POST http://localhost:3000/api/rotation/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "weighted"}'
```

---

## 🐛 Gestion des erreurs

Toutes les erreurs sont loggées dans la table `error_logs` de la base de données.

### Consulter les logs d'erreurs

```bash
npx prisma studio
# Ouvrir la table error_logs
```

### Structure d'un log d'erreur

```typescript
{
  id: string
  type: string
  message: string
  stack?: string
  metadata?: any
  createdAt: Date
  resolved: boolean
}
```

---

## 📈 Limites et Quotas

### Recommandations

- **Rate limiting** : Implémenter une limite de 100 requêtes/minute par IP
- **Timeout** : Les requêtes Shopify ont un timeout de 30 secondes
- **Retry** : En cas d'erreur Shopify, réessayer jusqu'à 3 fois avec backoff exponentiel

### Limites Shopify Storefront API

- **Rate limit** : 2 requêtes/seconde par boutique
- **Burst** : Jusqu'à 60 requêtes en rafale

---

## 🔄 Webhooks Shopify - Sécurité

Pour sécuriser les webhooks en production, vérifiez la signature HMAC :

```typescript
import crypto from 'crypto'

function verifyWebhook(body: string, hmacHeader: string): boolean {
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(body, 'utf8')
    .digest('base64')
  
  return hash === hmacHeader
}
```

Utilisez dans l'endpoint :

```typescript
const hmac = request.headers.get('X-Shopify-Hmac-Sha256')
const isValid = verifyWebhook(rawBody, hmac)
```

---

## 📚 Ressources

- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Shopify Webhooks](https://shopify.dev/docs/apps/webhooks)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

Dernière mise à jour : Janvier 2024
